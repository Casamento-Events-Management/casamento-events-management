// =============================================================================
// bookingMock.ts — Mock Data & Fallbacks for Booking Page
// =============================================================================

import type { BookingHeroContent, BookingFormData } from '@/types';

export const MOCK_BOOKING_HERO: BookingHeroContent = {
  eyebrow: 'SERVICE BOOKING',
  title: 'Reserve Your Date with Casamento',
  description:
    'Schedule a personalized consultation with us or begin your booking inquiry for weddings, product streaming, social events, etc...',
};

export const INITIAL_BOOKING_FORM_DATA: BookingFormData = {
  serviceId: '',
  serviceSlug: '',
  serviceTitle: '',
  categorySlug: '',
  categoryTitle: '',
  basePrice: 0,
  selectedAddOns: [],
  totalEstimate: 0,

  clientFullName: '',
  clientEmail: '',
  clientPhone: '',
  companyName: '',
  eventDate: '',
  isHolidayDate: false,
  holidayName: '',
  venueCity: 'Metro Manila',
  venueAddress: '',
  specialNotes: '',

  paymentProvider: 'dragonpay',
  termsAccepted: false,
};
