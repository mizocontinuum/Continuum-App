import { initPageChrome } from '../user-menu.js?v=6';
import { clipVideos, listDisciplines } from '../store.js?v=3';
import { videoCard, bindFavButtons, emptyState } from './member-ui.js';

document.addEventListener('DOMContentLoaded', async () => {
  const session = await initPageChrome();
  if (!session) return;

  const app = document.getElementById('app');
  const clips = clipVideos();
  const byDiscipline = new Map(listDisciplines().map((d) => [d.id, d.title || d.name || d.id]));

  // Group clips under their discipline when possible.
  const groups = new Map();
  clips.forEach((v) => {
    const key = byDiscipline.get(v.discipline_id) || v.tag || 'Highlights';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(v);
  });

  const html = [...groups.entries()].map(([name, items]) => `
    <section class="group">
      <h2>${name}</h2>
      <p class="gsub">Short insight clips.</p>
      <div class="grid">${items.map(videoCard).join('')}</div>
    </section>`).join('');

  app.innerHTML = `
    <h1>Clips</h1>
    <p class="sub">Bite-sized highlights from the masterclass catalogue.</p>
    ${html || emptyState('No clips yet — mark a masterclass as a highlight in Admin Studio.')}`;

  bindFavButtons(app, () => setTimeout(() => location.reload(), 250));
});
