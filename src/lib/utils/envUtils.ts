/**
 * Parses a comma-separated email list from the FEEDBACK_EMAIL_RECIPIENTS environment variable.
 * Returns an array of trimmed email addresses.
 */
export function parseFeedbackEmailRecipients(): string[] {
  const raw = process.env.FEEDBACK_EMAIL_RECIPIENTS ?? '';
  if (!raw.trim()) {
    // Fallback list if env variable is not set in development
    if (process.env.NODE_ENV === 'development') {
      return [
        'benjicanones6@gmail.com',
        // 'benjisobrangpogi@gmail.com',
        // 'arjaypana28@gmail.com',
      ];
    }
    return [];
  }

  return raw
    .split(',')
    .map((addr) => addr.trim())
    .filter((addr) => addr.length > 0 && addr.includes('@'));
}
