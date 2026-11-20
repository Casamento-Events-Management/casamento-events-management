import { NextResponse } from 'next/server';
import { logAudit } from '@/lib/services/auditService';
import { getCurrentActiveAdmin } from '@/lib/services/adminProfileService';
import { client } from '@/sanity/lib/client';
import { revalidatePath } from 'next/cache';

export const runtime = 'nodejs';

/**
 * Domain API Route Handler for Articles & Editorial Vlog Auditing (`/api/articles`).
 *
 * Strictly requires an authenticated active admin operator session ('admin' or 'super_admin')
 * to prevent unauthenticated audit log forgery and cache-busting abuse.
 */
export async function POST(request: Request) {
  try {
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

    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null;
    const userAgent = request.headers.get('user-agent') || null;

    const body = await request.json();
    const action = body?.action || 'admin_article_lifecycle';

    switch (action) {
      case 'admin_article_lifecycle':
        return await handleAdminArticleLifecycle(body, adminData, ipAddress, userAgent);

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
  adminData: { user: { id: string; email: string }; profile: { full_name: string; user_code?: string | null } },
  ipAddress: string | null,
  userAgent: string | null
) {
  const documentId =
    (typeof body.documentId === 'string' && body.documentId.trim()) ||
    (typeof body._id === 'string' && body._id.trim()) ||
    '';
  let title = typeof body.title === 'string' ? body.title.trim().slice(0, 200) : '';
  const slug = typeof body.slug === 'string' ? body.slug.trim().slice(0, 200) : '';
  const mediaType = typeof body.mediaType === 'string' ? body.mediaType.trim().slice(0, 50) : '';

  if (!documentId || documentId.length > 200) {
    return NextResponse.json(
      { error: 'Missing or invalid documentId in lifecycle payload.' },
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
    actorUserId: adminData.user.id,
    actorType: 'admin',
    actorCode: adminData.profile.user_code || 'ADM-STU',
    actorName: adminData.profile.full_name || 'Sanity Studio Admin',
    actorEmail: adminData.user.email,
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
