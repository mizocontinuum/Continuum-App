// ---- Apply Admin Visual CMS Edits ----
(function(){
  function applyCms(cms) {
    if (!cms || typeof cms !== "object") return;
    var pill = document.querySelector(".hero-text .pill");
    var h1 = document.querySelector(".hero-text h1");
    var sub = document.querySelector(".hero-text p");
    var cta1 = document.querySelector(".hero-text .cta .btn:not(.ghost)");
    if (pill && cms.pill) pill.textContent = cms.pill;
    if (h1 && cms.headline) h1.textContent = cms.headline;
    if (sub && cms.sub) sub.textContent = cms.sub;
    if (cta1 && cms.cta1) cta1.textContent = cms.cta1;
    if (cms.accent) document.documentElement.style.setProperty("--accent", cms.accent);
  }
  // Server CMS wins; localStorage is the offline/demo fallback.
  fetch("/api/cms/landing")
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(cms){
      if (cms && Object.keys(cms).length) { applyCms(cms); return; }
      try { applyCms(JSON.parse(localStorage.getItem("continuum_cms_landing") || "null")); } catch (e) {}
    })
    .catch(function(){
      try { applyCms(JSON.parse(localStorage.getItem("continuum_cms_landing") || "null")); } catch (e) {}
    });
})();

