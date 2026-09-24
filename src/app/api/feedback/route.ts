import { NextResponse } from 'next/server';
import { feedbackFormSchema } from '@/lib/schemas/feedback';
import { verifyRecaptchaToken } from '@/lib/services/recaptchaService';
import { sendAdminFeedbackNotificationEmail } from '@/lib/services/feedbackService';
import { client } from '@/sanity/lib/client';

export const runtime = 'nodejs';

/**
 * Domain API Route Handler for Client Feedbacks (`/api/feedback`).
 *
 * Consolidates feedback submission, anti-bot validation, Sanity CMS document mutation,
 * and multi-recipient email notifications into a single Vercel Serverless Function.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body?.action || 'feedback_submit';

    switch (action) {
      case 'feedback_submit':
        return await handleFeedbackSubmit(body);

      default:
        return NextResponse.json(
          { error: `Unsupported action "${action}"` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[API /api/feedback Error]:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred while processing feedback.' },
      { status: 500 }
    );
  }
}

/**
 * Action Handler: Client Feedback Submission
 */
async function handleFeedbackSubmit(body: Record<string, unknown>) {
  // 1. Validate input payload with Zod
  const validationResult = feedbackFormSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      {
        error: 'Invalid feedback input data',
        details: validationResult.error.flatten(),
      },
      { status: 400 }
    );
  }

  const formData = validationResult.data;

  // 2. Anti-bot reCAPTCHA v3 verification
  if (formData.recaptchaToken) {
    const recaptchaResult = await verifyRecaptchaToken(formData.recaptchaToken, 'feedback_submit');
    if (!recaptchaResult.success) {
      return NextResponse.json(
        { error: recaptchaResult.error || 'Anti-bot verification failed. Please try again.' },
        { status: 403 }
      );
    }
  }

  // 3. Create pending document in Sanity CMS
  const writeToken = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
  let createdDocumentId = `mock-doc-${Date.now()}`;

  if (writeToken) {
    try {
      const writeClient = client.withConfig({
        token: writeToken,
        useCdn: false,
      });

      const newDoc = await writeClient.create({
        _type: 'clientFeedback',
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        eventType: formData.eventType,
        rating: formData.rating,
        message: formData.message,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      });

      createdDocumentId = newDoc._id;
    } catch (sanityErr) {
      console.error('[API /api/feedback Sanity Write Error]:', sanityErr);
      return NextResponse.json(
        { error: 'Failed to record feedback in CMS. Please try again later.' },
        { status: 500 }
      );
    }
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[API /api/feedback] SANITY_WRITE_TOKEN not set. Mocking CMS creation for local dev.'
      );
    }
  }

  // 4. Dispatch Email Notification to Casamento Team Recipients
  await sendAdminFeedbackNotificationEmail(formData);

  return NextResponse.json({
    success: true,
    message:
      'Thank you! Your feedback has been submitted successfully and is pending review by the Casamento team.',
    documentId: createdDocumentId,
  });
}
