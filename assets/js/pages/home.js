/**
 * Continuum - Home Page Controller
 * Clean, Modular Architecture:
 * 1. Native Video Player Controller (.np)
 * 2. Navigation & Sub-Page Router (Home, Movies, Series, Library, My list)
 * 3. Global Search Controller
 * 4. Sliding Navbar Indicator
 * 5. Iframe Style Injection & Dynamic Padding
 */

/* ==========================================================================
   1. NATIVE VIDEO PLAYER CONTROLLER (.np)
   ========================================================================== */
(() => {
  const $ = (id) => document.getElementById(id);

  // Player Elements
  const np = $("np");
  const v = $("npVid");
  const art = $("npArt");
  const fill = $("npFill");
  const dot = $("npDot");
  const prog = $("npProg");
  const tip = $("npTip");
  const vol = $("npVol");

  // Playback State
  let o = null;
  let t = 0;
  let total = 5400;
  let playing = false;
  let timer = null;
  let speed = 1;
  let hideT = 0;
  let tick = 0;
  let clk = 0;
  let rt = 0;
  let prevFocus = null;

  // Storage Keys & Formatters
  const CWK = "continueWatching";
  const HK = "watchHistory";
  const DK = "completedTitles";
  const pad = (n) => String(n).padStart(2, "0");

  const fmt = (s) => {
    s = Math.max(0, Math.floor(s));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const x = s % 60;
    return h ? h + ":" + pad(m) + ":" + pad(x) : m + ":" + pad(x);
  };

  const dur = (str) => {
    str = String(str || "");
    const h = /(\d+)\s*h/i.exec(str);
    const m = /(\d+)\s*m/i.exec(str);
    return (h ? +h[1] * 3600 : 0) + (m ? +m[1] * 60 : 0) || 5400;
  };

  const rd = () => {
    try {
      return JSON.parse(localStorage.getItem(CWK)) || [];
    } catch (e) {
      return [];
    }
  };

  const wr = (a) => {
    try {
      localStorage.setItem(CWK, JSON.stringify(a));
    } catch (e) {}
  };

  const addUniq = (k, t) => {
    let L = [];
    try {
      L = JSON.parse(localStorage.getItem(k)) || [];
    } catch (e) {}
    L = L.filter((x) => x !== t);
    L.unshift(t);
    try {
      localStorage.setItem(k, JSON.stringify(L.slice(0, 200)));
    } catch (e) {}
  };

  // State Persistence
  function save() {
    if (!o || o.key === null) return;
    const k = o.key || o.title;
    const L = rd();
    const i = L.findIndex((x) => x.title === k);

    if (t >= 10 && t < total * 0.95) {
      const e = { title: k, sec: Math.floor(t), total: Math.floor(total), at: Date.now() };
      if (i >= 0) L[i] = e;
      else L.push(e);
    } else if (i >= 0) {
      L.splice(i, 1);
    }
    wr(L);
  }

  function paint() {
    const r = total ? Math.min(1, t / total) : 0;
    fill.style.width = r * 100 + "%";
    dot.style.left = r * 100 + "%";
    $("npLeft").textContent = fmt(total - t);
    $("npSkip").classList.toggle("on", !!o && o.intro !== false && t > 3 && t < 40);
    prog.setAttribute("aria-valuenow", Math.round(r * 100));
  }

  const spin = (on) => np.classList.toggle("loading", on);

  function flash() {
    const f = $("npFlash");
    f.className = "np-flash";
    void f.offsetWidth;
    f.className = "np-flash go " + (playing ? "p" : "z");
  }

  function play() {
    if (!o) return;
    playing = true;
    np.classList.remove("paused");
    bump();

    if (o.video) {
      v.playbackRate = speed;
      const p = v.play();
      if (p && p.catch) {
        p.catch(() => {
          v.muted = true;
          np.classList.add("muted");
          v.play().catch(() => {});
        });
      }
    } else {
      clearInterval(timer);
      timer = setInterval(() => {
        t += 0.25 * speed;
        if (t >= total) {
          t = total;
          paint();
          end();
          return;
        }
        paint();
        if (++tick % 40 === 0) save();
      }, 250);
    }
  }

  function pause() {
    playing = false;
    np.classList.add("paused");
    clearInterval(timer);
    if (o && o.video) v.pause();
  }

  function toggle() {
    if (!o) return;
    if (playing) pause();
    else play();
    flash();
  }

  function seek(s) {
    t = Math.max(0, Math.min(total - 1, s));
    if (o && o.video) v.currentTime = t;
    paint();
    bump();
  }

  function bump() {
    np.classList.remove("idle");
    clearTimeout(hideT);
    hideT = setTimeout(() => {
      if (playing && !np.querySelector(".np-bottom:hover")) {
        np.classList.add("idle");
      }
    }, 2800);
  }

  function open(opts) {
    if (!np.classList.contains("open")) prevFocus = document.activeElement;
    clearTimeout(rt);
    clearInterval(timer);
    o = opts;

    if (opts.key !== null) addUniq(HK, opts.title);
    total = opts.total || dur(opts.dur);

    const key = opts.key || opts.title;
    const sv = rd().find((x) => x.title === key);
    t = opts.start != null ? opts.start : opts.key === null || !sv ? 0 : sv.sec;
    if (t >= total - 5) t = 0;

    speed = 1;
    $("npSpeed").textContent = "1x";
    $("npTitle").textContent = opts.title || "";
    $("npSub").textContent = opts.sub || "";
    art.style.background = opts.bg || "#071225";
    $("npNext").hidden = !opts.next;
    $("npDemo").hidden = !!opts.video;
    v.hidden = !opts.video;

    if (opts.video) v.src = opts.video;
    else v.removeAttribute("src");

    np.hidden = false;
    void np.offsetWidth;
    np.classList.add("open", "paused");
    paint();
    np.focus();
    spin(true);

    rt = setTimeout(() => {
      if (!opts.video) spin(false);
      play();
    }, opts.video ? 0 : 900);
  }

  function end() {
    pause();
    t = total;
    save();
    if (o && o.next) {
      const n = o.next;
      open(n);
    } else {
      if (o && o.key !== null) addUniq(DK, o.title);
      close();
    }
  }

  function close() {
    if (!o) return;
    clearTimeout(rt);
    pause();
    save();
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen();
    }
    v.removeAttribute("src");
    v.load();
    spin(false);
    np.classList.remove("open");
    const cb = o.onClose;
    o = null;
    setTimeout(() => {
      if (!o) np.hidden = true;
    }, 250);
    try {
      prevFocus && prevFocus.focus && prevFocus.focus();
    } catch (e) {}
    try {
      cb && cb();
    } catch (e) {}
  }

  function fs() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (np.requestFullscreen) {
      np.requestFullscreen().catch(() => {});
    }
  }

  // Media Listeners
  v.addEventListener("loadedmetadata", () => {
    if (v.duration && isFinite(v.duration)) total = v.duration;
    if (t > 0) v.currentTime = t;
    paint();
  });
  v.addEventListener("timeupdate", () => {
    t = v.currentTime;
    paint();
    if (++tick % 20 === 0) save();
  });
  v.addEventListener("waiting", () => spin(true));
  v.addEventListener("playing", () => spin(false));
  v.addEventListener("ended", end);

  // Control Listeners
  $("npPlay").onclick = toggle;
  $("npBack").onclick = close;
  $("npRew").onclick = () => seek(t - 10);
  $("npFwd").onclick = () => seek(t + 10);
  $("npSkip").onclick = () => seek(41);
  $("npNext").onclick = () => {
    if (o && o.next) {
      const n = o.next;
      t = total;
      save();
      open(n);
    }
  };
  $("npSpeed").onclick = () => {
    const s = [0.75, 1, 1.25, 1.5, 2];
    speed = s[(s.indexOf(speed) + 1) % s.length];
    v.playbackRate = speed;
    $("npSpeed").textContent = speed + "x";
  };
  $("npFs").onclick = fs;
  document.addEventListener("fullscreenchange", () => {
    np.classList.toggle("fs", !!document.fullscreenElement);
  });

  vol.oninput = () => {
    v.volume = +vol.value;
    v.muted = +vol.value === 0;
    np.classList.toggle("muted", v.muted);
  };
  $("npMute").onclick = () => {
    v.muted = !v.muted;
    if (!v.muted && v.volume === 0) {
      v.volume = 0.5;
      vol.value = 0.5;
    }
    np.classList.toggle("muted", v.muted);
  };

  // Scrubbing & Hover Preview
  const ratio = (e) => {
    const r = prog.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
  };
  let drag = false;
  prog.addEventListener("pointerdown", (e) => {
    drag = true;
    prog.setPointerCapture(e.pointerId);
    seek(ratio(e) * total);
  });
  prog.addEventListener("pointermove", (e) => {
    const r = ratio(e);
    tip.textContent = fmt(r * total);
    tip.style.left = r * 100 + "%";
    if (drag) seek(r * total);
  });
  prog.addEventListener("pointerup", () => {
    drag = false;
  });
  prog.addEventListener("pointercancel", () => {
    drag = false;
  });

  // Screen Click & Gestures
  np.addEventListener("click", (e) => {
    if (e.target.closest(".np-top,.np-bottom,.np-skip")) return;
    clearTimeout(clk);
    if (e.detail > 1) {
      fs();
      return;
    }
    clk = setTimeout(toggle, 220);
  });

  ["mousemove", "pointerdown", "touchstart"].forEach((n) => {
    np.addEventListener(n, bump, { passive: true });
  });

  // Keyboard Shortcuts
  document.addEventListener(
    "keydown",
    (e) => {
      if (!o) return;
      const k = e.key;
      if (k === "Tab") return;
      e.stopImmediatePropagation();
      bump();

      const tag = e.target && e.target.tagName;
      if (tag === "BUTTON" && (k === " " || k === "Enter")) return;
      if (e.target === vol && k.startsWith("Arrow")) return;

      if (k === " " || k === "k" || k === "K") toggle();
      else if (k === "ArrowLeft" || k === "j" || k === "J") seek(t - 10);
      else if (k === "ArrowRight" || k === "l" || k === "L") seek(t + 10);
      else if (k === "ArrowUp" || k === "ArrowDown") {
        const n = Math.max(0, Math.min(1, +vol.value + (k === "ArrowUp" ? 0.1 : -0.1)));
        vol.value = n;
        vol.oninput();
      } else if (k === "m" || k === "M") $("npMute").click();
      else if (k === "f" || k === "F") fs();
      else if (k === "Escape") {
        if (!document.fullscreenElement) close();
      } else return;

      e.preventDefault();
    },
    true
  );

  addEventListener("pagehide", () => {
    save();
  });

  // Global APIs
  window.NFPlay = open;
  window.NFClose = close;
})();

