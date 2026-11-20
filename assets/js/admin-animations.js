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

    var dashboardView = document.getElementById('dashboardView');
    var analyticsView = document.getElementById('analyticsView');
    var videosView = document.getElementById('videosView');
    var studentsView = document.getElementById('studentsView');
    var categoriesView = document.getElementById('categoriesView');
    var settingsView = document.getElementById('settingsView');

    // Deactivate all panes
    if (dashboardView) dashboardView.classList.remove('active');
    if (analyticsView) analyticsView.classList.remove('active');
    if (videosView) videosView.classList.remove('active');
    if (studentsView) studentsView.classList.remove('active');
    if (categoriesView) categoriesView.classList.remove('active');
    if (settingsView) settingsView.classList.remove('active');

    if (viewName === 'analytics') {
      if (analyticsView) {
        analyticsView.classList.add('active');
        renderAnalyticsData(currentFilter);
      }
    } else if (viewName === 'videos') {
      if (videosView) {
        videosView.classList.add('active');
        renderVideoManagement();
      }
    } else if (viewName === 'students') {
      if (studentsView) {
        studentsView.classList.add('active');
        renderStudentsManagement();
      }
    } else if (viewName === 'categories') {
      if (categoriesView) {
        categoriesView.classList.add('active');
        renderCategoryManagement();
      }
    } else if (viewName === 'settings') {
      if (settingsView) {
        settingsView.classList.add('active');
      }
    } else {
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

  // Check URL hash on load (e.g. #analytics, #videos, #students)
  if (window.location.hash === '#analytics') {
    switchView('analytics');
  } else if (window.location.hash === '#videos') {
    switchView('videos');
  } else if (window.location.hash === '#students') {
    switchView('students');
  } else if (window.location.hash === '#categories') {
    switchView('categories');
  } else if (window.location.hash === '#settings') {
    switchView('settings');
  } else if (window.location.hash === '#categories') {
    switchView('categories');
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

  // ==========================================================================
  // 7. Complete Video Management Engine (CRUD, Filter, Search, Pagination)
  // ==========================================================================

  var videoDataset = [
    {
      id: 1,
      title: 'Josiah Go: The Marketing Discipline',
      speaker: 'Josiah Go',
      category: 'Marketing',
      uploadDate: 'Nov 14, 2026',
      rawDate: '2026-11-14',
      views: 11480,
      likes: 1290,
      status: 'published',
      duration: '42 mins',
      thumbnail: 'card-1.png',
      description: 'The master discipline of strategic positioning, value proposition architecture, and marketing defensibility for business leaders.'
    },
    {
      id: 2,
      title: 'Closing the Executive Strategy Action Gap',
      speaker: 'Mansmith Faculty',
      category: 'Strategy',
      uploadDate: 'Nov 12, 2026',
      rawDate: '2026-11-12',
      views: 8920,
      likes: 984,
      status: 'published',
      duration: '49 mins',
      thumbnail: 'card-4.png',
      description: 'Bridging the disconnect between board-level strategy formulation and operational execution on the frontline.'
    },
    {
      id: 3,
      title: 'Executive Venture Acceleration 2026',
      speaker: 'Chito Salazar',
      category: 'Leadership',
      uploadDate: 'Nov 10, 2026',
      rawDate: '2026-11-10',
      views: 7430,
      likes: 840,
      status: 'published',
      duration: '58 mins',
      thumbnail: 'card-2.png',
      description: 'Playbook for scaling ventures through uncertain regulatory, market, and technological turbulence.'
    },
    {
      id: 4,
      title: 'Omnichannel Retail Transformation',
      speaker: 'Retail Council',
      category: 'Retail',
      uploadDate: 'Nov 08, 2026',
      rawDate: '2026-11-08',
      views: 5810,
      likes: 620,
      status: 'published',
      duration: '35 mins',
      thumbnail: 'card-3.png',
      description: 'Integrating offline department stores with dark stores, live commerce, and algorithmic inventory delivery.'
    },
    {
      id: 5,
      title: 'Crisis Leadership & Media Handling',
      speaker: 'Mariles Gustilo',
      category: 'Strategy',
      uploadDate: 'Nov 05, 2026',
      rawDate: '2026-11-05',
      views: 4780,
      likes: 512,
      status: 'published',
      duration: '38 mins',
      thumbnail: 'card-5.png',
      description: 'Protocols for brand recovery, executive messaging, and crisis response under aggressive public scrutiny.'
    },
    {
      id: 6,
      title: 'Corporate Venture Capital & Board Scaling',
      speaker: 'Arthur Tan',
      category: 'Finance',
      uploadDate: 'Nov 02, 2026',
      rawDate: '2026-11-02',
      views: 0,
      likes: 0,
      status: 'draft',
      duration: '52 mins',
      thumbnail: 'card-2.png',
      description: 'Structuring internal incubators, equity-for-synergy investments, and managing founder relations.'
    },
    {
      id: 7,
      title: 'High-Impact Brand Building in Emerging Asia',
      speaker: 'Josiah Go',
      category: 'Marketing',
      uploadDate: 'Oct 28, 2026',
      rawDate: '2026-10-28',
      views: 3200,
      likes: 410,
      status: 'published',
      duration: '45 mins',
      thumbnail: 'card-1.png',
      description: 'Cracking non-traditional distribution, consumer insights, and cross-border expansion in Southeast Asia.'
    },
    {
      id: 8,
      title: 'Behavioral Economics in Commercial Pricing',
      speaker: 'Dr. Ned Roberto',
      category: 'Marketing',
      uploadDate: 'Oct 20, 2026',
      rawDate: '2026-10-20',
      views: 0,
      likes: 0,
      status: 'draft',
      duration: '40 mins',
      thumbnail: 'card-4.png',
      description: 'How consumer psychological anchors influence willingness-to-pay and bundle elasticity.'
    }
  ];

  var vmSearch = '';
  var vmCategory = 'all';
  var vmStatus = 'all';
  var vmSort = 'newest';
  var vmCurrentPage = 1;
  var vmPerPage = 5;

  var pendingDeleteId = null;

  function renderVideoManagement() {
    // 1. Update Video Statistics Cards
    var totalCount = videoDataset.length;
    var pubCount = videoDataset.filter(function(v) { return v.status === 'published'; }).length;
    var draftCount = totalCount - pubCount;
    var totalViews = videoDataset.reduce(function(acc, v) { return acc + v.views; }, 0);

    var elTotal = document.getElementById('statVmTotalVideos');
    var elPub = document.getElementById('statVmPublished');
    var elDraft = document.getElementById('statVmDrafts');
    var elViews = document.getElementById('statVmViews');

    if (elTotal) elTotal.textContent = totalCount;
    if (elPub) elPub.textContent = pubCount;
    if (elDraft) elDraft.textContent = draftCount;
    if (elViews) elViews.textContent = totalViews.toLocaleString();

    // 2. Filter & Sort Dataset
    var filtered = videoDataset.filter(function(vid) {
      var matchesSearch = !vmSearch || 
        vid.title.toLowerCase().indexOf(vmSearch.toLowerCase()) !== -1 ||
        vid.speaker.toLowerCase().indexOf(vmSearch.toLowerCase()) !== -1;
      
      var matchesCategory = vmCategory === 'all' || vid.category === vmCategory;
      var matchesStatus = vmStatus === 'all' || vid.status === vmStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    if (vmSort === 'newest') {
      filtered.sort(function(a, b) { return new Date(b.rawDate) - new Date(a.rawDate); });
    } else if (vmSort === 'oldest') {
      filtered.sort(function(a, b) { return new Date(a.rawDate) - new Date(b.rawDate); });
    } else if (vmSort === 'views') {
      filtered.sort(function(a, b) { return b.views - a.views; });
    }

    // 3. Paginate
    var totalFiltered = filtered.length;
    var totalPages = Math.ceil(totalFiltered / vmPerPage) || 1;
    if (vmCurrentPage > totalPages) vmCurrentPage = totalPages;
    if (vmCurrentPage < 1) vmCurrentPage = 1;

    var startIdx = (vmCurrentPage - 1) * vmPerPage;
    var pageItems = filtered.slice(startIdx, startIdx + vmPerPage);

    var elTableCount = document.getElementById('vmTableCount');
    if (elTableCount) elTableCount.textContent = 'Showing ' + pageItems.length + ' of ' + totalFiltered + ' videos';

    var elPaginationInfo = document.getElementById('vmPaginationInfo');
    if (elPaginationInfo) {
      var startNum = totalFiltered === 0 ? 0 : startIdx + 1;
      var endNum = Math.min(startIdx + vmPerPage, totalFiltered);
      elPaginationInfo.textContent = 'Showing ' + startNum + '-' + endNum + ' of ' + totalFiltered + ' videos';
    }

    // Render Table Rows
    var tbody = document.getElementById('vmTableBody');
    if (tbody) {
      tbody.innerHTML = '';
      if (pageItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 32px; color: var(--text-dim);">No educational videos match your criteria.</td></tr>';
      } else {
        pageItems.forEach(function(vid) {
          var tr = document.createElement('tr');
          var statusBadgeClass = vid.status === 'published' ? 'published' : 'draft';
          var statusLabel = vid.status === 'published' ? 'Published' : 'Draft';
          var toggleIconTitle = vid.status === 'published' ? 'Unpublish video' : 'Publish video';

          tr.innerHTML = 
            '<td><img src="../assets/images/' + vid.thumbnail + '" alt="Thumb" style="width: 68px; height: 40px; border-radius: 6px; object-fit: cover; border: 1px solid rgba(0,127,255,0.2);"></td>' +
            '<td>' +
              '<div style="font-weight: 600; color: #FFF; font-size: 13px;">' + vid.title + '</div>' +
              '<div style="font-size: 11px; color: var(--text-dim);">Speaker: ' + vid.speaker + ' · ' + vid.duration + '</div>' +
            '</td>' +
            '<td><span class="video-tag-pill">' + vid.category + '</span></td>' +
            '<td><span style="font-size: 12px; color: var(--text-muted);">' + vid.uploadDate + '</span></td>' +
            '<td><span style="font-weight: 600; color: #FFF;">' + vid.views.toLocaleString() + '</span></td>' +
            '<td><span style="color: var(--text-muted);">' + vid.likes.toLocaleString() + '</span></td>' +
            '<td><span class="status-badge ' + statusBadgeClass + '">' + statusLabel + '</span></td>' +
            '<td style="text-align: right; padding-right: 20px;">' +
              '<div class="row-actions" style="justify-content: flex-end;">' +
                '<button class="action-icon-btn btn-vm-view" data-id="' + vid.id + '" title="View video details">' +
                  '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>' +
                '</button>' +
                '<button class="action-icon-btn btn-vm-toggle" data-id="' + vid.id + '" title="' + toggleIconTitle + '">' +
                  '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>' +
                '</button>' +
                '<button class="action-icon-btn btn-vm-edit" data-id="' + vid.id + '" title="Edit video">' +
                  '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>' +
                '</button>' +
                '<button class="action-icon-btn danger btn-vm-delete" data-id="' + vid.id + '" title="Delete video">' +
                  '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>' +
                '</button>' +
              '</div>' +
            '</td>';
          tbody.appendChild(tr);
        });
      }
    }

    // Render Pagination Buttons
    var paginationContainer = document.getElementById('vmPaginationButtons');
    if (paginationContainer) {
      paginationContainer.innerHTML = '';
      
      // Prev Button
      var prevBtn = document.createElement('button');
      prevBtn.className = 'page-num-btn';
      prevBtn.innerHTML = '&larr;';
      prevBtn.disabled = vmCurrentPage <= 1;
      prevBtn.onclick = function() { if (vmCurrentPage > 1) { vmCurrentPage--; renderVideoManagement(); } };
      paginationContainer.appendChild(prevBtn);

      for (var p = 1; p <= totalPages; p++) {
        (function(page) {
          var btn = document.createElement('button');
          btn.className = 'page-num-btn' + (page === vmCurrentPage ? ' active' : '');
          btn.textContent = page;
          btn.onclick = function() { vmCurrentPage = page; renderVideoManagement(); };
          paginationContainer.appendChild(btn);
        })(p);
      }

      // Next Button
      var nextBtn = document.createElement('button');
      nextBtn.className = 'page-num-btn';
      nextBtn.innerHTML = '&rarr;';
      nextBtn.disabled = vmCurrentPage >= totalPages;
      nextBtn.onclick = function() { if (vmCurrentPage < totalPages) { vmCurrentPage++; renderVideoManagement(); } };
      paginationContainer.appendChild(nextBtn);
    }

    attachVmRowEvents();
  }

  function attachVmRowEvents() {
    // View Action
    document.querySelectorAll('.btn-vm-view').forEach(function(btn) {
      btn.onclick = function() {
        var id = parseInt(btn.getAttribute('data-id'), 10);
        var vid = videoDataset.find(function(v) { return v.id === id; });
        if (vid) openVmDetails(vid);
      };
    });

    // Toggle Publish / Unpublish Action
    document.querySelectorAll('.btn-vm-toggle').forEach(function(btn) {
      btn.onclick = function() {
        var id = parseInt(btn.getAttribute('data-id'), 10);
        var vid = videoDataset.find(function(v) { return v.id === id; });
        if (vid) {
          vid.status = vid.status === 'published' ? 'draft' : 'published';
          renderVideoManagement();
        }
      };
    });

    // Edit Action
    document.querySelectorAll('.btn-vm-edit').forEach(function(btn) {
      btn.onclick = function() {
        var id = parseInt(btn.getAttribute('data-id'), 10);
        var vid = videoDataset.find(function(v) { return v.id === id; });
        if (vid) openVmEdit(vid);
      };
    });

    // Delete Action
    document.querySelectorAll('.btn-vm-delete').forEach(function(btn) {
      btn.onclick = function() {
        var id = parseInt(btn.getAttribute('data-id'), 10);
        var vid = videoDataset.find(function(v) { return v.id === id; });
        if (vid) openVmDelete(vid);
      };
    });
  }

  // View Details Modal
  var vmDetailsModal = document.getElementById('vmDetailsModal');
  function openVmDetails(vid) {
    if (!vmDetailsModal) return;
    document.getElementById('vmDetailsTitle').textContent = vid.title;
    document.getElementById('vmDetailsThumb').src = '../assets/images/' + vid.thumbnail;
    document.getElementById('vmDetailsCategory').textContent = vid.category + ' Discipline';
    document.getElementById('vmDetailsDuration').textContent = vid.duration;
    document.getElementById('vmDetailsDate').textContent = vid.uploadDate;
    document.getElementById('vmDetailsEngagement').textContent = vid.views.toLocaleString() + ' views · ' + vid.likes.toLocaleString() + ' likes';
    document.getElementById('vmDetailsDesc').textContent = vid.description;
    
    vmDetailsModal.classList.add('open');
  }

  var vmDetailsCloseBtn = document.getElementById('vmDetailsCloseBtn');
  var vmDetailsCloseActionBtn = document.getElementById('vmDetailsCloseActionBtn');
  if (vmDetailsCloseBtn) vmDetailsCloseBtn.onclick = function() { vmDetailsModal.classList.remove('open'); };
  if (vmDetailsCloseActionBtn) vmDetailsCloseActionBtn.onclick = function() { vmDetailsModal.classList.remove('open'); };
  if (vmDetailsModal) {
    vmDetailsModal.addEventListener('click', function(e) {
      if (e.target === vmDetailsModal) vmDetailsModal.classList.remove('open');
    });
  }

  // Edit Video Modal
  var vmEditModal = document.getElementById('vmEditModal');
  function openVmEdit(vid) {
    if (!vmEditModal) return;
    document.getElementById('vmEditId').value = vid.id;
    document.getElementById('vmEditTitleInput').value = vid.title;
    document.getElementById('vmEditCategorySelect').value = vid.category;
    document.getElementById('vmEditStatusSelect').value = vid.status;
    document.getElementById('vmEditDescInput').value = vid.description;
    document.getElementById('vmEditThumbSelect').value = vid.thumbnail;

    vmEditModal.classList.add('open');
  }

  var vmEditCloseBtn = document.getElementById('vmEditCloseBtn');
  var vmEditCancelBtn = document.getElementById('vmEditCancelBtn');
  var vmEditForm = document.getElementById('vmEditForm');
  if (vmEditCloseBtn) vmEditCloseBtn.onclick = function() { vmEditModal.classList.remove('open'); };
  if (vmEditCancelBtn) vmEditCancelBtn.onclick = function() { vmEditModal.classList.remove('open'); };
  if (vmEditForm) {
    vmEditForm.onsubmit = function(e) {
      e.preventDefault();
      var id = parseInt(document.getElementById('vmEditId').value, 10);
      var vid = videoDataset.find(function(v) { return v.id === id; });
      if (vid) {
        vid.title = document.getElementById('vmEditTitleInput').value;
        vid.category = document.getElementById('vmEditCategorySelect').value;
        vid.status = document.getElementById('vmEditStatusSelect').value;
        vid.description = document.getElementById('vmEditDescInput').value;
        vid.thumbnail = document.getElementById('vmEditThumbSelect').value;
        vmEditModal.classList.remove('open');
        renderVideoManagement();
      }
    };
  }
  if (vmEditModal) {
    vmEditModal.addEventListener('click', function(e) {
      if (e.target === vmEditModal) vmEditModal.classList.remove('open');
    });
  }

  // Delete Video Modal
  var vmDeleteModal = document.getElementById('vmDeleteModal');
  function openVmDelete(vid) {
    if (!vmDeleteModal) return;
    pendingDeleteId = vid.id;
    document.getElementById('vmDeleteVideoTitle').textContent = vid.title;
    vmDeleteModal.classList.add('open');
  }

  var vmDeleteCloseBtn = document.getElementById('vmDeleteCloseBtn');
  var vmDeleteCancelBtn = document.getElementById('vmDeleteCancelBtn');
  var vmDeleteConfirmBtn = document.getElementById('vmDeleteConfirmBtn');
  if (vmDeleteCloseBtn) vmDeleteCloseBtn.onclick = function() { vmDeleteModal.classList.remove('open'); };
  if (vmDeleteCancelBtn) vmDeleteCancelBtn.onclick = function() { vmDeleteModal.classList.remove('open'); };
  if (vmDeleteConfirmBtn) {
    vmDeleteConfirmBtn.onclick = function() {
      if (pendingDeleteId !== null) {
        videoDataset = videoDataset.filter(function(v) { return v.id !== pendingDeleteId; });
        pendingDeleteId = null;
        vmDeleteModal.classList.remove('open');
        renderVideoManagement();
      }
    };
  }
  if (vmDeleteModal) {
    vmDeleteModal.addEventListener('click', function(e) {
      if (e.target === vmDeleteModal) vmDeleteModal.classList.remove('open');
    });
  }

  // Search & Filter listeners
  var vmSearchInput = document.getElementById('vmSearchInput');
  var vmCategoryFilter = document.getElementById('vmCategoryFilter');
  var vmStatusFilter = document.getElementById('vmStatusFilter');
  var vmSortSelect = document.getElementById('vmSortSelect');
  var btnResetVmFilters = document.getElementById('btnResetVmFilters');

  if (vmSearchInput) {
    vmSearchInput.addEventListener('input', function() {
      vmSearch = vmSearchInput.value;
      vmCurrentPage = 1;
      renderVideoManagement();
    });
  }
  if (vmCategoryFilter) {
    vmCategoryFilter.addEventListener('change', function() {
      vmCategory = vmCategoryFilter.value;
      vmCurrentPage = 1;
      renderVideoManagement();
    });
  }
  if (vmStatusFilter) {
    vmStatusFilter.addEventListener('change', function() {
      vmStatus = vmStatusFilter.value;
      vmCurrentPage = 1;
      renderVideoManagement();
    });
  }
  if (vmSortSelect) {
    vmSortSelect.addEventListener('change', function() {
      vmSort = vmSortSelect.value;
      renderVideoManagement();
    });
  }
  if (btnResetVmFilters) {
    btnResetVmFilters.onclick = function() {
      vmSearch = '';
      vmCategory = 'all';
      vmStatus = 'all';
      vmSort = 'newest';
      vmCurrentPage = 1;
      if (vmSearchInput) vmSearchInput.value = '';
      if (vmCategoryFilter) vmCategoryFilter.value = 'all';
      if (vmStatusFilter) vmStatusFilter.value = 'all';
      if (vmSortSelect) vmSortSelect.value = 'newest';
      renderVideoManagement();
    };
  }

  // Button Upload New Video inside Video Management -> opens upload modal
  var btnUploadFromVideoMgmt = document.getElementById('btnUploadFromVideoMgmt');
  if (btnUploadFromVideoMgmt) {
    btnUploadFromVideoMgmt.onclick = function() {
      openModal();
    };
  }

  // ==========================================================================
  // 8. Complete Students Management Engine (CRUD, Filter, Search, Pagination)
  // ==========================================================================

  var studentDataset = [
    {
      id: 1,
      name: 'Marcus Rodriguez',
      email: 'm.rodriguez@executive.ph',
      regDate: 'Oct 12, 2026',
      rawDate: '2026-10-12',
      status: 'active',
      videosWatched: 18,
      lastActive: '14 mins ago',
      watchTime: '14.2 Hours',
      completedCount: 14,
      likedCount: 11,
      initials: 'MR',
      history: [
        { title: 'Josiah Go: The Marketing Discipline', date: 'Today, 10:14 AM', progress: 100 },
        { title: 'Brand Strategy Masterclass', date: 'Today, 9:20 AM', progress: 71 },
        { title: 'Executive Venture Acceleration 2026', date: 'Yesterday', progress: 100 }
      ],
      likes: [
        { title: 'Closing the Executive Strategy Action Gap', category: 'Strategy' },
        { title: 'The Marketing Discipline', category: 'Marketing' }
      ]
    },
    {
      id: 2,
      name: 'Alysia Tan',
      email: 'alysia.tan@innovate.co',
      regDate: 'Oct 18, 2026',
      rawDate: '2026-10-18',
      status: 'active',
      videosWatched: 26,
      lastActive: '32 mins ago',
      watchTime: '21.5 Hours',
      completedCount: 22,
      likedCount: 19,
      initials: 'AT',
      history: [
        { title: 'Disruptive Venture Scaling', date: 'Today, 8:40 AM', progress: 96 },
        { title: 'Omnichannel Retail Transformation', date: 'Nov 18, 2026', progress: 100 },
        { title: 'Crisis Leadership & Media Handling', date: 'Nov 16, 2026', progress: 85 }
      ],
      likes: [
        { title: 'Disruptive Venture Scaling', category: 'Leadership' },
        { title: 'Omnichannel Retail Transformation', category: 'Retail' }
      ]
    },
    {
      id: 3,
      name: 'Danilo Mendoza',
      email: 'danilo.m@mendoza-holdings.com',
      regDate: 'Nov 02, 2026',
      rawDate: '2026-11-02',
      status: 'active',
      videosWatched: 6,
      lastActive: '1 hr ago',
      watchTime: '4.8 Hours',
      completedCount: 3,
      likedCount: 4,
      initials: 'DM',
      history: [
        { title: 'Marketing Blue Ocean Shift', date: 'Today, 7:15 AM', progress: 25 },
        { title: 'Corporate Venture Capital', date: 'Nov 17, 2026', progress: 60 }
      ],
      likes: [
        { title: 'Marketing Blue Ocean Shift', category: 'Marketing' }
      ]
    },
    {
      id: 4,
      name: 'Christine Laurel',
      email: 'claurel@apexretail.org',
      regDate: 'Sep 24, 2026',
      rawDate: '2026-09-24',
      status: 'active',
      videosWatched: 32,
      lastActive: '2 hrs ago',
      watchTime: '28.0 Hours',
      completedCount: 30,
      likedCount: 25,
      initials: 'CL',
      history: [
        { title: 'Executive Crisis Communication', date: 'Today, 6:00 AM', progress: 100 },
        { title: 'Omnichannel Retail Transformation', date: 'Nov 17, 2026', progress: 100 },
        { title: 'Closing the Action Gap', date: 'Nov 14, 2026', progress: 100 }
      ],
      likes: [
        { title: 'Executive Crisis Communication', category: 'Strategy' },
        { title: 'Omnichannel Retail Transformation', category: 'Retail' }
      ]
    },
    {
      id: 5,
      name: 'Roberto Valderrama',
      email: 'r.valderrama@legacybank.ph',
      regDate: 'Nov 06, 2026',
      rawDate: '2026-11-06',
      status: 'suspended',
      videosWatched: 2,
      lastActive: 'Nov 12, 2026',
      watchTime: '1.2 Hours',
      completedCount: 1,
      likedCount: 1,
      initials: 'RV',
      history: [
        { title: 'Corporate Venture Finance', date: 'Nov 12, 2026', progress: 50 }
      ],
      likes: [
        { title: 'Corporate Venture Finance', category: 'Finance' }
      ]
    },
    {
      id: 6,
      name: 'Elena Soriano',
      email: 'elena.s@ph-telecom.net',
      regDate: 'Oct 30, 2026',
      rawDate: '2026-10-30',
      status: 'active',
      videosWatched: 12,
      lastActive: '3 hrs ago',
      watchTime: '9.4 Hours',
      completedCount: 9,
      likedCount: 8,
      initials: 'ES',
      history: [
        { title: 'Strategic Product Innovation Cycles', date: 'Yesterday', progress: 100 },
        { title: 'The Marketing Discipline', date: 'Nov 16, 2026', progress: 85 }
      ],
      likes: [
        { title: 'Strategic Product Innovation Cycles', category: 'Strategy' }
      ]
    },
    {
      id: 7,
      name: 'Carlos Alcantara',
      email: 'carlos@alcantara-foods.com',
      regDate: 'Nov 14, 2026',
      rawDate: '2026-11-14',
      status: 'active',
      videosWatched: 4,
      lastActive: 'Yesterday',
      watchTime: '3.1 Hours',
      completedCount: 2,
      likedCount: 3,
      initials: 'CA',
      history: [
        { title: 'Omnichannel Retail Transformation', date: 'Yesterday', progress: 75 }
      ],
      likes: [
        { title: 'Omnichannel Retail Transformation', category: 'Retail' }
      ]
    },
    {
      id: 8,
      name: 'Beatriz Zobel',
      email: 'beatriz.z@ayala-ventures.com',
      regDate: 'Nov 15, 2026',
      rawDate: '2026-11-15',
      status: 'active',
      videosWatched: 8,
      lastActive: '5 hrs ago',
      watchTime: '6.5 Hours',
      completedCount: 7,
      likedCount: 6,
      initials: 'BZ',
      history: [
        { title: 'Executive Venture Acceleration', date: 'Today, 5:30 AM', progress: 100 }
      ],
      likes: [
        { title: 'Executive Venture Acceleration', category: 'Leadership' }
      ]
    }
  ];

  var smSearch = '';
  var smStatus = 'all';
  var smDateFilter = 'all';
  var smSort = 'newest';
  var smCurrentPage = 1;
  var smPerPage = 5;

  var pendingStatusStudentId = null;
  var pendingDeleteStudentId = null;

  function renderStudentsManagement() {
    // 1. Update Student Statistics Cards
    var totalCount = studentDataset.length;
    var activeCount = studentDataset.filter(function(s) { return s.status === 'active'; }).length;
    var suspendedCount = totalCount - activeCount;
    var newStudentsCount = studentDataset.filter(function(s) {
      var d = new Date(s.rawDate);
      var cutoff = new Date('2026-10-21'); // within ~30 days of Nov 20
      return d >= cutoff;
    }).length;

    var elTotal = document.getElementById('statSmTotalStudents');
    var elActive = document.getElementById('statSmActive');
    var elSuspended = document.getElementById('statSmSuspended');
    var elNew = document.getElementById('statSmNew');

    if (elTotal) elTotal.textContent = totalCount.toLocaleString();
    if (elActive) elActive.textContent = activeCount.toLocaleString();
    if (elSuspended) elSuspended.textContent = suspendedCount.toLocaleString();
    if (elNew) elNew.textContent = newStudentsCount.toLocaleString();

    // 2. Filter Dataset
    var filtered = studentDataset.filter(function(stu) {
      var matchesSearch = !smSearch || 
        stu.name.toLowerCase().indexOf(smSearch.toLowerCase()) !== -1 ||
        stu.email.toLowerCase().indexOf(smSearch.toLowerCase()) !== -1;
      
      var matchesStatus = smStatus === 'all' || stu.status === smStatus;

      var matchesDate = true;
      if (smDateFilter === '30d') {
        matchesDate = new Date(stu.rawDate) >= new Date('2026-10-21');
      } else if (smDateFilter === '90d') {
        matchesDate = new Date(stu.rawDate) >= new Date('2026-08-21');
      }

      return matchesSearch && matchesStatus && matchesDate;
    });

    // Sort
    if (smSort === 'newest') {
      filtered.sort(function(a, b) { return new Date(b.rawDate) - new Date(a.rawDate); });
    } else if (smSort === 'oldest') {
      filtered.sort(function(a, b) { return new Date(a.rawDate) - new Date(b.rawDate); });
    } else if (smSort === 'active') {
      filtered.sort(function(a, b) { return b.videosWatched - a.videosWatched; });
    }

    // 3. Paginate
    var totalFiltered = filtered.length;
    var totalPages = Math.ceil(totalFiltered / smPerPage) || 1;
    if (smCurrentPage > totalPages) smCurrentPage = totalPages;
    if (smCurrentPage < 1) smCurrentPage = 1;

    var startIdx = (smCurrentPage - 1) * smPerPage;
    var pageItems = filtered.slice(startIdx, startIdx + smPerPage);

    var elTableCount = document.getElementById('smTableCount');
    if (elTableCount) elTableCount.textContent = 'Showing ' + pageItems.length + ' of ' + totalFiltered + ' students';

    var elPaginationInfo = document.getElementById('smPaginationInfo');
    if (elPaginationInfo) {
      var startNum = totalFiltered === 0 ? 0 : startIdx + 1;
      var endNum = Math.min(startIdx + smPerPage, totalFiltered);
      elPaginationInfo.textContent = 'Showing ' + startNum + '-' + endNum + ' of ' + totalFiltered + ' students';
    }

    // Render Table Rows
    var tbody = document.getElementById('smTableBody');
    if (tbody) {
      tbody.innerHTML = '';
      if (pageItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 32px; color: var(--text-dim);">No student accounts match your filter criteria.</td></tr>';
      } else {
        pageItems.forEach(function(stu) {
          var tr = document.createElement('tr');
          var statusClass = stu.status === 'active' ? 'active' : 'suspended';
          var statusLabel = stu.status === 'active' ? 'Active' : 'Suspended';
          var toggleIconTitle = stu.status === 'active' ? 'Suspend Student' : 'Activate Student';

          tr.innerHTML = 
            '<td>' +
              '<div class="student-cell">' +
                '<div class="student-avatar">' + stu.initials + '</div>' +
                '<div class="student-meta-name">' + stu.name + '</div>' +
              '</div>' +
            '</td>' +
            '<td><span style="font-size: 12.5px; color: var(--text-muted);">' + stu.email + '</span></td>' +
            '<td><span style="font-size: 12px; color: var(--text-muted);">' + stu.regDate + '</span></td>' +
            '<td><span class="status-badge ' + statusClass + '">' + statusLabel + '</span></td>' +
            '<td>' +
              '<div class="progress-bar-wrap" style="width: 60px;"><div class="progress-bar-fill" style="width:' + Math.min(stu.videosWatched * 3.5, 100) + '%"></div></div>' +
              '<span style="font-weight: 600; color: #FFF; font-size: 12.5px;">' + stu.videosWatched + '</span>' +
            '</td>' +
            '<td><span style="font-size: 12px; color: var(--text-dim);">' + stu.lastActive + '</span></td>' +
            '<td style="text-align: right; padding-right: 20px;">' +
              '<div class="row-actions" style="justify-content: flex-end;">' +
                '<button class="action-icon-btn btn-sm-view" data-id="' + stu.id + '" title="View student analytics">' +
                  '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>' +
                '</button>' +
                '<button class="action-icon-btn btn-sm-edit" data-id="' + stu.id + '" title="Edit student profile">' +
                  '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>' +
                '</button>' +
                '<button class="action-icon-btn btn-sm-toggle" data-id="' + stu.id + '" title="' + toggleIconTitle + '">' +
                  (stu.status === 'active' 
                    ? '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>'
                    : '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg>') +
                '</button>' +
                '<button class="action-icon-btn danger btn-sm-delete" data-id="' + stu.id + '" title="Delete student account">' +
                  '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>' +
                '</button>' +
              '</div>' +
            '</td>';
          tbody.appendChild(tr);
        });
      }
    }

    // Render Pagination Buttons
    var paginationContainer = document.getElementById('smPaginationButtons');
    if (paginationContainer) {
      paginationContainer.innerHTML = '';
      
      var prevBtn = document.createElement('button');
      prevBtn.className = 'page-num-btn';
      prevBtn.innerHTML = '&larr;';
      prevBtn.disabled = smCurrentPage <= 1;
      prevBtn.onclick = function() { if (smCurrentPage > 1) { smCurrentPage--; renderStudentsManagement(); } };
      paginationContainer.appendChild(prevBtn);

      for (var p = 1; p <= totalPages; p++) {
        (function(page) {
          var btn = document.createElement('button');
          btn.className = 'page-num-btn' + (page === smCurrentPage ? ' active' : '');
          btn.textContent = page;
          btn.onclick = function() { smCurrentPage = page; renderStudentsManagement(); };
          paginationContainer.appendChild(btn);
        })(p);
      }

      var nextBtn = document.createElement('button');
      nextBtn.className = 'page-num-btn';
      nextBtn.innerHTML = '&rarr;';
      nextBtn.disabled = smCurrentPage >= totalPages;
      nextBtn.onclick = function() { if (smCurrentPage < totalPages) { smCurrentPage++; renderStudentsManagement(); } };
      paginationContainer.appendChild(nextBtn);
    }

    attachSmRowEvents();
  }

  function attachSmRowEvents() {
    // View Action
    document.querySelectorAll('.btn-sm-view').forEach(function(btn) {
      btn.onclick = function() {
        var id = parseInt(btn.getAttribute('data-id'), 10);
        var stu = studentDataset.find(function(s) { return s.id === id; });
        if (stu) openSmDetails(stu);
      };
    });

    // Edit Action
    document.querySelectorAll('.btn-sm-edit').forEach(function(btn) {
      btn.onclick = function() {
        var id = parseInt(btn.getAttribute('data-id'), 10);
        var stu = studentDataset.find(function(s) { return s.id === id; });
        if (stu) openSmEdit(stu);
      };
    });

    // Toggle Suspend / Activate Action
    document.querySelectorAll('.btn-sm-toggle').forEach(function(btn) {
      btn.onclick = function() {
        var id = parseInt(btn.getAttribute('data-id'), 10);
        var stu = studentDataset.find(function(s) { return s.id === id; });
        if (stu) openSmStatusConfirm(stu);
      };
    });

    // Delete Action
    document.querySelectorAll('.btn-sm-delete').forEach(function(btn) {
      btn.onclick = function() {
        var id = parseInt(btn.getAttribute('data-id'), 10);
        var stu = studentDataset.find(function(s) { return s.id === id; });
        if (stu) openSmDelete(stu);
      };
    });
  }

  // 1. View Student Details Modal
  var smDetailsModal = document.getElementById('smDetailsModal');
  function openSmDetails(stu) {
    if (!smDetailsModal) return;
    document.getElementById('smDetailsAvatar').textContent = stu.initials;
    document.getElementById('smDetailsName').textContent = stu.name;
    document.getElementById('smDetailsEmail').textContent = stu.email;
    document.getElementById('smDetailsRegDate').textContent = stu.regDate;
    
    var badge = document.getElementById('smDetailsStatusBadge');
    badge.className = 'status-badge ' + (stu.status === 'active' ? 'active' : 'suspended');
    badge.textContent = stu.status === 'active' ? 'Active' : 'Suspended';

    document.getElementById('smDetailsWatchedCount').textContent = stu.videosWatched + ' Masterclasses';
    document.getElementById('smDetailsWatchTime').textContent = stu.watchTime;
    document.getElementById('smDetailsCompletedCount').textContent = stu.completedCount + ' Lessons';
    document.getElementById('smDetailsLikedCount').textContent = stu.likedCount + ' Favorites';

    // Populate Tab 1: Watch History
    var historyContainer = document.getElementById('smHistoryList');
    if (historyContainer) {
      historyContainer.innerHTML = '';
      stu.history.forEach(function(h) {
        var div = document.createElement('div');
        div.className = 'video-row-card';
        div.innerHTML = 
          '<div class="video-details">' +
            '<div class="video-card-title">' + h.title + '</div>' +
            '<div class="video-card-meta"><span>Watched ' + h.date + '</span> · <span style="color:var(--azure-bright); font-weight:600;">' + h.progress + '% complete</span></div>' +
          '</div>';
        historyContainer.appendChild(div);
      });
    }

    // Populate Tab 2: Liked Videos
    var likedContainer = document.getElementById('smLikedList');
    if (likedContainer) {
      likedContainer.innerHTML = '';
      stu.likes.forEach(function(l) {
        var div = document.createElement('div');
        div.className = 'video-row-card';
        div.innerHTML = 
          '<div class="video-details">' +
            '<div class="video-card-title">' + l.title + '</div>' +
            '<div class="video-card-meta"><span class="video-tag-pill">' + l.category + '</span></div>' +
          '</div>';
        likedContainer.appendChild(div);
      });
    }

    // Populate Tab 3: Completion Progress
    var progressContainer = document.getElementById('smProgressList');
    if (progressContainer) {
      progressContainer.innerHTML = '';
      stu.history.forEach(function(h) {
        var div = document.createElement('div');
        div.className = 'video-row-card';
        div.innerHTML = 
          '<div class="video-details" style="display:flex; align-items:center; justify-content:space-between; gap:12px;">' +
            '<div style="flex:1;">' +
              '<div class="video-card-title">' + h.title + '</div>' +
              '<div class="progress-bar-wrap" style="width:100%; margin-top:6px;"><div class="progress-bar-fill" style="width:' + h.progress + '%"></div></div>' +
            '</div>' +
            '<div style="font-weight:700; color:#FFF; font-size:13px;">' + h.progress + '%</div>' +
          '</div>';
        progressContainer.appendChild(div);
      });
    }

    smDetailsModal.classList.add('open');
  }

  // Details Modal Tab Switching
  document.querySelectorAll('.student-tab-btn').forEach(function(tabBtn) {
    tabBtn.onclick = function() {
      document.querySelectorAll('.student-tab-btn').forEach(function(b) { b.classList.remove('active'); });
      document.querySelectorAll('.student-tab-content').forEach(function(c) { c.classList.remove('active'); });

      tabBtn.classList.add('active');
      var targetId = tabBtn.getAttribute('data-tab');
      var targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');
    };
  });

  var smDetailsCloseBtn = document.getElementById('smDetailsCloseBtn');
  var smDetailsCloseActionBtn = document.getElementById('smDetailsCloseActionBtn');
  if (smDetailsCloseBtn) smDetailsCloseBtn.onclick = function() { smDetailsModal.classList.remove('open'); };
  if (smDetailsCloseActionBtn) smDetailsCloseActionBtn.onclick = function() { smDetailsModal.classList.remove('open'); };
  if (smDetailsModal) {
    smDetailsModal.addEventListener('click', function(e) {
      if (e.target === smDetailsModal) smDetailsModal.classList.remove('open');
    });
  }

  // 2. Edit Student Modal
  var smEditModal = document.getElementById('smEditModal');
  function openSmEdit(stu) {
    if (!smEditModal) return;
    document.getElementById('smEditId').value = stu.id;
    document.getElementById('smEditNameInput').value = stu.name;
    document.getElementById('smEditEmailInput').value = stu.email;
    document.getElementById('smEditStatusSelect').value = stu.status;
    smEditModal.classList.add('open');
  }

  var smEditCloseBtn = document.getElementById('smEditCloseBtn');
  var smEditCancelBtn = document.getElementById('smEditCancelBtn');
  var smEditForm = document.getElementById('smEditForm');
  if (smEditCloseBtn) smEditCloseBtn.onclick = function() { smEditModal.classList.remove('open'); };
  if (smEditCancelBtn) smEditCancelBtn.onclick = function() { smEditModal.classList.remove('open'); };
  if (smEditForm) {
    smEditForm.onsubmit = function(e) {
      e.preventDefault();
      var id = parseInt(document.getElementById('smEditId').value, 10);
      var stu = studentDataset.find(function(s) { return s.id === id; });
      if (stu) {
        stu.name = document.getElementById('smEditNameInput').value;
        stu.email = document.getElementById('smEditEmailInput').value;
        stu.status = document.getElementById('smEditStatusSelect').value;
        stu.initials = stu.name.split(' ').map(function(n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
        smEditModal.classList.remove('open');
        renderStudentsManagement();
      }
    };
  }
  if (smEditModal) {
    smEditModal.addEventListener('click', function(e) {
      if (e.target === smEditModal) smEditModal.classList.remove('open');
    });
  }

  // 3. Suspend / Activate Confirmation Modal
  var smStatusConfirmModal = document.getElementById('smStatusConfirmModal');
  function openSmStatusConfirm(stu) {
    if (!smStatusConfirmModal) return;
    pendingStatusStudentId = stu.id;
    var newAction = stu.status === 'active' ? 'Suspend' : 'Activate';
    document.getElementById('smStatusModalTitle').textContent = newAction + ' Student Account';
    document.getElementById('smStatusModalDesc').textContent = 
      'Are you sure you want to ' + newAction.toLowerCase() + ' ' + stu.name + ' (' + stu.email + ')? ' +
      (stu.status === 'active' ? 'The student will temporarily lose access to watch videos.' : 'Full access will be immediately restored.');
    smStatusConfirmModal.classList.add('open');
  }

  var smStatusCloseBtn = document.getElementById('smStatusCloseBtn');
  var smStatusCancelBtn = document.getElementById('smStatusCancelBtn');
  var smStatusConfirmBtn = document.getElementById('smStatusConfirmBtn');
  if (smStatusCloseBtn) smStatusCloseBtn.onclick = function() { smStatusConfirmModal.classList.remove('open'); };
  if (smStatusCancelBtn) smStatusCancelBtn.onclick = function() { smStatusConfirmModal.classList.remove('open'); };
  if (smStatusConfirmBtn) {
    smStatusConfirmBtn.onclick = function() {
      if (pendingStatusStudentId !== null) {
        var stu = studentDataset.find(function(s) { return s.id === pendingStatusStudentId; });
        if (stu) {
          stu.status = stu.status === 'active' ? 'suspended' : 'active';
          pendingStatusStudentId = null;
          smStatusConfirmModal.classList.remove('open');
          renderStudentsManagement();
        }
      }
    };
  }
  if (smStatusConfirmModal) {
    smStatusConfirmModal.addEventListener('click', function(e) {
      if (e.target === smStatusConfirmModal) smStatusConfirmModal.classList.remove('open');
    });
  }

  // 4. Delete Student Confirmation Modal
  var smDeleteModal = document.getElementById('smDeleteModal');
  function openSmDelete(stu) {
    if (!smDeleteModal) return;
    pendingDeleteStudentId = stu.id;
    document.getElementById('smDeleteStudentName').textContent = stu.name;
    smDeleteModal.classList.add('open');
  }

  var smDeleteCloseBtn = document.getElementById('smDeleteCloseBtn');
  var smDeleteCancelBtn = document.getElementById('smDeleteCancelBtn');
  var smDeleteConfirmBtn = document.getElementById('smDeleteConfirmBtn');
  if (smDeleteCloseBtn) smDeleteCloseBtn.onclick = function() { smDeleteModal.classList.remove('open'); };
  if (smDeleteCancelBtn) smDeleteCancelBtn.onclick = function() { smDeleteModal.classList.remove('open'); };
  if (smDeleteConfirmBtn) {
    smDeleteConfirmBtn.onclick = function() {
      if (pendingDeleteStudentId !== null) {
        studentDataset = studentDataset.filter(function(s) { return s.id !== pendingDeleteStudentId; });
        pendingDeleteStudentId = null;
        smDeleteModal.classList.remove('open');
        renderStudentsManagement();
      }
    };
  }
  if (smDeleteModal) {
    smDeleteModal.addEventListener('click', function(e) {
      if (e.target === smDeleteModal) smDeleteModal.classList.remove('open');
    });
  }

  // 5. Add New Student Modal
  var smAddModal = document.getElementById('smAddModal');
  var btnAddStudentModalBtn = document.getElementById('btnAddStudentModalBtn');
  var smAddCloseBtn = document.getElementById('smAddCloseBtn');
  var smAddCancelBtn = document.getElementById('smAddCancelBtn');
  var smAddForm = document.getElementById('smAddForm');

  if (btnAddStudentModalBtn) btnAddStudentModalBtn.onclick = function() { smAddModal.classList.add('open'); };
  if (smAddCloseBtn) smAddCloseBtn.onclick = function() { smAddModal.classList.remove('open'); };
  if (smAddCancelBtn) smAddCancelBtn.onclick = function() { smAddModal.classList.remove('open'); };
  if (smAddForm) {
    smAddForm.onsubmit = function(e) {
      e.preventDefault();
      var name = document.getElementById('smAddNameInput').value;
      var email = document.getElementById('smAddEmailInput').value;
      var newStudent = {
        id: Date.now(),
        name: name,
        email: email,
        regDate: 'Today, Nov 20',
        rawDate: '2026-11-20',
        status: 'active',
        videosWatched: 0,
        lastActive: 'Just registered',
        watchTime: '0 Hours',
        completedCount: 0,
        likedCount: 0,
        initials: name.split(' ').map(function(n) { return n[0]; }).join('').substring(0, 2).toUpperCase(),
        history: [],
        likes: []
      };
      studentDataset.unshift(newStudent);
      smAddForm.reset();
      smAddModal.classList.remove('open');
      renderStudentsManagement();
    };
  }
  if (smAddModal) {
    smAddModal.addEventListener('click', function(e) {
      if (e.target === smAddModal) smAddModal.classList.remove('open');
    });
  }

  // 6. Search and Filters Listeners
  var smSearchInput = document.getElementById('smSearchInput');
  var smStatusFilter = document.getElementById('smStatusFilter');
  var smDateFilterSelect = document.getElementById('smDateFilter');
  var smSortSelect = document.getElementById('smSortSelect');
  var btnResetSmFilters = document.getElementById('btnResetSmFilters');

  if (smSearchInput) {
    smSearchInput.addEventListener('input', function() {
      smSearch = smSearchInput.value;
      smCurrentPage = 1;
      renderStudentsManagement();
    });
  }
  if (smStatusFilter) {
    smStatusFilter.addEventListener('change', function() {
      smStatus = smStatusFilter.value;
      smCurrentPage = 1;
      renderStudentsManagement();
    });
  }
  if (smDateFilterSelect) {
    smDateFilterSelect.addEventListener('change', function() {
      smDateFilter = smDateFilterSelect.value;
      smCurrentPage = 1;
      renderStudentsManagement();
    });
  }
  if (smSortSelect) {
    smSortSelect.addEventListener('change', function() {
      smSort = smSortSelect.value;
      renderStudentsManagement();
    });
  }
  if (btnResetSmFilters) {
    btnResetSmFilters.onclick = function() {
      smSearch = '';
      smStatus = 'all';
      smDateFilter = 'all';
      smSort = 'newest';
      smCurrentPage = 1;
      if (smSearchInput) smSearchInput.value = '';
      if (smStatusFilter) smStatusFilter.value = 'all';
      if (smDateFilterSelect) smDateFilterSelect.value = 'all';
      if (smSortSelect) smSortSelect.value = 'newest';
      renderStudentsManagement();
    };
  }

  // 7. Export Students CSV
  var btnExportStudentsCsv = document.getElementById('btnExportStudentsCsv');
  if (btnExportStudentsCsv) {
    btnExportStudentsCsv.onclick = function() {
      var csv = 'data:text/csv;charset=utf-8,ID,Full Name,Email,Registration Date,Status,Videos Watched,Watch Time,Last Active\n';
      studentDataset.forEach(function(s) {
        csv += s.id + ',"' + s.name + '",' + s.email + ',' + s.regDate + ',' + s.status + ',' + s.videosWatched + ',"' + s.watchTime + '",' + s.lastActive + '\n';
      });
      var uri = encodeURI(csv);
      var link = document.createElement('a');
      link.setAttribute('href', uri);
      link.setAttribute('download', 'continuum_students_directory_' + Date.now() + '.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  }


  // ==========================================================================
  // 9. Complete Category Management Engine (CRUD, Filter, Search, Pagination)
  // ==========================================================================

  var categoryDataset = [
    {
      id: 1,
      name: 'Marketing Discipline',
      slug: 'marketing',
      order: 1,
      videosCount: 14,
      status: 'active',
      color: '#1EA0FF',
      description: 'Brand positioning, competitive defense, strategic commercialization, and pricing elasticity.'
    },
    {
      id: 2,
      name: 'Strategic Formulation',
      slug: 'strategy',
      order: 2,
      videosCount: 10,
      status: 'active',
      color: '#8B5CF6',
      description: 'Corporate growth architectures, business model turnaround, and closing the action gap.'
    },
    {
      id: 3,
      name: 'Executive Leadership',
      slug: 'leadership',
      order: 3,
      videosCount: 8,
      status: 'active',
      color: '#00E599',
      description: 'Board governance, crisis leadership, culture transformation, and visionary scaling.'
    },
    {
      id: 4,
      name: 'Omnichannel Retail',
      slug: 'retail',
      order: 4,
      videosCount: 5,
      status: 'active',
      color: '#F59E0B',
      description: 'Department store turnaround, e-commerce supply chains, dark stores, and retail analytics.'
    },
    {
      id: 5,
      name: 'Corporate Finance & Ventures',
      slug: 'finance',
      order: 5,
      videosCount: 3,
      status: 'active',
      color: '#EC4899',
      description: 'Venture capital structuring, debt-to-equity synergies, M&A due diligence, and capital allocation.'
    },
    {
      id: 6,
      name: 'Digital Transformation',
      slug: 'digital-transformation',
      order: 6,
      videosCount: 2,
      status: 'active',
      color: '#1EA0FF',
      description: 'Enterprise AI adoption, cloud transition frameworks, and algorithmic business automation.'
    },
    {
      id: 7,
      name: 'Human Capital & Talent',
      slug: 'human-capital',
      order: 7,
      videosCount: 0,
      status: 'inactive',
      color: '#8B5CF6',
      description: 'Executive retention, performance equity models, and high-performance organizational design.'
    },
    {
      id: 8,
      name: 'Crisis & Risk Governance',
      slug: 'risk-governance',
      order: 8,
      videosCount: 0,
      status: 'inactive',
      color: '#F59E0B',
      description: 'Media crisis management, shareholder disputes, regulatory compliance, and risk containment.'
    }
  ];

  var cmSearch = '';
  var cmSort = 'order';
  var cmCurrentPage = 1;
  var cmPerPage = 5;

  var pendingDeleteCategoryId = null;

  function renderCategoryManagement() {
    // 1. Update Category Statistics Cards
    var totalCount = categoryDataset.length;
    var totalVideosAssigned = categoryDataset.reduce(function(acc, c) { return acc + c.videosCount; }, 0);
    
    // Find top category
    var sortedByVideos = categoryDataset.slice().sort(function(a, b) { return b.videosCount - a.videosCount; });
    var topCat = sortedByVideos[0] || { name: 'Marketing', videosCount: 0 };

    var elTotal = document.getElementById('statCmTotal');
    var elTotalVideos = document.getElementById('statCmTotalVideos');
    var elTopName = document.getElementById('statCmTopName');
    var elTopCount = document.getElementById('statCmTopCount');

    if (elTotal) elTotal.textContent = totalCount;
    if (elTotalVideos) elTotalVideos.textContent = totalVideosAssigned;
    if (elTopName) elTopName.textContent = topCat.name.replace(' Discipline', '');
    if (elTopCount) elTopCount.textContent = topCat.videosCount + ' masterclasses';

    // 2. Filter Dataset
    var filtered = categoryDataset.filter(function(cat) {
      return !cmSearch || 
        cat.name.toLowerCase().indexOf(cmSearch.toLowerCase()) !== -1 ||
        cat.slug.toLowerCase().indexOf(cmSearch.toLowerCase()) !== -1 ||
        cat.description.toLowerCase().indexOf(cmSearch.toLowerCase()) !== -1;
    });

    // Sort
    if (cmSort === 'order') {
      filtered.sort(function(a, b) { return a.order - b.order; });
    } else if (cmSort === 'name') {
      filtered.sort(function(a, b) { return a.name.localeCompare(b.name); });
    } else if (cmSort === 'videos') {
      filtered.sort(function(a, b) { return b.videosCount - a.videosCount; });
    }

    // 3. Paginate
    var totalFiltered = filtered.length;
    var totalPages = Math.ceil(totalFiltered / cmPerPage) || 1;
    if (cmCurrentPage > totalPages) cmCurrentPage = totalPages;
    if (cmCurrentPage < 1) cmCurrentPage = 1;

    var startIdx = (cmCurrentPage - 1) * cmPerPage;
    var pageItems = filtered.slice(startIdx, startIdx + cmPerPage);

    var elTableCount = document.getElementById('cmTableCount');
    if (elTableCount) elTableCount.textContent = 'Showing ' + pageItems.length + ' of ' + totalFiltered + ' categories';

    var elPaginationInfo = document.getElementById('cmPaginationInfo');
    if (elPaginationInfo) {
      var startNum = totalFiltered === 0 ? 0 : startIdx + 1;
      var endNum = Math.min(startIdx + cmPerPage, totalFiltered);
      elPaginationInfo.textContent = 'Showing ' + startNum + '-' + endNum + ' of ' + totalFiltered + ' categories';
    }

    // Render Table Rows
    var tbody = document.getElementById('cmTableBody');
    if (tbody) {
      tbody.innerHTML = '';
      if (pageItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 32px; color: var(--text-dim);">No curriculum disciplines found matching criteria.</td></tr>';
      } else {
        pageItems.forEach(function(cat) {
          var tr = document.createElement('tr');
          var statusClass = cat.status === 'active' ? 'active' : 'suspended';
          var statusLabel = cat.status === 'active' ? 'Active' : 'Inactive';
          var toggleIconTitle = cat.status === 'active' ? 'Hide Category' : 'Activate Category';

          tr.innerHTML = 
            '<td><span style="font-weight: 700; color: var(--text-dim);">#' + cat.order + '</span></td>' +
            '<td>' +
              '<div style="display:flex; align-items:center; gap:8px;">' +
                '<span class="category-color-dot" style="color:' + cat.color + ';"></span>' +
                '<span style="font-weight: 600; color: #FFF; font-size: 13.5px;">' + cat.name + '</span>' +
              '</div>' +
            '</td>' +
            '<td><span style="font-size: 12px; color: var(--text-muted); max-width: 280px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + cat.description + '</span></td>' +
            '<td><span class="video-tag-pill">/' + cat.slug + '</span></td>' +
            '<td><span style="font-weight: 600; color: #FFF;">' + cat.videosCount + ' videos</span></td>' +
            '<td><span class="status-badge ' + statusClass + '">' + statusLabel + '</span></td>' +
            '<td style="text-align: right; padding-right: 20px;">' +
              '<div class="row-actions" style="justify-content: flex-end;">' +
                '<button class="action-icon-btn btn-cm-edit" data-id="' + cat.id + '" title="Edit category metadata">' +
                  '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>' +
                '</button>' +
                '<button class="action-icon-btn btn-cm-toggle" data-id="' + cat.id + '" title="' + toggleIconTitle + '">' +
                  '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>' +
                '</button>' +
                '<button class="action-icon-btn danger btn-cm-delete" data-id="' + cat.id + '" title="Delete category">' +
                  '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>' +
                '</button>' +
              '</div>' +
            '</td>';
          tbody.appendChild(tr);
        });
      }
    }

    // Render Pagination Buttons
    var paginationContainer = document.getElementById('cmPaginationButtons');
    if (paginationContainer) {
      paginationContainer.innerHTML = '';
      
      var prevBtn = document.createElement('button');
      prevBtn.className = 'page-num-btn';
      prevBtn.innerHTML = '&larr;';
      prevBtn.disabled = cmCurrentPage <= 1;
      prevBtn.onclick = function() { if (cmCurrentPage > 1) { cmCurrentPage--; renderCategoryManagement(); } };
      paginationContainer.appendChild(prevBtn);

      for (var p = 1; p <= totalPages; p++) {
        (function(page) {
          var btn = document.createElement('button');
          btn.className = 'page-num-btn' + (page === cmCurrentPage ? ' active' : '');
          btn.textContent = page;
          btn.onclick = function() { cmCurrentPage = page; renderCategoryManagement(); };
          paginationContainer.appendChild(btn);
        })(p);
      }

      var nextBtn = document.createElement('button');
      nextBtn.className = 'page-num-btn';
      nextBtn.innerHTML = '&rarr;';
      nextBtn.disabled = cmCurrentPage >= totalPages;
      nextBtn.onclick = function() { if (cmCurrentPage < totalPages) { cmCurrentPage++; renderCategoryManagement(); } };
      paginationContainer.appendChild(nextBtn);
    }

    attachCmRowEvents();
  }

  function attachCmRowEvents() {
    // Edit Action
    document.querySelectorAll('.btn-cm-edit').forEach(function(btn) {
      btn.onclick = function() {
        var id = parseInt(btn.getAttribute('data-id'), 10);
        var cat = categoryDataset.find(function(c) { return c.id === id; });
        if (cat) openCmModal(cat);
      };
    });

    // Toggle Status
    document.querySelectorAll('.btn-cm-toggle').forEach(function(btn) {
      btn.onclick = function() {
        var id = parseInt(btn.getAttribute('data-id'), 10);
        var cat = categoryDataset.find(function(c) { return c.id === id; });
        if (cat) {
          cat.status = cat.status === 'active' ? 'inactive' : 'active';
          renderCategoryManagement();
        }
      };
    });

    // Delete Action
    document.querySelectorAll('.btn-cm-delete').forEach(function(btn) {
      btn.onclick = function() {
        var id = parseInt(btn.getAttribute('data-id'), 10);
        var cat = categoryDataset.find(function(c) { return c.id === id; });
        if (cat) openCmDelete(cat);
      };
    });
  }

  // Add / Edit Modal Controls
  var cmModal = document.getElementById('cmModal');
  var cmModalTitle = document.getElementById('cmModalTitle');
  var cmModalCloseBtn = document.getElementById('cmModalCloseBtn');
  var cmModalCancelBtn = document.getElementById('cmModalCancelBtn');
  var cmForm = document.getElementById('cmForm');
  var btnAddCategoryBtn = document.getElementById('btnAddCategoryBtn');

  function openCmModal(cat) {
    if (!cmModal) return;
    if (cat) {
      cmModalTitle.textContent = 'Edit Discipline Category';
      document.getElementById('cmEditId').value = cat.id;
      document.getElementById('cmNameInput').value = cat.name;
      document.getElementById('cmSlugInput').value = cat.slug;
      document.getElementById('cmOrderInput').value = cat.order;
      document.getElementById('cmDescInput').value = cat.description;
      document.getElementById('cmColorSelect').value = cat.color;
      document.getElementById('cmStatusSelect').value = cat.status;
    } else {
      cmModalTitle.textContent = 'Create New Discipline Category';
      cmForm.reset();
      document.getElementById('cmEditId').value = '';
      document.getElementById('cmOrderInput').value = categoryDataset.length + 1;
    }
    cmModal.classList.add('open');
  }

  if (btnAddCategoryBtn) btnAddCategoryBtn.onclick = function() { openCmModal(null); };
  if (cmModalCloseBtn) cmModalCloseBtn.onclick = function() { cmModal.classList.remove('open'); };
  if (cmModalCancelBtn) cmModalCancelBtn.onclick = function() { cmModal.classList.remove('open'); };
  if (cmModal) {
    cmModal.addEventListener('click', function(e) {
      if (e.target === cmModal) cmModal.classList.remove('open');
    });
  }

  if (cmForm) {
    cmForm.onsubmit = function(e) {
      e.preventDefault();
      var editId = document.getElementById('cmEditId').value;
      var name = document.getElementById('cmNameInput').value;
      var slug = document.getElementById('cmSlugInput').value;
      var order = parseInt(document.getElementById('cmOrderInput').value, 10) || 1;
      var desc = document.getElementById('cmDescInput').value;
      var color = document.getElementById('cmColorSelect').value;
      var status = document.getElementById('cmStatusSelect').value;

      if (editId) {
        var cat = categoryDataset.find(function(c) { return c.id === parseInt(editId, 10); });
        if (cat) {
          cat.name = name;
          cat.slug = slug;
          cat.order = order;
          cat.description = desc;
          cat.color = color;
          cat.status = status;
        }
      } else {
        var newCat = {
          id: Date.now(),
          name: name,
          slug: slug,
          order: order,
          videosCount: 0,
          status: status,
          color: color,
          description: desc
        };
        categoryDataset.push(newCat);
      }

      cmModal.classList.remove('open');
      renderCategoryManagement();
    };
  }

  // Delete Category Confirmation Modal
  var cmDeleteModal = document.getElementById('cmDeleteModal');
  function openCmDelete(cat) {
    if (!cmDeleteModal) return;
    pendingDeleteCategoryId = cat.id;
    document.getElementById('cmDeleteName').textContent = cat.name;
    cmDeleteModal.classList.add('open');
  }

  var cmDeleteCloseBtn = document.getElementById('cmDeleteCloseBtn');
  var cmDeleteCancelBtn = document.getElementById('cmDeleteCancelBtn');
  var cmDeleteConfirmBtn = document.getElementById('cmDeleteConfirmBtn');
  if (cmDeleteCloseBtn) cmDeleteCloseBtn.onclick = function() { cmDeleteModal.classList.remove('open'); };
  if (cmDeleteCancelBtn) cmDeleteCancelBtn.onclick = function() { cmDeleteModal.classList.remove('open'); };
  if (cmDeleteConfirmBtn) {
    cmDeleteConfirmBtn.onclick = function() {
      if (pendingDeleteCategoryId !== null) {
        categoryDataset = categoryDataset.filter(function(c) { return c.id !== pendingDeleteCategoryId; });
        pendingDeleteCategoryId = null;
        cmDeleteModal.classList.remove('open');
        renderCategoryManagement();
      }
    };
  }
  if (cmDeleteModal) {
    cmDeleteModal.addEventListener('click', function(e) {
      if (e.target === cmDeleteModal) cmDeleteModal.classList.remove('open');
    });
  }

  // Search & Filter listeners
  var cmSearchInput = document.getElementById('cmSearchInput');
  var cmSortSelect = document.getElementById('cmSortSelect');
  var btnResetCmFilters = document.getElementById('btnResetCmFilters');

  if (cmSearchInput) {
    cmSearchInput.addEventListener('input', function() {
      cmSearch = cmSearchInput.value;
      cmCurrentPage = 1;
      renderCategoryManagement();
    });
  }
  if (cmSortSelect) {
    cmSortSelect.addEventListener('change', function() {
      cmSort = cmSortSelect.value;
      renderCategoryManagement();
    });
  }
  if (btnResetCmFilters) {
    btnResetCmFilters.onclick = function() {
      cmSearch = '';
      cmSort = 'order';
      cmCurrentPage = 1;
      if (cmSearchInput) cmSearchInput.value = '';
      if (cmSortSelect) cmSortSelect.value = 'order';
      renderCategoryManagement();
    };
  }


  // ==========================================================================
  // 10. Platform Settings Tabs & Save Handling
  // ==========================================================================
  var settingsPills = document.querySelectorAll('.settings-pill-btn[data-settab]');
  settingsPills.forEach(function(pill) {
    pill.addEventListener('click', function() {
      settingsPills.forEach(function(p) { p.classList.remove('active'); });
      document.querySelectorAll('.settings-tab-pane').forEach(function(pane) { pane.classList.remove('active'); });

      pill.classList.add('active');
      var targetId = pill.getAttribute('data-settab');
      var targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  var btnSaveAllSettings = document.getElementById('btnSaveAllSettings');
  if (btnSaveAllSettings) {
    btnSaveAllSettings.addEventListener('click', function() {
      var origText = btnSaveAllSettings.innerHTML;
      btnSaveAllSettings.innerHTML = '<span style="color:#00E599;">✓ Settings Saved Successfully!</span>';
      setTimeout(function() {
        btnSaveAllSettings.innerHTML = origText;
      }, 2000);
    });
  }

});

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
