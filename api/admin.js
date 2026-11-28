import { requireAdmin } from './_lib/supabase.js';

async function handleSeries(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const ctx = await requireAdmin(req, res);
  if (!ctx) return;
  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    if (!payload.id || !payload.name) return res.status(400).json({ error: 'Missing required fields: id, name' });
    const { data, error } = await ctx.supabase.from('disciplines').upsert(payload, { onConflict: 'id' }).select().single();
    if (error) throw error;
    return res.status(200).json({ ok: true, series: data });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to save series' });
  }
}

async function handleVideos(req, res) {
  if (req.method === 'POST') {
    const ctx = await requireAdmin(req, res);
    if (!ctx) return;
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      if (!payload.id || !payload.title) return res.status(400).json({ error: 'Missing required fields: id, title' });
      
      // Log the payload for debugging
      console.log('Video payload:', JSON.stringify(payload, null, 2));
      
      const { data, error } = await ctx.supabase.from('videos').upsert(payload, { onConflict: 'id' }).select().single();
      if (error) {
        console.error('Supabase videos error:', error);
        throw new Error(`Database error: ${error.message || 'Failed to save video'}`);
      }
      return res.status(200).json({ ok: true, video: data });
    } catch (err) {
      console.error('Save video error:', err);
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
  
  // Check environment variables first
  const hasUrl = !!process.env.SUPABASE_URL;
  const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!hasUrl || !hasKey) {
    console.error('Missing environment variables:', {
      SUPABASE_URL: hasUrl,
      SUPABASE_SERVICE_ROLE_KEY: hasKey,
      allEnvVars: Object.keys(process.env).filter(k => k.startsWith('SUPABASE'))
    });
    return res.status(500).json({ 
      error: `Supabase is not configured. Missing: ${!hasUrl ? 'SUPABASE_URL' : ''} ${!hasKey ? 'SUPABASE_SERVICE_ROLE_KEY' : ''}`.trim() 
    });
  }
  
  const ctx = await requireAdmin(req, res);
  if (!ctx) return;
  
  try {
    const filename = String(req.query.filename || '').trim();
    const folder = String(req.query.folder || 'uploads').replace(/[^a-zA-Z0-9_-]/g, '');
    if (!filename) return res.status(400).json({ error: 'Missing filename' });
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${folder}/${Date.now()}-${safeName}`;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'media';
    
    console.log('Creating signed upload URL for:', { path, bucket });
    
    // Try to create the bucket if it doesn't exist
    try {
      await ctx.supabase.storage.createBucket(bucket, { public: true });
      console.log('Created bucket:', bucket);
    } catch (bucketError) {
      console.log('Bucket might already exist:', bucketError.message);
    }
    
    const { data, error } = await ctx.supabase.storage.from(bucket).createSignedUploadUrl(path);
    if (error) {
      console.error('Supabase storage error:', error);
      throw new Error(`Storage error: ${error.message || 'Failed to create upload URL'}`);
    }
    const { data: pub } = ctx.supabase.storage.from(bucket).getPublicUrl(path);
    return res.status(200).json({ signedUrl: data.signedUrl, token: data.token, path, publicUrl: pub.publicUrl });
  } catch (err) {
    console.error('Upload URL error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create upload URL' });
  }
}

export default async function handler(req, res) {
  const action = req.query.action || '';
  
  switch (action) {
    case 'series': return handleSeries(req, res);
    case 'videos': return handleVideos(req, res);
    case 'upload-url': return handleUploadUrl(req, res);
    default: return res.status(404).json({ error: 'Unknown admin action' });
  }
}
