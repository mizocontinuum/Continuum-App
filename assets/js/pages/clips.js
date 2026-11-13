/**
 * Clips page: a full-screen vertical feed with one clip per catalogue
 * masterclass. Tapping a clip (or its CTA) opens the watch page, and Save
 * toggles the clip in My List via the local store.
 *
 * The feed is built entirely from the static catalogue - no network calls.
 */
import { clipVideos, listVideos, isFavorite, toggleFavorite } from '../store.js';
import { attachCardNavigation, watchUrl } from '../cards.js';
import { initPageChrome } from '../user-menu.js';

/** Slate gradients for the poster area, cycled for visual variety. */
const GRADIENTS = [
  'linear-gradient(160deg, #1c2833 0%, #0b1117 72%)',
  'linear-gradient(160deg, #16232f 0%, #0b1117 72%)',
  'linear-gradient(160deg, #10202b 0%, #0b1117 72%)'
];

document.addEventListener('DOMContentLoaded', () => {
  const session = initPageChrome();
  if (!session) return; // guard already redirected

  const feed = document.getElementById('feed');
  if (!feed) return;

  attachCardNavigation(feed);

  const clips = clipVideos();
  const videos = clips.length ? clips : listVideos();
  if (!videos.length) {
    feed.replaceChildren(note('No clips to show yet. New masterclasses will appear here soon.'));
    return;
  }

  feed.replaceChildren(...videos.map((video, index) => clip(video, index)));
  observeActive(feed);
});

/* ------------------------------- Build ---------------------------------- */

function clip(video, index) {
  const article = document.createElement('article');
  article.className = 'clip';
  if (video.id) article.dataset.videoId = video.id;
  article.style.setProperty('--g', GRADIENTS[index % GRADIENTS.length]);

  const bars = document.createElement('div');
  bars.className = 'bars';
  bars.append(document.createElement('span'));

  const art = document.createElement('div');
  art.className = 'art';
  const monogram = document.createElement('i');
  monogram.textContent = initials(video);
  art.append(monogram);

  const shade = document.createElement('div');
  shade.className = 'shade';

  const top = document.createElement('div');
  top.className = 'top';
  const brand = document.createElement('b');
  brand.textContent = 'Continuum Clips';
  const tag = document.createElement('span');
  tag.className = 'tag';
  tag.textContent = video.tag || 'Masterclass';
  top.append(brand, tag);

  const rail = document.createElement('div');
  rail.className = 'rail';
  rail.append(
    railButton('save', '＋', 'Save', (btn) => toggleSave(video, btn)),
    railButton('share', '↗', 'Share', () => share(video))
  );

  const info = document.createElement('div');
  info.className = 'info';

  const eyebrow = document.createElement('div');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = video.tag || 'Masterclass';

  const title = document.createElement('h2');
  title.textContent = video.title || 'Untitled Masterclass';

  const meta = document.createElement('div');
  meta.className = 'meta';
  const speaker = document.createElement('b');
  speaker.textContent = video.speaker || 'Executive Faculty';
  const dot = document.createElement('span');
  dot.textContent = '·';
  const minutes = document.createElement('span');
  minutes.textContent = `${Number(video.minutes) || 30} min`;
  const quality = document.createElement('u');
  quality.textContent = 'HD';
  meta.append(speaker, dot, minutes, quality);

  const cta = document.createElement('button');
  cta.type = 'button';
  cta.className = 'cta';
  cta.textContent = '▶ Watch now';
  cta.addEventListener('click', () => { window.location.href = watchUrl(video.id); });

  const sub = document.createElement('div');
  sub.className = 'sub';
  sub.textContent = 'Swipe up for the next clip';

  info.append(eyebrow, title, meta, cta, sub);
  article.append(bars, art, shade, top, rail, info);

  const saveBtn = rail.querySelector('[data-action="save"]');
  if (saveBtn && video.id) {
    const on = isFavorite(video.id);
    saveBtn.classList.toggle('on', on);
    const icon = saveBtn.querySelector('em');
    if (icon) icon.textContent = on ? '✓' : '＋';
  }
  return article;
}

function railButton(action, glyph, label, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.action = action;
  const icon = document.createElement('em');
  icon.textContent = glyph;
  button.append(icon, document.createTextNode(label));
  button.addEventListener('click', () => onClick(button));
  return button;
}

function note(message) {
  const p = document.createElement('p');
  p.className = 'sub';
  p.style.padding = '48px 24px';
  p.textContent = message;
  return p;
}

function initials(video) {
  const words = String(video.title || 'Continuum').trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0].toUpperCase()).join('') || 'CA';
}

/* ------------------------------- Actions -------------------------------- */

function toggleSave(video, button) {
  if (!video || !video.id) return;
  const added = toggleFavorite(video.id);
  button.classList.toggle('on', added);
  const icon = button.querySelector('em');
  if (icon) icon.textContent = added ? '✓' : '＋';
  toast(added ? 'Added to My List' : 'Removed from My List');
}

async function share(video) {
  const url = watchUrl(video.id);
  const payload = { title: video.title || 'Continuum Academy', text: video.title || '', url };
  try {
    if (navigator.share) {
      await navigator.share(payload);
      return;
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast('Link copied to clipboard');
    }
  } catch (_) {
    /* the user dismissed the share sheet - nothing to do */
  }
}

/* ------------------------------- Effects -------------------------------- */

/** Mark the clip filling the viewport and drive its progress bar. */
function observeActive(feed) {
  const clips = feed.querySelectorAll('.clip');
  if (!('IntersectionObserver' in window) || !clips.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const bar = entry.target.querySelector('.bars span');
      if (!bar) return;
      if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
        bar.style.transition = 'width 14s linear';
        bar.style.width = '100%';
      } else {
        bar.style.transition = 'none';
        bar.style.width = '0';
      }
    });
  }, { root: feed, threshold: [0, 0.6, 1] });

  clips.forEach((item) => observer.observe(item));
}

function toast(message, isError = false) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.style.borderColor = isError ? '#ef4444' : 'var(--accent)';
  el.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => el.classList.remove('show'), 2600);
}
