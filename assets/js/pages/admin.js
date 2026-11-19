/**
 * Continuum Academy - Admin console.
 *
 * A purely local content manager: every read and write goes through store.js,
 * which persists to localStorage on top of the shipped mock catalogue. There
 * is no network traffic and no server - the console edits the demo data that
 * every member page then renders.
 */
import {
  listDisciplines,
  listVideos,
  saveDiscipline,
  deleteDiscipline,
  saveVideo,
  deleteVideo,
  assetUrl,
  showToast
} from '../store.js';
import { initPageChrome } from '../user-menu.js?v=21';

document.addEventListener('DOMContentLoaded', async () => {
  const session = await initPageChrome();
  if (!session) return; // guard already redirected non-admins

  /* ------------------------------ elements ------------------------------ */

  const disciplineForm = document.getElementById('disciplineForm');
  const disciplineTitle = document.getElementById('disciplineTitle');
  const disciplineGoal = document.getElementById('disciplineGoal');
  const disciplineSort = document.getElementById('disciplineSort');
  const disciplineBlurb = document.getElementById('disciplineBlurb');
  const disciplineSubmit = document.getElementById('disciplineSubmit');
  const disciplineList = document.getElementById('disciplineList');

  const videoDiscipline = document.getElementById('videoDiscipline');
  const videoSectionGroup = document.getElementById('videoSectionGroup');
  const videoForm = document.getElementById('videoForm');
  const videoTitle = document.getElementById('videoTitle');
  const videoSpeaker = document.getElementById('videoSpeaker');
  const videoMinutes = document.getElementById('videoMinutes');
  const videoTag = document.getElementById('videoTag');
  const videoHighlight = document.getElementById('videoHighlight');
  const videoRating = document.getElementById('videoRating');
  const videoSort = document.getElementById('videoSort');
  const videoSummary = document.getElementById('videoSummary');
  const videoOutcomes = document.getElementById('videoOutcomes');
  const videoUrl = document.getElementById('videoUrl');
  const videoIsClip = document.getElementById('videoIsClip');
  const videoFeatured = document.getElementById('videoFeatured');
  const videoSubmit = document.getElementById('videoSubmit');
  const videoList = document.getElementById('videoList');

  /* -------------------------------- state ------------------------------- */

  let editingDisciplineId = null;
  let editingVideoId = null;
  let currentDisciplineId = null;

  /* ------------------------------- helpers ------------------------------ */

  function makeButton(label, className) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    return button;
  }

  function parseOutcomes(text) {
    return String(text || '')
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  /* ------------------------------- rendering ---------------------------- */

  function renderDisciplineOptions() {
    if (!videoDiscipline) return;
    const disciplines = listDisciplines();
    videoDiscipline.replaceChildren(
      ...disciplines.map((discipline) => {
        const option = document.createElement('option');
        option.value = discipline.id;
        option.textContent = discipline.title || discipline.name || 'Untitled';
        return option;
      })
    );
    if (!currentDisciplineId && disciplines.length) currentDisciplineId = disciplines[0].id;
    if (currentDisciplineId) videoDiscipline.value = currentDisciplineId;
  }

  function renderDisciplines() {
    if (!disciplineList) return;
    const disciplines = listDisciplines();
    const countByDiscipline = {};
    listVideos().forEach((video) => {
      countByDiscipline[video.discipline_id] = (countByDiscipline[video.discipline_id] || 0) + 1;
    });

    if (!disciplines.length) {
      const empty = document.createElement('li');
      empty.className = 'empty-note';
      empty.textContent = 'No disciplines yet. Add one above.';
      disciplineList.replaceChildren(empty);
      return;
    }

    disciplineList.replaceChildren(
      ...disciplines.map((discipline) => {
        const count = countByDiscipline[discipline.id] || 0;
        const row = document.createElement('li');
        row.className = `group-item selectable${discipline.id === currentDisciplineId ? ' selected' : ''}`;
        row.dataset.id = discipline.id;

        const text = document.createElement('div');
        text.className = 'item-text';
        const name = document.createElement('div');
        name.className = 'item-name';
        name.textContent = discipline.title || discipline.name || 'Untitled';
        const sub = document.createElement('div');
        sub.className = 'item-sub';
        sub.textContent = `${discipline.slug || 'no-slug'} · ${discipline.goal || 'No goal'} · sort ${discipline.sort_order} · ${count} masterclass${count === 1 ? '' : 'es'}`;
        text.append(name, sub);

        const actions = document.createElement('div');
        actions.className = 'item-actions';
        const edit = makeButton('Edit', 'admin-btn small edit-discipline-btn');
        const remove = makeButton('Delete', 'admin-btn small danger delete-discipline-btn');
        actions.append(edit, remove);

        row.append(text, actions);

        edit.addEventListener('click', (event) => {
          event.stopPropagation();
          startEditDiscipline(discipline);
        });
        remove.addEventListener('click', (event) => {
          event.stopPropagation();
          removeDiscipline(discipline);
        });
        row.addEventListener('click', () => selectDiscipline(discipline.id));

        return row;
      })
    );
  }

  function videoUrlChip(video) {
    const chip = document.createElement('span');
    if (video.video_url) {
      chip.className = 'file-chip has';
      chip.textContent = video.video_url;
      chip.title = assetUrl(video.video_url);
    } else {
      chip.className = 'file-chip missing';
      chip.textContent = 'No video file';
    }
    return chip;
  }

  function renderVideos() {
    if (!videoList) return;
    const discipline = listDisciplines().find((item) => item.id === currentDisciplineId) || null;
    if (videoSectionGroup) {
      videoSectionGroup.textContent = discipline ? `- ${discipline.title || discipline.name}` : '';
    }

    const videos = listVideos().filter((video) => video.discipline_id === currentDisciplineId);

    if (!videos.length) {
      const empty = document.createElement('li');
      empty.className = 'empty-note';
      empty.textContent = 'No masterclasses in this discipline yet. Add one above.';
      videoList.replaceChildren(empty);
      return;
    }

    videoList.replaceChildren(
      ...videos.map((video) => {
        const row = document.createElement('li');
        row.className = 'video-item';
        row.dataset.id = video.id;

        const text = document.createElement('div');
        text.className = 'item-text';
        const name = document.createElement('div');
        name.className = 'item-name';
        name.textContent = video.title || 'Untitled masterclass';
        const sub = document.createElement('div');
        sub.className = 'item-sub';
        sub.textContent = `${video.speaker || 'Executive Faculty'} · ${Number(video.minutes) || 30} min · ${video.tag || 'No tag'} · rating ${Number(video.rating) || 0}`;
        text.append(name, sub);

        if (video.is_clip || video.featured || video.video_url) {
          const badges = document.createElement('div');
          badges.className = 'item-badges';
          if (video.is_clip) {
            const clip = document.createElement('span');
            clip.className = 'file-chip has';
            clip.textContent = 'Clip';
            badges.append(clip);
          }
          if (video.featured) {
            const featured = document.createElement('span');
            featured.className = 'file-chip has';
            featured.textContent = 'Featured';
            badges.append(featured);
          }
          badges.append(videoUrlChip(video));
          text.append(badges);
        }

        const actions = document.createElement('div');
        actions.className = 'item-actions';
        const edit = makeButton('Edit', 'admin-btn small edit-video-btn');
        const remove = makeButton('Delete', 'admin-btn small danger delete-video-btn');
        actions.append(edit, remove);

        row.append(text, actions);

        edit.addEventListener('click', () => startEditVideo(video));
        remove.addEventListener('click', () => removeVideo(video));

        return row;
      })
    );
  }

  /* ---------------------- discipline actions ---------------------- */

  function resetDisciplineForm() {
    editingDisciplineId = null;
    disciplineForm?.reset();
    if (disciplineSubmit) disciplineSubmit.textContent = '＋ Add discipline';
  }

  function startEditDiscipline(discipline) {
    editingDisciplineId = discipline.id;
    disciplineTitle.value = discipline.title || discipline.name || '';
    disciplineGoal.value = discipline.goal || '';
    disciplineSort.value = discipline.sort_order || '';
    disciplineBlurb.value = discipline.blurb || '';
    if (disciplineSubmit) disciplineSubmit.textContent = 'Save discipline changes';
    disciplineForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    disciplineTitle.focus();
  }

  function selectDiscipline(id) {
    currentDisciplineId = id;
    if (videoDiscipline) videoDiscipline.value = id;
    resetVideoForm();
    renderDisciplines();
    renderVideos();
  }

  function removeDiscipline(discipline) {
    const confirmed = window.confirm(
      `Delete "${discipline.title || discipline.name}"? Its masterclasses will be removed too.`
    );
    if (!confirmed) return;
    deleteDiscipline(discipline.id);
    if (currentDisciplineId === discipline.id) currentDisciplineId = null;
    renderDisciplines();
    renderDisciplineOptions();
    renderVideos();
    showToast('Discipline deleted.');
  }

  disciplineForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    try {
      const record = saveDiscipline({
        id: editingDisciplineId || undefined,
        title: disciplineTitle.value,
        goal: disciplineGoal.value.trim(),
        blurb: disciplineBlurb.value.trim(),
        sort_order: Number(disciplineSort.value) || undefined
      });
      showToast(editingDisciplineId ? 'Discipline updated.' : 'Discipline created.');
      resetDisciplineForm();
      currentDisciplineId = record.id;
      renderDisciplineOptions();
      renderDisciplines();
      renderVideos();
    } catch (err) {
      showToast(err.message || 'Could not save the discipline.', true);
    }
  });

  /* ------------------------ masterclass actions ------------------------ */

  function resetVideoForm() {
    editingVideoId = null;
    videoForm?.reset();
    if (videoSubmit) videoSubmit.textContent = '＋ Add masterclass';
  }

  function startEditVideo(video) {
    editingVideoId = video.id;
    videoTitle.value = video.title || '';
    videoSpeaker.value = video.speaker || '';
    videoMinutes.value = video.minutes || '';
    videoTag.value = video.tag || '';
    videoHighlight.value = video.highlight || '';
    videoRating.value = video.rating || '';
    videoSort.value = video.sort_order || '';
    videoSummary.value = video.summary || '';
    videoOutcomes.value = Array.isArray(video.outcomes) ? video.outcomes.join('\n') : '';
    videoUrl.value = video.video_url || '';
    videoIsClip.checked = Boolean(video.is_clip);
    videoFeatured.checked = Boolean(video.featured);
    if (videoSubmit) videoSubmit.textContent = 'Save masterclass changes';
    videoForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    videoTitle.focus();
  }

  function removeVideo(video) {
    if (!window.confirm(`Delete "${video.title || 'this masterclass'}"?`)) return;
    deleteVideo(video.id);
    renderVideos();
    renderDisciplines();
    showToast('Masterclass deleted.');
  }

  videoDiscipline?.addEventListener('change', () => {
    currentDisciplineId = videoDiscipline.value;
    resetVideoForm();
    renderDisciplines();
    renderVideos();
  });

  videoForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!currentDisciplineId) {
      showToast('Choose a discipline first.', true);
      return;
    }
    try {
      saveVideo({
        id: editingVideoId || undefined,
        discipline_id: currentDisciplineId,
        title: videoTitle.value,
        speaker: videoSpeaker.value.trim(),
        minutes: Number(videoMinutes.value) || undefined,
        tag: videoTag.value.trim(),
        highlight: videoHighlight.value.trim(),
        rating: Number(videoRating.value) || undefined,
        summary: videoSummary.value.trim(),
        outcomes: parseOutcomes(videoOutcomes.value),
        video_url: videoUrl.value.trim(),
        is_clip: videoIsClip.checked,
        featured: videoFeatured.checked,
        sort_order: Number(videoSort.value) || undefined
      });
      showToast(editingVideoId ? 'Masterclass updated.' : 'Masterclass added.');
      resetVideoForm();
      renderVideos();
      renderDisciplines();
    } catch (err) {
      showToast(err.message || 'Could not save the masterclass.', true);
    }
  });

  /* -------------------------------- boot ------------------------------- */

  renderDisciplineOptions();
  renderDisciplines();
  renderVideos();
});
