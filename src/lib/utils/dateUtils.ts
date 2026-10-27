// =============================================================================
// dateUtils.ts — Pure Date & Calendar Helper Utilities (Universal / Safe for Client & Server)
// =============================================================================

/**
 * Calculates calendar days remaining between today and event date (YYYY-MM-DD).
 * Returns:
 *   > 0: days in the future
 *   0: today
 *   < 0: past date
 */
export function calculateDaysRemaining(eventDateStr: string): number {
  if (!eventDateStr) return -1;
  const parts = eventDateStr.split('-');
  if (parts.length !== 3) return -1;
  const target = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Formats a date or timestamp into "MMM d, yyyy, h:mm a" (e.g. "Oct 27, 2026, 12:00 PM").
 * Time is strictly in 12-hour format with AM/PM.
 */
export function formatPaymentDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    const dateFormatted = d.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeFormatted = d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${dateFormatted}, ${timeFormatted}`;
  } catch {
    return dateStr || '—';
  }
}
