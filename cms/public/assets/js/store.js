/**
 * Continuum Academy - application state.
 *
 * The catalogue, favourites, progress and notifications still render from the
 * shipped mock data (that data layer is not wired to the API yet). The session,
 * however, is real: it is minted by the server and only *mirrored* into
 * localStorage here so the chrome can paint synchronously. The mirror is never
 * trusted for access control - see initPageChrome() in user-menu.js, which
 * always re-verifies against GET /api/auth/session.
 *
 * It exposes:
 *
 *   session       - a cache of the server session (name/email/role)
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
  findDiscipline,
  videosFor,
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

/* -------------------------------- session ------------------------------- */

/**
 * The cached session - a mirror of the server session, used only to paint the
 * page chrome synchronously. It is never proof of authentication: the page
 * guard in user-menu.js re-verifies against the server on every load.
 * @returns {{id:string|null,name:string,email:string,role:string}|null}
 */
export function getSession() {
  return read(KEYS.session, null);
}

/**
 * Replace the cached session from a server user object
 * ({ id, email, full_name, role }). Pass null to drop it.
 */
export function cacheSession(user) {
  if (!user) {
    remove(KEYS.session);
    return null;
  }
  const session = {
    id: user.id || null,
    name: String(user.full_name || user.email || 'Member').trim(),
    email: String(user.email || '').trim(),
    role: user.role === 'admin' ? 'admin' : 'member'
  };
  write(KEYS.session, session);
  return session;
}

/**
 * Local-only mirror update, used by the profile screen's role preview. It never
 * grants access - the guard checks the server, not this cache.
 */
export function setSession({ name, email, role = 'member' } = {}) {
  const session = {
    name: (name || PROFILE.full_name || 'Member').trim(),
    email: (email || PROFILE.email || '').trim(),
    role: role === 'admin' ? 'admin' : 'member'
  };
  write(KEYS.session, session);
  return session;
}

export function clearSession() {
  remove(KEYS.session);
}

export function isAdmin() {
  return getSession()?.role === 'admin';
}

/**
 * End the session everywhere. The original /api/auth backend was retired when
 * the site moved under the Payload CMS (which now owns /api), so sign-out is
 * purely local: drop every mirror of the session, then return to the sign-in
 * screen so a different account can be entered cleanly.
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
    videos: videos.filter((video) => video.discipline_id === discipline.id)
  }));
}

export function getDiscipline(idOrSlug) {
  const match = listDisciplines().find(
    (d) => d.id === idOrSlug || d.slug === String(idOrSlug || '').toLowerCase()
  );
  if (!match) return null;
  return { ...match, videos: videosFor(match.id) };
}

export function getVideo(id) {
  return listVideos().find((video) => video.id === id) || null;
}

export function getDisciplineOf(video) {
  if (!video) return null;
  return listDisciplines().find((d) => d.id === video.discipline_id) || null;
}

/** Case-insensitive search across title, speaker, tag and discipline title. */
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
    return matches(discipline?.title, q);
  });

  return { query: q, disciplines, videos };
}

function matches(value, q) {
  return String(value || '').toLowerCase().includes(q);
}

function videoMatches(video, q) {
  return matches(video.title, q) || matches(video.speaker, q) || matches(video.tag, q) || matches(video.highlight, q);
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

export function saveProgress(videoId, position, completed = false) {
  const map = getProgressMap();
  const seconds = Math.max(0, Math.round(Number(position) || 0));
  map[videoId] = {
    position: seconds,
    completed: Boolean(completed),
    updated_at: new Date().toISOString()
  };
  write(KEYS.progress, map);
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
  return items;
}

/* ---------------------------- admin console ----------------------------- */

export function saveDiscipline(payload = {}) {
  const disciplines = listDisciplines();
  const title = String(payload.title || '').trim();
  if (!title) throw new Error('A discipline needs a title.');

  const record = {
    id: payload.id || `d-${Date.now().toString(36)}`,
    slug: payload.slug || slugify(title),
    title,
    name: title,
    goal: payload.goal || '',
    blurb: payload.blurb || '',
    sort_order: Number(payload.sort_order) || disciplines.length + 1
  };

  const index = disciplines.findIndex((d) => d.id === record.id);
  if (index === -1) disciplines.push(record);
  else disciplines[index] = { ...disciplines[index], ...record };

  write(KEYS.disciplines, disciplines);
  return record;
}

export function deleteDiscipline(id) {
  write(KEYS.disciplines, listDisciplines().filter((d) => d.id !== id));
  write(KEYS.videos, listVideos().filter((v) => v.discipline_id !== id));
}

export function saveVideo(payload = {}) {
  const videos = listVideos();
  const title = String(payload.title || '').trim();
  if (!title) throw new Error('A masterclass needs a title.');

  const record = {
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
  return siteUrl(String(path).replace(/^\//, ''));
}

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `discipline-${Date.now().toString(36)}`;
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

export { findDiscipline, videosFor };
