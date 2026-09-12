(function () {
  var STORAGE_KEY = "sk-theme";
  var root = document.body;
  var themeToggle = document.getElementById("theme-toggle");

  /* ============ Theme switcher ============ */
  function safeGet() {
    try { return localStorage.getItem(STORAGE_KEY); }
    catch (e) { return null; }
  }

  function safeSet(value) {
    try { localStorage.setItem(STORAGE_KEY, value); }
    catch (e) { }
  }

  function systemPrefersLight() {
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches;
  }

  var saved = safeGet();
  var initial = saved || (systemPrefersLight() ? "light" : "dark");
  root.setAttribute("data-theme", initial);

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      var next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      safeSet(next);
    });
  }

  /* ============ Project Filtering ============ */
  var filterButtons = document.querySelectorAll(".filter-btn");
  var projects = document.querySelectorAll(".project");

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var filterValue = this.getAttribute("data-filter");

      filterButtons.forEach(function (btn) {
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
      });
      this.classList.add("active");
      this.setAttribute("aria-selected", "true");

      projects.forEach(function (project) {
        var categories = (project.getAttribute("data-category") || "").split(" ");
        if (filterValue === "all" || categories.indexOf(filterValue) !== -1) {
          project.classList.remove("hidden");
        } else {
          project.classList.add("hidden");
        }
      });
    });
  });

  /* ============ Interactive Cursor Spotlight on Cards ============ */
  var interactiveCards = document.querySelectorAll(".interactive-card");
  interactiveCards.forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", x + "px");
      card.style.setProperty("--mouse-y", y + "px");
    });
  });

  /* ============ Scroll Reveal Animation ============ */
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

  var copyTriggers = document.querySelectorAll(".copy-trigger");
  copyTriggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var textToCopy = this.getAttribute("data-copy") || "soykarak@gmail.com";
      var labelElem = this.querySelector(".copy-label");
      var originalLabel = labelElem ? labelElem.textContent : "";

      function handleSuccess() {
        if (labelElem) {
          labelElem.textContent = "Copied! ✓";
          setTimeout(function () {
            labelElem.textContent = originalLabel;
          }, 2000);
        }
        showToast("Copied " + textToCopy + " to clipboard! ✓");
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
    try {
      document.execCommand("copy");
    } catch (err) { }
    document.body.removeChild(textArea);
  }

  /* ============ Resume Modal ============ */
  var modal = document.getElementById("resume-modal");
  var openResumeBtn = document.getElementById("open-resume-btn");
  var heroPreviewBtn = document.getElementById("hero-preview-btn");
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
  if (heroPreviewBtn) heroPreviewBtn.addEventListener("click", openModal);
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);

  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal && modal.classList.contains("open")) {
      closeModal();
    }
  });

  /* ============ Unique Browser / Device Views Counter ============ */
  var viewsCountElem = document.getElementById("views-count");
  var UNIQUE_KEY = "sk_unique_view_time";
  var CACHED_KEY = "sk_cached_view_count";
  var ONE_DAY_MS = 24 * 60 * 60 * 1000;

  function formatCount(num) {
    return Number(num).toLocaleString();
  }

  function animateCount(targetElem, targetNum) {
    var duration = 900;
    var startTime = null;
    var startNum = 0;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var ease = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(startNum + (targetNum - startNum) * ease);
      targetElem.textContent = formatCount(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        targetElem.textContent = formatCount(targetNum);
      }
    }
    requestAnimationFrame(step);
  }

  function initViewsCounter() {
    if (!viewsCountElem) return;

    var cached = safeGetItem(CACHED_KEY);
    if (cached) {
      viewsCountElem.textContent = formatCount(cached);
    }

    var lastVisit = safeGetItem(UNIQUE_KEY);
    var now = Date.now();
    var isNewDeviceOrDay = !lastVisit || (now - parseInt(lastVisit, 10)) > ONE_DAY_MS;

    var endpoint = "https://api.visitorbadge.io/api/visitors?path=thekarak.selfwebsite";

    fetch(endpoint)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (svgText) {
        var match = svgText.match(/VISITORS:\s*(\d+)/i);
        if (match && match[1]) {
          var count = parseInt(match[1], 10);
          safeSetItem(CACHED_KEY, count);
          if (isNewDeviceOrDay) {
            safeSetItem(UNIQUE_KEY, now.toString());
          }
          animateCount(viewsCountElem, count);
        }
      })
      .catch(function (err) {
        if (cached) {
          viewsCountElem.textContent = formatCount(cached);
        } else {
          viewsCountElem.textContent = "1";
        }
      });
  }

  function safeGetItem(key) {
    try { return localStorage.getItem(key); }
    catch (e) { return null; }
  }

  function safeSetItem(key, val) {
    try { localStorage.setItem(key, val); }
    catch (e) { }
  }

  initViewsCounter();

})();
