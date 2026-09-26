import { parseBody } from 'next-sanity/webhook'
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { buildFeedbackClientPostedEmail } from '@/lib/email'

interface SanityWebhookPayload {
  _type?: string
  _id?: string
  name?: string
  email?: string
  eventType?: string
  status?: string
}

/**
 * Sanity Webhook On-Demand Revalidation Route Handler.
 *
 * Listens for POST webhooks sent from Sanity Studio upon document publication or deletion.
 * Validates HMAC signature using process.env.SANITY_REVALIDATE_SECRET.
 * Purges Next.js Data Cache tags, revalidates Edge page routes, and dispatches approval confirmation emails.
 */
export async function POST(req: NextRequest) {
  try {
    const secret = process.env.SANITY_REVALIDATE_SECRET
    if (!secret) {
      console.warn('[api/revalidate] Missing environment variable: SANITY_REVALIDATE_SECRET')
      return NextResponse.json(
        { message: 'Missing SANITY_REVALIDATE_SECRET environment variable' },
        { status: 500 }
      )
    }

    const { isValidSignature, body } = await parseBody<SanityWebhookPayload>(
      req,
      secret
    )

    if (!isValidSignature) {
      console.warn('[api/revalidate] Invalid webhook signature received.')
      return NextResponse.json(
        { message: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    if (!body?._type) {
      return NextResponse.json(
        { message: 'Bad request: missing document _type in payload' },
        { status: 400 }
      )
    }

    const documentType = body._type
    console.log(`[api/revalidate] Processing revalidation for document type: "${documentType}" (id: "${body._id}")`)

    // Purge cached GROQ queries matching tag
    revalidateTag(documentType, 'max')

    // Selectively revalidate page routes for immediate Edge CDN update
    switch (documentType) {
      case 'homePage':
        revalidatePath('/')
        break
      case 'portfolioHero':
      case 'portfolioItem':
      case 'portfolioCategory':
        revalidatePath('/portfolio')
        revalidatePath('/portfolio/[category]', 'page')
        revalidatePath('/')
        break
      case 'servicesHero':
      case 'serviceItem':
      case 'serviceCategory':
        revalidatePath('/services')
        revalidatePath('/')
        break
      case 'articleVlogBanner':
      case 'articlesHero':
      case 'articleVlog':
        revalidatePath('/articles')
        revalidatePath('/articles/vlogs/page/[n]', 'page')
        revalidatePath('/')
        break
      case 'clientFeedback':
        revalidatePath('/articles')
        revalidatePath('/articles/feedback')
        revalidatePath('/articles/feedback/page/[n]', 'page')
        revalidatePath('/')

        // Send confirmation email to client if feedback is published with status === 'approved'
        if (body.status === 'approved' && body.email) {
          await sendClientApprovalEmail({
            email: body.email,
            name: body.name,
            eventType: body.eventType,
          })
        }
        break
      default:
        // For any unspecified document type, revalidate main landing routes
        revalidatePath('/')
        break
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      documentType,
      documentId: body._id,
      approvalEmailSent: body._type === 'clientFeedback' && body.status === 'approved' && Boolean(body.email),
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[api/revalidate] Webhook execution error:', message)
    return NextResponse.json({ message: 'Internal Server Error', error: message }, { status: 500 })
  }
}

/**
 * Sends a notification email to the client when their feedback is posted on the site.
 */
async function sendClientApprovalEmail(payload: {
  email: string
  name?: string
  eventType?: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!payload.email) return

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[api/revalidate] RESEND_API_KEY not configured. Mocking client posted email to ${payload.email}`
      )
    }
    return
  }

  try {
    const { subject, html } = buildFeedbackClientPostedEmail(payload)

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
    })

    if (!res.ok) {
      const errData = await res.json()
      console.error('[api/revalidate Client Approval Email Error]:', errData)
      return
    }

    console.log(`[api/revalidate] Client feedback posted notification email sent to ${payload.email}`)
  } catch (err) {
    console.error('[api/revalidate Client Approval Email Exception]:', err)
  }
}
