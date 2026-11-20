'use client';

// =============================================================================
// lib/utils/recaptchaClient.ts — Client-Side Google reCAPTCHA v3 Token Helper
// =============================================================================

interface GrecaptchaApi {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
}

function getGrecaptcha(): GrecaptchaApi | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { grecaptcha?: GrecaptchaApi }).grecaptcha;
}

/**
 * Lazily injects the Google reCAPTCHA v3 script on demand (e.g. when a user focuses a form)
 * so third-party script execution is avoided on initial page load.
 */
export function warmRecaptchaScript(): void {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey || typeof window === 'undefined') {
    return;
  }

  if (!getGrecaptcha() && !document.querySelector('script[src*="google.com/recaptcha/api.js"]')) {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
}

/**
 * Ensures the Google reCAPTCHA v3 script is loaded on the page and resolves a token
 * for the specified action. Waits briefly if the script is still lazy-loading.
 */
export async function executeRecaptcha(action: string): Promise<string> {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey || typeof window === 'undefined') {
    return '';
  }

  warmRecaptchaScript();

  // Poll briefly (up to 4 seconds) for grecaptcha to finish initializing
  const maxWaitMs = 4000;
  const intervalMs = 100;
  let waited = 0;
  while (!getGrecaptcha() && waited < maxWaitMs) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    waited += intervalMs;
  }

  const grecaptcha = getGrecaptcha();
  if (!grecaptcha) {
    return '';
  }

  try {
    return await new Promise<string>((resolve) => {
      grecaptcha.ready(() => {
        grecaptcha
          .execute(siteKey, { action })
          .then((token: string) => resolve(token || ''))
          .catch(() => resolve(''));
      });
    });
  } catch {
    return '';
  }
}
