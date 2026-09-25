(function () {
  /* ============ Boot loader ============ */
  var bootLoader = document.getElementById("boot-loader");
  var mainElem = document.getElementById("top");
  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var bootRafs = [];
  var bootTimers = [];
  var bootTagline = document.querySelector(".boot-tagline");

  function scrambleTo(elem, word, delay) {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var resolved = 0;
    var start = null;
    var total = 900;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / total, 1);
      var out = "";
      for (var i = 0; i < word.length; i++) {
        if (i < resolved || p === 1) {
          out += word[i];
        } else {
          out += chars[(Math.random() * chars.length) | 0];
        }
      }
      elem.textContent = out;
      resolved = Math.floor(p * word.length * 0.7);
      if (p < 1) bootRafs.push(requestAnimationFrame(frame));
      else elem.textContent = word;
    }
    bootTimers.push(setTimeout(function () {
      elem.classList.add("is-visible");
      elem.textContent = "";
      bootRafs.push(requestAnimationFrame(frame));
    }, delay));
  }

  function finishBoot() {
    if (!bootLoader || bootTimers === "done") return;
    bootRafs.forEach(cancelAnimationFrame);
    bootTimers.forEach(clearTimeout);
    bootRafs = "done";
    bootTimers = "done";
    bootLoader.classList.add("done");
    bootLoader.setAttribute("aria-hidden", "true");
    document.body.classList.add("is-booted");
    document.body.classList.remove("is-loading");
    document.body.style.overflow = "";
    if (mainElem) mainElem.removeAttribute("inert");
  }

  if (bootLoader) {
    if (mainElem) mainElem.setAttribute("inert", "");
    document.body.style.overflow = "hidden";
    document.body.classList.add("is-loading");
    if (reduceMotion) {
      bootLoader.classList.add("done");
      bootLoader.setAttribute("aria-hidden", "true");
      document.body.classList.add("is-booted");
      document.body.classList.remove("is-loading");
      document.body.style.overflow = "";
      if (mainElem) mainElem.removeAttribute("inert");
    } else {
      var words = bootLoader.querySelectorAll(".boot-word");
      words.forEach(function (el, i) {
        scrambleTo(el, el.getAttribute("data-word") || el.textContent, i * 100);
      });
      bootTimers.push(setTimeout(function () {
        if (bootTagline) bootTagline.classList.add("is-visible");
      }, 600));
      bootTimers.push(setTimeout(finishBoot, 2200));
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
    mobileMenu.setAttribute("aria-hidden", "true");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
  }

  if (menuToggle && mobileMenu) {
    mobileMenu.style.display = "none";
    menuToggle.addEventListener("click", function () {
      var isOpen = mobileMenu.style.display === "flex";
      mobileMenu.style.display = isOpen ? "none" : "flex";
      mobileMenu.setAttribute("aria-hidden", isOpen ? "true" : "false");
      menuToggle.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });
    mobileMenu.querySelectorAll("a, button").forEach(function (el) {
      el.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        menuToggle.click();
      }
      if (e.key === "Escape" && mobileMenu.style.display === "flex") closeMenu();
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) closeMenu();
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
        t.setAttribute("aria-pressed", "false");
      });
      this.classList.add("active");
      this.setAttribute("aria-pressed", "true");
      skillCats.forEach(function (cat) {
        var show = f === "all" || cat.getAttribute("data-skill") === f;
        cat.classList.toggle("hidden", !show);
      });
      updateSkillsCount();
    });
  });

  var skillsCountElem = document.getElementById("skills-count");
  function updateSkillsCount() {
    if (!skillsCountElem) return;
    var visible = document.querySelectorAll(
      ".skill-category:not(.hidden) .skill-chip"
    );
    skillsCountElem.textContent = visible.length;
  }
  updateSkillsCount();

  /* ============ Project Filtering ============ */
  var projectTabs = document.querySelectorAll("[data-project-filter]");
  var projectCards = document.querySelectorAll(".project-card");

  projectTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var f = this.getAttribute("data-project-filter");
      projectTabs.forEach(function (t) {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      this.classList.add("active");
      this.setAttribute("aria-selected", "true");
      projectCards.forEach(function (card) {
        var cats = (card.getAttribute("data-category") || "").split(" ");
        var show = f === "all" || cats.indexOf(f) !== -1;
        card.classList.toggle("hidden", !show);
      });
    });
  });

  var systemTabs = document.querySelectorAll("[data-system]");
  var systemPanel = document.getElementById("system-panel");
  var systemMode = document.getElementById("system-mode");
  var systemTitle = document.getElementById("system-title");
  var systemDescription = document.getElementById("system-description");
  var systemLink = document.getElementById("system-link");
  var systemNote = document.getElementById("system-note");
  var systemFlowNodes = document.querySelectorAll(".flow-node");
  var systemData = {
    validation: {
      accent: "#6366f1",
      mode: "failure mode / validation",
      title: "Make the split honest.",
      description: "When a model is allowed to see the same athlete twice, it learns the shortcut instead of the pattern. I keep the boundary visible and the preprocessing honest.",
      href: "https://github.com/thekarak/Analyticus",
      note: "the boundary is part of the model",
      flow: ["raw signals", "grouped split", "calibrated decision"]
    },
    evidence: {
      accent: "#a855f7",
      mode: "failure mode / evidence",
      title: "Make every claim traceable.",
      description: "Retrieval can add context without adding truth. TruthScope breaks an answer into claims and shows the evidence—or the refusal.",
      href: "https://github.com/thekarak/Reducing-LLM-Hallucinations",
      note: "context is not the same as evidence",
      flow: ["retrieved chunks", "claim check", "verdict"]
    },
    structure: {
      accent: "#ec4899",
      mode: "failure mode / structure",
      title: "Make messy input usable.",
      description: "A schema should create clarity, not erase the person behind the input. RoastMeBuddy is an experiment in structured feedback that still feels specific.",
      href: "https://github.com/thekarak/RoastMeBuddy",
      note: "structure should preserve nuance",
      flow: ["messy input", "strict schema", "useful critique"]
    },
    signal: {
      accent: "#0ea5e9",
      mode: "failure mode / signal",
      title: "Make weak pixels useful.",
      description: "Satellite imagery rarely arrives clean. VARUNA explores how much structure can be recovered before enhancement starts inventing detail.",
      href: "https://github.com/thekarak",
      note: "recover signal without inventing detail",
      flow: ["low-res tile", "super-resolution", "flood map"]
    }
  };

  function selectSystem(key) {
    var item = systemData[key];
    if (!item || !systemPanel) return;
    systemTabs.forEach(function (tab) {
      var active = tab.getAttribute("data-system") === key;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
      tab.setAttribute("tabindex", active ? "0" : "-1");
      if (active) {
        tab.id = "system-tab-" + key;
        systemPanel.setAttribute("aria-labelledby", tab.id);
      }
    });
    systemPanel.style.setProperty("--system-accent", item.accent);
    if (systemMode) systemMode.textContent = item.mode;
    if (systemTitle) systemTitle.textContent = item.title;
    if (systemDescription) systemDescription.textContent = item.description;
    if (systemLink) systemLink.href = item.href;
    if (systemNote) systemNote.textContent = item.note;
    systemFlowNodes.forEach(function (node, index) {
      if (item.flow[index]) node.textContent = item.flow[index];
    });
  }

  systemTabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () {
      selectSystem(this.getAttribute("data-system"));
    });
    tab.addEventListener("keydown", function (event) {
      var nextIndex = index;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") nextIndex = (index + 1) % systemTabs.length;
      else if (event.key === "ArrowUp" || event.key === "ArrowLeft") nextIndex = (index - 1 + systemTabs.length) % systemTabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = systemTabs.length - 1;
      else return;
      event.preventDefault();
      systemTabs[nextIndex].focus();
      selectSystem(systemTabs[nextIndex].getAttribute("data-system"));
    });
  });
  if (systemTabs.length) selectSystem("validation");

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
    modalFocusBefore = document.activeElement;
    var focusable = modal.querySelectorAll(
      "a[href], button:not([disabled]), textarea, input, select"
    );
    modalFocusFirst = focusable.length ? focusable[0] : modal;
    if (modalFocusFirst) modalFocusFirst.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (modalFocusBefore && modalFocusBefore.focus) modalFocusBefore.focus();
    modalFocusBefore = null;
  }

  var modalFocusBefore = null;
  var modalFocusFirst = null;

  if (openResumeBtn) openResumeBtn.addEventListener("click", openModal);
  if (mobileResumeBtn) mobileResumeBtn.addEventListener("click", function () { closeMenu(); openModal(); });
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);

  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeModal();
    });
    modal.addEventListener("keydown", function (event) {
      if (event.key !== "Tab") return;
      var focusable = modal.querySelectorAll(
        "a[href], button:not([disabled]), textarea, input, select"
      );
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
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

  /* ============ Active nav highlight ============ */
  var navLinks = document.querySelectorAll(".topbar a[href^='#']");
  var sections = ["about", "work", "journey", "skills", "notes", "contact"]
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