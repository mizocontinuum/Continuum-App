/**
 * Explore Free Discipline page.
 *
 * A filter pill per discipline above one two-column grid of that discipline's
 * videos. Everything renders from store.js (the local catalogue), so the page
 * is complete the moment it loads - no network, no loading state.
 */
import { listCatalogue, siteUrl } from '../store.js';
import { createThumbArtwork, attachCardNavigation } from '../cards.js';
import { initPageChrome } from '../user-menu.js?v=21';

document.addEventListener('DOMContentLoaded', async () => {
  if (!(await initPageChrome())) return;

  const filter = document.getElementById('trackFilter');
  const sections = document.getElementById('trackSections');
  const empty = document.getElementById('exploreEmpty');
  const count = document.getElementById('trackCount');
  if (!filter || !sections) return;

  attachCardNavigation(sections);

  filter.addEventListener('click', (event) => {
    const button = event.target.closest('.filter-pill');
    if (!button) return;
    const id = button.dataset.disciplineId;
    filter.querySelectorAll('.filter-pill').forEach((pill) => {
      pill.setAttribute('aria-selected', String(pill === button));
    });
    sections.querySelectorAll('[data-discipline-id]').forEach((section) => {
      section.hidden = id !== 'all' && section.dataset.disciplineId !== id;
    });
  });

  const catalogue = listCatalogue();
  if (count) count.textContent = String(catalogue.length);

  const withVideos = catalogue.filter((discipline) => discipline.videos.length);
  if (!withVideos.length) {
    if (empty) empty.hidden = false;
    return;
  }

  filter.replaceChildren(
    pill('All', 'all', true),
    ...withVideos.map((discipline) => pill(discipline.title || 'Discipline', discipline.id, false))
  );
  sections.replaceChildren(...withVideos.map(trackSection));
});

function pill(label, id, selected) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'filter-pill';
  button.setAttribute('role', 'tab');
  button.setAttribute('aria-selected', String(selected));
  button.dataset.disciplineId = id;
  button.textContent = label;
  return button;
}

function trackSection(discipline) {
  const section = document.createElement('section');
  section.className = 'track-section';
  section.dataset.disciplineId = discipline.id;

  const head = document.createElement('div');
  head.className = 'track-head';

  const title = document.createElement('h2');
  title.className = 'track-title';
  title.textContent = discipline.title || 'Discipline';

  const goal = document.createElement('p');
  goal.className = 'track-goal';
  goal.textContent = discipline.goal || discipline.blurb || '';

  const link = document.createElement('a');
  link.className = 'track-link';
  link.href = siteUrl(`discipline/?id=${encodeURIComponent(discipline.id)}`);
  link.textContent = 'See all';

  head.append(title, goal, link);

  const grid = document.createElement('div');
  grid.className = 'track-grid';
  grid.replaceChildren(...discipline.videos.map((video, index) => expCard(video, index)));

  section.append(head, grid);
  return section;
}

function expCard(video, index) {
  const card = document.createElement('article');
  card.className = 'exp-card';
  if (video.id) card.dataset.videoId = video.id;

  const thumb = document.createElement('div');
  thumb.className = 'exp-thumb';
  thumb.append(createThumbArtwork(video, index));

  const tag = document.createElement('div');
  tag.className = 'exp-tag';
  tag.textContent = video.tag || 'Masterclass';

  const title = document.createElement('div');
  title.className = 'exp-title';
  title.textContent = video.title || 'Untitled Masterclass';

  card.append(thumb, tag, title);
  return card;
}
