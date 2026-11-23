/* =========================================================
   CONTINUUM ACADEMY / MOVIE HERO SCRIPT (home.js)
   ========================================================= */

/* ---------------------------------------------------------
   1) DATA — add or edit movies here.
   --------------------------------------------------------- */
const movies = [
  {
    title: "M U L A N",
    desc: "Acclaimed filmmaker Niki Caro brings the epic tale of China's legendary warrior to life in Disney's \"Mulan,\" in which a fearless young woman risks everything out of love for her family and her country to become one of the greatest warriors China has ever known.",
    meta: "2020 · Action/Fantasy · 2 hours",
    bg: "url('../assets/images/hero-warrior.jpg')",
    trailers: [
      { name: "Official Trailer", img: "../assets/images/trailer-1.jpg", color: "linear-gradient(135deg,#d9482b,#f0a24a)", video: "" },
      { name: "Teaser",           img: "../assets/images/trailer-2.jpg", color: "linear-gradient(135deg,#7ba7d6,#c8d8ea)", video: "" },
      { name: "Behind the Scenes",img: "../assets/images/trailer-3.jpg", color: "linear-gradient(135deg,#e8eef5,#b53a3a)", video: "" }
    ]
  },
  {
    title: "NIGHTFALL",
    desc: "A lighthouse keeper discovers that the storm rolling in each night is trying to tell her something, and the answer lies beneath the waves.",
    meta: "2023 · Mystery/Thriller · 1h 55m",
    bg: "radial-gradient(circle at 70% 25%, rgba(80,140,200,.5), transparent 45%), linear-gradient(120deg,#16283d,#0f1a2b 50%,#070b12)",
    trailers: [
      { name: "Official Trailer", color: "linear-gradient(135deg,#1d4e89,#79b4e6)", video: "" },
      { name: "Teaser",           color: "linear-gradient(135deg,#0b1d33,#3f7cac)", video: "" },
      { name: "Clip",             color: "linear-gradient(135deg,#38598b,#a7c4e8)", video: "" }
    ]
  },
  {
    title: "EMBER",
    desc: "Two rival chefs are forced to share one kitchen for a single week, and discover that the hardest thing to cook is trust.",
    meta: "2022 · Comedy/Drama · 1h 40m",
    bg: "radial-gradient(circle at 30% 70%, rgba(240,170,60,.5), transparent 45%), linear-gradient(120deg,#5a2b12,#331a10 50%,#150a07)",
    trailers: [
      { name: "Official Trailer", color: "linear-gradient(135deg,#c2541a,#f5b942)", video: "" },
      { name: "Teaser",           color: "linear-gradient(135deg,#8a3b12,#e8a04c)", video: "" },
      { name: "Clip",             color: "linear-gradient(135deg,#f2cf8b,#b6451c)", video: "" }
    ]
  }
];

/* ---------------------------------------------------------
   2) DOM ELEMENT SELECTORS
   --------------------------------------------------------- */
const $ = id => document.getElementById(id);
const hero = $("hero"), content = $("content");
const titleEl = $("title"), descEl = $("desc"), metaEl = $("meta");
const thumbsEl = $("thumbs"), dotsEl = $("dots");
const modal = $("modal"), player = $("player"), modalTitle = $("modalTitle");
const searchInput = $("searchInput"), toast = $("toast");

let current = 0;

/* ---------------------------------------------------------
   3) RENDER CURRENT MOVIE
   --------------------------------------------------------- */
function render(index) {
  const m = movies[index];
  current = index;

  hero.style.backgroundImage = m.bg.startsWith("url") ? m.bg : "none";
  if (!m.bg.startsWith("url")) {
    hero.style.background = m.bg;
  }
  
  titleEl.textContent = m.title;
  descEl.textContent  = m.desc;
  metaEl.textContent  = m.meta;
  document.title = m.title + " – Continuum";
  updateListBtn();

  // Trailer Thumbnails
  thumbsEl.innerHTML = "";
  m.trailers.forEach((t) => {
    const b = document.createElement("button");
    b.className = "thumb";
    if (t.img) {
      b.style.backgroundImage = `url("${t.img}")`;
    } else {
      b.style.background = t.color;
    }
    b.setAttribute("aria-label", "Play " + t.name);
    b.addEventListener("click", () => openTrailer(m.title, t));
    thumbsEl.appendChild(b);
  });

  // Movie Switcher Dots
  dotsEl.innerHTML = "";
  movies.forEach((mv, i) => {
    const d = document.createElement("button");
    d.className = "dot" + (i === index ? " active" : "");
    d.setAttribute("aria-label", "Show " + mv.title);
    d.addEventListener("click", () => switchMovie(i));
    dotsEl.appendChild(d);
  });
}

/* Smooth transition when switching movie */
function switchMovie(index) {
  if (index === current) return;
  content.classList.add("swap");
  setTimeout(() => {
    render(index);
    content.classList.remove("swap");
  }, 350);
}

/* ---------------------------------------------------------
   4) TRAILER MODAL POPUP
   --------------------------------------------------------- */
function openTrailer(movieTitle, trailer) {
  modalTitle.textContent = movieTitle + " – " + trailer.name;
  if (trailer.video) {
    player.innerHTML = '<video controls autoplay src="' + trailer.video + '"></video>';
  } else {
    player.textContent = "Add a video file in the movies array (video: \"trailer.mp4\") to play it here.";
  }
  modal.classList.add("open");
  $("closeBtn").focus();
}

