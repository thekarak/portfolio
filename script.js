(function () {
  var root = document.documentElement;
  var STORAGE_KEY = "sk-theme";

  /* ============ Theme ============ */
  var themeToggle = document.getElementById("theme-toggle");
  var iconSun = document.getElementById("theme-icon-sun");
  var iconMoon = document.getElementById("theme-icon-moon");

  function safeGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function safeSet(key, value) { try { localStorage.setItem(key, value); } catch (e) { } }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (iconSun && iconMoon) {
      iconSun.style.display = theme === "dark" ? "none" : "";
      iconMoon.style.display = theme === "dark" ? "" : "none";
    }
  }

  applyTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light");

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      safeSet(STORAGE_KEY, next);
    });
  }

  /* ============ Mobile menu ============ */
  var menuToggle = document.getElementById("menu-toggle");
  var mobileMenu = document.getElementById("mobile-menu");

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("open");
    mobileMenu.setAttribute("aria-hidden", "true");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("open");
      mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mobileMenu.querySelectorAll("a, button").forEach(function (el) {
      el.addEventListener("click", closeMenu);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) closeMenu();
    });
  }

  /* ============ Reveal on scroll ============ */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ============ Toast ============ */
  var toast = document.getElementById("toast");
  var toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    var textElem = document.getElementById("toast-text");
    if (textElem) textElem.textContent = message;
    toast.classList.add("show");
    toast.setAttribute("aria-hidden", "false");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
      toast.setAttribute("aria-hidden", "true");
    }, 2200);
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { }
    document.body.removeChild(ta);
  }

  function copyText(text) {
    function done() { showToast("copied " + text); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text);
      done();
    }
  }

  document.querySelectorAll(".copy-trigger").forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var text = this.getAttribute("data-copy") || "soykarak@gmail.com";
      var label = this.querySelector(".copy-label");
      var original = label ? label.textContent : "";
      copyText(text);
      if (label) {
        label.textContent = "copied";
        setTimeout(function () { label.textContent = original; }, 1800);
      }
    });
  });

  /* ============ Resume modal ============ */
  var modal = document.getElementById("resume-modal");
  var openBtn = document.getElementById("open-resume-btn");
  var mobileBtn = document.getElementById("mobile-resume-btn");
  var closeBtn = document.getElementById("close-modal-btn");
  var focusBefore = null;

  function openModal() {
    if (!modal) return;
    focusBefore = document.activeElement;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (focusBefore && focusBefore.focus) focusBefore.focus();
    focusBefore = null;
  }

  if (openBtn) openBtn.addEventListener("click", openModal);
  if (mobileBtn) mobileBtn.addEventListener("click", function () { closeMenu(); openModal(); });
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", function (event) { if (event.target === modal) closeModal(); });
    modal.addEventListener("keydown", function (event) {
      if (event.key !== "Tab") return;
      var focusable = modal.querySelectorAll("a[href], button:not([disabled])");
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
  }
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      if (modal && modal.classList.contains("open")) closeModal();
      closeMenu();
    }
  });

  /* ============ Live IST clock ============ */
  var timeElem = document.getElementById("local-time");
  function tickClock() {
    if (!timeElem) return;
    try {
      var fmt = new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: false, timeZone: "Asia/Kolkata"
      });
      timeElem.textContent = fmt.format(new Date()) + " IST";
    } catch (e) {
      timeElem.textContent = new Date().toLocaleTimeString();
    }
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ============ Footer year ============ */
  var yearElem = document.getElementById("year");
  if (yearElem) yearElem.textContent = new Date().getFullYear();

  /* ============ Scroll progress + back to top ============ */
  var progressFill = document.getElementById("scroll-progress-fill");
  var toTopBtn = document.getElementById("back-to-top");

  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    if (progressFill) progressFill.style.width = pct + "%";
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTopBtn) toTopBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* ============ Active nav highlight ============ */
  var navLinks = document.querySelectorAll(".nav a[href^='#']");
  var sections = ["work", "experience", "skills", "notes", "contact"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          navLinks.forEach(function (a) {
            a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { navObs.observe(s); });
  }

  /* ============ Views counter ============ */
  var viewsCountElem = document.getElementById("views-count");
  var UNIQUE_KEY = "sk_unique_view_time";
  var CACHED_KEY = "sk_cached_view_count";
  var ONE_DAY_MS = 24 * 60 * 60 * 1000;

  function formatCount(num) { return Number(num).toLocaleString(); }

  function animateCount(elem, target) {
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / 900, 1);
      var ease = 1 - Math.pow(1 - p, 3);
      elem.textContent = formatCount(Math.floor(target * ease));
      if (p < 1) requestAnimationFrame(step);
      else elem.textContent = formatCount(target);
    }
    requestAnimationFrame(step);
  }

  if (viewsCountElem) {
    var cached = safeGet(CACHED_KEY);
    if (cached) viewsCountElem.textContent = formatCount(cached);
    var lastVisit = safeGet(UNIQUE_KEY);
    var now = Date.now();
    var isNew = !lastVisit || (now - parseInt(lastVisit, 10)) > ONE_DAY_MS;

    fetch("https://api.visitorbadge.io/api/visitors?path=thekarak.selfwebsite")
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (svg) {
        var match = svg.match(/VISITORS:\s*(\d+)/i);
        if (match && match[1]) {
          var count = parseInt(match[1], 10);
          safeSet(CACHED_KEY, count);
          if (isNew) safeSet(UNIQUE_KEY, now.toString());
          animateCount(viewsCountElem, count);
        }
      })
      .catch(function () {
        viewsCountElem.textContent = cached ? formatCount(cached) : "1";
      });
  }
})();
