import { requireAdmin } from '../_lib/supabase.js';

export default async function handler(req, res) {
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
