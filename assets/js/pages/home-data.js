/**
 * Continuum - Sub-Page HTML Templates (P)
 * Organized and structured for clear readability and maintenance.
 * Each key represents an iframe sub-page: home, movies, series, cartoons, mylist.
 */

const P = {
  /* ==========================================================================
     1. HOME PAGE TEMPLATE
     ========================================================================== */
  home: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Movie Hero Page (JS)</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Poppins:wght@400;500;600;800" rel="stylesheet">
<style>
  :root{--primary-azure:#007FFF;--primary-hover:#1EA0FF;--primary-vivid:#33B5FF;--bg-deep-dark:#03080E;--bg-card-dark:#071225;--text-primary:#FFFFFF; --red:#007FFF; --text:#fff; --font:"Poppins",system-ui,sans-serif; }
  * { box-sizing:border-box; margin:0; padding:0; }
  html,body { height:100%; }
  body { font-family:var(--font); color:var(--text); background:#03080E; overflow-x:hidden; }

  /* HERO */
  .hero {
    position:relative; min-height:100vh; padding:32px 6.5vw;
    display:grid; grid-template-rows:auto 1fr auto;
    background:var(--bg);
    transition:background .6s ease;
  }
  .hero::before {
    content:""; position:absolute; inset:0; pointer-events:none;
    background:linear-gradient(90deg,transparent 35%,rgba(3,8,14,.85) 100%);
  }
  .hero > * { position:relative; z-index:1; }
  .hero::after {                       /* soft fade so the hero blends into the next section (no visible line) */
    content:""; position:absolute; left:0; right:0; bottom:0; height:200px; pointer-events:none;
    background:linear-gradient(180deg,rgba(3,8,14,0),#03080E);
  }

  /* NAV */
  .nav { display:flex; align-items:center; justify-content:space-between; }
  .logo { font-weight:800; font-size:1.9rem; letter-spacing:.04em; color:var(--red); }
  .nav ul { display:flex; gap:2.5rem; list-style:none; }
  .nav a { color:var(--text); text-decoration:none; font-weight:500; font-size:.95rem; padding-bottom:4px; border-bottom:2px solid transparent; }
  .nav a:hover, .nav a:focus-visible { color:var(--red); outline:none; }
  .nav a.active { border-bottom-color:var(--red); }
  .icons { display:flex; align-items:center; gap:1rem; }
  .search-wrap { display:flex; align-items:center; gap:.5rem; }
  #searchInput {
    width:0; opacity:0; padding:0; border:0; border-bottom:2px solid var(--red);
    background:transparent; color:var(--text); font:500 .9rem var(--font);
    transition:width .3s ease, opacity .3s ease, padding .3s ease; outline:none;
  }
  #searchInput.open { width:170px; opacity:1; padding:6px 4px; }
  .search-btn { background:none; border:0; color:var(--text); cursor:pointer; display:grid; place-items:center; }
  .avatar { width:38px; height:38px; border-radius:50%; border:2px solid rgba(255,255,255,.7); background:linear-gradient(135deg,#f2c9a5,#b5654a); }

  /* CONTENT */
  .content {
    justify-self:end; align-self:center; width:min(46vw,640px);
    display:flex; flex-direction:column; gap:1.6rem;
    transition:opacity .35s ease, transform .35s ease;
  }
  .content.swap { opacity:0; transform:translateY(12px); }
  .title { font-weight:800; font-size:clamp(3rem,9vw,7.5rem); letter-spacing:.18em; line-height:1; margin-right:-.18em; }
  .desc { font-size:.95rem; line-height:1.7; max-width:60ch; margin-left:12%; }
  .meta { margin-left:12%; font-size:.95rem; font-weight:500; }
  .actions { margin-left:12%; display:flex; align-items:center; gap:2rem; flex-wrap:wrap; }
  .watch {
    margin-left:0; display:inline-flex; align-items:center; gap:1rem; width:fit-content;
    background:none; border:0; color:var(--text); font:600 .85rem/1.4 var(--font); text-align:left; cursor:pointer;
  }
  .play { width:60px; height:60px; border-radius:50%; background:var(--red); display:grid; place-items:center; box-shadow:0 8px 24px rgba(0,127,255,.45); transition:transform .2s ease; }
  .watch:hover .play, .watch:focus-visible .play { transform:scale(1.1); }
  .watch:focus-visible { outline:2px solid var(--text); outline-offset:6px; border-radius:32px; }

  /* TRAILERS */
  .trailers { align-self:end; overflow:visible; padding:0 4px; }
  .thumbs { display:flex; gap:1.1rem; margin-bottom:1rem; padding:12px 6px 10px; overflow:visible; }
  .thumb {
    width:clamp(80px,8vw,130px); aspect-ratio:16/10; border-radius:10px; border:2px solid transparent;
    cursor:pointer; box-shadow:0 6px 18px rgba(0,0,0,.5); transition:transform .25s ease, border-color .25s ease, box-shadow .25s ease;
    will-change:transform;
  }
  .thumb:hover, .thumb:focus-visible { transform:translateY(-6px); border-color:#fff; box-shadow:0 12px 24px rgba(0,0,0,.7); outline:none; }
  .trailers h2 { font-size:1.15rem; font-weight:500; }

  /* MODAL */
  .modal { position:fixed; inset:0; z-index:10; display:none; place-items:center; background:rgba(0,0,0,.85); padding:5vw; }
  .modal.open { display:grid; }
  .modal-box { width:min(900px,100%); }
  .modal-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:.8rem; }
  .modal-head h3 { font-weight:600; font-size:1.1rem; }
  .close { background:none; border:0; color:#fff; font-size:2rem; line-height:1; cursor:pointer; }
  .player {
    aspect-ratio:16/9; border-radius:10px; overflow:hidden; background:#000;
    display:grid; place-items:center; text-align:center; font-size:.95rem; color:#ccc;
  }
  .player video { width:100%; height:100%; }

  /* TOAST */
  .toast { position:fixed; bottom:24px; left:50%; transform:translate(-50%,40px); background:#222; padding:12px 22px; border-radius:999px; font-size:.9rem; opacity:0; transition:all .3s ease; z-index:20; }
  .toast.show { opacity:1; transform:translate(-50%,0); }


  /* CATEGORIES (appears when you scroll) */
  .categories { padding:56px 6.5vw 72px; background:linear-gradient(180deg,#03080E,#071225 40%); min-height:60vh; }
  .categories h2 { font-size:1.6rem; font-weight:600; margin-bottom:1.6rem; }
  .cat-row {
    display:flex; align-items:flex-start; gap:1.6rem; overflow-x:auto; padding:8px 8px 18px;
    scroll-snap-type:x proximity; scrollbar-width:thin; scrollbar-color:#444 transparent;
  }
  .cat-card {
    display:flex; flex-direction:column; align-items:stretch;
    flex:0 0 clamp(130px,13vw,180px); width:clamp(130px,13vw,180px); background:none; border:0; color:var(--text);
    text-align:left; cursor:pointer; scroll-snap-align:start; font-family:var(--font);
    opacity:0; transform:translateY(28px);
    transition:opacity .5s ease, transform .5s ease;
  }
  .categories.visible .cat-card { opacity:1; transform:none; transition-delay:calc(var(--i) * 70ms); }
  .poster {
    display:block; width:100%; aspect-ratio:2/3; flex:none; border-radius:8px; border:2px solid transparent;
    box-shadow:0 8px 22px rgba(0,0,0,.5); transition:transform .2s ease, border-color .2s ease;
    /* replace gradient with: background:url("poster1.jpg") center/cover */
  }
  .cat-card:hover .poster, .cat-card:focus-visible .poster { transform:translateY(-6px); }
  .cat-card.selected .poster { border-color:#3b82f6; }
  .cat-card:focus-visible { outline:none; }
  .cat-card:focus-visible .poster { border-color:#fff; }
  .cat-name {
    display:block; margin-top:.8rem; font-size:1rem; font-weight:500; line-height:1.35;
    min-height:2.7em;          /* always reserves 2 lines, so every card is the same height */
    text-wrap:balance;
  }
  .cat-info { margin-top:1.2rem; font-size:.95rem; color:#bbb; min-height:1.4em; }


  /* + MY LIST button */
  .list-btn {
    background:#6b6b6b; color:#fff; border:2px solid transparent; border-radius:6px;
    padding:12px 22px; font:600 .85rem var(--font); cursor:pointer;
    transition:background .2s ease, border-color .2s ease;
  }
  .list-btn:hover, .list-btn:focus-visible { background:#808080; outline:none; }
  .list-btn.in-list { background:transparent; border-color:var(--red); }

  .badge {
    display:inline-grid; place-items:center; min-width:18px; height:18px; margin-left:6px; padding:0 5px;
    border-radius:9px; background:var(--red); color:#fff; font-size:.7rem; font-weight:600; vertical-align:middle;
  }
  .badge[hidden] { display:none; }


  /* CONTINUE WATCHING */
  .cw { padding:56px 6.5vw 20px; background:#03080E; }
  .cw[hidden] { display:none; }
  .cw h2 { font-size:1.6rem; font-weight:600; margin-bottom:1.6rem; }
  .cw-row { display:flex; gap:1.6rem; overflow-x:auto; padding:6px 4px 16px; scrollbar-width:thin; scrollbar-color:#444 transparent; }
  .cw-card { position:relative; flex:0 0 clamp(230px,22vw,300px); width:clamp(230px,22vw,300px); }
  .cw-open { display:block; width:100%; background:none; border:0; color:#fff; text-align:left; cursor:pointer; font-family:var(--font); }
  .cw-thumb {
    display:block; position:relative; aspect-ratio:16/10; border-radius:12px; overflow:hidden; border:2px solid transparent;
    box-shadow:0 8px 22px rgba(0,0,0,.5); transition:transform .2s ease, border-color .2s ease;
  }
  .cw-thumb b { position:absolute; left:12px; bottom:18px; font-weight:800; letter-spacing:.14em; font-size:1.05rem; text-shadow:0 2px 8px rgba(0,0,0,.8); }
  .cw-play {
    position:absolute; top:50%; left:50%; width:46px; height:46px; margin:-23px 0 0 -23px; border-radius:50%;
    background:rgba(0,127,255,.9); display:grid; place-items:center; font-size:.9rem; opacity:0; transition:opacity .2s;
  }
  .cw-prog { position:absolute; left:0; right:0; bottom:0; height:5px; background:rgba(255,255,255,.3); }
  .cw-prog i { display:block; height:100%; background:var(--red); }
  .cw-open:hover .cw-thumb, .cw-open:focus-visible .cw-thumb { transform:translateY(-5px); border-color:#fff; }
  .cw-open:hover .cw-play, .cw-open:focus-visible .cw-play { opacity:1; }
  .cw-open:focus-visible { outline:none; }
  .cw-name { display:block; margin-top:.7rem; font-size:.95rem; font-weight:500; }
  .cw-left { display:block; margin-top:.15rem; font-size:.78rem; color:#8DA2BD; }
  .cw-x {
    position:absolute; top:8px; right:8px; width:28px; height:28px; border-radius:50%; border:0; background:rgba(0,0,0,.7);
    color:#fff; font-size:1.1rem; line-height:1; cursor:pointer; opacity:0; transition:opacity .2s, background .2s;
  }
  .cw-card:hover .cw-x, .cw-card:focus-within .cw-x { opacity:1; }
  .cw-x:hover, .cw-x:focus-visible { background:var(--red); outline:none; }

  /* PLAYER */
  .pv { position:fixed; inset:0; z-index:30; background:#000; display:none; }
  .pv.open { display:block; }
  .pv-screen { position:absolute; inset:0; display:grid; place-items:center; text-align:center; }
  .pv-screen video { width:100%; height:100%; object-fit:contain; background:#000; }
  .pv-demo b { display:block; font-weight:800; letter-spacing:.2em; font-size:clamp(2rem,7vw,5rem); text-shadow:0 4px 20px rgba(0,0,0,.6); }
  .pv-demo small { display:block; margin-top:1rem; color:#ddd; font-size:.85rem; padding:0 6vw; }
  .pv-top, .pv-bar { position:absolute; left:0; right:0; display:flex; align-items:center; gap:1rem; padding:18px 4vw; z-index:2; }
  .pv-top { top:0; justify-content:space-between; background:linear-gradient(180deg,rgba(0,0,0,.75),transparent); font-weight:600; letter-spacing:.1em; }
  .pv-bar { bottom:0; background:linear-gradient(0deg,rgba(0,0,0,.85),transparent); padding-top:50px; }
  .pv-close { background:none; border:0; color:#fff; font-size:2.2rem; line-height:1; cursor:pointer; }
  .pv-btn { width:44px; height:44px; flex:none; border-radius:50%; border:0; background:var(--red); color:#fff; cursor:pointer; font-size:.85rem; }
  #pvSeek { flex:1; accent-color:var(--red); height:6px; cursor:pointer; }
  #pvTime { font-size:.8rem; font-weight:500; white-space:nowrap; min-width:110px; text-align:right; }
  .pv-btn:focus-visible, .pv-close:focus-visible { outline:2px solid #fff; outline-offset:3px; }


  /* TOP 10 */
  .top10 { padding:64px 6.5vw 16px; background:#03080E; }
  .top10 h2 { font-size:1.6rem; font-weight:600; margin-bottom:1rem; }
  .top-row { display:flex; gap:2rem; overflow-x:auto; padding:14px 24px 20px 14px; -webkit-mask-image:linear-gradient(90deg,#000 94%,transparent); mask-image:linear-gradient(90deg,#000 94%,transparent); scrollbar-width:thin; scrollbar-color:#444 transparent; }
  .top-item {
    position:relative; flex:none; display:flex; align-items:flex-end; background:none; border:0; color:#fff;
    cursor:pointer; font-family:var(--font); text-align:left;
  }
  .top-num {
    font-family:"Poppins",sans-serif; font-weight:800; font-size:clamp(11.5rem,18vw,17rem); line-height:.8;
    letter-spacing:-.04em; color:#071225; -webkit-text-stroke:3px #9a9aa4; margin-right:-.06em; padding-bottom:2px; padding-left:.04em;
    position:relative; z-index:1; transition:-webkit-text-stroke-color .2s;
  }
  .top-poster {
    position:relative; z-index:2; display:block; width:clamp(360px,32vw,500px); aspect-ratio:16/10; border-radius:12px;
    border:2px solid transparent; box-shadow:0 8px 22px rgba(0,0,0,.55); overflow:hidden; transition:transform .2s ease, border-color .2s ease;
  }
  .top-poster b { position:absolute; left:14px; right:14px; bottom:16px; text-align:left; font-size:1.15rem; font-weight:800; letter-spacing:.12em; text-shadow:0 2px 8px rgba(0,0,0,.8); }
  .top-poster small { position:absolute; top:8px; left:8px; background:rgba(0,0,0,.7); border-radius:5px; padding:2px 7px; font-size:.68rem; font-weight:600; color:#33B5FF; }
  .top-item:hover .top-poster, .top-item:focus-visible .top-poster { transform:translateY(-6px); border-color:#fff; }
  .top-item:hover .top-num, .top-item:focus-visible .top-num { -webkit-text-stroke-color:var(--red); }
  .top-item:focus-visible { outline:none; }


  /* MORE MOVIES (same card design as Categories, random order) */
  .more-movies { background:#071225; min-height:0; padding:24px 6.5vw 90px; }
  .mm-head { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:1.6rem; }
  .more-movies h2 { margin:0; }
  .more-movies .cat-card { flex-basis:clamp(230px,22vw,300px); width:clamp(230px,22vw,300px); }
  .more-movies .poster { aspect-ratio:16/10; border-radius:12px; }
  .more-movies .cat-name { min-height:0; }
  .shuffle {
    background:#10223F; color:#fff; border:1px solid #3a3a42; border-radius:999px; padding:8px 18px;
    font:500 .85rem var(--font); cursor:pointer; transition:background .2s, border-color .2s;
  }
  .shuffle:hover, .shuffle:focus-visible { background:var(--red); border-color:var(--red); outline:none; }


  /* CATEGORY GROUPS: title + its own row of 5 movies */
  .cat-group + .cat-group { margin-top:2.4rem; }
  .cat-group h3 { font-size:1.2rem; font-weight:600; margin:0 0 1rem; }
  .cat-group.visible .cat-card { opacity:1; transform:none; transition-delay:calc(var(--i) * 70ms); }

  /* PREMIUM LAYER: serif display type, gold hairlines, quieter surfaces */
  :root{--primary-azure:#007FFF;--primary-hover:#1EA0FF;--primary-vivid:#33B5FF;--bg-deep-dark:#03080E;--bg-card-dark:#071225;--text-primary:#FFFFFF; --gold:#33B5FF; --serif:"Cormorant Garamond",Georgia,serif; --line:rgba(255,255,255,.12); }
  .nav a { color:#cfc4c0; }
  .nav a:hover, .nav a:focus-visible { color:#fff; }
  .nav a.active { color:#fff; border-bottom:1px solid var(--gold); }
  #searchInput { border:0; border-radius:999px; }
  #searchInput.open { width:200px; padding:8px 16px; border:1px solid var(--line); background:#071225; }
  #searchInput:focus { border-color:var(--gold); }
  .avatar { border:1px solid var(--line); }
  .content { width:min(52vw,720px); }
  .title { font-family:var(--serif); font-weight:600; font-size:clamp(3.2rem,8vw,6rem); letter-spacing:-.01em; line-height:.92; margin-right:0; text-wrap:balance; }
  .desc { color:#DCE9F7; }
  .meta { color:#8DA2BD; font-size:.88rem; }
  .play { box-shadow:0 10px 30px rgba(0,127,255,.35); }
  .list-btn { background:rgba(255,255,255,.08); border:1px solid var(--line); border-radius:4px; backdrop-filter:blur(8px); }
  .list-btn:hover, .list-btn:focus-visible { background:rgba(255,255,255,.16); border-color:rgba(255,255,255,.4); }
  .list-btn.in-list { background:transparent; border-color:var(--gold); color:var(--gold); }
  .thumb { border-radius:10px; border:1px solid var(--line); }
  .thumb:hover, .thumb:focus-visible { border-color:var(--gold); }
  .trailers h2 { font:600 1.5rem var(--serif); }
  .categories h2, .cw h2, .top10 h2 { font:600 2.5rem/1 var(--serif); letter-spacing:-.01em; margin-bottom:1.4rem; }
  .cat-group h3 { font:600 1.5rem var(--serif); }
  .poster { border-radius:10px; border:1px solid var(--line); box-shadow:0 14px 34px rgba(0,0,0,.55); }
  .cat-card:hover .poster, .cat-card:focus-visible .poster, .cat-card:focus-visible .poster { border-color:var(--gold); }
  .cat-name { font-size:.92rem; color:#DCE9F7; }
  .cw-thumb, .top-poster { border-radius:10px; border:1px solid var(--line); }
  .cw-open:hover .cw-thumb, .cw-open:focus-visible .cw-thumb, .top-item:hover .top-poster, .top-item:focus-visible .top-poster { border-color:var(--gold); }
  .cw-thumb b, .top-poster b { font-family:var(--serif); font-weight:600; font-size:1.5rem; letter-spacing:0; }
  .top-num { font-family:var(--serif); font-weight:600; color:#03080E; -webkit-text-stroke:1.5px #7a6f6d; letter-spacing:0; }
  .top-item:hover .top-num, .top-item:focus-visible .top-num { -webkit-text-stroke-color:var(--gold); }
  .top-poster small { color:var(--gold); backdrop-filter:blur(6px); }
  .shuffle { border-radius:999px; }
  .pv-top, .pv-demo b { font-family:var(--serif); letter-spacing:.02em; }
  .pv-top { font-size:1.4rem; }
  .toast { background:#071225; border:1px solid var(--line); }

  @media (max-width:800px) {
    .nav ul { display:none; }
    .content { width:100%; justify-self:start; }
    .desc,.meta,.actions { margin-left:0; }
    .hero::before { background:linear-gradient(180deg,transparent 10%,rgba(3,8,14,.9) 70%); }
  }
  @media (prefers-reduced-motion:reduce) { * { transition:none !important; } }
</style>
<style>.nav{visibility:hidden!important;height:0!important;min-height:0!important;padding:0!important;margin:0!important;overflow:hidden}</style></head>
<body>

<header class="hero" id="hero">
  <nav class="nav">
    <div class="logo">YOURLOGO</div>
    <ul id="navLinks">
      <li><a href="#" class="active">Home</a></li>
      <li><a href="#">Movies</a></li>
      <li><a href="#">Series</a></li>
      <li><a href="#">Library</a></li>
      <li><a href="#mylist" data-target="mylist">My list<span class="badge" id="navCount" hidden></span></a></li>
    </ul>
    <div class="icons">
      <div class="search-wrap">
        <input id="searchInput" type="text" placeholder="Search a title..." aria-label="Search titles">
        <button class="search-btn" id="searchBtn" aria-label="Search">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
        </button>
      </div>
      <div class="avatar" role="img" aria-label="Your profile"></div>
    </div>
  </nav>

  <section class="content" id="content">
    <h1 class="title" id="title"></h1>
    <p class="desc" id="desc"></p>
    <p class="meta" id="meta"></p>
    <div class="actions">
    <button class="watch" id="watchBtn">
      <span class="play"><svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M7 4.5v15l13-7.5z"/></svg></span>
      <span id="watchLabel">Watch <br>the Movie</span>
    </button>
    <button class="list-btn" id="listBtn" aria-pressed="false">+ My List</button>
    </div>
  </section>

  <section class="trailers">
    <div class="thumbs" id="thumbs"></div>
    <h2>Trailers</h2>
  </section>
</header>

<!-- Continue Watching (hidden until you leave a movie unfinished) -->
<section class="cw" id="cw" hidden>
  <h2>Continue Watching</h2>
  <div class="cw-row" id="cwRow"></div>
</section>

<!-- Top 10 -->
<section class="top10" id="top10">
  <h2>Top 10 Movies</h2>
  <div class="top-row" id="topRow"></div>
</section>

<!-- Categories -->
<section class="categories" id="categories">
  <h2>Categories</h2>
  <div id="catGroups"></div>
</section>

<!-- More movies: same design as Categories, random order -->
<section class="categories more-movies" id="moreMovies">
  <div class="mm-head">
    <h2>More Masterclasses</h2>
  </div>
  <div class="cat-row" id="moreRow"></div>
</section>

<!-- Trailer modal -->
<div class="modal" id="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
  <div class="modal-box">
    <div class="modal-head">
      <h3 id="modalTitle"></h3>
      <button class="close" id="closeBtn" aria-label="Close">&times;</button>
    </div>
    <div class="player" id="player"></div>
  </div>
</div>

<div class="pv" id="pv" role="dialog" aria-modal="true" aria-label="Video player">
  <div class="pv-screen" id="pvScreen"></div>
  <div class="pv-top"><span id="pvTitle"></span><button class="pv-close" id="pvClose" aria-label="Close player">&times;</button></div>
  <div class="pv-bar">
    <button class="pv-btn" id="pvToggle" aria-label="Play or pause"></button>
    <input type="range" id="pvSeek" min="0" max="100" value="0" step="1" aria-label="Seek">
    <span id="pvTime"></span>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
/* Shared catalogue payload injected by the parent page (window.__CONTINUUM_CATALOGUE__).
   When empty, every section falls back to the built-in demo data below. */
const __CAT = (function(){ try { return parent.__CONTINUUM_CATALOGUE__ || null; } catch(e){ return null; } })();
const __vids = (__CAT && __CAT.videos) || [];
const __discs = (__CAT && __CAT.disciplines) || [];
const __pool = __vids.map(v => ({ id:v.id, title:v.title, desc:v.desc, tag:v.tag, genre:v.genre, year:v.year||"", time:v.time, minutes:v.minutes, rating:v.rating, rawRating:v.rawRating, pop:v.pop, sort:v.sort, created:v.created, featured:v.featured, clip:v.clip, hue:v.hue, poster:v.poster, bg:v.bg, video:v.video||"", trailer:v.trailer||"", speaker:v.speaker||"", outcomes:v.outcomes||[], discipline_id:v.discipline_id||"", discipline:v.discipline||"" }));
const __nonClip = __pool.filter(v => !v.clip);
const __byId = {}; __pool.forEach(v => { __byId[v.id] = v; });

/* ---------------------------------------------------------
   1) DATA — add or edit movies here. Everything on the page
      is built from this array.
      Use real images:  bg: 'url("hero.jpg") center/cover'
      Use real videos:  video: "trailer1.mp4"
   --------------------------------------------------------- */
const movies = (__nonClip.length ? __nonClip.filter(v => v.featured).concat(__nonClip.filter(v => !v.featured).sort((a,b) => b.rawRating - a.rawRating)).slice(0,10).map(v => ({ id:v.id, title:v.title, desc:v.desc, meta:(v.genre || "") + (v.time ? " · " + v.time : ""), bg:v.bg, video:v.video, trailer:v.trailer, minutes:v.minutes, genre:v.genre, poster:v.poster, trailers:[{ name:"Masterclass", color:"linear-gradient(135deg,#007FFF,#33B5FF)", video:v.video || "" }, { name:"Trailer", color:"linear-gradient(135deg,#16283d,#3f7cac)", video:v.trailer || "" }] })) : [
  {
    title: "MULAN",
    desc: "A fearless young woman risks everything out of love for her family and her country, and rises to become one of the greatest warriors her homeland has ever known.",
    meta: "2020 · Action/Fantasy · 2 hours",
    bg: "radial-gradient(circle at 25% 30%, rgba(30,160,255,.55), transparent 45%), linear-gradient(120deg,#0B3A7A,#0A1F44 45%,#03080E)",
    trailers: [
      { name: "Official Trailer", color: "linear-gradient(135deg,#d9482b,#f0a24a)", video: "" },
      { name: "Teaser",           color: "linear-gradient(135deg,#7ba7d6,#c8d8ea)", video: "" },
      { name: "Behind the Scenes",color: "linear-gradient(135deg,#e8eef5,#b53a3a)", video: "" }
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
]);

/* ---------------------------------------------------------
   2) GRAB ELEMENTS
   --------------------------------------------------------- */
const $ = id => document.getElementById(id);
const hero = $("hero"), content = $("content");
const titleEl = $("title"), descEl = $("desc"), metaEl = $("meta");
const thumbsEl = $("thumbs");
const modal = $("modal"), player = $("player"), modalTitle = $("modalTitle");
const searchInput = $("searchInput"), toast = $("toast");

let current = 0;

/* ---------------------------------------------------------
   3) RENDER A MOVIE into the page
   --------------------------------------------------------- */
function render(index) {
  const m = movies[index];
  current = index;

  hero.style.setProperty("--bg", m.bg);
  titleEl.textContent = m.title;
  descEl.textContent  = m.desc;
  metaEl.textContent  = m.meta;
  document.title = m.title + " – Movie Hero";
  updateListBtn();

  // trailer thumbnails
  thumbsEl.innerHTML = "";
  m.trailers.forEach(t => {
    const b = document.createElement("button");
    b.className = "thumb";
    b.style.background = t.color;
    b.setAttribute("aria-label", "Play " + t.name);
    b.addEventListener("click", () => openTrailer(m.title, t));
    thumbsEl.appendChild(b);
  });
}

/* fade out -> swap content -> fade in */
function switchMovie(index) {
  if (index === current) return;
  content.classList.add("swap");
  setTimeout(() => {
    render(index);
    content.classList.remove("swap");
  }, 350);
}

/* ---------------------------------------------------------
   4) TRAILER MODAL
   --------------------------------------------------------- */
function openTrailer(movieTitle, trailer) {
  try { parent.NFPlay({ title:movieTitle, sub:trailer.name, bg:trailer.color, video:trailer.video||"", total:150, key:null, intro:false }); }
  catch (e) { showToast(movieTitle + " \\u2013 " + trailer.name); }
}
function closeTrailer() {
  modal.classList.remove("open");
  player.innerHTML = "";          // stops any playing video
}
$("closeBtn").addEventListener("click", closeTrailer);
modal.addEventListener("click", e => { if (e.target === modal) closeTrailer(); });

/* ---------------------------------------------------------
   5) WATCH BUTTON
   --------------------------------------------------------- */
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}
$("watchBtn").addEventListener("click", () => {
  const e = cw.find(x => x.title === movies[current].title);
  openPlayer(movies[current], e ? e.sec : 0);
});

/* ---------------------------------------------------------
   6) SEARCH — click the icon, type a title, press Enter
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
    showToast("No title found for \\"" + searchInput.value + "\\"");
  }
});

/* ---------------------------------------------------------
   7) NAV LINKS — highlight the clicked one
   --------------------------------------------------------- */
document.querySelectorAll("#navLinks a").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    document.querySelectorAll("#navLinks a").forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    const target = link.dataset.target;
    if (target === "mylist") showToast(list.length ? "My list: " + list.map(titleOf).join(", ") : "Your list is empty");
    else window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

/* ---------------------------------------------------------
   8) KEYBOARD — Esc closes modal, arrows change movie
   --------------------------------------------------------- */
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeTrailer();
  if (document.activeElement === searchInput || modal.classList.contains("open") || pv.classList.contains("open")) return;
  if (e.key === "ArrowRight") switchMovie((current + 1) % movies.length);
  if (e.key === "ArrowLeft")  switchMovie((current - 1 + movies.length) % movies.length);
});

/* ---------------------------------------------------------
   9) CATEGORIES — every category title gets its own row of 5 movies.
      Edit the titles below. Real posters: replace the generated
      gradient with  poster: 'url("poster.jpg") center/cover'
   --------------------------------------------------------- */
const categoryData = __discs.length ? Object.fromEntries(__discs.map(d => [d.title, __pool.filter(v => v.discipline_id === d.id && !v.clip).map(v => ({ id:v.id, title:v.title, genre:v.discipline || v.genre || d.title, video:v.video, trailer:v.trailer, minutes:v.minutes, rating:v.rating, poster:v.poster, bg:v.bg, desc:v.desc, time:v.time }))]).filter(([,a]) => a.length)) : {
  "Feature Film":        ["The Quiet Orchard", "Salt and Iron", "Harbor Lights", "A Winter Promise", "Crimson Hours"],
  "Feature Documentary": ["Oceans Beyond Us", "The Last Glacier", "Voices of the Valley", "Inside the Hive", "Roots of the Forest"],
  "Short Film":          ["Paper Moon", "Ten Minutes Left", "The Red Door", "Lantern", "Small Hours"],
  "Documentary Short":   ["Street Poets", "The Bread Makers", "Last Ferry", "Hands of Clay", "Night Market"],
  "Animated Feature":    ["Dragonfly Kingdom", "Captain Pebble", "The Cloud Painter", "Moonlit Trails", "Robo Bakery"],
  "Animated Short":      ["Tiny Sparks", "Fox and Fog", "The Lost Mitten", "Pixel Garden", "Sleepy Comet"],
  "Student Film":        ["First Draft", "Campus at Dawn", "The Borrowed Camera", "Thesis", "Rooftop Tales"],
  "LGBT Feature":        ["Summer of Colors", "Letters to Sam", "Two Rooms", "Parade Night", "The Open Door"]
};


const hue = str => [...str].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
const categoryMovies = [];                        // flat list, used by the player + Continue Watching
const catGroups = $("catGroups");

Object.entries(categoryData).forEach(([category, titles]) => {
  const group = document.createElement("div");
  group.className = "cat-group";
  group.innerHTML = '<h3></h3><div class="cat-row"></div>';
  group.querySelector("h3").textContent = category;
  const row = group.querySelector(".cat-row");

  titles.forEach((item, i) => {
    const isObj = item && typeof item === "object";
    const title = isObj ? item.title : item;
    const h = hue(title);
    const poster = (isObj && item.poster) || "linear-gradient(160deg,hsl(" + h + ",55%,42%),hsl(" + ((h + 30) % 360) + ",60%,8%))";
    const m = isObj ? { ...item, genre: item.genre || category, bg: item.bg || item.poster || poster, video: item.video || "", minutes: item.minutes || 0 } : { title, genre: category, poster, bg: poster };
    categoryMovies.push(m);

    const card = document.createElement("button");
    card.className = "cat-card";
    card.style.setProperty("--i", i);
    card.innerHTML = '<span class="poster"></span><span class="cat-name"></span>';
    card.querySelector(".poster").style.background = poster;
    card.querySelector(".cat-name").textContent = title;
    card.addEventListener("click", () => {
      const e = cw.find(x => x.title === title);
      openPlayer(m, e ? e.sec : 0);
    });
    row.appendChild(card);
  });
  catGroups.appendChild(group);

  /* each row fades in when it scrolls into view */
  new IntersectionObserver((entries, obs) => {
    if (entries[0].isIntersecting) { group.classList.add("visible"); obs.disconnect(); }
  }, { threshold: 0.15 }).observe(group);
});

/* ---------------------------------------------------------
   10) MY LIST — saved in the browser (localStorage)
   --------------------------------------------------------- */
const KEY = "continuum.favorites";
let list = [];                                  // saved video ids (or demo titles)
try { list = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { list = []; }
const saveList = () => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} };
const mid = m => (m && (m.id || m.title)) || "";
const titleOf = k => {
  const all = movies.concat(top10, extraMovies, categoryMovies);
  const f = all.find(x => (x.id || x.title) === k || x.title === k);
  return f ? f.title : k;
};

const listBtn = $("listBtn");

function updateNavCount() {
  const n = $("navCount");
  n.textContent = list.length;
  n.hidden = list.length === 0;
}

function updateWatchLabel() {
  if (typeof cw === "undefined") return;
  const l = $("watchLabel");
  if (!l) return;
  const e = cw.find(x => x.title === movies[current].title);
  l.innerHTML = e && typeof fmt === "function" ? "Resume <br>at " + fmt(e.sec) : "Watch <br>the Movie";
}

function updateListBtn() {
  updateWatchLabel();
  updateNavCount();
  const saved = list.includes(mid(movies[current]));
  listBtn.textContent = saved ? "\\u2713 In My List" : "+ My List";
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
listBtn.addEventListener("click", () => toggleList(mid(movies[current])));

/* ---------------------------------------------------------
   10b) TOP 10 MOVIES — edit this array (keep it in rank order)
        Real posters:  poster: 'url("poster.jpg") center/cover'
        Click a card to play it (it also feeds Continue Watching)
   --------------------------------------------------------- */
const top10 = (__nonClip.length ? __nonClip.slice().sort((a,b) => b.rawRating - a.rawRating).slice(0,10).map(v => ({ id:v.id, title:v.title, genre:v.genre, rating:v.rating, poster:v.poster, bg:v.bg || v.poster, video:v.video, minutes:v.minutes, desc:v.desc, time:v.time })) : [
  { title:"STARLESS",     genre:"Sci-Fi",   rating:4.8, poster:"linear-gradient(160deg,#5b48c9,#0a0724)" },
  { title:"IRON TIDE",    genre:"Action",   rating:4.7, poster:"linear-gradient(160deg,#59606e,#0a0b0e)" },
  { title:"HOLLOW PINES", genre:"Horror",   rating:4.5, poster:"linear-gradient(160deg,#b52323,#140303)" },
  { title:"NIGHTFALL",    genre:"Mystery",  rating:4.4, poster:"linear-gradient(160deg,#2a5d8f,#06101c)" },
  { title:"PAPER KITES",  genre:"Animation",rating:4.3, poster:"linear-gradient(160deg,#35b5aa,#08201f)" },
  { title:"LAST SIGNAL",  genre:"Thriller", rating:4.2, poster:"linear-gradient(160deg,#c9a62d,#1c1604)" },
  { title:"DUST & THUNDER",genre:"Western", rating:4.1, poster:"linear-gradient(160deg,#b8793c,#241408)" },
  { title:"EMBER",        genre:"Comedy",   rating:4.1, poster:"linear-gradient(160deg,#d9782b,#2a0f06)" },
  { title:"NEON RUN",     genre:"Sci-Fi",   rating:4.0, poster:"linear-gradient(160deg,#e0359b,#14062a)" },
  { title:"VELVET ROAD",  genre:"Romance",  rating:4.0, poster:"linear-gradient(160deg,#c24d86,#1a0714)" }
]).map(m => ({ ...m, bg: m.bg || m.poster }));            // the player uses bg as its backdrop

const __t10 = new Set(top10.map(m => m.id).filter(Boolean));
const extraMovies = (__nonClip.length ? __nonClip.filter(v => !v.featured && !__t10.has(v.id)).sort((a,b) => (a.sort - b.sort) || a.title.localeCompare(b.title)).slice(0,8).map(v => ({ id:v.id, title:v.title, genre:v.genre, poster:v.poster, bg:v.bg || v.poster, video:v.video, minutes:v.minutes, desc:v.desc, time:v.time, rating:v.rating })) : [
  { title:"SILENT HARBOR",  genre:"Drama",     poster:"linear-gradient(160deg,#4d7a8c,#0b161b)" },
  { title:"GLASS GARDEN",   genre:"Romance",   poster:"linear-gradient(160deg,#7bc47f,#0d2412)" },
  { title:"COPPER SKY",     genre:"Adventure", poster:"linear-gradient(160deg,#d4703a,#1d0e2e)" },
  { title:"THE LONG WAY",   genre:"Drama",     poster:"linear-gradient(160deg,#8c8c5a,#1a1a0d)" },
  { title:"MIDNIGHT CHOIR", genre:"Musical",   poster:"linear-gradient(160deg,#6a3fa0,#0d0618)" },
  { title:"WILD HEARTS",    genre:"Adventure", poster:"linear-gradient(160deg,#3fa06a,#06180f)" }
]).map(m => ({ ...m, bg: m.bg || m.poster }));

const catalog = () => [...movies, ...top10, ...extraMovies, ...categoryMovies];      // everything that can be played

(function buildTop10() {
  const row = $("topRow");
  top10.forEach((m, i) => {
    const b = document.createElement("button");
    b.className = "top-item";
    b.setAttribute("aria-label", "Number " + (i + 1) + ": " + m.title + ". Play");
    b.innerHTML = '<span class="top-num"></span><span class="top-poster"><small></small><b></b></span>';
    b.querySelector(".top-num").textContent = i + 1;
    const poster = b.querySelector(".top-poster");
    poster.style.background = m.poster;
    poster.querySelector("small").textContent = "\\u2605 " + m.rating.toFixed(1);
    poster.querySelector("b").textContent = m.title;
    b.addEventListener("click", () => {
      const e = cw.find(x => x.title === m.title);
      openPlayer(m, e ? e.sec : 0);
    });
    row.appendChild(b);
  });
})();

/* ---------------------------------------------------------
   11) PLAYER + CONTINUE WATCHING
       Leave a movie before the end and it shows up under
       "Continue Watching" with a progress bar.
       Optional per movie:  minutes: 115   video: "movie.mp4"
   --------------------------------------------------------- */
const CW_KEY = "continueWatching";
let cw = [];                                     // [{title, sec, total, at}]
try { cw = JSON.parse(localStorage.getItem(CW_KEY)) || []; } catch (e) {}
try {                                            // merge server-synced progress (continuum.progress)
  const pm = JSON.parse(localStorage.getItem("continuum.progress")) || {};
  Object.keys(pm).forEach(id => {
    const p = pm[id];
    if (!p || p.completed || !(p.position > 10)) return;
    const v = __byId[id];
    if (!v || cw.some(x => x.title === v.title)) return;
    cw.push({ title: v.title, sec: Math.floor(p.position || 0), total: Math.floor(p.duration || (v.minutes || 30) * 60), at: p.updated_at ? (Date.parse(p.updated_at) || Date.now()) : Date.now() });
  });
} catch (e) {}
const saveCW = () => { try { localStorage.setItem(CW_KEY, JSON.stringify(cw)); } catch (e) {} };

const fmt = s => {
  s = Math.floor(s);
  const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = String(s % 60).padStart(2, "0");
  return h ? h + ":" + String(m).padStart(2, "0") + ":" + x : m + ":" + x;
};
const fmtLeft = s => { const m = Math.max(1, Math.round(s / 60)); return (m >= 60 ? Math.floor(m / 60) + "h " : "") + (m % 60) + "m left"; };

const pv = $("pv"), pvSeek = $("pvSeek");
let pm = null, pt = 0, ptotal = 0, pplaying = false, ptimer = null, pvid = null;

function paintPlayer() {
  pvSeek.max = ptotal; pvSeek.value = pt;
  $("pvTime").textContent = fmt(pt) + " / " + fmt(ptotal);
  $("pvToggle").textContent = pplaying ? "\\u275A\\u275A" : "\\u25B6";
}
function setPlaying(on) {
  pplaying = on;
  clearInterval(ptimer);
  if (pvid) { if (on) pvid.play().catch(() => {}); else pvid.pause(); }
  else if (on) ptimer = setInterval(() => { pt = Math.min(ptotal, pt + 1); if (pt >= ptotal) setPlaying(false); paintPlayer(); }, 1000);
  paintPlayer();
}
function seek(sec) {
  pt = Math.max(0, Math.min(ptotal, sec));
  if (pvid) pvid.currentTime = pt;
  paintPlayer();
}

function openPlayer(m, start) {
  try { parent.NFPlay({ title:m.title, sub:m.genre||"", bg:m.bg||m.poster, video:m.video||"", total:(m.minutes||120)*60, start:start||0, id:m.id||null, onClose:() => window.refreshCW && window.refreshCW() }); }
  catch (e) { showToast("Playing " + m.title); }
}

function closePlayer() {
  if (!pv.classList.contains("open")) return;
  setPlaying(false);
  const i = cw.findIndex(x => x.title === pm.title);
  const finished = pt / ptotal >= 0.95;
  if (pt >= 10 && !finished) {                   // left early -> remember where
    const e = { title: pm.title, sec: Math.floor(pt), total: Math.floor(ptotal), at: Date.now() };
    if (i >= 0) cw[i] = e; else cw.push(e);
    showToast("Saved to Continue Watching");
  } else if (i >= 0) cw.splice(i, 1);            // finished (or barely started) -> remove
  saveCW();
  if (pvid) { pvid.removeAttribute("src"); pvid.load(); pvid = null; }
  pv.classList.remove("open");
  renderCW();
  updateWatchLabel();
}

function updateWatchLabel() {
  const e = cw.find(x => x.title === movies[current].title);
  $("watchLabel").innerHTML = e ? "Resume <br>at " + fmt(e.sec) : "Watch <br>the Movie";
}

function renderCW() {
  const sec = $("cw"), row = $("cwRow");
  row.innerHTML = "";
  const items = [...cw].sort((a, b) => b.at - a.at).filter(x => catalog().some(m => m.title === x.title));
  sec.hidden = !items.length;
  items.forEach(x => {
    const m = catalog().find(mm => mm.title === x.title);
    const card = document.createElement("div");
    card.className = "cw-card";
    card.innerHTML =
      '<button class="cw-open"><span class="cw-thumb"><b></b><span class="cw-play">\\u25B6</span><span class="cw-prog"><i></i></span></span>' +
      '<span class="cw-name"></span><span class="cw-left"></span></button>' +
      '<button class="cw-x" aria-label="Remove from Continue Watching">&times;</button>';
    card.querySelector(".cw-thumb").style.background = m.bg;
    card.querySelector(".cw-thumb b").textContent = m.title;
    card.querySelector(".cw-prog i").style.width = Math.round(x.sec / x.total * 100) + "%";
    card.querySelector(".cw-name").textContent = m.title;
    card.querySelector(".cw-left").textContent = "Resume at " + fmt(x.sec) + " \\u00B7 " + fmtLeft(x.total - x.sec);
    card.querySelector(".cw-open").addEventListener("click", () => openPlayer(m, x.sec));
    card.querySelector(".cw-x").addEventListener("click", () => {
      cw = cw.filter(y => y.title !== x.title); saveCW(); renderCW(); updateWatchLabel();
    });
    row.appendChild(card);
  });
}

$("pvClose").addEventListener("click", closePlayer);
$("pvToggle").addEventListener("click", () => setPlaying(!pplaying));
pvSeek.addEventListener("input", () => seek(Number(pvSeek.value)));
document.addEventListener("keydown", e => {
  if (!pv.classList.contains("open")) return;
  if (e.key === "Escape") closePlayer();
  else if (e.key === " " && e.target.tagName !== "BUTTON") { e.preventDefault(); setPlaying(!pplaying); }
  else if (e.key === "ArrowRight" && e.target !== pvSeek) seek(pt + 10);
  else if (e.key === "ArrowLeft"  && e.target !== pvSeek) seek(pt - 10);
});
window.addEventListener("pagehide", closePlayer);   // closing the tab mid-movie also saves progress
window.refreshCW = function () { try { cw = JSON.parse(localStorage.getItem(CW_KEY)) || []; } catch (e) { cw = []; } renderCW(); updateWatchLabel(); };
renderCW();

/* ---------------------------------------------------------
   12) MOVIES ROW — same cards as Categories, random every time.
       Reload the page or press Shuffle for a new order.
   --------------------------------------------------------- */
const moreRow = $("moreRow");
const soonDates = {                               // edit the release dates here
  "SILENT HARBOR": "Dec 12", "GLASS GARDEN": "Dec 19", "COPPER SKY": "Dec 26",
  "THE LONG WAY": "Jan 9", "MIDNIGHT CHOIR": "Jan 23", "WILD HEARTS": "Feb 6"
};
function renderMore() {
  moreRow.innerHTML = "";
  extraMovies.forEach((m, i) => {
    const name = m.title.toLowerCase().replace(/\\b\\w/g, ch => ch.toUpperCase());
    const date = soonDates[m.title] || "Soon";
    const c = document.createElement("button");
    c.className = "cat-card";
    c.style.setProperty("--i", i);
    c.innerHTML = '<span class="poster"></span><span class="cat-name"></span><span class="cat-info"></span>';
    c.querySelector(".poster").style.background = m.poster || m.bg;
    c.querySelector(".cat-name").textContent = name;
    const info = c.querySelector(".cat-info");
    info.textContent = m.time ? m.genre + " · " + m.time : "Coming " + date;
    info.style.marginTop = ".1rem";
    c.addEventListener("click", () => {
      if (m.video !== undefined) { const e2 = cw.find(x => x.title === m.title); openPlayer(m, e2 ? e2.sec : 0); }
      else showToast(name + " is coming " + date);
    });
    moreRow.appendChild(c);
  });
  moreRow.scrollLeft = 0;
}
new IntersectionObserver((entries, obs) => {
  if (entries[0].isIntersecting) { $("moreMovies").classList.add("visible"); obs.disconnect(); }
}, { threshold: 0.2 }).observe($("moreMovies"));
renderMore();

/* start */
render(0);
</script>
</body>
</html>
`,

  /* ==========================================================================
     2. MOVIES PAGE TEMPLATE
     ========================================================================== */
  movies: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Movies</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Poppins:wght@400;500;600;800" rel="stylesheet">
<style>
  :root{--primary-azure:#007FFF;--primary-hover:#1EA0FF;--primary-vivid:#33B5FF;--bg-deep-dark:#03080E;--bg-card-dark:#071225;--text-primary:#FFFFFF; --red:#007FFF; --bg:#03080E; --panel:#071225; --muted:#8DA2BD; --font:"Poppins",system-ui,sans-serif; --display:"Oswald","Arial Narrow",sans-serif; }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:var(--bg); color:#fff; font-family:var(--font); min-height:100vh; }
  button, input, select { font-family:inherit; color:inherit; }

  /* ---------- PAGE HEADER + CONTROLS ---------- */
  .wrap { padding:48px 5vw 70px; }
  .head { display:flex; align-items:flex-end; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin-bottom:1.6rem; }
  h1 { font-family:var(--display); font-size:clamp(2rem,4vw,3rem); letter-spacing:.05em; text-transform:uppercase; }
  .count { color:var(--muted); font-size:.9rem; margin-top:.2rem; }
  .tools { display:flex; gap:.8rem; flex-wrap:wrap; }
  .search, .sort {
    background:var(--panel); border:1px solid #10223F; border-radius:8px; padding:10px 14px; font-size:.88rem;
  }
  .search { width:220px; }
  .search:focus, .sort:focus { outline:2px solid var(--red); outline-offset:1px; }
  .sort option { background:#071225; }

  .chips { display:flex; gap:.6rem; overflow-x:auto; padding-bottom:6px; margin-bottom:2rem; scrollbar-width:thin; }
  .chip {
    flex:none; background:var(--panel); border:1px solid #10223F; border-radius:999px; padding:8px 18px;
    font-size:.85rem; font-weight:500; cursor:pointer; transition:background .2s, border-color .2s;
  }
  .chip:hover { border-color:#555; }
  .chip.on { background:var(--red); border-color:var(--red); }
  .chip:focus-visible { outline:2px solid #fff; outline-offset:2px; }

  /* ---------- GRID (every card identical) ---------- */
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(270px,1fr)); gap:30px 24px; }
  .card { position:relative; }
  .open { display:block; width:100%; background:none; border:0; text-align:left; cursor:pointer; }
  .poster {
    display:block; width:100%; aspect-ratio:16/10; border-radius:12px; border:2px solid transparent; overflow:hidden; position:relative;
    box-shadow:0 8px 22px rgba(0,0,0,.5); transition:transform .25s ease, border-color .25s ease;
  }
  .poster b {
    position:absolute; left:12px; right:12px; bottom:14px; text-align:left; font-family:var(--display);
    font-size:1.25rem; letter-spacing:.12em; text-transform:uppercase; text-shadow:0 2px 10px rgba(0,0,0,.8);
  }
  .rate {
    position:absolute; top:8px; left:8px; background:rgba(0,0,0,.7); border-radius:6px; padding:3px 8px;
    font-size:.72rem; font-weight:600; color:#33B5FF;
  }
  .open:hover .poster, .open:focus-visible .poster { transform:translateY(-6px); border-color:#fff; }
  .open:focus-visible { outline:none; }
  .name { display:block; margin-top:.7rem; font-size:.95rem; font-weight:500; line-height:1.3; min-height:1.3em; }
  .sub { display:block; margin-top:.15rem; font-size:.78rem; color:var(--muted); }
  .quick {
    position:absolute; top:8px; right:8px; width:32px; height:32px; border-radius:50%; border:0; cursor:pointer;
    background:rgba(0,0,0,.7); font-size:1.1rem; line-height:1; display:grid; place-items:center;
    opacity:0; transition:opacity .2s, background .2s;
  }
  .card:hover .quick, .card:focus-within .quick, .quick.saved { opacity:1; }
  .quick:hover { background:var(--red); }
  .quick.saved { background:var(--red); }
  .empty { grid-column:1/-1; text-align:center; color:var(--muted); padding:4rem 0; }

  /* ---------- DETAILS MODAL ---------- */
  .modal { position:fixed; inset:0; z-index:10; display:none; place-items:center; background:rgba(0,0,0,.8); padding:5vw; }
  .modal.open { display:grid; }
  .sheet {
    position:relative; width:min(820px,100%); max-height:90vh; overflow:auto; background:var(--panel); border-radius:16px;
    display:grid; grid-template-columns:320px 1fr; gap:28px; padding:28px; align-items:start;
  }
  .sheet .poster { box-shadow:none; border-color:#fff; }
  .x { position:absolute; top:12px; right:16px; background:none; border:0; font-size:2rem; line-height:1; cursor:pointer; }
  .sheet h2 { font-family:var(--display); font-size:2.2rem; letter-spacing:.05em; text-transform:uppercase; line-height:1.1; padding-right:2rem; }
  .tagline { color:var(--red); font-family:var(--display); letter-spacing:.25em; font-size:.75rem; margin-bottom:.4rem; }
  .info { display:flex; flex-wrap:wrap; gap:.4rem 1rem; margin:1rem 0 1.2rem; font-size:.8rem; font-weight:600; letter-spacing:.08em; color:#ddd; }
  .stars { color:var(--red); letter-spacing:2px; }
  .stars .off { color:#0F2A4D; }
  .synopsis { font-size:.9rem; line-height:1.7; color:#e4e4e8; }
  .actions { display:flex; margin-top:1.8rem; }
  .btn { border:0; color:#fff; font:600 .78rem var(--font); letter-spacing:.14em; cursor:pointer; padding:14px 30px; transition:filter .2s; }
  .btn:hover, .btn:focus-visible { filter:brightness(1.18); outline:none; }
  .play { background:var(--red); border-radius:6px 0 0 6px; }
  .list { background:#7a7a7a; border-radius:0 6px 6px 0; }
  .list.saved { background:#3d3d3d; }
  .videos-list { margin-top:1.5rem; padding-top:1.5rem; border-top:1px solid var(--line); }
  .videos-list h3 { font-size:1rem; font-weight:600; margin-bottom:1rem; color:#8DA2BD; }
  .videos-list button { display:block; width:100%; text-align:left; background:none; border:0; color:#fff; padding:8px 0; cursor:pointer; transition:color .2s; }
  .videos-list button:hover { color:var(--gold); }

  .toast { position:fixed; bottom:24px; left:50%; transform:translate(-50%,40px); background:#26262c; padding:12px 22px; border-radius:999px; font-size:.85rem; opacity:0; transition:all .3s; z-index:20; }
  .toast.show { opacity:1; transform:translate(-50%,0); }

  /* PREMIUM LAYER: serif display type, gold hairlines, quieter surfaces */
  :root{--primary-azure:#007FFF;--primary-hover:#1EA0FF;--primary-vivid:#33B5FF;--bg-deep-dark:#03080E;--bg-card-dark:#071225;--text-primary:#FFFFFF; --gold:#33B5FF; --bg:#03080E; --panel:#071225; --line:rgba(255,255,255,.12); --display:"Cormorant Garamond",Georgia,serif; }
  h1 { font-weight:600; font-size:clamp(2.6rem,5vw,4rem); letter-spacing:-.01em; text-transform:none; line-height:1; }
  .search, .sort { border:1px solid var(--line); border-radius:999px; padding:10px 18px; }
  .search:focus, .sort:focus, .chip:focus-visible { outline:1px solid var(--gold); outline-offset:2px; }
  .chip { border:1px solid var(--line); }
  .chip:hover { border-color:rgba(255,255,255,.4); }
  .chip.on { background:#FFFFFF; border-color:#FFFFFF; color:#03080E; }
  .poster { border-radius:10px; border:1px solid var(--line); box-shadow:0 14px 34px rgba(0,0,0,.55); }
  .open:hover .poster, .open:focus-visible .poster { border-color:var(--gold); }
  .poster b { font-weight:600; font-size:1.5rem; line-height:1.05; letter-spacing:0; text-transform:none; }
  .rate { color:var(--gold); backdrop-filter:blur(6px); }
  .name { color:#DCE9F7; }
  .quick.saved { background:var(--gold); color:#03080E; }
  .modal { background:rgba(3,8,14,.86); backdrop-filter:blur(6px); }
  .sheet { background:var(--panel); border:1px solid var(--line); border-radius:14px; box-shadow:0 30px 80px rgba(0,0,0,.6); }
  .sheet .poster { border-color:var(--line); }
  .sheet h2 { font-weight:600; font-size:2.8rem; letter-spacing:-.01em; text-transform:none; line-height:1; }
  .tagline { color:var(--gold); font:italic 500 1.15rem var(--display); letter-spacing:0; text-transform:lowercase; }
  .tagline::first-letter { text-transform:uppercase; }
  .info { font-weight:500; letter-spacing:0; color:#8DA2BD; }
  .stars { color:var(--gold); }
  .stars .off { color:#4a3f34; }
  .synopsis { color:#DCE9F7; }
  .btn { border:1px solid var(--line); font-size:.85rem; letter-spacing:.04em; }
  .play { border-color:var(--red); border-radius:4px 0 0 4px; }
  .list { background:rgba(255,255,255,.1); backdrop-filter:blur(8px); border-radius:0 4px 4px 0; }
  .list.saved { background:transparent; color:var(--gold); border-color:var(--gold); }
  .toast { background:#071225; border:1px solid var(--line); }

  @media (max-width:720px) {
    .search { width:100%; } .tools { width:100%; } .sort { flex:1; }
    .grid { grid-template-columns:1fr; gap:24px; }
    .sheet { grid-template-columns:1fr; } .sheet .poster { max-width:100%; }
  }
  @media (prefers-reduced-motion:reduce) { * { transition:none !important; } }
</style>
</head>
<body>

<main class="wrap">
  <div class="head">
    <div>
      <h1>Movies</h1>
      <p class="count" id="count"></p>
    </div>
    <div class="tools">
      <input class="search" id="search" type="search" placeholder="Search movies..." aria-label="Search movies">
      <select class="sort" id="sort" aria-label="Sort movies">
        <option value="pop">Most popular</option>
        <option value="new">Newest</option>
        <option value="top">Top rated</option>
        <option value="az">A to Z</option>
      </select>
    </div>
  </div>

  <div class="chips" id="chips" role="group" aria-label="Filter by genre"></div>
  <div class="grid" id="grid"></div>
</main>

<div class="modal" id="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle">
  <div class="sheet">
    <button class="x" id="mClose" aria-label="Close">&times;</button>
    <span class="poster" id="mPoster"></span>
    <div>
      <p class="tagline" id="mTag"></p>
      <h2 id="mTitle"></h2>
      <div class="info"><span class="stars" id="mStars"></span><span id="mInfo"></span></div>
      <p class="synopsis" id="mDesc"></p>
      <div class="actions">
        <button class="btn play" id="mPlay">Play</button>
        <button class="btn list" id="mList">+ My List</button>
      </div>
      <div class="videos-list" id="mVideosList" hidden><h3>Videos in this discipline</h3><div id="mVideos"></div></div>
    </div>
  </div>
</div>
<div class="toast" id="toast"></div>

<script>
/* Shared catalogue payload injected by the parent page (window.__CONTINUUM_CATALOGUE__). */
const __CAT = (function(){ try { return parent.__CONTINUUM_CATALOGUE__ || null; } catch(e){ return null; } })();
const __vids = ((__CAT && __CAT.videos) || []).filter(v => !v.clip).map(v => ({ id:v.id, title:v.title, year:v.year||"", genres:[v.genre || "Masterclass"], time:v.time, minutes:v.minutes, rating:v.rating, pop:v.rawRating || v.pop || 0, tag:String(v.tag || v.genre || "Masterclass"), desc:v.desc, poster:v.poster, bg:v.bg, video:v.video||"", trailer:v.trailer||"", created:v.created||"", sort:v.sort||0, discipline_id:v.discipline_id||"", discipline:v.discipline||"" }));

/* ---------- 1) DATA: group videos by discipline ----------
   Real posters:  poster: 'url("poster.jpg") center/cover'          */
const __groupedDisciplines = [];
if (__vids.length) {
  const byDiscipline = {};
  __vids.forEach(v => {
    const disc = v.discipline || v.genre || "Masterclass";
    (byDiscipline[disc] = byDiscipline[disc] || []).push(v);
  });
  Object.entries(byDiscipline).forEach(([disc, vids]) => {
    __groupedDisciplines.push({
      title: disc,
      year: "",
      genres: [disc],
      time: vids.length + " videos",
      rating: vids.reduce((a, v) => a + (v.rating || 0), 0) / vids.length,
      pop: vids.length,
      tag: disc,
      desc: vids.length + " " + (vids.length === 1 ? 'masterclass' : 'masterclasses') + " in " + disc,
      poster: vids[0]?.poster || "linear-gradient(160deg," + (vids[0]?.hue || 200) + "," + (vids[0]?.hue - 40 || 160) + ")",
      bg: vids[0]?.bg || "linear-gradient(180deg," + (vids[0]?.hue || 200) + ",#03080E)",
      created: vids[0]?.created || "",
      sort: 0,
      videos: vids
    });
  });
}
const movies = __groupedDisciplines.length ? __groupedDisciplines : [
  { title:"Nightfall",    year:2023, genres:["Mystery","Thriller"], time:"1h 55m", rating:4.4, pop:92, tag:"A LIGHTHOUSE MYSTERY",
    desc:"A lighthouse keeper discovers that the storm rolling in each night is trying to tell her something, and the answer lies beneath the waves.", poster:"linear-gradient(160deg,#2a5d8f,#06101c)" },
  { title:"Ember",        year:2022, genres:["Comedy","Drama"], time:"1h 40m", rating:4.1, pop:80, tag:"ONE KITCHEN, ONE WEEK",
    desc:"Two rival chefs are forced to share one kitchen for a single week, and discover that the hardest thing to cook is trust.", poster:"linear-gradient(160deg,#d9782b,#2a0f06)" },
  { title:"Iron Tide",    year:2024, genres:["Action","Thriller"], time:"2h 5m", rating:4.7, pop:98, tag:"CHAPTER 2",
    desc:"A retired courier is pulled back in by an old debt. To settle it, he must cross a city where every rooftop and every harbor is watched.", poster:"linear-gradient(160deg,#59606e,#0a0b0e)" },
  { title:"Hollow Pines", year:2025, genres:["Horror","Thriller"], time:"1h 48m", rating:4.5, pop:95, tag:"DON'T FOLLOW THE LIGHTS",
    desc:"Twenty years after a camping trip went wrong, four friends return to the same forest and find that something there has been waiting for them.", poster:"linear-gradient(160deg,#b52323,#140303)" },
  { title:"Velvet Road",  year:2021, genres:["Romance","Drama"], time:"2h 2m", rating:4.0, pop:70, tag:"A ROAD TRIP LOVE STORY",
    desc:"A violinist and a long-haul driver share a ride across the country, and slowly learn what each of them left behind.", poster:"linear-gradient(160deg,#c24d86,#1a0714)" },
  { title:"Starless",     year:2025, genres:["Sci-Fi","Action"], time:"2h 20m", rating:4.8, pop:99, tag:"THE LAST VOYAGE",
    desc:"When the stars begin to disappear one by one, a small crew sets out to find the edge of the map and the reason the sky is going dark.", poster:"linear-gradient(160deg,#5b48c9,#0a0724)" },
  { title:"Paper Kites",  year:2022, genres:["Animation","Comedy"], time:"1h 30m", rating:4.3, pop:84, tag:"FAMILY ANIMATION",
    desc:"On the windiest day of the year, a shy girl and her paper kite set off to deliver a message across the whole town.", poster:"linear-gradient(160deg,#35b5aa,#08201f)" },
  { title:"Last Signal",  year:2024, genres:["Thriller","Mystery"], time:"1h 52m", rating:4.2, pop:88, tag:"BASED ON TRUE EVENTS",
    desc:"A radio operator at a remote station picks up a call for help from a place that should be empty, and has one night to find out who is calling.", poster:"linear-gradient(160deg,#c9a62d,#1c1604)" },
  { title:"Silent Harbor",year:2020, genres:["Drama"], time:"2h 10m", rating:3.9, pop:62, tag:"A FAMILY RETURNS",
    desc:"After twenty years away, a fisherman's daughter comes home to a harbor town that has learned to live without answers.", poster:"linear-gradient(160deg,#4d7a8c,#0b161b)" },
  { title:"Neon Run",     year:2023, genres:["Action","Sci-Fi"], time:"1h 58m", rating:4.0, pop:86, tag:"ONE NIGHT TO ESCAPE",
    desc:"A delivery runner in a city of glowing towers is handed a package that every gang in town would burn the streets to get.", poster:"linear-gradient(160deg,#e0359b,#14062a)" },
  { title:"Glass Garden", year:2021, genres:["Romance","Comedy"], time:"1h 42m", rating:3.8, pop:58, tag:"BLOOMING LATE",
    desc:"A botanist and a stubborn florist compete to save the last greenhouse in town, and keep running out of reasons to stay rivals.", poster:"linear-gradient(160deg,#7bc47f,#0d2412)" },
  { title:"Dust & Thunder",year:2024, genres:["Action","Drama"], time:"2h 15m", rating:4.1, pop:75, tag:"THE LAST RIDE",
    desc:"A marshal and a runaway bride cross a dry desert with a storm behind them and a gang ahead of them.", poster:"linear-gradient(160deg,#b8793c,#241408)" }
]);

/* ---------- 2) STATE + ELEMENTS ---------- */
const $ = id => document.getElementById(id);
const grid = $("grid");
const state = { genre:"All", q:"", sort:"pop" };
let current = null, modalTrigger = null;

const KEY = "continuum.favorites";
let list = [];
try { list = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) {}
const saveList = () => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} };
const mid = m => m.id || m.title;

const genres = ["All", ...new Set(movies.map(m => m.title))].sort((a, b) => a === "All" ? -1 : b === "All" ? 1 : a.localeCompare(b));

/* ---------- 3) FILTER CHIPS ---------- */
genres.forEach(g => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "chip" + (g === state.genre ? " on" : "");
  b.textContent = g;
  b.setAttribute("aria-pressed", String(g === state.genre));
  b.addEventListener("click", () => {
    state.genre = g;
    document.querySelectorAll(".chip").forEach(c => {
      c.classList.toggle("on", c === b);
      c.setAttribute("aria-pressed", String(c === b));
    });
    render();
  });
  $("chips").appendChild(b);
});

/* ---------- 4) RENDER THE GRID ---------- */
function visible() {
  const q = state.q.toLowerCase();
  const out = movies.filter(m =>
    (state.genre === "All" || m.title === state.genre) &&
    (!q || m.title.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q)));
  const by = { pop:(a,b)=>b.pop-a.pop, new:(a,b)=>(b.created||"").localeCompare(a.created||""") || (b.sort||0)-(a.sort||0), top:(a,b)=>b.rating-a.rating, az:(a,b)=>a.title.localeCompare(b.title) };
  return out.sort(by[state.sort]);
}

function render() {
  const items = visible();
  grid.innerHTML = "";
  $("count").textContent = items.length + (items.length === 1 ? " discipline" : " disciplines");
  if (!items.length) { grid.innerHTML = '<p class="empty">No disciplines match your search.<br><button class="browse" onclick="clearFilters()">Clear filters</button></p>'; return; }

  items.forEach(m => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML =
      '<button class="open"><span class="poster"><span class="rate"></span><b></b></span>' +
      '<span class="name"></span><span class="sub"></span></button>' +
      '<button class="quick"></button>';
    const poster = card.querySelector(".poster");
    poster.style.background = m.poster;
    card.querySelector(".rate").textContent = m.pop + " items";
    poster.querySelector("b").textContent = m.title;
    card.querySelector(".name").textContent = m.title;
    card.querySelector(".sub").textContent = m.desc;
    const q = card.querySelector(".quick");
    paintQuick(q, m);
    q.addEventListener("click", () => toggle(m));
    card.querySelector(".open").addEventListener("click", () => openModal(m));
    grid.appendChild(card);
  });
}

function paintQuick(q, m) {
  const on = list.includes(mid(m));
  q.textContent = on ? "\\u2713" : "+";
  q.classList.toggle("saved", on);
  q.setAttribute("aria-label", (on ? "Remove " : "Add ") + m.title + (on ? " from" : " to") + " My List");
}

/* ---------- 5) MY LIST ---------- */
let t;
function toast(msg) {
  const el = $("toast"); el.textContent = msg; el.classList.add("show");
  clearTimeout(t); t = setTimeout(() => el.classList.remove("show"), 2200);
}
function toggle(m) {
  const ids = m.videos ? m.videos.map(v => v.id).filter(Boolean) : [m.id || m.title];
  const all = ids.every(id => list.includes(id));
  ids.forEach(id => {
    const i = list.indexOf(id);
    if (all && i >= 0) list.splice(i, 1);
    else if (!all && i < 0) list.push(id);
  });
  saveList();
  syncList();
  toast(all ? "Removed from My List" : "Added to My List");
}
function syncList() {
  const shown = visible();
  document.querySelectorAll(".card .quick").forEach((q, i) => paintQuick(q, shown[i]));
  if (current) paintModalBtn();
}
/* ---------- 6) DETAILS MODAL ---------- */
function paintModalBtn() {
  const ids = current.videos ? current.videos.map(v => v.id).filter(Boolean) : [current.id || current.title];
  const on = ids.length > 0 && ids.every(id => list.includes(id));
  const b = $("mList");
  b.textContent = on ? "\\u2713 In My List" : "+ My List";
  b.classList.toggle("saved", on);
}
function openModal(m) {
  current = m;
  $("mPoster").style.background = m.poster;
  $("mPoster").innerHTML = "<b></b>";
  $("mPoster").firstChild.textContent = m.title;
  $("mTag").textContent = m.pop + " masterclasses";
  $("mTitle").textContent = m.title;
  $("mDesc").textContent = m.desc;
  $("mInfo").textContent = "Browse all videos in this discipline";
  const full = Math.round(m.rating || 4.0);
  $("mStars").innerHTML = [1,2,3,4,5].map(n => n <= full ? "\\u2605" : '<span class="off">\\u2605</span>').join("");
  $("mStars").setAttribute("aria-label", (m.rating || 4.0) + " out of 5");
  
  // Show videos list if available
  const videosList = $("mVideosList");
  const videosContainer = $("mVideos");
  if (m.videos && m.videos.length) {
    videosList.hidden = false;
    videosContainer.innerHTML = "";
    m.videos.forEach(v => {
      const btn = document.createElement("button");
      btn.textContent = v.title;
      btn.addEventListener("click", () => {
        closeModal();
        play({ title:v.title, sub:m.title, bg:m.poster, video:v.video||"", dur:v.time||"30 min", id:v.id||null });
      });
      videosContainer.appendChild(btn);
    });
  } else {
    videosList.hidden = true;
  }
  
  paintModalBtn();
  modalTrigger = document.activeElement;
  $("modal").classList.add("open");
  document.body.style.overflow = "hidden";
  $("mClose").focus();
}
function closeModal() {
  $("modal").classList.remove("open");
  document.body.style.overflow = "";
  current = null;
  if (modalTrigger instanceof HTMLElement) modalTrigger.focus();
  modalTrigger = null;
}
$("mClose").addEventListener("click", closeModal);
$("modal").addEventListener("click", e => { if (e.target === $("modal")) closeModal(); });
$("mList").addEventListener("click", () => { if (current) toggle(current); });
const play = o => { try { parent.NFPlay(o); } catch (e) { toast('Playing "' + o.title + '"...'); } };
$("mPlay").addEventListener("click", () => {
  const item = current;
  if (!item) return;
  closeModal();
  if (item.videos && item.videos.length) {
    play({ title:item.videos[0].title, sub:item.title, bg:item.poster, video:item.videos[0].video||"", dur:item.videos[0].time||"30 min", id:item.videos[0].id||null });
  } else {
    play({ title:item.title, sub:item.title, bg:item.poster, video:item.video||"", dur:item.time||"30 min", id:item.id||null });
  }
});
document.addEventListener("keydown", e => {
  const dialog = $("modal");
  if (!dialog.classList.contains("open")) return;
  if (e.key === "Escape") { e.preventDefault(); closeModal(); return; }
  if (e.key !== "Tab") return;
  const focusable = Array.from(dialog.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(el => el.getClientRects().length);
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (!dialog.contains(document.activeElement)) { e.preventDefault(); first?.focus(); }
  else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
});

/* ---------- 7) SEARCH + SORT ---------- */
$("search").addEventListener("input", e => { state.q = e.target.value.trim(); render(); });
$("sort").addEventListener("change", e => { state.sort = e.target.value; render(); });

function clearFilters(){state.genre='All';state.q='';state.sort='pop';$('search').value='';$('sort').value='pop';document.querySelectorAll('.chip').forEach((c,i)=>{c.classList.toggle('on',i===0);c.setAttribute('aria-pressed',String(i===0))});render();}
/* start */
render();
syncList();
</script>
</body>
</html>
`,

  /* ==========================================================================
     3. SERIES PAGE TEMPLATE
     ========================================================================== */
  series: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Series</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📺</text></svg>">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Poppins:wght@400;500;600;800" rel="stylesheet">
<style>
:root{--primary-azure:#007FFF;--primary-hover:#1EA0FF;--primary-vivid:#33B5FF;--bg-deep-dark:#03080E;--bg-card-dark:#071225;--text-primary:#FFFFFF;--ink:#03080E;--panel:#151012;--line:rgba(255,255,255,.12);--text:#FFFFFF;--mute:#8DA2BD;--red:#007FFF;--gold:#33B5FF;--serif:"Cormorant Garamond",Georgia,serif;--sans:"Poppins",system-ui,sans-serif;color-scheme:dark;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
html{scroll-padding-top:env(safe-area-inset-top,0px)}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:var(--ink);color:var(--text);font:400 .95rem/1.7 var(--sans);overflow-x:hidden}

.hero{position:relative;min-height:100vh;padding:28px 5vw 56px;display:flex;flex-direction:column;background:var(--bg)}
.hero::before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(3,8,14,.9),rgba(3,8,14,.3) 62%,transparent),linear-gradient(0deg,var(--ink),transparent 38%)}
.nav{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between}
.logo{font:800 1.7rem var(--sans);letter-spacing:.04em;color:var(--red)}
.nav ul{display:flex;gap:2.2rem;list-style:none}
.nav a{color:var(--mute);text-decoration:none;font-weight:500;font-size:.9rem;padding-bottom:6px;border-bottom:1px solid transparent;transition:color .2s}
.nav a:hover,.nav a:focus-visible{color:var(--text);outline:none}
.nav a.on{color:var(--text);border-bottom-color:var(--gold)}
.avatar{width:36px;height:36px;border-radius:50%;border:1px solid var(--line);background:linear-gradient(135deg,#f2c9a5,#b5654a)}

.info{position:relative;z-index:2;flex:1;display:flex;flex-direction:column;justify-content:center;gap:1.3rem;max-width:min(680px,100%);padding:6vh 0 4vh}
.info,.eps{transition:opacity .28s,transform .28s}
.hero.swap .info,.hero.swap .eps{opacity:0;transform:translateY(10px)}
h1{font:600 clamp(3.4rem,9.5vw,8rem)/.92 var(--serif);letter-spacing:-.02em;text-wrap:balance}
.meta{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem 1.4rem;color:var(--mute);font-size:.88rem}
.chip{color:var(--gold);border:1px solid var(--gold);border-radius:4px;padding:0 8px;font-weight:600}
.desc{max-width:52ch;color:#DCE9F7}
.btns{display:flex;gap:.9rem;flex-wrap:wrap}
.btn{font:600 .88rem var(--sans);padding:13px 26px;border-radius:4px;border:1px solid var(--line);background:rgba(255,255,255,.08);color:var(--text);cursor:pointer;backdrop-filter:blur(8px);transition:background .2s,border-color .2s}
.btn:hover,.btn:focus-visible{background:rgba(255,255,255,.16);border-color:rgba(255,255,255,.4);outline:none}
.btn.play{background:var(--red);border-color:var(--red)}
.btn.play:hover,.btn.play:focus-visible{background:#ff1e2a}
.btn.in{border-color:var(--gold);color:var(--gold)}
.info>*{animation:rise .9s cubic-bezier(.2,.7,.2,1) both}
.info>:nth-child(2){animation-delay:.08s}.info>:nth-child(3){animation-delay:.16s}.info>:nth-child(4){animation-delay:.24s}
@keyframes rise{from{opacity:0;transform:translateY(18px)}}

.eps{position:relative;z-index:2}
.eps h2{font:600 1.5rem var(--serif);margin-bottom:.9rem}
.er{display:flex;gap:1rem;overflow-x:auto;padding:4px 2px 8px;scrollbar-width:thin;scrollbar-color:#444 transparent}
.ep{flex:0 0 clamp(190px,18vw,250px);text-align:left;background:rgba(7,18,37,.72);backdrop-filter:blur(10px);border:1px solid var(--line);border-radius:10px;color:var(--text);font:inherit;cursor:pointer;overflow:hidden;transition:border-color .2s,transform .2s}
.ep:hover,.ep:focus-visible{border-color:var(--gold);transform:translateY(-3px);outline:none}
.ep i{display:block;aspect-ratio:16/9;position:relative}
.ep em{position:absolute;left:0;bottom:0;height:3px;width:0;background:var(--red)}
.ep b{display:block;padding:10px 12px 0;font-weight:500;font-size:.88rem}
.ep small{display:block;padding:0 12px 10px;color:var(--mute);font-size:.78rem}

.lib{padding:56px 5vw 96px}
.lh{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:1rem;margin-bottom:1.8rem}
.lh h2{font:600 2.3rem/1 var(--serif)}
.fs{display:flex;gap:.5rem;flex-wrap:wrap}
.f{font:500 .82rem var(--sans);color:var(--mute);background:none;border:1px solid var(--line);border-radius:999px;padding:7px 16px;cursor:pointer;transition:color .2s,border-color .2s}
.f:hover,.f:focus-visible{color:var(--text);border-color:rgba(255,255,255,.35);outline:none}
.f.on{color:var(--ink);background:var(--text);border-color:var(--text)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1.8rem 1.2rem}
.c{background:none;border:0;color:var(--text);font:inherit;text-align:left;cursor:pointer}
.c span{display:block;aspect-ratio:16/10;border-radius:10px;border:1px solid var(--line);position:relative;overflow:hidden;transition:transform .25s,border-color .25s}
.c b{position:absolute;left:14px;right:14px;bottom:12px;font:600 1.55rem/1.05 var(--serif);text-shadow:0 2px 12px rgba(0,0,0,.7)}
.c:hover span,.c:focus-visible span{transform:translateY(-4px);border-color:var(--gold)}
.c.cur span{border-color:var(--red)}
.c:focus-visible{outline:none}
.c small{display:block;margin-top:.6rem;color:var(--mute);font-size:.8rem}

.toast{position:fixed;bottom:calc(24px + env(safe-area-inset-bottom,0px));left:50%;transform:translate(-50%,40px);background:#071225;border:1px solid var(--line);padding:12px 22px;border-radius:999px;font-size:.88rem;opacity:0;transition:all .3s;z-index:20}
.toast.show{opacity:1;transform:translate(-50%,0)}

@media(max-width:800px){.nav ul{display:none}.hero{padding:24px 5vw 40px}.hero::before{background:linear-gradient(0deg,var(--ink) 8%,rgba(3,8,14,.72) 60%,rgba(3,8,14,.3))}.lib{padding:40px 5vw 72px}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
</style>
<style>.nav{display:none!important}.hero{padding-top:36px!important}</style></head>
<body>
<header class="hero" id="hero">
  <nav class="nav">
    <div class="logo">YOURLOGO</div>
    <ul><li><a href="#">Home</a></li><li><a href="#">Movies</a></li><li><a href="#" class="on" aria-current="page">Series</a></li><li><a href="#">Library</a></li><li><a href="#">My list</a></li></ul>
    <div class="avatar" role="img" aria-label="Your profile"></div>
  </nav>
  <section class="info">
    <h1 id="t"></h1>
    <div class="meta" id="m"></div>
    <p class="desc" id="d"></p>
    <div class="btns"><button class="btn play" id="pb">Play S1 E1</button><button class="btn" id="lb" aria-pressed="false">+ My List</button></div>
  </section>
  <section class="eps"><h2>Season 1</h2><div class="er" id="er"></div></section>
</header>

<section class="lib">
  <div class="lh"><h2>All series</h2><div class="fs" id="fs"></div></div>
  <div class="grid" id="g"></div>
</section>
<div class="toast" id="toast" role="status"></div>

<script>
/* Shared catalogue payload injected by the parent page (window.__CONTINUUM_CATALOGUE__). */
const __CAT = (function(){ try { return parent.__CONTINUUM_CATALOGUE__ || null; } catch(e){ return null; } })();
const __vids = (__CAT && __CAT.videos) || [];
const __discs = (__CAT && __CAT.disciplines) || [];
const S = (__discs.length ? __discs.map(d => {
  const vs = __vids.filter(v => (v.series_id === d.id || v.discipline_id === d.id) && !v.clip);
  if (!vs.length) return null;
  const r = vs.reduce((a,v) => a + v.rating, 0) / vs.length;
  const hueVal = d.hue !== undefined ? d.hue : (vs[0]?.hue || 200);
  return { id:d.id, t:d.title, g:d.goal || "Masterclass", y:"", s:1, r:r.toFixed(1), h:hueVal, d:d.blurb || "", e:vs.map(v => v.title), vids:vs };
}).filter(Boolean)) : [
{t:"The Hollow Crown",g:"Drama",y:2025,s:3,r:"9.1",h:352,d:"When a king dies without naming an heir, three siblings fight for a throne that is already hollow.",e:["The Last Heir","Ash and Salt","A Quiet Coup","The Crown’s Debt","Winter Court"]},
{t:"Salt Road",g:"Crime",y:2024,s:2,r:"8.8",h:42,d:"A retired customs officer is pulled back in when a smuggling route she once closed quietly reopens.",e:["Border Lights","The Manifest","Dry Dock","Lowball","Night Freight"]},
{t:"Low Orbit",g:"Sci-Fi",y:2026,s:1,r:"8.6",h:210,d:"Six engineers on a failing station have nine days to fix it, and one of them is lying about why.",e:["Day One","Pressure","Dead Air","The Seventh Seat","Reentry"]},
{t:"Ember & Ash",g:"Fantasy",y:2023,s:4,r:"9.0",h:18,d:"A blacksmith’s daughter inherits a forge that can only be lit by the things people want to forget.",e:["The Forge","Cold Iron","Smoke Signals","What Burns","The Long Cinder"]},
{t:"Quiet Harbor",g:"Drama",y:2025,s:2,r:"8.4",h:190,d:"In a fishing town with one road in and out, every secret has a witness and every witness has a boat.",e:["Low Tide","The Cannery","Salt Wind","Ferry Day","Lantern Night"]},
{t:"The Cartographer",g:"Fantasy",y:2024,s:2,r:"8.7",h:270,d:"A mapmaker discovers that the places she draws begin to exist, including the ones she fears.",e:["Blank Margins","North of Nowhere","Ink","The Second Coast","Scale"]},
{t:"Static",g:"Sci-Fi",y:2022,s:3,r:"8.5",h:150,d:"A radio operator in a sealed bunker keeps hearing broadcasts from a year that hasn’t happened yet.",e:["Signal","Dial Tone","Echo Chamber","Frequency","Blackout"]},
{t:"Fault Line",g:"Crime",y:2026,s:1,r:"8.3",h:120,d:"After an earthquake exposes a body in a sealed tunnel, two detectives trace a crime to the city’s founding.",e:["Aftershock","Load Bearing","Dust","The Old Quarter","Bedrock"]}
]);
const $=id=>document.getElementById(id);
const bg=h=>\`radial-gradient(circle at 72% 28%,hsla(\${h},70%,55%,.42),transparent 50%),linear-gradient(125deg,hsl(\${h},42%,20%),hsl(\${(h+25)%360},38%,9%) 60%,#03080E)\`;
const tile=h=>\`linear-gradient(160deg,hsl(\${h},50%,38%),hsl(\${(h+30)%360},55%,8%))\`;
const plural=(n,w)=>n+" "+w+(n>1?"s":"");
let cur=0,filter="All",list=[];
try{list=JSON.parse(localStorage.getItem("continuum.favorites"))||[]}catch(e){}
const save=()=>{try{localStorage.setItem("continuum.favorites",JSON.stringify(list))}catch(e){}};
const sIds=s=>(s.vids&&s.vids.length?s.vids.map(v=>v.id).filter(Boolean):[s.t]);
const sHas=s=>{const ids=sIds(s);return ids.length>0&&ids.every(id=>list.includes(id))};
const sToggle=s=>{const ids=sIds(s),all=ids.every(id=>list.includes(id));ids.forEach(id=>{const i=list.indexOf(id);if(all&&i>=0)list.splice(i,1);else if(!all&&i<0)list.push(id)});save()};
let tt;const toast=m=>{const t=$("toast");t.textContent=m;t.classList.add("show");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("show"),2200)};

const play=o=>{try{parent.NFPlay(o)}catch(e){toast("Playing "+o.title)}};
const epOpts=(s,k)=>{const v=(s.vids&&s.vids[k])||null,nm=v?v.title:s.e[k];return{title:nm,sub:s.t+" \u00B7 "+nm,bg:tile(s.h),dur:v&&v.time||"45 min",key:s.t+" S1E"+(k+1),id:v&&v.id||null,video:v&&v.video||"",next:k+1<s.e.length?epOpts(s,k+1):null}};
function listBtn(){const on=sHas(S[cur]),b=$("lb");b.textContent=on?"\\u2713 In My List":"+ My List";b.classList.toggle("in",on);b.setAttribute("aria-pressed",on)}

function render(i){
  cur=i;const s=S[i];
  $("hero").style.setProperty("--bg",bg(s.h));
  $("t").textContent=s.t;$("d").textContent=s.d;
  $("m").innerHTML="<span class='chip'></span><span></span><span></span><span></span>";
  [s.r,s.y,plural(s.s,"Season"),s.g].forEach((v,k)=>$("m").children[k].textContent=v);
  const r=$("er");r.innerHTML="";
  s.e.forEach((n,k)=>{
    const b=document.createElement("button");b.className="ep";
    b.innerHTML="<i><em></em></i><b></b><small></small>";
    b.firstChild.style.background=tile((s.h+k*14)%360);
    if(k===1)b.querySelector("em").style.width="40%";
    b.querySelector("b").textContent=(k+1)+". "+n;
    b.querySelector("small").textContent=(41+(k*5+i*3)%14)+" min";
    b.onclick=()=>play(epOpts(s,k));
    r.appendChild(b);
  });
  document.title=s.t+" – Series";
  document.querySelectorAll(".c").forEach(c=>c.classList.toggle("cur",+c.dataset.i===i));
  listBtn();
}
function go(i){
  if(i===cur)return;
  const h=$("hero");h.classList.add("swap");
  setTimeout(()=>{render(i);h.classList.remove("swap")},280);
}
function grid(){
  const g=$("g");g.innerHTML="";
  S.forEach((s,i)=>{
    if(filter!=="All"&&s.g!==filter)return;
    const c=document.createElement("button");c.className="c"+(i===cur?" cur":"");c.dataset.i=i;
    c.innerHTML="<span><b></b></span><small></small>";
    c.firstChild.style.background=tile(s.h);
    c.querySelector("b").textContent=s.t;
    c.querySelector("small").textContent=s.g+", "+plural(s.s,"season");
    c.onclick=()=>{go(i);scrollTo({top:0,behavior:"smooth"})};
    g.appendChild(c);
  });
}
["All",...new Set(S.map(s=>s.g))].forEach(n=>{
  const b=document.createElement("button");b.className="f"+(n==="All"?" on":"");b.textContent=n;
  b.onclick=()=>{filter=n;document.querySelectorAll(".f").forEach(x=>x.classList.toggle("on",x===b));grid()};
  $("fs").appendChild(b);
});
$("pb").onclick=()=>play(epOpts(S[cur],0));
$("lb").onclick=()=>{
  sToggle(S[cur]);
  toast(sHas(S[cur])?"Added to My List":"Removed from My List");
  listBtn();
};
grid();render(0);
</script>
</body>
</html>
`,

  /* ==========================================================================
     4. LIBRARY PAGE TEMPLATE
     ========================================================================== */
  cartoons: `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Library</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Poppins:wght@400;500;600;800" rel="stylesheet">
<style>
:root{--primary-azure:#007FFF;--primary-hover:#1EA0FF;--primary-vivid:#33B5FF;--bg-deep-dark:#03080E;--bg-card-dark:#071225;--text-primary:#FFFFFF;--line:#10223F;--mute:#8DA2BD;--font:"Poppins",system-ui,sans-serif;--display:"Oswald","Arial Narrow",sans-serif}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg-deep-dark);color:#fff;font-family:var(--font);min-height:100vh;overflow-x:hidden}
.wrap{padding:96px 5vw 80px;max-width:1500px;margin:0 auto}
.head{display:flex;align-items:flex-end;justify-content:space-between;gap:1.5rem;flex-wrap:wrap}
.eyebrow{font-family:var(--display);letter-spacing:.34em;font-size:.78rem;color:var(--primary-vivid);margin-bottom:.4rem}
h1{font-family:var(--display);font-weight:700;font-size:clamp(2.6rem,6vw,4.6rem);letter-spacing:.04em;text-transform:uppercase;line-height:1}
.sub{margin-top:.7rem;color:var(--mute);font-size:.9rem}
.tools{display:flex;gap:.7rem;flex-wrap:wrap}
.search{display:flex;align-items:center;gap:.6rem;background:var(--bg-card-dark);border:1px solid var(--line);border-radius:999px;padding:0 16px;height:44px;min-width:min(280px,100%);transition:border-color .2s,box-shadow .2s}
.search:focus-within{border-color:var(--primary-azure);box-shadow:0 0 0 3px rgba(0,127,255,.25)}
.search svg{width:18px;height:18px;fill:none;stroke:var(--mute);stroke-width:2;stroke-linecap:round}
.search input{flex:1;background:none;border:0;outline:none;color:#fff;font:400 .9rem var(--font);min-width:0}
select{height:44px;background:var(--bg-card-dark);color:#fff;border:1px solid var(--line);border-radius:999px;padding:0 16px;font:500 .85rem var(--font);cursor:pointer}
select:focus-visible{outline:2px solid var(--primary-azure)}
.filters{display:flex;align-items:center;gap:1rem;flex-wrap:wrap;margin:2rem 0 1.6rem}
.seg{display:inline-flex;background:var(--bg-card-dark);border:1px solid var(--line);border-radius:999px;padding:4px}
.seg button,.chip{border:0;background:none;color:var(--mute);font:500 .82rem var(--font);padding:8px 16px;border-radius:999px;cursor:pointer;transition:background .2s,color .2s}
.seg button:hover,.chip:hover{color:#fff}
.seg button.on{background:var(--primary-azure);color:#fff;box-shadow:0 4px 14px rgba(0,127,255,.4)}
.chips{display:flex;gap:.5rem;flex-wrap:wrap}
.chip{border:1px solid var(--line);background:var(--bg-card-dark)}
.chip.on{border-color:var(--primary-vivid);color:#fff;background:rgba(51,181,255,.14)}
button:focus-visible{outline:2px solid var(--primary-vivid);outline-offset:2px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(176px,1fr));gap:1.7rem 1.2rem}
.item{position:relative;animation:rise .5s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--n)*35ms)}
@keyframes rise{from{opacity:0;transform:translateY(18px)}}
.card{display:block;width:100%;text-align:left;background:none;border:0;color:#fff;cursor:pointer;font-family:var(--font)}
.poster{position:relative;display:block;aspect-ratio:2/3;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.12);box-shadow:0 10px 26px rgba(0,0,0,.5);transition:transform .3s cubic-bezier(.2,.8,.2,1),box-shadow .3s,border-color .3s}
.poster::before{content:"";position:absolute;width:130%;aspect-ratio:1;border-radius:50%;right:-55%;top:-25%;background:rgba(255,255,255,.12)}
.poster::after{content:attr(data-l);position:absolute;left:12%;bottom:-6%;font:700 7.5rem/1 var(--display);color:rgba(255,255,255,.2);text-shadow:0 6px 30px rgba(0,0,0,.35)}
.card:hover .poster,.card:focus-visible .poster{transform:translateY(-8px) scale(1.02);border-color:var(--primary-vivid);box-shadow:0 18px 36px rgba(0,127,255,.28)}
.bd{position:absolute;z-index:2;font:600 .62rem var(--font);letter-spacing:.06em;padding:3px 8px;border-radius:6px;font-style:normal;background:rgba(3,8,14,.78);border:1px solid rgba(255,255,255,.18)}
.age{left:8px;top:8px}.typ{left:8px;bottom:8px;color:var(--primary-vivid)}
.nm{display:block;margin-top:.8rem;font-weight:600;font-size:.95rem;line-height:1.25}
.mt{display:block;margin-top:.15rem;color:var(--mute);font-size:.76rem}
.rt{display:flex;align-items:center;gap:.4rem;margin-top:.35rem;font-size:.76rem;font-weight:600;color:var(--primary-vivid)}
.st{display:inline-flex;gap:2px}.st svg{width:13px;height:13px;fill:var(--primary-vivid)}.st svg.off{fill:#12304F}
.add{position:absolute;right:8px;top:8px;z-index:3;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.3);background:rgba(3,8,14,.78);color:#fff;font-size:1.1rem;line-height:1;cursor:pointer;opacity:0;transform:scale(.8);transition:opacity .2s,transform .2s,background .2s}
.item:hover .add,.add:focus-visible,.add.in{opacity:1;transform:none}
.add:hover{background:var(--primary-azure)}.add.in{background:var(--primary-azure);border-color:var(--primary-azure)}
@media(hover:none){.add{opacity:1;transform:none}}
.none{text-align:center;color:var(--mute);padding:4rem 0}
/* detail modal */
.md{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:4vh 4vw;background:rgba(1,4,8,.78);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);opacity:0;transition:opacity .22s}
.md[hidden]{display:none}.md.open{opacity:1}
.panel{position:relative;width:min(920px,100%);max-height:92vh;overflow:auto;background:var(--bg-card-dark);border:1px solid var(--line);border-radius:22px;box-shadow:0 30px 80px rgba(0,0,0,.7);transform:translateY(22px) scale(.97);transition:transform .3s cubic-bezier(.2,.8,.2,1)}
.md.open .panel{transform:none}
.ban{position:relative;height:clamp(190px,32vh,280px);display:flex;align-items:flex-end;padding:1.6rem 2rem}
.ban::after{content:"";position:absolute;inset:auto 0 0;height:70%;background:linear-gradient(180deg,transparent,var(--bg-card-dark))}
.ban>div{position:relative;z-index:1}
.ban h2{font-family:var(--display);font-size:clamp(1.8rem,4.5vw,3rem);letter-spacing:.04em;text-transform:uppercase;line-height:1.05}
.ban p{color:var(--primary-vivid);font-style:italic;margin-top:.3rem;font-size:.92rem}
.x{position:absolute;top:14px;right:14px;z-index:5;width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:rgba(3,8,14,.7);color:#fff;font-size:1.4rem;line-height:1;cursor:pointer}
.x:hover{background:var(--primary-azure)}
.body{padding:.4rem 2rem 2rem;display:grid;grid-template-columns:1.5fr 1fr;gap:1.6rem 2.4rem}
.facts{grid-column:1/-1;display:flex;flex-wrap:wrap;align-items:center;gap:.6rem 1rem;font-size:.82rem;color:var(--mute)}
.facts b{color:#fff;border:1px solid rgba(255,255,255,.3);border-radius:5px;padding:1px 8px;font-weight:600}
.btns{grid-column:1/-1;display:flex;gap:.7rem;flex-wrap:wrap}
.btn{border:0;border-radius:10px;padding:13px 30px;font:600 .88rem var(--font);color:#fff;cursor:pointer;display:inline-flex;align-items:center;gap:.5rem;transition:filter .2s,transform .2s}
.btn svg{width:18px;height:18px;fill:currentColor}
.btn:hover{filter:brightness(1.15);transform:translateY(-1px)}
.btn.p{background:var(--primary-azure);box-shadow:0 8px 22px rgba(0,127,255,.4)}.btn.s{background:#10223F;border:1px solid #1d3a63}.btn.s.in{background:#0b3a7a;border-color:var(--primary-vivid)}
.desc{line-height:1.7;font-size:.92rem;color:#dce9f7}
.tags{display:flex;gap:.4rem;flex-wrap:wrap;margin-top:1rem}
.tags span{font-size:.75rem;padding:4px 12px;border-radius:999px;border:1px solid var(--line);color:var(--primary-vivid)}
h3{font-size:.72rem;letter-spacing:.2em;color:var(--mute);margin:0 0 .8rem;font-weight:600}
.cast div{display:flex;justify-content:space-between;gap:1rem;padding:9px 0;border-bottom:1px solid var(--line);font-size:.86rem}
.cast small{color:var(--mute)}
.eps{grid-column:1/-1}
.ep{display:grid;grid-template-columns:34px 1fr auto;align-items:center;gap:1rem;width:100%;text-align:left;background:none;border:0;border-bottom:1px solid var(--line);color:#fff;padding:13px 6px;font:500 .9rem var(--font);cursor:pointer;transition:background .2s}
.ep:hover{background:rgba(0,127,255,.1)}.ep b{color:var(--primary-vivid)}.ep small{color:var(--mute)}
.info div{display:flex;justify-content:space-between;gap:1rem;padding:9px 0;border-bottom:1px solid var(--line);font-size:.86rem}.info small{color:var(--mute)}
.toast{position:fixed;bottom:26px;left:50%;transform:translate(-50%,40px);background:#10223F;border:1px solid #1d3a63;padding:12px 22px;border-radius:999px;font-size:.85rem;opacity:0;transition:all .3s;z-index:90;pointer-events:none}
.toast.show{opacity:1;transform:translate(-50%,0)}
.tabs{display:flex;gap:.8rem;overflow-x:auto;padding:10px 8px 12px;margin:1.6rem -8px 0;scrollbar-width:none}.tabs::-webkit-scrollbar{display:none}
.tab{flex:none;display:inline-flex;align-items:center;gap:.7rem;height:56px;padding:0 22px;border-radius:18px;border:1px solid #14233b;background:#0b1626;color:#dce9f7;font:600 .95rem var(--font);cursor:pointer;transition:transform .2s,border-color .2s,background .2s,box-shadow .2s}
.tab svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.tab .n{min-width:30px;height:26px;padding:0 10px;border-radius:999px;background:#16263d;font-size:.82rem;display:grid;place-items:center}
.tab:hover{border-color:#25456f;transform:translateY(-1px)}
.tab.on{background:var(--primary-vivid);border-color:#8fd8ff;color:#03080E;box-shadow:inset 0 0 0 2px rgba(3,8,14,.3),0 0 0 3px var(--bg-deep-dark),0 0 0 5px var(--primary-vivid)}
.tab.on .n{background:rgba(3,8,14,.3);color:#03080E}
.filters{margin-top:1.2rem}
.pg{position:absolute;left:0;right:0;bottom:0;height:5px;background:rgba(255,255,255,.3);z-index:2}.pg b{display:block;height:100%;background:var(--primary-azure);box-shadow:0 0 10px rgba(0,127,255,.8)}
.bd.ok{left:auto;right:8px;bottom:12px;color:#7dffb2}
@media(max-width:760px){.tab{height:50px;padding:0 16px;font-size:.88rem}.body{grid-template-columns:1fr;padding:.4rem 1.2rem 1.6rem}.ban{padding:1.2rem}.grid{grid-template-columns:repeat(auto-fill,minmax(148px,1fr))}.poster::after{font-size:6rem}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style></head>
<body>
<main class="wrap">
  <header class="head">
    <div><p class="eyebrow">LIBRARY</p><h1>Library</h1><p class="sub"><span id="count"></span> &middot; for every age</p></div>
    <div class="tools">
      <label class="search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input id="q" type="search" placeholder="Search library..." aria-label="Search library"></label>
      <select id="sort" aria-label="Sort"><option value="featured">Featured</option><option value="top">Top rated</option><option value="new">Newest</option><option value="az">A to Z</option></select>
    </div>
  </header>
  <nav class="tabs" id="tabs" role="tablist" aria-label="My library"></nav>
  <div class="filters"><div class="seg" id="seg" role="group" aria-label="Type"></div><div class="chips" id="chips" role="group" aria-label="Genre"></div></div>
  <section class="grid" id="grid" aria-live="polite"></section>
  <p class="none" id="none" hidden>Nothing in the library matches your search.</p>
</main>
<div class="md" id="md" hidden><div class="panel" role="dialog" aria-modal="true" aria-labelledby="mT">
  <button class="x" id="mClose" aria-label="Close">&times;</button>
  <div class="ban" id="mBan"><div><h2 id="mT"></h2><p id="mTag"></p></div></div>
  <div class="body">
    <div class="facts" id="mFacts"></div>
    <div class="btns"><button class="btn p" id="mPlay"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg><span id="mPlayLb">Play</span></button><button class="btn s" id="mList">+ My List</button></div>
    <div><p class="desc" id="mDesc"></p><div class="tags" id="mTags"></div></div>
    <div><h3>CAST</h3><div class="cast" id="mCast"></div><div class="info" id="mInfo"></div></div>
    <div class="eps" id="mEpsWrap"><h3>EPISODES</h3><div id="mEps"></div></div>
  </div>
</div></div>
<div class="toast" id="toast" role="status"></div>
<script>
/* Shared catalogue payload injected by the parent page (window.__CONTINUUM_CATALOGUE__). */
const __CAT = (function(){ try { return parent.__CONTINUUM_CATALOGUE__ || null; } catch(e){ return null; } })();
function __buildCat(cat){
  const out=[], vids=cat.videos||[], discs=cat.disciplines||[];
  /* Group by series_id (Library) */
  discs.forEach(d=>{
    const vs=vids.filter(v=>(v.series_id===d.id||v.discipline_id===d.id)&&!v.clip);
    if(!vs.length)return;
    out.push({t:d.title,tag:String(d.goal||"Continuum Masterclass"),type:"Series",y:"",age:"",g:[d.title],se:1,ep:vs.length,len:(Math.round(vs.reduce((a,v)=>a+(v.minutes||0),0)/vs.length)||30)+" min",r:+(vs.reduce((a,v)=>a+v.rating,0)/vs.length).toFixed(1),studio:"Continuum Academy",h:d.hue,d:d.blurb||"",cast:[],eps:vs.map(v=>v.title),vids:vs});
  });
  /* Highlight clips still shown as individual items */
  vids.filter(v=>v.clip).forEach(v=>{
    out.push({t:v.title,tag:String(v.tag||"Highlight Clip"),type:"Movie",y:"",age:"",g:[v.discipline||v.genre||"Clip"],se:0,ep:0,len:v.time||"30 min",r:v.rating,studio:"Continuum Academy",h:v.hue,d:v.desc,cast:[],eps:[],vids:[v]});
  });
  /* Videos without series_id shown by discipline as fallback */
  const byG={};
  vids.filter(v=>!v.clip&&!discs.some(d=>d.id===v.series_id||d.id===v.discipline_id)).forEach(v=>{const g=v.discipline||v.genre||"Masterclass";(byG[g]=byG[g]||[]).push(v)});
  Object.keys(byG).forEach(g=>{
    const vs=byG[g];
    out.push({t:g,tag:"Continuum Masterclass",type:"Series",y:"",age:"",g:[g],se:1,ep:vs.length,len:(Math.round(vs.reduce((a,v)=>a+(v.minutes||0),0)/vs.length)||30)+" min",r:+(vs.reduce((a,v)=>a+v.rating,0)/vs.length).toFixed(1),studio:"Continuum Academy",h:vs[0].hue,d:"",cast:[],eps:vs.map(v=>v.title),vids:vs});
  });
  return out;
}
const CARTOONS=((__CAT && __CAT.videos && __CAT.videos.length) ? __buildCat(__CAT) : [{"t":"Pip & the Lantern Kingdom","tag":"Light the way home.","type":"Series","y":2023,"age":"TV-Y7","g":["Adventure","Fantasy"],"se":2,"ep":26,"len":"24 min","r":4.8,"studio":"Little Ember Studio","h":38,"d":"A tiny firefly named Pip discovers that every lantern in the Lantern Kingdom is going dark, one by one. With a grumpy moth and a very brave snail, Pip sets out to relight the realm before the long night falls.","cast":[["Pip","Mara Ellis"],["Mothra Grumbles","Dev Okafor"],["Sir Shell","Lena Park"]],"eps":["The First Flicker","The Moth Who Hated Night","Snail Mail","The Glass Bridge","Hush of the Dark Wood"]},{"t":"Captain Marshmallow","tag":"Soft on the outside. Brave on the inside.","type":"Series","y":2022,"age":"TV-Y7","g":["Comedy","Action"],"se":3,"ep":39,"len":"22 min","r":4.5,"studio":"Fluff & Thunder","h":330,"d":"When the Candy Coast is threatened by the sour pirates of Lemon Bay, a squishy captain and his crew of snack-sized heroes sail into action, and usually get stuck to the deck.","cast":[["Captain Marshmallow","Theo Brandt"],["First Mate Gummi","Aya Nishida"],["Dr. Crunch","Omar Haddad"]],"eps":["Sail of the Century","Lemon Bay Blues","The Great Sprinkle Heist","Storm in a Teacup"]},{"t":"The Cloud Bakery","tag":"Every loaf has a little sky in it.","type":"Series","y":2024,"age":"TV-Y","g":["Family","Comedy"],"se":1,"ep":13,"len":"11 min","r":4.7,"studio":"Pillow Pictures","h":200,"d":"Nimbus the baker and her sleepy cloud-pup deliver warm bread to the villages below, and learn that kindness is the secret ingredient in every recipe.","cast":[["Nimbus","Ivy Castellano"],["Pudge the Cloud-Pup","Noah Reyes"],["Old Mr. Gale","Hugo Lindqvist"]],"eps":["Sunrise Sourdough","The Rainy Day Roll","Wind Delivery","Snowflake Surprise"]},{"t":"Robo Rascals","tag":"Charged up and out of control.","type":"Series","y":2021,"age":"TV-Y7","g":["Sci-Fi","Comedy"],"se":4,"ep":52,"len":"22 min","r":4.4,"studio":"Gearbox Animation","h":190,"d":"Four mischievous maintenance bots on a space station keep breaking things while trying to fix them, and keep saving everyone by accident.","cast":[["Bolt","Jonah Pierce"],["Nutsy","Kira Dolan"],["Zed","Sam Adeyemi"]],"eps":["Loose Screws","Beep Beep Boom","The Vacuum Incident","Zero-G Birthday"]},{"t":"Moonlit Mischief","tag":"Some secrets only wake at night.","type":"Movie","y":2025,"age":"TV-G","g":["Fantasy","Mystery"],"len":"1h 28m","r":4.6,"studio":"Silver Paper Films","director":"Ana Valdez","h":265,"d":"On the night of a rare blue moon, a curious girl follows a trail of glowing paw prints into a hidden world where all of the city's lost things are kept.","cast":[["Luna","Elsie Marlowe"],["Mister Whisk","Callum Reyes"],["The Keeper","Priya Nair"]]},{"t":"Tiny Tides","tag":"Big adventures in small pools.","type":"Series","y":2020,"age":"TV-Y","g":["Adventure","Family"],"se":2,"ep":26,"len":"11 min","r":4.3,"studio":"Pebble & Pearl","h":175,"d":"Life in a tide pool is anything but quiet. A crab, a starfish, and a shy seahorse explore the wide world one wave at a time.","cast":[["Clem the Crab","Ben Okoro"],["Stella","Hana Kimura"],["Sky the Seahorse","Mei Tan"]],"eps":["Low Tide, High Hopes","The Great Shell Swap","Moonlight Swim","Message in a Bottle"]},{"t":"Dino Diner","tag":"Prehistoric food, modern chaos.","type":"Series","y":2023,"age":"TV-Y","g":["Comedy","Family"],"se":2,"ep":26,"len":"11 min","r":4.2,"studio":"Rocky Road Studio","h":25,"d":"Rex runs the only diner in Pebble Valley. Every dinosaur has an opinion about the menu, and none of them can fit through the door.","cast":[["Rex","Barry Quill"],["Trixie","Dani Moreau"],["Stego","Luis Ferrer"]],"eps":["Lunch Rush","The Tiny Table","Egg Special","Meteor Monday"]},{"t":"Skyfarers of Nimbus","tag":"The sky is the only map.","type":"Series","y":2024,"age":"TV-PG","g":["Adventure","Sci-Fi"],"se":2,"ep":20,"len":"26 min","r":4.9,"studio":"Aurora Works","h":215,"d":"In a world of floating islands, a young mapmaker joins an airship crew in search of the legendary island that holds the sky together.","cast":[["Wren","Tessa Holloway"],["Captain Orrin","Marcus Bell"],["Juno","Camille Dufour"]],"eps":["Cast Off","The Map That Moves","Storm Gate","Island of Echoes","The Keystone"]},{"t":"The Paper Dragon","tag":"Fold. Wish. Fly.","type":"Movie","y":2022,"age":"TV-PG","g":["Fantasy","Drama"],"len":"1h 42m","r":4.8,"studio":"Origami Lane","director":"Mika Sato","h":12,"d":"A lonely boy folds a paper dragon from his late grandfather's letters. When it comes alive, they must cross three kingdoms before the last page crumbles.","cast":[["Kenji","Ryo Takeda"],["Ember the Dragon","Sasha Volkov"],["Grandfather","Hiroshi Mori"]]},{"t":"Detective Doodle","tag":"Every clue leaves a mark.","type":"Series","y":2022,"age":"TV-Y7","g":["Mystery","Comedy"],"se":3,"ep":36,"len":"22 min","r":4.5,"studio":"Inkwell Pictures","h":300,"d":"A pencil-drawn detective can erase and redraw anything, which makes solving crimes easy and keeping them solved very hard.","cast":[["Doodle","Felix Aranda"],["Inspector Eraser","Nadia Ross"],["Penny","Lola Brightman"]],"eps":["The Missing Margin","Smudge","Case of the Blank Page","Red Pen Rising"]},{"t":"Starlight Academy","tag":"Magic is a team sport.","type":"Series","y":2025,"age":"TV-G","g":["Fantasy","Family"],"se":1,"ep":12,"len":"24 min","r":4.6,"studio":"Moonbeam Studio","h":280,"d":"Five first-year students at a school in the clouds learn spellcasting, friendship, and why you should never feed a comet after midnight.","cast":[["Nova","Zara Whitfield"],["Pocket","Eli Navarro"],["Professor Quill","Margaret Obi"]],"eps":["Orientation Day","The Comet Problem","Broomstick Blues","Midterm Magic"]},{"t":"Turbo Turtles","tag":"Slow and steady? Not today.","type":"Series","y":2021,"age":"TV-Y7","g":["Action","Comedy"],"se":3,"ep":39,"len":"22 min","r":4.1,"studio":"Shellshock Media","h":135,"d":"Four racing turtles protect Sandy Bay from a gang of speed-obsessed hares, with questionable stunts and a lot of snacks.","cast":[["Rocket","Andre Mills"],["Zippy","Sora Ito"],["Big Shell","Tomas Vega"]],"eps":["Ready, Set, Slow","The Hare Gang","Snack Attack","Photo Finish"]},{"t":"Orchard Spirits","tag":"Where the apples remember.","type":"Movie","y":2023,"age":"TV-G","g":["Fantasy","Family"],"len":"1h 35m","r":4.7,"studio":"Sunday Light","director":"Elena Rowe","h":95,"d":"Every autumn, the spirits of an old orchard wake to guard the last harvest. One summer, a city kid arrives and accidentally wakes them early.","cast":[["Wren","Ada Lindgren"],["Old Bough","Pete Sorensen"],["Blossom","Ayo Bankole"]]},{"t":"Galaxy Grandpa","tag":"Retired. Not tired.","type":"Series","y":2024,"age":"TV-PG","g":["Sci-Fi","Comedy"],"se":2,"ep":22,"len":"24 min","r":4.4,"studio":"Nebula Nine","h":245,"d":"A retired starship captain moves in with his grandkids, and the galaxy keeps calling him back for just one more mission.","cast":[["Grandpa Cosmo","Walter Briggs"],["Mia","Tali Okonkwo"],["Beep","Jun Park"]],"eps":["One Last Flight","Moon Dust Allergy","The Garage Warp","Family Dinner at Mach 5"]}]);
const $=id=>document.getElementById(id);
const KEY="continuum.favorites";let list=[];try{list=JSON.parse(localStorage.getItem(KEY))||[]}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(list))}catch(e){}};
const norm=s=>String(s).trim().toLowerCase();
const favIdsOf=c=>c.vids?c.vids.map(v=>v.id||v.title).filter(Boolean):[(c.id||c.t)];
const hasC=c=>{const ids=favIdsOf(c);return ids.length>0&&ids.every(id=>list.includes(id))};
const poster=h=>"linear-gradient(160deg,hsl("+h+",60%,44%),hsl("+((h+35)%360)+",62%,10%))";
const banner=h=>"radial-gradient(circle at 78% 18%,hsla("+h+",85%,60%,.55),transparent 55%),linear-gradient(135deg,hsl("+h+",50%,24%),#071225)";
const STAR='<svg viewBox="0 0 24 24"><path d="M12 2l3 7 7.5.6-5.7 4.9 1.8 7.3L12 17.8 5.4 21.8l1.8-7.3L1.5 9.6 9 9z"/></svg>';
const stars=r=>[1,2,3,4,5].map(n=>n<=Math.round(r)?STAR:STAR.replace("<svg","<svg class=\\"off\\"")).join("");
const meta=c=>c.type==="Series"?c.se+" Season"+(c.se>1?"s":"")+" \\u00B7 "+c.ep+" eps":c.len;
let tt;const toast=m=>{const e=$("toast");e.textContent=m;e.classList.add("show");clearTimeout(tt);tt=setTimeout(()=>e.classList.remove("show"),2200)};
const play=o=>{try{parent.NFPlay(o)}catch(e){toast("Playing \\""+o.title+"\\"...")}};
const epOpts=(c,k)=>{const v=(c.vids&&c.vids[k])||null,nm=v?v.title:c.eps[k];return{title:nm,sub:c.t+" \u00B7 "+nm,bg:poster(c.h),dur:v&&v.time||c.len,key:c.t+" S1E"+(k+1),id:v&&v.id||null,video:v&&v.video||"",next:k+1<c.eps.length?epOpts(c,k+1):null,onClose:refresh}};
const st={type:"All",genre:"All",q:"",sort:"featured",tab:"all"};
const rl=k=>{try{return JSON.parse(localStorage.getItem(k))||[]}catch(e){return[]}};
let U={cw:{},done:new Set(),hist:new Set()};
function readU(){
  list=rl(KEY);
  const cw=rl("continueWatching"),done=rl("completedTitles").map(norm),hist=rl("watchHistory").map(norm);
  U.cw={};cw.forEach(e=>CARTOONS.forEach(c=>{if(e.title===c.t||String(e.title).startsWith(c.t+" S1E")){const p=U.cw[c.t];if(!p||e.at>p.at)U.cw[c.t]=e}}));
  U.done=new Set(done);U.hist=new Set([...hist,...done,...Object.keys(U.cw).map(norm)]);
  const pm=rl("continuum.progress");
  CARTOONS.forEach(c=>{const ids=favIdsOf(c);let best=null,doneAll=ids.length>0;
    ids.forEach(id=>{const p=pm[id];if(!p)return;
      if(!p.completed&&p.position>10){const e={title:c.t,sec:Math.floor(p.position||0),total:Math.floor(p.duration||((c.vids&&c.vids[0]&&c.vids[0].minutes||30)*60)),at:p.updated_at?Date.parse(p.updated_at)||0:0};if(!best||e.at>best.at)best=e}
      if(!p.completed)doneAll=false});
    if(best){const ex=U.cw[c.t];if(!ex||best.at>ex.at)U.cw[c.t]=best}
    if(doneAll){U.done.add(norm(c.t));U.hist.add(norm(c.t))}});
}
const refresh=()=>{readU();render()};
const IC={all:'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
 cw:'<svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z"/></svg>',
 done:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16 9.5"/></svg>',
 saved:'<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>',
 hist:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'};
const TABS=[["all","All",IC.all,c=>true],["cw","Continue Watching",IC.cw,c=>!!U.cw[c.t]],["done","Completed",IC.done,c=>U.done.has(norm(c.t))],["saved","Saved Watchlist",IC.saved,c=>hasC(c)],["hist","All Watch History",IC.hist,c=>U.hist.has(norm(c.t))]];
const EMPTY={cw:"Nothing in progress yet. Press Play on a title and stop halfway, and it will wait for you here.",done:"No finished titles yet. Watch one to the end and it will show up here.",saved:"Your watchlist is empty. Tap the + on any title to save it.",hist:"Your watch history will appear here once you start watching."};
const tm=s=>{s=Math.max(0,Math.floor(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60,p=n=>String(n).padStart(2,"0");return h?h+":"+p(m)+":"+p(x):m+":"+p(x)};
function drawTabs(){
  const w=$("tabs");if(!w)return;
  if(!w.children.length)TABS.forEach(t=>{const b=document.createElement("button");b.type="button";b.className="tab";b.id="lib-tab-"+t[0];b.setAttribute("role","tab");b.setAttribute("aria-controls","grid");b.innerHTML=t[2]+'<span class="l"></span><span class="n"></span>';b.querySelector(".l").textContent=t[1];b.onclick=()=>{st.tab=t[0];render()};w.appendChild(b)});
  [...w.children].forEach((b,i)=>{const t=TABS[i],on=st.tab===t[0];b.classList.toggle("on",on);b.setAttribute("aria-selected",String(on));b.tabIndex=on?0:-1;b.querySelector(".n").textContent=CARTOONS.filter(t[3]).length;b.onkeydown=e=>{let n=i;if(e.key==="ArrowRight")n=(i+1)%TABS.length;else if(e.key==="ArrowLeft")n=(i-1+TABS.length)%TABS.length;else if(e.key==="Home")n=0;else if(e.key==="End")n=TABS.length-1;else return;e.preventDefault();w.children[n].click();w.children[n].focus()}});
  $("grid").setAttribute("role","tabpanel");
  $("grid").setAttribute("aria-labelledby", "lib-tab-"+st.tab);
}
readU();
/* filters */
[["All","All"],["Series","Series"],["Movie","Movies"]].forEach(([v,l])=>{const b=document.createElement("button");b.type="button";b.textContent=l;b.className=v==="All"?"on":"";b.setAttribute("aria-pressed",String(v==="All"));b.onclick=()=>{st.type=v;[...$("seg").children].forEach(x=>{x.classList.toggle("on",x===b);x.setAttribute("aria-pressed",String(x===b))});render()};$("seg").appendChild(b)});
["All",...[...new Set(CARTOONS.flatMap(c=>c.g))].sort()].forEach(g=>{const b=document.createElement("button");b.type="button";b.className="chip"+(g==="All"?" on":"");b.textContent=g;b.setAttribute("aria-pressed",String(g==="All"));b.onclick=()=>{st.genre=g;[...$("chips").children].forEach(x=>{x.classList.toggle("on",x===b);x.setAttribute("aria-pressed",String(x===b))});render()};$("chips").appendChild(b)});
$("q").oninput=e=>{st.q=norm(e.target.value);render()};
$("sort").onchange=e=>{st.sort=e.target.value;render()};
/* list toggle */
function toggle(c){const ids=favIdsOf(c),all=ids.length>0&&ids.every(id=>list.includes(id));ids.forEach(id=>{const i=list.findIndex(x=>norm(x)===norm(id));if(all&&i>=0)list.splice(i,1);else if(!all&&i<0)list.push(id)});save();if(st.tab==="saved")render();else sync()}
function sync(){drawTabs();document.querySelectorAll(".add").forEach(b=>{const c=CARTOONS[+b.dataset.i];if(!c)return;const on=hasC(c),title=c.t;b.classList.toggle("in",on);b.textContent=on?"\u2713":"+";b.setAttribute("aria-pressed",String(on));b.setAttribute("aria-label",(on?"Remove ":"Add ")+title+(on?" from":" to")+" My List")});if(!$("md").hidden){const on=hasC(CARTOONS[cur]);$("mList").textContent=on?"\u2713 In My List":"+ My List";$("mList").classList.toggle("in",on);$("mList").setAttribute("aria-pressed",String(on))}}
/* grid */
function render(){
  let L=CARTOONS.map((c,i)=>({c,i})).filter(({c})=>TABS.find(t=>t[0]===st.tab)[3](c)&&(st.type==="All"||c.type===st.type)&&(st.genre==="All"||c.g.includes(st.genre))&&(!st.q||(c.t+" "+c.g.join(" ")+" "+c.d+" "+c.cast.map(x=>x[0]).join(" ")).toLowerCase().includes(st.q)));
  if(st.sort==="az")L.sort((a,b)=>a.c.t.localeCompare(b.c.t));else if(st.sort==="new")L.sort((a,b)=>b.c.y-a.c.y);else if(st.sort==="top")L.sort((a,b)=>b.c.r-a.c.r);
  if(st.tab==="cw")L.sort((a,b)=>U.cw[b.c.t].at-U.cw[a.c.t].at);
  const g=$("grid");g.innerHTML="";
  L.forEach(({c,i},n)=>{
    const it=document.createElement("div");it.className="item";it.style.setProperty("--n",Math.min(n,14));
    it.innerHTML='<button class="card"><span class="poster"><i class="bd age"></i><i class="bd typ"></i></span><span class="nm"></span><span class="mt"></span><span class="rt"><span class="st"></span><span></span></span></button><button class="add"></button>';
    const p=it.querySelector(".poster");p.style.background=poster(c.h);p.dataset.l=c.t.replace(/^(The|A)\\s+/i,"").charAt(0).toUpperCase();
    it.querySelector(".age").textContent=c.age;it.querySelector(".typ").textContent=c.type==="Movie"?"MOVIE":"SERIES";
    it.querySelector(".nm").textContent=c.t;it.querySelector(".mt").textContent=c.y+" \\u00B7 "+meta(c);
    const ce=U.cw[c.t];
    if(st.tab==="cw"&&ce){it.querySelector(".mt").textContent="Resume at "+tm(ce.sec)+" \\u00B7 "+tm(ce.total-ce.sec)+" left";p.insertAdjacentHTML("beforeend",'<i class="pg"><b style="width:'+Math.round(ce.sec/ce.total*100)+'%"></b></i>')}
    if(st.tab==="done")p.insertAdjacentHTML("beforeend",'<i class="bd ok">\\u2713 Watched</i>');
    it.querySelector(".st").innerHTML=stars(c.r);it.querySelector(".rt").lastChild.textContent=c.r.toFixed(1);
    it.querySelector(".card").onclick=()=>openM(i);
    const a=it.querySelector(".add");a.dataset.i=i;a.setAttribute("aria-label","Add "+c.t+" to My List");a.onclick=e=>{e.stopPropagation();toggle(c)};
    g.appendChild(it);
  });
  $("none").hidden=!!L.length;$("none").textContent=st.tab!=="all"&&!st.q&&st.genre==="All"&&st.type==="All"?EMPTY[st.tab]:"Nothing in the library matches your search.";$("count").textContent=L.length+(L.length===1?" title":" titles");sync();
}
/* detail modal */
let cur=0,modalTrigger=null;
const row=(a,b)=>{const d=document.createElement("div");const s=document.createElement("span");s.textContent=a;const m=document.createElement("small");m.textContent=b;d.append(s,m);return d};
function openM(i){
  cur=i;const c=CARTOONS[i];
  $("mBan").style.background=banner(c.h);$("mT").textContent=c.t;$("mTag").textContent=c.tag;
  $("mFacts").innerHTML='<span class="st">'+stars(c.r)+'</span><span>'+c.r.toFixed(1)+'</span><span>'+c.y+'</span><b></b><span></span><span></span>';
  const f=$("mFacts").children;f[3].textContent=c.age;f[4].textContent=c.type;f[5].textContent=meta(c);
  $("mDesc").textContent=c.d;$("mTags").innerHTML="";c.g.forEach(g=>{const s=document.createElement("span");s.textContent=g;$("mTags").appendChild(s)});
  $("mCast").innerHTML="";c.cast.forEach(([n,v])=>$("mCast").appendChild(row(n,v)));
  const inf=$("mInfo");inf.innerHTML="";inf.style.marginTop="1rem";
  inf.appendChild(row("Studio",c.studio));if(c.director)inf.appendChild(row("Director",c.director));inf.appendChild(row("Language","English"));
  const ser=c.type==="Series";$("mEpsWrap").hidden=!ser;$("mPlayLb").textContent=ser?"Play S1 E1":"Play";
  if(ser){const w=$("mEps");w.innerHTML="";c.eps.forEach((n,k)=>{const b=document.createElement("button");b.type="button";b.className="ep";b.innerHTML="<b></b><span></span><small></small>";b.children[0].textContent=k+1;b.children[1].textContent=n;b.children[2].textContent=c.len;b.onclick=()=>{closeM();play(epOpts(c,k))};w.appendChild(b)})}
  modalTrigger=document.activeElement;
  $("md").hidden=false;requestAnimationFrame(()=>$("md").classList.add("open"));document.body.style.overflow="hidden";$("mClose").focus();sync();
}
function closeM(){
  const dialog=$("md"),trigger=modalTrigger;
  dialog.classList.remove("open");document.body.style.overflow="";modalTrigger=null;
  setTimeout(()=>{if(!dialog.classList.contains("open")){dialog.hidden=true;if(trigger instanceof HTMLElement)trigger.focus()}},220)
}
$("mClose").onclick=closeM;$("md").addEventListener("click",e=>{if(e.target===$("md"))closeM()});
document.addEventListener("keydown",e=>{
  const dialog=$("md");
  if(dialog.hidden)return;
  if(e.key==="Escape"){e.preventDefault();closeM();return}
  if(e.key!=="Tab")return;
  const focusable=Array.from(dialog.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(el=>el.getClientRects().length);
  const first=focusable[0],last=focusable[focusable.length-1];
  if(!dialog.contains(document.activeElement)){e.preventDefault();first?.focus()}
  else if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}
});
$("mPlay").onclick=()=>{const c=CARTOONS[cur],v0=c.vids&&c.vids[0];closeM();play(c.type==="Series"?epOpts(c,0):{title:v0?v0.title:c.t,sub:v0?(v0.genre||c.g.join(", ")):c.g.join(", "),bg:v0&&v0.bg||poster(c.h),dur:v0&&v0.time||c.len,video:v0&&v0.video||"",id:v0&&v0.id||null,onClose:refresh})};
$("mList").onclick=()=>toggle(CARTOONS[cur]);
render();
</script>
</body></html>
`,

  /* ==========================================================================
     5. MY LIST PAGE TEMPLATE
     ========================================================================== */
  mylist: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>My list</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Poppins:wght@400;500;600;800" rel="stylesheet">
<style>
  :root{--primary-azure:#007FFF;--primary-hover:#1EA0FF;--primary-vivid:#33B5FF;--bg-deep-dark:#03080E;--bg-card-dark:#071225;--text-primary:#FFFFFF; --red:#007FFF; --font:"Poppins",system-ui,sans-serif; --display:"Oswald","Arial Narrow",sans-serif; }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:#000; color:#fff; font-family:var(--font); overflow-x:hidden; }

  /* ---------- STAGE ---------- */
  .stage {
    position:relative; min-height:100vh; overflow:hidden;
    display:grid; grid-template-columns:minmax(300px,31%) 1fr; grid-template-rows:1fr auto;
    padding:0 0 4vh 5vw;
  }

  /* big backdrop on the right, fades into black on its left edge */
  .backdrop {
    position:absolute; top:0; right:0; width:66%; height:82%;
    background:var(--bg); transition:opacity .45s ease;
    -webkit-mask-image:linear-gradient(90deg,transparent 0,#000 40%);
            mask-image:linear-gradient(90deg,transparent 0,#000 40%);
  }
  .backdrop::after { /* soft fade at the bottom */
    content:""; position:absolute; inset:auto 0 0 0; height:40%;
    background:linear-gradient(180deg,transparent,#000);
  }
  .swap .backdrop { opacity:0; }

  /* ---------- LEFT INFO PANEL ---------- */
  .info {
    position:relative; z-index:2; grid-column:1; grid-row:1; align-self:start;
    padding-top:14vh; transition:opacity .35s ease, transform .35s ease;
  }
  .swap .info { opacity:0; transform:translateY(10px); }
  .title {
    font-family:var(--display); font-weight:700; font-size:clamp(2.6rem,5.6vw,5rem);
    line-height:1; letter-spacing:.04em; text-transform:uppercase;
    text-shadow:0 4px 20px rgba(0,0,0,.6);
  }
  .tag { font-family:var(--display); color:var(--red); letter-spacing:.3em; font-size:.8rem; margin-bottom:.4rem; }
  .meta { display:flex; align-items:center; flex-wrap:wrap; gap:1rem; margin:1.8rem 0 2rem; font-size:.8rem; font-weight:600; letter-spacing:.12em; }
  .stars { display:flex; gap:3px; }
  .stars svg { width:15px; height:15px; fill:var(--red); }
  .stars svg.off { fill:#0F2A4D; }
  .desc { font-size:.82rem; line-height:1.65; letter-spacing:.06em; max-width:46ch; color:#e8e8e8; }

  .actions { display:flex; margin-top:2.4rem; }
  .btn {
    border:0; color:#fff; font:600 .78rem var(--font); letter-spacing:.14em; cursor:pointer;
    padding:15px 32px; transition:filter .2s ease;
  }
  .btn:hover, .btn:focus-visible { filter:brightness(1.18); outline:none; }
  .btn:focus-visible { box-shadow:inset 0 0 0 2px #fff; }
  .play { background:var(--red); border-radius:6px 0 0 6px; min-width:130px; }
  .list { background:#7a7a7a; border-radius:0 6px 6px 0; min-width:130px; }
  .list.saved { background:#3d3d3d; }

  /* ---------- CAROUSEL ---------- */
  .carousel {
    position:relative; z-index:2; grid-column:2; grid-row:1; align-self:end;
    height:clamp(200px,25vw,290px); margin-bottom:3vh; overflow:hidden;
  }
  .strip { display:flex; align-items:center; gap:1.3rem; height:100%; transition:transform .5s cubic-bezier(.3,.7,.2,1); will-change:transform; }
  .card {
    position:relative; flex:none; overflow:hidden; border:3px solid rgba(255,255,255,.65);
    border-radius:16px; background:#111; cursor:pointer; padding:0; color:#fff;
    transition:width .5s cubic-bezier(.3,.7,.2,1), height .5s cubic-bezier(.3,.7,.2,1), border-color .3s ease;
  }
  .card.active { border-color:#fff; }
  .card:focus-visible { outline:3px solid var(--red); outline-offset:3px; }
  .card span {
    position:absolute; left:0; right:0; bottom:16px; text-align:center; padding:0 8px;
    font-family:var(--display); font-weight:700; letter-spacing:.12em; font-size:.85rem;
    text-shadow:0 2px 10px rgba(0,0,0,.8); text-transform:uppercase;
  }

  /* ---------- ARROWS ---------- */
  .arrows { grid-column:2; grid-row:2; display:flex; justify-content:flex-end; gap:3.2rem; padding-right:9vw; position:relative; z-index:2; }
  .arrow {
    width:48px; height:48px; border-radius:50%; border:0; cursor:pointer; display:grid; place-items:center;
    background:#fff; color:var(--red); transition:transform .2s ease, opacity .2s ease;
  }
  .arrow.next { background:var(--red); color:#fff; }
  .arrow:hover { transform:scale(1.1); }
  .arrow:disabled { opacity:.35; cursor:default; transform:none; }
  .arrow:focus-visible { outline:2px solid #fff; outline-offset:3px; }

  /* ---------- TOAST ---------- */
  .toast { position:fixed; bottom:24px; left:50%; transform:translate(-50%,40px); background:#222; padding:12px 22px; border-radius:999px; font-size:.85rem; opacity:0; transition:all .3s ease; z-index:20; }
  .toast.show { opacity:1; transform:translate(-50%,0); }

  /* ---------- MOBILE ---------- */
  @media (max-width:820px) {
    .stage { grid-template-columns:1fr; grid-template-rows:auto auto auto; padding:0 0 4vh 6vw; }
    .backdrop { width:100%; height:55%; opacity:.55; }
    .info { padding-top:9vh; grid-column:1; padding-right:6vw; }
    .carousel { grid-column:1; grid-row:2; margin-top:2.5rem; height:210px; }
    .arrows { grid-column:1; grid-row:3; padding-right:6vw; gap:2rem; }
  }
  @media (prefers-reduced-motion:reduce) { * { transition:none !important; } }

  /* ---------- SMOOTH SHOW / HIDE ---------- */
  .card { transition:width .5s cubic-bezier(.3,.7,.2,1), height .5s cubic-bezier(.3,.7,.2,1), border-color .3s ease, opacity .45s ease, transform .5s cubic-bezier(.3,.7,.2,1), margin .5s ease; }
  .card.enter { opacity:0; transform:translateY(26px) scale(.94); }
  .card { transition:width .5s cubic-bezier(.3,.7,.2,1), height .5s cubic-bezier(.3,.7,.2,1), border-color .3s ease, opacity .45s ease, transform .5s cubic-bezier(.3,.7,.2,1), margin .5s ease, filter .5s ease; }
  .card.leaving { opacity:0; transform:scale(.85); width:0 !important; margin-right:-1.3rem; border-width:0; pointer-events:none; }
  .count b { display:inline-block; transition:transform .3s ease; }
  .count b.pop { transform:scale(1.5); }

  /* ---------- MY LIST EXTRAS ---------- */
  .count { position:absolute; top:3.5vh; left:5vw; z-index:3; font-family:var(--display); letter-spacing:.3em; font-size:.8rem; color:#bbb; }
  .count b { color:var(--red); font-weight:700; }
  .btn.remove { background:#7a7a7a; border-radius:0 6px 6px 0; min-width:130px; }
  .empty { position:absolute; inset:0; z-index:3; display:none; place-items:center; text-align:center; padding:0 8vw; }
  .stage.is-empty .empty { display:grid; }
  .stage.is-empty .info, .stage.is-empty .carousel, .stage.is-empty .arrows, .stage.is-empty .backdrop { visibility:hidden; }
  .empty h2 { font-family:var(--display); font-size:clamp(2rem,5vw,3.4rem); letter-spacing:.06em; text-transform:uppercase; }
  .empty p { margin-top:.8rem; color:#8DA2BD; font-size:.9rem; max-width:44ch; } .stage.is-empty{background:radial-gradient(circle at 50% 42%,rgba(0,127,255,.14),transparent 55%)}
  .es{position:relative;width:min(520px,100%);padding:44px 36px 40px;border-radius:24px;border:1px solid rgba(255,255,255,.1);background:radial-gradient(ellipse at 50% 0,rgba(51,181,255,.2),transparent 65%),linear-gradient(180deg,rgba(16,34,63,.6),rgba(7,18,37,.6));-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:0 30px 80px rgba(0,0,0,.55);display:flex;flex-direction:column;align-items:center;text-align:center;animation:esin .6s cubic-bezier(.2,.8,.2,1) both}
  .es-ic{width:76px;height:76px;border-radius:50%;display:grid;place-items:center;margin-bottom:22px;color:#33B5FF;background:rgba(0,127,255,.15);border:1px solid rgba(51,181,255,.4);box-shadow:0 0 40px rgba(0,127,255,.35);animation:esfloat 4s ease-in-out infinite}
  .es h2{margin:0;font:600 clamp(2rem,4vw,2.6rem)/1.05 var(--display);text-transform:none;letter-spacing:-.01em}
  .es p{margin:.8rem auto 0;max-width:36ch;color:#8DA2BD;font-size:.95rem;line-height:1.7}
  .es-btns{display:flex;flex-wrap:wrap;gap:.7rem;justify-content:center;margin-top:1.8rem}
  .es-btns .browse{margin-top:0}
  .browse.ghost{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18)}
  .browse.ghost:hover{background:rgba(255,255,255,.16);filter:none}
  @keyframes esin{from{opacity:0;transform:translateY(18px) scale(.98)}}
  @keyframes esfloat{50%{transform:translateY(-6px)}}
  @media (prefers-reduced-motion:reduce){.es,.es-ic{animation:none}}
</style>
</head>
<body>

<main class="stage" id="stage">
  <div class="backdrop" id="backdrop"></div>
  <div class="empty"><div class="es"><div class="es-ic"><svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4z"/><path d="M12 7.5v5M9.5 10h5"/></svg></div><h2>Your list is empty</h2><p>Save movies, series and library titles with “+ My List” and they will wait for you here.</p><div class="es-btns"><button class="browse" onclick="try{parent.location.hash='movies'}catch(e){}">Browse disciplines</button><button class="browse ghost" onclick="try{parent.location.hash='series'}catch(e){}">Explore series</button><button class="browse ghost" onclick="try{parent.location.hash='cartoons'}catch(e){}">Open library</button></div></div></div>

  <section class="info">
    <p class="tag" id="tag"></p>
    <h1 class="title" id="title"></h1>
    <div class="meta">
      <span class="stars" id="stars" role="img"></span>
      <span id="meta"></span>
    </div>
    <p class="desc" id="desc"></p>
    <div class="actions">
      <button class="btn play" id="playBtn">Play</button>
      <button class="btn list remove" id="listBtn">− Remove</button>
    </div>
  </section>

  <section class="carousel" aria-label="Movies">
    <div class="strip" id="strip"></div>
  </section>

  <div class="arrows">
    <button class="arrow prev" id="prev" aria-label="Previous movie">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>
    </button>
    <button class="arrow next" id="next" aria-label="Next movie">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>
    </button>
  </div>
</main>

<div class="toast" id="toast"></div>

<script>
/*CATALOG*/
/* Shared catalogue payload injected by the parent page (window.__CONTINUUM_CATALOGUE__). */
const __CAT = (function(){ try { return parent.__CONTINUUM_CATALOGUE__ || null; } catch(e){ return null; } })();
const catalog = ((__CAT && __CAT.videos && __CAT.videos.length) ? __CAT.videos.map(v => ({ title:v.title, tag:String(v.tag || v.genre || "MASTERCLASS").toUpperCase(), year:v.year||"", genre:v.genre||"", time:v.time||"", rating:Math.round(v.rating||0), desc:v.desc||"", poster:v.poster||"", bg:v.bg||"", video:v.video||"", trailer:v.trailer||"", id:v.id, minutes:v.minutes||0 })) : [{"title":"Paper Kites","tag":"FAMILY ANIMATION","year":2022,"genre":"Animation, Comedy","time":"1h 30m","rating":4,"desc":"On the windiest day of the year, a shy girl and her paper kite set off to deliver a message across the whole town.","poster":"linear-gradient(160deg,#35b5aa,#08201f)","bg":"radial-gradient(circle at 60% 35%,rgba(255,255,255,.22),transparent 55%),linear-gradient(160deg,#35b5aa,#08201f)"},{"title":"Nightfall","tag":"A LIGHTHOUSE MYSTERY","year":2023,"genre":"Mystery, Thriller","time":"1h 55m","rating":4,"desc":"A lighthouse keeper discovers that the storm rolling in each night is trying to tell her something, and the answer lies beneath the waves.","poster":"linear-gradient(160deg,#2a5d8f,#06101c)","bg":"radial-gradient(circle at 60% 35%,rgba(255,255,255,.22),transparent 55%),linear-gradient(160deg,#2a5d8f,#06101c)"},{"title":"Ember","tag":"ONE KITCHEN, ONE WEEK","year":2022,"genre":"Comedy, Drama","time":"1h 40m","rating":4,"desc":"Two rival chefs are forced to share one kitchen for a single week, and discover that the hardest thing to cook is trust.","poster":"linear-gradient(160deg,#d9782b,#2a0f06)","bg":"radial-gradient(circle at 60% 35%,rgba(255,255,255,.22),transparent 55%),linear-gradient(160deg,#d9782b,#2a0f06)"},{"title":"Iron Tide","tag":"CHAPTER 2","year":2024,"genre":"Action, Thriller","time":"2h 5m","rating":5,"desc":"A retired courier is pulled back in by an old debt. To settle it, he must cross a city where every rooftop and every harbor is watched.","poster":"linear-gradient(160deg,#59606e,#0a0b0e)","bg":"radial-gradient(circle at 60% 35%,rgba(255,255,255,.22),transparent 55%),linear-gradient(160deg,#59606e,#0a0b0e)"},{"title":"Hollow Pines","tag":"DON'T FOLLOW THE LIGHTS","year":2025,"genre":"Horror, Thriller","time":"1h 48m","rating":5,"desc":"Twenty years after a camping trip went wrong, four friends return to the same forest and find that something there has been waiting for them.","poster":"linear-gradient(160deg,#b52323,#140303)","bg":"radial-gradient(circle at 60% 35%,rgba(255,255,255,.22),transparent 55%),linear-gradient(160deg,#b52323,#140303)"},{"title":"Velvet Road","tag":"A ROAD TRIP LOVE STORY","year":2021,"genre":"Romance, Drama","time":"2h 2m","rating":4,"desc":"A violinist and a long-haul driver share a ride across the country, and slowly learn what each of them left behind.","poster":"linear-gradient(160deg,#c24d86,#1a0714)","bg":"radial-gradient(circle at 60% 35%,rgba(255,255,255,.22),transparent 55%),linear-gradient(160deg,#c24d86,#1a0714)"},{"title":"Starless","tag":"THE LAST VOYAGE","year":2025,"genre":"Sci-Fi, Action","time":"2h 20m","rating":5,"desc":"When the stars begin to disappear one by one, a small crew sets out to find the edge of the map and the reason the sky is going dark.","poster":"linear-gradient(160deg,#5b48c9,#0a0724)","bg":"radial-gradient(circle at 60% 35%,rgba(255,255,255,.22),transparent 55%),linear-gradient(160deg,#5b48c9,#0a0724)"},{"title":"Last Signal","tag":"BASED ON TRUE EVENTS","year":2024,"genre":"Thriller, Mystery","time":"1h 52m","rating":4,"desc":"A radio operator at a remote station picks up a call for help from a place that should be empty, and has one night to find out who is calling.","poster":"linear-gradient(160deg,#c9a62d,#1c1604)","bg":"radial-gradient(circle at 60% 35%,rgba(255,255,255,.22),transparent 55%),linear-gradient(160deg,#c9a62d,#1c1604)"},{"title":"Silent Harbor","tag":"A FAMILY RETURNS","year":2020,"genre":"Drama","time":"2h 10m","rating":4,"desc":"After twenty years away, a fisherman's daughter comes home to a harbor town that has learned to live without answers.","poster":"linear-gradient(160deg,#4d7a8c,#0b161b)","bg":"radial-gradient(circle at 60% 35%,rgba(255,255,255,.22),transparent 55%),linear-gradient(160deg,#4d7a8c,#0b161b)"},{"title":"Neon Run","tag":"ONE NIGHT TO ESCAPE","year":2023,"genre":"Action, Sci-Fi","time":"1h 58m","rating":4,"desc":"A delivery runner in a city of glowing towers is handed a package that every gang in town would burn the streets to get.","poster":"linear-gradient(160deg,#e0359b,#14062a)","bg":"radial-gradient(circle at 60% 35%,rgba(255,255,255,.22),transparent 55%),linear-gradient(160deg,#e0359b,#14062a)"},{"title":"Glass Garden","tag":"BLOOMING LATE","year":2021,"genre":"Romance, Comedy","time":"1h 42m","rating":4,"desc":"A botanist and a stubborn florist compete to save the last greenhouse in town, and keep running out of reasons to stay rivals.","poster":"linear-gradient(160deg,#7bc47f,#0d2412)","bg":"radial-gradient(circle at 60% 35%,rgba(255,255,255,.22),transparent 55%),linear-gradient(160deg,#7bc47f,#0d2412)"},{"title":"Dust & Thunder","tag":"THE LAST RIDE","year":2024,"genre":"Action, Drama","time":"2h 15m","rating":4,"desc":"A marshal and a runaway bride cross a dry desert with a storm behind them and a gang ahead of them.","poster":"linear-gradient(160deg,#b8793c,#241408)","bg":"radial-gradient(circle at 60% 35%,rgba(255,255,255,.22),transparent 55%),linear-gradient(160deg,#b8793c,#241408)"},{"title":"MULAN","tag":"FEATURED FILM","year":"2020","genre":"Action, Fantasy","time":"2 hours","rating":5,"desc":"A fearless young woman risks everything out of love for her family and her country, and rises to become one of the greatest warriors her homeland has ever known.","poster":"linear-gradient(160deg,#0B3A7A,#0A1F44 55%,#03080E)","bg":"radial-gradient(circle at 25% 30%, rgba(30,160,255,.55), transparent 45%), linear-gradient(120deg,#0B3A7A,#0A1F44 45%,#03080E)"},{"title":"NIGHTFALL","tag":"FEATURED FILM","year":"2023","genre":"Mystery, Thriller","time":"1h 55m","rating":5,"desc":"A lighthouse keeper discovers that the storm rolling in each night is trying to tell her something, and the answer lies beneath the waves.","poster":"linear-gradient(160deg,#0B3A7A,#0A1F44 55%,#03080E)","bg":"radial-gradient(circle at 70% 25%, rgba(80,140,200,.5), transparent 45%), linear-gradient(120deg,#16283d,#0f1a2b 50%,#070b12)"},{"title":"EMBER","tag":"FEATURED FILM","year":"2022","genre":"Comedy, Drama","time":"1h 40m","rating":5,"desc":"Two rival chefs are forced to share one kitchen for a single week, and discover that the hardest thing to cook is trust.","poster":"linear-gradient(160deg,#0B3A7A,#0A1F44 55%,#03080E)","bg":"radial-gradient(circle at 30% 70%, rgba(240,170,60,.5), transparent 45%), linear-gradient(120deg,#5a2b12,#331a10 50%,#150a07)"},{"title":"The Hollow Crown","tag":"SERIES · 3 SEASONS","year":2025,"genre":"Drama","time":"3 Seasons","rating":5,"desc":"When a king dies without naming an heir, three siblings fight for a throne that is already hollow.","poster":"linear-gradient(160deg,hsl(352,50%,38%),hsl(22,55%,8%))","bg":"radial-gradient(circle at 72% 28%,hsla(352,70%,55%,.42),transparent 50%),linear-gradient(125deg,hsl(352,42%,20%),hsl(17,38%,9%) 60%,#03080E)"},{"title":"Salt Road","tag":"SERIES · 2 SEASONS","year":2024,"genre":"Crime","time":"2 Seasons","rating":4,"desc":"A retired customs officer is pulled back in when a smuggling route she once closed quietly reopens.","poster":"linear-gradient(160deg,hsl(42,50%,38%),hsl(72,55%,8%))","bg":"radial-gradient(circle at 72% 28%,hsla(42,70%,55%,.42),transparent 50%),linear-gradient(125deg,hsl(42,42%,20%),hsl(67,38%,9%) 60%,#03080E)"},{"title":"Low Orbit","tag":"SERIES · 1 SEASON","year":2026,"genre":"Sci-Fi","time":"1 Season","rating":4,"desc":"Six engineers on a failing station have nine days to fix it, and one of them is lying about why.","poster":"linear-gradient(160deg,hsl(210,50%,38%),hsl(240,55%,8%))","bg":"radial-gradient(circle at 72% 28%,hsla(210,70%,55%,.42),transparent 50%),linear-gradient(125deg,hsl(210,42%,20%),hsl(235,38%,9%) 60%,#03080E)"},{"title":"Ember & Ash","tag":"SERIES · 4 SEASONS","year":2023,"genre":"Fantasy","time":"4 Seasons","rating":5,"desc":"A blacksmith’s daughter inherits a forge that can only be lit by the things people want to forget.","poster":"linear-gradient(160deg,hsl(18,50%,38%),hsl(48,55%,8%))","bg":"radial-gradient(circle at 72% 28%,hsla(18,70%,55%,.42),transparent 50%),linear-gradient(125deg,hsl(18,42%,20%),hsl(43,38%,9%) 60%,#03080E)"},{"title":"Quiet Harbor","tag":"SERIES · 2 SEASONS","year":2025,"genre":"Drama","time":"2 Seasons","rating":4,"desc":"In a fishing town with one road in and out, every secret has a witness and every witness has a boat.","poster":"linear-gradient(160deg,hsl(190,50%,38%),hsl(220,55%,8%))","bg":"radial-gradient(circle at 72% 28%,hsla(190,70%,55%,.42),transparent 50%),linear-gradient(125deg,hsl(190,42%,20%),hsl(215,38%,9%) 60%,#03080E)"},{"title":"The Cartographer","tag":"SERIES · 2 SEASONS","year":2024,"genre":"Fantasy","time":"2 Seasons","rating":4,"desc":"A mapmaker discovers that the places she draws begin to exist, including the ones she fears.","poster":"linear-gradient(160deg,hsl(270,50%,38%),hsl(300,55%,8%))","bg":"radial-gradient(circle at 72% 28%,hsla(270,70%,55%,.42),transparent 50%),linear-gradient(125deg,hsl(270,42%,20%),hsl(295,38%,9%) 60%,#03080E)"},{"title":"Static","tag":"SERIES · 3 SEASONS","year":2022,"genre":"Sci-Fi","time":"3 Seasons","rating":4,"desc":"A radio operator in a sealed bunker keeps hearing broadcasts from a year that hasn’t happened yet.","poster":"linear-gradient(160deg,hsl(150,50%,38%),hsl(180,55%,8%))","bg":"radial-gradient(circle at 72% 28%,hsla(150,70%,55%,.42),transparent 50%),linear-gradient(125deg,hsl(150,42%,20%),hsl(175,38%,9%) 60%,#03080E)"},{"title":"Fault Line","tag":"SERIES · 1 SEASON","year":2026,"genre":"Crime","time":"1 Season","rating":4,"desc":"After an earthquake exposes a body in a sealed tunnel, two detectives trace a crime to the city’s founding.","poster":"linear-gradient(160deg,hsl(120,50%,38%),hsl(150,55%,8%))","bg":"radial-gradient(circle at 72% 28%,hsla(120,70%,55%,.42),transparent 50%),linear-gradient(125deg,hsl(120,42%,20%),hsl(145,38%,9%) 60%,#03080E)"},{"title":"Pip & the Lantern Kingdom","tag":"LIGHT THE WAY HOME","year":2023,"genre":"Adventure, Fantasy","time":"2 Seasons · 26 eps","rating":5,"desc":"A tiny firefly named Pip discovers that every lantern in the Lantern Kingdom is going dark, one by one. With a grumpy moth and a very brave snail, Pip sets out to relight the realm before the long night falls.","poster":"linear-gradient(160deg,hsl(38,60%,44%),hsl(73,62%,10%))","bg":"radial-gradient(circle at 78% 18%,hsla(38,85%,60%,.55),transparent 55%),linear-gradient(135deg,hsl(38,50%,24%),#071225)"},{"title":"Captain Marshmallow","tag":"SOFT ON THE OUTSIDE. BRAVE ON THE INSIDE","year":2022,"genre":"Comedy, Action","time":"3 Seasons · 39 eps","rating":5,"desc":"When the Candy Coast is threatened by the sour pirates of Lemon Bay, a squishy captain and his crew of snack-sized heroes sail into action, and usually get stuck to the deck.","poster":"linear-gradient(160deg,hsl(330,60%,44%),hsl(5,62%,10%))","bg":"radial-gradient(circle at 78% 18%,hsla(330,85%,60%,.55),transparent 55%),linear-gradient(135deg,hsl(330,50%,24%),#071225)"},{"title":"The Cloud Bakery","tag":"EVERY LOAF HAS A LITTLE SKY IN IT","year":2024,"genre":"Family, Comedy","time":"1 Season · 13 eps","rating":5,"desc":"Nimbus the baker and her sleepy cloud-pup deliver warm bread to the villages below, and learn that kindness is the secret ingredient in every recipe.","poster":"linear-gradient(160deg,hsl(200,60%,44%),hsl(235,62%,10%))","bg":"radial-gradient(circle at 78% 18%,hsla(200,85%,60%,.55),transparent 55%),linear-gradient(135deg,hsl(200,50%,24%),#071225)"},{"title":"Robo Rascals","tag":"CHARGED UP AND OUT OF CONTROL","year":2021,"genre":"Sci-Fi, Comedy","time":"4 Seasons · 52 eps","rating":4,"desc":"Four mischievous maintenance bots on a space station keep breaking things while trying to fix them, and keep saving everyone by accident.","poster":"linear-gradient(160deg,hsl(190,60%,44%),hsl(225,62%,10%))","bg":"radial-gradient(circle at 78% 18%,hsla(190,85%,60%,.55),transparent 55%),linear-gradient(135deg,hsl(190,50%,24%),#071225)"},{"title":"Moonlit Mischief","tag":"SOME SECRETS ONLY WAKE AT NIGHT","year":2025,"genre":"Fantasy, Mystery","time":"1h 28m","rating":5,"desc":"On the night of a rare blue moon, a curious girl follows a trail of glowing paw prints into a hidden world where all of the city's lost things are kept.","poster":"linear-gradient(160deg,hsl(265,60%,44%),hsl(300,62%,10%))","bg":"radial-gradient(circle at 78% 18%,hsla(265,85%,60%,.55),transparent 55%),linear-gradient(135deg,hsl(265,50%,24%),#071225)"},{"title":"Tiny Tides","tag":"BIG ADVENTURES IN SMALL POOLS","year":2020,"genre":"Adventure, Family","time":"2 Seasons · 26 eps","rating":4,"desc":"Life in a tide pool is anything but quiet. A crab, a starfish, and a shy seahorse explore the wide world one wave at a time.","poster":"linear-gradient(160deg,hsl(175,60%,44%),hsl(210,62%,10%))","bg":"radial-gradient(circle at 78% 18%,hsla(175,85%,60%,.55),transparent 55%),linear-gradient(135deg,hsl(175,50%,24%),#071225)"},{"title":"Dino Diner","tag":"PREHISTORIC FOOD, MODERN CHAOS","year":2023,"genre":"Comedy, Family","time":"2 Seasons · 26 eps","rating":4,"desc":"Rex runs the only diner in Pebble Valley. Every dinosaur has an opinion about the menu, and none of them can fit through the door.","poster":"linear-gradient(160deg,hsl(25,60%,44%),hsl(60,62%,10%))","bg":"radial-gradient(circle at 78% 18%,hsla(25,85%,60%,.55),transparent 55%),linear-gradient(135deg,hsl(25,50%,24%),#071225)"},{"title":"Skyfarers of Nimbus","tag":"THE SKY IS THE ONLY MAP","year":2024,"genre":"Adventure, Sci-Fi","time":"2 Seasons · 20 eps","rating":5,"desc":"In a world of floating islands, a young mapmaker joins an airship crew in search of the legendary island that holds the sky together.","poster":"linear-gradient(160deg,hsl(215,60%,44%),hsl(250,62%,10%))","bg":"radial-gradient(circle at 78% 18%,hsla(215,85%,60%,.55),transparent 55%),linear-gradient(135deg,hsl(215,50%,24%),#071225)"},{"title":"The Paper Dragon","tag":"FOLD. WISH. FLY","year":2022,"genre":"Fantasy, Drama","time":"1h 42m","rating":5,"desc":"A lonely boy folds a paper dragon from his late grandfather's letters. When it comes alive, they must cross three kingdoms before the last page crumbles.","poster":"linear-gradient(160deg,hsl(12,60%,44%),hsl(47,62%,10%))","bg":"radial-gradient(circle at 78% 18%,hsla(12,85%,60%,.55),transparent 55%),linear-gradient(135deg,hsl(12,50%,24%),#071225)"},{"title":"Detective Doodle","tag":"EVERY CLUE LEAVES A MARK","year":2022,"genre":"Mystery, Comedy","time":"3 Seasons · 36 eps","rating":5,"desc":"A pencil-drawn detective can erase and redraw anything, which makes solving crimes easy and keeping them solved very hard.","poster":"linear-gradient(160deg,hsl(300,60%,44%),hsl(335,62%,10%))","bg":"radial-gradient(circle at 78% 18%,hsla(300,85%,60%,.55),transparent 55%),linear-gradient(135deg,hsl(300,50%,24%),#071225)"},{"title":"Starlight Academy","tag":"MAGIC IS A TEAM SPORT","year":2025,"genre":"Fantasy, Family","time":"1 Season · 12 eps","rating":5,"desc":"Five first-year students at a school in the clouds learn spellcasting, friendship, and why you should never feed a comet after midnight.","poster":"linear-gradient(160deg,hsl(280,60%,44%),hsl(315,62%,10%))","bg":"radial-gradient(circle at 78% 18%,hsla(280,85%,60%,.55),transparent 55%),linear-gradient(135deg,hsl(280,50%,24%),#071225)"},{"title":"Turbo Turtles","tag":"SLOW AND STEADY? NOT TODAY","year":2021,"genre":"Action, Comedy","time":"3 Seasons · 39 eps","rating":4,"desc":"Four racing turtles protect Sandy Bay from a gang of speed-obsessed hares, with questionable stunts and a lot of snacks.","poster":"linear-gradient(160deg,hsl(135,60%,44%),hsl(170,62%,10%))","bg":"radial-gradient(circle at 78% 18%,hsla(135,85%,60%,.55),transparent 55%),linear-gradient(135deg,hsl(135,50%,24%),#071225)"},{"title":"Orchard Spirits","tag":"WHERE THE APPLES REMEMBER","year":2023,"genre":"Fantasy, Family","time":"1h 35m","rating":5,"desc":"Every autumn, the spirits of an old orchard wake to guard the last harvest. One summer, a city kid arrives and accidentally wakes them early.","poster":"linear-gradient(160deg,hsl(95,60%,44%),hsl(130,62%,10%))","bg":"radial-gradient(circle at 78% 18%,hsla(95,85%,60%,.55),transparent 55%),linear-gradient(135deg,hsl(95,50%,24%),#071225)"},{"title":"Galaxy Grandpa","tag":"RETIRED. NOT TIRED","year":2024,"genre":"Sci-Fi, Comedy","time":"2 Seasons · 22 eps","rating":4,"desc":"A retired starship captain moves in with his grandkids, and the galaxy keeps calling him back for just one more mission.","poster":"linear-gradient(160deg,hsl(245,60%,44%),hsl(280,62%,10%))","bg":"radial-gradient(circle at 78% 18%,hsla(245,85%,60%,.55),transparent 55%),linear-gradient(135deg,hsl(245,50%,24%),#071225)"}]);

const $ = id => document.getElementById(id);
const stage = $("stage"), strip = $("strip"), carousel = strip.parentElement;
const norm = t => String(t).trim().toLowerCase();
const KEYS = ["continuum.favorites", "myList", "seriesList"];   /* synced favourites + legacy demo keys */
const rd = k => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch (e) { return []; } };
const wr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const byName = new Map(catalog.map(m => [norm(m.title), m]));
const byId = new Map(catalog.map(m => [norm(m.id != null ? m.id : m.title), m]));
const hue = t => [...t].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7);

/* saved titles -> movie objects. Case-insensitive, so "NIGHTFALL" and "Nightfall" count once. */
function load() {
  const seen = new Set(), out = [];
  KEYS.forEach(k => rd(k).forEach(t => {
    const n = norm(t); if (seen.has(n)) return; seen.add(n);
    let m = byId.get(n) || byName.get(n);
    if (!m) { const h = hue(String(t));
      m = { title:String(t), tag:"SAVED TITLE", year:"", genre:"", time:"", rating:0, desc:"",
            bg:"radial-gradient(circle at 60% 35%,hsla("+h+",70%,55%,.7),transparent 55%),linear-gradient(135deg,hsl("+h+",45%,18%),#050505)",
            poster:"linear-gradient(160deg,hsl("+h+",50%,38%),hsl("+((h+30)%360)+",55%,8%))" }; }
    out.push(m);
  }));
  return out;
}

let movies = load(), active = 0, cards = [];

const star = on => '<svg viewBox="0 0 24 24" class="' + (on ? "" : "off") + '"><path d="M12 2l3 7 7.5.6-5.7 4.9 1.8 7.3L12 17.8 5.4 21.8l1.8-7.3L1.5 9.6 9 9z"/></svg>';

function setCount() {}

/* ---------- BUILD CARDS ---------- */
function build() {
  strip.innerHTML = "";
  movies.forEach((m, i) => {
    const c = document.createElement("button");
    c.className = "card"; c.style.background = m.poster; c.setAttribute("aria-label", m.title);
    c.innerHTML = "<span></span>"; c.firstChild.textContent = m.title;
    c.addEventListener("click", () => select(cards.indexOf(c)));
    c.classList.add("enter"); c.style.transitionDelay = (i * 60) + "ms";
    strip.appendChild(c);
  });
  cards = [...strip.children];
  stage.classList.toggle("is-empty", !movies.length);
  setCount();
  if (movies.length) {
    fill(); layout();
    void strip.offsetWidth;                                   /* start state painted, then fade in */
    requestAnimationFrame(() => cards.forEach(c => c.classList.remove("enter")));
    setTimeout(() => cards.forEach(c => c.style.transitionDelay = ""), 900);
  }
}

/* ---------- CAROUSEL LAYOUT ---------- */
function layout() {
  const H = carousel.clientHeight * 0.94, gap = parseFloat(getComputedStyle(strip).columnGap) || 24, cw = carousel.clientWidth;
  /* both sides recede: the farther from the active card, the smaller and dimmer */
  const sc = i => Math.max(0.45, Math.pow(0.82, Math.abs(i - active)));
  const ws = cards.map((c, i) => H * sc(i) * 2 / 3);
  cards.forEach((c, i) => {
    const d = Math.abs(i - active);
    c.style.height = (H * sc(i)) + "px"; c.style.width = ws[i] + "px";
    c.style.filter = d === 0 ? "none" : "brightness(" + Math.max(0.4, 1 - 0.2 * d) + ")";
    c.classList.toggle("active", d === 0);
  });
  const total = ws.reduce((a, w) => a + w, 0) + gap * Math.max(0, ws.length - 1);
  let before = 0; for (let i = 0; i < active; i++) before += ws[i] + gap;
  /* few cards: center the whole group. many cards: keep the active card in the middle */
  const tx = total <= cw ? (cw - total) / 2 : cw / 2 - (before + ws[active] / 2);
  strip.style.transform = "translateX(" + tx + "px)";
  $("prev").disabled = active <= 0;
  $("next").disabled = active >= movies.length - 1;
}

/* ---------- SHOW THE ACTIVE TITLE ---------- */
function fill() {
  const m = movies[active]; if (!m) return;
  stage.style.setProperty("--bg", m.bg);
  $("backdrop").style.background = m.bg;
  $("tag").textContent = m.tag;
  $("title").textContent = m.title;
  $("desc").textContent = m.desc;
  $("meta").textContent = [m.year, m.genre, m.time].filter(Boolean).join("   ");
  $("stars").innerHTML = m.rating ? [1,2,3,4,5].map(n => star(n <= m.rating)).join("") : "";
  $("stars").setAttribute("aria-label", m.rating + " out of 5 stars");
  document.title = m.title + " \\u2013 My list";
}
function select(i) {
  if (i === active || i < 0 || i >= movies.length) return;
  active = i; layout();
  stage.classList.add("swap");
  setTimeout(() => { fill(); stage.classList.remove("swap"); }, 300);
}

/* ---------- REMOVE + PLAY ---------- */
let t;
function toast(msg) {
  const el = $("toast"); el.textContent = msg; el.classList.add("show");
  clearTimeout(t); t = setTimeout(() => el.classList.remove("show"), 2200);
}
let busy = false;
$("listBtn").addEventListener("click", () => {
  const m = movies[active]; if (!m || busy) return;
  busy = true;
  const idx = active, el = cards[idx];
  const kill = new Set([norm(m.id || ""), norm(m.title)].filter(Boolean));
  KEYS.forEach(k => wr(k, rd(k).filter(v => !kill.has(norm(v)))));   /* removes every spelling of the title/id */
  el.classList.add("leaving");                    /* card shrinks + fades */
  stage.classList.add("swap");                    /* info + backdrop fade out */
  toast("Removed from My List");
  setTimeout(() => {
    el.remove(); cards.splice(idx, 1);
    movies = load();
    if (!movies.length) { build(); busy = false; return; }
    active = Math.min(idx, movies.length - 1);
    setCount(); layout(); fill();                 /* remaining cards slide into place */
    stage.classList.remove("swap");
    busy = false;
  }, 480);
});
const play = o => { try { parent.NFPlay(o); } catch (e) { toast("Playing \\"" + o.title + "\\"..."); } };
$("playBtn").addEventListener("click", () => { const m = movies[active]; if (m) play({ title:m.title, sub:m.genre, bg:m.poster, video:m.video||"", dur:m.time, id:m.id||null }); });

/* ---------- CONTROLS ---------- */
$("prev").addEventListener("click", () => select(active - 1));
$("next").addEventListener("click", () => select(active + 1));
document.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") select(active + 1);
  if (e.key === "ArrowLeft")  select(active - 1);
});
window.addEventListener("resize", layout);
let x0 = null;
carousel.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive:true });
carousel.addEventListener("touchend", e => {
  if (x0 === null) return;
  const dx = e.changedTouches[0].clientX - x0;
  if (Math.abs(dx) > 40) select(active + (dx < 0 ? 1 : -1));
  x0 = null;
});

build();
</script>
</body>
</html>
`

};

// Freeze P to prevent accidental mutation
Object.freeze(P);