// ---- Canva-style Full Visual Editor (?edit=1) ----
(function(){
  var EDIT_KEY = "continuum_cms_live_edits";
  var editableSel = "h1, h2, h3, h4, p, .pill, .btn, .tag, .who, .card, .step, .cap2, .pn, .more li, .banner, .price, .plan li, img";
  var els = Array.prototype.slice.call(document.querySelectorAll(editableSel));
  var secs = Array.prototype.slice.call(document.querySelectorAll("section[id]"));

  // Apply saved live edits (server copy wins, localStorage is the fallback)
  function applyLive(saved) {
    if (!saved) return;
    if (saved.accent) document.documentElement.style.setProperty("--accent", saved.accent);
    if (Array.isArray(saved.items)) {
      saved.items.forEach(function(item, i){
        if (!els[i] || !item) return;
        if (item.text !== undefined && !els[i].children.length) els[i].textContent = item.text;
        if (item.style) els[i].setAttribute("style", item.style);
      });
    }
    if (Array.isArray(saved.hidden)) {
      secs.forEach(function(s){
        if (saved.hidden.indexOf(s.id) !== -1) s.style.display = "none";
      });
    }
  }
  try {
    var localSaved = JSON.parse(localStorage.getItem(EDIT_KEY) || "null");
    if (localSaved) applyLive(localSaved);
  } catch (e) {}
  fetch("/api/cms/landing?key=landing_live")
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(remote){ if (remote && Object.keys(remote).length) applyLive(remote); })
    .catch(function(){});

  if (window.location.search.indexOf("edit=1") === -1) return;

  var session = null;
  try { session = JSON.parse(localStorage.getItem("continuum.session") || "null"); } catch (e) {}
  if (!session || session.role !== "admin") {
    var loginUrl = new URL("login/index.html", window.location.href);
    loginUrl.searchParams.set("redirect", window.location.pathname + window.location.search);
    window.location.replace(loginUrl.href);
    return;
  }

  var st = document.createElement("style");
  st.textContent = ".cms-edit-target{outline:1px dashed rgba(46,168,255,0.35);outline-offset:3px;border-radius:6px;cursor:pointer;}.cms-selected{outline:2px solid #2ea8ff!important;box-shadow:0 0 0 4px rgba(46,168,255,0.2)!important;}.cms-sec-bar{position:absolute;top:14px;right:5vw;z-index:25;display:inline-flex;align-items:center;gap:4px;padding:4px;border-radius:999px;background:rgba(5,12,26,0.88);border:1px solid rgba(46,168,255,0.35);backdrop-filter:blur(10px);box-shadow:0 8px 24px rgba(0,0,0,0.4);}.cms-layer-btn{height:28px;padding:0 10px;border-radius:999px;border:0;background:transparent;color:#d8ecff;font-size:12px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:background .2s,color .2s;}.cms-layer-btn:hover{background:rgba(46,168,255,0.22);color:#fff;}";
  document.head.appendChild(st);

  var selectedEl = null;

  els.forEach(function(el){
    el.classList.add("cms-edit-target");
    if (!el.children.length) el.contentEditable = "true";
    el.addEventListener("click", function(e){
      if (el.tagName === "A") e.preventDefault();
      e.stopPropagation();
      if (selectedEl) selectedEl.classList.remove("cms-selected");
      selectedEl = el;
      el.classList.add("cms-selected");
      var cs = getComputedStyle(el);
      var lbl = document.getElementById("canvaSelLabel");
      if (lbl) lbl.textContent = el.tagName.toLowerCase();
      var fs = document.getElementById("canvaSize");
      if (fs) fs.value = parseInt(cs.fontSize, 10) || 16;
    });
  });

  secs.forEach(function(s){
    s.style.position = "relative";
    var bar = document.createElement("div");
    bar.className = "cms-sec-bar";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cms-layer-btn";
    if (s.style.display === "none") { s.style.display = ""; s.style.opacity = "0.35"; s.dataset.cmsHidden = "1"; }
    btn.textContent = s.dataset.cmsHidden === "1" ? "Show #" + s.id : "Hide #" + s.id;
    btn.onclick = function(){
      var hide = s.dataset.cmsHidden !== "1";
      s.dataset.cmsHidden = hide ? "1" : "0";
      s.style.opacity = hide ? "0.35" : "1";
      btn.textContent = hide ? "Show #" + s.id : "Hide #" + s.id;
    };
    var up = document.createElement("button");
    up.type = "button"; up.className = "cms-layer-btn"; up.textContent = "↑";
    up.onclick = function(){ if (s.previousElementSibling && s.previousElementSibling.tagName === "SECTION") s.parentNode.insertBefore(s, s.previousElementSibling); };
    var dn = document.createElement("button");
    dn.type = "button"; dn.className = "cms-layer-btn"; dn.textContent = "↓";
    dn.onclick = function(){ if (s.nextElementSibling && s.nextElementSibling.tagName === "SECTION") s.parentNode.insertBefore(s.nextElementSibling, s); };
    bar.appendChild(up); bar.appendChild(dn); bar.appendChild(btn);
    s.appendChild(bar);
  });

  // Floating Canva-style Toolbar
  var bar = document.createElement("div");
  bar.style.cssText = "position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-wrap:nowrap;overflow-x:auto;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;background:rgba(5,12,26,0.94);border:1px solid rgba(46,168,255,0.4);box-shadow:0 16px 40px rgba(0,0,0,0.65);backdrop-filter:blur(14px);color:#fff;font-size:12px;max-width:95vw;white-space:nowrap;";
  bar.innerHTML = "<strong style='color:#2ea8ff;padding:0 4px;' id='canvaSelLabel'>Canva Mode</strong>"
    + "<span style='width:1px;height:18px;background:rgba(255,255,255,0.15);'></span>"
    + "<label style='display:inline-flex;align-items:center;gap:4px;color:#b9d3ee;'>Size<input type='number' id='canvaSize' value='16' min='10' max='96' style='width:46px;height:28px;padding:0 6px;border-radius:8px;border:1px solid rgba(255,255,255,0.2);background:#091222;color:#fff;text-align:center;'></label>"
    + "<label style='display:inline-flex;align-items:center;gap:4px;color:#b9d3ee;'>Text<input type='color' id='canvaTxtCol' value='#ffffff' style='width:24px;height:24px;border:0;background:transparent;cursor:pointer;'></label>"
    + "<label style='display:inline-flex;align-items:center;gap:4px;color:#b9d3ee;'>Fill<input type='color' id='canvaBgCol' value='#091222' style='width:24px;height:24px;border:0;background:transparent;cursor:pointer;'></label>"
    + "<button id='canvaBold' style='height:28px;padding:0 9px;border-radius:8px;border:1px solid rgba(255,255,255,0.18);background:transparent;color:#fff;font-weight:700;cursor:pointer;'>B</button>"
    + "<button id='canvaAlignL' style='height:28px;padding:0 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.18);background:transparent;color:#fff;cursor:pointer;'>L</button>"
    + "<button id='canvaAlignC' style='height:28px;padding:0 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.18);background:transparent;color:#fff;cursor:pointer;'>C</button>"
    + "<button id='canvaHideEl' style='height:28px;padding:0 10px;border-radius:8px;border:1px solid rgba(255,80,80,0.4);background:transparent;color:#ff8a8a;cursor:pointer;'>Hide</button>"
    + "<label style='height:28px;padding:0 12px;border-radius:999px;border:1px solid rgba(46,168,255,0.45);background:rgba(10,108,240,0.2);color:#fff;cursor:pointer;font-weight:600;display:inline-flex;align-items:center;'>+ Media<input type='file' id='canvaUpload' accept='image/*,video/*' style='display:none;'></label>"
    + "<span style='width:1px;height:18px;background:rgba(255,255,255,0.15);'></span>"
    + "<button id='liveCmsSave' style='height:30px;padding:0 14px;border-radius:999px;border:0;background:linear-gradient(135deg,#0a6cf0,#2ea8ff);color:#fff;font-weight:700;cursor:pointer;'>Save & Publish</button>"
    + "<button id='liveCmsReset' style='height:28px;padding:0 11px;border-radius:999px;border:1px solid rgba(255,255,255,0.2);background:transparent;color:#b9d3ee;cursor:pointer;'>Reset</button>"
    + "<a href='index.html' style='height:28px;padding:0 11px;border-radius:999px;border:1px solid rgba(255,255,255,0.2);color:#fff;text-decoration:none;display:inline-flex;align-items:center;'>Exit</a>"
    + "<a href='admin/index.html#cms' style='height:28px;padding:0 11px;border-radius:999px;border:1px solid rgba(46,168,255,0.45);background:rgba(10,108,240,0.18);color:#fff;text-decoration:none;display:inline-flex;align-items:center;font-weight:600;'>← Admin</a>";
  document.body.appendChild(bar);

  document.getElementById("canvaSize").oninput = function(){ if (selectedEl) selectedEl.style.fontSize = this.value + "px"; };
  document.getElementById("canvaTxtCol").oninput = function(){ if (selectedEl) selectedEl.style.color = this.value; };
  document.getElementById("canvaBgCol").oninput = function(){ if (selectedEl) selectedEl.style.background = this.value; };
  document.getElementById("canvaBold").onclick = function(){ if (selectedEl) selectedEl.style.fontWeight = selectedEl.style.fontWeight === "800" ? "400" : "800"; };
  document.getElementById("canvaAlignL").onclick = function(){ if (selectedEl) selectedEl.style.textAlign = "left"; };
  document.getElementById("canvaAlignC").onclick = function(){ if (selectedEl) selectedEl.style.textAlign = "center"; };
  document.getElementById("canvaHideEl").onclick = function(){ if (selectedEl) selectedEl.style.display = "none"; };
  document.getElementById("canvaUpload").onchange = function(e){
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var url = URL.createObjectURL(file);
    if (file.type.indexOf("image/") === 0) {
      var reader = new FileReader();
      reader.onload = function(ev){
        if (selectedEl && selectedEl.tagName === "IMG") {
          selectedEl.src = ev.target.result;
        } else {
          var img = document.createElement("img");
          img.src = ev.target.result;
          img.style.cssText = "max-width:100%;border-radius:16px;margin-top:12px;display:block;";
          (selectedEl || document.querySelector(".hero-text")).appendChild(img);
        }
      };
      reader.readAsDataURL(file);
    } else if (file.type.indexOf("video/") === 0) {
      var vid = document.createElement("video");
      vid.src = url;
      vid.controls = true;
      vid.autoplay = true;
      vid.muted = true;
      vid.loop = true;
      vid.style.cssText = "max-width:100%;border-radius:16px;margin-top:12px;display:block;";
      (selectedEl || document.querySelector(".hero-text")).appendChild(vid);
    }
    this.value = "";
  };

  document.getElementById("liveCmsSave").onclick = function(){
    var hidden = secs.filter(function(s){ return s.dataset.cmsHidden === "1"; }).map(function(s){ return s.id; });
    var items = els.map(function(el){
      return {
        text: !el.children.length ? el.textContent : undefined,
        style: el.getAttribute("style") || ""
      };
    });
    var payload = { items: items, hidden: hidden };
    localStorage.setItem(EDIT_KEY, JSON.stringify(payload));
    var token = "";
    try { token = localStorage.getItem("continuum_auth_token") || ""; } catch (e) {}
    fetch("/api/cms/landing?key=landing_live", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
      body: JSON.stringify(payload)
    }).catch(function(){});
    this.textContent = "Saved! ✓";
    var self = this;
    setTimeout(function(){ self.textContent = "Save & Publish"; }, 1500);
  };
  document.getElementById("liveCmsReset").onclick = function(){
    localStorage.removeItem(EDIT_KEY);
    var token = "";
    try { token = localStorage.getItem("continuum_auth_token") || ""; } catch (e) {}
    fetch("/api/cms/landing?key=landing_live", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
      body: JSON.stringify({})
    }).catch(function(){});
    window.location.reload();
  };
})();

