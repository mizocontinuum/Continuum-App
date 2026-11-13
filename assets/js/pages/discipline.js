/**
 * Single discipline page.
 *
 * Reads ?id=, resolves the discipline from the local catalogue and renders its
 * hero (badge, name, goal, blurb, counts, CTA) plus a two-column video grid.
 */
import { getDiscipline } from '../store.js';
import { createThumbArtwork, attachCardNavigation, watchUrl } from '../cards.js';
import { initPageChrome } from '../user-menu.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (!(await initPageChrome())) return;

  const body = document.getElementById('disciplineBody');
  const missing = document.getElementById('disciplineMissing');
  if (!body) return;

  attachCardNavigation(body);

  const id = new URLSearchParams(window.location.search).get('id');
  const discipline = id ? getDiscipline(id) : null;

  if (!discipline) {
    if (missing) missing.hidden = false;
    return;
  }

  body.replaceChildren(hero(discipline), videosSection(discipline));
});

function hero(discipline) {
  const videos = Array.isArray(discipline.videos) ? discipline.videos : [];
  const totalMinutes = videos.reduce((sum, video) => sum + (Number(video.minutes) || 0), 0);

  const section = document.createElement('section');
  section.className = 'disc-hero';

  const badge = document.createElement('span');
  badge.className = 'disc-badge';
  badge.append(
    icon('<rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect>'),
    document.createTextNode('Discipline')
  );

  const name = document.createElement('h1');
  name.className = 'disc-name';
  name.textContent = discipline.title || 'Untitled Discipline';

  const goal = document.createElement('p');
  goal.className = 'disc-goal';
  goal.textContent = discipline.goal || '';

  const blurb = document.createElement('p');
  blurb.className = 'disc-blurb';
  blurb.textContent = discipline.blurb || '';

  const stats = document.createElement('div');
  stats.className = 'disc-stats';
  stats.append(
    stat(icon('<circle cx="12" cy="12" r="9"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon>'), String(videos.length), videos.length === 1 ? 'masterclass' : 'masterclasses'),
    stat(icon('<circle cx="12" cy="12" r="9"></circle><polyline points="12 7 12 12 15 14"></polyline>'), String(totalMinutes), 'minutes total')
  );

  section.append(badge, name);
  if (goal.textContent) section.append(goal);
  if (blurb.textContent) section.append(blurb);
  section.append(stats);

  if (videos.length) {
    const start = document.createElement('button');
    start.type = 'button';
    start.className = 'disc-start';
    start.append(icon('<polygon points="5 3 19 12 5 21 5 3"></polygon>'), document.createTextNode('Start learning'));
    start.addEventListener('click', () => {
      window.location.href = watchUrl(videos[0].id);
    });
    section.append(start);
  }

  return section;
}

function videosSection(discipline) {
  const videos = Array.isArray(discipline.videos) ? discipline.videos : [];

  const section = document.createElement('section');

  const head = document.createElement('div');
  head.className = 'disc-videos-head';
  const title = document.createElement('h2');
  title.className = 'disc-videos-title';
  title.textContent = 'Masterclasses';
  const count = document.createElement('span');
  count.className = 'disc-videos-count';
  count.textContent = `${videos.length} ${videos.length === 1 ? 'video' : 'videos'}`;
  head.append(title, count);

  const grid = document.createElement('div');
  grid.className = 'disc-grid';
  if (videos.length) {
    grid.replaceChildren(...videos.map((video, index) => discCard(video, index)));
  } else {
    const empty = document.createElement('p');
    empty.className = 'disc-missing';
    empty.textContent = 'No masterclasses in this discipline yet.';
    grid.append(empty);
  }

  section.append(head, grid);
  return section;
}

function discCard(video, index) {
  const card = document.createElement('article');
  card.className = 'disc-card';
  if (video.id) card.dataset.videoId = video.id;

  const thumb = document.createElement('div');
  thumb.className = 'disc-thumb';
  thumb.append(createThumbArtwork(video, index));

  const tag = document.createElement('div');
  tag.className = 'disc-card-tag';
  tag.textContent = video.tag || 'Masterclass';

  const title = document.createElement('div');
  title.className = 'disc-card-title';
  title.textContent = video.title || 'Untitled Masterclass';

  const speaker = document.createElement('div');
  speaker.className = 'disc-card-speaker';
  speaker.textContent = `${video.speaker || 'Executive Faculty'} · ${Number(video.minutes) || 30} min`;

  card.append(thumb, tag, title, speaker);
  return card;
}

function stat(iconEl, value, label) {
  const wrap = document.createElement('span');
  wrap.className = 'disc-stat';
  const strong = document.createElement('b');
  strong.textContent = value;
  wrap.append(iconEl, strong, document.createTextNode(label));
  return wrap;
}

/** Build a tiny inline SVG from a trusted inner-markup string. */
function icon(inner) {
  const wrap = document.createElement('div');
  wrap.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  return wrap.firstElementChild;
}
