/**
 * Shared card renderer for the member pages (library, clips, watch sidebar).
 * Cards link to the watch page; the ☆ button toggles My List via store.js.
 */
import { getFavoriteIds, getProgressMap, getDisciplineOf, watchLink, assetUrl, toggleFavorite } from '../store.js?v=3';

export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function videoCard(video) {
  const fav = getFavoriteIds().includes(video.id);
  const prog = getProgressMap()[video.id];
  const pct = prog && !prog.completed && prog.position > 0 && video.minutes
    ? Math.min(96, Math.round((prog.position / (video.minutes * 60)) * 100))
    : 0;
  const discipline = getDisciplineOf(video);
  const disc = discipline?.title || video.tag || 'Masterclass';
  const thumb = video.thumbnail_url ? assetUrl(video.thumbnail_url) : assetUrl('assets/images/logo.png');
  const hasThumb = Boolean(video.thumbnail_url);
  const mins = video.minutes ? `${video.minutes} min` : '';
  const rating = video.rating ? `${video.rating}% match` : '';

  return `<a class="card" href="${watchLink(video.id)}">
    <div class="thumb ${hasThumb ? '' : 'thumb--fallback'}">
      <img src="${esc(thumb)}" alt="${esc(video.title)}" loading="lazy">
      <span class="badge-tag">${esc(disc)}</span>
      ${pct ? `<div class="prog"><i style="width:${pct}%"></i></div>` : ''}
      <button class="fav ${fav ? 'on' : ''}" data-fav="${esc(video.id)}" aria-label="${fav ? 'Remove from' : 'Add to'} My List" aria-pressed="${fav}">${fav ? '★' : '☆'}</button>
    </div>
    <div class="card-body">
      <div class="meta">
        <span class="badge">${esc(disc)}</span>
        <span>${rating ? `<span class="match">${esc(rating)}</span> ` : ''}${esc(mins)}</span>
      </div>
      <h3>${esc(video.title)}</h3>
      <p>${esc(video.speaker || video.summary || 'Continuum Academy Masterclass')}</p>
    </div>
  </a>`;
}

/** Delegate ☆ clicks inside a container to store.toggleFavorite, then re-render. */
export function bindFavButtons(container, onChange) {
  container.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-fav]');
    if (!btn) return;
    event.preventDefault();
    event.stopPropagation();
    const on = toggleFavorite(btn.dataset.fav);
    btn.classList.toggle('on', on);
    btn.textContent = on ? '★' : '☆';
    btn.setAttribute('aria-pressed', String(on));
    onChange?.(on);
  });
}

export function emptyState(message) {
  return `<div class="empty">${esc(message)}</div>`;
}
