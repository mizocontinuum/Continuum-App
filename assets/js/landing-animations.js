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
   * 2. SPLINE 3D HOLOGRAPHIC GLASS CORE (Smooth 60fps Native Canvas Engine)
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
      targetRotY = mouseX * 0.45;
      targetRotX = -mouseY * 0.45;
    }, { passive: true });

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

      // Fast, responsive mouse tracking (higher lerp factor for instant responsiveness)
      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;

      angle += 0.01;

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

})();
