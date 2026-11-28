import { initPageChrome } from '../user-menu.js?v=6';
import {
  getVideo,
  getDisciplineOf,
  getFavoriteIds,
  toggleFavorite,
  getProgress,
  saveProgress,
  listVideos,
  assetUrl,
  formatClock,
  showToast
} from '../store.js?v=3';
import { esc } from './member-ui.js';

document.addEventListener('DOMContentLoaded', async () => {
  const session = await initPageChrome();
  if (!session) return;

  const app = document.getElementById('app');
  const id = new URLSearchParams(location.search).get('video');
  const video = id ? getVideo(id) : null;

  if (!video) {
    app.innerHTML = `<h1>Masterclass not found</h1><p class="sub">It may have been removed from the catalogue.</p><p><a href="../home/index.html" style="color:#2ea8ff">← Back to Home</a></p>`;
    return;
  }

  const discipline = getDisciplineOf(video);
  const fav = getFavoriteIds().includes(video.id);
  const progress = getProgress(video.id);
  const related = listVideos()
    .filter((v) => v.discipline_id === video.discipline_id && v.id !== video.id)
    .slice(0, 6);

  app.innerHTML = `
    <div class="watch-layout">
      <div>
        <div class="player-box">
          <video id="player" controls playsinline ${video.video_url ? `src="${esc(assetUrl(video.video_url))}"` : ''}></video>
          <p class="player-note" id="playerNote">${video.video_url ? '' : 'No video file attached yet — add one in Admin Studio or upload via the media pipeline.'}</p>
        </div>
        <div class="watch-info" style="margin-top:22px">
          <h1>${esc(video.title)}</h1>
          <div class="chips">
            ${discipline ? `<span class="chip">${esc(discipline.title)}</span>` : ''}
            ${video.tag ? `<span class="chip">${esc(video.tag)}</span>` : ''}
            ${video.minutes ? `<span class="chip">${video.minutes} min</span>` : ''}
            ${video.rating ? `<span class="chip match">${video.rating}% match</span>` : ''}
            ${video.highlight ? `<span class="chip">${esc(video.highlight)}</span>` : ''}
          </div>
          <div class="actions">
            <button class="btn primary" id="favBtn" data-fav="${esc(video.id)}" aria-pressed="${fav}">${fav ? '★ Saved' : '☆ Save to My List'}</button>
            <a class="btn ghost" href="../library/index.html">My Library</a>
          </div>
          ${video.speaker ? `<p><b>${esc(video.speaker)}</b></p>` : ''}
          ${video.summary ? `<p>${esc(video.summary)}</p>` : ''}
          ${Array.isArray(video.outcomes) && video.outcomes.length ? `<h2>What you will take away</h2><ul class="outcomes">${video.outcomes.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>` : ''}
        </div>
      </div>
      <aside class="side-card">
        <h3>More in ${esc(discipline?.title || 'this discipline')}</h3>
        ${related.length ? related.map((v) => `
          <a class="mini" href="?video=${encodeURIComponent(v.id)}" style="text-decoration:none;color:inherit">
            <div><b>${esc(v.title)}</b><span>${v.minutes || 0} min${v.rating ? ` · ${v.rating}%` : ''}</span></div>
          </a>`).join('') : '<p style="font-size:.85rem;color:#7fb4eb">No related masterclasses yet.</p>'}
      </aside>
    </div>`;

  // Favorite toggle
  const favBtn = document.getElementById('favBtn');
  favBtn.addEventListener('click', () => {
    const on = toggleFavorite(video.id);
    favBtn.textContent = on ? '★ Saved' : '☆ Save to My List';
    favBtn.classList.toggle('on', on);
    favBtn.setAttribute('aria-pressed', String(on));
    showToast(on ? 'Saved to My List.' : 'Removed from My List.');
  });
  favBtn.classList.toggle('on', fav);

  // Progress tracking
  const player = document.getElementById('player');
  const note = document.getElementById('playerNote');
  let tick = 0;
  const persist = (force = false) => {
    if (!player.duration || isNaN(player.duration)) return;
    if (!force && ++tick % 5 !== 0) return;
    saveProgress(video.id, player.currentTime, player.ended || player.currentTime >= player.duration - 5, player.duration);
  };
  player.addEventListener('timeupdate', () => persist(false));
  player.addEventListener('ended', () => persist(true));
  window.addEventListener('pagehide', () => persist(true));

  if (!video.video_url) {
    // Demo playback: advance a simulated clock so progress still records.
    let pos = progress.position || 0;
    const total = (video.minutes || 30) * 60;
    note.textContent = `Demo playback — ${formatClock(pos)} of ${formatClock(total)} saved. Add a video file in Admin Studio for real playback.`;
    const timer = setInterval(() => {
      pos += 1;
      if (pos >= total) {
        clearInterval(timer);
        saveProgress(video.id, total, true, total);
        note.textContent = 'Demo complete — progress saved.';
        return;
      }
      if (pos % 5 === 0) saveProgress(video.id, pos, false, total);
    }, 1000);
    window.addEventListener('pagehide', () => { clearInterval(timer); saveProgress(video.id, pos, false, total); });
  } else if (progress.position > 5 && !progress.completed) {
    player.addEventListener('loadedmetadata', function once() {
      player.currentTime = progress.position;
      player.removeEventListener('loadedmetadata', once);
    });
  }
});
