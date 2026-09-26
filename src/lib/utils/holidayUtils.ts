// =============================================================================
// holidayUtils.ts — Philippine Holiday Detection Utility
// =============================================================================

import Holidays from 'date-holidays';

let hd: Holidays | null = null;
try {
  hd = new Holidays('PH'); // Country Code: Philippines
} catch (e) {
  console.warn('[holidayUtils] Failed to initialize date-holidays PH instance:', e);
}

export interface HolidayCheckResult {
  isHoliday: boolean;
  name?: string;
  type?: string;
}

/**
 * Checks if a given YYYY-MM-DD date string lands on a Philippine public/bank holiday.
 */
export function checkPhilippineHoliday(dateString: string): HolidayCheckResult {
  if (!dateString || !hd) {
    return { isHoliday: false };
  }

  try {
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) {
      return { isHoliday: false };
    }

    const holidays = hd.isHoliday(dateObj);
    if (Array.isArray(holidays) && holidays.length > 0) {
      const match = holidays[0];
      return {
        isHoliday: true,
        name: match.name,
        type: match.type,
      };
    }
  } catch (err) {
    console.warn('[holidayUtils] Error checking date holiday:', err);
  }

  return { isHoliday: false };
}
