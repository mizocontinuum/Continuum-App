import { getSupabaseAdmin } from './_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) return res.status(200).json({ favorites: [] });

  try {
    const supabase = getSupabaseAdmin();
    const { data: userData } = await supabase.auth.getUser(token);
    if (!userData?.user) return res.status(200).json({ favorites: [] });

    const { data, error } = await supabase.from('user_favorites').select('video_id').eq('user_id', userData.user.id);
    if (error) return res.status(200).json({ favorites: [] });
    return res.status(200).json({ favorites: data || [] });
  } catch {
    return res.status(200).json({ favorites: [] });
  }
}
