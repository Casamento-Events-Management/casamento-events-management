// =============================================================================
// bookingService.ts — Booking Data Service Layer
//
// Decoupled service layer for retrieving Booking Hero content.
// Serves as the single data provider for Next.js App Router server components.
// =============================================================================

import { MOCK_BOOKING_HERO } from '@/data/bookingMock';
import { client } from '@/sanity/lib/client';
import type { BookingHeroContent } from '@/types';

/** GROQ query targeting the `bookingHero` singleton document. */
export const GROQ_BOOKING_HERO = `
  *[_type == "bookingHero" && _id == "bookingHero"][0] {
    eyebrow,
    title,
    description
  }
`;

/** Hardcoded fallback used when Sanity is unreachable or document is unpublished. */
export const BOOKING_HERO_FALLBACK: BookingHeroContent = MOCK_BOOKING_HERO;

/**
 * Returns the Booking Hero content from Sanity CMS with fallback defaults.
 * Cached with ISR at 3600-second revalidation (tagged `bookingHero`).
 */
export async function getBookingHeroContent(): Promise<BookingHeroContent> {
  try {
    const data = await client.fetch<BookingHeroContent | null>(
      GROQ_BOOKING_HERO,
      {},
      { next: { revalidate: 3600, tags: ['bookingHero'] } }
    );

    if (data?.title && data?.description) {
      return {
        eyebrow: data.eyebrow || BOOKING_HERO_FALLBACK.eyebrow,
        title: data.title,
        description: data.description,
      };
    }
  } catch (err) {
    console.warn(
      '[bookingService] Failed to fetch bookingHero from Sanity, using fallback:',
      err
    );
  }

  return BOOKING_HERO_FALLBACK;
}