// ---- Full-section twinkling dots for hero ----
(function(){
  var c = document.getElementById("heroStars");
  if (!c) return;
  var ctx = c.getContext("2d");
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dots = [];
  var t = 0;
  function paint() {
    var w = c.clientWidth, h = c.clientHeight;
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      if (!still) {
        d.x = (d.x + d.vx + 1) % 1;
        d.y = (d.y + d.vy + 1) % 1;
      }
      var a = 0.2 + 0.55 * (0.5 + 0.5 * Math.sin(t + d.p));
      ctx.fillStyle = "rgba(150, 220, 255, " + a.toFixed(2) + ")";
      ctx.beginPath();
      ctx.arc(d.x * w, d.y * h, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    c.width = c.clientWidth * dpr;
    c.height = c.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paint();
  }
  for (var i = 0; i < 90; i++) {
    dots.push({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0004,
      vy: (Math.random() - 0.5) * 0.0004,
      r: 0.6 + Math.random() * 1.6,
      p: Math.random() * 6.28
    });
  }
  window.addEventListener("resize", resize);
  resize();
  if (still) return;
  (function loop() {
    t += 0.025;
    paint();
    requestAnimationFrame(loop);
  })();
})();

// ---- scroll reveal + counters ----
(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveal = function(el){
    el.classList.add('in');
    var n = el.querySelector('[data-n]');
    if (n) n.textContent = Number(n.dataset.n || 0).toLocaleString();
  };
  if (reduced || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(reveal);
    return;
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.classList.add('in');
      io.unobserve(el);
      var n = el.querySelector('[data-n]');
      if (!n) return;
      var to = Number(n.dataset.n || 0), start = null;
      (function step(ts){
        start = start || ts;
        var p = Math.min((ts - start) / 1400, 1);
        n.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    });
  }, { threshold: .15 });
  document.querySelectorAll('.reveal').forEach(function(el, i){
    el.style.transitionDelay = reduced ? '0ms' : (i % 4) * 90 + 'ms';
    io.observe(el);
  });
})();

