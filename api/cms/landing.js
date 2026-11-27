import { getSupabaseAdmin, requireAdmin } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase.from('cms_settings').select('value').eq('key', 'landing').maybeSingle();
      if (error) throw error;
      return res.status(200).json(data?.value || {});
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Failed to load landing CMS' });
    }
  }

  if (req.method === 'PUT') {
    const ctx = await requireAdmin(req, res);
    if (!ctx) return;

    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { error } = await ctx.supabase
        .from('cms_settings')
        .upsert({ key: 'landing', value: payload, updated_at: new Date().toISOString() }, { onConflict: 'key' });

      if (error) throw error;
      return res.status(200).json({ ok: true, value: payload });
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Failed to update landing CMS' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
