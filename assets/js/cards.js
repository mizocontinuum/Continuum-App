/**
 * Shared catalogue card components.
 *
 * Extracted from home.js so Home, Disciplines, Explore, Search and Clips all
 * render identical poster artwork. Pure DOM builders only - no data fetching,
 * no innerHTML with untrusted data. Every card carries a data-video-id so a
 * single shared click handler can open the watch page.
 */
import { watchLink } from './store.js';

export const CARD_BACKGROUNDS = ['bg-slate-a', 'bg-slate-b', 'bg-slate-c'];

/** Watch-page URL for a video id, resolved from the current page. */
export function watchUrl(videoId) {
  return watchLink(videoId);
}

/**
 * Open the watch page when a card (any element with data-video-id) is clicked.
 * Inner controls (buttons / links) keep their own behaviour.
 */
export function attachCardNavigation(root = document) {
  root.addEventListener('click', (event) => {
    if (event.target.closest('button, a')) return;
    const card = event.target.closest('[data-video-id]');
    if (card && card.dataset.videoId) {
      window.location.href = watchUrl(card.dataset.videoId);
    }
  });
}

/**
 * The poster artwork shared by every card size (.thumb-fallback), i.e. the
 * brand logos, headline, speaker line and the play overlay.
 * @returns {HTMLElement} a .thumb-container
 */
export function createThumbArtwork(video, index = 0, { ranked = false } = {}) {
  const thumbnail = document.createElement('div');
  thumbnail.className = 'thumb-container';

  const fallback = document.createElement('div');
  fallback.className = `thumb-fallback ${CARD_BACKGROUNDS[index % CARD_BACKGROUNDS.length]}`;

  const logos = document.createElement('div');
  logos.className = 'thumb-top-logos';
  const brand = document.createElement('span');
  brand.className = 'thumb-mansmith';
  brand.textContent = 'CONTINUUM';
  const brandTail = document.createElement('span');
  brandTail.textContent = 'ACADEMY';
  logos.append(brand, brandTail);

  const headline = document.createElement('div');
  headline.className = ranked ? 'thumb-headline-ranked' : 'thumb-headline';
  headline.textContent = video.title || 'Untitled Masterclass';

  const speaker = document.createElement('div');
  speaker.className = 'thumb-speaker-info';
  const speakerName = document.createElement('b');
  speakerName.textContent = video.speaker || 'Executive Faculty';
  const duration = document.createElement('span');
  duration.textContent = `${Number(video.minutes) || 30} min`;
  speaker.append(speakerName, duration);

  const overlay = document.createElement('div');
  overlay.className = 'thumb-play-overlay';
  const playIcon = document.createElement('span');
  playIcon.className = 'play-pill-icon';
  playIcon.textContent = '▶';
  overlay.append(playIcon);

  fallback.append(logos, headline, speaker);
  thumbnail.append(fallback, overlay);
  return thumbnail;
}

/**
 * A catalogue video card. Ranked cards (Home Top 10) get the number gutter.
 * @returns {HTMLElement} .video-card or .ranked-video-card
 */
export function createVideoCard(video, index, ranked) {
  const card = document.createElement('article');
  card.className = ranked ? 'ranked-video-card' : 'video-card';
  if (video && video.id) card.dataset.videoId = video.id;

  if (ranked) {
    const rankWrap = document.createElement('div');
    rankWrap.className = 'rank-number-wrap';
    const rankNumber = document.createElement('span');
    rankNumber.className = 'rank-num';
    rankNumber.textContent = String(index + 1);
    rankWrap.append(rankNumber);
    card.append(rankWrap);
  }

  const body = document.createElement('div');
  if (ranked) body.className = 'ranked-body';

  body.append(createThumbArtwork(video, index, { ranked }));

  const meta = document.createElement('div');
  meta.className = 'card-meta';
  const tag = document.createElement('span');
  tag.className = 'discipline-tag';
  tag.textContent = video.tag || 'Masterclass';
  const caption = document.createElement('div');
  caption.className = 'card-caption';
  caption.textContent = video.title || 'Untitled Masterclass';
  meta.append(tag, caption);

  card.append(body, meta);
  return card;
}

/**
 * A discipline section: header (title + blurb) above a carousel of its videos.
 * @returns {HTMLElement} .content-row-section
 */
export function createDisciplineRow(discipline, rowIndex = 0) {
  const section = document.createElement('section');
  section.className = 'content-row-section';

  const header = document.createElement('div');
  header.className = 'section-header';

  const title = document.createElement('h2');
  title.className = 'section-title';
  title.textContent = discipline.title || discipline.name || 'Untitled Discipline';

  const subtitle = document.createElement('p');
  subtitle.className = 'section-subtitle';
  subtitle.textContent = discipline.blurb || discipline.goal || '';

  const row = document.createElement('div');
  row.className = 'cards-carousel';

  const videos = Array.isArray(discipline.videos) ? discipline.videos : [];
  if (videos.length) {
    row.replaceChildren(...videos.map((video, index) => createVideoCard(video, rowIndex + index, false)));
  } else {
    row.classList.add('cards-carousel--empty');
    const note = document.createElement('p');
    note.className = 'section-subtitle';
    note.textContent = 'No masterclasses in this discipline yet.';
    row.append(note);
  }

  header.append(title, subtitle);
  section.append(header, row);
  return section;
}
