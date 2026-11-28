import { put } from '@vercel/blob';
import { requireAdmin } from './_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await requireAdmin(req, res);
  if (!ctx) return;

  try {
    const { filename, contentType } = req.body || {};
    
    if (!filename || !contentType) {
      return res.status(400).json({ error: 'Missing filename or contentType' });
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const blobPath = `videos/${timestamp}-${safeFilename}`;

    // Create a blob upload URL
    const blob = await put(blobPath, req.body, {
      access: 'public',
      contentType: contentType,
      addRandomSuffix: false
    });

    return res.status(200).json({ 
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      size: blob.size
    });
  } catch (err) {
    console.error('Vercel Blob upload error:', err);
    return res.status(500).json({ error: err.message || 'Failed to upload to Vercel Blob' });
  }
}
