import { getSupabaseAdmin } from './_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) return res.status(200).json({ notifications: [] });

  try {
    const supabase = getSupabaseAdmin();
    const { data: userData } = await supabase.auth.getUser(token);
    if (!userData?.user) return res.status(200).json({ notifications: [] });

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(200).json({ notifications: [] });
    return res.status(200).json({ notifications: data || [] });
  } catch {
    return res.status(200).json({ notifications: [] });
  }
}