// ---- navigation, filters, FAQ, billing, and signup CTA ----
(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var bar = document.getElementById('bar');
  addEventListener('scroll', function(){
    var max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? Math.min(100, Math.max(0, scrollY / max * 100)) : 0) + '%';
  });

  var navToggle = document.getElementById('navToggle');
  var navPanel = document.getElementById('primaryNav');
  var desktopNav = window.matchMedia('(min-width: 701px)');
  var setNav = function(open){
    navPanel.classList.toggle('open', open);
    document.body.classList.toggle('nav-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  };
  navToggle.addEventListener('click', function(){
    setNav(!navPanel.classList.contains('open'));
  });
  navPanel.querySelectorAll('a').forEach(function(link){
    link.addEventListener('click', function(){ setNav(false); });
  });
  document.addEventListener('click', function(event){
    if (navPanel.classList.contains('open') && !navPanel.contains(event.target) && !navToggle.contains(event.target)) setNav(false);
  });
  document.addEventListener('keydown', function(event){
    if (event.key === 'Escape' && navPanel.classList.contains('open')) {
      setNav(false);
      navToggle.focus();
    }
  });
  var handleNavBreakpoint = function(event){
    if (event.matches) setNav(false);
  };
  if (desktopNav.addEventListener) desktopNav.addEventListener('change', handleNavBreakpoint);
  else desktopNav.addListener(handleNavBreakpoint);

  if (!reduced) {
    document.querySelectorAll('.card').forEach(function(card){
      card.addEventListener('pointermove', function(event){
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (event.clientX - r.left) + 'px');
        card.style.setProperty('--my', (event.clientY - r.top) + 'px');
      });
    });
  }

  var tabs = document.querySelectorAll('.tabs button');
  tabs.forEach(function(button){
    button.addEventListener('click', function(){
      tabs.forEach(function(item){
        item.classList.toggle('on', item === button);
        item.setAttribute('aria-pressed', String(item === button));
      });
      document.querySelectorAll('#courses .card').forEach(function(card){
        card.classList.toggle('hide', button.dataset.f !== 'all' && card.dataset.cat !== button.dataset.f);
      });
    });
  });

  document.querySelectorAll('.q button').forEach(function(button){
    button.addEventListener('click', function(){
      var item = button.parentElement;
      var open = !item.classList.contains('open');
      item.classList.toggle('open', open);
      button.setAttribute('aria-expanded', String(open));
      var answer = document.getElementById(button.getAttribute('aria-controls'));
      if (answer) answer.setAttribute('aria-hidden', String(!open));
    });
  });

  var sw = document.getElementById('sw');
  sw.addEventListener('click', function(){
    var yearly = !sw.classList.contains('on');
    sw.classList.toggle('on', yearly);
    sw.setAttribute('aria-checked', String(yearly));
    document.querySelectorAll('[data-m]').forEach(function(price){
      price.firstChild.nodeValue = yearly ? price.dataset.y : price.dataset.m;
    });
  });

  var joinForm = document.getElementById('joinForm');
  var joinEmail = document.getElementById('joinEmail');
  var joinError = document.getElementById('joinError');
  var go = document.getElementById('go');
  joinEmail.setAttribute('aria-describedby', 'joinError');
  joinEmail.addEventListener('input', function(){
    joinEmail.removeAttribute('aria-invalid');
    joinError.textContent = '';
  });
  joinForm.addEventListener('submit', function(event){
    event.preventDefault();
    var email = joinEmail.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      joinError.textContent = 'Enter a valid email address to continue.';
      joinEmail.setAttribute('aria-invalid', 'true');
      joinEmail.focus();
      return;
    }
    go.textContent = 'Opening signup...';
    window.location.assign('signup/index.html?email=' + encodeURIComponent(email));
  });
})();

