import type { DocumentActionComponent, DocumentActionProps } from 'sanity';

/**
 * Custom Sanity Document Action for Client Feedback (`clientFeedback`).
 *
 * Wraps the default publish action to immediately notify Next.js `/api/feedback`
 * with the lifecycle state (Approved, Rejected, Pending), enabling real-time
 * Audit Trail logging during local development and production.
 */
export function createFeedbackPublishAction(
  originalPublishAction: DocumentActionComponent
): DocumentActionComponent {
  return function FeedbackPublishAction(props: DocumentActionProps) {
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

        if (props.type === 'clientFeedback') {
          const doc = (props.draft || props.published) as {
            name?: string;
            email?: string;
            eventType?: string;
            status?: string;
          } | null;

          if (doc) {
            try {
              void fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'admin_feedback_lifecycle',
                  documentId: props.id,
                  status: doc.status || 'pending',
                  name: doc.name,
                  email: doc.email,
                  eventType: doc.eventType,
                }),
              });
            } catch (err) {
              console.error('[Sanity FeedbackPublishAction Error]:', err);
            }
          }
        }
      },
    };
  };
}
