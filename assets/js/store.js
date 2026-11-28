/**
 * Continuum Academy - application state.
 *
 * The catalogue, favourites, progress, notifications and the session all render
 * from the shipped mock data and localStorage - there is no backend. The session
 * is cached here so the chrome can paint synchronously, and access control is
 * enforced client-side by initPageChrome() in user-menu.js.
 *
 * It exposes:
 *
 *   session       - the local frontend demo session (name/email/role)
 *   catalogue     - disciplines + videos (mock-data.js, overlaid with admin edits)
 *   favorites     - My List
 *   progress      - Continue Watching
 *   notifications - the bell feed
 */

import {
  DISCIPLINES,
  VIDEOS,
  NOTIFICATIONS,
  PROFILE,
  SEED_FAVORITES,
  SEED_PROGRESS,
  bySortOrder
} from './mock-data.js';

/* ------------------------------- storage -------------------------------- */

const KEYS = {
  session: 'continuum.session',
  favorites: 'continuum.favorites',
  progress: 'continuum.progress',
  notifications: 'continuum.notifications',
  disciplines: 'continuum.catalogue.disciplines',
  videos: 'continuum.catalogue.videos',
  profile: 'continuum.profile'
};

/** localStorage can throw in private mode - never let that break a page. */
function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_) {
    return fallback;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (_) {
    return false;
  }
}

function remove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (_) {}
}

const clone = (value) => JSON.parse(JSON.stringify(value));

/* ------------------------------ server sync ----------------------------- */

const TOKEN_KEY = 'continuum_auth_token';

export function authToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY) || '';
  } catch (_) {
    return '';
  }
}

