/**
 * Server-side Google reCAPTCHA v3 verification service
 */
export interface RecaptchaVerifyResult {
  success: boolean;
  score?: number;
  action?: string;
  error?: string;
}

export async function verifyRecaptchaToken(
  token: string,
  expectedAction = 'contact_submit'
): Promise<RecaptchaVerifyResult> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    // If secret key is not set, log warning in dev mode and bypass
    if (process.env.NODE_ENV === 'development') {
      console.warn('[recaptchaService] RECAPTCHA_SECRET_KEY not set. Bypassing verification in dev mode.');
    }
    return { success: true, score: 1.0 };
  }

  if (!token) {
    return { success: false, error: 'reCAPTCHA token is missing.' };
  }

  try {
    const params = new URLSearchParams({
      secret: secretKey,
      response: token,
    });

    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!res.ok) {
      return { success: false, error: 'Failed to contact reCAPTCHA verification server.' };
    }

    const data = await res.json();

    console.log('[recaptchaService] Google siteverify response:', data);

    if (!data.success) {
      console.warn('[recaptchaService] Verification failed error-codes:', data['error-codes']);
      return {
        success: false,
        error: `reCAPTCHA verification failed: ${data['error-codes']?.join(', ') || 'Invalid token'}`,
      };
    }

    // Check risk score threshold (0.0 = bot, 1.0 = human)
    const minScore = 0.5;
    if (data.score !== undefined && data.score < minScore) {
      return {
        success: false,
        score: data.score,
        error: `Bot risk score too low (${data.score}). Request blocked.`,
      };
    }

    // Verify action match if provided
    if (data.action && expectedAction && data.action !== expectedAction) {
      return {
        success: false,
        error: `Action mismatch: expected "${expectedAction}", got "${data.action}".`,
      };
    }

    return {
      success: true,
      score: data.score,
      action: data.action,
    };
  } catch (error) {
    console.error('[recaptchaService Error]:', error);
    return { success: false, error: 'Internal server error during bot verification.' };
  }
}
