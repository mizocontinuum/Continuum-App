/**
 * GET /api/catalog
 *   (no params) -> the whole catalogue: { disciplines, videos, speakers }
 *   ?q=...      -> the same three lists, narrowed to matches
 *   ?id=...     -> { disciplines: [one], videos: its videos, speakers: all }
 *
 * The user's own access token is used for the PostgREST call, so Supabase RLS
 * remains in force on top of the sign-in check here.
 *
 * Search is performed in JavaScript over the full catalogue rather than through
 * PostgREST `or=(...ilike...)` filters. The catalogue is a few dozen rows, and
 * doing it here avoids two real hazards: PostgREST filter escaping (a `,` or
 * `)` inside a search term changes the query's meaning) and the fact that a
 * single `or=` cannot also match on a video's speaker name or its tag array.
 */
import { json, fail, methodNotAllowed, query, apiHandler } from '../server/lib/http.js';
import { resolveSession } from '../server/lib/session.js';
import { toDiscipline, toSpeaker, toVideo } from '../server/lib/map.js';
import * as sb from '../server/lib/supabase.js';

const ORDER = 'order=sort_order.asc,created_at.asc';
const VIDEOS = `select=*,speakers(name)&${ORDER}`;

/** Case-insensitive substring test against a possibly-null column. */
function matches(value, needle) {
  return String(value || '').toLowerCase().includes(needle);
}

/**
 * Narrow the catalogue to a search term. A discipline is kept when it matches
 * itself or when any of its videos match, so a hit inside a track still renders
 * with the track around it.
 */
function search(catalog, rawQuery) {
  const needle = String(rawQuery || '').trim().toLowerCase();
  if (!needle) return catalog;

  const disciplines = catalog.disciplines.filter(
    (discipline) =>
      matches(discipline.name, needle) ||
      matches(discipline.goal, needle) ||
      matches(discipline.description, needle)
  );
  const videos = catalog.videos.filter(
    (video) =>
      matches(video.title, needle) ||
      matches(video.subtitle, needle) ||
      matches(video.description, needle) ||
      matches(video.speakerName, needle) ||
      video.tags.some((tag) => matches(tag, needle))
  );
  const speakers = catalog.speakers.filter(
    (speaker) =>
      matches(speaker.name, needle) ||
      matches(speaker.title, needle) ||
      matches(speaker.company, needle)
  );

  return {
    disciplines: catalog.disciplines.filter(
      (discipline) =>
        disciplines.includes(discipline) ||
        videos.some((video) => video.disciplineId === discipline.id)
    ),
    videos,
    speakers
  };
}

async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, 'GET');
  if (!sb.isConfigured()) return fail(res, 500, 'Server data layer is not configured.');

  const session = await resolveSession(req, res);
  if (!session) return fail(res, 401, 'Please sign in to view the catalog.');

  const token = session.accessToken;
  const { id, q } = query(req);

  // --- One discipline: narrow the videos, keep every speaker so the returned
  //     videos can still have their speaker resolved by the client. ----------
  if (id) {
    const enc = encodeURIComponent(id);
    const [oneDiscipline, oneVideos, allSpeakers] = await Promise.all([
      sb.restSelect('disciplines', `select=*&id=eq.${enc}`, token),
      sb.restSelect('videos', `${VIDEOS}&discipline_id=eq.${enc}`, token),
      sb.restSelect('speakers', `select=*&${ORDER}`, token)
    ]);

    if (!oneDiscipline.ok || !oneVideos.ok || !allSpeakers.ok) {
      console.error('Discipline query failed:', {
        discipline: oneDiscipline.status,
        videos: oneVideos.status,
        speakers: allSpeakers.status
      });
      return fail(res, 502, 'Could not load the discipline.');
    }

    const row = (oneDiscipline.data || [])[0];
    if (!row) return fail(res, 404, 'Discipline not found.');

    return json(res, 200, {
      disciplines: [toDiscipline(row)],
      videos: (oneVideos.data || []).map(toVideo),
      speakers: (allSpeakers.data || []).map(toSpeaker)
    });
  }

  // --- Full catalogue, optionally filtered ---------------------------------
  const [disciplineResult, videoResult, speakerResult] = await Promise.all([
    sb.restSelect('disciplines', `select=*&${ORDER}`, token),
    sb.restSelect('videos', VIDEOS, token),
    sb.restSelect('speakers', `select=*&${ORDER}`, token)
  ]);

  if (!disciplineResult.ok || !videoResult.ok || !speakerResult.ok) {
    console.error('Catalog query failed:', {
      disciplines: disciplineResult.status,
      videos: videoResult.status,
      speakers: speakerResult.status
    });
    return fail(res, 502, 'Could not load the catalog. Check the Supabase tables and RLS policies.');
  }

  const catalog = {
    disciplines: (disciplineResult.data || []).map(toDiscipline),
    videos: (videoResult.data || []).map(toVideo),
    speakers: (speakerResult.data || []).map(toSpeaker)
  };

  const { disciplines, videos, speakers } = search(catalog, q);
  return json(res, 200, { disciplines, videos, speakers });
}

export default apiHandler(handler);
