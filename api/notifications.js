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
    if (!token) return res.status(200).json({ notifications: [] });

    try {
      const supabase = getSupabaseAdmin();
      const { data: userData } = await supabase.auth.getUser(token);
      if (!userData?.user) return res.status(200).json({ notifications: [] });

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.is.null,user_id.eq.${userData.user.id}`)
        .order('created_at', { ascending: false });

      if (error) return res.status(200).json({ notifications: [] });
      return res.status(200).json({ notifications: data || [] });
    } catch {
      return res.status(200).json({ notifications: [] });
    }
  }

  const ctx = await resolveUser(req, res);
  if (!ctx) return;
  const { user, supabase } = ctx;

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    if (payload.action === 'read_all' || payload.read_all) {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .or(`user_id.is.null,user_id.eq.${user.id}`)
        .eq('read', false);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    if (payload.id) {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('id', payload.id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    const title = String(payload.title || '').trim();
    if (!title) return res.status(400).json({ error: 'Missing title' });

    const role = user.user_metadata?.role || user.app_metadata?.role;
    const broadcast = role === 'admin' && payload.broadcast === true;
    const { data, error } = await supabase
      .from('notifications')
      .insert({ user_id: broadcast ? null : user.id, title, body: payload.body || null })
      .select()
      .single();
    if (error) throw error;
    return res.status(200).json({ ok: true, notification: data });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to update notifications' });
  }
}
