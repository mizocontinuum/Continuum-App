import { getSupabaseAdmin } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) return res.status(401).json({ error: 'Missing authorization token' });

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: 'Invalid or expired token' });

    const user = data.user;
    const role = user.user_metadata?.role || user.app_metadata?.role || 'member';
    const name = user.user_metadata?.name || user.email?.split('@')[0] || 'Member';

    return res.status(200).json({ id: user.id, email: user.email, name, role });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to fetch user' });
  }
}
