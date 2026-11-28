import { getSupabaseAdmin } from './_lib/supabase.js';

async function resolveUser(req, res) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) {
    res.status(401).json({ error: 'Missing authorization token' });
    return null;
  }
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return null;
  }
  return { user: data.user, supabase };
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
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

  const ctx = await resolveUser(req, res);
  if (!ctx) return;
  const { user, supabase } = ctx;

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const videoId = String(payload.video_id || '').trim();
    if (!videoId) return res.status(400).json({ error: 'Missing video_id' });

    const favorite = payload.favorite !== undefined ? Boolean(payload.favorite) : payload.action !== 'remove';

    if (favorite) {
      const { error } = await supabase
        .from('user_favorites')
        .upsert({ user_id: user.id, video_id: videoId, created_at: new Date().toISOString() }, { onConflict: 'user_id,video_id' });
      if (error) throw error;
    } else {
      const { error } = await supabase.from('user_favorites').delete().eq('user_id', user.id).eq('video_id', videoId);
      if (error) throw error;
    }

    return res.status(200).json({ ok: true, video_id: videoId, favorite });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to update favorites' });
  }
}