// ---- upgrades 2: theme, glow, typewriter, quiz, magnetic, confetti ----
(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var themeButton = document.getElementById('theme');
  var syncThemeButton = function(){
    if (!themeButton) return;
    var dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    themeButton.setAttribute('aria-pressed', String(dark));
    themeButton.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  };
  syncThemeButton();
  themeButton.addEventListener('click', function(){
    var dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    syncThemeButton();
  });
  var glow = document.getElementById('glow');
  if (!reduced && matchMedia('(hover: hover)').matches) {
    addEventListener('pointermove', function(e){glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px';});
  }
  var top = document.getElementById('top');
  addEventListener('scroll', function(){top.classList.toggle('show', scrollY > 600);});
  top.addEventListener('click', function(){scrollTo({top:0, behavior: reduced ? 'auto' : 'smooth'});});
  // typewriter
  var txt = '// Your first lesson\nconst name = "Learner";\nconsole.log("Hello, " + name + "!");\n\n// Output: Hello, Learner!';
  var code = document.getElementById('code');
  if (code) {
    if (reduced || !('IntersectionObserver' in window)) {
      code.textContent = txt;
    } else {
      var started = false;
      new IntersectionObserver(function(entries, observer){
        if (!entries[0].isIntersecting || started) return;
        started = true;
        var i = 0;
        (function type(){
          code.textContent = txt.slice(0, ++i);
          if (i < txt.length) setTimeout(type, 45);
        })();
        observer.disconnect();
      }, {threshold:.4}).observe(code);
    }
  }
  // quiz
  var fb = document.getElementById('fb');
  document.querySelectorAll('.opt').forEach(function(b){b.addEventListener('click',function(){
    document.querySelectorAll('.opt').forEach(function(x){x.classList.remove('good','bad');});
    if (b.dataset.ok === '1') {
      b.classList.add('good');
      fb.textContent = 'Correct! +10 XP';
      confetti(18);
    } else {
      b.classList.add('bad');
      fb.textContent = 'Not quite, try again.';
    }
  });});
  // magnetic buttons (below the hero)
  if (!reduced) {
    document.querySelectorAll('section .btn').forEach(function(b){
      b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.2)+'px,'+((e.clientY-r.top-r.height/2)*.3)+'px)';});
      b.addEventListener('pointerleave',function(){b.style.transform='';});
    });
  }
  function confetti(n){
    if (reduced) return;
    var em = ['🎉','✨','🎓','📚','⭐'];
    for (var i = 0; i < n; i++) {
      var s = document.createElement('span');
      s.className = 'conf';
      s.textContent = em[i % 5];
      s.style.left = Math.random() * 100 + 'vw';
      s.style.animationDelay = Math.random() * .5 + 's';
      document.body.appendChild(s);
      setTimeout(function(x){x.remove();}, 3000, s);
    }
  }
})();

// ---- upgrades 3: manifesto word reveal ----
(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var m = document.getElementById('mani');
  m.innerHTML = m.textContent.split(' ').map(function(w){return '<span>'+w+'</span>';}).join(' ');
  var s = m.querySelectorAll('span');
  if (reduced) {
    s.forEach(function(x){x.classList.add('on');});
    return;
  }
  function u(){var r=m.getBoundingClientRect(),p=Math.min(1,Math.max(0,(innerHeight*.85-r.top)/(r.height+innerHeight*.25)));
    s.forEach(function(x,i){x.classList.toggle('on', i/s.length < p);});}
  addEventListener('scroll', u);
  u();
})();

