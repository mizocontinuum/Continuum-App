/**
 * My Library.
 *
 * Two views over the local store - My List (favorites) and Continue Watching
 * (progress) - with lifetime stats and a search + discipline filter. Every read
 * comes from store.js, so the page never waits on a network round-trip.
 */
import {
  getFavoriteVideos,
  getProgressMap,
  getVideo,
  listDisciplines,
  watchLink
} from '../store.js';
import { createThumbArtwork, attachCardNavigation } from '../cards.js';
import { initPageChrome } from '../user-menu.js?v=21';

const state = { view: 'list', query: '', disciplineId: '' };

document.addEventListener('DOMContentLoaded', async () => {
  if (!(await initPageChrome())) return;

  const els = {
    statGrid: document.getElementById('statGrid'),
    tabs: document.getElementById('libTabs'),
    search: document.getElementById('libSearch'),
    filter: document.getElementById('libFilter'),
    list: document.getElementById('libraryList'),
    empty: document.getElementById('libEmpty'),
    emptyText: document.getElementById('libEmptyText'),
    reset: document.getElementById('libReset')
  };
  if (!els.list) return;

  const disciplines = listDisciplines();
  const disciplineNameById = new Map(
    disciplines.map((discipline) => [discipline.id, discipline.title || 'Discipline'])
  );

  attachCardNavigation(els.list);
  els.list.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const card = event.target.closest('[data-video-id]');
    if (!card) return;
    event.preventDefault();
    window.location.href = watchLink(card.dataset.videoId);
  });

  buildStats(els.statGrid);
  buildTabs(els.tabs);
  buildFilter(els.filter, disciplines);

  if (els.search) {
    els.search.addEventListener('input', () => {
      state.query = els.search.value.trim();
      render(els, disciplineNameById);
    });
  }
  if (els.filter) {
    els.filter.addEventListener('change', () => {
      state.disciplineId = els.filter.value;
      render(els, disciplineNameById);
    });
  }
  if (els.reset) {
    els.reset.addEventListener('click', () => {
      state.query = '';
      state.disciplineId = '';
      if (els.search) els.search.value = '';
      if (els.filter) els.filter.value = '';
      render(els, disciplineNameById);
    });
  }

  render(els, disciplineNameById);
});

/* ------------------------------- data ----------------------------------- */

function progressEntries() {
  return Object.entries(getProgressMap())
    .map(([id, entry]) => ({ video: getVideo(id), position: entry.position, completed: entry.completed, updated_at: entry.updated_at }))
    .filter((entry) => entry.video)
    .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
}

function currentEntries() {
  const query = state.query.toLowerCase();
  const list =
    state.view === 'list'
      ? getFavoriteVideos().map((video) => ({ video, position: 0, completed: false }))
      : progressEntries();

  return list.filter((entry) => {
    const video = entry.video;
    if (state.disciplineId && video.discipline_id !== state.disciplineId) return false;
    if (!query) return true;
    return `${video.title || ''} ${video.speaker || ''} ${video.tag || ''}`.toLowerCase().includes(query);
  });
}

/* ------------------------------- build ---------------------------------- */

function buildStats(grid) {
  if (!grid) return;

  const progress = progressEntries();
  const inProgress = progress.filter((entry) => !entry.completed && Number(entry.position) > 0).length;
  const totalMinutes = progress.reduce((sum, entry) => sum + Math.round((Number(entry.position) || 0) / 60), 0);

  grid.replaceChildren(
    statCard('In Progress', icon('<circle cx="12" cy="12" r="9"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon>'), String(inProgress), 'in progress'),
    statCard('Total Watch Time', icon('<circle cx="12" cy="12" r="9"></circle><polyline points="12 7 12 12 15 14"></polyline>'), String(totalMinutes), 'min watched')
  );
}

function statCard(label, iconEl, value, suffix) {
  const card = document.createElement('div');
  card.className = 'stat-card';

  const head = document.createElement('div');
  head.className = 'stat-head';
  const labelEl = document.createElement('span');
  labelEl.className = 'stat-label';
  labelEl.textContent = label;
  const iconWrap = document.createElement('span');
  iconWrap.className = 'stat-icon';
  iconWrap.append(iconEl);
  head.append(labelEl, iconWrap);

  const valueEl = document.createElement('div');
  valueEl.className = 'stat-value';
  const strong = document.createElement('b');
  strong.textContent = value;
  const span = document.createElement('span');
  span.textContent = suffix;
  valueEl.append(strong, span);

  card.append(head, valueEl);
  return card;
}

