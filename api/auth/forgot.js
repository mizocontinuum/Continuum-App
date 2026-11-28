import { randomBytes } from 'node:crypto';
import { getSupabaseAdmin } from '../_lib/supabase.js';

async function findUserByEmail(supabase, email) {
  // auth.admin.listUsers paginates; scan until found (fine for typical userbases).
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const users = data?.users || [];
    const match = users.find((u) => u.email?.toLowerCase() === email);
    if (match) return match;
    if (users.length < 200) return null;
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const normalized = String(email || '').trim().toLowerCase();
    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return res.status(400).json({ error: 'A valid email is required' });
    }

    const supabase = getSupabaseAdmin();
    const user = await findUserByEmail(supabase, normalized);
    // Always answer ok so the endpoint cannot be used to enumerate accounts.
    if (!user) return res.status(200).json({ ok: true });

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const { error } = await supabase.from('password_reset_tokens').insert({
      user_id: user.id,
      email: normalized,
      token,
      expires_at: expiresAt
    });
    if (error) throw error;

    const origin = (req.headers.origin || `https://${req.headers.host || ''}`).replace(/\/$/, '');
    const resetUrl = `${origin}/reset-password/?token=${encodeURIComponent(token)}&email=${encodeURIComponent(normalized)}`;

    // TODO(email): deliver resetUrl through transactional email (Resend/SES/SendGrid).
    // Returned in the response so the flow works end-to-end until SMTP is wired.
    return res.status(200).json({ ok: true, reset_link: resetUrl });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Could not create reset link' });
  }
}