// ---- banner tilt ----
(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var b = document.querySelector('.banner');
  if (!b || reduced) return;
  b.parentElement.style.perspective = '1200px';
  b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;b.style.transform='rotateY('+(x*8)+'deg) rotateX('+(-y*8)+'deg)';});
  b.addEventListener('pointerleave',function(){b.style.transform='';});
})();

// ---- section 2: feature showcase ----
(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var it = document.querySelectorAll('.fi');
  var sc = document.querySelectorAll('.scr');
  var dev = document.getElementById('dev');
  var st = document.querySelector('.stage3');
  var cur = 0, t, autoplay = !reduced;
  var autoplayBtn = document.createElement('button');
  autoplayBtn.type = 'button';
  autoplayBtn.className = 'feature-autoplay';
  st.appendChild(autoplayBtn);

  function syncAutoplay(){
    autoplayBtn.setAttribute('aria-pressed', String(autoplay));
    autoplayBtn.setAttribute('aria-label', autoplay ? 'Pause automatic feature preview' : 'Play automatic feature preview');
    autoplayBtn.textContent = autoplay ? 'Pause preview' : 'Play preview';
  }
  function go(i){
    cur = i;
    it.forEach(function(b, index){
      b.classList.toggle('on', index === i);
      b.setAttribute('aria-pressed', String(index === i));
    });
    sc.forEach(function(s, index){
      s.classList.toggle('on', index === i);
      s.setAttribute('aria-hidden', String(index !== i));
    });
  }
  function loop(){
    clearTimeout(t);
    if (!autoplay) return;
    t = setTimeout(function(){go((cur + 1) % it.length);loop();}, 5000);
  }
  it.forEach(function(b, k){
    b.addEventListener('click', function(){go(k);loop();});
  });
  autoplayBtn.addEventListener('click', function(){
    autoplay = !autoplay;
    syncAutoplay();
    loop();
  });
  if (!reduced) {
    st.addEventListener('pointermove', function(e){var r=st.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      dev.style.transform='rotateY('+(-14+x*18)+'deg) rotateX('+(6-y*14)+'deg)';});
    st.addEventListener('pointerleave', function(){dev.style.transform='';});
  }
  syncAutoplay();
  go(0);
  loop();
})();

