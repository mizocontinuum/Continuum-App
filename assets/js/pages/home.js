/**
 * ============================================================================
 * Continuum Academy — Home Shell Controller & Router
 * Manages hash routing, search indexing, iframe document injection,
 * sliding navigation tabs, and cross-document viewport responsiveness.
 * ============================================================================
 */

(() => {
  "use strict";

  /* --------------------------------------------------------------------------
     1. Constants & Route Definitions
     -------------------------------------------------------------------------- */
  const ROUTES = {
    home: "Home",
    movies: "Movies",
    series: "Series",
    cartoons: "Cartoons",
    mylist: "My list"
  };

  const MOBILE_INJECT_CSS = `
    html { -webkit-text-size-adjust: 100%; }
    button { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
    @media (hover: none) {
      .quick, .cw-x { opacity: 1 !important; }
    }
    @media (max-width: 700px) {
      body { overflow-x: hidden; }
      .hero, .wrap { padding-left: 20px !important; padding-right: 20px !important; }
      .categories, .cw, .top10, .lib { padding-left: 20px !important; padding-right: 20px !important; }
      .stage { padding-left: 20px !important; }
      .stage .info { padding-right: 20px !important; }
      .stage .arrows { padding-right: 20px !important; }
      .stage .empty { padding-top: var(--navh, 0px) !important; box-sizing: border-box; }
      .hero h1, .stage .title { font-size: clamp(2.6rem, 11vw, 4.25rem) !important; line-height: 1 !important; overflow-wrap: anywhere; }
      .categories h2, .cw h2, .top10 h2, .lh h2 { font-size: 1.8rem !important; }
      input, select { font-size: 16px !important; }
      .btn, .list-btn { min-height: 44px; }
      .thumbs { gap: .75rem !important; }
      .thumb { flex: 1 1 0; width: auto !important; max-width: 160px; }
      .grid { grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr)) !important; gap: 24px 16px !important; }
      .sheet { padding: 20px !important; gap: 20px !important; }
      .sheet h2 { font-size: 2.1rem !important; }
      .x { top: 10px !important; right: 10px !important; width: 36px; height: 36px; border-radius: 50%; background: rgba(3, 8, 14, .7) !important; display: grid; place-items: center; z-index: 2; font-size: 1.6rem !important; }
      .pv-top, .pv-bar { padding-left: 20px !important; padding-right: 20px !important; }
      .pv-bar { padding-bottom: calc(18px + env(safe-area-inset-bottom, 0px)) !important; }
      .toast { bottom: calc(20px + env(safe-area-inset-bottom, 0px)) !important; }
    }
  `;

  /* --------------------------------------------------------------------------
     2. DOM References & State
     -------------------------------------------------------------------------- */
  const iframe = document.getElementById("f");
  const nav = document.querySelector("nav");
  const linksContainer = document.querySelector(".links");
  const tabIndicator = linksContainer ? linksContainer.querySelector(".ind") : null;
  const searchInput = document.getElementById("q");
  const searchButton = document.getElementById("qb");
  const toastElement = document.getElementById("st");

  let pendingAction = null;
  let toastTimer = null;

  /* --------------------------------------------------------------------------
     3. Helper Functions & Search Indexing
     -------------------------------------------------------------------------- */
  const getCurrentRoute = () => {
    const hash = location.hash.slice(1);
    return ROUTES[hash] ? hash : "home";
  };

  const extractTitles = (source, pattern) => {
    const list = [];
    let match;
    while ((match = pattern.exec(source)) !== null) {
      list.push(match[1]);
    }
    return list;
  };

  // Compile search indices from embedded page templates
  const SEARCH_INDEX = {
    movies: typeof P !== "undefined" && P.movies ? extractTitles(P.movies, /\{\s*title:"([^"]+)"/g) : [],
    series: typeof P !== "undefined" && P.series ? extractTitles(P.series, /\{t:"([^"]+)"/g) : [],
    cartoons: typeof P !== "undefined" && P.cartoons ? extractTitles(P.cartoons, /\{"title":\s*"([^"]+)"/g) : [],
    home: typeof P !== "undefined" && P.home ? extractTitles(P.home, /^\s+title:\s*"([^"]+)"/gm) : []
  };

  function showToast(message) {
    if (!toastElement) return;
    toastElement.textContent = message;
    toastElement.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastElement.classList.remove("show"), 2400);
  }

  function findTitleMatch(query) {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return null;

    const current = getCurrentRoute();
    const searchOrder = [current, ...["movies", "series", "cartoons", "home"].filter(p => p !== current)];

    // Exact match first, then partial match
    for (const isExact of [true, false]) {
      for (const page of searchOrder) {
        const pool = SEARCH_INDEX[page] || [];
        const match = pool.find(item =>
          isExact ? item.toLowerCase() === keyword : item.toLowerCase().includes(keyword)
        );
        if (match) return { page, title: match };
      }
    }
    return null;
  }

  function executeInFrame(action) {
    const doc = iframe.contentDocument;
    const win = doc && doc.defaultView;
    if (!doc || !win) return;

    if (action.page === "home") {
      const input = doc.getElementById("searchInput");
      if (input) {
        input.value = action.title;
        input.dispatchEvent(new win.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      }
    } else if (action.page === "movies") {
      const input = doc.getElementById("search");
      if (input) {
        input.value = action.title;
        input.dispatchEvent(new win.Event("input", { bubbles: true }));
        win.scrollTo(0, 0);
      }
    } else if (action.page === "series") {
      const cards = [...doc.querySelectorAll("button.c")];
      const match = cards.find(card => card.querySelector("b") && card.querySelector("b").textContent === action.title);
      if (match) match.click();
    } else if (action.page === "cartoons") {
      const cards = [...doc.querySelectorAll("button.card")];
      const match = cards.find(card => card.getAttribute("aria-label") === action.title);
      if (match) match.click();
    }
  }

  /* --------------------------------------------------------------------------
     4. Navigation & Hash Router
     -------------------------------------------------------------------------- */
  function navigate() {
    const route = getCurrentRoute();

    document.querySelectorAll(".links a").forEach(link => {
      const isActive = link.dataset.r === route;
      link.classList.toggle("on", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    document.title = `${ROUTES[route]} – Continuum Academy`;

    if (typeof P !== "undefined" && P[route]) {
      iframe.style.opacity = 0;
      setTimeout(() => {
        iframe.srcdoc = P[route];
      }, 150);
    }
  }

  function updateIndicator() {
    if (!linksContainer || !tabIndicator) return;
    const activeLink = linksContainer.querySelector("a.on");
    if (!activeLink) return;

    const parent = activeLink.parentElement;
    tabIndicator.style.left = `${parent.offsetLeft}px`;
    tabIndicator.style.width = `${parent.offsetWidth}px`;

    linksContainer.scrollTo({
      left: activeLink.offsetLeft - linksContainer.clientWidth / 2 + activeLink.offsetWidth / 2,
      behavior: "smooth"
    });
  }

  /* --------------------------------------------------------------------------
     5. Responsive Frame Padding & Scroll Sync
     -------------------------------------------------------------------------- */
  function syncFramePadding() {
    try {
      const doc = iframe.contentDocument;
      if (!doc || !doc.head || !nav) return;

      let padStyle = doc.getElementById("shellpad");
      if (!padStyle) {
        padStyle = doc.createElement("style");
        padStyle.id = "shellpad";
        padStyle.textContent = `
          .hero { padding-top: var(--navh) !important; }
          .wrap { padding-top: var(--navh) !important; }
          .stage .info { padding-top: max(14vh, var(--navh)) !important; }
        ` + MOBILE_INJECT_CSS;
        doc.head.appendChild(padStyle);
      }

      const totalNavHeight = nav.offsetTop + nav.offsetHeight + 22;
      doc.documentElement.style.setProperty("--navh", `${totalNavHeight}px`);
    } catch (_) {}
  }

  /* --------------------------------------------------------------------------
     6. Search Actions & Keyboard Controls
     -------------------------------------------------------------------------- */
  function openSearch() {
    if (!searchInput) return;
    searchInput.classList.add("open");
    searchInput.focus();
  }

  function closeSearch() {
    if (!searchInput) return;
    searchInput.classList.remove("open");
    searchInput.value = "";
  }

  function handleSearchSubmit() {
    const query = searchInput.value.trim();
    if (!query) return;

    const result = findTitleMatch(query);
    if (!result) {
      showToast(`No title found for “${query}”`);
      return;
    }

    closeSearch();
    if (result.page === getCurrentRoute()) {
      executeInFrame(result);
    } else {
      pendingAction = result;
      location.hash = result.page;
    }
  }

  /* --------------------------------------------------------------------------
     7. Event Listeners & Initialization
     -------------------------------------------------------------------------- */
  if (searchButton && searchInput) {
    searchButton.setAttribute("aria-expanded", "false");

    new MutationObserver(() => {
      searchButton.setAttribute("aria-expanded", String(searchInput.classList.contains("open")));
    }).observe(searchInput, { attributes: true, attributeFilter: ["class"] });

    searchButton.addEventListener("click", () => {
      if (!searchInput.classList.contains("open")) {
        openSearch();
      } else if (searchInput.value.trim()) {
        handleSearchSubmit();
      } else {
        closeSearch();
      }
    });

    searchInput.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeSearch();
      } else if (event.key === "Enter") {
        event.preventDefault();
        handleSearchSubmit();
      }
    });
  }

  // Keyboard shortcuts (Cmd/Ctrl + K and /)
  document.addEventListener("keydown", event => {
    if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      openSearch();
    } else if (event.key === "/" && !/input|textarea/i.test(document.activeElement.tagName)) {
      event.preventDefault();
      openSearch();
    }
  });

  // Click outside search to close
  document.addEventListener("click", event => {
    if (
      searchInput &&
      searchInput.classList.contains("open") &&
      !searchInput.contains(event.target) &&
      !searchButton.contains(event.target)
    ) {
      closeSearch();
    }
  });

  // Iframe lifecycle & scroll sync
  iframe.addEventListener("load", () => {
    iframe.style.opacity = 1;
    if (pendingAction) {
      const action = pendingAction;
      pendingAction = null;
      executeInFrame(action);
    }
    syncFramePadding();

    if (nav) {
      nav.classList.remove("scrolled");
      try {
        const win = iframe.contentWindow;
        win.addEventListener("scroll", () => {
          nav.classList.toggle("scrolled", win.scrollY > 4);
        }, { passive: true });
      } catch (_) {}
    }
  });

  window.addEventListener("resize", () => {
    syncFramePadding();
    updateIndicator();
  });

  if (window.ResizeObserver && nav) {
    new ResizeObserver(syncFramePadding).observe(nav);
  }

  window.addEventListener("hashchange", () => {
    navigate();
    updateIndicator();
  });

  // Initial tab slider positioning after fonts load
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(updateIndicator);
  requestAnimationFrame(updateIndicator);

  // Bootstrap initial route
  navigate();
})();
