import { requireAdmin } from './_lib/supabase.js';

async function handleDisciplines(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const ctx = await requireAdmin(req, res);
  if (!ctx) return;
  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    if (!payload.id || !payload.name) return res.status(400).json({ error: 'Missing required fields: id, name' });
    const { data, error } = await ctx.supabase.from('disciplines').upsert(payload, { onConflict: 'id' }).select().single();
    if (error) throw error;
    return res.status(200).json({ ok: true, discipline: data });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to save discipline' });
  }
}

async function handleVideos(req, res) {
  if (req.method === 'POST') {
    const ctx = await requireAdmin(req, res);
    if (!ctx) return;
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      if (!payload.id || !payload.title) return res.status(400).json({ error: 'Missing required fields: id, title' });
      const { data, error } = await ctx.supabase.from('videos').upsert(payload, { onConflict: 'id' }).select().single();
      if (error) throw error;
      return res.status(200).json({ ok: true, video: data });
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Failed to save video' });
    }
  } else if (req.method === 'DELETE') {
    const ctx = await requireAdmin(req, res);
    if (!ctx) return;
    try {
      const id = req.query.id;
      if (!id) return res.status(400).json({ error: 'Missing video id' });
      const { error } = await ctx.supabase.from('videos').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true, id });
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Failed to delete video' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleUploadUrl(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const ctx = await requireAdmin(req, res);
  if (!ctx) return;
  try {
    const filename = String(req.query.filename || '').trim();
    const folder = String(req.query.folder || 'uploads').replace(/[^a-zA-Z0-9_-]/g, '');
    if (!filename) return res.status(400).json({ error: 'Missing filename' });
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${folder}/${Date.now()}-${safeName}`;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'media';
    const { data, error } = await ctx.supabase.storage.from(bucket).createSignedUploadUrl(path);
    if (error) throw error;
    const { data: pub } = ctx.supabase.storage.from(bucket).getPublicUrl(path);
    return res.status(200).json({ signedUrl: data.signedUrl, token: data.token, path, publicUrl: pub.publicUrl });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to create upload URL' });
  }
}

export default async function handler(req, res) {
  const action = req.query.action || '';
  
  switch (action) {
    case 'disciplines': return handleDisciplines(req, res);
    case 'videos': return handleVideos(req, res);
    case 'upload-url': return handleUploadUrl(req, res);
    default: return res.status(404).json({ error: 'Unknown admin action' });
  }
}
