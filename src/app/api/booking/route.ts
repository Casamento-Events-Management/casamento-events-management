import { NextResponse } from 'next/server';
import {
  sendBookingPreviewEmail,
  confirmAndSaveBooking,
} from '@/lib/services/bookingDbService';
import type { BookingApiRequest } from '@/types/booking';

/**
 * API Route Handler for Booking Reservations:
 * - action 'send_preview_email': Dispatches preview email to client for inbox/spam validation.
 * - action 'confirm_booking': Persists confirmed booking to Supabase and sends official receipts.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BookingApiRequest;
    const { action, formData, verifiedEmail } = body;

    if (!formData || !formData.serviceId || !formData.clientFullName || !formData.clientEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking information.' },
        { status: 400 }
      );
    }

    if (action === 'send_preview_email') {
      const emailToUse = (verifiedEmail || formData.clientEmail).trim().toLowerCase();
      const result = await sendBookingPreviewEmail({
        ...formData,
        clientEmail: emailToUse,
      });

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error || 'Failed to dispatch verification email.' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'confirm_booking') {
      const result = await confirmAndSaveBooking(formData, verifiedEmail);

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error || 'Failed to finalize booking.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        bookingReference: result.bookingReference,
      });
    }

    return NextResponse.json(
      { success: false, error: `Unsupported booking action: ${action}` },
      { status: 400 }
    );
  } catch (err) {
    console.error('[API /api/booking Exception]:', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
