/**
 * Home - the executive dashboard.
 *
 * Pure static rendering over store.js: a hero carousel of featured
 * masterclasses, the ranked Top 10, Continue Watching, one row per discipline
 * and the executive detail sheet. No network traffic of any kind.
 */
import {
  featuredVideos,
  topVideos,
  continueWatching,
  listCatalogue,
  listVideos,
  getDisciplineOf,
  isFavorite,
  toggleFavorite,
  watchLink,
  assetUrl,
  formatClock,
  showToast
} from '../store.js';
import { createVideoCard, createDisciplineRow, attachCardNavigation } from '../cards.js';
import { initPageChrome } from '../user-menu.js';

const AUTO_ADVANCE_MS = 7000;
const LANDSCAPE_SPEEDS = [0.75, 1, 1.25, 1.5, 2];

let slides = [];
let heroIndex = 0;
let autoTimer = null;
let stagePaused = false;
let sheetVideo = null;
let landscapeVideo = null;
let landscapeSpeedIndex = 1;

/** Small DOM helper: createElement with an optional class and text. */
function makeEl(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

document.addEventListener('DOMContentLoaded', init);

function init() {
  if (!initPageChrome()) return;

  buildHero();
  renderTop();
  renderContinue();
  renderDisciplines();

  wireSheet();
  wireLandscape();
  wireHeroControls();

  attachCardNavigation(document);
  startAuto();
}

/* --------------------------------- Hero --------------------------------- */

function buildHero() {
  slides = featuredVideos();
  if (!slides.length) slides = topVideos(6);

  // No trailer file ships with the demo: keep the ambient gradient backdrop
  // and never hand the <video> a source it cannot play.
  const section = document.getElementById('heroSection');
  if (section) section.classList.add('hero-video-off');

  const indicators = document.getElementById('carouselIndicators');
  if (indicators) {
    indicators.replaceChildren(
      ...slides.map((_, index) => {
        const dash = makeEl('span', 'dash');
        if (index === 0) dash.classList.add('active');
        dash.dataset.index = String(index);
        return dash;
      })
    );
    indicators.addEventListener('click', (event) => {
      const dash = event.target.closest('.dash');
      if (!dash) return;
      showHero(Number(dash.dataset.index));
      stopAuto();
    });
  }

  if (slides.length) showHero(0);
}

function showHero(index) {
  if (!slides.length) return;
  heroIndex = (index + slides.length) % slides.length;
  const video = slides[heroIndex];

  const title = document.getElementById('heroTitle');
  if (title) title.textContent = video.title || 'Featured Masterclass';

  const spotlight = document.getElementById('spotlightTag');
  if (spotlight) {
    const text = spotlight.querySelector('.spotlight-text');
    if (text) text.textContent = video.highlight || 'Featured';
  }

  document.querySelectorAll('#carouselIndicators .dash').forEach((dash, i) => {
    dash.classList.toggle('active', i === heroIndex);
  });

  updateHeroListButton(video);
  fillSheet(video);
}

function stepHero(delta) {
  showHero(heroIndex + delta);
  stopAuto();
}

function startAuto() {
  // Reduced-motion visitors keep the carousel still.
  if (slides.length < 2) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (autoTimer) return;
  autoTimer = window.setInterval(() => {
    if (!stagePaused) showHero(heroIndex + 1);
  }, AUTO_ADVANCE_MS);
}

function stopAuto() {
  if (autoTimer) {
    window.clearInterval(autoTimer);
    autoTimer = null;
  }
}

function wireHeroControls() {
  const section = document.getElementById('heroSection');
  if (section) {
    section.addEventListener('pointerdown', stopAuto, { once: true });
  }

  const prev = document.getElementById('prevHero');
  const next = document.getElementById('nextHero');
  if (prev) prev.addEventListener('click', () => stepHero(-1));
  if (next) next.addEventListener('click', () => stepHero(1));

  const play = document.getElementById('playBtn');
  if (play) {
    play.addEventListener('click', () => {
      if (slides[heroIndex]) window.location.href = watchLink(slides[heroIndex].id);
    });
  }

  const moreInfo = document.getElementById('moreInfoBtn');
  if (moreInfo) moreInfo.addEventListener('click', openSheet);

  const spotlight = document.getElementById('spotlightTag');
  if (spotlight) spotlight.addEventListener('click', openSheet);

  const myList = document.getElementById('myListBtn');
  if (myList) {
    myList.addEventListener('click', () => {
      const video = slides[heroIndex];
      if (!video) return;
      const saved = toggleFavorite(video.id);
      updateHeroListButton(video);
      showToast(saved ? 'Added to My List' : 'Removed from My List');
    });
  }

  const like = document.getElementById('likeBtn');
  if (like) {
    like.addEventListener('click', () => {
      const on = like.classList.toggle('active');
      showToast(on ? 'Saved to your taste profile' : 'Removed your rating');
    });
  }

  const sound = document.getElementById('soundBtn');
  if (sound) {
    sound.addEventListener('click', () => {
      const on = sound.classList.toggle('active');
      sound.setAttribute('aria-label', on ? 'Audio unmuted' : 'Audio muted');
    });
  }

  const pause = document.getElementById('pauseBtn');
  if (pause) {
    pause.addEventListener('click', () => {
      stagePaused = !stagePaused;
      pause.classList.toggle('active', stagePaused);
      showToast(stagePaused ? 'Carousel paused' : 'Carousel playing');
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const tag = event.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    stepHero(event.key === 'ArrowRight' ? 1 : -1);
  });
}

function updateHeroListButton(video) {
  const btn = document.getElementById('myListBtn');
  if (!btn) return;
  const saved = video ? isFavorite(video.id) : false;
  btn.classList.toggle('active', saved);
  btn.setAttribute('aria-pressed', String(saved));
  const icon = btn.querySelector('.plus-icon');
  if (icon) icon.textContent = saved ? '✓' : '＋';
}

/* ------------------------------ Catalogue ------------------------------- */

function renderTop() {
  const row = document.getElementById('topRankedRow');
  const section = document.getElementById('topRankedSection');
  if (!row) return;
  const items = topVideos(10);
  if (!items.length) {
    if (section) section.hidden = true;
    return;
  }
  row.replaceChildren(...items.map((video, index) => createVideoCard(video, index, true)));
}

function renderContinue() {
  const section = document.getElementById('continueWatchingSection');
  const row = document.getElementById('continueWatchingRow');
  if (!row || !section) return;
  const items = continueWatching();
  if (!items.length) {
    section.hidden = true;
    return;
  }
  row.replaceChildren(...items.map((video, index) => createVideoCard(video, index, false)));
  section.hidden = false;
}

function renderDisciplines() {
  const rows = document.getElementById('disciplineRows');
  const empty = document.getElementById('homeEmptyState');
  const catalogue = listCatalogue();
  if (rows) rows.replaceChildren(...catalogue.map((d, index) => createDisciplineRow(d, index)));
  if (empty) empty.hidden = catalogue.length > 0;
}

/* -------------------------------- Sheet --------------------------------- */

function fillSheet(video) {
  sheetVideo = video;
  if (!video) return;
  const discipline = getDisciplineOf(video);

  setText('modalTag', video.tag || 'Masterclass');
  setText('videoModalTitle', video.title || 'Untitled Masterclass');
  setText('modalMatch', `${Number(video.rating) || 90}% Match`);
  setText('modalDuration', `${Number(video.minutes) || 30}m`);
  setText('modalCategory', discipline ? discipline.title : video.tag || 'Masterclass');
  setText('sheetCtaText', 'Play Masterclass');

  const outcomes = Array.isArray(video.outcomes) && video.outcomes.length
    ? video.outcomes
    : [video.highlight || 'Executive takeaway'];
  setText('sheetSubhead', outcomes[0]);
  setText('sheetDesc', video.summary || '');
  setText('videoModalSpeaker', video.speaker || 'Executive Faculty');
  setText('sheetDisciplineName', discipline ? discipline.title : 'Masterclass');
  setText('sheetTargetOutcome', (discipline && discipline.goal) || outcomes[0]);

  const list = document.getElementById('sheetModulesList');
  if (list) {
    list.replaceChildren(
      ...outcomes.map((outcome, index) => {
        const card = makeEl('div', 'sheet-module-card');
        const content = makeEl('div', 'sheet-module-content');
        const head = makeEl('h5', '', outcome);
        const note = makeEl('p', '', video.highlight || 'Executive takeaway');
        content.append(head, note);
        card.append(makeEl('div', 'sheet-module-num', String(index + 1)), content);
        return card;
      })
    );
  }

  updateModalListButton();
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
}

function openSheet() {
  const modal = document.getElementById('videoModal');
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeSheet() {
  const modal = document.getElementById('videoModal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

function updateModalListButton() {
  const btn = document.getElementById('modalListAction');
  if (!btn) return;
  const saved = sheetVideo ? isFavorite(sheetVideo.id) : false;
  btn.classList.toggle('active', saved);
  const label = btn.querySelector('.sheet-act-label');
  if (label) label.textContent = saved ? 'In My List' : 'My List';
  const icon = btn.querySelector('.sheet-act-icon');
  if (icon) icon.textContent = saved ? '✓' : '＋';
}

function wireSheet() {
  const modal = document.getElementById('videoModal');
  if (!modal) return;

  on('closeVideoBtn', closeSheet);
  on('frameBackBtn', closeSheet);
  on('videoModalBackdrop', closeSheet);

  on('sheetPrimaryCta', () => {
    if (sheetVideo) window.location.href = watchLink(sheetVideo.id);
  });
  on('playTrailerClipBtn', () => {
    if (sheetVideo) window.location.href = watchLink(sheetVideo.id);
  });

  on('modalListAction', () => {
    if (!sheetVideo) return;
    const saved = toggleFavorite(sheetVideo.id);
    updateModalListButton();
    updateHeroListButton(slides[heroIndex]);
    showToast(saved ? 'Added to My List' : 'Removed from My List');
  });

  on('modalReminderBtn', () => showToast('Reminder set for this masterclass'));
  on('modalRateBtn', () => showToast('Thanks - your rating was recorded'));
  on('modalShareAction', () => shareVideo(sheetVideo));

  wireSheetTabs();

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeSheet();
    closeLandscape();
  });
}

function wireSheetTabs() {
  const tabs = ['tabRelatedBtn', 'tabTrailerBtn'];
  tabs.forEach((id) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', () => {
      tabs.forEach((other) => {
        const node = document.getElementById(other);
        if (node) node.classList.toggle('active', other === id);
      });
    });
  });
}

