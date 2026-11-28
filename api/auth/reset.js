import { getSupabaseAdmin } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const email = String(body.email || '').trim().toLowerCase();
    const token = String(body.token || '').trim();
    const password = String(body.password || '');

    if (!email || !token) return res.status(400).json({ error: 'Missing reset token' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const supabase = getSupabaseAdmin();
    const { data: record, error } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    if (!record || new Date(record.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ error: 'This reset link is invalid or has expired' });
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(record.user_id, { password });
    if (updateError) throw updateError;

    await supabase.from('password_reset_tokens').delete().eq('token', token);

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Could not reset password' });
  }
}
