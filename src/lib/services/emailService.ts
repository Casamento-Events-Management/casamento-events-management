import type { ContactFormData } from '@/lib/schemas/contact';
import { buildContactAdminEmail } from '@/lib/email';

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Server-side email delivery service using Resend HTTP API
 */
export async function sendContactEmail(
  payload: ContactFormData
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_EMAIL_TO || 'onboarding@resend.dev';

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[emailService] RESEND_API_KEY not configured. Mocking email delivery:', payload);
    }
    return { success: true, id: 'mock-email-id' };
  }

  try {
    const { subject, html } = buildContactAdminEmail(payload);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `Casamento Events <${process.env.CONTACT_EMAIL_FROM}>`,
        to: [toEmail],
        reply_to: payload.email,
        subject,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[emailService Resend Error]:', data);
      return {
        success: false,
        error: data.message || 'Failed to dispatch email via Resend API.',
      };
    }

    return {
      success: true,
      id: data.id,
    };
  } catch (error) {
    console.error('[emailService Error]:', error);
    return {
      success: false,
      error: 'Internal server error while sending email.',
    };
  }
}
