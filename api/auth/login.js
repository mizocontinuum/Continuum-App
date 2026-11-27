import { getSupabaseAdmin } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, password } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data?.session || !data?.user) {
      return res.status(401).json({ error: error?.message || 'Invalid email or password' });
    }

    const user = data.user;
    const role = user.user_metadata?.role || user.app_metadata?.role || 'member';
    const name = user.user_metadata?.name || user.email?.split('@')[0] || 'Member';

    return res.status(200).json({
      access_token: data.session.access_token,
      user: { id: user.id, email: user.email, name, role }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
}
