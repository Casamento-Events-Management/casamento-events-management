import { NextResponse } from 'next/server';
import { logAudit } from '@/lib/services/auditService';
import { client } from '@/sanity/lib/client';
import { revalidatePath } from 'next/cache';

export const runtime = 'nodejs';

/**
 * Domain API Route Handler for Articles & Editorial Vlog Auditing (`/api/articles`).
 *
 * Captures lifecycle events triggered by Sanity Studio document actions or webhooks.
 */
export async function POST(request: Request) {
  try {
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null;
    const userAgent = request.headers.get('user-agent') || null;

    const body = await request.json();
    const action = body?.action || 'admin_article_lifecycle';

    switch (action) {
      case 'admin_article_lifecycle':
        return await handleAdminArticleLifecycle(body, ipAddress, userAgent);

      default:
        return NextResponse.json(
          { error: `Unsupported action "${action}"` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[API /api/articles Error]:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred while processing article.' },
      { status: 500 }
    );
  }
}

async function handleAdminArticleLifecycle(
  body: Record<string, unknown>,
  ipAddress: string | null,
  userAgent: string | null
) {
  const documentId = (body.documentId as string) || (body._id as string);
  let title = (body.title as string) || '';
  const slug = (body.slug as string) || '';
  const mediaType = (body.mediaType as string) || '';

  if (!documentId) {
    return NextResponse.json(
      { error: 'Missing documentId in lifecycle payload.' },
      { status: 400 }
    );
  }

  // If title is missing or generic, fetch from Sanity CMS directly
  if (!title || title === 'Untitled Article') {
    try {
      const cleanId = documentId.replace(/^drafts\./, '');
      const fetched = await client.fetch<{ title?: string }>(
        `*[_id in [$id, "drafts." + $id]] | order(_updatedAt desc)[0] { title }`,
        { id: cleanId }
      );
      if (fetched?.title) {
        title = fetched.title;
      }
    } catch (err) {
      console.warn('[API /api/articles] Could not resolve title from Sanity:', err);
    }
  }

  const finalTitle = title || 'Untitled Article';

  void logAudit({
    category: 'Article',
    action: 'Article Vlog Published',
    severity: 'Info',
    outcome: 'Success',
    summary: `Article Vlog "${finalTitle}" published in Sanity Studio`,
    actorType: 'admin',
    actorCode: 'ADM-STU',
    actorName: 'Sanity Studio Admin',
    entityType: 'articleVlog',
    entityId: documentId,
    entityRef: finalTitle || slug || documentId,
    metadata: {
      documentId,
      title: finalTitle,
      slug,
      mediaType,
    },
    ipAddress,
    userAgent,
  });

  // Revalidate public articles routes
  revalidatePath('/articles');
  revalidatePath('/articles/vlogs/page/[n]', 'page');
  revalidatePath('/');

  return NextResponse.json({
    success: true,
    action: 'Article Vlog Published',
    documentId,
    title: finalTitle,
  });
}