async function shareVideo(video) {
  const url = video ? watchLink(video.id) : window.location.href;
  try {
    if (navigator.share) {
      await navigator.share({ title: video?.title || 'Continuum Academy', url });
      return;
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard');
    }
  } catch (_) {
    /* the user dismissed the share sheet */
  }
}

/* ------------------------- Landscape player ----------------------------- */

function wireLandscape() {
  const modal = document.getElementById('landscapePlayerModal');
  const lsVideo = document.getElementById('landscapeVideo');
  if (!modal || !lsVideo) return;

  on('lsBackBtn', closeLandscape);

  const playPause = document.getElementById('lsPlayPauseBtn');
  if (playPause) {
    playPause.addEventListener('click', () => {
      if (lsVideo.paused) lsVideo.play().catch(() => {});
      else lsVideo.pause();
    });
  }

  on('lsRewindBtn', () => {
    lsVideo.currentTime = Math.max(0, (lsVideo.currentTime || 0) - 10);
  });
  on('lsForwardBtn', () => {
    const duration = Number.isFinite(lsVideo.duration) ? lsVideo.duration : Infinity;
    lsVideo.currentTime = Math.min(duration, (lsVideo.currentTime || 0) + 10);
  });

  const track = document.getElementById('lsScrubberTrack');
  if (track) wireScrubber(lsVideo, track);

  lsVideo.addEventListener('timeupdate', updateLandscapeUI);
  lsVideo.addEventListener('play', updateLandscapeUI);
  lsVideo.addEventListener('pause', updateLandscapeUI);
  lsVideo.addEventListener('loadedmetadata', updateLandscapeUI);

  on('lsSpeedBtn', () => {
    landscapeSpeedIndex = (landscapeSpeedIndex + 1) % LANDSCAPE_SPEEDS.length;
    const speed = LANDSCAPE_SPEEDS[landscapeSpeedIndex];
    lsVideo.playbackRate = speed;
    setText('lsSpeedText', `Speed (${speed}x)`);
  });

  const lockBtn = document.getElementById('lsLockBtn');
  const overlay = document.getElementById('lsControlsOverlay');
  if (lockBtn && overlay) {
    lockBtn.addEventListener('click', () => {
      overlay.classList.toggle('idle-hidden');
      lockBtn.classList.toggle('locked');
    });
  }

  on('lsNextVideoBtn', playNextLandscape);
  on('lsRelatedBtn', () => showToast('Related masterclasses are listed under the player'));
  on('lsSubtitlesBtn', () => showToast('Captions follow your device settings'));

  wireReactions();
  wireBrightness(lsVideo);
}

