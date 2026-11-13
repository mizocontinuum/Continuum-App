/**
 * Cloudflare Turnstile server-side verification.
 *
 * Degrades gracefully: if TURNSTILE_SECRET_KEY is absent, verification is
 * skipped so local/preview environments keep working.
 */
export async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { success: true, configured: false };
  if (!token) return { success: false, configured: true, error: 'Captcha token missing.' };

  try {
    const form = new URLSearchParams({ secret, response: token });
    if (ip) form.set('remoteip', ip);

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form
    });
    const data = await res.json().catch(() => ({}));
    if (data.success) return { success: true, configured: true };
    return {
      success: false,
      configured: true,
      error: 'Captcha verification failed. Please try again.'
    };
  } catch (err) {
    console.error('Turnstile verification error:', err?.message || err);
    // Fail closed only when a secret is configured.
    return { success: false, configured: true, error: 'Captcha verification unavailable.' };
  }
}
