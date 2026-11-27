import { requireAdmin } from '../../_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  const ctx = await requireAdmin(req, res);
  if (!ctx) return;

  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing video id' });

    const { error } = await ctx.supabase.from('videos').delete().eq('id', id);
    if (error) throw error;
    return res.status(200).json({ ok: true, id });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to delete video' });
  }
}
