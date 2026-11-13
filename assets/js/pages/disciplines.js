/**
 * Disciplines page: one section per discipline, rendered from the local
 * catalogue in store.js. No fetching, no loading state.
 */
import { listCatalogue } from '../store.js';
import { createDisciplineRow, attachCardNavigation } from '../cards.js';
import { initPageChrome } from '../user-menu.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (!(await initPageChrome())) return;

  const list = document.getElementById('disciplineList');
  if (!list) return;

  attachCardNavigation(list);

  const catalogue = listCatalogue();
  if (!catalogue.length) {
    list.replaceChildren(note('No disciplines yet. New masterclasses will appear here soon.'));
    return;
  }

  list.replaceChildren(...catalogue.map((discipline, index) => createDisciplineRow(discipline, index * 3)));
});

function note(message) {
  const p = document.createElement('p');
  p.className = 'library-empty';
  p.textContent = message;
  return p;
}
