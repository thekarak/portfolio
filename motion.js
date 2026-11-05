/* Pointer-led orbital study. Real 3D projection, no dependencies. */
(() => {
  'use strict';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine)');
  const portrait = document.querySelector('[data-tilt]');
  let tiltFrame = 0;
  if (portrait) {
    portrait.addEventListener('pointermove', event => {
      if (motion.matches || !fine.matches) return;
      cancelAnimationFrame(tiltFrame);
      tiltFrame = requestAnimationFrame(() => {
        const box = portrait.getBoundingClientRect();
        portrait.style.setProperty('--ry', `${((event.clientX - box.left) / box.width - .5) * 10}deg`);
        portrait.style.setProperty('--rx', `${-((event.clientY - box.top) / box.height - .5) * 10}deg`);
      });
    }, { passive: true });
    portrait.addEventListener('pointerleave', () => {
      cancelAnimationFrame(tiltFrame);
      portrait.style.setProperty('--ry', '0deg');
      portrait.style.setProperty('--rx', '0deg');
    });
  }

  const canvas = document.querySelector('#orbit-canvas');
  const context = canvas?.getContext('2d');
  const art = canvas?.closest('.orbit-art');
  if (!context || !art) return;
  const caption = art.querySelector('.orbit-caption');
  const readout = art.querySelector('.orbit-readout');
  const width = 280, height = 230, radius = 65;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  context.scale(dpr, dpr);
  let ink, line;
  function palette() {
    const styles = getComputedStyle(document.documentElement);
    ink = styles.getPropertyValue('--text').trim();
    line = styles.getPropertyValue('--strong-line').trim();
  }
  palette();

  let frame = 0, last = 0, visible = true;
  let rotation = .35, yaw = 0, pitch = -.32;
  let targetYaw = 0, targetPitch = -.32;
  let velocity = 0, impulse = 0, satelliteAngle = .6;
  let hovering = false, previousX = null, pointerAt = 0;
  let pointerX = 0, pointerY = 0, hoverStrength = 0;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const degrees = radians => {
    const value = Math.round(radians * 180 / Math.PI);
    return `${value < 0 ? '−' : '+'}${Math.abs(value).toString().padStart(2, '0')}°`;
  };

  // All rings, grid lines, and satellites share the same perspective transform.
  function project(x, y, z) {
    const a = rotation + yaw;
    const px = x * Math.cos(a) - z * Math.sin(a);
    const pz = x * Math.sin(a) + z * Math.cos(a);
    const py = y * Math.cos(pitch) - pz * Math.sin(pitch);
    const depth = y * Math.sin(pitch) + pz * Math.cos(pitch);
    const scale = 400 / (400 + depth);
    return [width / 2 + px * scale, height / 2 + py * scale, depth];
  }
  function orbitPoint(t, tilt) {
    return [94 * Math.cos(t), 94 * Math.sin(t) * Math.sin(tilt), 94 * Math.sin(t) * Math.cos(tilt)];
  }
  // Stroke the near and far segments separately so the sphere reads as a volume.
  function curve(points, front, alpha, stroke = ink, thickness = .65) {
    context.beginPath();
    let drawing = false;
    points.forEach(point => {
      const near = point[2] <= 0;
      if (near !== front) { drawing = false; return; }
      if (!drawing) context.moveTo(point[0], point[1]);
      else context.lineTo(point[0], point[1]);
      drawing = true;
    });
    context.strokeStyle = stroke;
    context.globalAlpha = alpha;
    context.lineWidth = thickness;
    context.stroke();
  }
  function draw() {
    context.clearRect(0, 0, width, height);
    // Tiny registration marks give the object the feel of a working diagram.
    context.strokeStyle = line;
    context.lineWidth = .6;
    context.globalAlpha = .5;
    [[22,25],[width-22,25],[22,height-25],[width-22,height-25]].forEach(([x,y]) => {
      context.beginPath(); context.moveTo(x-3,y);context.lineTo(x+3,y);
      context.moveTo(x,y-3);context.lineTo(x,y+3);context.stroke();
    });
    const paths = [];
    for (let meridian = 0; meridian < 10; meridian++) {
      const longitude = meridian / 10 * Math.PI;
      const points = [];
      for (let step = 0; step <= 100; step++) {
        const t = step / 100 * Math.PI * 2;
        points.push(project(radius * Math.cos(t) * Math.cos(longitude), radius * Math.sin(t), radius * Math.cos(t) * Math.sin(longitude)));
      }
      paths.push(points);
    }
    for (let parallel = -2; parallel <= 2; parallel++) {
      const latitude = parallel * Math.PI / 7;
      const r = radius * Math.cos(latitude);
      const points = [];
      for (let step = 0; step <= 100; step++) {
        const t = step / 100 * Math.PI * 2;
        points.push(project(r * Math.cos(t), radius * Math.sin(latitude), r * Math.sin(t)));
      }
      paths.push(points);
    }
    const orbit = [];
    for (let step = 0; step <= 140; step++) orbit.push(project(...orbitPoint(step / 140 * Math.PI * 2, .52)));
    curve(orbit, false, .18, line, .8);
    paths.forEach(points => curve(points, false, .14));
    paths.forEach(points => curve(points, true, .58 + hoverStrength * .14));
    curve(orbit, true, .65, line, .8);
    const satellite = project(...orbitPoint(satelliteAngle, .52));
    context.globalAlpha = satellite[2] > 0 ? .45 : 1;
    context.fillStyle = ink;
    context.beginPath();context.arc(satellite[0],satellite[1],2.5,0,Math.PI*2);context.fill();
    context.globalAlpha *= .22;
    context.beginPath();context.arc(satellite[0],satellite[1],6,0,Math.PI*2);context.stroke();
    if (hoverStrength > .01) {
      context.globalAlpha = hoverStrength * .35;
      context.setLineDash([2, 4]);
      context.beginPath(); context.moveTo(width / 2, height / 2);
      context.lineTo(pointerX, pointerY);context.stroke();context.setLineDash([]);
      context.globalAlpha = hoverStrength * .7;
      context.beginPath();context.arc(pointerX,pointerY,3,0,Math.PI*2);context.stroke();
    }
    context.globalAlpha = 1;
    if (readout) readout.textContent = `${degrees(yaw)} / ${degrees(pitch)}`;
  }

  function tick(time) {
    frame = 0;
    if (!visible || document.hidden || motion.matches) return;
    const dt = last ? Math.min((time - last) / 16.667, 3) : 1;
    last = time;
    const ease = 1 - Math.pow(.92, dt);
    yaw += (targetYaw - yaw) * ease;
    pitch += (targetPitch - pitch) * ease;
    hoverStrength += ((hovering ? 1 : 0) - hoverStrength) * ease;
    velocity += impulse;
    impulse = 0;
    velocity *= Math.pow(.95, dt);
    rotation += (.0012 * (1 - hoverStrength * .8) + velocity) * dt;
    satelliteAngle += .004 * dt;
    // A pointer that stops moving should stop adding momentum.
    if (time - pointerAt > 90) previousX = null;
    draw(); frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    if (motion.matches) {
      yaw = targetYaw = 0; pitch = targetPitch = -.32;
      velocity = impulse = hoverStrength = 0;
      hovering = false; art.classList.remove('is-engaged');
      if (caption) caption.textContent = 'a little perspective';
    }
    draw();
    if (visible && !document.hidden && !motion.matches) frame = requestAnimationFrame(tick);
  }
  // Page movement gently steers the object; moving over it gives direct control.
  document.addEventListener('pointermove', event => {
    if (!visible || motion.matches || !fine.matches || event.pointerType === 'touch') return;
    const box = canvas.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const localX = (event.clientX - box.left) / box.width;
    const localY = (event.clientY - box.top) / box.height;
    const over = localX >= 0 && localX <= 1 && localY >= 0 && localY <= 1;
    const x = over ? (localX - .5) * 2 : (event.clientX / innerWidth - .5) * 2;
    const y = over ? (localY - .5) * 2 : (event.clientY / innerHeight - .5) * 2;
    targetYaw = clamp(x, -1, 1) * (over ? 1.25 : .3);
    targetPitch = -.32 + clamp(y, -1, 1) * (over ? .9 : .22);
    pointerX = localX * width; pointerY = localY * height;
    if (over && previousX !== null) impulse += clamp(event.clientX - previousX, -30, 30) * .00018;
    previousX = over ? event.clientX : null;
    pointerAt = performance.now();
    if (hovering !== over) {
      hovering = over; art.classList.toggle('is-engaged', over);
      if (caption) caption.textContent = over ? 'a change in perspective' : 'a little perspective';
    }
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => {
    hovering = false; previousX = null; targetYaw = 0; targetPitch = -.32;
    art.classList.remove('is-engaged');
    if (caption) caption.textContent = 'a little perspective';
  });
  new MutationObserver(() => { palette(); draw(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(canvas);
  }
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  sync();

  // A small directional response on the closing arrow, never on the text.
  const contact = document.querySelector('.contact');
  contact?.addEventListener('pointermove', event => {
    if (motion.matches || !fine.matches) return;
    const box = contact.getBoundingClientRect();
    contact.style.setProperty('--arrow-x', `${((event.clientX - box.left) / box.width - .5) * 18}px`);
    contact.style.setProperty('--arrow-y', `${((event.clientY - box.top) / box.height - .5) * 14}px`);
  }, { passive: true });
  contact?.addEventListener('pointerleave', () => {
    contact.style.setProperty('--arrow-x', '0px');contact.style.setProperty('--arrow-y', '0px');
  });
  if ('IntersectionObserver' in window && !motion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
    }, { threshold: .08 });
    document.querySelectorAll('.section-head, .tool-list, .note-list').forEach(element => { element.classList.add('reveal-pending'); observer.observe(element); });
  }
})();
