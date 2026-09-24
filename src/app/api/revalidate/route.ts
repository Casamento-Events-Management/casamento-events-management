import { parseBody } from 'next-sanity/webhook'
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { sendClientApprovalConfirmationEmail } from '@/lib/services/feedbackService'

/**
 * Sanity Webhook On-Demand Revalidation Route Handler.
 *
 * Listens for POST webhooks sent from Sanity Studio upon document publication or deletion.
 * Validates HMAC signature using process.env.SANITY_REVALIDATE_SECRET.
 * Purges Next.js Data Cache tags and Edge pages immediately.
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

    const { isValidSignature, body } = await parseBody<{
      _type?: string
      _id?: string
      status?: string
      email?: string
      name?: string
      eventType?: string
    }>(req, secret)

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
      case 'clientFeedback':
        revalidatePath('/articles')
        revalidateTag('clientFeedback', 'max')
        if (body.status === 'approved' && body.email) {
          console.log(`[api/revalidate] Feedback approved for ${body.email}. Sending confirmation email...`)
          await sendClientApprovalConfirmationEmail(
            body.email,
            body.name || 'Valued Client',
            body.eventType || 'Event'
          )
        }
        break
      case 'articleVlog':
      case 'articleVlogBanner':
      case 'articlesHero':
        revalidatePath('/articles')
        break
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
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[api/revalidate] Webhook execution error:', message)
    return NextResponse.json({ message: 'Internal Server Error', error: message }, { status: 500 })
  }
}