/** Authenticated JSON fetch against the Vercel serverless API. */
async function apiFetch(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = authToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

/** Remote writes are best-effort: the local store stays usable offline. */
function pushRemote(path, body) {
  if (!authToken()) return;
  apiFetch(path, { method: 'POST', body }).catch(() => {});
}

function normalizeDiscipline(row) {
  return {
    id: row.id,
    slug: row.slug || row.id,
    title: row.title || row.name || row.id,
    name: row.name || row.title || row.id,
    goal: row.goal || '',
    blurb: row.blurb || '',
    sort_order: Number(row.sort_order) || 0
  };
}

function normalizeVideo(row) {
  return {
    id: row.id,
    series_id: row.series_id || row.discipline_id || '',
    discipline_id: row.discipline_id || row.series_id || '',
    discipline: row.discipline || row.tag || '',
    title: row.title || '',
    speaker: row.speaker || 'Executive Faculty',
    minutes: Number(row.minutes) || 30,
    tag: row.tag || '',
    highlight: row.highlight || '',
    rating: Number(row.rating) || 0,
    summary: row.summary || '',
    outcomes: Array.isArray(row.outcomes) ? row.outcomes : [],
    video_url: row.video_url || '',
    trailer_url: row.trailer_url || '',
    thumbnail_url: row.thumbnail_url || '',
    category: row.category || '',
    is_clip: Boolean(row.is_clip),
    featured: Boolean(row.featured),
    sort_order: Number(row.sort_order) || 0,
    created_at: row.created_at || ''
  };
}

/**
 * Pull server state into the local store. Server data wins for the catalogue;
 * favourites, progress and notifications merge per-user. Safe to call on any
 * page — failures keep the local/demo data untouched.
 * @returns {Promise<object|null>} fresh session profile when /api/auth/me answers
 */
export async function syncFromServer() {
  const token = authToken();
  if (!token) return null;

  let me = null;
  try {
    me = await apiFetch('/api/auth?action=me');
    if (me?.email) {
      const session = getSession();
      write(KEYS.session, {
        name: me.name || session?.name || me.email.split('@')[0],
        email: me.email,
        role: me.role === 'admin' ? 'admin' : 'member'
      });
    }
  } catch (_) {
    me = null;
  }

  try {
    const cat = await apiFetch('/api/catalogue');
    if (Array.isArray(cat.disciplines)) write(KEYS.disciplines, cat.disciplines.map(normalizeDiscipline));
    if (Array.isArray(cat.videos)) write(KEYS.videos, cat.videos.map(normalizeVideo));
  } catch (_) {}

  try {
    const fav = await apiFetch('/api/favorites');
    if (Array.isArray(fav.favorites)) {
      write(KEYS.favorites, fav.favorites.map((f) => f.video_id || f).filter(Boolean));
    }
  } catch (_) {}

  try {
    const prog = await apiFetch('/api/progress');
    if (Array.isArray(prog.progress)) {
      const map = {};
      prog.progress.forEach((row) => {
        if (!row?.video_id) return;
        map[row.video_id] = {
          position: Number(row.position) || 0,
          completed: Boolean(row.completed),
          updated_at: row.updated_at || null
        };
      });
      write(KEYS.progress, map);
    }
  } catch (_) {}

  try {
    const notif = await apiFetch('/api/notifications');
    if (Array.isArray(notif.notifications)) write(KEYS.notifications, notif.notifications);
  } catch (_) {}

  return me;
}

/**
 * Reconcile localStorage favourites/progress with the server after an iframe
 * or another tab wrote to them directly. Pushes only the deltas.
 */
export async function reconcileRemote() {
  if (!authToken()) return;
  try {
    const [fav, prog] = await Promise.all([
      apiFetch('/api/favorites').catch(() => null),
      apiFetch('/api/progress').catch(() => null)
    ]);

    if (fav && Array.isArray(fav.favorites)) {
      const remote = new Set(fav.favorites.map((f) => f.video_id || f));
      const local = new Set(getFavoriteIds());
      for (const id of local) if (!remote.has(id)) pushRemote('/api/favorites', { video_id: id, favorite: true });
      for (const id of remote) if (!local.has(id)) pushRemote('/api/favorites', { video_id: id, favorite: false });
    }

    if (prog && Array.isArray(prog.progress)) {
      const remoteMap = {};
      prog.progress.forEach((row) => {
        if (row?.video_id) remoteMap[row.video_id] = row;
      });
      const localMap = getProgressMap();
      const ids = new Set([...Object.keys(remoteMap), ...Object.keys(localMap)]);
      ids.forEach((id) => {
        const l = localMap[id];
        const r = remoteMap[id];
        const lPos = l ? Number(l.position) || 0 : -1;
        const rPos = r ? Number(r.position) || 0 : -1;
        const lDone = l ? Boolean(l.completed) : false;
        const rDone = r ? Boolean(r.completed) : false;
        if (lPos === rPos && lDone === rDone) return;
        if (!l) {
          pushRemote('/api/progress', { video_id: id, position: 0, completed: false });
          return;
        }
        pushRemote('/api/progress', {
          video_id: id,
          position: l.position,
          duration: l.duration || 0,
          completed: l.completed
        });
      });
    }
  } catch (_) {}
}

/* -------------------------------- session ------------------------------- */

/**
 * The local demo session used by the frontend guard and page chrome.
 * @returns {{id:string|null,name:string,email:string,role:string}|null}
 */
export function getSession() {
  return read(KEYS.session, null);
}

/** Local-only session update used by the profile screen's role preview. */
export function setSession({ name, email, role = 'member' } = {}) {
  const session = {
    name: (name || PROFILE.full_name || 'Member').trim(),
    email: (email || PROFILE.email || '').trim(),
    role: role === 'admin' ? 'admin' : 'member'
  };
  write(KEYS.session, session);
  return session;
}

function clearSession() {
  remove(KEYS.session);
}

export function isAdmin() {
  return getSession()?.role === 'admin';
}

/**
 * End the session everywhere. Sign-out is purely local: drop every copy of the
 * session, then return to the sign-in screen so a different account can be
 * entered cleanly.
 */
export async function signOut() {
  clearSession();
  try {
    // The mock sign-in (login/signup) also writes these keys - clear them too.
    window.localStorage.removeItem('continuum_auth_user');
    window.sessionStorage.removeItem('continuum_session');
    window.sessionStorage.removeItem('continuum_auth_user');
  } catch (_) {
    // Storage can throw in private mode - sign-out must still succeed.
  }
  window.location.href = siteUrl('login/');
}

/* ---------------------------- profile details --------------------------- */

export function getProfile() {
  const stored = read(KEYS.profile, null);
  const session = getSession();
  const base = clone(PROFILE);
  if (session) {
    base.full_name = session.name || base.full_name;
    base.email = session.email || base.email;
    base.role = session.role || base.role;
  }
  return { ...base, ...(stored || {}) };
}

export function saveProfile(updates = {}) {
  const next = { ...getProfile(), ...updates };
  write(KEYS.profile, next);
  const session = getSession();
  if (session) {
    write(KEYS.session, {
      ...session,
      name: updates.full_name || session.name,
      email: updates.email || session.email
    });
  }
  return next;
}

/* -------------------------------- catalogue ----------------------------- */

/** Full discipline list, including any edits made in the admin console. */
export function listDisciplines() {
  const stored = read(KEYS.disciplines, null);
  const disciplines = Array.isArray(stored) ? stored : clone(DISCIPLINES);
  return disciplines.slice().sort(bySortOrder);
}

export function listVideos() {
  const stored = read(KEYS.videos, null);
  const videos = Array.isArray(stored) ? stored : clone(VIDEOS);
  return videos.slice().sort(bySortOrder);
}

/** Disciplines with their `videos` array attached - the shape every page expects. */
export function listCatalogue() {
  const videos = listVideos();
  return listDisciplines().map((discipline) => ({
    ...discipline,
    videos: videos.filter((video) => video.series_id === discipline.id || video.discipline_id === discipline.id)
  }));
}

export function getDiscipline(idOrSlug) {
  const match = listDisciplines().find(
    (d) => d.id === idOrSlug || d.slug === String(idOrSlug || '').toLowerCase()
  );
  if (!match) return null;
  return { ...match, videos: listVideos().filter((video) => video.series_id === match.id || video.discipline_id === match.id) };
}

export function getVideo(id) {
  return listVideos().find((video) => video.id === id) || null;
}

export function getDisciplineOf(video) {
  if (!video) return null;
  return listDisciplines().find((d) => d.id === video.series_id || d.id === video.discipline_id) || null;
}

/** Case-insensitive search across title, speaker, tag, discipline and series title. */
export function searchCatalog(rawQuery) {
  const q = String(rawQuery || '').trim().toLowerCase();
  if (!q) return { query: '', disciplines: listCatalogue(), videos: listVideos() };

  const disciplines = listCatalogue().filter((discipline) => {
    if (matches(discipline.title, q) || matches(discipline.goal, q) || matches(discipline.blurb, q)) return true;
    return discipline.videos.some((video) => videoMatches(video, q));
  });

  const videos = listVideos().filter((video) => {
    if (videoMatches(video, q)) return true;
    const discipline = getDisciplineOf(video);
    return matches(discipline?.title, q) || matches(video.discipline, q);
  });

  return { query: q, disciplines, videos };
}

function matches(value, q) {
  return String(value || '').toLowerCase().includes(q);
}

function videoMatches(video, q) {
  return matches(video.title, q) || matches(video.speaker, q) || matches(video.tag, q) || matches(video.highlight, q) || matches(video.discipline, q);
}

/** Highest-rated masterclasses, used by the Home "Top 10" row. */
export function topVideos(limit = 10) {
  return listVideos()
    .slice()
    .sort((a, b) => (b.rating || 0) - (a.rating || 0) || bySortOrder(a, b))
    .slice(0, limit);
}

/** Videos flagged as short insight clips, used by /clips/. */
export function clipVideos() {
  return listVideos().filter((video) => video.is_clip);
}

/** Videos flagged for the Home hero carousel. */
export function featuredVideos() {
  return listVideos().filter((video) => video.featured);
}

/* -------------------------------- favorites ----------------------------- */

export function getFavoriteIds() {
  const stored = read(KEYS.favorites, null);
  if (Array.isArray(stored)) return stored;
  write(KEYS.favorites, SEED_FAVORITES);
  return SEED_FAVORITES.slice();
}

export function isFavorite(videoId) {
  return getFavoriteIds().includes(videoId);
}

/** @returns {boolean} true when the video is in My List after the toggle. */
export function toggleFavorite(videoId) {
  const ids = getFavoriteIds();
  const index = ids.indexOf(videoId);
  if (index === -1) ids.push(videoId);
  else ids.splice(index, 1);
  write(KEYS.favorites, ids);
  pushRemote('/api/favorites', { video_id: videoId, favorite: index === -1 });
  return index === -1;
}

export function getFavoriteVideos() {
  const ids = getFavoriteIds();
  return ids
    .map((id) => getVideo(id))
    .filter(Boolean)
    .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
}

/* -------------------------------- progress ------------------------------ */

export function getProgressMap() {
  const stored = read(KEYS.progress, null);
  if (stored && typeof stored === 'object') return stored;
  write(KEYS.progress, SEED_PROGRESS);
  return clone(SEED_PROGRESS);
}

/** @returns {{position:number, completed:boolean, updated_at:string}} */
export function getProgress(videoId) {
  const entry = getProgressMap()[videoId];
  return entry || { position: 0, completed: false, updated_at: null };
}

export function saveProgress(videoId, position, completed = false, duration = 0) {
  const map = getProgressMap();
  const seconds = Math.max(0, Math.round(Number(position) || 0));
  map[videoId] = {
    position: seconds,
    duration: Number(duration) || map[videoId]?.duration || 0,
    completed: Boolean(completed),
    updated_at: new Date().toISOString()
  };
  write(KEYS.progress, map);
  pushRemote('/api/progress', {
    video_id: videoId,
    position: seconds,
    duration: map[videoId].duration,
    completed: map[videoId].completed
  });
  return map[videoId];
}

/** Most recently watched first, for Home and Library "Continue Watching". */
export function continueWatching() {
  const map = getProgressMap();
  return Object.entries(map)
    .filter(([, entry]) => entry && !entry.completed && entry.position > 0)
    .sort((a, b) => new Date(b[1].updated_at || 0) - new Date(a[1].updated_at || 0))
    .map(([id, entry]) => {
      const video = getVideo(id);
      return video ? { ...video, progress: entry } : null;
    })
    .filter(Boolean);
}

export function watchedVideos() {
  const map = getProgressMap();
  return Object.entries(map)
    .filter(([, entry]) => entry?.completed)
    .map(([id]) => getVideo(id))
    .filter(Boolean);
}

/* ------------------------------ notifications --------------------------- */

export function listNotifications() {
  const stored = read(KEYS.notifications, null);
  const items = Array.isArray(stored) ? stored : clone(NOTIFICATIONS);
  if (!Array.isArray(stored)) write(KEYS.notifications, items);
  return items
    .slice()
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

export function unreadCount() {
  return listNotifications().filter((item) => !item.read).length;
}

export function markAllRead() {
  const items = listNotifications().map((item) => ({ ...item, read: true }));
  write(KEYS.notifications, items);
  pushRemote('/api/notifications', { action: 'read_all' });
  return items;
}

/* ---------------------------- admin console ----------------------------- */

export function saveVideo(payload = {}) {
  const videos = listVideos();
  const existing = payload.id ? videos.find((video) => video.id === payload.id) : null;
  const title = String(payload.title || '').trim();
  if (!title) throw new Error('A masterclass needs a title.');

  const record = {
    ...(existing || {}),
    id: payload.id || `v-${Date.now().toString(36)}`,
    discipline_id: payload.discipline_id,
    title,
    speaker: payload.speaker || 'Executive Faculty',
    minutes: Number(payload.minutes) || 30,
    tag: payload.tag || '',
    highlight: payload.highlight || '',
    rating: Number(payload.rating) || 90,
    summary: payload.summary || '',
    outcomes: Array.isArray(payload.outcomes) ? payload.outcomes : [],
    video_url: payload.video_url || '',
    trailer_url: payload.trailer_url || '',
    thumbnail_url: payload.thumbnail_url || '',
    category: payload.category || '',
    is_clip: Boolean(payload.is_clip),
    featured: Boolean(payload.featured),
    sort_order: Number(payload.sort_order) || videos.length + 1
  };

  if (!record.discipline_id) throw new Error('Choose a discipline for this masterclass.');

  const index = videos.findIndex((v) => v.id === record.id);
  if (index === -1) videos.push(record);
  else videos[index] = { ...videos[index], ...record };

  write(KEYS.videos, videos);
  return record;
}

export function deleteVideo(id) {
  write(KEYS.videos, listVideos().filter((v) => v.id !== id));
}

/** Drop every local edit and start again from the shipped mock catalogue. */
export function resetLocalData() {
  [KEYS.favorites, KEYS.progress, KEYS.notifications, KEYS.disciplines, KEYS.videos, KEYS.profile].forEach(remove);
}

/* -------------------------------- helpers ------------------------------- */

/** Resolve an in-site path from any page depth (works from /index.html too). */
export function siteUrl(path = '') {
  return new URL(`../${String(path).replace(/^\//, '')}`, document.baseURI).href;
}

export function watchLink(videoId) {
  return siteUrl(`watch/?video=${encodeURIComponent(videoId)}`);
}

/** Turn an absolute /assets/... path into one that resolves from this page. */
export function assetUrl(path = '') {
  const value = String(path || '');
  if (/^(https?:)?\/\//.test(value) || value.startsWith('data:') || value.startsWith('blob:')) return value;
  return siteUrl(value.replace(/^\//, ''));
}

export function formatClock(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return hrs ? `${hrs}:${pad(mins)}:${pad(secs)}` : `${mins}:${pad(secs)}`;
}

export function formatWhen(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

/** Shared toast surface: any element with class .toast-msg (or data-toast). */
export function showToast(message, isError = false) {
  const toast = document.querySelector('.toast-msg') || document.querySelector('[data-toast]');
  if (!toast) return;
  toast.textContent = message;
  toast.style.borderColor = isError ? 'rgba(239,68,68,0.5)' : 'rgba(16,185,129,0.5)';
  toast.style.color = isError ? '#ff8b8b' : '#34d399';
  toast.classList.add('show');
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => toast.classList.remove('show'), 3200);
}
