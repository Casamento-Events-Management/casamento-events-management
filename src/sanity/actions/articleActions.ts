import type { DocumentActionComponent, DocumentActionProps } from 'sanity';

/**
 * Custom Sanity Document Action for Article Vlog (`articleVlog`).
 *
 * Wraps the default publish action to immediately notify Next.js `/api/articles`
 * whenever an article is published or created in `/studio`, ensuring real-time
 * Audit Trail tracking in both local development and production.
 */
export function createArticlePublishAction(
  originalPublishAction: DocumentActionComponent
): DocumentActionComponent {
  return function ArticlePublishAction(props: DocumentActionProps) {
    const originalResult = originalPublishAction(props);

    if (!originalResult) {
      return null;
    }

    return {
      ...originalResult,
      label: originalResult.label || 'Publish',
      onHandle: async () => {
        // Execute original Sanity publish operation
        if (originalResult.onHandle) {
          originalResult.onHandle();
        }

        if (props.type === 'articleVlog') {
          const doc = (props.draft || props.published) as {
            title?: string;
            slug?: { current?: string };
            mediaType?: string;
          } | null;

          try {
            void fetch('/api/articles', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'admin_article_lifecycle',
                documentId: props.id,
                title: doc?.title,
                slug: doc?.slug?.current,
                mediaType: doc?.mediaType,
              }),
            });
          } catch (err) {
            console.error('[Sanity ArticlePublishAction Error]:', err);
          }
        }
      },
    };
  };
}
