// =============================================================================
// bookingForm.ts — Booking Form State & UI Types
// =============================================================================

export type BookingStep = 1 | 2 | 3;

export interface SelectedAddOn {
  id: string;
  title: string;
  price: number;
  priceFormatted?: string;
}

export interface BookingFormData {
  // Step 1: Service & Add-ons Selection
  serviceId: string;
  serviceSlug: string;
  serviceTitle: string;
  categorySlug: string;
  categoryTitle: string;
  basePrice: number;
  selectedAddOns: SelectedAddOn[];
  totalEstimate: number;

  // Step 2: Client & Event Details
  clientFullName: string;
  clientEmail: string;
  clientPhone: string;
  companyName?: string;
  eventType?: string;
  eventTitle?: string;
  eventDate: string; // YYYY-MM-DD format
  isHolidayDate: boolean;
  holidayName?: string;
  venueCity: string;
  venueAddress?: string;
  specialNotes?: string;

  // Step 3: Payment Method & Acceptance
  paymentProvider: 'dragonpay' | 'paypal';
  termsAccepted: boolean;
}

export interface ServiceSelectionState {
  serviceSlug: string | null;
  categorySlug: string | null;
  addOnIds: string[];
}
