/**
 * Continuum Academy - Signup GSAP & Spline 3D Choreography Engine
 * Consistent with Landing Page aesthetics and 60fps performance.
 */
(() => {
  'use strict';

  // Respect user accessibility preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const hasGSAP = typeof gsap !== 'undefined';

  /* ──────────────────────────────────────────────────────────────────────────
   * 1. GSAP ENTRANCE & CARD PHYSICS
   * ────────────────────────────────────────────────────────────────────────── */
  if (hasGSAP) {
    const easeSmooth = 'power2.out';
    const tl = gsap.timeline({ defaults: { ease: easeSmooth } });

    // Initial state sets
    gsap.set('.brand-header', { opacity: 0, y: -20 });
    gsap.set('.login-card', { opacity: 0, y: 30, scale: 0.95 });
    gsap.set('.auth-spline-stage', { opacity: 0, scale: 0.85 });
    gsap.set('.form-group', { opacity: 0, y: 15 });
    gsap.set('.btn-submit', { opacity: 0, y: 10 });
    gsap.set('.login-footer', { opacity: 0 });

    tl
      .to('.auth-spline-stage', { opacity: 0.65, scale: 1, duration: 0.6 }, 0)
      .to('.brand-header', { opacity: 1, y: 0, duration: 0.5 }, 0.1)
      .to('.login-card', { opacity: 1, y: 0, scale: 1, duration: 0.6 }, 0.2)
      .to('.form-group', { opacity: 1, y: 0, stagger: 0.05, duration: 0.4 }, 0.35)
      .to('.btn-submit', { opacity: 1, y: 0, duration: 0.4 }, 0.55)
      .to('.login-footer', { opacity: 1, duration: 0.5 }, 0.65);

    // Interactive 3D Card Tilt on Cursor Move
    const card = document.querySelector('.login-card');
    if (card) {
      window.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - cardCenterX) / (window.innerWidth / 2);
        const deltaY = (e.clientY - cardCenterY) / (window.innerHeight / 2);

        gsap.to(card, {
          rotationY: deltaX * 6,
          rotationX: -deltaY * 6,
          duration: 0.4,
          ease: 'power1.out',
          transformPerspective: 1200
        });
      }, { passive: true });
    }
  }

  /* ──────────────────────────────────────────────────────────────────────────
   * 2. SPLINE 3D HOLOGRAPHIC GLASS CORE (Native 60fps Canvas Engine)
   * ────────────────────────────────────────────────────────────────────────── */
  const canvas = document.getElementById('authSplineCanvas');
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

      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;

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
      radGlow.addColorStop(0, 'rgba(0, 160, 255, 0.2)');
      radGlow.addColorStop(0.5, 'rgba(0, 59, 115, 0.08)');
      radGlow.addColorStop(1, 'rgba(3, 8, 14, 0)');
      ctx.fillStyle = radGlow;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 220, 0, Math.PI * 2);
      ctx.fill();

      // Inner Wireframe
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

      // Outer Glass Faces
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
