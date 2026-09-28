// =============================================================================
// contact.ts — Contact Section & Social Links CMS Types
//
// Types the shape of the `contactSection` Sanity document returned by GROQ queries.
// Matches Contact Section Hero copy (eyebrow, title, description) and social links.
// =============================================================================

import type { SanityDocument } from './sanity';
import type { SocialLink } from './shared';

/**
 * Interface representing the Contact Section & Social Links document (`_type: 'contactSection'`).
 */
export interface ContactSectionContent extends SanityDocument {
  /** Fixed type discriminator matching the Sanity schema name. */
  _type: 'contactSection';

  /** Section kicker tag displayed above the contact section title (e.g. "Join Our Journey"). */
  eyebrow?: string;

  /** Primary section headline (e.g. "Connect With Us"). */
  title?: string;

  /** Introductory paragraph beneath the title. */
  description?: string;

  /** Social media profile links. */
  socialLinks: SocialLink[];
}
