/* ==========================================================================
   Continuum Academy — Admin Dashboard Animations & Analytics Logic
   GSAP 3.12.5 + Canvas 3D Holographic Core + Full Interactive Analytics Engine
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
    .from('.header-hero-wrap, .reports-header-card', {
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

  // 5. Multi-View Switching (Dashboard <-> Analytics & Reports)
  var navBtns = document.querySelectorAll('.nav-item-btn[data-view]');
  var dashboardView = document.getElementById('dashboardView');
  var analyticsView = document.getElementById('analyticsView');

  function switchView(viewName) {
    navBtns.forEach(function(b) {
      if (b.getAttribute('data-view') === viewName) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    if (viewName === 'analytics') {
      if (dashboardView) dashboardView.classList.remove('active');
      if (analyticsView) {
        analyticsView.classList.add('active');
        renderAnalyticsData(currentFilter);
      }
    } else {
      // Default to Dashboard
      if (analyticsView) analyticsView.classList.remove('active');
      if (dashboardView) dashboardView.classList.add('active');
    }

    if (window.innerWidth <= 992) {
      closeSidebar();
    }
  }

  navBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var view = btn.getAttribute('data-view');
      switchView(view);
    });
  });

  // Check URL hash on load (e.g. #analytics)
  if (window.location.hash === '#analytics') {
    switchView('analytics');
  }

  // ==========================================================================
  // 6. Analytics & Reports Engine: Mock Data, Date Filtering, & Recharts SVG
  // ==========================================================================

  var currentFilter = '30d';

  var analyticsData = {
    '7d': {
      totalViews: '8,420',
      deltaViews: '+18.4% vs last week',
      activeStudents: '482',
      deltaStudents: '+8.1% weekly active',
      watchTime: '620 hrs',
      deltaWatchTime: '+12.4% avg daily',
      completionRate: '78.2%',
      deltaCompletion: '+2.1% completion rate',
      chartPoints: [
        { label: 'Mon', views: 980, completed: 740 },
        { label: 'Tue', views: 1120, completed: 860 },
        { label: 'Wed', views: 1340, completed: 1020 },
        { label: 'Thu', views: 1210, completed: 910 },
        { label: 'Fri', views: 1480, completed: 1150 },
        { label: 'Sat', views: 1180, completed: 890 },
        { label: 'Sun', views: 1110, completed: 830 }
      ],
      topVideos: [
        { rank: 1, title: 'Josiah Go: The Marketing Discipline', tag: 'Marketing', views: '2,840', likes: '312', rate: '86%' },
        { rank: 2, title: 'Executive Venture Acceleration 2026', tag: 'Leadership', views: '2,110', likes: '245', rate: '79%' },
        { rank: 3, title: 'Closing the Executive Strategy Action Gap', tag: 'Strategy', views: '1,590', likes: '188', rate: '74%' },
        { rank: 4, title: 'Omnichannel Retail Transformation', tag: 'Retail', views: '1,080', likes: '142', rate: '72%' },
        { rank: 5, title: 'Disruptive Venture Capital & Board Scaling', tag: 'Finance', views: '800', likes: '96', rate: '81%' }
      ],
      students: [
        { name: 'Marcus Rodriguez', email: 'm.rodriguez@executive.ph', lesson: 'Brand Strategy Masterclass', time: '14 mins ago', progress: 75, initials: 'MR' },
        { name: 'Alysia Tan', email: 'alysia.tan@innovate.co', lesson: 'Disruptive Venture Scaling', time: '32 mins ago', progress: 96, initials: 'AT' },
        { name: 'Danilo Mendoza', email: 'danilo.m@mendoza-holdings.com', lesson: 'Marketing Blue Ocean Shift', time: '1 hr ago', progress: 35, initials: 'DM' },
        { name: 'Christine Laurel', email: 'claurel@apexretail.org', lesson: 'Crisis Communication Protocol', time: '2 hrs ago', progress: 100, initials: 'CL' }
      ]
    },
    '30d': {
      totalViews: '38,420',
      deltaViews: '+28.5% vs previous period',
      activeStudents: '1,280',
      deltaStudents: '+14.2% monthly growth',
      watchTime: '2,450 hrs',
      deltaWatchTime: '+19.8% engagement',
      completionRate: '76.4%',
      deltaCompletion: '+4.1% higher retention',
      chartPoints: [
        { label: 'Week 1', views: 7600, completed: 5800 },
        { label: 'Week 2', views: 8900, completed: 6800 },
        { label: 'Week 3', views: 10400, completed: 8100 },
        { label: 'Week 4', views: 11520, completed: 8850 }
      ],
      topVideos: [
        { rank: 1, title: 'Josiah Go: The Marketing Discipline', tag: 'Marketing', views: '11,480', likes: '1,290', rate: '88%' },
        { rank: 2, title: 'Closing the Executive Strategy Action Gap', tag: 'Strategy', views: '8,920', likes: '984', rate: '77%' },
        { rank: 3, title: 'Executive Venture Acceleration 2026', tag: 'Leadership', views: '7,430', likes: '840', rate: '82%' },
        { rank: 4, title: 'Omnichannel Retail Transformation', tag: 'Retail', views: '5,810', likes: '620', rate: '71%' },
        { rank: 5, title: 'Crisis Leadership & Media Handling', tag: 'Strategy', views: '4,780', likes: '512', rate: '84%' }
      ],
      students: [
        { name: 'Marcus Rodriguez', email: 'm.rodriguez@executive.ph', lesson: 'Brand Strategy Masterclass', time: 'Today, 10:14 AM', progress: 71, initials: 'MR' },
        { name: 'Alysia Tan', email: 'alysia.tan@innovate.co', lesson: 'Disruptive Venture Scaling', time: 'Today, 9:20 AM', progress: 96, initials: 'AT' },
        { name: 'Danilo Mendoza', email: 'danilo.m@mendoza-holdings.com', lesson: 'Marketing Blue Ocean Shift', time: 'Yesterday', progress: 25, initials: 'DM' },
        { name: 'Christine Laurel', email: 'claurel@apexretail.org', lesson: 'Executive Crisis Communication', time: 'Nov 18, 2026', progress: 100, initials: 'CL' }
      ]
    },
    '90d': {
      totalViews: '114,800',
      deltaViews: '+34.2% vs previous quarter',
      activeStudents: '2,640',
      deltaStudents: '+21.5% quarterly active',
      watchTime: '7,890 hrs',
      deltaWatchTime: '+26.1% quarterly watch time',
      completionRate: '75.8%',
      deltaCompletion: '+5.6% completion stability',
      chartPoints: [
        { label: 'Month 1', views: 32000, completed: 24500 },
        { label: 'Month 2', views: 38500, completed: 29000 },
        { label: 'Month 3', views: 44300, completed: 34100 }
      ],
      topVideos: [
        { rank: 1, title: 'Josiah Go: The Marketing Discipline', tag: 'Marketing', views: '32,100', likes: '3,840', rate: '87%' },
        { rank: 2, title: 'Closing the Executive Strategy Action Gap', tag: 'Strategy', views: '26,400', likes: '2,910', rate: '76%' },
        { rank: 3, title: 'Executive Venture Acceleration 2026', tag: 'Leadership', views: '22,150', likes: '2,490', rate: '81%' },
        { rank: 4, title: 'Omnichannel Retail Transformation', tag: 'Retail', views: '18,200', likes: '1,950', rate: '73%' },
        { rank: 5, title: 'High-Impact Brand Building in Asia', tag: 'Marketing', views: '15,950', likes: '1,680', rate: '85%' }
      ],
      students: [
        { name: 'Marcus Rodriguez', email: 'm.rodriguez@executive.ph', lesson: 'Brand Strategy Masterclass', time: 'Active 24x', progress: 88, initials: 'MR' },
        { name: 'Alysia Tan', email: 'alysia.tan@innovate.co', lesson: 'Disruptive Venture Scaling', time: 'Active 38x', progress: 100, initials: 'AT' },
        { name: 'Danilo Mendoza', email: 'danilo.m@mendoza-holdings.com', lesson: 'Marketing Blue Ocean Shift', time: 'Active 12x', progress: 65, initials: 'DM' },
        { name: 'Christine Laurel', email: 'claurel@apexretail.org', lesson: 'Executive Crisis Communication', time: 'Active 19x', progress: 100, initials: 'CL' }
      ]
    },
    '12m': {
      totalViews: '428,500',
      deltaViews: '+62.8% annual view trajectory',
      activeStudents: '5,420',
      deltaStudents: '+48.3% year-over-year',
      watchTime: '29,400 hrs',
      deltaWatchTime: '+54.0% annualized stream hrs',
      completionRate: '77.2%',
      deltaCompletion: '+6.8% annual completion',
      chartPoints: [
        { label: 'Q1', views: 82000, completed: 62000 },
        { label: 'Q2', views: 98000, completed: 74000 },
        { label: 'Q3', views: 114000, completed: 88000 },
        { label: 'Q4', views: 134500, completed: 104500 }
      ],
      topVideos: [
        { rank: 1, title: 'Josiah Go: The Marketing Discipline', tag: 'Marketing', views: '124,000', likes: '14,200', rate: '89%' },
        { rank: 2, title: 'Closing the Executive Strategy Action Gap', tag: 'Strategy', views: '98,500', likes: '11,400', rate: '78%' },
        { rank: 3, title: 'Executive Venture Acceleration 2026', tag: 'Leadership', views: '84,200', likes: '9,850', rate: '83%' },
        { rank: 4, title: 'Omnichannel Retail Transformation', tag: 'Retail', views: '64,800', likes: '7,400', rate: '75%' },
        { rank: 5, title: 'Strategic Product Innovation Cycles', tag: 'Innovation', views: '57,000', likes: '6,150', rate: '86%' }
      ],
      students: [
        { name: 'Marcus Rodriguez', email: 'm.rodriguez@executive.ph', lesson: 'Brand Strategy Series', time: 'Certified Alumni', progress: 100, initials: 'MR' },
        { name: 'Alysia Tan', email: 'alysia.tan@innovate.co', lesson: 'Disruptive Venture Track', time: 'Honor Student', progress: 100, initials: 'AT' },
        { name: 'Danilo Mendoza', email: 'danilo.m@mendoza-holdings.com', lesson: 'Marketing Executive Path', time: 'Executive Fellow', progress: 85, initials: 'DM' },
        { name: 'Christine Laurel', email: 'claurel@apexretail.org', lesson: 'Strategic Retail Operations', time: 'Executive Fellow', progress: 95, initials: 'CL' }
      ]
    }
  };

  function renderAnalyticsData(filterKey) {
    var data = analyticsData[filterKey] || analyticsData['30d'];

    // Update 4 Stat Cards
    var statTotalViews = document.getElementById('statTotalViews');
    var deltaViews = document.getElementById('deltaViews');
    var statActiveStudents = document.getElementById('statActiveStudents');
    var deltaStudents = document.getElementById('deltaStudents');
    var statTotalWatchTime = document.getElementById('statTotalWatchTime');
    var deltaWatchTime = document.getElementById('deltaWatchTime');
    var statCompletionRate = document.getElementById('statCompletionRate');
    var deltaCompletion = document.getElementById('deltaCompletion');

    if (statTotalViews) statTotalViews.textContent = data.totalViews;
    if (deltaViews) deltaViews.textContent = data.deltaViews;
    if (statActiveStudents) statActiveStudents.textContent = data.activeStudents;
    if (deltaStudents) deltaStudents.textContent = data.deltaStudents;
    if (statTotalWatchTime) statTotalWatchTime.textContent = data.watchTime;
    if (deltaWatchTime) deltaWatchTime.textContent = data.deltaWatchTime;
    if (statCompletionRate) statCompletionRate.textContent = data.completionRate;
    if (deltaCompletion) deltaCompletion.textContent = data.deltaCompletion;

    // Render Dynamic Vector Chart (Inspired by Recharts line chart)
    renderInteractiveChart(data.chartPoints);

    // Render Top 5 Performing Videos
    var topVideosTbody = document.getElementById('topVideosTableBody');
    if (topVideosTbody) {
      topVideosTbody.innerHTML = '';
      data.topVideos.forEach(function (vid) {
        var tr = document.createElement('tr');
        tr.innerHTML = 
          '<td><span class="rank-badge">' + vid.rank + '</span></td>' +
          '<td>' +
            '<div style="font-weight: 600; color: #FFF; font-size: 13px;">' + vid.title + '</div>' +
            '<span class="video-tag-pill" style="margin-top: 3px; display: inline-block;">' + vid.tag + '</span>' +
          '</td>' +
          '<td><div class="video-stat-pill"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg><span style="font-weight:600; color:#FFF;">' + vid.views + '</span></div></td>' +
          '<td><div class="video-stat-pill"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg><span>' + vid.likes + '</span></div></td>' +
          '<td>' +
            '<div class="progress-bar-wrap" style="width: 70px;"><div class="progress-bar-fill" style="width:' + vid.rate + '"></div></div>' +
            '<span style="font-size: 11.5px; font-weight: 700; color: #FFF;">' + vid.rate + '</span>' +
          '</td>';
        topVideosTbody.appendChild(tr);
      });
    }

    // Render Compact Student Activity
    var studentsTbody = document.getElementById('studentActivityTableBody');
    if (studentsTbody) {
      studentsTbody.innerHTML = '';
      data.students.forEach(function (stu) {
        var tr = document.createElement('tr');
        tr.innerHTML = 
          '<td>' +
            '<div class="student-cell">' +
              '<div class="student-avatar">' + stu.initials + '</div>' +
              '<div>' +
                '<div class="student-meta-name">' + stu.name + '</div>' +
                '<div class="student-meta-email">' + stu.email + '</div>' +
              '</div>' +
            '</div>' +
          '</td>' +
          '<td><span style="font-weight: 500; color: #FFF;">' + stu.lesson + '</span></td>' +
          '<td><span style="font-size: 11.5px; color: var(--text-muted);">' + stu.time + '</span></td>' +
          '<td>' +
            '<div class="progress-bar-wrap" style="width: 65px;"><div class="progress-bar-fill" style="width:' + stu.progress + '%;"></div></div>' +
            '<span style="font-size: 11.5px; font-weight: 600;">' + stu.progress + '%</span>' +
          '</td>';
        studentsTbody.appendChild(tr);
      });
    }
  }

  // Interactive SVG Chart Generator (Line Chart with Area Fill & Hover tooltips)
  function renderInteractiveChart(points) {
    var container = document.getElementById('analyticsChartContainer');
    if (!container) return;

    var w = container.clientWidth || 800;
    var h = 210;
    var padLeft = 45;
    var padRight = 25;
    var padTop = 20;
    var padBottom = 35;

    var chartW = w - padLeft - padRight;
    var chartH = h - padTop - padBottom;

    var maxVal = 0;
    points.forEach(function (p) {
      if (p.views > maxVal) maxVal = p.views;
    });
    maxVal = Math.ceil(maxVal * 1.15);

    var stepX = chartW / (points.length - 1 || 1);

    var viewsCoords = points.map(function (p, i) {
      var x = padLeft + i * stepX;
      var y = padTop + chartH - (p.views / maxVal) * chartH;
      return { x: x, y: y, data: p };
    });

    var compCoords = points.map(function (p, i) {
      var x = padLeft + i * stepX;
      var y = padTop + chartH - (p.completed / maxVal) * chartH;
      return { x: x, y: y, data: p };
    });

    // Path strings
    function buildPath(coords) {
      return coords.map(function (pt, idx) {
        return (idx === 0 ? 'M' : 'L') + pt.x + ',' + pt.y;
      }).join(' ');
    }

    var viewsLine = buildPath(viewsCoords);
    var compLine = buildPath(compCoords);

    var areaPath = viewsLine + ' L' + viewsCoords[viewsCoords.length - 1].x + ',' + (padTop + chartH) +
                   ' L' + viewsCoords[0].x + ',' + (padTop + chartH) + ' Z';

    var svgHtml = 
      '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">' +
        '<defs>' +
          '<linearGradient id="viewsAreaGrad" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="#1EA0FF" stop-opacity="0.35"/>' +
            '<stop offset="100%" stop-color="#1EA0FF" stop-opacity="0.0"/>' +
          '</linearGradient>' +
        '</defs>' +

        // Horizontal Gridlines
        '<line x1="' + padLeft + '" y1="' + padTop + '" x2="' + (w - padRight) + '" y2="' + padTop + '" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3"/>' +
        '<line x1="' + padLeft + '" y1="' + (padTop + chartH * 0.5) + '" x2="' + (w - padRight) + '" y2="' + (padTop + chartH * 0.5) + '" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3"/>' +
        '<line x1="' + padLeft + '" y1="' + (padTop + chartH) + '" x2="' + (w - padRight) + '" y2="' + (padTop + chartH) + '" stroke="rgba(255,255,255,0.12)"/>' +

        // Area Gradient Fill
        '<path d="' + areaPath + '" fill="url(#viewsAreaGrad)"/>' +

        // Completions Line (Green)
        '<path d="' + compLine + '" fill="none" stroke="#00E599" stroke-width="2.2" stroke-linecap="round"/>' +

        // Views Line (Cyan Azure)
        '<path d="' + viewsLine + '" fill="none" stroke="#1EA0FF" stroke-width="2.8" stroke-linecap="round"/>';

    // Data points & X labels
    viewsCoords.forEach(function (pt) {
      svgHtml += 
        '<circle cx="' + pt.x + '" cy="' + pt.y + '" r="4" fill="#1EA0FF" stroke="#03080E" stroke-width="2"/>' +
        '<text x="' + pt.x + '" y="' + (h - 10) + '" fill="#8FA6C1" font-size="11" text-anchor="middle" font-family="Inter, sans-serif">' + pt.data.label + '</text>';
    });

    compCoords.forEach(function (pt) {
      svgHtml += 
        '<circle cx="' + pt.x + '" cy="' + pt.y + '" r="3.5" fill="#00E599" stroke="#03080E" stroke-width="1.8"/>';
    });

    svgHtml += '</svg>';
    container.innerHTML = svgHtml;
  }

  // Handle Date Filter Change
  var dateFilterSelect = document.getElementById('analyticsDateFilter');
  if (dateFilterSelect) {
    dateFilterSelect.addEventListener('change', function () {
      currentFilter = dateFilterSelect.value;
      renderAnalyticsData(currentFilter);
    });
  }

  // Handle CSV Export
  function exportCsvReport() {
    var data = analyticsData[currentFilter] || analyticsData['30d'];
    var csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "CONTINUUM ACADEMY - EXECUTIVE ANALYTICS REPORT\n";
    csvContent += "Generated On: " + new Date().toLocaleDateString() + "\n";
    csvContent += "Selected Period: " + currentFilter + "\n\n";

    csvContent += "KEY PERFORMANCE METRICS\n";
    csvContent += "Total Views," + data.totalViews.replace(/,/g, '') + "\n";
    csvContent += "Active Students," + data.activeStudents.replace(/,/g, '') + "\n";
    csvContent += "Total Watch Time," + data.watchTime + "\n";
    csvContent += "Completion Rate," + data.completionRate + "\n\n";

    csvContent += "TOP PERFORMING MASTERCLASSES\n";
    csvContent += "Rank,Title,Category,Total Views,Likes,Completion Rate\n";
    data.topVideos.forEach(function (v) {
      csvContent += v.rank + ',"' + v.title + '",' + v.tag + ',' + v.views.replace(/,/g, '') + ',' + v.likes.replace(/,/g, '') + ',' + v.rate + "\n";
    });

    csvContent += "\nRECENT STUDENT ACTIVITY\n";
    csvContent += "Student Name,Email,Lesson,Time,Progress\n";
    data.students.forEach(function (s) {
      csvContent += '"' + s.name + '","' + s.email + '","' + s.lesson + '","' + s.time + '",' + s.progress + "%\n";
    });

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "continuum_analytics_" + currentFilter + "_" + Date.now() + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Handle PDF / Print Report
  function exportPdfReport() {
    window.print();
  }

  var btnExportCsv = document.getElementById('btnExportCsv');
  var btnToolbarCsv = document.getElementById('btnToolbarCsv');
  var btnExportPdf = document.getElementById('btnExportPdf');
  var btnToolbarPdf = document.getElementById('btnToolbarPdf');
  var btnPrintReport = document.getElementById('btnPrintReport');

  if (btnExportCsv) btnExportCsv.addEventListener('click', exportCsvReport);
  if (btnToolbarCsv) btnToolbarCsv.addEventListener('click', exportCsvReport);
  if (btnExportPdf) btnExportPdf.addEventListener('click', exportPdfReport);
  if (btnToolbarPdf) btnToolbarPdf.addEventListener('click', exportPdfReport);
  if (btnPrintReport) btnPrintReport.addEventListener('click', exportPdfReport);

  // Initial render of analytics
  renderAnalyticsData(currentFilter);
});

/* --------------------------------------------------------------------------
   3D Holographic Dual-Layer Polyhedron (Canvas 2D Renderer)
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

  var phi = (1 + Math.sqrt(5)) / 2;
  var rawVertices = [
    [-1,  phi, 0], [ 1,  phi, 0], [-1, -phi, 0], [ 1, -phi, 0],
    [0, -1,  phi], [0,  1,  phi], [0, -1, -phi], [0,  1, -phi],
    [ phi, 0, -1], [ phi, 0,  1], [-phi, 0, -1], [-phi, 0,  1]
  ];

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

    var transformedOuter = outerVerts.map(function(v) {
      var r = rotateY(v, angleY);
      r = rotateX(r, angleX);
      return [r[0] + cx, r[1] + cy, r[2]];
    });

    var transformedInner = innerVerts.map(function(v) {
      var r = rotateY(v, -angleY * 1.3);
      r = rotateX(r, -angleX * 1.3);
      return [r[0] + cx, r[1] + cy, r[2]];
    });

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

    var sortedFaces = faces.map(function(indices) {
      var z = (transformedOuter[indices[0]][2] + transformedOuter[indices[1]][2] + transformedOuter[indices[2]][2]) / 3;
      return { indices: indices, z: z };
    });
    sortedFaces.sort(function(a, b) { return a.z - b.z; });

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
