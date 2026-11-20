import { NextResponse } from 'next/server';
import { feedbackFormSchema } from '@/lib/schemas/feedback';
import { verifyRecaptchaToken } from '@/lib/services/recaptchaService';
import { sendAdminFeedbackNotificationEmail } from '@/lib/services/feedbackService';
import { getCurrentActiveAdmin } from '@/lib/services/adminProfileService';
import { createAdminClient } from '@/lib/supabase/admin';
import { client } from '@/sanity/lib/client';
import { logAudit } from '@/lib/services/auditService';

export const runtime = 'nodejs';

/**
 * Domain API Route Handler for Client Feedbacks (`/api/feedback`).
 *
 * Consolidates feedback submission, anti-bot validation, Sanity CMS document mutation,
 * and multi-recipient email notifications into a single Vercel Serverless Function.
 */
export async function POST(request: Request) {
  try {
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null;
    const userAgent = request.headers.get('user-agent') || null;

    const body = await request.json();
    const action = body?.action || 'feedback_submit';

    switch (action) {
      case 'feedback_submit':
        return await handleFeedbackSubmit(body, ipAddress, userAgent);

      case 'admin_feedback_lifecycle':
        return await handleAdminFeedbackLifecycle(body, ipAddress, userAgent);

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
async function handleFeedbackSubmit(
  body: Record<string, unknown>,
  ipAddress: string | null,
  userAgent: string | null
) {
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

  // 2. Anti-bot reCAPTCHA v3 verification (unconditional)
  const recaptchaResult = await verifyRecaptchaToken(
    formData.recaptchaToken || '',
    'feedback_submit'
  );
  if (!recaptchaResult.success) {
    void logAudit({
      category: 'Security',
      action: 'Anti-Bot Security Blocked',
      severity: 'Warning',
      outcome: 'Blocked',
      summary: `Anti-bot check failed for feedback submission from ${formData.email || 'unknown'}`,
      actorType: 'client',
      actorCode: 'USR-BOT',
      actorName: formData.name,
      actorEmail: formData.email,
      entityRef: formData.email,
      metadata: { form: 'feedback_submit', reason: recaptchaResult.error },
      ipAddress,
      userAgent,
    });

    return NextResponse.json(
      { error: recaptchaResult.error || 'Anti-bot verification failed. Please try again.' },
      { status: 403 }
    );
  }

  // 3. Create pending document in Sanity CMS (WITHOUT private client PII email/phone)
  // Private contact fields are isolated in RLS-protected Supabase `public.client_feedback_contacts`.
  const writeToken = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
  let createdDocumentId = `doc-${Date.now()}`;

  if (writeToken) {
    try {
      const writeClient = client.withConfig({
        token: writeToken,
        useCdn: false,
      });

      const newDoc = await writeClient.create({
        _type: 'clientFeedback',
        name: formData.name,
        eventType: formData.eventType,
        rating: formData.rating,
        message: formData.message,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        ...(formData.photoRef && {
          photo: {
            _type: 'image',
            asset: { _type: 'reference', _ref: formData.photoRef },
            alt: `${formData.name}'s profile photo`,
          },
        }),
        ...(formData.backgroundImageRef && {
          backgroundImage: {
            _type: 'image',
            asset: { _type: 'reference', _ref: formData.backgroundImageRef },
            alt: `${formData.name}'s feedback card background`,
          },
        }),
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

  // Persist private client contact details (email, phone) in RLS-protected Supabase table
  try {
    const supabaseAdmin = createAdminClient();
    const { error: contactErr } = await supabaseAdmin
      .from('client_feedback_contacts')
      .upsert(
        {
          sanity_document_id: createdDocumentId,
          client_name: formData.name,
          client_email: formData.email.trim().toLowerCase(),
          client_phone: formData.phone?.trim() || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'sanity_document_id' }
      );
    if (contactErr) {
      console.warn('[API /api/feedback] Private contact storage notice:', contactErr.message);
    }
  } catch (contactEx) {
    console.warn('[API /api/feedback] Private contact storage skipped:', contactEx);
  }

  // 4. Log successful feedback submission audit trail event
  void logAudit({
    category: 'Feedback',
    action: 'Client Feedback Submission',
    severity: 'Info',
    outcome: 'Success',
    summary: `Client feedback submitted by ${formData.name} (${formData.rating}★, ${formData.eventType})`,
    actorType: 'client',
    actorCode: 'USR-CLI',
    actorName: formData.name,
    actorEmail: formData.email,
    entityType: 'clientFeedback',
    entityId: createdDocumentId,
    entityRef: formData.email,
    metadata: {
      sanityDocumentId: createdDocumentId,
      rating: formData.rating,
      eventType: formData.eventType,
      hasPhoto: Boolean(formData.photoRef),
      hasBackground: Boolean(formData.backgroundImageRef),
      messageLength: formData.message.length,
    },
    ipAddress,
    userAgent,
  });

  // 5. Dispatch Email Notification to Casamento Team Recipients
  const emailRes = await sendAdminFeedbackNotificationEmail(formData);

  void logAudit({
    category: 'Feedback',
    action: emailRes.success ? 'Feedback Email Notification' : 'Feedback Notification Failed',
    severity: emailRes.success ? 'Info' : 'Warning',
    outcome: emailRes.success ? 'Success' : 'Failure',
    summary: emailRes.success
      ? `Admin team alert email dispatched for new feedback from ${formData.name}`
      : `Failed to dispatch admin feedback alert email for ${formData.name}`,
    actorType: 'system',
    actorCode: 'SYS-NOTIF',
    actorName: 'Feedback Notification Dispatcher',
    entityType: 'clientFeedback',
    entityId: createdDocumentId,
    entityRef: formData.email,
    metadata: { error: emailRes.error, sanityDocumentId: createdDocumentId },
    ipAddress,
    userAgent,
  });

  return NextResponse.json({
    success: true,
    message:
      'Thank you! Your feedback has been submitted successfully and is pending review by the Casamento team.',
    documentId: createdDocumentId,
  });
}


/**
 * Action Handler: Admin Feedback Lifecycle Auditing (Approved / Rejected / Pending)
 * Strictly requires an authenticated active admin operator session ('admin' or 'super_admin').
 */
async function handleAdminFeedbackLifecycle(
  body: Record<string, unknown>,
  ipAddress: string | null,
  userAgent: string | null
) {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) {
    return NextResponse.json(
      { error: 'Unauthorized: Active administrative session required.' },
      { status: 401 }
    );
  }
  if (adminData.profile.role === 'staff') {
    return NextResponse.json(
      { error: 'Forbidden: Operator permissions required.' },
      { status: 403 }
    );
  }

  const documentId =
    (typeof body.documentId === 'string' && body.documentId.trim()) ||
    (typeof body._id === 'string' && body._id.trim()) ||
    '';
  const status = (typeof body.status === 'string' ? body.status : 'pending').toLowerCase();
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : 'Client';
  const email = typeof body.email === 'string' ? body.email.trim().slice(0, 150) : '';
  const eventType = typeof body.eventType === 'string' ? body.eventType.trim().slice(0, 100) : '';

  if (!documentId || documentId.length > 200) {
    return NextResponse.json(
      { error: 'Missing or invalid documentId in lifecycle payload.' },
      { status: 400 }
    );
  }

  let actionName = 'Feedback Updated';
  let severity: 'Info' | 'Warning' = 'Info';
  let summaryText = `Feedback updated to ${status} for ${name} (${email || 'No email'})`;

  if (status === 'approved') {
    actionName = 'Feedback Approved';
    severity = 'Info';
    summaryText = `Feedback approved in Sanity Studio for ${name} (${email || 'No email'})`;
  } else if (status === 'rejected') {
    actionName = 'Feedback Rejected';
    severity = 'Warning';
    summaryText = `Feedback rejected in Sanity Studio for ${name} (${email || 'No email'})`;
  } else if (status === 'pending') {
    actionName = 'Feedback Pending';
    severity = 'Info';
    summaryText = `Feedback set to pending review in Sanity Studio for ${name} (${email || 'No email'})`;
  }

  void logAudit({
    category: 'Feedback',
    action: actionName,
    severity,
    outcome: 'Success',
    summary: summaryText,
    actorUserId: adminData.user.id,
    actorType: 'admin',
    actorCode: adminData.profile.user_code || 'ADM-STU',
    actorName: adminData.profile.full_name || 'Sanity Studio Admin',
    actorEmail: adminData.user.email,
    entityType: 'clientFeedback',
    entityId: documentId,
    entityRef: email || documentId,
    metadata: {
      documentId,
      status,
      name,
      email,
      eventType,
    },
    ipAddress,
    userAgent,
  });

  return NextResponse.json({
    success: true,
    action: actionName,
    documentId,
    status,
  });
}
