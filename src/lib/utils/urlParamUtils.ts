// =============================================================================
// urlParamUtils.ts — Type-Safe URL Query Parameter Synchronization Helper
// =============================================================================

/**
 * Updates URL search parameters in the browser history without triggering
 * a full page reload or scrolling.
 *
 * @param updates Key-value pairs to set. Pass `null` or `undefined` to remove a key.
 * @param basePath Optional base pathname. Defaults to `window.location.pathname`.
 */
export function syncUrlParams(
  updates: Record<string, string | null | undefined>,
  basePath?: string
): void {
  if (typeof window === 'undefined') return;

  try {
    const currentParams = new URLSearchParams(window.location.search);

    for (const [key, val] of Object.entries(updates)) {
      if (val === null || val === undefined || val === '') {
        currentParams.delete(key);
      } else {
        currentParams.set(key, val);
      }
    }

    const path = basePath || window.location.pathname;
    const queryStr = currentParams.toString();
    const newUrl = queryStr ? `${path}?${queryStr}` : path;

    window.history.replaceState(null, '', newUrl);
  } catch (err) {
    console.error('[syncUrlParams] Error updating URL params:', err);
  }
}

/**
 * Safely reads a search parameter from window.location.search on the client.
 */
export function getUrlParam(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  } catch {
    return null;
  }
}
