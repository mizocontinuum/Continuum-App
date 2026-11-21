/**
 * Watch page: plays one masterclass and keeps the user's place.
 *
 *   - reads ?video= and resolves it from the local catalogue (store.js)
 *   - resumes from the position saved in localStorage
 *   - saves progress ~every 10s while playing, on pause, and on unload
 *   - marks the video completed once 95% has been watched
 *   - toggles the video in My List
 *
 * No network calls of any kind: progress and favourites live in the store.
 */
import {
  getVideo,
  getProgress,
  saveProgress as persistProgress,
  isFavorite,
  toggleFavorite as toggleFavoriteInStore,
  getDisciplineOf,
  assetUrl,
  showToast
} from '../store.js';
import { initPageChrome } from '../user-menu.js?v=21';

const SAVE_EVERY_MS = 10000;
const COMPLETE_RATIO = 0.95;

const videoId = new URLSearchParams(window.location.search).get('video');

let player = null;
let video = null;
let favoriteOn = false;
let completed = false;
let saveTimer = null;
let lastSaved = -1;
let resumeAt = 0;

document.addEventListener('DOMContentLoaded', async () => {
  const session = await initPageChrome();
  if (!session) return; // guard already redirected

  player = document.getElementById('watchVideo');
  if (!player) return;

  if (!videoId) {
    showMissing();
    return;
  }

  video = getVideo(videoId);
  if (!video) {
    showMissing();
    return;
  }

  const entry = getProgress(videoId);
  if (!entry.completed && Number(entry.position) > 0) {
    resumeAt = Number(entry.position);
  }
  completed = Boolean(entry.completed);
  favoriteOn = isFavorite(videoId);

  render(video);
  wirePlayer();
  updateProgressBar();
});

/* ------------------------------- Render --------------------------------- */

function render(item) {
  const meta = document.getElementById('watchMeta');
  const tag = document.getElementById('watchTag');
  const title = document.getElementById('watchTitle');
  const speaker = document.getElementById('watchSpeaker');

  tag.textContent = item.tag || 'Masterclass';
  title.textContent = item.title || 'Untitled Masterclass';
  speaker.textContent = `${item.speaker || 'Executive Faculty'} · ${Number(item.minutes) || 30} min`;
  if (meta) meta.hidden = false;

  if (item.video_url) {
    player.src = item.video_url.startsWith('/') ? assetUrl(item.video_url) : item.video_url;
  } else {
    const note = document.getElementById('watchNote');
    if (note) {
      note.hidden = false;
      note.textContent = 'This masterclass has no video file yet. Add a URL to its video_url to stream it here.';
    }
  }

  const back = document.getElementById('watchBack');
  const discipline = getDisciplineOf(item);
  if (back && discipline) {
    back.href = new URL(`../discipline/?id=${encodeURIComponent(discipline.id)}`, document.baseURI).href;
  }

  updateFavoriteBtn();
}

function showMissing(message) {
  const stage = document.getElementById('watchStage');
  const meta = document.getElementById('watchMeta');
  const missing = document.getElementById('watchMissing');
  const progress = document.getElementById('watchProgress');

  if (stage) stage.hidden = true;
  if (meta) meta.hidden = true;
  if (progress) progress.hidden = true;
  if (missing) {
    missing.hidden = false;
    const text = missing.querySelector('[data-watch-missing-text]');
    if (text && message) text.textContent = message;
  }
}

/* ------------------------------- Player --------------------------------- */

function wirePlayer() {
  const favoriteBtn = document.getElementById('favoriteBtn');
  const shareBtn = document.getElementById('shareBtn');
  if (favoriteBtn) favoriteBtn.addEventListener('click', onToggleFavorite);
  if (shareBtn) shareBtn.addEventListener('click', shareVideo);

  player.addEventListener('loadedmetadata', () => {
    if (resumeAt <= 0) return;
    const duration = player.duration;
    if (!Number.isFinite(duration) || resumeAt < duration - 1) {
      player.currentTime = resumeAt;
    }
  });

  player.addEventListener('play', startSaving);
  player.addEventListener('pause', () => {
    stopSaving();
    saveNow();
  });
  player.addEventListener('ended', () => {
    completed = true;
    stopSaving();
    updateProgressBar();
    saveNow();
  });
  player.addEventListener('timeupdate', () => {
    if (!completed && player.duration > 0 && player.currentTime / player.duration >= COMPLETE_RATIO) {
      completed = true;
    }
    updateProgressBar();
  });

  window.addEventListener('pagehide', saveNow);
  window.addEventListener('beforeunload', saveNow);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      stopSaving();
      saveNow();
    }
  });
}

function startSaving() {
  if (saveTimer) return;
  saveTimer = setInterval(saveNow, SAVE_EVERY_MS);
}

function stopSaving() {
  if (saveTimer) {
    clearInterval(saveTimer);
    saveTimer = null;
  }
}

function updateProgressBar() {
  const fill = document.getElementById('watchProgressFill');
  if (!fill) return;
  const duration = player.duration;
  const percent = completed
    ? 100
    : Number.isFinite(duration) && duration > 0
      ? Math.min(100, (player.currentTime / duration) * 100)
      : 0;
  fill.style.width = `${percent}%`;
}

/* ------------------------------- Saving --------------------------------- */

/** Persist the current position (and completion) into the local store. */
function saveNow() {
  if (!video || !player) return;
  const position = Math.max(0, Math.floor(player.currentTime || 0));
  if (position === lastSaved && !completed) return;
  lastSaved = position;
  persistProgress(video.id, position, completed);
}

/* ------------------------------- My List -------------------------------- */

function onToggleFavorite() {
  if (!video) return;
  favoriteOn = toggleFavoriteInStore(video.id);
  updateFavoriteBtn();
  showToast(favoriteOn ? 'Added to My List' : 'Removed from My List');
}

function updateFavoriteBtn() {
  const btn = document.getElementById('favoriteBtn');
  const label = document.getElementById('favoriteLabel');
  if (!btn || !label) return;
  btn.setAttribute('aria-pressed', String(favoriteOn));
  label.textContent = favoriteOn ? 'In My List' : 'My List';
}

async function shareVideo() {
  if (!video) return;
  const url = window.location.href;
  try {
    if (navigator.share) {
      await navigator.share({ title: video.title || 'Continuum Academy', text: video.title || '', url });
      return;
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard');
    }
  } catch (_) {
    /* the user dismissed the share sheet - nothing to do */
  }
}