/* ==========================================================================
   2. APP ROUTING & SUB-PAGE NAVIGATION
   ========================================================================== */
const R = {
  home: "Home",
  movies: "Movies",
  series: "Series",
  cartoons: "Library",
  mylist: "My list",
};

const f = document.getElementById("f");

function count() {}

function go() {
  const r = R[location.hash.slice(1)] ? location.hash.slice(1) : "home";
  document.querySelectorAll(".links a").forEach((a) => {
    const on = a.dataset.r === r;
    a.classList.toggle("on", on);
    if (on) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  document.title = R[r] + " – Continuum";
  count();
  f.style.opacity = 0;
  setTimeout(() => {
    f.srcdoc = P[r];
  }, 150);
}

/* ==========================================================================
   3. SEARCH INTERFACE
   ========================================================================== */
let pend = null;

function run() {
  const d = f.contentDocument;
  const i = d && d.getElementById("searchInput");
  if (!pend || !i) return;
  i.value = pend;
  pend = null;
  i.dispatchEvent(new d.defaultView.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
}

f.onload = () => {
  f.style.opacity = 1;
  run();
};

const q = document.getElementById("q");
const qb = document.getElementById("qb");

qb.onclick = (e) => {
  if (q.classList.contains("open") && q.value.trim()) {
    q.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    return;
  }
  const o = q.classList.toggle("open");
  if (o) q.focus();
  else {
    q.value = "";
    if (e.detail) qb.blur();
  }
};

q.onkeydown = (e) => {
  if (e.key === "Escape") {
    q.classList.remove("open");
    q.value = "";
    return;
  }
  if (e.key !== "Enter" || !q.value.trim()) return;
  pend = q.value.trim();
  q.value = "";
  q.classList.remove("open");
  if ((R[location.hash.slice(1)] ? location.hash.slice(1) : "home") === "home") {
    run();
  } else {
    location.hash = "home";
  }
};

document.addEventListener("keydown", (e) => {
  if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    q.classList.add("open");
    q.focus();
    return;
  }
  if (e.key === "/" && !/input|textarea/i.test(document.activeElement.tagName)) {
    e.preventDefault();
    q.classList.add("open");
    q.focus();
  }
});

document.addEventListener("click", (e) => {
  if (q.classList.contains("open") && !q.contains(e.target) && !qb.contains(e.target)) {
    q.classList.remove("open");
    q.value = "";
  }
});

addEventListener("hashchange", go);
addEventListener("storage", count);

/* ==========================================================================
   4. NAVIGATION SLIDER INDICATOR
   ========================================================================== */
const nav = document.querySelector("nav");
const links = document.querySelector(".links");
const ind = links.querySelector(".ind");

function slide() {
  const a = links.querySelector("a.on");
  if (!a) return;
  ind.style.left = a.parentElement.offsetLeft + "px";
  ind.style.width = a.parentElement.offsetWidth + "px";
  links.scrollTo({
    left: a.offsetLeft - links.clientWidth / 2 + a.offsetWidth / 2,
    behavior: "smooth",
  });
}

addEventListener("hashchange", slide);
addEventListener("resize", slide);
(document.fonts ? document.fonts.ready : Promise.resolve()).then(slide);
requestAnimationFrame(slide);

/* ==========================================================================
   5. IFRAME STYLING & RESPONSIVE INJECTIONS
   ========================================================================== */
function clear() {
  try {
    const d = f.contentDocument;
    if (!d || !d.head) return;
    let s = d.getElementById("shellpad");
    if (!s) {
      s = d.createElement("style");
      s.id = "shellpad";
      d.head.appendChild(s);
    }
    const h = nav ? Math.ceil(nav.getBoundingClientRect().height) : 64;
    s.textContent = `:root{--navh:${h}px}.hero,.stage{padding-top:${h + 20}px!important}`;
  } catch (e) {}
}

f.addEventListener("load", clear);
addEventListener("resize", clear);

// Injection Stylesheet: Base UI
const UI = `
:root{--font:"Poppins",system-ui,sans-serif;--display:"Cormorant Garamond",Georgia,serif;--serif:"Cormorant Garamond",Georgia,serif;--fs-title:clamp(2.6rem,5vw,4rem);--fs-h2:2rem;--fs-h3:1.5rem;--fs-body:.95rem;--fs-sm:.82rem;--fs-xs:.78rem}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%;-webkit-tap-highlight-color:transparent}
body{font-family:var(--font);font-size:var(--fs-body);line-height:1.6;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
*{scrollbar-width:thin;scrollbar-color:#24406b transparent}
::selection{background:rgba(0,127,255,.45);color:#fff}
button,input,select,textarea{font-family:var(--font)}
button:focus-visible,a:focus-visible,select:focus-visible{outline:2px solid #33B5FF!important;outline-offset:3px}
h1,h2,h3,.title{text-wrap:balance}
.desc,.synopsis{text-wrap:pretty}
/* headings: one serif, one case, one scale */
h1,.title,.sheet h2,.ban h2{font-family:var(--display);font-weight:600;text-transform:none;letter-spacing:-.01em}
:where(.hero,.stage) .title,.hero h1{font-size:clamp(3rem,7vw,5.5rem);line-height:.95}
.wrap h1{font-size:var(--fs-title);line-height:1}
.sheet h2,.ban h2{font-size:clamp(2.2rem,4.5vw,3rem);line-height:1.05}
.categories h2,.cw h2,.top10 h2,.lh h2{font:600 var(--fs-h2)/1.1 var(--display);letter-spacing:-.01em}
.cat-group h3,.eps h2,.trailers h2{font:600 var(--fs-h3)/1.15 var(--display);letter-spacing:0}
.poster b,.cw-thumb b,.top-poster b,.c b{font:600 1.4rem/1.05 var(--display);letter-spacing:0;text-transform:none}
.card span{font:600 1rem/1.15 var(--display);letter-spacing:0;text-transform:none}
.tag,.eyebrow{font:600 .72rem/1.2 var(--font);letter-spacing:.2em;text-transform:uppercase}
/* body copy + card text */
.desc,.synopsis{font-size:var(--fs-body);line-height:1.7;letter-spacing:0}
.meta,.info{letter-spacing:0}
.stage .meta{font-size:.88rem;font-weight:500}
.cat-name,.name,.nm,.cw-name,.ep b{font:500 var(--fs-body)/1.3 var(--font)}
.sub,.mt,.cw-left,.cat-info,.ep small{font-size:var(--fs-xs);font-weight:400}
.toast{font-size:.88rem}
/* controls: same height, same type */
.btn,.list-btn{font:600 .88rem/1 var(--font);letter-spacing:.02em;min-height:46px;display:inline-flex;align-items:center;justify-content:center}
.chips .chip,.fs .f,.seg button{font:500 var(--fs-sm)/1 var(--font);letter-spacing:0;min-height:38px;padding:0 18px;display:inline-flex;align-items:center}
.search,.sort,select{font-size:.88rem;height:44px}
/* same lift + press feedback on every card */
.cat-card:hover .poster,.cat-card:focus-visible .poster,.open:hover .poster,.open:focus-visible .poster,.card:hover .poster,.card:focus-visible .poster,.c:hover span,.c:focus-visible span{transform:translateY(-6px)}
.cat-card:active,.cw-open:active,.top-item:active,.c:active,.card:active,.open:active,.ep:active,.btn:active,.list-btn:active,.watch:active{transform:scale(.985)}
/* empty-state button */
.browse{margin-top:1.4rem;display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 28px;border:0;border-radius:6px;background:#007FFF;color:#fff;font:600 .88rem/1 var(--font);cursor:pointer;transition:filter .2s,transform .2s}
.browse:hover{filter:brightness(1.15)}.browse:active{transform:scale(.97)}
.empty .browse{pointer-events:auto}
@media(max-width:700px){input,select{font-size:16px!important}}
.stage.is-empty .empty{position:relative;grid-column:1/-1;grid-row:1/-1;min-height:100vh;padding:88px 5vw 96px}
.modal,.md{padding-top:calc(var(--navh,64px) + 8px);padding-bottom:max(16px,3vh)}
.sheet,.panel{max-height:calc(100vh - var(--navh,64px) - 28px)}
@media(max-width:720px){.sheet .poster{aspect-ratio:16/8}}
@media(max-width:900px) and (max-height:520px){.sheet{grid-template-columns:220px 1fr;gap:18px;padding:18px}.sheet .poster{aspect-ratio:16/10}.sheet h2{font-size:1.8rem}.ban{height:110px;padding:1rem 1.4rem}.body{padding:.2rem 1.4rem 1.4rem}}
/* home hero: title, text and buttons share one left edge */
.hero .desc,.hero .meta,.hero .actions{margin-left:0}
@media(max-width:520px){.es-btns .browse{flex:1 1 100%}.es{padding:36px 22px 32px}}
/* responsive safety: nothing may push the page wider than the screen */
html,body{max-width:100%;overflow-x:clip}
img,video,svg{max-width:100%}
.hero{grid-template-columns:minmax(0,1fr)}
.content,.trailers,.info,.eps,.cat-group,.head>*{min-width:0}
.search input{width:100%;min-width:0}
@media(max-width:700px){.head .tools{width:100%}.head .search{min-width:0;flex:1 1 100%}.head .tools select{flex:1 1 100%}}
`;

f.addEventListener("load", () => {
  try {
    const d = f.contentDocument;
    if (!d || !d.head || d.getElementById("uifix")) return;
    const s = d.createElement("style");
    s.id = "uifix";
    s.textContent = UI;
    d.head.appendChild(s);
  } catch (e) {}
});

// Injection Stylesheet: Mobile Layout
const MOB = `html{-webkit-tap-highlight-color:transparent}
.hero{grid-template-rows:auto 1fr auto;padding-left:24px;padding-right:24px;padding-bottom:24px}
.hero::before{background:linear-gradient(180deg,rgba(3,8,14,.1) 0%,rgba(3,8,14,.5) 45%,rgba(3,8,14,.95) 88%)}
.hero::after{height:70px}
.content{align-self:end;gap:.85rem}
.title{font-size:clamp(2.6rem,13vw,3.6rem)}
.desc{font-size:.9rem;line-height:1.55;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.meta{font-size:.8rem}
.actions{width:100%;flex-wrap:nowrap;gap:.7rem}
.watch{flex:1;justify-content:center;gap:.5rem;min-height:48px;padding:0 14px;border-radius:10px;background:var(--red);font-size:.92rem;box-shadow:0 8px 22px rgba(0,127,255,.35)}
.watch br{display:none}
.watch .play{width:22px;height:22px;background:none;box-shadow:none}
.watch .play svg{width:20px;height:20px}
.list-btn{flex:1;min-height:48px;border-radius:10px;font-size:.9rem}
.trailers{margin-top:16px}
.trailers h2{font-size:1.15rem}
.thumbs{overflow-x:auto;gap:.75rem;margin:0 -24px .7rem;padding:12px 24px 10px;scroll-snap-type:x mandatory;scrollbar-width:none}
.thumbs::-webkit-scrollbar,.cat-row::-webkit-scrollbar,.top-row::-webkit-scrollbar{display:none}
.thumb{flex:0 0 min(32vw,140px);width:min(32vw,140px);scroll-snap-align:start}
.cw,.top10,.categories,.more-movies{padding-left:24px;padding-right:24px}
.top10{padding-top:32px}
.categories{padding-top:36px}
.categories h2,.cw h2,.top10 h2{font-size:1.5rem}
.cat-group h3{font-size:1.1rem}
.cat-row,.top-row{gap:1rem;padding-left:4px;padding-right:4px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.top-row{gap:1rem}
.top-num{font-size:7.8rem}
.top-poster{width:250px}
.more-movies .cat-card{flex-basis:200px;width:200px}
.more-movies{padding-bottom:40px}
.pv-bar{padding-bottom:calc(16px + env(safe-area-inset-bottom,0px))}
#pvTime{min-width:0}
.toast{bottom:16px}`;

f.addEventListener("load", () => {
  try {
    const d = f.contentDocument;
    if (!d || !d.head || d.getElementById("mobfix")) return;
    const s = d.createElement("style");
    s.id = "mobfix";
    s.textContent = MOB;
    d.head.appendChild(s);
  } catch (e) {}
});

f.addEventListener("load", () => {
  nav.classList.remove("scrolled");
  try {
    const w = f.contentWindow;
    w.addEventListener(
      "scroll",
      () => {
        nav.classList.toggle("scrolled", (w.scrollY || w.pageYOffset || 0) > 20);
      },
      { passive: true }
    );
  } catch (e) {}
});


/* ==========================================================================
   6. USER PROFILE & AVATAR DROPDOWN CONTROLLER
   ========================================================================== */
const avatarBtn = document.getElementById("avatarBtn");
const avatarDropdown = document.getElementById("avatarDropdown");
const logoutBtn = document.getElementById("logoutBtn");
const dropMyList = document.getElementById("dropMyList");

if (avatarBtn && avatarDropdown) {
  function toggleDropdown(force) {
    const isClosed = !avatarDropdown.classList.contains("open");
    const shouldOpen = typeof force === "boolean" ? force : isClosed;
    avatarDropdown.classList.toggle("open", shouldOpen);
    if (shouldOpen) {
      avatarDropdown.removeAttribute("hidden");
    } else {
      avatarDropdown.setAttribute("hidden", "");
    }
    avatarBtn.setAttribute("aria-expanded", String(shouldOpen));
  }

  // Support keyboard Enter & Space on div.avatar
  avatarBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleDropdown();
    }
  });

  avatarBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  document.addEventListener("click", (e) => {
    if (avatarDropdown.classList.contains("open") && !avatarDropdown.contains(e.target) && !avatarBtn.contains(e.target)) {
      toggleDropdown(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && avatarDropdown.classList.contains("open")) {
      toggleDropdown(false);
      avatarBtn.focus();
    }
  });

  if (dropMyList) {
    dropMyList.addEventListener("click", () => {
      toggleDropdown(false);
    });
  }

  const dropSettings = document.getElementById("dropSettings");
  if (dropSettings) {
    dropSettings.addEventListener("click", (e) => {
      e.preventDefault();
      toggleDropdown(false);
      if (typeof window.NFPlay === "function") {
        // Provide user feedback
        const toast = document.getElementById("toast");
        if (toast) {
          toast.textContent = "Audio & Stream Quality set to Auto 4K HDR";
          toast.classList.add("show");
          setTimeout(() => toast.classList.remove("show"), 2500);
        }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // Clear session auth if stored
      try {
        sessionStorage.clear();
        localStorage.removeItem("auth_token");
        localStorage.removeItem("currentUser");
      } catch (e) {}

      // Redirect to login page
      window.location.href = "../login/index.html";
    });
  }
}

// Start initial route
go();