// ---- watch & learn player ----
(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FALLBACK={
    Marketing:{h:230,l:[['Know your audience',500,['Build a simple customer profile','Speak your audience’s language']],['Craft an offer people want',665,['Turn features into benefits','Write a clear, simple promise']],['Content that gets noticed',580,['Hooks that stop the scroll','Repurpose one idea everywhere']],['Measure what matters',435,['Pick three numbers to track','Improve a little every week']]]},
    Mindset:{h:38,l:[['Build a growth mindset',390,['See challenges as practice','Turn setbacks into progress']],['Make habits stick',550,['Start tiny and stay consistent','Design your day for focus']],['Learn faster, remember more',620,['Use active recall','Teach it to lock it in']]]},
    Sales:{h:200,l:[['Start better conversations',470,['Ask questions that open people up','Listen first, then offer']],['Handle objections calmly',530,['Understand the real concern','Respond with confidence']],['Follow up the right way',410,['Stay helpful, not pushy','Build trust over time']]]},
    Leadership:{h:262,l:[['Lead with clarity',480,['Set goals everyone understands','Communicate with purpose']],['Give feedback that helps',520,['Be specific and kind','Turn feedback into action']],['Grow your team',600,['Delegate with trust','Celebrate small wins']]]}
  };
  var cat='Marketing',idx=0,pos=0,playing=!reduced,SIM=14000,done={},D=FALLBACK,iv=null;
  var $=function(id){return document.getElementById(id);};
  var vs=$('vs'),vtitle=$('vtitle'),vcat=$('vcat'),vdur=$('vdur'),vtime=$('vtime'),vprog=$('vprog'),vpts=$('vpoints'),lessons=$('lessons'),vplay=$('vplay'),vtrack=$('vtrack'),chips=$('chips');
  if(!vs)return;
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function fmt(s){var m=Math.floor(s/60),x=Math.floor(s%60);return m+':'+(x<10?'0':'')+x;}
  function buildData(){
    var c=window.__continuumCatalogue;
    if(c&&c.disciplines&&c.disciplines.length){
      var out={};
      c.disciplines.slice(0,6).forEach(function(d,i){
        var items=(c.videos||[]).filter(function(v){return v.discipline_id===d.id;}).slice(0,8);
        if(!items.length)return;
        out[d.title||d.name||d.id]={h:60+((i*47)%220),l:items.map(function(v){
          var pts=(Array.isArray(v.outcomes)&&v.outcomes.length?v.outcomes:[v.summary||'Expert masterclass']).slice(0,3);
          return [v.title,Math.max(60,(Number(v.minutes)||30)*60),pts];
        })};
      });
      if(Object.keys(out).length)return out;
    }
    return FALLBACK;
  }
  function list(){lessons.innerHTML=D[cat].l.map(function(l,i){
    return '<button type="button" class="lsn'+(i===idx?' on':'')+(done[cat+i]?' done':'')+'" data-i="'+i+'" aria-current="'+(i===idx)+'"><div class="no">'+(done[cat+i]?'✓':i+1)+'</div><div><b>'+esc(l[0])+'</b><small>'+fmt(l[1])+' min</small></div></button>';}).join('');}
  function syncPlay(){
    vplay.textContent = playing ? '⏸' : '▶';
    vplay.setAttribute('aria-label', playing ? 'Pause preview' : 'Play preview');
    vplay.setAttribute('aria-pressed', String(playing));
  }
  function updateProgress(){
    var percent = Math.round(pos * 100);
    vprog.style.width = (pos * 100) + '%';
    vtime.textContent = fmt(pos * D[cat].l[idx][1]);
    vtrack.setAttribute('aria-valuenow', String(percent));
    vtrack.setAttribute('aria-valuetext', fmt(pos * D[cat].l[idx][1]) + ' of ' + fmt(D[cat].l[idx][1]));
  }
  function load(i){idx=i;pos=0;var l=D[cat].l[i];
    vtitle.style.animation='none';void vtitle.offsetWidth;vtitle.style.animation='';
    vtitle.textContent=l[0];vcat.textContent=cat.toUpperCase();vs.style.setProperty('--vh',D[cat].h);vdur.textContent=fmt(l[1]);
    vpts.innerHTML=l[2].map(function(p,k){return '<li style="animation-delay:'+(k*.25+.2)+'s">'+esc(p)+'</li>';}).join('');
    list();
    updateProgress();
  }
  lessons.addEventListener('click',function(e){var b=e.target.closest('.lsn');if(b){load(+b.dataset.i);playing=true;syncPlay();}});
  vplay.addEventListener('click',function(){playing=!playing;syncPlay();});
  function seekTo(value){pos=Math.min(1,Math.max(0,value));updateProgress();}
  vtrack.addEventListener('click',function(e){var r=vtrack.getBoundingClientRect();seekTo((e.clientX-r.left)/r.width);});
  vtrack.addEventListener('keydown',function(e){
    var step = e.shiftKey ? .1 : .05;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') seekTo(pos + step);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') seekTo(pos - step);
    else if (e.key === 'PageUp') seekTo(pos + .2);
    else if (e.key === 'PageDown') seekTo(pos - .2);
    else if (e.key === 'Home') seekTo(0);
    else if (e.key === 'End') seekTo(1);
    else return;
    e.preventDefault();
  });
  function tick(){
    clearInterval(iv);
    iv=setInterval(function(){
      if(!playing)return;
      pos+=100/SIM;
      if(pos>=1){done[cat+idx]=1;load((idx+1)%D[cat].l.length);}
      updateProgress();
    },100);
  }
  function boot(){
    D=buildData();
    done={};idx=0;pos=0;
    var names=Object.keys(D);
    cat=names[0];
    chips.innerHTML=names.map(function(n,i){
      return '<button type="button"'+(i===0?' class="on" aria-pressed="true"':' aria-pressed="false"')+'>'+esc(n)+'</button>';
    }).join('');
    chips.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){
      chips.querySelectorAll('button').forEach(function(x){
        x.classList.toggle('on',x===b);
        x.setAttribute('aria-pressed',String(x===b));
      });
      cat=b.textContent;load(0);
    });});
    load(0);
    syncPlay();
    tick();
  }
  // First paint uses the fallback; the catalogue fetch re-boots with real data.
  window.__continuumDemoBoot=boot;
  boot();
})();

// ---- section 3: flip cards + banner shine ----
(function(){
  document.querySelectorAll('.flip').forEach(function(c){
    function t(){c.classList.toggle('flipped');}
    c.addEventListener('click',t);
    c.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();t();}});
  });
  var bn=document.getElementById('bn');
  if(bn)bn.addEventListener('pointermove',function(e){var r=bn.getBoundingClientRect();bn.style.setProperty('--mx',(e.clientX-r.left)+'px');bn.style.setProperty('--my',(e.clientY-r.top)+'px');});
})();