function wireScrubber(lsVideo, track) {
  let dragging = false;
  const seek = (clientX) => {
    const rect = track.getBoundingClientRect();
    if (!rect.width) return;
    const fraction = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const duration = lsVideo.duration;
    if (Number.isFinite(duration) && duration > 0) lsVideo.currentTime = fraction * duration;
  };
  track.addEventListener('pointerdown', (event) => {
    dragging = true;
    track.setPointerCapture?.(event.pointerId);
    seek(event.clientX);
  });
  track.addEventListener('pointermove', (event) => {
    if (dragging) seek(event.clientX);
  });
  track.addEventListener('pointerup', (event) => {
    dragging = false;
    track.releasePointerCapture?.(event.pointerId);
  });
}

function wireReactions() {
  ['lsDislikeBtn', 'lsLikeBtn', 'lsLoveBtn'].forEach((id) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', () => {
      ['lsDislikeBtn', 'lsLikeBtn', 'lsLoveBtn'].forEach((other) => {
        if (other !== id) document.getElementById(other)?.classList.remove('active');
      });
      btn.classList.toggle('active');
    });
  });
}

function wireBrightness(lsVideo) {
  const control = document.getElementById('lsBrightnessControl');
  if (!control) return;
  control.addEventListener('click', (event) => {
    const track = control.querySelector('.ls-slider-track');
    if (!track) return;
    const rect = track.getBoundingClientRect();
    if (!rect.height) return;
    const fraction = Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height));
    lsVideo.style.filter = `brightness(${(0.35 + fraction * 0.65).toFixed(2)})`;
    const fill = document.getElementById('lsBrightnessFill');
    if (fill) fill.style.height = `${Math.round(fraction * 100)}%`;
  });
}