function closeTrailer() {
  modal.classList.remove("open");
  player.innerHTML = "";
}

$("closeBtn").addEventListener("click", closeTrailer);
modal.addEventListener("click", e => { if (e.target === modal) closeTrailer(); });

/* ---------------------------------------------------------
   5) WATCH BUTTON & TOAST NOTIFICATION
   --------------------------------------------------------- */
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

$("watchBtn").addEventListener("click", () => {
  showToast("Starting \"" + movies[current].title + "\"...");
});

/* ---------------------------------------------------------
   6) SEARCH BAR
   --------------------------------------------------------- */
$("searchBtn").addEventListener("click", () => {
  const open = searchInput.classList.toggle("open");
  if (open) searchInput.focus(); else searchInput.value = "";
});

searchInput.addEventListener("keydown", e => {
  if (e.key !== "Enter") return;
  const q = searchInput.value.trim().toLowerCase();
  if (!q) return;
  const found = movies.findIndex(m => m.title.toLowerCase().includes(q));
  if (found >= 0) {
    switchMovie(found);
    searchInput.value = "";
    searchInput.classList.remove("open");
  } else {
    showToast("No title found for \"" + searchInput.value + "\"");
  }
});

/* ---------------------------------------------------------
   7) NAVIGATION LINKS
   --------------------------------------------------------- */
document.querySelectorAll("#navLinks a").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    document.querySelectorAll("#navLinks a").forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    const target = link.dataset.target;
    if (target === "mylist") showToast(list.length ? "My list: " + list.join(", ") : "Your list is empty");
    else window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

/* ---------------------------------------------------------
   8) KEYBOARD NAVIGATION (Esc, Arrow keys)
   --------------------------------------------------------- */
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeTrailer();
  if (document.activeElement === searchInput || modal.classList.contains("open")) return;
  if (e.key === "ArrowRight") switchMovie((current + 1) % movies.length);
  if (e.key === "ArrowLeft")  switchMovie((current - 1 + movies.length) % movies.length);
});

/* ---------------------------------------------------------
   9) CATEGORIES SECTION (Revealed on Scroll)
   --------------------------------------------------------- */
const categories = [
  { name: "Feature Film",         poster: "linear-gradient(160deg,#3a4350,#0f1318)" },
  { name: "Feature Documentary",  poster: "linear-gradient(160deg,#c0392b,#1d2b53)" },
  { name: "Short Film",           poster: "linear-gradient(160deg,#6f8a8c,#d99a5b)" },
  { name: "Documentary Short",    poster: "linear-gradient(160deg,#8aa0a8,#2a3b45)" },
  { name: "Animated Feature",     poster: "linear-gradient(160deg,#e63946,#1d3557)" },
  { name: "Animated Short",       poster: "linear-gradient(160deg,#9c6b4a,#2b1d16)" },
  { name: "Student Film",         poster: "linear-gradient(160deg,#4ea1d3,#f1e3c6)" },
  { name: "LGBT Feature",         poster: "linear-gradient(160deg,#b5262f,#101820)" }
];

const catRow = $("catRow"), catInfo = $("catInfo"), catSection = $("categories");

if (catRow) {
  categories.forEach((c, i) => {
    const card = document.createElement("button");
    card.className = "cat-card";
    card.style.setProperty("--i", i);
    card.innerHTML = '<span class="poster"></span><span class="cat-name"></span>';
    card.querySelector(".poster").style.background = c.poster;
    card.querySelector(".cat-name").textContent = c.name;
    card.addEventListener("click", () => {
      catRow.querySelectorAll(".cat-card").forEach(el => el.classList.remove("selected"));
      card.classList.add("selected");
      catInfo.textContent = "Selected: " + c.name;
    });
    catRow.appendChild(card);
  });

  new IntersectionObserver((entries, obs) => {
    if (entries[0].isIntersecting) {
      catSection.classList.add("visible");
      obs.disconnect();
    }
  }, { threshold: 0.25 }).observe(catSection);
}

/* ---------------------------------------------------------
   10) MY LIST (Persistent with localStorage)
   --------------------------------------------------------- */
const KEY = "myList";
let list = [];
try { list = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { list = []; }
const saveList = () => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} };

const listBtn = $("listBtn");

function updateNavCount() {
  const n = $("navCount");
  if (!n) return;
  n.textContent = list.length;
  n.hidden = list.length === 0;
}

function updateListBtn() {
  updateNavCount();
  if (!listBtn) return;
  const saved = list.includes(movies[current].title);
  listBtn.textContent = saved ? "\u2713 In My List" : "+ My List";
  listBtn.classList.toggle("in-list", saved);
  listBtn.setAttribute("aria-pressed", saved);
}

function toggleList(title) {
  const i = list.indexOf(title);
  if (i >= 0) { list.splice(i, 1); showToast("Removed from My List"); }
  else        { list.push(title);  showToast("Added to My List"); }
  saveList();
  updateListBtn();
}

if (listBtn) {
  listBtn.addEventListener("click", () => toggleList(movies[current].title));
}

/* Initial render */
render(0);
