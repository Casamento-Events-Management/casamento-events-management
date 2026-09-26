/**
 * Helper to parse comma-separated email lists from environment variables.
 * Handles single or multiple comma-separated emails, e.g.:
 * "admin1@casamento.com, admin2@casamento.com"
 */
export function parseEmailList(envValue?: string, fallback: string[] = []): string[] {
  const raw = envValue ?? '';
  if (!raw.trim()) {
    return fallback;
  }

  return raw
    .split(',')
    .map((addr) => addr.trim())
    .filter((addr) => addr.length > 0 && addr.includes('@'));
}

/**
 * Parses admin recipients for Feedback notifications from FEEDBACK_EMAIL_RECIPIENTS.
 */
export function parseFeedbackEmailRecipients(): string[] {
  return parseEmailList(
    process.env.FEEDBACK_EMAIL_RECIPIENTS,
    process.env.NODE_ENV === 'development' ? ['benjicanones6@gmail.com'] : []
  );
}

/**
 * Parses CC recipients for Feedback notifications from FEEDBACK_EMAIL_CC (if set).
 */
export function parseFeedbackEmailCC(): string[] | undefined {
  const list = parseEmailList(process.env.FEEDBACK_EMAIL_CC);
  return list.length > 0 ? list : undefined;
}

/**
 * Parses admin recipients for Contact form inquiries from CONTACT_EMAIL_TO.
 * Supports single email or comma-separated list of multiple recipients.
 */
export function parseContactEmailRecipients(): string[] {
  return parseEmailList(
    process.env.CONTACT_EMAIL_TO,
    process.env.NODE_ENV === 'development' ? ['benjicanones6@gmail.com'] : ['onboarding@resend.dev']
  );
}

/**
 * Parses CC recipients for Contact form inquiries from CONTACT_EMAIL_CC (if set).
 */
export function parseContactEmailCC(): string[] | undefined {
  const list = parseEmailList(process.env.CONTACT_EMAIL_CC);
  return list.length > 0 ? list : undefined;
}
