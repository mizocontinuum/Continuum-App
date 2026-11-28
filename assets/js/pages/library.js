import { initPageChrome } from '../user-menu.js?v=6';
import { continueWatching, getFavoriteVideos } from '../store.js?v=3';
import { videoCard, bindFavButtons, emptyState, esc } from './member-ui.js';

document.addEventListener('DOMContentLoaded', async () => {
  const session = await initPageChrome();
  if (!session) return;

  const app = document.getElementById('app');
  const cw = continueWatching();
  const favs = getFavoriteVideos();

  app.innerHTML = `
    <h1>My Library</h1>
    <p class="sub">Everything you have saved and started — synced to your account.</p>
    <section class="group">
      <h2>Continue Watching</h2>
      <p class="gsub">Pick up where you left off.</p>
      <div class="grid" data-section="cw">${cw.length ? cw.map(videoCard).join('') : emptyState('Nothing in progress yet — start a masterclass from Home.')}</div>
    </section>
    <section class="group">
      <h2>My List</h2>
      <p class="gsub">Masterclasses you saved with ☆.</p>
      <div class="grid" data-section="favs">${favs.length ? favs.map(videoCard).join('') : emptyState('Your list is empty — tap ☆ on any masterclass to save it.')}</div>
    </section>`;

  bindFavButtons(app, () => setTimeout(() => location.reload(), 250));
});
