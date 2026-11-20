import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { bookingApiRequestSchema } from '@/lib/schemas/booking';
import { verifyRecaptchaToken } from '@/lib/services/recaptchaService';
import {
  sendBookingPreviewEmail,
  confirmAndSaveBooking,
} from '@/lib/services/bookingDbService';
import { logAudit } from '@/lib/services/auditService';

const VERIFICATION_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getBookingSigningSecret(): string {
  const secret =
    process.env.BOOKING_TOKEN_SECRET ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SANITY_REVALIDATE_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === 'development') {
      return 'dev-only-booking-signing-fallback-key';
    }
    throw new Error('Server signing secret is not configured for booking verification.');
  }

  return secret;
}

/**
 * Creates a stateless HMAC-SHA256 signed verification token binding the
 * server-generated booking reference to the verified client email and expiry.
 */
function signBookingVerificationToken(bookingReference: string, email: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      ref: bookingReference,
      email: email.trim().toLowerCase(),
      exp: Date.now() + VERIFICATION_TTL_MS,
    })
  ).toString('base64url');

  const sig = crypto
    .createHmac('sha256', getBookingSigningSecret())
    .update(payload)
    .digest('base64url');

  return `${payload}.${sig}`;
}

/**
 * Verifies an HMAC-SHA256 signed booking verification token and ensures it matches
 * the submitted client email and has not expired.
 */
function verifyBookingVerificationToken(
  token: string | undefined,
  expectedEmail: string
): { valid: true; bookingReference: string } | { valid: false; error: string } {
  if (!token || !token.includes('.')) {
    return { valid: false, error: 'Missing email verification token. Please request a preview email first.' };
  }

  const [payloadB64, providedSig] = token.split('.');
  if (!payloadB64 || !providedSig) {
    return { valid: false, error: 'Malformed verification token.' };
  }

  try {
    const expectedSig = crypto
      .createHmac('sha256', getBookingSigningSecret())
      .update(payloadB64)
      .digest('base64url');

    const a = Buffer.from(providedSig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return { valid: false, error: 'Invalid verification token signature.' };
    }

    const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as {
      ref?: string;
      email?: string;
      exp?: number;
    };

    if (!decoded.ref || !decoded.email || typeof decoded.exp !== 'number') {
      return { valid: false, error: 'Incomplete verification token payload.' };
    }

    if (Date.now() > decoded.exp) {
      return { valid: false, error: 'Verification session expired. Please resend the preview email.' };
    }

    if (decoded.email !== expectedEmail.trim().toLowerCase()) {
      return { valid: false, error: 'Email address does not match the verified preview email.' };
    }

    return { valid: true, bookingReference: decoded.ref };
  } catch {
    return { valid: false, error: 'Failed to validate verification token.' };
  }
}

/**
 * API Route Handler for Booking Reservations:
 * - Validates all payloads strictly with Zod.
 * - Enforces unconditional Google reCAPTCHA v3 verification.
 * - Generates booking references strictly server-side and binds them via HMAC token.
 */
export async function POST(request: Request) {
  const ipAddress =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    null;
  const userAgent = request.headers.get('user-agent') || null;

  try {
    const rawBody = await request.json();
    const parsed = bookingApiRequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || 'Invalid booking request payload.',
        },
        { status: 400 }
      );
    }

    const { action, formData, verifiedEmail, verificationToken, recaptchaToken } = parsed.data;
    const expectedRecaptchaAction =
      action === 'send_preview_email' ? 'booking_preview' : 'booking_confirm';

    // Mandatory reCAPTCHA v3 check
    const recaptchaResult = await verifyRecaptchaToken(
      recaptchaToken || '',
      expectedRecaptchaAction
    );
    if (!recaptchaResult.success) {
      void logAudit({
        category: 'Security',
        action: 'Anti-Bot Security Blocked',
        severity: 'Warning',
        outcome: 'Blocked',
        summary: `Anti-bot check failed for booking ${action} from ${formData.clientEmail}`,
        actorType: 'client',
        actorCode: 'USR-BOT',
        actorName: formData.clientFullName,
        actorEmail: formData.clientEmail,
        entityRef: formData.clientEmail,
        metadata: { form: expectedRecaptchaAction, reason: recaptchaResult.error },
        ipAddress,
        userAgent,
      });

      return NextResponse.json(
        {
          success: false,
          error: recaptchaResult.error || 'Security verification failed. Please try again.',
        },
        { status: 403 }
      );
    }

    if (action === 'send_preview_email') {
      const emailToUse = (verifiedEmail || formData.clientEmail).trim().toLowerCase();
      // Always generate booking reference server-side (never accept untrusted client reference)
      const result = await sendBookingPreviewEmail({
        ...formData,
        clientEmail: emailToUse,
      });

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error || 'Failed to dispatch verification email.' },
          { status: 500 }
        );
      }

      const token = signBookingVerificationToken(result.bookingReference, emailToUse);

      return NextResponse.json({
        success: true,
        bookingReference: result.bookingReference,
        verificationToken: token,
      });
    }

    if (action === 'confirm_booking') {
      const emailToUse = (verifiedEmail || formData.clientEmail).trim().toLowerCase();
      const verified = verifyBookingVerificationToken(verificationToken, emailToUse);

      if (!verified.valid) {
        return NextResponse.json(
          { success: false, error: verified.error },
          { status: 400 }
        );
      }

      const result = await confirmAndSaveBooking(
        formData,
        emailToUse,
        verified.bookingReference
      );

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error || 'Failed to finalize booking.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        bookingReference: result.bookingReference,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unsupported booking action.' },
      { status: 400 }
    );
  } catch (err) {
    console.error('[API /api/booking Exception]:', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