// ---- section 3: expanding panels ----
(function(){
  var ps = document.querySelectorAll('.pn');
  function act(p){
    ps.forEach(function(x){
      var active = x === p;
      var body = x.querySelector('.pbody');
      x.classList.toggle('active', active);
      x.setAttribute('aria-expanded', String(active));
      if (body) body.setAttribute('aria-hidden', String(!active));
    });
  }
  ps.forEach(function(p, index){
    var body = p.querySelector('.pbody');
    var heading = p.querySelector('h3');
    if (body) {
      if (!body.id) body.id = 'brandPanel' + (index + 1);
      p.setAttribute('aria-controls', body.id);
    }
    if (heading) p.setAttribute('aria-label', heading.textContent.trim());
    p.addEventListener('mouseenter',function(){if(matchMedia('(hover:hover)').matches)act(p);});
    p.addEventListener('click',function(){act(p);});
    p.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();act(p);}});
  });
  act(document.querySelector('.pn.active') || ps[0]);
})();

// ---- 3D tilt cards ----
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.card').forEach(function(c){
    c.addEventListener('pointermove',function(e){
      var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      c.style.transform='rotateY('+(x*14)+'deg) rotateX('+(-y*14)+'deg) translateY(-4px)';
    });
    c.addEventListener('pointerleave',function(){c.style.transform='';});
  });
}

// ---- catalogue-driven courses + demo player ----
(function(){
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

  fetch('/api/catalogue')
    .then(function(r){return r.ok?r.json():null;})
    .then(function(cat){
      if (!cat || !Array.isArray(cat.disciplines) || !cat.disciplines.length) return;
      var discs = cat.disciplines.slice().sort(function(a,b){return (a.sort_order||0)-(b.sort_order||0);});
      var vids = Array.isArray(cat.videos) ? cat.videos : [];
      var maxCount = Math.max(1, ...discs.map(function(d){return vids.filter(function(v){return v.discipline_id===d.id;}).length;}));

      // #courses: one card per discipline, tabs rebuilt from the catalogue.
      var coursesGrid = document.querySelector('#courses .grid');
      var tabs = document.querySelector('#courses .tabs');
      if (coursesGrid && tabs) {
        tabs.innerHTML = '<button type="button" class="on" data-f="all" aria-pressed="true">All</button>' +
          discs.map(function(d,i){return '<button type="button" data-f="d'+i+'" aria-pressed="false">'+esc(d.name||d.title||d.id)+'</button>';}).join('');
        coursesGrid.innerHTML = discs.map(function(d,i){
          var items = vids.filter(function(v){return v.discipline_id===d.id;});
          var avg = items.length ? Math.round(items.reduce(function(s,v){return s+(Number(v.rating)||0);},0)/items.length) : 0;
          var mins = items.reduce(function(s,v){return s+(Number(v.minutes)||0);},0);
          var pct = Math.round((items.length/maxCount)*100);
          return '<a class="card reveal" data-cat="d'+i+'" href="home/index.html" style="text-decoration:none;color:inherit">'
            + '<span class="tag">'+esc((d.name||d.title||'').toUpperCase())+'</span>'
            + '<h3>'+esc(d.title||d.name||d.id)+'</h3>'
            + '<p>'+esc(d.blurb||d.goal||'Executive masterclasses.')+'</p>'
            + '<div class="meta"><span>'+(avg?('⭐ '+avg):'')+'</span><span>'+items.length+' masterclass'+(items.length===1?'':'es')+(mins?' · '+mins+' min':'')+'</span></div>'
            + '<div class="bar"><i style="--w:'+pct+'%"></i></div></a>';
        }).join('');
        // Re-run the reveal observer classes already applied; tabs filter wiring:
        tabs.querySelectorAll('button').forEach(function(button){
          button.addEventListener('click',function(){
            tabs.querySelectorAll('button').forEach(function(item){
              item.classList.toggle('on',item===button);
              item.setAttribute('aria-pressed',String(item===button));
            });
            document.querySelectorAll('#courses .card').forEach(function(card){
              card.classList.toggle('hide',button.dataset.f!=='all'&&card.dataset.cat!==button.dataset.f);
            });
          });
        });
        // Re-observe new cards for scroll reveal.
        if ('IntersectionObserver' in window) {
          var io = new IntersectionObserver(function(entries){
            entries.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}});
          },{threshold:.15});
          coursesGrid.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});
        } else {
          coursesGrid.querySelectorAll('.reveal').forEach(function(el){el.classList.add('in');});
        }
      }

      // #demo: rebuild the preview player data from real masterclasses.
      window.__continuumCatalogue = { disciplines: discs, videos: vids };
      if (typeof window.__continuumDemoBoot === 'function') window.__continuumDemoBoot();
    })
    .catch(function(){});
})();
