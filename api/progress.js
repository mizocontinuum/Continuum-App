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
    if (!token) return res.status(200).json({ progress: [] });

    try {
      const supabase = getSupabaseAdmin();
      const { data: userData } = await supabase.auth.getUser(token);
      if (!userData?.user) return res.status(200).json({ progress: [] });

      const { data, error } = await supabase.from('user_progress').select('*').eq('user_id', userData.user.id);
      if (error) return res.status(200).json({ progress: [] });
      return res.status(200).json({ progress: data || [] });
    } catch {
      return res.status(200).json({ progress: [] });
    }
  }

  const ctx = await resolveUser(req, res);
  if (!ctx) return;
  const { user, supabase } = ctx;

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    if (req.method === 'POST') {
      const videoId = String(payload.video_id || '').trim();
      if (!videoId) return res.status(400).json({ error: 'Missing video_id' });

      const { data, error } = await supabase
        .from('user_progress')
        .upsert(
          {
            user_id: user.id,
            video_id: videoId,
            position: Math.max(0, Math.round(Number(payload.position) || 0)),
            duration: Math.max(0, Math.round(Number(payload.duration) || 0)),
            completed: Boolean(payload.completed),
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id,video_id' }
        )
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json({ ok: true, progress: data });
    }

    if (req.method === 'DELETE') {
      const videoId = String(payload.video_id || req.query?.video_id || '').trim();
      if (!videoId) return res.status(400).json({ error: 'Missing video_id' });
      const { error } = await supabase.from('user_progress').delete().eq('user_id', user.id).eq('video_id', videoId);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to save progress' });
  }
}
