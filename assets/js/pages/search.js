/**
 * Search page: instant client-side search over the local catalogue, a
 * recommended list while the field is empty, and voice input via the Web
 * Speech API with a graceful fallback.
 *
 * Everything reads from store.js, so there is no network request at any point.
 */
import { searchCatalog, listVideos, showToast } from '../store.js';
import { createThumbArtwork } from '../cards.js';
import { initPageChrome } from '../user-menu.js';

document.addEventListener('DOMContentLoaded', async () => {
  const session = await initPageChrome();
  if (!session) return; // guard already redirected

  const input = document.getElementById('searchInput');
  const micBtn = document.getElementById('micBtn');
  const recommendedBlock = document.getElementById('recommendedBlock');
  const resultsBlock = document.getElementById('resultsBlock');
  const resultList = document.getElementById('resultList');
  const resultsGrid = document.getElementById('resultsGrid');
  const emptyState = document.getElementById('emptyState');
  if (!input || !resultsGrid) return;

  let timer = null;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (q.length < 2) {
      showRecommended();
      return;
    }
    timer = setTimeout(() => runSearch(q), 250);
  });

  wireVoiceSearch(input, micBtn);
  loadRecommended();

  function loadRecommended() {
    if (!resultList) return;
    const videos = listVideos().slice(0, 8);
    resultList.replaceChildren(...videos.map((video, index) => resultRow(video, index)));
  }

  function runSearch(q) {
    const { videos } = searchCatalog(q);
    resultsGrid.replaceChildren(...videos.map((video, index) => gridCard(video, index)));

    const hasResults = videos.length > 0;
    resultsBlock.hidden = false;
    recommendedBlock.hidden = true;
    if (emptyState) {
      emptyState.hidden = hasResults;
      emptyState.textContent = hasResults ? '' : `No matches for “${q}”.`;
    }
  }

  function showRecommended() {
    resultsBlock.hidden = true;
    recommendedBlock.hidden = false;
    if (emptyState) emptyState.hidden = true;
    resultsGrid.replaceChildren();
  }
});

function resultRow(video, index) {
  const row = document.createElement('div');
  row.className = 'result-row';
  if (video.id) row.dataset.videoId = video.id;

  const thumb = document.createElement('div');
  thumb.className = 'result-thumb';
  thumb.append(createThumbArtwork(video, index));

  const title = document.createElement('div');
  title.className = 'result-title';
  title.textContent = video.title || 'Untitled Masterclass';

  const play = document.createElement('button');
  play.type = 'button';
  play.className = 'result-play';
  play.setAttribute('aria-label', 'Play');
  play.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
  play.addEventListener('click', (event) => {
    event.stopPropagation();
    if (video.id) window.location.href = watchUrl(video.id);
  });

  row.append(thumb, title, play);
  return row;
}

function gridCard(video, index) {
  const card = document.createElement('article');
  card.className = 'grid-card';
  if (video.id) card.dataset.videoId = video.id;

  const thumb = document.createElement('div');
  thumb.className = 'grid-thumb';
  thumb.append(createThumbArtwork(video, index));

  const caption = document.createElement('div');
  caption.className = 'grid-caption';
  caption.textContent = video.title || 'Untitled Masterclass';

  card.append(thumb, caption);
  card.addEventListener('click', () => {
    if (video.id) window.location.href = watchUrl(video.id);
  });
  return card;
}

/** The watch-page URL for a video id, resolved from this page's depth. */
function watchUrl(videoId) {
  return new URL(`../watch/?video=${encodeURIComponent(videoId)}`, document.baseURI).href;
}

/** Wire the mic button to the Web Speech API when the browser supports it. */
function wireVoiceSearch(input, micBtn) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!micBtn) return;

  if (!Recognition) {
    micBtn.addEventListener('click', () => showToast('Voice search is not supported in this browser.', true));
    return;
  }

  const recognition = new Recognition();
  recognition.lang = navigator.language || 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  let listening = false;

  recognition.addEventListener('result', (event) => {
    const transcript = event.results?.[0]?.[0]?.transcript || '';
    if (!transcript) return;
    input.value = transcript;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  recognition.addEventListener('error', (event) => {
    console.warn('Voice search error:', event.error);
    showToast('Voice search could not start. Please try again.', true);
  });
  recognition.addEventListener('start', () => {
    listening = true;
    micBtn.classList.add('listening');
  });
  recognition.addEventListener('end', () => {
    listening = false;
    micBtn.classList.remove('listening');
  });

  micBtn.addEventListener('click', () => {
    if (listening) {
      recognition.stop();
      return;
    }
    try {
      recognition.start();
    } catch (error) {
      console.warn('Voice search unavailable:', error);
      showToast('Voice search is unavailable right now.', true);
    }
  });
}
