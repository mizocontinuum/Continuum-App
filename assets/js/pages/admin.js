/**
 * Static admin dashboard preview.
 * Catalogue edits are stored in this browser through the local mock store.
 */
import {
  deleteVideo,
  listDisciplines,
  listVideos,
  resetLocalData,
  saveVideo,
  showToast
} from '../store.js?v=3';
import { initPageChrome } from '../user-menu.js?v=6';

function authHeaders() {
  const token = localStorage.getItem('continuum_auth_token') || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

document.addEventListener('DOMContentLoaded', async () => {
  const session = await initPageChrome();
  if (!session || session.role !== 'admin') return;

  const toggleDiscBtn = document.getElementById('toggleDisciplineFormBtn');
  const discForm = document.getElementById('disciplineForm');
  const discNameIn = document.getElementById('disciplineNameInput');
  if (toggleDiscBtn && discForm) {
    toggleDiscBtn.addEventListener('click', () => {
      discForm.hidden = !discForm.hidden;
      if (!discForm.hidden) discNameIn?.focus();
    });
    discForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = (discNameIn?.value || '').trim();
      if (!name) return;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `disc-${Date.now()}`;
      try {
        const token = localStorage.getItem('continuum_auth_token') || '';
        const res = await fetch('/api/admin/disciplines', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ id: slug, name, slug, sort_order: 0 })
        });
        if (!res.ok) throw new Error('Could not save discipline');
        if (discNameIn) discNameIn.value = '';
        discForm.hidden = true;
        showToast(`Discipline "${name}" added.`);
        window.location.reload();
      } catch (err) {
        showToast(err.message || 'Failed to add discipline', true);
      }
    });
  }

  const navLinks = Array.from(document.querySelectorAll('.admin-nav .admin-nav-link[href^="#"]'));
  const viewIds = navLinks.map((a) => a.getAttribute('href').slice(1));
  const breadcrumb = document.querySelector('.breadcrumb strong');

  function switchAdminView(targetId) {
    const id = viewIds.includes(targetId) ? targetId : viewIds[0];
    viewIds.forEach((vid) => {
      const sec = document.getElementById(vid);
      if (sec) sec.classList.toggle('admin-view-hidden', vid !== id);
    });
    navLinks.forEach((a) => {
      const isMatch = a.getAttribute('href') === '#' + id;
      a.classList.toggle('active', isMatch);
      if (isMatch) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    const activeLink = navLinks.find((a) => a.getAttribute('href') === '#' + id);
    const label = activeLink?.querySelector('span')?.textContent || 'Overview';
    if (breadcrumb) breadcrumb.textContent = label;
    document.title = `${label} · Continuum Admin`;
  }

  navLinks.forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      window.history.replaceState(null, '', '#' + id);
      switchAdminView(id);
    });
  });
  window.addEventListener('hashchange', () => {
    switchAdminView(window.location.hash ? window.location.hash.slice(1) : viewIds[0]);
  });
  switchAdminView(window.location.hash ? window.location.hash.slice(1) : viewIds[0]);

  const cmsForm = document.getElementById('cmsForm');
  if (cmsForm) {
    const pillIn = document.getElementById('cmsPill');
    const headIn = document.getElementById('cmsHeadline');
    const subIn = document.getElementById('cmsSub');
    const ctaIn = document.getElementById('cmsCta1');
    const accIn = document.getElementById('cmsAccent');
    const prevPill = document.getElementById('cmsPrevPill');
    const prevHead = document.getElementById('cmsPrevHead');
    const prevSub = document.getElementById('cmsPrevSub');
    const prevBtn = document.getElementById('cmsPrevBtn');

    const defaults = {
      pill: '✨ New courses every week',
      headline: 'Learn without limits, from anywhere.',
      sub: 'Interactive lessons, expert mentors and a community that keeps you moving. Study on your phone, your laptop, or both.',
      cta1: 'Start learning free',
      accent: '#0a6cf0'
    };

    const loadCms = async () => {
      let saved = {};
      try {
        saved = await api('/api/cms/landing');
      } catch (_) {
        try { saved = JSON.parse(localStorage.getItem('continuum_cms_landing') || '{}'); } catch (e) {}
      }
      const d = { ...defaults, ...(saved && typeof saved === 'object' ? saved : {}) };
      pillIn.value = d.pill;
      headIn.value = d.headline;
      subIn.value = d.sub;
      ctaIn.value = d.cta1;
      accIn.value = d.accent;
      syncPreview();
    };

    const syncPreview = () => {
      prevPill.textContent = pillIn.value || defaults.pill;
      prevPill.style.color = accIn.value;
      prevHead.textContent = headIn.value || defaults.headline;
      prevSub.textContent = subIn.value || defaults.sub;
      prevBtn.textContent = ctaIn.value || defaults.cta1;
      prevBtn.style.background = accIn.value;
    };

    [pillIn, headIn, subIn, ctaIn, accIn].forEach((el) => el.addEventListener('input', syncPreview));

    cmsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        pill: pillIn.value.trim() || defaults.pill,
        headline: headIn.value.trim() || defaults.headline,
        sub: subIn.value.trim() || defaults.sub,
        cta1: ctaIn.value.trim() || defaults.cta1,
        accent: accIn.value
      };
      try {
        await api('/api/cms/landing', { method: 'PUT', body: payload });
      } catch (_) {}
      try { localStorage.setItem('continuum_cms_landing', JSON.stringify(payload)); } catch (err) {}
      showToast('Published! Landing page updated.');
    });

    const cmsReset = document.getElementById('cmsResetBtn');
    if (cmsReset) {
      cmsReset.addEventListener('click', async () => {
        try { await api('/api/cms/landing', { method: 'PUT', body: {} }); } catch (_) {}
        localStorage.removeItem('continuum_cms_landing');
        loadCms();
        showToast('CMS reset to default.');
      });
    }
    loadCms();
  }

  // Holographic drifting starlight background
  if (!document.getElementById('adminStars')) {
    const c = document.createElement('canvas');
    c.id = 'adminStars';
    c.className = 'admin-stars';
    c.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(c, document.body.firstChild);
    const ctx = c.getContext('2d');
    const dots = Array.from({ length: 75 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00035,
      vy: (Math.random() - 0.5) * 0.00035,
      r: 0.6 + Math.random() * 1.4,
      p: Math.random() * 6.28
    }));
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      c.width = window.innerWidth * dpr;
      c.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener('resize', resize);
    resize();
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      let t = 0;
      (function loop() {
        t += 0.025;
        const w = window.innerWidth, h = window.innerHeight;
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < dots.length; i++) {
          const d = dots[i];
          d.x = (d.x + d.vx + 1) % 1;
          d.y = (d.y + d.vy + 1) % 1;
          const a = 0.18 + 0.5 * (0.5 + 0.5 * Math.sin(t + d.p));
          ctx.fillStyle = `rgba(150, 220, 255, ${a.toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(d.x * w, d.y * h, d.r, 0, Math.PI * 2);
          ctx.fill();
        }
        requestAnimationFrame(loop);
      })();
    }
  }

  const resetBtn = document.getElementById('resetAdminDataBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (!window.confirm('Reset catalogue and learner demo data on this device? Account and CMS edits will be kept.')) return;
      resetLocalData();
      showToast('Demo data reset! Reloading...');
      setTimeout(() => window.location.reload(), 600);
    });
  }

  const contentRows = document.getElementById('contentRows');
  const disciplineGrid = document.getElementById('disciplineGrid');
  const disciplineChart = document.getElementById('disciplineChart');
  const disciplineFilter = document.getElementById('disciplineFilter');
  const videoDiscipline = document.getElementById('videoDiscipline');
  const searchInput = document.getElementById('contentSearch');
  const emptyState = document.getElementById('tableEmpty');
  const videoEditor = document.getElementById('videoEditor');
  const videoForm = document.getElementById('videoForm');

  const fields = {
    id: document.getElementById('videoId'),
    title: document.getElementById('videoTitle'),
    discipline: videoDiscipline,
    speaker: document.getElementById('videoSpeaker'),
    minutes: document.getElementById('videoMinutes'),
    tag: document.getElementById('videoTag'),
    videoUrl: document.getElementById('videoUrl'),
    summary: document.getElementById('videoSummary'),
    featured: document.getElementById('videoFeatured'),
    clip: document.getElementById('videoClip')
  };

  const iconMarkup = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="m10 9 5 3-5 3z"></path></svg>',
    edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"></path></svg>',
    delete: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="m19 6-1 14H6L5 6"></path><path d="M10 11v5M14 11v5"></path></svg>'
  };

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function getDisciplineName(id) {
    return listDisciplines().find((item) => item.id === id)?.title || 'Unassigned';
  }

  function refreshDisciplineOptions() {
    const disciplines = listDisciplines();
    const selectedFilter = disciplineFilter.value;
    const selectedEditor = videoDiscipline.value;

    disciplineFilter.replaceChildren(new Option('All disciplines', ''));
    videoDiscipline.replaceChildren(new Option('Choose a discipline', ''));

    disciplines.forEach((discipline) => {
      disciplineFilter.add(new Option(discipline.title, discipline.id));
      videoDiscipline.add(new Option(discipline.title, discipline.id));
    });

    disciplineFilter.value = disciplines.some((item) => item.id === selectedFilter) ? selectedFilter : '';
    videoDiscipline.value = disciplines.some((item) => item.id === selectedEditor) ? selectedEditor : '';
  }

  function renderStats(videos, disciplines) {
    document.getElementById('statVideos').textContent = String(videos.length);
    document.getElementById('statDisciplines').textContent = String(disciplines.length);
    document.getElementById('statFeatured').textContent = String(videos.filter((video) => video.featured).length);
    document.getElementById('statClips').textContent = String(videos.filter((video) => video.is_clip).length);
    document.getElementById('contentCount').textContent = String(videos.length);
    document.getElementById('navVideoCount').textContent = String(videos.length);
  }

  function renderChart(videos, disciplines) {
    disciplineChart.replaceChildren();
    if (!disciplines.length) {
      disciplineChart.append(node('p', 'chart-empty', 'Add a discipline to see a catalogue breakdown.'));
      return;
    }

    const counts = disciplines
      .map((discipline) => ({
        ...discipline,
        count: videos.filter((video) => video.discipline_id === discipline.id).length
      }))
      .sort((a, b) => b.count - a.count || a.sort_order - b.sort_order)
      .slice(0, 6);
    const max = Math.max(1, ...counts.map((item) => item.count));

    counts.forEach((item) => {
      const row = node('div', 'chart-row');
      const label = node('span', 'chart-label', item.title);
      const track = node('span', 'chart-track');
      const fill = node('span', 'chart-fill');
      fill.style.width = `${Math.max(item.count ? 9 : 0, (item.count / max) * 100)}%`;
      track.append(fill);
      row.append(label, track, node('span', 'chart-value', String(item.count)));
      disciplineChart.append(row);
    });
  }

  function renderDisciplines(videos, disciplines) {
    disciplineGrid.replaceChildren();
    disciplines.forEach((discipline) => {
      const count = videos.filter((video) => video.discipline_id === discipline.id).length;
      const card = node('article', 'discipline-card');
      const symbol = node('span', 'discipline-symbol', (discipline.title || '?').trim().charAt(0).toUpperCase());
      symbol.setAttribute('aria-hidden', 'true');
      const copy = node('span', 'discipline-card-copy');
      copy.append(
        node('strong', '', discipline.title),
        node('span', '', `${count} ${count === 1 ? 'masterclass' : 'masterclasses'}`)
      );
      card.append(symbol, copy);
      disciplineGrid.append(card);
    });
    if (!disciplines.length) {
      disciplineGrid.append(node('p', 'chart-empty', 'No disciplines in the local catalogue yet.'));
    }
  }

  function createAction(label, action, id, icon) {
    const button = node('button', 'row-action');
    button.type = 'button';
    button.setAttribute('aria-label', `${label} masterclass`);
    button.dataset.action = action;
    button.dataset.id = id;
    button.innerHTML = iconMarkup[icon];
    return button;
  }

  function renderTable(videos) {
    const query = searchInput.value.trim().toLowerCase();
    const disciplineId = disciplineFilter.value;
    const filtered = videos.filter((video) => {
      const matchesQuery = !query || `${video.title} ${video.speaker} ${video.tag}`.toLowerCase().includes(query);
      return matchesQuery && (!disciplineId || video.discipline_id === disciplineId);
    });

    contentRows.replaceChildren();
    filtered.slice(0, 8).forEach((video) => {
      const row = document.createElement('tr');
      const titleCell = document.createElement('td');
      const titleWrap = node('div', 'masterclass-cell');
      const art = node('span', 'masterclass-art');
      art.innerHTML = iconMarkup.play;
      art.setAttribute('aria-hidden', 'true');
      const info = node('span', 'masterclass-info');
      info.append(
        node('strong', '', video.title),
        node('span', '', video.speaker || 'Executive Faculty')
      );
      titleWrap.append(art, info);
      titleCell.append(titleWrap);

      const disciplineCell = node('td', 'discipline-cell', getDisciplineName(video.discipline_id));
      const lengthCell = node('td', '', `${Number(video.minutes) || 0} min`);
      const statusCell = document.createElement('td');
      const badge = node('span', `status-badge${video.featured ? ' featured' : ''}`);
      badge.append(node('span'), document.createTextNode(video.featured ? 'Featured' : video.is_clip ? 'Highlight' : 'In catalogue'));
      statusCell.append(badge);
      const actionsCell = document.createElement('td');
      const actions = node('span', 'row-actions');
      actions.append(
        createAction('Edit', 'edit', video.id, 'edit'),
        createAction('Delete', 'delete', video.id, 'delete')
      );
      actionsCell.append(actions);
      row.append(titleCell, disciplineCell, lengthCell, statusCell, actionsCell);
      contentRows.append(row);
    });

    emptyState.hidden = filtered.length > 0;
    const shown = Math.min(filtered.length, 8);
    document.getElementById('tableSummary').textContent = filtered.length > shown
      ? `Showing ${shown} of ${filtered.length} matching items`
      : `Showing ${shown} of ${videos.length} items`;
  }

  function render() {
    const disciplines = listDisciplines();
    const videos = listVideos();
    refreshDisciplineOptions();
    renderStats(videos, disciplines);
    renderChart(videos, disciplines);
    renderDisciplines(videos, disciplines);
    renderTable(videos);
  }

  function openEditor(video = null) {
    refreshDisciplineOptions();
    videoForm.reset();
    fields.id.value = video?.id || '';
    fields.title.value = video?.title || '';
    fields.discipline.value = video?.discipline_id || listDisciplines()[0]?.id || '';
    fields.speaker.value = video?.speaker || '';
    fields.minutes.value = String(video?.minutes || 30);
    fields.tag.value = video?.tag || '';
    fields.videoUrl.value = video?.video_url || '';
    fields.summary.value = video?.summary || '';
    fields.featured.checked = Boolean(video?.featured);
    fields.clip.checked = Boolean(video?.is_clip);
    document.getElementById('editorTitle').textContent = video ? 'Edit masterclass' : 'New masterclass';
    videoEditor.showModal();
    fields.title.focus();
  }

  document.querySelectorAll('[data-new-video]').forEach((button) => {
    button.addEventListener('click', () => openEditor());
  });

  document.getElementById('closeEditor').addEventListener('click', () => videoEditor.close());
  document.getElementById('cancelEditor').addEventListener('click', () => videoEditor.close());

  // Direct-to-storage upload: ask the API for a signed URL, then PUT the file.
  const videoFile = document.getElementById('videoFile');
  if (videoFile) {
    videoFile.addEventListener('change', async () => {
      const file = videoFile.files && videoFile.files[0];
      if (!file) return;
      try {
        showToast('Uploading video…');
        const up = await api(`/api/admin/upload-url?filename=${encodeURIComponent(file.name)}&folder=videos`);
        const res = await fetch(up.signedUrl, {
          method: 'POST',
          body: file,
          headers: { 'x-upsert': 'false', 'Content-Type': file.type || 'application/octet-stream' }
        });
        if (!res.ok) throw new Error('Storage upload failed');
        fields.videoUrl.value = up.publicUrl;
        showToast('Video uploaded — save the masterclass to publish it.');
      } catch (error) {
        showToast(error.message || 'Video upload failed.', true);
      } finally {
        videoFile.value = '';
      }
    });
  }

  videoForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const editingId = fields.id.value || '';
    const existing = editingId ? listVideos().find((v) => v.id === editingId) : null;
    const newId = editingId || `v-${Date.now().toString(36)}`;
    const payload = {
      ...(existing || {}),
      id: newId,
      title: fields.title.value,
      discipline_id: fields.discipline.value,
      speaker: fields.speaker.value.trim(),
      minutes: Number(fields.minutes.value) || 30,
      tag: fields.tag.value.trim(),
      video_url: fields.videoUrl.value.trim(),
      summary: fields.summary.value.trim(),
      featured: fields.featured.checked,
      is_clip: fields.clip.checked
    };
    try {
      const result = await api('/api/admin/videos', { method: 'POST', body: payload });
      const saved = { ...payload, ...(result?.video || {}) };
      saveVideo(saved);
      videoEditor.close();
      render();
      showToast(editingId ? 'Masterclass updated.' : 'Masterclass added.');
    } catch (error) {
      showToast(error.message || 'Could not save this masterclass.', true);
    }
  });

  contentRows.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const video = listVideos().find((item) => item.id === button.dataset.id);
    if (!video) return;

    if (button.dataset.action === 'edit') {
      openEditor(video);
      return;
    }

    if (button.dataset.action === 'delete' && window.confirm(`Remove "${video.title}" from the catalogue?`)) {
      (async () => {
        try {
          await api(`/api/admin/videos/${encodeURIComponent(video.id)}`, { method: 'DELETE' });
        } catch (error) {
          showToast(error.message || 'Could not delete this masterclass.', true);
          return;
        }
        deleteVideo(video.id);
        render();
        showToast('Masterclass removed.');
      })();
    }
  });

  searchInput.addEventListener('input', () => renderTable(listVideos()));
  disciplineFilter.addEventListener('change', () => renderTable(listVideos()));

  const sidebar = document.getElementById('adminSidebar');
  const toggle = document.getElementById('sidebarToggle');
  const scrim = document.getElementById('sidebarScrim');
  const closeBtn = document.getElementById('sidebarClose');
  const mobileSidebar = window.matchMedia('(max-width: 820px)');
  const syncSidebarAccess = () => {
    sidebar.inert = mobileSidebar.matches && !sidebar.classList.contains('open');
  };
  const closeSidebar = (restoreFocus = false) => {
    sidebar.classList.remove('open');
    scrim.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    syncSidebarAccess();
    if (restoreFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('open');
    scrim.hidden = !isOpen;
    toggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
    syncSidebarAccess();
    if (isOpen) sidebar.querySelector('.admin-nav-link')?.focus();
  });
  scrim.addEventListener('click', () => closeSidebar(true));
  if (closeBtn) closeBtn.addEventListener('click', () => closeSidebar(true));
  sidebar.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => closeSidebar());
  });
  mobileSidebar.addEventListener('change', () => {
    closeSidebar();
    syncSidebarAccess();
  });
  syncSidebarAccess();

  document.addEventListener('keydown', (event) => {
    if (!sidebar.classList.contains('open')) return;
    if (event.key === 'Escape') {
      closeSidebar(true);
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(sidebar.querySelectorAll('a[href], button:not([disabled])'))
      .filter((el) => el.getClientRects().length);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });

  render();
});
