import { NextResponse } from 'next/server';
import { FILE_CONSTRAINTS, type UploadType } from '@/lib/schemas/feedback';
import { verifyRecaptchaToken } from '@/lib/services/recaptchaService';
import { client } from '@/sanity/lib/client';

export const runtime = 'nodejs';

/**
 * Domain API Route Handler for Client Feedback Asset Uploads (`/api/feedback/upload`).
 *
 * Accepts multipart/form-data containing an image file ('photo' or 'backgroundImage')
 * and streams it directly to the Sanity Asset API using the write token.
 * Keeps file upload payload processing separate from main form JSON submission.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const uploadType = (formData.get('uploadType') as UploadType) || 'photo';
    const recaptchaToken = (formData.get('recaptchaToken') as string) || '';
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided for upload.' },
        { status: 400 }
      );
    }

    if (!FILE_CONSTRAINTS[uploadType]) {
      return NextResponse.json(
        { error: `Invalid uploadType "${uploadType}". Must be "photo" or "backgroundImage".` },
        { status: 400 }
      );
    }

    const constraints = FILE_CONSTRAINTS[uploadType];

    // 1. File type check
    if (!constraints.accept.includes(file.type as typeof constraints.accept[number])) {
      return NextResponse.json(
        { error: `Invalid file format (${file.type}). Allowed formats: JPG, PNG, WebP.` },
        { status: 400 }
      );
    }

    // 2. File size check
    if (file.size > constraints.maxBytes) {
      const maxMb = constraints.maxBytes / (1024 * 1024);
      return NextResponse.json(
        { error: `File size exceeds maximum allowed limit of ${maxMb}MB.` },
        { status: 400 }
      );
    }

    // 3. Anti-bot reCAPTCHA v3 verification
    if (recaptchaToken) {
      const recaptchaResult = await verifyRecaptchaToken(recaptchaToken, 'feedback_submit');
      if (!recaptchaResult.success) {
        return NextResponse.json(
          { error: recaptchaResult.error || 'Anti-bot verification failed for file upload.' },
          { status: 403 }
        );
      }
    }

    // 4. Sanity Asset Upload
    const writeToken = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;

    if (writeToken) {
      const writeClient = client.withConfig({
        token: writeToken,
        useCdn: false,
      });

      const buffer = Buffer.from(await file.arrayBuffer());
      const assetDocument = await writeClient.assets.upload('image', buffer, {
        filename: file.name,
        contentType: file.type,
      });

      return NextResponse.json({
        success: true,
        assetRef: assetDocument._id,
        url: assetDocument.url,
      });
    }

    // Fallback for local development when write token is omitted
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[API /api/feedback/upload] SANITY_WRITE_TOKEN missing. Mocking asset upload for ${uploadType}.`
      );
      const mockRef = `image-mock-${Date.now()}-800x600-jpg`;
      return NextResponse.json({
        success: true,
        assetRef: mockRef,
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      });
    }

    return NextResponse.json(
      { error: 'Sanity write token configuration missing on server.' },
      { status: 500 }
    );
  } catch (error) {
    console.error('[API /api/feedback/upload Error]:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred during asset upload.' },
      { status: 500 }
    );
  }
}
