import { client } from '@/sanity/lib/client';
import { parseBody } from 'next-sanity/webhook';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { buildFeedbackClientPostedEmail } from '@/lib/email';
import { logAudit } from '@/lib/services/auditService';

interface SanityWebhookPayload {
  _type?: string;
  _id?: string;
  name?: string;
  email?: string;
  eventType?: string;
  status?: string;
}

/**
 * Sanity Webhook On-Demand Revalidation Route Handler.
 *
 * Listens for POST webhooks sent from Sanity Studio upon document publication or deletion.
 * Validates HMAC signature using process.env.SANITY_REVALIDATE_SECRET.
 * Purges Next.js Data Cache tags, revalidates Edge page routes, and dispatches approval confirmation emails.
 */
export async function POST(req: NextRequest) {
  const ipAddress =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    null;
  const userAgent = req.headers.get('user-agent') || null;

  try {
    const secret = process.env.SANITY_REVALIDATE_SECRET;
    if (!secret) {
      console.warn('[api/revalidate] Missing environment variable: SANITY_REVALIDATE_SECRET');
      return NextResponse.json(
        { message: 'Missing SANITY_REVALIDATE_SECRET environment variable' },
        { status: 500 }
      );
    }

    const { isValidSignature, body } = await parseBody<SanityWebhookPayload>(
      req,
      secret
    );

    if (!isValidSignature) {
      console.warn('[api/revalidate] Invalid webhook signature received.');
      void logAudit({
        category: 'Security',
        action: 'Invalid Webhook Signature',
        severity: 'Warning',
        outcome: 'Blocked',
        summary: 'Invalid webhook HMAC signature received on /api/revalidate',
        actorType: 'webhook',
        actorCode: 'WHK-SEC',
        actorName: 'External Webhook',
        metadata: { path: '/api/revalidate' },
        ipAddress,
        userAgent,
      });

      return NextResponse.json(
        { message: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    if (!body?._type) {
      return NextResponse.json(
        { message: 'Bad request: missing document _type in payload' },
        { status: 400 }
      );
    }

    const documentType = body._type;
    console.log(`[api/revalidate] Processing revalidation for document type: "${documentType}" (id: "${body._id}")`);

    // Purge cached GROQ queries matching tag
    revalidateTag(documentType, 'max');

    // Selectively revalidate page routes for immediate Edge CDN update
    switch (documentType) {
      case 'homePage':
      case 'homeHero':
      case 'featuredTeaser':
        revalidatePath('/');
        break;
      case 'contactSection':
        revalidatePath('/');
        revalidatePath('/portfolio');
        revalidatePath('/services');
        revalidatePath('/articles');
        revalidatePath('/book-now');
        break;
      case 'portfolioHero':
      case 'portfolioUpcomingEvents':
      case 'portfolioItem':
      case 'portfolioCategory':
        revalidatePath('/portfolio');
        revalidatePath('/portfolio/[category]', 'page');
        revalidatePath('/');
        break;
      case 'servicesHero':
      case 'serviceItem':
      case 'serviceCategory':
        revalidatePath('/services');
        revalidatePath('/');
        break;
      case 'bookingHero':
        revalidatePath('/book-now');
        break;
      case 'articleVlogBanner':
      case 'articlesHero':
        revalidatePath('/articles');
        revalidatePath('/articles/vlogs/page/[n]', 'page');
        revalidatePath('/');
        break;
      case 'articleVlog':
        revalidatePath('/articles');
        revalidatePath('/articles/vlogs/page/[n]', 'page');
        revalidatePath('/');

        let articleTitle = body.name || (body as { title?: string }).title || '';
        if (!articleTitle && body._id) {
          try {
            const cleanId = body._id.replace(/^drafts\./, '');
            const fetched = await client.fetch<{ title?: string }>(
              `*[_id in [$id, "drafts." + $id]] | order(_updatedAt desc)[0] { title }`,
              { id: cleanId }
            );
            if (fetched?.title) {
              articleTitle = fetched.title;
            }
          } catch (err) {
            console.warn('[api/revalidate] Could not resolve article title:', err);
          }
        }

        const vlogTitle = articleTitle || 'Untitled Article';

        // Audit Trail: Track Article Vlog lifecycle (create/update/publish)
        void logAudit({
          category: 'Article',
          action: 'Article Vlog Published',
          severity: 'Info',
          outcome: 'Success',
          summary: `Article Vlog "${vlogTitle}" published in Sanity Studio`,
          actorType: 'webhook',
          actorCode: 'SAN-CMS',
          actorName: 'Sanity Studio Webhook',
          entityType: 'articleVlog',
          entityId: body._id,
          entityRef: vlogTitle || body._id,
          metadata: {
            documentType,
            documentId: body._id,
            title: vlogTitle,
            revalidatedPaths: ['/articles', '/articles/vlogs/page/[n]', '/'],
          },
          ipAddress,
          userAgent,
        });
        break;
      case 'clientFeedback':
        revalidatePath('/articles');
        revalidatePath('/articles/feedback');
        revalidatePath('/articles/feedback/page/[n]', 'page');
        revalidatePath('/');

        // If Sanity webhook payload omitted projected fields, fetch current document from Sanity
        let currentStatus = body.status;
        let clientName = body.name;
        let clientEmail = body.email;
        let eventType = body.eventType;

        if (!currentStatus && body._id) {
          try {
            const cleanId = body._id.replace(/^drafts\./, '');
            const fetchedDoc = await client.fetch<{
              status?: string;
              name?: string;
              email?: string;
              eventType?: string;
            }>(
              `*[_id in [$id, "drafts." + $id]] | order(_updatedAt desc)[0] { status, name, email, eventType }`,
              { id: cleanId }
            );
            if (fetchedDoc) {
              currentStatus = fetchedDoc.status || currentStatus;
              clientName = fetchedDoc.name || clientName;
              clientEmail = fetchedDoc.email || clientEmail;
              eventType = fetchedDoc.eventType || eventType;
            }
          } catch (fetchErr) {
            console.error('[api/revalidate] Failed to resolve Sanity document status:', fetchErr);
          }
        }

        // Audit Trail & Lifecycle dispatch based on resolved status
        if (currentStatus === 'approved') {
          void logAudit({
            category: 'Feedback',
            action: 'Feedback Approved',
            severity: 'Info',
            outcome: 'Success',
            summary: `Feedback approved in Sanity Studio for ${body.name || 'Client'} (${body.email || 'No email'})`,
            actorType: 'webhook',
            actorCode: 'SAN-CMS',
            actorName: 'Sanity Studio Webhook',
            entityType: 'clientFeedback',
            entityId: body._id,
            entityRef: body.email,
            metadata: {
              documentId: body._id,
              name: body.name,
              email: body.email,
              eventType: body.eventType,
              status: body.status,
            },
            ipAddress,
            userAgent,
          });

          // Send confirmation email to client if feedback is published with status === 'approved'
          if (body.email) {
            await sendClientApprovalEmail({
              email: body.email,
              name: body.name,
              eventType: body.eventType,
              documentId: body._id,
              ipAddress,
              userAgent,
            });
          }
        } else if (currentStatus === 'rejected') {
          void logAudit({
            category: 'Feedback',
            action: 'Feedback Rejected',
            severity: 'Warning',
            outcome: 'Success',
            summary: `Feedback rejected/archived in Sanity Studio for ${body.name || 'Client'} (ID: ${body._id})`,
            actorType: 'webhook',
            actorCode: 'SAN-CMS',
            actorName: 'Sanity Studio Webhook',
            entityType: 'clientFeedback',
            entityId: body._id,
            entityRef: body.email,
            metadata: { documentId: body._id, status: body.status },
            ipAddress,
            userAgent,
          });
        } else if (currentStatus === 'pending') {
          void logAudit({
            category: 'Feedback',
            action: 'Feedback Pending',
            severity: 'Info',
            outcome: 'Success',
            summary: `Feedback updated to pending in Sanity Studio for ${body.name || 'Client'} (ID: ${body._id})`,
            actorType: 'webhook',
            actorCode: 'SAN-CMS',
            actorName: 'Sanity Studio Webhook',
            entityType: 'clientFeedback',
            entityId: body._id,
            entityRef: body.email,
            metadata: { documentId: body._id, status: body.status },
            ipAddress,
            userAgent,
          });
        }
        break;
      default:
        // For any unspecified document type, revalidate main landing routes
        revalidatePath('/');
        break;
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      documentType,
      documentId: body._id,
      approvalEmailSent: body._type === 'clientFeedback' && body.status === 'approved' && Boolean(body.email),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[api/revalidate] Webhook execution error:', message);
    return NextResponse.json({ message: 'Internal Server Error', error: message }, { status: 500 });
  }
}

/**
 * Sends a notification email to the client when their feedback is posted on the site.
 */
async function sendClientApprovalEmail(payload: {
  email: string;
  name?: string;
  eventType?: string;
  documentId?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!payload.email) return;

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[api/revalidate] RESEND_API_KEY not configured. Mocking client posted email to ${payload.email}`
      );
    }
    void logAudit({
      category: 'Feedback',
      action: 'Feedback Approval Email',
      severity: 'Info',
      outcome: 'Success',
      summary: `[Mock] Feedback approval confirmation email dispatched to ${payload.email}`,
      actorType: 'system',
      actorCode: 'SYS-NOTIF',
      actorName: 'Client Feedback Dispatcher',
      entityType: 'clientFeedback',
      entityId: payload.documentId,
      entityRef: payload.email,
      metadata: { mock: true, clientName: payload.name },
      ipAddress: payload.ipAddress,
      userAgent: payload.userAgent,
    });
    return;
  }

  try {
    const { subject, html } = buildFeedbackClientPostedEmail(payload);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `Casamento Events <${process.env.CONTACT_EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: [payload.email],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      console.error('[api/revalidate Client Approval Email Error]:', errData);
      void logAudit({
        category: 'Feedback',
        action: 'Feedback Approval Email Failed',
        severity: 'Warning',
        outcome: 'Failure',
        summary: `Failed to dispatch feedback approval email to ${payload.email}`,
        actorType: 'system',
        actorCode: 'SYS-NOTIF',
        actorName: 'Client Feedback Dispatcher',
        entityType: 'clientFeedback',
        entityId: payload.documentId,
        entityRef: payload.email,
        metadata: { error: errData.message },
        ipAddress: payload.ipAddress,
        userAgent: payload.userAgent,
      });
      return;
    }

    console.log(`[api/revalidate] Client feedback posted notification email sent to ${payload.email}`);
    void logAudit({
      category: 'Feedback',
      action: 'Feedback Approval Email',
      severity: 'Info',
      outcome: 'Success',
      summary: `Feedback approval confirmation email dispatched to client ${payload.name || ''} (${payload.email})`,
      actorType: 'system',
      actorCode: 'SYS-NOTIF',
      actorName: 'Client Feedback Dispatcher',
      entityType: 'clientFeedback',
      entityId: payload.documentId,
      entityRef: payload.email,
      metadata: { clientName: payload.name, eventType: payload.eventType },
      ipAddress: payload.ipAddress,
      userAgent: payload.userAgent,
    });
  } catch (err) {
    console.error('[api/revalidate Client Approval Email Exception]:', err);
    void logAudit({
      category: 'Feedback',
      action: 'Feedback Approval Email Failed',
      severity: 'Warning',
      outcome: 'Failure',
      summary: `Exception dispatching feedback approval email to ${payload.email}`,
      actorType: 'system',
      actorCode: 'SYS-NOTIF',
      actorName: 'Client Feedback Dispatcher',
      entityType: 'clientFeedback',
      entityId: payload.documentId,
      entityRef: payload.email,
      metadata: { error: String(err) },
      ipAddress: payload.ipAddress,
      userAgent: payload.userAgent,
    });
  }
}
