// =============================================================================
// booking.ts — Booking Domain Types
// =============================================================================

import type { SanityDocument } from './sanity';

/**
 * Raw Sanity document representation for the Booking Hero singleton (`_type: 'bookingHero'`).
 */
export interface SanityBookingHero extends SanityDocument {
  _type: 'bookingHero';
  eyebrow?: string;
  title?: string;
  description?: string;
}

/**
 * Clean frontend representation for the Booking Hero component.
 */
export interface BookingHeroContent {
  eyebrow?: string;
  title: string;
  description: string;
}
