import { getSupabaseAdmin } from './_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const supabase = getSupabaseAdmin();
    const [discRes, vidRes] = await Promise.all([
      supabase.from('disciplines').select('*').order('sort_order', { ascending: true }),
      supabase.from('videos').select('*').order('created_at', { ascending: false })
    ]);

    if (discRes.error) throw discRes.error;
    if (vidRes.error) throw vidRes.error;

    return res.status(200).json({
      disciplines: discRes.data || [],
      videos: vidRes.data || []
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to load catalogue' });
  }
}
