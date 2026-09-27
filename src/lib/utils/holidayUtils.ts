// =============================================================================
// holidayUtils.ts — International & Dynamic Country Holiday Detection Utility
// =============================================================================

import Holidays from 'date-holidays';

export interface HolidayCheckResult {
  isHoliday: boolean;
  name?: string;
  type?: string;
  countryCode?: string;
}

export interface CountryListItem {
  code: string;
  name: string;
}

// Map cache for instantiated country holiday objects
const hdCache = new Map<string, Holidays>();

/**
 * Retrieves the full list of all supported countries dynamically from the date-holidays package.
 * Sorted alphabetically with Philippines (PH) defaulted at the top.
 */
export function getCountriesList(): CountryListItem[] {
  try {
    const hd = new Holidays();
    const countriesObj = hd.getCountries('en') || {};
    const list: CountryListItem[] = Object.entries(countriesObj).map(([code, name]) => ({
      code,
      name: typeof name === 'string' ? name : code,
    }));

    list.sort((a, b) => a.name.localeCompare(b.name));

    // Move Philippines (PH) to the top of the dropdown list
    const phIndex = list.findIndex((item) => item.code === 'PH');
    if (phIndex > -1) {
      const [ph] = list.splice(phIndex, 1);
      list.unshift(ph);
    }

    return list;
  } catch (e) {
    console.warn('[holidayUtils] Failed to load countries list from date-holidays:', e);
    return [
      { code: 'PH', name: 'Philippines' },
      { code: 'US', name: 'United States' },
      { code: 'CA', name: 'Canada' },
      { code: 'AU', name: 'Australia' },
      { code: 'SG', name: 'Singapore' },
      { code: 'GB', name: 'United Kingdom' },
    ];
  }
}

/**
 * Retrieves or instantiates a Holidays instance for a specific ISO country code.
 */
export function getHolidaysInstance(countryCode: string = 'PH'): Holidays | null {
  const code = (countryCode || 'PH').toUpperCase();
  if (hdCache.has(code)) {
    return hdCache.get(code)!;
  }

  try {
    const instance = new Holidays(code);
    hdCache.set(code, instance);
    return instance;
  } catch (e) {
    console.warn(`[holidayUtils] Failed to initialize date-holidays instance for country "${code}":`, e);
    return null;
  }
}

/**
 * Checks if a given YYYY-MM-DD date string lands on a public/official holiday for the given country.
 * Defaults to 'PH' (Philippines).
 */
export function checkCountryHoliday(dateString: string, countryCode: string = 'PH'): HolidayCheckResult {
  if (!dateString) {
    return { isHoliday: false };
  }

  const hd = getHolidaysInstance(countryCode);
  if (!hd) {
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
        countryCode: countryCode.toUpperCase(),
      };
    }
  } catch (err) {
    console.warn(`[holidayUtils] Error checking date holiday for country "${countryCode}":`, err);
  }

  return { isHoliday: false };
}

/**
 * Backward-compatible helper for checking Philippine holidays specifically.
 */
export function checkPhilippineHoliday(dateString: string): HolidayCheckResult {
  return checkCountryHoliday(dateString, 'PH');
}
