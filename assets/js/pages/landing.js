/* =========================================================
   CONTINUUM ACADEMY - LANDING PAGE DEDICATED SCRIPT
   Page: index.html
   ========================================================= */

/* --- 1. Interactive Modal Component --- */
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


/* --- 2. Spline & Canvas Animations --- */
/**
 * Continuum Academy - Executive GSAP 3 Cinematic Choreography Engine
 * Instant, responsive, zero-lag 60fps GPU-accelerated motion with Spline 3D Core.
 */
(() => {
  'use strict';

  // Respect user accessibility preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const hasGSAP = typeof gsap !== 'undefined';

  /* ──────────────────────────────────────────────────────────────────────────
   * 1. INSTANT GSAP CHOREOGRAPHY (Snappy, Fluid, Zero-Lag)
   * ────────────────────────────────────────────────────────────────────────── */
  if (hasGSAP) {
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    const easeSmooth = 'power2.out';

    /* ── 1.1 Hero Section: Instant & Fast Fluid Reveal ───────────────────── */
    const heroTl = gsap.timeline({ defaults: { ease: easeSmooth } });

    // Light subtle initial offsets so elements pop in immediately
    gsap.set('.landing-eyebrow', { opacity: 0, y: -10 });
    gsap.set('.landing-title', { opacity: 0, y: 16 });
    gsap.set('.landing-lede', { opacity: 0, y: 12 });
    gsap.set('.landing-cta', { opacity: 0, y: 10 });
    gsap.set('.hero-spline-stage', { opacity: 0, scale: 0.92 });

    heroTl
      .to('.hero-spline-stage', {
        opacity: 1,
        scale: 1,
        duration: 0.5
      }, 0)
      .to('.landing-eyebrow', {
        opacity: 1,
        y: 0,
        duration: 0.4
      }, 0.05)
      .to('.landing-title', {
        opacity: 1,
        y: 0,
        duration: 0.45
      }, 0.1)
      .to('.landing-lede', {
        opacity: 1,
        y: 0,
        duration: 0.45
      }, 0.18)
      .to('.landing-cta', {
        opacity: 1,
        y: 0,
        duration: 0.4
      }, 0.25);

    /* ── 1.2 Subtle Ambient Breathing Animations ─────────────────────────── */
    gsap.to('.hero-bg-layer', {
      scale: 1.12,
      y: -8,
      duration: 6,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });

    gsap.to('.trending-curve-arch', {
      filter: 'drop-shadow(0 0 28px rgba(0, 127, 255, 0.7))',
      duration: 3,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });

    /* ── 1.3 ScrollTrigger: Snappy Viewport Reveals ───────────────────────── */
    if (typeof ScrollTrigger !== 'undefined') {
      // Parallax drift for 3D stage
      gsap.to('.hero-spline-stage', {
        scrollTrigger: {
          trigger: '.landing-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        },
        y: 60
      });

      // Trending Carousel Fast Reveal
      gsap.from('.trending-card', {
        scrollTrigger: {
          trigger: '.landing-trending',
          start: 'top 88%',
          once: true
        },
        opacity: 0,
        y: 24,
        scale: 0.96,
        stagger: 0.05,
        duration: 0.45,
        ease: easeSmooth,
        clearProps: 'transform,opacity'
      });

      // Spotlight TV Section Fast Reveal
      gsap.from('.spotlight-text, .tv-frame-wrap', {
        scrollTrigger: {
          trigger: '.landing-spotlight',
          start: 'top 85%',
          once: true
        },
        opacity: 0,
        y: 20,
        stagger: 0.08,
        duration: 0.45,
        ease: easeSmooth,
        clearProps: 'transform,opacity'
      });

      // Value Features Section Fast Reveal
      gsap.from('.landing-value', {
        scrollTrigger: {
          trigger: '.landing-section',
          start: 'top 85%',
          once: true
        },
        opacity: 0,
        y: 24,
        scale: 0.96,
        stagger: 0.06,
        duration: 0.45,
        ease: easeSmooth,
        clearProps: 'transform,opacity'
      });
    }
  }

  /* ──────────────────────────────────────────────────────────────────────────
   * 2. SPLINE 3D HOLOGRAPHIC LOGO CORE (Smooth 60fps Native Canvas Engine)
   * ────────────────────────────────────────────────────────────────────────── */
  const canvas = document.getElementById('heroSplineCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    window.addEventListener('mousemove', (e) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      const mouseX = (e.clientX - halfW) / halfW;
      const mouseY = (e.clientY - halfH) / halfH;
      targetRotY = mouseX * 0.55;
      targetRotX = -mouseY * 0.45;
    }, { passive: true });

    // Load Continuum Academy Emblem
    const logoImg = new Image();
    logoImg.src = 'assets/images/logo-icon.png';
    let logoLoaded = false;
    logoImg.onload = () => { logoLoaded = true; };
    logoImg.onerror = () => {
      const fallback = new Image();
      fallback.src = '../assets/images/logo-icon.png';
      fallback.onload = () => { logoImg = fallback; logoLoaded = true; };
    };

    let angle = 0;
    let floatTime = 0;

    // Orbiting particles / data nodes
    const orbitNodes = [];
    for (let i = 0; i < 36; i++) {
      orbitNodes.push({
        theta: (i / 36) * Math.PI * 2,
        speed: 0.01 + (i % 4) * 0.003,
        radius: 200 + (i % 3) * 35,
        yOffset: Math.sin(i * 1.6) * 60,
        size: 2.0 + (i % 3) * 1.4
      });
    }

    function renderSplineCore() {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse tracking interpolation
      currentRotX += (targetRotX - currentRotX) * 0.07;
      currentRotY += (targetRotY - currentRotY) * 0.07;

      angle += 0.012;
      floatTime += 0.022;

      const totalYaw = angle + currentRotY;
      const totalPitch = Math.sin(floatTime * 0.55) * 0.14 + currentRotX;
      const floatOffsetY = Math.sin(floatTime) * 14;

      const cx = width / 2;
      const cy = height / 2 + floatOffsetY;

      // 1. Ambient Hologram Backlight Aura
      const radGlow = ctx.createRadialGradient(cx, cy, 40, cx, cy, 275);
      radGlow.addColorStop(0, 'rgba(0, 160, 255, 0.32)');
      radGlow.addColorStop(0.45, 'rgba(0, 127, 255, 0.12)');
      radGlow.addColorStop(1, 'rgba(3, 8, 14, 0)');
      ctx.fillStyle = radGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, 275, 0, Math.PI * 2);
      ctx.fill();

      // 2. Dual Gyroscope 3D Orbital Rings (Bigger & Sleek)
      ctx.save();
      ctx.translate(cx, cy);

      // Ring 1 (Azure Dash)
      ctx.beginPath();
      ctx.ellipse(0, 0, 225, 75, totalYaw * 0.45, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.28)';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([9, 9]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Ring 2 (Outer Deep Azure Solid)
      ctx.beginPath();
      ctx.ellipse(0, 0, 205, 58, -totalYaw * 0.35 + 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 127, 255, 0.35)';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.restore();

      // 3. Render 3D Logo Extrusion with Layered Depth (Bigger scale: baseH = 240px)
      const logoAspect = 247 / 292;
      const baseH = 240;
      const baseW = baseH * logoAspect; // ~203px
      const cosY = Math.cos(totalYaw);
      const sinY = Math.sin(totalYaw);

      if (logoLoaded) {
        const depthLayers = 22;
        const depthSpread = 42; // Richer 3D volume thickness

        for (let l = -depthLayers / 2; l <= depthLayers / 2; l++) {
          const layerZ = (l / depthLayers) * depthSpread;
          const pX = layerZ * sinY;
          const pZ = layerZ * cosY;
          const pY = layerZ * Math.sin(totalPitch) * -cosY;

          const scaleProj = 1 + (pZ / 480);
          let w = baseW * Math.abs(cosY) * scaleProj;
          if (w < 4) w = 4;
          const h = baseH * scaleProj;

          ctx.save();
          ctx.translate(cx + pX, cy + pY);
          ctx.rotate(totalPitch * Math.cos(totalYaw * 0.5));

          const isFront = (l === depthLayers / 2 && pZ > 0) || (l === -depthLayers / 2 && pZ <= 0);
          const isCore = Math.abs(l) < 3;

          if (isFront) {
            ctx.globalAlpha = 0.98;
            ctx.shadowColor = '#00D4FF';
            ctx.shadowBlur = 22;
            ctx.drawImage(logoImg, -w / 2, -h / 2, w, h);
          } else {
            const layerAlpha = 0.07 + (Math.abs(l) / depthLayers) * 0.18;
            ctx.globalAlpha = layerAlpha;
            ctx.drawImage(logoImg, -w / 2, -h / 2, w, h);

            ctx.globalCompositeOperation = 'source-atop';
            const depthColor = isCore ? 'rgba(0, 127, 255, 0.52)' : 'rgba(51, 181, 255, 0.35)';
            ctx.fillStyle = depthColor;
            ctx.fillRect(-w / 2, -h / 2, w, h);
          }

          ctx.restore();
        }

        // Specular highlight flare when logo faces user
        const faceForward = Math.abs(cosY);
        if (faceForward > 0.35) {
          ctx.save();
          const shineR = 52 * faceForward;
          const shineGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, shineR);
          shineGrad.addColorStop(0, `rgba(255, 255, 255, ${0.65 * faceForward})`);
          shineGrad.addColorStop(0.35, `rgba(51, 181, 255, ${0.45 * faceForward})`);
          shineGrad.addColorStop(1, 'rgba(0, 127, 255, 0)');
          ctx.fillStyle = shineGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, shineR, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // 4. Orbiting Holographic Data Nodes & Sparks
      orbitNodes.forEach((node, idx) => {
        node.theta += node.speed;
        const px = Math.cos(node.theta) * node.radius;
        const pz = Math.sin(node.theta) * node.radius;
        const py = node.yOffset + Math.sin(node.theta * 2 + floatTime) * 16;

        const rx = px * Math.cos(totalYaw * 0.4) - pz * Math.sin(totalYaw * 0.4);
        const rz = px * Math.sin(totalYaw * 0.4) + pz * Math.cos(totalYaw * 0.4);

        const pScale = (rz + 280) / 560;
        if (pScale < 0.2) return;

        const fx = cx + rx;
        const fy = cy + py * 0.7;

        ctx.beginPath();
        ctx.arc(fx, fy, node.size * pScale, 0, Math.PI * 2);
        ctx.fillStyle = idx % 2 === 0 ? '#00D4FF' : '#3388FF';
        ctx.shadowColor = '#00D4FF';
        ctx.shadowBlur = 9 * pScale;
        ctx.globalAlpha = Math.max(0.2, Math.min(0.95, pScale));
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      });

      requestAnimationFrame(renderSplineCore);
    }

    renderSplineCore();
  }

})();

