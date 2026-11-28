/**
 * Landing page (site root).
 *
 * A public, read-only preview of the Academy: a hero with the sign-in /
 * sign-up calls to action, a carousel of featured masterclasses and the full
 * discipline list. It reads straight from the static catalogue, so it renders
 * with no session and no network.
 *
 * This is the only page that lives at the site root, so it links with page
 * relative paths (e.g. `watch/?video=`) instead of store.js `siteUrl()`.
 */
import { featuredVideos, topVideos, listCatalogue, getSession } from '../store.js';
import { createThumbArtwork } from '../cards.js';

document.addEventListener('DOMContentLoaded', () => {
  renderPreview();
  renderDisciplines();
  wireSession();
});

/* --------------------------- Featured preview --------------------------- */

function renderPreview() {
  const row = document.getElementById('landingPreview');
  if (!row) return;

  let videos = featuredVideos();
  if (!videos.length) videos = topVideos(8);
  videos = videos.slice(0, 8);

  row.replaceChildren(...videos.map((video, index) => previewCard(video, index)));
}

function previewCard(video, index) {
  const card = document.createElement('article');
  card.className = 'landing-card';

  const meta = document.createElement('div');
  meta.className = 'card-meta';
  const tag = document.createElement('span');
  tag.className = 'discipline-tag';
  tag.textContent = video.tag || 'Masterclass';
  const caption = document.createElement('div');
  caption.className = 'card-caption';
  caption.textContent = video.title || 'Untitled Masterclass';
  meta.append(tag, caption);

  card.append(createThumbArtwork(video, index), meta);
  card.addEventListener('click', () => {
    if (video.id) window.location.href = `watch/?video=${encodeURIComponent(video.id)}`;
  });
  return card;
}

/* ----------------------------- Disciplines ------------------------------ */

function renderDisciplines() {
  const list = document.getElementById('landingDisciplines');
  if (!list) return;

  const disciplines = listCatalogue();
  list.replaceChildren(...disciplines.map(disciplineRow));
}

function disciplineRow(discipline) {
  const link = document.createElement('a');
  link.className = 'landing-discipline';
  link.href = `discipline/?id=${encodeURIComponent(discipline.id)}`;

  const text = document.createElement('div');
  const name = document.createElement('span');
  name.className = 'disc-name';
  name.textContent = discipline.title || discipline.name || 'Untitled Discipline';
  const goal = document.createElement('span');
  goal.className = 'disc-goal';
  goal.textContent = discipline.goal || discipline.blurb || '';
  text.append(name, goal);

  const count = document.createElement('span');
  count.className = 'disc-count';
  const total = Array.isArray(discipline.videos) ? discipline.videos.length : 0;
  count.textContent = `${total} ${total === 1 ? 'class' : 'classes'}`;

  link.append(text, count);
  return link;
}

/* ------------------------------ Session -------------------------------- */

function wireSession() {
  const session = getSession();
  if (!session) return;

  const primary = document.getElementById('landingPrimaryCta');
  if (primary) {
    primary.href = 'home/';
    primary.textContent = 'Continue to Home';
  }

  const hint = document.getElementById('landingSession');
  if (hint) {
    hint.hidden = false;
    hint.replaceChildren(
      document.createTextNode('Signed in as '),
      Object.assign(document.createElement('strong'), { textContent: session.name || session.email || 'Member' }),
      document.createTextNode('. Open the cockpit below.')
    );
  }
}