function openLandscape(video) {
  const modal = document.getElementById('landscapePlayerModal');
  const lsVideo = document.getElementById('landscapeVideo');
  if (!modal || !lsVideo || !video) return;

  landscapeVideo = video;
  const discipline = getDisciplineOf(video);
  setText('lsVideoTitle', video.title || 'Untitled Masterclass');
  setText('lsDisciplineName', discipline ? discipline.title : video.tag || 'Masterclass');

  if (video.video_url) lsVideo.src = assetUrl(video.video_url);
  else lsVideo.removeAttribute('src');

  landscapeSpeedIndex = 1;
  lsVideo.playbackRate = 1;
  setText('lsSpeedText', 'Speed (1x)');

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  lsVideo.play().catch(() => {});
  updateLandscapeUI();
}

function closeLandscape() {
  const modal = document.getElementById('landscapePlayerModal');
  const lsVideo = document.getElementById('landscapeVideo');
  if (lsVideo) lsVideo.pause();
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

function playNextLandscape() {
  if (!landscapeVideo) return;
  const siblings = listVideos().filter((v) => v.discipline_id === landscapeVideo.discipline_id);
  if (!siblings.length) return;
  const index = siblings.findIndex((v) => v.id === landscapeVideo.id);
  const next = siblings[(index + 1) % siblings.length];
  openLandscape(next);
}

function updateLandscapeUI() {
  const lsVideo = document.getElementById('landscapeVideo');
  if (!lsVideo) return;
  const duration = Number.isFinite(lsVideo.duration) ? lsVideo.duration : 0;
  const current = lsVideo.currentTime || 0;
  const percent = duration > 0 ? Math.min(100, (current / duration) * 100) : 0;

  const fill = document.getElementById('lsScrubberFill');
  if (fill) fill.style.width = `${percent}%`;
  const dot = document.getElementById('lsScrubberDot');
  if (dot) dot.style.left = `${percent}%`;
  setText('lsTimeDisplay', `${formatClock(current)} / ${formatClock(duration)}`);

  const playPause = document.getElementById('lsPlayPauseBtn');
  if (playPause) playPause.classList.toggle('playing', !lsVideo.paused);
}

/** Bind a click listener to an element by id, if it exists. */
function on(id, handler) {
  const node = document.getElementById(id);
  if (node) node.addEventListener('click', handler);
}
