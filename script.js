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

  var upcomingToggle = document.getElementById("upcoming-toggle");
  var upcomingCard = document.querySelector(".upcoming-card");
  var upcomingDetail = document.getElementById("upcoming-detail");

  if (upcomingToggle && upcomingCard && upcomingDetail) {
    upcomingToggle.addEventListener("click", function () {
      var open = upcomingToggle.getAttribute("aria-checked") === "true";
      upcomingToggle.setAttribute("aria-checked", open ? "false" : "true");
      upcomingCard.classList.toggle("is-open", !open);
      upcomingDetail.setAttribute("aria-hidden", open ? "true" : "false");
    });
  }

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
  var navLinks = document.querySelectorAll(".topbar a[href^='#'], .section-tabs a[href^='#']");
  var sections = ["about", "upcoming", "work", "lab", "journey", "skills", "notes", "contact"]
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

  /* ============ TruthScope hallucination explorer ============ */
  var tsClaims = document.getElementById("ts-claims");
  if (tsClaims) {
    var TS_MODES = [
      { key: "baseline", label: "Baseline" },
      { key: "loose", label: "Loose Top-3" },
      { key: "strict", label: "Strict Top-3" }
    ];

    var TS_QUESTIONS = [
      {
        label: "Apollo 13",
        prompt: "How did the Apollo 13 crew survive the oxygen tank explosion?",
        modes: {
          baseline: {
            halluc: 0.933,
            f1: 0.22,
            claims: [
              { t: "The oxygen tank exploded during the trans-lunar coast.", ok: true },
              { t: "The crew used the Lunar Module as a lifeboat to survive.", ok: true },
              { t: "NASA launched a rescue shuttle that docked with the crippled craft.", ok: false },
              { t: "An emergency spacewalk repaired the damaged oxygen tank.", ok: false },
              { t: "The crew was returned to Earth by a Soviet Soyuz capsule.", ok: false }
            ],
            evidence: []
          },
          loose: {
            halluc: 0.44,
            f1: 0.58,
            claims: [
              { t: "The oxygen tank exploded during the trans-lunar coast.", ok: true, cite: "mission timeline" },
              { t: "The crew used the Lunar Module as a lifeboat to survive.", ok: true, cite: "LM lifeboat role" },
              { t: "NASA launched a rescue shuttle that docked with the crippled craft.", ok: false },
              { t: "An emergency spacewalk repaired the damaged oxygen tank.", ok: false },
              { t: "Mission Control used a free-return trajectory around the Moon.", ok: true, cite: "flight plan" }
            ],
            evidence: [
              { title: "Apollo 13 mission timeline", text: "Oxygen tank 2 ruptured 13 April 1970 during the trans-lunar coast.", relevant: true },
              { title: "LM lifeboat role", text: "The Lunar Module was used as a lifeboat after the Service Module was disabled.", relevant: true },
              { title: "Skylab / Apollo-Soyuz procedures", text: "Later docking and crew-rotation procedures from unrelated missions.", relevant: false }
            ]
          },
          strict: {
            halluc: 0.067,
            f1: 0.85,
            claims: [
              { t: "The oxygen tank exploded during the trans-lunar coast.", ok: true, cite: "mission timeline" },
              { t: "The crew used the Lunar Module as a lifeboat to survive.", ok: true, cite: "LM lifeboat role" },
              { t: "Mission Control executed a free-return trajectory around the Moon.", ok: true, cite: "flight plan" },
              { t: "The crew performed an emergency spacewalk to patch the tank.", ok: false },
              { t: "Carbon-dioxide scrubbers were adapted with spare materials.", ok: true, cite: "scrubber improvisation" }
            ],
            evidence: [
              { title: "Mission timeline", text: "O2 tank 2 ruptured 13 Apr 1970 during the trans-lunar coast; crew survived using the Lunar Module.", relevant: true },
              { title: "Flight plan", text: "A free-return trajectory and the PC+2 burn corrected the return path.", relevant: true },
              { title: "Mission log", text: "Improvised CO2 scrubber ('mailbox') built from duct tape and CM canisters.", relevant: true }
            ]
          }
        }
      },
      {
        label: "Voyager 2",
        prompt: "What did Voyager 2 discover at Neptune?",
        modes: {
          baseline: {
            halluc: 0.9,
            f1: 0.24,
            claims: [
              { t: "Voyager 2 discovered the Great Dark Spot in Neptune's atmosphere.", ok: true },
              { t: "Voyager 2 found active nitrogen geysers on Triton.", ok: true },
              { t: "Voyager 2 landed a probe on Triton and returned soil samples.", ok: false },
              { t: "Neptune's magnetic axis is perfectly aligned with its rotation axis.", ok: false },
              { t: "Voyager 2 detected a solid continent beneath Neptune's clouds.", ok: false }
            ],
            evidence: []
          },
          loose: {
            halluc: 0.4,
            f1: 0.6,
            claims: [
              { t: "Voyager 2 discovered the Great Dark Spot in Neptune's atmosphere.", ok: true, cite: "Neptune imaging" },
              { t: "Voyager 2 found active nitrogen geysers on Triton.", ok: true, cite: "Triton plumes" },
              { t: "Voyager 2 landed a probe on Triton and returned soil samples.", ok: false },
              { t: "Neptune's magnetic axis is tilted far from its rotation axis.", ok: true, cite: "magnetic field" },
              { t: "Voyager 2 confirmed Neptune's ring arcs during the flyby.", ok: true, cite: "ring arcs" }
            ],
            evidence: [
              { title: "Neptune encounter", text: "Voyager 2 flyby on 25 Aug 1989 imaged the Great Dark Spot and ring arcs.", relevant: true },
              { title: "Triton surface", text: "Geyser-like plumes of nitrogen were observed on Triton.", relevant: true },
              { title: "Galileo Jupiter probe", text: "Atmospheric-entry data from the Galileo mission at Jupiter.", relevant: false }
            ]
          },
          strict: {
            halluc: 0.05,
            f1: 0.86,
            claims: [
              { t: "Voyager 2 discovered the Great Dark Spot in Neptune's atmosphere.", ok: true, cite: "Neptune imaging" },
              { t: "Voyager 2 found active nitrogen geysers on Triton.", ok: true, cite: "Triton plumes" },
              { t: "Neptune's magnetic axis is tilted about 47° from its rotation axis.", ok: true, cite: "magnetic field" },
              { t: "Voyager 2 confirmed Neptune's ring arcs during the flyby.", ok: true, cite: "ring arcs" },
              { t: "Voyager 2 landed a probe on Triton and returned soil samples.", ok: false }
            ],
            evidence: [
              { title: "Neptune encounter", text: "25 Aug 1989 flyby imaged the Great Dark Spot and Neptune's ring arcs.", relevant: true },
              { title: "Triton surface", text: "Nitrogen geyser plumes and a thin atmosphere were detected on Triton.", relevant: true },
              { title: "Magnetic field", text: "Neptune's magnetic field is tilted roughly 47° from its rotation axis.", relevant: true }
            ]
          }
        }
      },
      {
        label: "Mars Climate Orbiter",
        prompt: "Why did the Mars Climate Orbiter mission fail?",
        modes: {
          baseline: {
            halluc: 0.95,
            f1: 0.18,
            claims: [
              { t: "The orbiter was lost due to a unit mismatch between spacecraft and ground software.", ok: true },
              { t: "The root cause was pound-force-seconds versus newton-seconds.", ok: true },
              { t: "A solar flare disabled the navigation system during cruise.", ok: false },
              { t: "The spacecraft was later recovered and repurposed.", ok: false },
              { t: "A software virus corrupted the trajectory model.", ok: false }
            ],
            evidence: []
          },
          loose: {
            halluc: 0.46,
            f1: 0.55,
            claims: [
              { t: "The orbiter was lost due to a unit mismatch between spacecraft and ground software.", ok: true, cite: "mishap board" },
              { t: "The root cause was pound-force-seconds versus newton-seconds.", ok: true, cite: "unit mismatch" },
              { t: "A solar flare disabled the navigation system during cruise.", ok: false },
              { t: "The spacecraft passed too low and broke up in the atmosphere.", ok: true, cite: "orbit insertion" },
              { t: "A software virus corrupted the trajectory model.", ok: false }
            ],
            evidence: [
              { title: "Mishap board report", text: "Navigation error traced to English units vs metric units in the thrust data.", relevant: true },
              { title: "Orbit insertion", text: "Contact was lost 23 Sept 1999 as the spacecraft passed too low.", relevant: true },
              { title: "Mars Global Surveyor", text: "Aerobraking schedule for a different orbiter.", relevant: false }
            ]
          },
          strict: {
            halluc: 0.0,
            f1: 0.88,
            claims: [
              { t: "The orbiter was lost due to a unit mismatch between spacecraft and ground software.", ok: true, cite: "mishap board" },
              { t: "The root cause was pound-force-seconds versus newton-seconds.", ok: true, cite: "unit mismatch" },
              { t: "The spacecraft passed too low and broke up in the atmosphere.", ok: true, cite: "trajectory analysis" },
              { t: "A software virus corrupted the trajectory model.", ok: false },
              { t: "Communication was lost during orbit insertion on 23 Sept 1999.", ok: true, cite: "loss of contact" }
            ],
            evidence: [
              { title: "Mishap board report", text: "Spacecraft software used lbf·s while ground tools expected N·s.", relevant: true },
              { title: "Trajectory analysis", text: "Planned perihelion ~226 km; the craft entered at ~57 km, too low.", relevant: true },
              { title: "Loss of contact", text: "Communication was lost on 23 Sept 1999 during orbit insertion.", relevant: true }
            ]
          }
        }
      }
    ];

    var tsState = { q: 0, mode: "strict" };
    var tsQuestionEl = document.getElementById("ts-questions");
    var tsModeEl = document.getElementById("ts-modes");
    var tsChunks = document.getElementById("ts-chunks");
    var tsPrompt = document.getElementById("ts-prompt");
    var tsClaimCount = document.getElementById("ts-claim-count");
    var tsEvidenceCount = document.getElementById("ts-evidence-count");
    var tsHallucFill = document.getElementById("ts-halluc-fill");
    var tsHallucValue = document.getElementById("ts-halluc-value");
    var tsF1Fill = document.getElementById("ts-f1-fill");
    var tsF1Value = document.getElementById("ts-f1-value");

    function buildTsPills() {
      TS_QUESTIONS.forEach(function (q, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "ts-pill";
        b.textContent = q.label;
        b.addEventListener("click", function () { tsState.q = i; renderTS(); });
        tsQuestionEl.appendChild(b);
      });
      TS_MODES.forEach(function (m) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "ts-pill";
        b.textContent = m.label;
        b.addEventListener("click", function () { tsState.mode = m.key; renderTS(); });
        tsModeEl.appendChild(b);
      });
    }

    function renderTS() {
      var q = TS_QUESTIONS[tsState.q];
      var data = q.modes[tsState.mode];

      Array.prototype.forEach.call(tsQuestionEl.children, function (b, i) {
        b.classList.toggle("is-active", i === tsState.q);
      });
      Array.prototype.forEach.call(tsModeEl.children, function (b, i) {
        b.classList.toggle("is-active", TS_MODES[i].key === tsState.mode);
      });

      tsPrompt.textContent = q.prompt;

      tsClaims.innerHTML = "";
      data.claims.forEach(function (c) {
        var li = document.createElement("li");
        li.className = "ts-claim " + (c.ok ? "is-ok" : "is-bad");
        var mark = document.createElement("span");
        mark.className = "ts-claim-mark";
        mark.textContent = c.ok ? "\u2713" : "\u00d7";
        var body = document.createElement("div");
        body.className = "ts-claim-body";
        var text = document.createElement("p");
        text.className = "ts-claim-text";
        text.textContent = c.t;
        var cite = document.createElement("span");
        cite.className = "ts-claim-cite" + (c.ok ? "" : " flag");
        cite.textContent = c.ok ? (c.cite ? "\u2192 " + c.cite : "\u2192 grounded") : "\u2192 no supporting evidence";
        body.appendChild(text);
        body.appendChild(cite);
        li.appendChild(mark);
        li.appendChild(body);
        tsClaims.appendChild(li);
      });
      tsClaimCount.textContent = data.claims.length + " claims";

      tsChunks.innerHTML = "";
      if (data.evidence && data.evidence.length) {
        data.evidence.forEach(function (e) {
          var li = document.createElement("li");
          li.className = "ts-chunk";
          var head = document.createElement("div");
          head.className = "ts-chunk-head";
          var title = document.createElement("span");
          title.className = "ts-chunk-title";
          title.textContent = e.title;
          var tag = document.createElement("span");
          tag.className = "ts-chunk-tag " + (e.relevant ? "on" : "off");
          tag.textContent = e.relevant ? "relevant" : "off-topic";
          head.appendChild(title);
          head.appendChild(tag);
          var txt = document.createElement("p");
          txt.className = "ts-chunk-text";
          txt.textContent = e.text;
          li.appendChild(head);
          li.appendChild(txt);
          tsChunks.appendChild(li);
        });
        tsEvidenceCount.textContent = data.evidence.length + " chunks";
      } else {
        var empty = document.createElement("li");
        empty.className = "ts-empty";
        empty.textContent = "no retrieval \u2014 answer generated from parametric memory";
        tsChunks.appendChild(empty);
        tsEvidenceCount.textContent = "0 chunks";
      }

      tsHallucValue.textContent = Math.round(data.halluc * 100) + "%";
      tsHallucFill.style.width = Math.round(data.halluc * 100) + "%";
      tsF1Value.textContent = data.f1.toFixed(2);
      tsF1Fill.style.width = Math.round(data.f1 * 100) + "%";
    }

    buildTsPills();
    renderTS();
  }

  /* ============ Share & utilities ============ */
  function copyText(text) {
    function done() { showToast("Copied " + text + " to clipboard! \u2713"); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text);
      done();
    }
  }

  function downloadCv() {
    var a = document.createElement("a");
    a.href = "assets/resume.pdf";
    a.download = "Sourasis_Karak_Resume.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function goTo(hash) {
    var el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toggleThemeCmd() {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    safeSet(next);
  }

  function sharePage() {
    var url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: "Sourasis Karak \u2014 ML & Data Science",
        text: "Portfolio of Sourasis Karak",
        url: url
      }).catch(function () { });
    } else {
      copyText(url);
    }
  }

  var shareBtn = document.getElementById("share-btn");
  if (shareBtn) shareBtn.addEventListener("click", sharePage);

  /* ============ Command palette ============ */
  var palette = document.getElementById("command-palette");
  var paletteInput = document.getElementById("command-input");
  var paletteList = document.getElementById("command-list");
  var paletteOpenBtn = document.getElementById("command-open-btn");
  var commandItems = [];
  var activeIndex = 0;
  var paletteFocusBefore = null;

  var commands = [
    { label: "Go to About", hint: "jump", action: function () { goTo("#about"); } },
    { label: "Go to Upcoming", hint: "jump", action: function () { goTo("#upcoming"); } },
    { label: "Go to Work", hint: "jump", action: function () { goTo("#work"); } },
    { label: "Go to Hallucination explorer", hint: "lab", action: function () { goTo("#lab"); } },
    { label: "Go to Journey", hint: "jump", action: function () { goTo("#journey"); } },
    { label: "Go to Skills", hint: "jump", action: function () { goTo("#skills"); } },
    { label: "Go to Notes", hint: "jump", action: function () { goTo("#notes"); } },
    { label: "Go to Contact", hint: "jump", action: function () { goTo("#contact"); } },
    { label: "Copy email", hint: "soykarak@gmail.com", action: function () { copyText("soykarak@gmail.com"); } },
    { label: "Toggle theme", hint: "light / dark", action: toggleThemeCmd },
    { label: "Open resume", hint: "preview", action: openModal },
    { label: "Download CV", hint: "pdf", action: downloadCv },
    { label: "Share this page", hint: "share", action: sharePage }
  ];

  function paintActive() {
    Array.prototype.forEach.call(paletteList.children, function (li, i) {
      li.classList.toggle("is-active", i === activeIndex);
    });
    var activeEl = paletteList.children[activeIndex];
    if (activeEl && activeEl.scrollIntoView) activeEl.scrollIntoView({ block: "nearest" });
  }

  function renderCommands(query) {
    if (!paletteList) return;
    var q = (query || "").trim().toLowerCase();
    paletteList.innerHTML = "";
    commandItems = commands.filter(function (c) {
      return !q ||
        c.label.toLowerCase().indexOf(q) !== -1 ||
        (c.hint && c.hint.toLowerCase().indexOf(q) !== -1);
    });
    if (!commandItems.length) {
      var empty = document.createElement("li");
      empty.className = "command-empty";
      empty.textContent = "no matching commands";
      paletteList.appendChild(empty);
      activeIndex = -1;
      return;
    }
    commandItems.forEach(function (c) {
      var li = document.createElement("li");
      li.className = "command-item";
      li.setAttribute("role", "option");
      var label = document.createElement("span");
      label.className = "command-item-label";
      label.textContent = c.label;
      li.appendChild(label);
      if (c.hint) {
        var hint = document.createElement("span");
        hint.className = "command-item-hint";
        hint.textContent = c.hint;
        li.appendChild(hint);
      }
      li.addEventListener("click", function () { runCommand(c); });
      paletteList.appendChild(li);
    });
    activeIndex = 0;
    paintActive();
  }

  function runCommand(c) {
    closePalette();
    if (c && c.action) c.action();
  }

  function openPalette() {
    if (!palette) return;
    paletteFocusBefore = document.activeElement;
    palette.classList.add("open");
    palette.setAttribute("aria-hidden", "false");
    if (paletteInput) paletteInput.value = "";
    renderCommands("");
    if (paletteInput) paletteInput.focus();
  }

  function closePalette() {
    if (!palette) return;
    palette.classList.remove("open");
    palette.setAttribute("aria-hidden", "true");
    if (paletteFocusBefore && paletteFocusBefore.focus) paletteFocusBefore.focus();
    paletteFocusBefore = null;
  }

  if (paletteOpenBtn) paletteOpenBtn.addEventListener("click", openPalette);
  if (palette) {
    palette.addEventListener("click", function (event) {
      if (event.target === palette) closePalette();
    });
  }
  if (paletteInput) {
    paletteInput.addEventListener("input", function () { renderCommands(this.value); });
    paletteInput.addEventListener("keydown", function (event) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (commandItems.length) { activeIndex = (activeIndex + 1) % commandItems.length; paintActive(); }
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        if (commandItems.length) { activeIndex = (activeIndex - 1 + commandItems.length) % commandItems.length; paintActive(); }
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (activeIndex >= 0 && commandItems[activeIndex]) runCommand(commandItems[activeIndex]);
      } else if (event.key === "Escape") {
        event.preventDefault();
        closePalette();
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (palette && palette.classList.contains("open")) closePalette();
      else openPalette();
    }
  });

})();