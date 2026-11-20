/**
 * Continuum Academy - High-Performance Cinematic Animation Engine
 * Replaces heavy CSS @keyframes with native Web Animations API (WAAPI),
 * IntersectionObserver for fluid viewport reveals, and interactive 3D mouse tracking.
 */
(() => {
  'use strict';

  // Respect user accessibility preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const easeOutExpo = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const easeInOut = 'ease-in-out';

  /* ──────────────────────────────────────────────────────────────────────────
   * 1. CONTINUOUS AMBIENT WAAPI ANIMATIONS (Smooth GPU-driven playback)
   * ────────────────────────────────────────────────────────────────────────── */

  // 1.1 Body Aurora Atmospheric Drift
  const bodyAfter = document.body;
  if (bodyAfter) {
    // We animate a CSS variable or filter directly on documentElement / body
    document.body.animate([
      { filter: 'hue-rotate(0deg) brightness(1)' },
      { filter: 'hue-rotate(8deg) brightness(1.05)' }
    ], {
      duration: 20000,
      iterations: Infinity,
      direction: 'alternate',
      easing: easeInOut
    });
  }

  // 1.2 Header Border Glow Line
  const header = document.querySelector('.landing-top');
  if (header) {
    header.animate([
      { borderBottomColor: 'rgba(0, 127, 255, 0.25)' },
      { borderBottomColor: 'rgba(0, 212, 255, 0.65)' }
    ], {
      duration: 4000,
      iterations: Infinity,
      direction: 'alternate',
      easing: easeInOut
    });
  }

  // 1.3 Hero Subtle 3D Floating Parallax (Clean & Contained in Hero)
  const heroBg = document.querySelector('.hero-bg-layer');
  if (heroBg) {
    heroBg.animate([
      { transform: 'translateZ(-50px) translateY(0px) scale(1.08)' },
      { transform: 'translateZ(-30px) translateY(-10px) scale(1.12)' },
      { transform: 'translateZ(-50px) translateY(0px) scale(1.08)' }
    ], {
      duration: 12000,
      iterations: Infinity,
      direction: 'alternate',
      easing: easeInOut
    });
  }

  // 1.4 Hero Radial Glow Center Pulse
  const heroLight = document.querySelector('.hero-light-radial');
  if (heroLight) {
    heroLight.animate([
      { transform: 'translateX(-50%) scale(1)', opacity: 0.6 },
      { transform: 'translateX(-50%) scale(1.2)', opacity: 1 }
    ], {
      duration: 6000,
      iterations: Infinity,
      direction: 'alternate',
      easing: easeInOut
    });
  }

  // 1.5 Hero Eyebrow Pill Floating
  const heroEyebrow = document.querySelector('.hero-eyebrow');
  if (heroEyebrow) {
    heroEyebrow.animate([
      { transform: 'translateY(0px) translateZ(25px)' },
      { transform: 'translateY(-8px) translateZ(32px)' }
    ], {
      duration: 5000,
      iterations: Infinity,
      direction: 'alternate',
      easing: easeInOut
    });
  }

  // 1.6 Hero Eyebrow Dot Pulse
  const pulseDot = document.querySelector('.pulse-dot');
  if (pulseDot) {
    pulseDot.animate([
      { opacity: 1, boxShadow: '0 0 12px var(--azure-bright), 0 0 24px rgba(30, 160, 255, 0.5)' },
      { opacity: 0.5, boxShadow: '0 0 6px var(--azure-bright), 0 0 12px rgba(30, 160, 255, 0.3)' },
      { opacity: 1, boxShadow: '0 0 12px var(--azure-bright), 0 0 24px rgba(30, 160, 255, 0.5)' }
    ], {
      duration: 2000,
      iterations: Infinity,
      easing: easeInOut
    });
  }

  // 1.7 Trending Section Arch Glow
  const trendingArch = document.querySelector('.trending-arch-glow');
  if (trendingArch) {
    trendingArch.animate([
      { filter: 'drop-shadow(0 0 16px rgba(0, 127, 255, 0.5))' },
      { filter: 'drop-shadow(0 0 28px rgba(0, 127, 255, 0.8))' }
    ], {
      duration: 5000,
      iterations: Infinity,
      direction: 'alternate',
      easing: easeInOut
    });
  }

  // 1.8 Spotlight Ambient Particle Drifts
  const p1 = document.querySelector('.particle-1');
  if (p1) {
    p1.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 0.4 },
      { transform: 'translate(24px, -35px) scale(1.3)', opacity: 0.7 }
    ], {
      duration: 8000,
      iterations: Infinity,
      direction: 'alternate',
      easing: easeInOut
    });
  }

  const p2 = document.querySelector('.particle-2');
  if (p2) {
    p2.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 0.5 },
      { transform: 'translate(-20px, -28px) scale(1.2)', opacity: 0.8 }
    ], {
      duration: 10000,
      iterations: Infinity,
      direction: 'alternate-reverse',
      easing: easeInOut
    });
  }

  /* ──────────────────────────────────────────────────────────────────────────
   * 2. HERO ENTRANCE CHOREOGRAPHY (Immediate Smooth Stagger)
   * ────────────────────────────────────────────────────────────────────────── */
  const heroTitle = document.querySelector('.landing-title');
  if (heroTitle) {
    heroTitle.animate([
      { opacity: 0, transform: 'translateY(28px) translateZ(35px)', filter: 'blur(6px)' },
      { opacity: 1, transform: 'translateY(0) translateZ(35px)', filter: 'blur(0px)' }
    ], {
      duration: 1000,
      easing: easeOutExpo,
      fill: 'forwards'
    });
  }

  const heroLede = document.querySelector('.landing-lead');
  if (heroLede) {
    heroLede.animate([
      { opacity: 0, transform: 'translateY(20px) translateZ(20px)' },
      { opacity: 1, transform: 'translateY(0) translateZ(20px)' }
    ], {
      duration: 1000,
      delay: 150,
      easing: easeOutExpo,
      fill: 'forwards'
    });
  }

  const heroForm = document.querySelector('.landing-cta-form');
  if (heroForm) {
    heroForm.animate([
      { opacity: 0, transform: 'translateY(20px) translateZ(20px)' },
      { opacity: 1, transform: 'translateY(0) translateZ(20px)' }
    ], {
      duration: 1000,
      delay: 300,
      easing: easeOutExpo,
      fill: 'forwards'
    });
  }

  /* ──────────────────────────────────────────────────────────────────────────
   * 3. SCROLL-TRIGGERED ENTRANCE VIA INTERSECTION OBSERVER
   * ────────────────────────────────────────────────────────────────────────── */

  // 3.1 Trending Cards Staggered Slide In
  const trendingCards = document.querySelectorAll('.trending-card');
  if (trendingCards.length > 0) {
    // Set initial hidden state for observe
    trendingCards.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px) translateX(20px) scale(0.92)';
    });

    const trendingObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          trendingCards.forEach((card, index) => {
            const anim = card.animate([
              { opacity: 0, transform: 'translateY(30px) translateX(20px) scale(0.92)' },
              { opacity: 1, transform: 'translateY(0) translateX(0) scale(1)' }
            ], {
              duration: 700,
              delay: index * 100,
              easing: easeOutExpo,
              fill: 'forwards'
            });
            anim.onfinish = () => {
              card.style.opacity = '';
              card.style.transform = '';
            };
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.15 });

    const trendingSection = document.querySelector('.trending-section') || trendingCards[0];
    trendingObserver.observe(trendingSection);
  }

  // 3.2 Value Grid Cards Reveal
  const valueCards = document.querySelectorAll('.value-card');
  if (valueCards.length > 0) {
    valueCards.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(40px) scale(0.95)';
    });

    const valueObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          valueCards.forEach((card, index) => {
            const anim = card.animate([
              { opacity: 0, transform: 'translateY(40px) scale(0.95)' },
              { opacity: 1, transform: 'translateY(0) scale(1)' }
            ], {
              duration: 800,
              delay: index * 150,
              easing: easeOutExpo,
              fill: 'forwards'
            });
            anim.onfinish = () => {
              card.style.opacity = '';
              card.style.transform = '';
            };
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.15 });

    const valueSection = document.querySelector('.value-section') || valueCards[0];
    valueObserver.observe(valueSection);
  }

  /* ──────────────────────────────────────────────────────────────────────────
   * 4. INTERACTIVE 3D PARALLAX TILT ON CARDS (Interactive Upgrade)
   * ────────────────────────────────────────────────────────────────────────── */
  const interactiveCards = document.querySelectorAll('.trending-card, .value-card');
  interactiveCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const deltaX = (x - centerX) / centerX;
      const deltaY = (y - centerY) / centerY;

      // Micro subtle tilt
      card.style.transform = `perspective(800px) rotateY(${deltaX * 5}deg) rotateX(${-deltaY * 5}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

})();
