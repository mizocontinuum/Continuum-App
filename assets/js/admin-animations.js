/* ==========================================================================
   Continuum Academy — Admin Dashboard Animations & Interactions
   GSAP 3.12.5 + Canvas 3D Holographic Core + Mobile Drawer Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // 1. Initialize GSAP Entrance Animations (Instant & Lag-Free)
  if (window.gsap) {
    var tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.25 } });

    tl.from('.admin-topbar', {
      y: -12,
      opacity: 0,
      duration: 0.2
    })
    .from('.header-hero-wrap', {
      y: 12,
      opacity: 0,
      duration: 0.25
    }, '-=0.1');
  }

  // 2. Setup Holographic Spline Polyhedron Canvas
  var canvas = document.getElementById('adminSplineCanvas');
  if (canvas) {
    initAdminPolyhedron(canvas);
  }

  // 3. Mobile Responsive Sidebar Drawer Controls
  var mobileMenuBtn = document.getElementById('mobileMenuBtn');
  var sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  var adminSidebar = document.getElementById('adminSidebar');
  var sidebarOverlay = document.getElementById('sidebarOverlay');

  function openSidebar() {
    if (adminSidebar && sidebarOverlay) {
      adminSidebar.classList.add('open');
      sidebarOverlay.classList.add('active');
    }
  }

  function closeSidebar() {
    if (adminSidebar && sidebarOverlay) {
      adminSidebar.classList.remove('open');
      sidebarOverlay.classList.remove('active');
    }
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openSidebar);
  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

  // 4. Modal Handlers for Video Upload
  var uploadBtn = document.getElementById('btnUploadModal');
  var modalBackdrop = document.getElementById('adminModal');
  var modalClose = document.getElementById('modalCloseBtn');
  var modalCancel = document.getElementById('modalCancelBtn');

  function openModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.add('open');
      if (window.gsap) {
        gsap.fromTo('.admin-modal-card', 
          { scale: 0.94, opacity: 0, y: 15 }, 
          { scale: 1, opacity: 1, y: 0, duration: 0.25, ease: 'back.out(1.4)' }
        );
      }
    }
  }

  function closeModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.remove('open');
    }
  }

  if (uploadBtn) uploadBtn.addEventListener('click', openModal);
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalCancel) modalCancel.addEventListener('click', closeModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', function(e) {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  // 5. Navigation Tab Selection
  var navBtns = document.querySelectorAll('.nav-item-btn[data-view]');
  navBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      navBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      if (window.innerWidth <= 992) {
        closeSidebar();
      }
    });
  });
});

/* --------------------------------------------------------------------------
   3D Holographic Dual-Layer Polyhedron (Canvas 2D Renderer)
   Consistent with Landing & Auth Core
   -------------------------------------------------------------------------- */
function initAdminPolyhedron(canvas) {
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var width, height, dpr;
  function resize() {
    dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    width = rect.width || 220;
    height = rect.height || 220;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  // Golden ratio vertices for Icosahedron
  var phi = (1 + Math.sqrt(5)) / 2;
  var rawVertices = [
    [-1,  phi, 0], [ 1,  phi, 0], [-1, -phi, 0], [ 1, -phi, 0],
    [0, -1,  phi], [0,  1,  phi], [0, -1, -phi], [0,  1, -phi],
    [ phi, 0, -1], [ phi, 0,  1], [-phi, 0, -1], [-phi, 0,  1]
  ];

  // Radius scaled to fit canvas container
  var outerRadius = 78;
  var innerRadius = 48;
  var outerVerts = rawVertices.map(function(v) {
    var len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    return [v[0]/len * outerRadius, v[1]/len * outerRadius, v[2]/len * outerRadius];
  });
  var innerVerts = rawVertices.map(function(v) {
    var len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    return [v[0]/len * innerRadius, v[1]/len * innerRadius, v[2]/len * innerRadius];
  });

  // 20 Triangular Faces of an Icosahedron
  var faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
  ];

  var angleX = 0.2;
  var angleY = 0.4;
  var targetAngleX = 0.2;
  var targetAngleY = 0.4;

  window.addEventListener('mousemove', function(e) {
    var nx = (e.clientX / window.innerWidth) - 0.5;
    var ny = (e.clientY / window.innerHeight) - 0.5;
    targetAngleY = nx * 0.4 + 0.4;
    targetAngleX = ny * 0.4 + 0.2;
  });

  function rotateY(p, a) {
    var cos = Math.cos(a), sin = Math.sin(a);
    return [p[0] * cos + p[2] * sin, p[1], -p[0] * sin + p[2] * cos];
  }
  function rotateX(p, a) {
    var cos = Math.cos(a), sin = Math.sin(a);
    return [p[0], p[1] * cos - p[2] * sin, p[1] * sin + p[2] * cos];
  }

  function render() {
    requestAnimationFrame(render);
    ctx.clearRect(0, 0, width, height);

    angleX += (targetAngleX - angleX) * 0.05 + 0.002;
    angleY += (targetAngleY - angleY) * 0.05 + 0.004;

    var cx = width / 2;
    var cy = height / 2;

    // Transform outer vertices
    var transformedOuter = outerVerts.map(function(v) {
      var r = rotateY(v, angleY);
      r = rotateX(r, angleX);
      return [r[0] + cx, r[1] + cy, r[2]];
    });

    // Transform inner vertices (counter-rotating)
    var transformedInner = innerVerts.map(function(v) {
      var r = rotateY(v, -angleY * 1.3);
      r = rotateX(r, -angleX * 1.3);
      return [r[0] + cx, r[1] + cy, r[2]];
    });

    // Inner wireframe
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 127, 255, 0.25)';
    ctx.lineWidth = 1;
    for (var f = 0; f < faces.length; f++) {
      var tri = faces[f];
      ctx.beginPath();
      ctx.moveTo(transformedInner[tri[0]][0], transformedInner[tri[0]][1]);
      ctx.lineTo(transformedInner[tri[1]][0], transformedInner[tri[1]][1]);
      ctx.lineTo(transformedInner[tri[2]][0], transformedInner[tri[2]][1]);
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();

    // Sort outer faces by average Z depth
    var sortedFaces = faces.map(function(indices) {
      var z = (transformedOuter[indices[0]][2] + transformedOuter[indices[1]][2] + transformedOuter[indices[2]][2]) / 3;
      return { indices: indices, z: z };
    });
    sortedFaces.sort(function(a, b) { return a.z - b.z; });

    // Draw outer glass faces
    for (var i = 0; i < sortedFaces.length; i++) {
      var idx = sortedFaces[i].indices;
      var p0 = transformedOuter[idx[0]];
      var p1 = transformedOuter[idx[1]];
      var p2 = transformedOuter[idx[2]];

      var depthAlpha = Math.max(0.08, Math.min(0.35, (sortedFaces[i].z + outerRadius) / (outerRadius * 2)));

      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.closePath();

      ctx.fillStyle = 'rgba(0, 127, 255, ' + (depthAlpha * 0.22) + ')';
      ctx.fill();

      ctx.strokeStyle = 'rgba(51, 181, 255, ' + (depthAlpha * 0.7) + ')';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Glowing vertices
    for (var v = 0; v < transformedOuter.length; v++) {
      var pt = transformedOuter[v];
      ctx.beginPath();
      ctx.arc(pt[0], pt[1], 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#33B5FF';
      ctx.shadowColor = '#007FFF';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  render();
}
