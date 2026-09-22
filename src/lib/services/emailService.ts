import type { ContactFormData } from '@/lib/schemas/contact';

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
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `Casamento Events <${process.env.CONTACT_EMAIL_TO}>`,
        to: [toEmail],
        reply_to: payload.email,
        subject: `New Contact Inquiry from ${payload.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #3A4F1C; background-color: #F7F3E8;">
            <h2 style="color: #3A4F1C; border-bottom: 2px solid #BC6F07; padding-bottom: 8px;">
              New Website Inquiry
            </h2>
            <p><strong>Name:</strong> ${payload.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${payload.email}">${payload.email}</a></p>
            <p><strong>Message:</strong></p>
            <blockquote style="background: #EFEAD8; padding: 12px; border-left: 4px solid #BC6F07; margin: 0;">
              ${payload.message.replace(/\n/g, '<br />')}
            </blockquote>
            <hr style="margin-top: 20px; border: none; border-top: 1px solid #BC6F07;" />
            <p style="font-size: 11px; color: #666;">Sent automatically from Casamento Events Website Contact Form</p>
          </div>
        `,
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
