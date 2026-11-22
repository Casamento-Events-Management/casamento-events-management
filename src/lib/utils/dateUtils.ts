// =============================================================================
// dateUtils.ts — Pure Date & Calendar Helper Utilities (Universal / Hydration-Safe)
// =============================================================================

export const MANILA_TIME_ZONE = 'Asia/Manila';

const DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Hydration-safe date formatter for both calendar date strings (`YYYY-MM-DD`)
 * and full ISO timestamps (`2026-11-22T18:00:00Z`).
 *
 * - Pure `YYYY-MM-DD` dates format in `UTC` so the calendar day never shifts across
 *   server/client timezones.
 * - Full ISO timestamps format in `Asia/Manila` using the standardized `en-US` locale
 *   so Vercel SSR (UTC) and client browsers always render identical text.
 */
export function formatDisplayDate(
  dateStr: string | null | undefined,
  month: 'long' | 'short' = 'long'
): string {
  if (!dateStr) return '';
  try {
    const trimmed = dateStr.trim();
    const isDateOnly = DATE_ONLY_REGEX.test(trimmed);
    const date = isDateOnly ? new Date(`${trimmed}T00:00:00Z`) : new Date(trimmed);
    if (isNaN(date.getTime())) return dateStr;

    return new Intl.DateTimeFormat('en-US', {
      month,
      day: 'numeric',
      year: 'numeric',
      timeZone: isDateOnly ? 'UTC' : MANILA_TIME_ZONE,
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Calculates calendar days remaining between today (in Asia/Manila) and event date (YYYY-MM-DD).
 * Returns:
 *   > 0: days in the future
 *   0: today
 *   < 0: past date
 */
export function calculateDaysRemaining(eventDateStr: string): number {
  if (!eventDateStr) return -1;
  const parts = eventDateStr.split('-');
  if (parts.length !== 3) return -1;
  const targetUtc = Date.UTC(
    parseInt(parts[0], 10),
    parseInt(parts[1], 10) - 1,
    parseInt(parts[2], 10)
  );
  const manilaTodayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: MANILA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const todayParts = manilaTodayStr.split('-');
  const todayUtc = Date.UTC(
    parseInt(todayParts[0], 10),
    parseInt(todayParts[1], 10) - 1,
    parseInt(todayParts[2], 10)
  );
  const diffMs = targetUtc - todayUtc;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Formats a date or timestamp into "MMM d, yyyy, h:mm a" (e.g. "Oct 27, 2026, 12:00 PM")
 * pinned to `Asia/Manila` so server and client always agree.
 */
export function formatPaymentDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    const dateFormatted = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: MANILA_TIME_ZONE,
    }).format(d);
    const timeFormatted = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: MANILA_TIME_ZONE,
    }).format(d);
    return `${dateFormatted}, ${timeFormatted}`;
  } catch {
    return dateStr || '—';
  }
}
