/**
 * Landing page modal + section interactions.
 *
 * Extracted verbatim from an inline <script> in index.html. Handles the
 * trending/discipline detail modal, the discipline filter pills, the smooth
 * scroll for "Enter the Academy", and the trending carousel next button.
 */

(function () {
  const backdrop = document.getElementById('trendingModalBackdrop');
  const dialog = document.getElementById('trendingModalDialog');
  const closeBtn = document.getElementById('modalCloseBtn');
  const cards = document.querySelectorAll('.trending-card');
  const nextBtn = document.getElementById('trendingNextBtn');
  const carousel = document.getElementById('trendingCarousel');

  // Modal elements
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');
  const modalYear = document.getElementById('modalYear');
  const modalRating = document.getElementById('modalRating');
  const modalType = document.getElementById('modalType');
  const modalGenre = document.getElementById('modalGenre');
  const modalDesc = document.getElementById('modalDesc');
  const modalArtImg = document.getElementById('modalArtImg');

  function openModal(card) {
    const titleRaw = card.getAttribute('data-title') || '';
    const parts = titleRaw.split(':');
    modalTitle.textContent = parts[0] ? parts[0].trim() : titleRaw;
    modalSubtitle.textContent = parts[1] ? parts[1].trim() : '';

    modalYear.textContent = card.getAttribute('data-year') || '2026';
    modalRating.textContent = card.getAttribute('data-rating') || '16+';
    modalType.textContent = card.getAttribute('data-type') || 'Show';
    modalGenre.innerHTML = card.getAttribute('data-genre') || 'Dramas';
    modalDesc.textContent = card.getAttribute('data-desc') || '';
    const fallbackBanner = 'assets/images/masterclass-banner.jpg';
    const targetArt = card.getAttribute('data-art') || card.getAttribute('data-badge') || fallbackBanner;
    modalArtImg.onerror = function () {
      this.onerror = null;
      this.src = fallbackBanner;
    };
    modalArtImg.src = targetArt;

    backdrop.classList.add('active');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    backdrop.classList.remove('active');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Hook all cards that can trigger modal (Trending + Disciplines cards)
  const allModalCards = document.querySelectorAll('.trending-card, .discipline-card-thumb');
  allModalCards.forEach(card => {
    card.addEventListener('click', () => openModal(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card);
      }
    });
  });

  // Filter pills for Disciplines section
  const filterPills = document.querySelectorAll('.discipline-filter-pill');
  const videoCards = document.querySelectorAll('.discipline-video-card');

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.getAttribute('data-filter');

      videoCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Smooth scroll for 'Enter the Academy'
  const enterAcademyBtn = document.getElementById('enterAcademyBtn');
  if (enterAcademyBtn) {
    enterAcademyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('disciplinesSection');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  closeBtn.addEventListener('click', closeModal);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('active')) {
      closeModal();
    }
  });

  if (nextBtn && carousel) {
    nextBtn.addEventListener('click', () => {
      carousel.scrollBy({ left: 320, behavior: 'smooth' });
    });
  }
})();