function buildTabs(tabs) {
  if (!tabs) return;
  tabs.replaceChildren(
    tab('list', 'My List', icon('<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>'), getFavoriteVideos().length, true),
    tab('continue', 'Continue Watching', icon('<circle cx="12" cy="12" r="9"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon>'), progressEntries().length, false)
  );
}

function tab(view, label, iconEl, count, selected) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'lib-tab';
  button.setAttribute('role', 'tab');
  button.setAttribute('aria-selected', String(selected));
  button.dataset.view = view;

  const span = document.createElement('span');
  span.textContent = label;
  const countEl = document.createElement('span');
  countEl.className = 'tab-count';
  countEl.textContent = String(count);

  button.append(iconEl, span, countEl);
  button.addEventListener('click', () => {
    if (state.view === view) return;
    state.view = view;
    button.parentElement.querySelectorAll('.lib-tab').forEach((other) => {
      other.setAttribute('aria-selected', String(other === button));
    });
    render(
      {
        list: document.getElementById('libraryList'),
        empty: document.getElementById('libEmpty'),
        emptyText: document.getElementById('libEmptyText'),
        reset: document.getElementById('libReset')
      },
      new Map(listDisciplines().map((discipline) => [discipline.id, discipline.title || 'Discipline']))
    );
  });
  return button;
}

function buildFilter(select, disciplines) {
  if (!select) return;
  const all = document.createElement('option');
  all.value = '';
  all.textContent = 'All disciplines';
  select.replaceChildren(
    all,
    ...disciplines.map((discipline) => {
      const option = document.createElement('option');
      option.value = discipline.id;
      option.textContent = discipline.title || 'Discipline';
      return option;
    })
  );
}

/* ------------------------------- render --------------------------------- */

function render(els, disciplineNameById) {
  const entries = currentEntries();
  const filtered = Boolean(state.query || state.disciplineId);

  els.list.replaceChildren(...entries.map((entry, index) => libraryRow(entry, index, disciplineNameById)));

  const empty = entries.length === 0;
  if (els.empty) els.empty.hidden = !empty;
  if (els.emptyText && empty) {
    els.emptyText.textContent = filtered
      ? 'Nothing in your library matches these filters.'
      : state.view === 'list'
        ? 'Your watchlist is empty. Add masterclasses with the "My List" button.'
        : 'No videos in progress yet. Start a masterclass to see it here.';
  }
  if (els.reset) els.reset.hidden = !(empty && filtered);
}

function libraryRow(entry, index, disciplineNameById) {
  const video = entry.video;
  const row = document.createElement('div');
  row.className = 'library-row';
  row.dataset.videoId = video.id;
  row.setAttribute('role', 'button');
  row.tabIndex = 0;

  const minutes = Number(video.minutes) || 30;
  const position = Number(entry.position) || 0;
  const percent = entry.completed ? 100 : minutes > 0 ? Math.min(99, Math.round((position / (minutes * 60)) * 100)) : 0;

  const thumb = document.createElement('div');
  thumb.className = 'lib-thumb';
  thumb.append(createThumbArtwork(video, index));
  if (entry.completed) {
    const done = document.createElement('span');
    done.className = 'lib-done';
    done.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    thumb.append(done);
  } else if (position > 0) {
    const bar = document.createElement('span');
    bar.className = 'lib-progress';
    const fill = document.createElement('i');
    fill.style.width = `${percent}%`;
    bar.append(fill);
    thumb.append(bar);
  }

  const body = document.createElement('div');
  body.className = 'lib-body';

  const title = document.createElement('div');
  title.className = 'lib-title';
  title.textContent = video.title || 'Untitled Masterclass';

  const meta = document.createElement('div');
  meta.className = 'lib-meta';
  meta.textContent = disciplineNameById.get(video.discipline_id) || video.tag || 'Masterclass';

  const status = document.createElement('div');
  status.className = 'lib-status';
  if (state.view === 'continue') {
    status.textContent = entry.completed ? 'Completed' : `${percent}% · Resume`;
    if (!entry.completed) status.classList.add('ongoing');
  } else {
    status.textContent = `${minutes} min · ${video.tag || 'Masterclass'}`;
  }

  body.append(title, meta, status);

  const play = document.createElement('span');
  play.className = 'lib-play';
  play.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';

  row.append(thumb, body, play);
  return row;
}

/** Build a tiny inline SVG from a trusted inner-markup string. */
function icon(inner) {
  const wrap = document.createElement('div');
  wrap.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  return wrap.firstElementChild;
}
