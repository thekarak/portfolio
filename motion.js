/* Minimal theme-aware background motion (Canvas 2D, no dependencies).
   dark  -> drifting 3D starfield + glowing falling comets
   light -> floating dust motes + falling ink strokes on paper
   Respects prefers-reduced-motion and pauses when the tab is hidden. */
(function () {
  var canvas = document.getElementById("bg-motion");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var W = 0, H = 0, DPR = 1, cx = 0, cy = 0;
  var mode = "dark";
  var rafId = null;
  var lastTs = 0;
  var nextStreakAt = 0;

  var accent = "#b4552e";
  var inkRGB = "58,54,49";
  var starRGB = "198,198,192";

  var stars = [];
  var comets = [];
  var motes = [];
  var drops = [];
  var ripples = [];

  function readTheme() {
    var cs = getComputedStyle(document.documentElement);
    accent = (cs.getPropertyValue("--accent") || "#b4552e").trim() || "#b4552e";
    var next = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    starRGB = next === "dark" ? "198,198,192" : "52,50,46";
    inkRGB = next === "dark" ? "198,198,192" : "58,54,49";
    if (next !== mode) {
      mode = next;
      comets = [];
      drops = [];
      ripples = [];
      initParticles();
    }
  }

  function hexToRgba(hex, alpha) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    var n = parseInt(hex, 16);
    if (isNaN(n)) return "rgba(180,85,46," + alpha + ")";
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + alpha + ")";
  }

  /* ---------- particles ---------- */
  function makeStar(spread) {
    return { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: spread ? Math.random() * 0.95 + 0.05 : 1, k: 0.6 + Math.random() * 0.9 };
  }

  function makeMote() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: 0.8 + Math.random() * 1.6,
      a: 0.07 + Math.random() * 0.18,
      vx: (Math.random() - 0.5) * 0.24,
      vy: -(0.05 + Math.random() * 0.3),
      sway: 3 + Math.random() * 12,
      phase: Math.random() * Math.PI * 2,
      speed: 0.004 + Math.random() * 0.012
    };
  }

  function initParticles() {
    if (mode === "dark") {
      var target = Math.round(Math.min(300, Math.max(80, (W * H) / 11000)));
      stars = [];
      for (var i = 0; i < target; i++) stars.push(makeStar(true));
    } else {
      var count = Math.round(Math.min(150, Math.max(50, (W * H) / 16000)));
      motes = [];
      for (var j = 0; j < count; j++) motes.push(makeMote());
    }
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx = W / 2;
    cy = H / 2;
    initParticles();
  }

  /* ---------- dark mode ---------- */
  function project(s, z) {
    var zz = Math.max(z, 0.03);
    return { x: cx + (s.x / zz) * W * 0.45, y: cy + (s.y / zz) * H * 0.45 };
  }

  function spawnComet() {
    var dir = Math.random() < 0.5 ? 1 : -1;
    var ang = Math.PI / 2 + dir * (0.24 + Math.random() * 0.44);
    var speed = 4.5 + Math.random() * 5;
    comets.push({
      x: W * (0.08 + Math.random() * 0.84),
      y: -90 - Math.random() * 60,
      vx: Math.cos(ang) * speed,
      vy: Math.abs(Math.sin(ang)) * speed,
      len: 130 + Math.random() * 200
    });
  }

  function drawStars(step) {
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var prevZ = s.z;
      if (step) {
        s.z -= 0.0021 * s.k * step;
        if (s.z <= 0.04) { s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; s.z = 1; prevZ = 1; }
      }
      var cur = project(s, s.z);
      var prev = project(s, prevZ);
      var t = 1 - s.z;
      ctx.strokeStyle = "rgba(" + starRGB + "," + (0.10 + t * 0.40).toFixed(3) + ")";
      ctx.lineWidth = 0.4 + t * 1.15;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(cur.x, cur.y);
      ctx.stroke();
    }
  }

  function drawComets() {
    for (var j = comets.length - 1; j >= 0; j--) {
      var c = comets[j];
      var d = Math.sqrt(c.vx * c.vx + c.vy * c.vy) || 1;
      var tailX = c.x - (c.vx / d) * c.len;
      var tailY = c.y - (c.vy / d) * c.len;

      var g = ctx.createLinearGradient(c.x, c.y, tailX, tailY);
      g.addColorStop(0, hexToRgba(accent, 0.85));
      g.addColorStop(0.35, hexToRgba(accent, 0.30));
      g.addColorStop(1, hexToRgba(accent, 0));

      ctx.strokeStyle = g;
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      ctx.fillStyle = hexToRgba(accent, 0.9);
      ctx.beginPath();
      ctx.arc(c.x, c.y, 1.7, 0, Math.PI * 2);
      ctx.fill();

      if (c.y > H + 260 || c.x < -320 || c.x > W + 320) comets.splice(j, 1);
    }
  }

  /* ---------- light mode ---------- */
  function drawMotes(step) {
    for (var i = 0; i < motes.length; i++) {
      var m = motes[i];
      if (step) {
        m.phase += m.speed * step;
        m.x += m.vx * step + Math.sin(m.phase) * 0.12 * step;
        m.y += m.vy * step;
        if (m.y < -20) { m.y = H + 20; m.x = Math.random() * W; }
        if (m.y > H + 20) { m.y = -20; m.x = Math.random() * W; }
        if (m.x < -20) m.x = W + 20;
        if (m.x > W + 20) m.x = -20;
      }
      ctx.fillStyle = "rgba(" + inkRGB + "," + m.a.toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function spawnDrop() {
    var dir = Math.random() < 0.5 ? 1 : -1;
    var ang = Math.PI / 2 + dir * (0.18 + Math.random() * 0.5);
    var speed = 5.5 + Math.random() * 4.5;
    drops.push({
      x: W * (0.1 + Math.random() * 0.8),
      y: -60 - Math.random() * 40,
      vx: Math.cos(ang) * speed,
      vy: Math.abs(Math.sin(ang)) * speed,
      len: 70 + Math.random() * 120,
      w: 1.6 + Math.random() * 1.8,
      bloomAt: H * (0.28 + Math.random() * 0.42)
    });
  }

  function bloom(x, y) {
    var maxR = 26 + Math.random() * 62;
    ripples.push({ x: x, y: y, age: 0, delay: 0, maxR: maxR, peak: 0.30 });
    ripples.push({ x: x, y: y, age: 0, delay: 0.22, maxR: maxR * 0.6, peak: 0.16 });
  }

  function drawDrops(step) {
    for (var j = drops.length - 1; j >= 0; j--) {
      var c = drops[j];
      if (step) { c.x += c.vx * step; c.y += c.vy * step; }

      var d = Math.sqrt(c.vx * c.vx + c.vy * c.vy) || 1;
      var tx = c.x - (c.vx / d) * c.len;
      var ty = c.y - (c.vy / d) * c.len;

      var g = ctx.createLinearGradient(c.x, c.y, tx, ty);
      g.addColorStop(0, "rgba(" + inkRGB + ",0.55)");
      g.addColorStop(0.5, "rgba(" + inkRGB + ",0.16)");
      g.addColorStop(1, "rgba(" + inkRGB + ",0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = c.w;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      ctx.fillStyle = hexToRgba(accent, 0.85);
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.w * 0.7, 0, Math.PI * 2);
      ctx.fill();

      if (step && c.y >= c.bloomAt) { bloom(c.x, c.y); drops.splice(j, 1); continue; }
      if (c.y > H + 80 || c.x < -120 || c.x > W + 120) drops.splice(j, 1);
    }
  }

  function drawRipples(step) {
    for (var j = ripples.length - 1; j >= 0; j--) {
      var r = ripples[j];
      if (step) r.age += step * 0.011;
      var t = r.age - r.delay;
      if (t < 0) continue;
      if (t >= 1) { ripples.splice(j, 1); continue; }
      var e = 1 - Math.pow(1 - t, 2);
      var alpha = Math.pow(1 - t, 1.6) * r.peak;
      ctx.strokeStyle = "rgba(" + inkRGB + "," + alpha.toFixed(3) + ")";
      ctx.lineWidth = Math.max(1.5 * (1 - t * 0.5), 0.4);
      ctx.beginPath();
      ctx.arc(r.x, r.y, e * r.maxR, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  /* ---------- loop ---------- */
  function frame(ts) {
    var step = lastTs ? Math.min((ts - lastTs) / 16.67, 3) : 1;
    lastTs = ts;

    ctx.clearRect(0, 0, W, H);

    if (mode === "dark") {
      drawStars(step);
      if (ts > nextStreakAt && comets.length < 2) { spawnComet(); nextStreakAt = ts + 3200 + Math.random() * 4200; }
      drawComets();
    } else {
      drawMotes(step);
      drawRipples(step);
      if (ts > nextStreakAt && drops.length < 3) { spawnDrop(); nextStreakAt = ts + 1400 + Math.random() * 2000; }
      drawDrops(step);
    }

    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (rafId !== null) return;
    lastTs = 0;
    nextStreakAt = performance.now() + 1200 + Math.random() * 2600;
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  }

  function renderStatic() {
    ctx.clearRect(0, 0, W, H);
    if (mode === "dark") drawStars(0);
    else drawMotes(0);
  }

  function onResize() {
    resize();
    if (reduce) renderStatic();
  }

  readTheme();
  resize();

  if (reduce) {
    renderStatic();
  } else {
    start();
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });
  }

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(onResize, 150);
  });

  if ("MutationObserver" in window) {
    new MutationObserver(function () {
      var before = mode;
      readTheme();
      if (mode !== before && reduce) renderStatic();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }
})();
