import { NextResponse } from 'next/server';
import { contactFormSchema } from '@/lib/schemas/contact';
import { verifyRecaptchaToken } from '@/lib/services/recaptchaService';
import { sendContactEmail } from '@/lib/services/emailService';

/**
 * Domain-consolidated API Route Handler for Communication & Messaging.
 *
 * Consolidates reCAPTCHA anti-bot verification and Resend email dispatches into a single
 * Vercel Serverless Function to maximize Vercel Hobby Free Tier quotas (12 function limit).
 *
 * Scalable Action Dispatcher:
 * Supports multiple domain actions via payload.action (e.g. 'contact_submit', 'newsletter_subscribe')
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body?.action || 'contact_submit';

    switch (action) {
      case 'contact_submit':
        return await handleContactSubmit(body);

      // Scalable extension hooks for future functions inside this communication domain
      case 'newsletter_subscribe':
        return NextResponse.json(
          { error: 'Newsletter subscription service coming soon.' },
          { status: 501 }
        );

      default:
        return NextResponse.json(
          { error: `Unsupported action "${action}"` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[API /api/contact Error]:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}

/**
 * Action Handler: Contact Form Submission
 */
async function handleContactSubmit(body: Record<string, unknown>) {
  // 1. Validate payload with Zod
  const validationResult = contactFormSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      {
        error: 'Invalid input data',
        details: validationResult.error.flatten(),
      },
      { status: 400 }
    );
  }

  const formData = validationResult.data;

  // 2. Anti-bot reCAPTCHA v3 verification
  if (formData.recaptchaToken) {
    const recaptchaResult = await verifyRecaptchaToken(formData.recaptchaToken, 'contact_submit');
    if (!recaptchaResult.success) {
      return NextResponse.json(
        { error: recaptchaResult.error || 'Anti-bot check failed. Please try again.' },
        { status: 403 }
      );
    }
  }

  // 3. Dispatch Email via Resend Service
  const emailResult = await sendContactEmail(formData);
  if (!emailResult.success) {
    return NextResponse.json(
      { error: emailResult.error || 'Failed to dispatch email inquiry.' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Thank you! Your message has been received. We will get back to you shortly.',
    id: emailResult.id,
  });
}
