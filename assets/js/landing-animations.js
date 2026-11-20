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

      card.style.transform = 'perspective(800px) rotateY(' + (deltaX * 5) + 'deg) rotateX(' + (-deltaY * 5) + 'deg) translateY(-6px)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * 5. SPLINE 3D HOLOGRAPHIC GLASS CORE (Real-time Canvas 3D Engine)
   * ────────────────────────────────────────────────────────────────────────── */
  const canvas = document.getElementById('heroSplineCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Mouse tracking for 3D orbital tilt
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    window.addEventListener('mousemove', (e) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      const mouseX = (e.clientX - halfW) / halfW;
      const mouseY = (e.clientY - halfH) / halfH;
      targetRotY = mouseX * 0.45;
      targetRotX = -mouseY * 0.45;
    });

    // 3D Icosahedron Geometry Definition
    const phi = (1 + Math.sqrt(5)) / 2;
    const baseVertices = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
    ];

    const scale = 145;
    const innerScale = 85;
    const vertices = baseVertices.map(v => {
      const len = Math.hypot(v[0], v[1], v[2]);
      return [v[0] / len * scale, v[1] / len * scale, v[2] / len * scale];
    });

    const innerVertices = baseVertices.map(v => {
      const len = Math.hypot(v[0], v[1], v[2]);
      return [v[0] / len * innerScale, v[1] / len * innerScale, v[2] / len * innerScale];
    });

    const faces = [
      [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
      [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
      [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
      [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
    ];

    let angle = 0;

    function rotateX(p, a) {
      const cos = Math.cos(a), sin = Math.sin(a);
      return [p[0], p[1] * cos - p[2] * sin, p[1] * sin + p[2] * cos];
    }
    function rotateY(p, a) {
      const cos = Math.cos(a), sin = Math.sin(a);
      return [p[0] * cos + p[2] * sin, p[1], -p[0] * sin + p[2] * cos];
    }
    function rotateZ(p, a) {
      const cos = Math.cos(a), sin = Math.sin(a);
      return [p[0] * cos - p[1] * sin, p[0] * sin + p[1] * cos, p[2]];
    }

      function project(p, fov) {
        const f = fov || 420;
        const z = p[2] + f;
        return [
          (p[0] * f) / z + width / 2,
          (p[1] * f) / z + height / 2,
          z
        ];
      }

      function renderSplineCore() {
        ctx.clearRect(0, 0, width, height);

        currentRotX += (targetRotX - currentRotX) * 0.05;
        currentRotY += (targetRotY - currentRotY) * 0.05;

        angle += 0.008;

        const rotAngleX = angle * 0.6 + currentRotX;
        const rotAngleY = angle + currentRotY;
        const rotAngleZ = angle * 0.3;

        const transformed = vertices.map(v => {
          let p = rotateX(v, rotAngleX);
          p = rotateY(p, rotAngleY);
          p = rotateZ(p, rotAngleZ);
          return project(p);
        });

        const innerTransformed = innerVertices.map(v => {
          let p = rotateX(v, -rotAngleX * 1.3);
          p = rotateY(v, -rotAngleY * 1.3);
          p = rotateZ(v, -rotAngleZ);
          return project(p);
        });

        // Ambient Core Aura
        const radGlow = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, 220);
        radGlow.addColorStop(0, 'rgba(0, 160, 255, 0.22)');
        radGlow.addColorStop(0.5, 'rgba(0, 59, 115, 0.1)');
        radGlow.addColorStop(1, 'rgba(3, 8, 14, 0)');
        ctx.fillStyle = radGlow;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 220, 0, Math.PI * 2);
        ctx.fill();

        // Render Inner Geometric Core Wireframe
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.35)';
        ctx.lineWidth = 1;
        faces.forEach(f => {
          const p1 = innerTransformed[f[0]];
          const p2 = innerTransformed[f[1]];
          const p3 = innerTransformed[f[2]];

          ctx.beginPath();
          ctx.moveTo(p1[0], p1[1]);
          ctx.lineTo(p2[0], p2[1]);
          ctx.lineTo(p3[0], p3[1]);
          ctx.closePath();
          ctx.fillStyle = 'rgba(0, 127, 255, 0.025)';
          ctx.fill();
          ctx.stroke();
        });

        // Render Outer Glass Faces sorted by depth
        const sortedFaces = faces.map(f => {
          const avgZ = (transformed[f[0]][2] + transformed[f[1]][2] + transformed[f[2]][2]) / 3;
          return { indices: f, z: avgZ };
        }).sort((a, b) => b.z - a.z);

        sortedFaces.forEach(f => {
          const p1 = transformed[f.indices[0]];
          const p2 = transformed[f.indices[1]];
          const p3 = transformed[f.indices[2]];

          const v1x = p2[0] - p1[0], v1y = p2[1] - p1[1];
          const v2x = p3[0] - p1[0], v2y = p3[1] - p1[1];
          const normalZ = v1x * v2y - v1y * v2x;

          ctx.beginPath();
          ctx.moveTo(p1[0], p1[1]);
          ctx.lineTo(p2[0], p2[1]);
          ctx.lineTo(p3[0], p3[1]);
          ctx.closePath();

          const depthAlpha = Math.min(Math.max((p1[2] - 300) / 250, 0.1), 0.7);
          if (normalZ > 0) {
            const grad = ctx.createLinearGradient(p1[0], p1[1], p3[0], p3[1]);
            grad.addColorStop(0, 'rgba(30, 160, 255, ' + (depthAlpha * 0.16) + ')');
            grad.addColorStop(0.5, 'rgba(0, 127, 255, ' + (depthAlpha * 0.08) + ')');
            grad.addColorStop(1, 'rgba(255, 255, 255, ' + (depthAlpha * 0.18) + ')');
            ctx.fillStyle = grad;
            ctx.fill();

            ctx.strokeStyle = 'rgba(0, 212, 255, ' + (depthAlpha * 0.75) + ')';
            ctx.lineWidth = 1.4;
            ctx.stroke();
          } else {
            ctx.fillStyle = 'rgba(0, 59, 115, ' + (depthAlpha * 0.05) + ')';
            ctx.fill();
            ctx.strokeStyle = 'rgba(0, 127, 255, ' + (depthAlpha * 0.25) + ')';
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });

        // Glowing Node Vertices
        transformed.forEach(p => {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.shadowColor = '#00D4FF';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(p[0], p[1], 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        requestAnimationFrame(renderSplineCore);
      }

      renderSplineCore();
    }

  }) ();
