/**
 * Continuum Academy - Auth (Login & Signup) GSAP & Spline 3D Choreography Engine
 * Consistent, clean, steady, zero-lag 60fps performance.
 */
(() => {
  'use strict';

  // Respect user accessibility preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const hasGSAP = typeof gsap !== 'undefined';

  /* ──────────────────────────────────────────────────────────────────────────
   * 1. FAST, FLUID GSAP ENTRANCE (Clean & Steady Card)
   * ────────────────────────────────────────────────────────────────────────── */
  if (hasGSAP) {
    const easeSmooth = 'power2.out';
    const tl = gsap.timeline({ defaults: { ease: easeSmooth } });

    const isSwapped = document.querySelector('.auth-showcase-panel-swapped') !== null;
    const initialSlideX = isSwapped ? 30 : -30;

    // Initial state sets
    gsap.set('.brand-header', { opacity: 0, y: -20 });
    gsap.set('.auth-showcase-panel', { opacity: 0, x: initialSlideX });
    gsap.set('.login-card', { opacity: 0, y: 25, scale: 0.96 });
    gsap.set('.auth-spline-stage', { opacity: 0, scale: 0.9 });
    gsap.set('.form-group', { opacity: 0, y: 12 });
    gsap.set('.btn-submit, .oauth-row', { opacity: 0, y: 10 });
    gsap.set('.login-footer', { opacity: 0 });

    tl
      .to('.brand-header', { opacity: 1, y: 0, duration: 0.45 }, 0.05)
      .to('.auth-showcase-panel', { opacity: 1, x: 0, duration: 0.55 }, 0.1)
      .to('.auth-spline-stage', { opacity: 1, scale: 1, duration: 0.6 }, 0.1)
      .to('.login-card', { opacity: 1, y: 0, scale: 1, duration: 0.5 }, 0.16)
      .to('.form-group', { opacity: 1, y: 0, stagger: 0.035, duration: 0.35 }, 0.28)
      .to('.btn-submit, .oauth-row', { opacity: 1, y: 0, stagger: 0.04, duration: 0.35 }, 0.42)
      .to('.login-footer', { opacity: 1, duration: 0.45 }, 0.52);
  }

  /* ──────────────────────────────────────────────────────────────────────────
   * 2. SPLINE 3D HOLOGRAPHIC LOGO CORE (Interactive 3D Multi-Layer Engine)
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
      targetRotY = mouseX * 0.55;
      targetRotX = -mouseY * 0.45;
    }, { passive: true });

    // Load Continuum Academy Emblem
    const logoImg = new Image();
    logoImg.src = '../assets/images/logo-icon.png';
    let logoLoaded = false;
    logoImg.onload = () => { logoLoaded = true; };
    logoImg.onerror = () => {
      const fallback = new Image();
      fallback.src = 'assets/images/logo-icon.png';
      fallback.onload = () => { logoImg = fallback; logoLoaded = true; };
    };

    let angle = 0;
    let floatTime = 0;

    // Orbiting particles
    const orbitNodes = [];
    for (let i = 0; i < 32; i++) {
      orbitNodes.push({
        theta: (i / 32) * Math.PI * 2,
        speed: 0.012 + (i % 4) * 0.004,
        radius: 170 + (i % 3) * 25,
        yOffset: Math.sin(i * 1.8) * 50,
        size: 1.8 + (i % 3) * 1.2
      });
    }

    function renderSplineCore() {
      ctx.clearRect(0, 0, width, height);

      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;

      angle += 0.012;
      floatTime += 0.025;

      const totalYaw = angle + currentRotY;
      const totalPitch = Math.sin(floatTime * 0.6) * 0.15 + currentRotX;
      const floatOffsetY = Math.sin(floatTime) * 12;

      const cx = width / 2;
      const cy = height / 2 + floatOffsetY;

      // 1. Ambient Hologram Backlight Aura
      const radGlow = ctx.createRadialGradient(cx, cy, 30, cx, cy, 270);
      radGlow.addColorStop(0, 'rgba(0, 160, 255, 0.32)');
      radGlow.addColorStop(0.45, 'rgba(0, 127, 255, 0.12)');
      radGlow.addColorStop(1, 'rgba(3, 8, 14, 0)');
      ctx.fillStyle = radGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, 270, 0, Math.PI * 2);
      ctx.fill();

      // 2. Dual Gyroscope 3D Orbital Rings (Balanced Proportion)
      ctx.save();
      ctx.translate(cx, cy);

      // Ring 1 (Azure Dash)
      ctx.beginPath();
      ctx.ellipse(0, 0, 215, 70, totalYaw * 0.45, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.28)';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([8, 8]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Ring 2 (Outer Deep Azure Solid)
      ctx.beginPath();
      ctx.ellipse(0, 0, 195, 54, -totalYaw * 0.35 + 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 127, 255, 0.32)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();

      // 3. Render 3D Logo Extrusion with Layered Depth (Clean & Balanced: baseH = 225px)
      const logoAspect = 247 / 292;
      const baseH = 225;
      const baseW = baseH * logoAspect; // ~190px
      const cosY = Math.cos(totalYaw);
      const sinY = Math.sin(totalYaw);

      if (logoLoaded) {
        const depthLayers = 22;
        const depthSpread = 40; // Balanced 3D volume depth

        for (let l = -depthLayers / 2; l <= depthLayers / 2; l++) {
          const layerZ = (l / depthLayers) * depthSpread;
          const pX = layerZ * sinY;
          const pZ = layerZ * cosY;
          const pY = layerZ * Math.sin(totalPitch) * -cosY;

          const scaleProj = 1 + (pZ / 500);
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
            ctx.shadowBlur = 25;
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

        // Specular highlight pulse when facing user
        const faceForward = Math.abs(cosY);
        if (faceForward > 0.35) {
          ctx.save();
          const shineR = 60 * faceForward;
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

      // 4. Orbiting Holographic Data Sparks
      orbitNodes.forEach((node, idx) => {
        node.theta += node.speed;
        const px = Math.cos(node.theta) * node.radius;
        const pz = Math.sin(node.theta) * node.radius;
        const py = node.yOffset + Math.sin(node.theta * 2 + floatTime) * 14;

        const rx = px * Math.cos(totalYaw * 0.4) - pz * Math.sin(totalYaw * 0.4);
        const rz = px * Math.sin(totalYaw * 0.4) + pz * Math.cos(totalYaw * 0.4);

        const pScale = (rz + 260) / 520;
        if (pScale < 0.2) return;

        const fx = cx + rx;
        const fy = cy + py * 0.7;

        ctx.beginPath();
        ctx.arc(fx, fy, node.size * pScale, 0, Math.PI * 2);
        ctx.fillStyle = idx % 2 === 0 ? '#00D4FF' : '#3388FF';
        ctx.shadowColor = '#00D4FF';
        ctx.shadowBlur = 8 * pScale;
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
