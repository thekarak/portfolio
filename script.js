(function () {
  /* ============ Boot loader ============ */
  var bootLoader = document.getElementById("boot-loader");
  var bootFill = document.getElementById("boot-fill");
  var bootPct = document.getElementById("boot-pct");
  var booted = false;

  function finishBoot() {
    if (booted) return;
    booted = true;
    if (bootFill) bootFill.style.width = "100%";
    if (bootPct) bootPct.textContent = "100%";
    setTimeout(function () {
      if (bootLoader) bootLoader.classList.add("done");
      document.body.classList.add("is-booted");
      document.body.style.overflow = "";
    }, 180);
  }

  if (bootLoader) {
    document.body.style.overflow = "hidden";
    var reduceMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      finishBoot();
    } else {
      var bootStart = null, bootDur = 1400;
      function bootStep(ts) {
        if (booted) return;
        if (!bootStart) bootStart = ts;
        var p = Math.min((ts - bootStart) / bootDur, 1);
        var eased = p < 0.7 ? p * 1.1 : 0.77 + (p - 0.7) * 0.77;
        var pct = Math.min(Math.floor(eased * 100), 99);
        if (bootFill) bootFill.style.width = pct + "%";
        if (bootPct) bootPct.textContent = (pct < 10 ? "0" : "") + pct + "%";
        if (p < 1) requestAnimationFrame(bootStep);
        else finishBoot();
      }
      requestAnimationFrame(bootStep);
      setTimeout(finishBoot, 3500);
      bootLoader.addEventListener("click", finishBoot);
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" || e.key === "Enter") finishBoot();
      });
    }
  } else {
    document.body.classList.add("is-booted");
  }

  /* ============ Theme switcher ============ */
  var STORAGE_KEY = "sk-theme";
  var root = document.body;
  var themeToggle = document.getElementById("theme-toggle");
  var iconSun = document.getElementById("theme-icon-sun");
  var iconMoon = document.getElementById("theme-icon-moon");

  function safeGet() {
    try { return localStorage.getItem(STORAGE_KEY); }
    catch (e) { return null; }
  }

  function safeSet(value) {
    try { localStorage.setItem(STORAGE_KEY, value); }
    catch (e) { }
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (iconSun && iconMoon) {
      iconSun.style.display = theme === "dark" ? "none" : "";
      iconMoon.style.display = theme === "dark" ? "" : "none";
    }
  }

  var saved = safeGet();
  var initial = saved || "light";
  applyTheme(initial);

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      var next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      safeSet(next);
    });
  }

  /* ============ Mobile menu ============ */
  var menuToggle = document.getElementById("menu-toggle");
  var mobileMenu = document.getElementById("mobile-menu");

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.style.display = "none";
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
  }

  if (menuToggle && mobileMenu) {
    mobileMenu.style.display = "none";
    menuToggle.addEventListener("click", function () {
      var isOpen = mobileMenu.style.display === "flex";
      mobileMenu.style.display = isOpen ? "none" : "flex";
      menuToggle.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });
    mobileMenu.querySelectorAll("a, button").forEach(function (el) {
      el.addEventListener("click", closeMenu);
    });
  }

  /* ============ Skills Filtering ============ */
  var skillTabs = document.querySelectorAll("[data-skill-filter]");
  var skillCats = document.querySelectorAll(".skill-category");

  skillTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var f = this.getAttribute("data-skill-filter");
      skillTabs.forEach(function (t) {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      this.classList.add("active");
      this.setAttribute("aria-selected", "true");
      skillCats.forEach(function (cat) {
        var show = f === "all" || cat.getAttribute("data-skill") === f;
        cat.classList.toggle("hidden", !show);
      });
    });
  });

  /* ============ Scroll Reveal ============ */
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal-on-scroll").forEach(function (el) {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal-on-scroll").forEach(function (el) {
      el.classList.add("is-revealed");
    });
  }

  /* ============ Copy to Clipboard ============ */
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
    }, 2400);
  }

  document.querySelectorAll(".copy-trigger").forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var textToCopy = this.getAttribute("data-copy") || "soykarak@gmail.com";
      var labelElem = this.querySelector(".copy-label");
      var originalLabel = labelElem ? labelElem.textContent : "";

      function handleSuccess() {
        if (labelElem) {
          labelElem.textContent = "Copied! \u2713";
          setTimeout(function () { labelElem.textContent = originalLabel; }, 2000);
        }
        showToast("Copied " + textToCopy + " to clipboard! \u2713");
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(handleSuccess).catch(function () {
          fallbackCopy(textToCopy);
          handleSuccess();
        });
      } else {
        fallbackCopy(textToCopy);
        handleSuccess();
      }
    });
  });

  function fallbackCopy(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try { document.execCommand("copy"); } catch (err) { }
    document.body.removeChild(textArea);
  }

  /* ============ Resume Modal ============ */
  var modal = document.getElementById("resume-modal");
  var openResumeBtn = document.getElementById("open-resume-btn");
  var mobileResumeBtn = document.getElementById("mobile-resume-btn");
  var closeModalBtn = document.getElementById("close-modal-btn");

  function openModal() {
    if (!modal) return;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (openResumeBtn) openResumeBtn.addEventListener("click", openModal);
  if (mobileResumeBtn) mobileResumeBtn.addEventListener("click", function () { closeMenu(); openModal(); });
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);

  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeModal();
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal && modal.classList.contains("open")) closeModal();
  });

  /* ============ Views Counter ============ */
  var viewsCountElem = document.getElementById("views-count");
  var UNIQUE_KEY = "sk_unique_view_time";
  var CACHED_KEY = "sk_cached_view_count";
  var ONE_DAY_MS = 24 * 60 * 60 * 1000;

  function formatCount(num) { return Number(num).toLocaleString(); }

  function animateCount(targetElem, targetNum) {
    var duration = 900, startTime = null, startNum = 0;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var p = Math.min((timestamp - startTime) / duration, 1);
      var ease = 1 - Math.pow(1 - p, 3);
      targetElem.textContent = formatCount(Math.floor(startNum + (targetNum - startNum) * ease));
      if (p < 1) requestAnimationFrame(step);
      else targetElem.textContent = formatCount(targetNum);
    }
    requestAnimationFrame(step);
  }

  function safeGetItem(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function safeSetItem(key, val) {
    try { localStorage.setItem(key, val); } catch (e) { }
  }

  function initViewsCounter() {
    if (!viewsCountElem) return;
    var cached = safeGetItem(CACHED_KEY);
    if (cached) viewsCountElem.textContent = formatCount(cached);

    var lastVisit = safeGetItem(UNIQUE_KEY);
    var now = Date.now();
    var isNew = !lastVisit || (now - parseInt(lastVisit, 10)) > ONE_DAY_MS;

    fetch("https://api.visitorbadge.io/api/visitors?path=thekarak.selfwebsite")
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (svgText) {
        var match = svgText.match(/VISITORS:\s*(\d+)/i);
        if (match && match[1]) {
          var count = parseInt(match[1], 10);
          safeSetItem(CACHED_KEY, count);
          if (isNew) safeSetItem(UNIQUE_KEY, now.toString());
          animateCount(viewsCountElem, count);
        }
      })
      .catch(function () {
        viewsCountElem.textContent = cached ? formatCount(cached) : "1";
      });
  }
  initViewsCounter();

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
      timeElem.textContent = new Date().toLocaleTimeString() + " local";
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
  if (toTopBtn) {
    toTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ============ Stats count-up ============ */
  var statNums = document.querySelectorAll(".stat-num");
  function animateStat(elem) {
    var target = parseFloat(elem.getAttribute("data-count") || "0");
    var decimals = parseInt(elem.getAttribute("data-decimals") || "0", 10);
    var suffix = elem.getAttribute("data-suffix") || "";
    var dur = 1100, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var ease = 1 - Math.pow(1 - p, 3);
      elem.textContent = (target * ease).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else elem.textContent = target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && statNums.length) {
    var statObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          animateStat(en.target);
          statObs.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    statNums.forEach(function (el) { statObs.observe(el); });
  }

  /* ============ Active nav highlight ============ */
  var navLinks = document.querySelectorAll(".topbar a[href^='#']");
  var sections = ["work", "journey", "skills", "notes", "contact"]
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
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { navObs.observe(s); });
  }

})();