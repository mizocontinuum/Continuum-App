import { randomBytes } from 'node:crypto';
import { getSupabaseAdmin, requireAdmin } from './_lib/supabase.js';

async function findUserByEmail(supabase, email) {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const users = data?.users || [];
    const match = users.find((u) => u.email?.toLowerCase() === email);
    if (match) return match;
    if (users.length < 200) return null;
  }
  return null;
}

async function handleLogin(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { email, password } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data?.session || !data?.user) {
      return res.status(401).json({ error: error?.message || 'Invalid email or password' });
    }
    const user = data.user;
    const role = user.user_metadata?.role || user.app_metadata?.role || 'member';
    const name = user.user_metadata?.name || user.email?.split('@')[0] || 'Member';
    return res.status(200).json({
      access_token: data.session.access_token,
      user: { id: user.id, email: user.email, name, role }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
}

async function handleMe(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) return res.status(401).json({ error: 'Missing authorization token' });
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: 'Invalid or expired token' });
    const user = data.user;
    const role = user.user_metadata?.role || user.app_metadata?.role || 'member';
    const name = user.user_metadata?.name || user.email?.split('@')[0] || 'Member';
    return res.status(200).json({ id: user.id, email: user.email, name, role });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to fetch user' });
  }
}

async function handleSignup(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { email, password, name, job_role, organization, plan } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: name || email.split('@')[0],
        role: 'member',
        job_role: job_role || '',
        organization: organization || '',
        plan: plan || ''
      }
    });
    if (error || !data?.user) return res.status(400).json({ error: error?.message || 'Could not create account' });
    return res.status(200).json({
      ok: true,
      user: { id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name || 'Member', role: 'member' }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Signup failed' });
  }
}

async function handleForgot(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { email } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const normalized = String(email || '').trim().toLowerCase();
    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return res.status(400).json({ error: 'A valid email is required' });
    }
    const supabase = getSupabaseAdmin();
    const user = await findUserByEmail(supabase, normalized);
    if (!user) return res.status(200).json({ ok: true });
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const { error } = await supabase.from('password_reset_tokens').insert({
      user_id: user.id,
      email: normalized,
      token,
      expires_at: expiresAt
    });
    if (error) throw error;
    const origin = (req.headers.origin || `https://${req.headers.host || ''}`).replace(/\/$/, '');
    const resetUrl = `${origin}/reset-password/?token=${encodeURIComponent(token)}&email=${encodeURIComponent(normalized)}`;
    return res.status(200).json({ ok: true, reset_link: resetUrl });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Could not create reset link' });
  }
}

async function handleReset(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const email = String(body.email || '').trim().toLowerCase();
    const token = String(body.token || '').trim();
    const password = String(body.password || '');
    if (!email || !token) return res.status(400).json({ error: 'Missing reset token' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    const supabase = getSupabaseAdmin();
    const { data: record, error } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    if (!record || new Date(record.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ error: 'This reset link is invalid or has expired' });
    }
    const { error: updateError } = await supabase.auth.admin.updateUserById(record.user_id, { password });
    if (updateError) throw updateError;
    await supabase.from('password_reset_tokens').delete().eq('token', token);
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Could not reset password' });
  }
}

export default async function handler(req, res) {
  const path = req.query.action || req.url?.split('/').pop() || '';
  
  switch (path) {
    case 'login': return handleLogin(req, res);
    case 'me': return handleMe(req, res);
    case 'signup': return handleSignup(req, res);
    case 'forgot': return handleForgot(req, res);
    case 'reset': return handleReset(req, res);
    default: return res.status(404).json({ error: 'Unknown auth action' });
  }
}
