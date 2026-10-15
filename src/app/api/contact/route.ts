import { NextResponse } from 'next/server';
import { contactFormSchema } from '@/lib/schemas/contact';
import { serviceInquirySchema } from '@/lib/schemas/serviceInquiry';
import { verifyRecaptchaToken } from '@/lib/services/recaptchaService';
import { sendContactEmail, sendServiceInquiryEmail } from '@/lib/services/emailService';
import { logAudit } from '@/lib/services/auditService';

/**
 * Domain-consolidated API Route Handler for Communication & Messaging.
 *
 * Consolidates reCAPTCHA anti-bot verification and Resend email dispatches into a single
 * Vercel Serverless Function to maximize Vercel Hobby Free Tier quotas (12 function limit).
 *
 * Scalable Action Dispatcher:
 * Supports multiple domain actions via payload.action ('contact_submit', 'service_inquiry', 'newsletter_subscribe')
 */
export async function POST(request: Request) {
  try {
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null;
    const userAgent = request.headers.get('user-agent') || null;

    const body = await request.json();
    const action = body?.action || 'contact_submit';

    switch (action) {
      case 'contact_submit':
        return await handleContactSubmit(body, ipAddress, userAgent);

      case 'service_inquiry':
        return await handleServiceInquirySubmit(body, ipAddress, userAgent);

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
async function handleContactSubmit(
  body: Record<string, unknown>,
  ipAddress: string | null,
  userAgent: string | null
) {
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
      void logAudit({
        category: 'Security',
        action: 'Anti-Bot Security Blocked',
        severity: 'Warning',
        outcome: 'Blocked',
        summary: `Anti-bot reCAPTCHA check failed for contact submission from ${formData.email || 'unknown'}`,
        actorType: 'client',
        actorCode: 'USR-BOT',
        actorName: formData.name || 'Anonymous User',
        actorEmail: formData.email || null,
        entityRef: formData.email,
        metadata: { form: 'contact_submit', reason: recaptchaResult.error },
        ipAddress,
        userAgent,
      });

      return NextResponse.json(
        { error: recaptchaResult.error || 'Anti-bot check failed. Please try again.' },
        { status: 403 }
      );
    }
  }

  // 3. Dispatch Email via Resend Service
  const emailResult = await sendContactEmail(formData);
  if (!emailResult.success) {
    void logAudit({
      category: 'System',
      action: 'Contact Inquiry Email Failed',
      severity: 'Warning',
      outcome: 'Failure',
      summary: `Failed to dispatch contact inquiry email from ${formData.name} (${formData.email})`,
      actorType: 'client',
      actorCode: 'USR-CLI',
      actorName: formData.name,
      actorEmail: formData.email,
      entityType: 'contact_inquiry',
      entityRef: formData.email,
      metadata: { error: emailResult.error },
      ipAddress,
      userAgent,
    });

    return NextResponse.json(
      { error: emailResult.error || 'Failed to dispatch email inquiry.' },
      { status: 500 }
    );
  }

  // 4. Log successful audit trail event
  void logAudit({
    category: 'System',
    action: 'Contact Form Submission',
    severity: 'Info',
    outcome: 'Success',
    summary: `Contact inquiry email dispatched from ${formData.name} (${formData.email})`,
    actorType: 'client',
    actorCode: 'USR-CLI',
    actorName: formData.name,
    actorEmail: formData.email,
    entityType: 'contact_inquiry',
    entityRef: formData.email,
    metadata: {
      emailId: emailResult.id,
      messageLength: formData.message?.length || 0,
    },
    ipAddress,
    userAgent,
  });

  return NextResponse.json({
    success: true,
    message: 'Thank you! Your message has been received. We will get back to you shortly.',
    id: emailResult.id,
  });
}

/**
 * Action Handler: Service Card Message Inquiry Submission
 */
async function handleServiceInquirySubmit(
  body: Record<string, unknown>,
  ipAddress: string | null,
  userAgent: string | null
) {
  // 1. Validate payload with Zod
  const validationResult = serviceInquirySchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      {
        error: 'Invalid inquiry form data',
        details: validationResult.error.flatten(),
      },
      { status: 400 }
    );
  }

  const formData = validationResult.data;

  // 2. Anti-bot reCAPTCHA v3 verification
  if (formData.recaptchaToken) {
    const recaptchaResult = await verifyRecaptchaToken(formData.recaptchaToken, 'service_inquiry');
    if (!recaptchaResult.success) {
      void logAudit({
        category: 'Security',
        action: 'Anti-Bot Security Blocked',
        severity: 'Warning',
        outcome: 'Blocked',
        summary: `Anti-bot check failed for service inquiry on ${formData.serviceTitle} from ${formData.clientEmail}`,
        actorType: 'client',
        actorCode: 'USR-BOT',
        actorName: formData.clientName,
        actorEmail: formData.clientEmail,
        entityRef: formData.serviceTitle,
        metadata: { form: 'service_inquiry', reason: recaptchaResult.error },
        ipAddress,
        userAgent,
      });

      return NextResponse.json(
        { error: recaptchaResult.error || 'Anti-bot check failed. Please try again.' },
        { status: 403 }
      );
    }
  }

  // 3. Dispatch Service Inquiry Email via Resend Service
  const emailResult = await sendServiceInquiryEmail(formData);
  if (!emailResult.success) {
    void logAudit({
      category: 'Booking',
      action: 'Service Inquiry Email Failed',
      severity: 'Warning',
      outcome: 'Failure',
      summary: `Failed to dispatch service inquiry email for ${formData.serviceTitle} (${formData.clientName})`,
      actorType: 'client',
      actorCode: 'USR-CLI',
      actorName: formData.clientName,
      actorEmail: formData.clientEmail,
      entityType: 'service_inquiry',
      entityRef: formData.serviceTitle,
      metadata: { error: emailResult.error },
      ipAddress,
      userAgent,
    });

    return NextResponse.json(
      { error: emailResult.error || 'Failed to dispatch service inquiry email.' },
      { status: 500 }
    );
  }

  // 4. Log successful audit trail event
  void logAudit({
    category: 'Booking',
    action: 'Service Inquiry',
    severity: 'Info',
    outcome: 'Success',
    summary: `Service inquiry email dispatched for ${formData.serviceTitle} (${formData.clientName} - ${formData.clientEmail})`,
    actorType: 'client',
    actorCode: 'USR-CLI',
    actorName: formData.clientName,
    actorEmail: formData.clientEmail,
    entityType: 'service_inquiry',
    entityRef: formData.serviceTitle,
    metadata: {
      serviceTitle: formData.serviceTitle,
      serviceSlug: formData.serviceSlug,
      categoryTitle: formData.categoryTitle,
      serviceType: formData.serviceType || 'N/A',
      clientPhone: formData.clientPhone || 'N/A',
      emailId: emailResult.id,
      messageLength: formData.message?.length || 0,
    },
    ipAddress,
    userAgent,
  });

  return NextResponse.json({
    success: true,
    message: 'Thanks for your inquiry. Our team will reply back shortly!',
    id: emailResult.id,
  });
}
