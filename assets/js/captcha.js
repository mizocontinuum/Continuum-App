/**
 * Continuum Academy - optional Cloudflare Turnstile captcha.
 *
 * The captcha is only active when a site key is configured in config.js AND the
 * server has the matching secret. Otherwise every function here is a harmless
 * no-op, so sign-in keeps working in local and preview environments.
 */
import { TURNSTILE_SITE_KEY } from './config.js';

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptPromise = null;

/** @returns {boolean} true when a site key is configured. */
export function captchaEnabled() {
  return Boolean(TURNSTILE_SITE_KEY);
}

function loadScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => reject(new Error('Captcha script failed to load.')));
    document.head.append(script);
  });
  return scriptPromise;
}

/**
 * Render a Turnstile widget into `container`.
 * @returns {Promise<null|{getToken: () => string, reset: () => void}>}
 */
export async function mountCaptcha(container) {
  if (!captchaEnabled() || !container) return null;

  try {
    await loadScript();
  } catch {
    return null;
  }
  if (!window.turnstile || typeof window.turnstile.render !== 'function') return null;

  let token = '';
  const widgetId = window.turnstile.render(container, {
    sitekey: TURNSTILE_SITE_KEY,
    callback: (value) => {
      token = value;
    },
    'expired-callback': () => {
      token = '';
    },
    'error-callback': () => {
      token = '';
    }
  });

  container.hidden = false;

  return {
    getToken: () => token,
    reset: () => {
      token = '';
      try {
        window.turnstile.reset(widgetId);
      } catch {
        /* widget already gone - nothing to reset */
      }
    }
  };
}
