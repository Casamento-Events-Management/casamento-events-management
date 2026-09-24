import type { SanityDocument, SanityImageWithPriority } from './sanity';

export type FeedbackStatus = 'pending' | 'approved' | 'rejected';
export type FeedbackRating = 1 | 2 | 3 | 4 | 5;

/**
 * Public-facing approved feedback — lean GROQ projection.
 * email, phone, and adminNote are intentionally excluded from public queries.
 */
export interface ClientFeedback extends SanityDocument {
  name: string;
  eventType: string; // Plain string (e.g. "Wedding", "Debut", "Corporate Event")
  rating: FeedbackRating;
  message: string;
  photo?: SanityImageWithPriority; // Admin-uploaded via Studio; optional
  submittedAt: string; // ISO datetime string
}

/**
 * Full server-side document shape — includes sensitive contact & review status fields.
 */
export interface ClientFeedbackDocument extends ClientFeedback {
  email: string;
  phone?: string;
  status: FeedbackStatus;
  adminNote?: string;
}

/**
 * Form payload submitted by public client via POST /api/feedback
 */
export interface FeedbackSubmitPayload {
  name: string;
  email: string;
  phone?: string;
  eventType: string;
  rating: FeedbackRating;
  message: string;
  recaptchaToken?: string;
}

/** Component Props */
export interface FeedbackSectionProps {
  feedbacks: ClientFeedback[];
}

export interface FeedbackCardProps {
  feedback: ClientFeedback;
  index?: number;
}

export interface FeedbackFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}
