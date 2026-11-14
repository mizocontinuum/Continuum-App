/**
 * Database row -> API response mappers.
 *
 * The tables use snake_case columns; both clients are typed in camelCase
 * (`Video`, `Discipline`, `Speaker`, `UserProfile`, `AppNotification` in
 * types/index.ts). Doing the conversion here means exactly one file knows the
 * column names, so the website and the mobile app cannot drift apart, and a
 * column rename never leaks into two codebases.
 */

/** PostgREST can hand back numeric/decimal as a string, so coerce explicitly. */
function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Coerce a timestamptz to epoch milliseconds (the clients' convention). */
function toEpochMs(value) {
  if (!value) return 0;
  const t = Date.parse(value);
  return Number.isFinite(t) ? t : 0;
}

export function toDiscipline(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    goal: row.goal || '',
    description: row.description || '',
    emoji: row.emoji || '',
    accent: row.accent || '',
    accentDeep: row.accent_deep || '',
    sortOrder: toNumber(row.sort_order)
  };
}

export function toSpeaker(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    title: row.title || '',
    company: row.company || '',
    bio: row.bio || '',
    avatarUrl: row.avatar_url || '',
    sortOrder: toNumber(row.sort_order)
  };
}

/**
 * A video row. When the caller selected `select=*,speakers(name)` the embedded
 * relation fills `speakerName` without a second round-trip; without it the
 * field is simply empty and the client resolves the name from its speaker list.
 */
export function toVideo(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || '',
    description: row.description || '',
    disciplineId: row.discipline_id,
    speakerId: row.speaker_id || '',
    // Embedded relation from `select=*,speakers(name)`.
    speakerName: row.speakers?.name || '',
    durationSec: toNumber(row.duration_sec),
    posterUrl: row.poster_url || '',
    videoUrl: row.video_url || '',
    tags: Array.isArray(row.tags) ? row.tags : [],
    year: row.year === null || row.year === undefined ? null : toNumber(row.year),
    rating: row.rating === null || row.rating === undefined ? null : toNumber(row.rating),
    views: toNumber(row.views),
    isClip: Boolean(row.is_clip),
    featured: Boolean(row.featured),
    sortOrder: toNumber(row.sort_order)
  };
}

/* ---------------------------------------------------------------------------
 * Client body -> database row (the reverse direction)
 *
 * Both clients post camelCase (the shared types in types/index.ts are
 * camelCase), so the inbound conversion lives here too: this file remains the
 * only place that spells a column name, in either direction.
 *
 * A field the client omitted is skipped entirely rather than sent as null, so
 * a partial post never blanks a column the caller did not mention (and so
 * column defaults apply on insert).
 * ------------------------------------------------------------------------ */

const DISCIPLINE_COLUMNS = {
  id: 'id',
  name: 'name',
  goal: 'goal',
  description: 'description',
  emoji: 'emoji',
  accent: 'accent',
  accentDeep: 'accent_deep',
  sortOrder: 'sort_order'
};

const VIDEO_COLUMNS = {
  id: 'id',
  disciplineId: 'discipline_id',
  speakerId: 'speaker_id',
  title: 'title',
  subtitle: 'subtitle',
  description: 'description',
  durationSec: 'duration_sec',
  posterUrl: 'poster_url',
  videoUrl: 'video_url',
  tags: 'tags',
  year: 'year',
  rating: 'rating',
  views: 'views',
  isClip: 'is_clip',
  featured: 'featured',
  sortOrder: 'sort_order'
};

function toRow(body, columns) {
  const row = {};
  for (const [field, column] of Object.entries(columns)) {
    if (body[field] !== undefined) row[column] = body[field];
  }
  return row;
}

export function disciplineToRow(body) {
  return toRow(body || {}, DISCIPLINE_COLUMNS);
}

export function videoToRow(body) {
  return toRow(body || {}, VIDEO_COLUMNS);
}
