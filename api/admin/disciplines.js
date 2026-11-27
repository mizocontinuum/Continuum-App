import { requireAdmin } from '../_lib/supabase.js';

export default async function handler(req, res) {
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
