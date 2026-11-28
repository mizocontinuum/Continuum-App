import { getSupabaseAdmin, requireAdmin } from '../_lib/supabase.js';

const ALLOWED_KEYS = new Set(['landing', 'landing_live']);

function resolveKey(req) {
  const raw = String(req.query?.key || (typeof req.body === 'object' ? req.body?.key : '') || 'landing');
  return ALLOWED_KEYS.has(raw) ? raw : 'landing';
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const key = resolveKey(req);
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase.from('cms_settings').select('value').eq('key', key).maybeSingle();
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
      const key = resolveKey(req);
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const value = payload.value && typeof payload.value === 'object' ? payload.value : payload;

      const { error } = await ctx.supabase
        .from('cms_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

      if (error) throw error;
      return res.status(200).json({ ok: true, key, value });
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Failed to update landing CMS' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
