import { getSupabaseAdmin } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, password, name } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: name || email.split('@')[0], role: 'member' }
    });

    if (error || !data?.user) return res.status(400).json({ error: error?.message || 'Could not create account' });

    return res.status(200).json({
      ok: true,
      user: { id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name || 'Member', role: 'member' }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Signup failed' });
  }
}
