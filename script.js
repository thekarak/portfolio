/* Small, dependency-free interactions. Core content works without JavaScript. */
(() => {
  'use strict';
  const root = document.documentElement;
  const themeButton = document.querySelector('#theme-toggle');
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  let explicitTheme = false;
  try { explicitTheme = ['light', 'dark'].includes(localStorage.getItem('sk-theme')); } catch {}
  function setTheme(theme, persist = false) {
    root.dataset.theme = theme;
    const dark = theme === 'dark';
    document.querySelector('#theme-color').content = dark ? '#181a18' : '#f8f7f4';
    themeButton.setAttribute('aria-pressed', String(dark));
    themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
    themeButton.title = `Switch to ${dark ? 'light' : 'dark'} theme`;
    if (persist) { explicitTheme = true; try { localStorage.setItem('sk-theme', theme); } catch {} }
  }
  setTheme(root.dataset.theme);
  themeButton.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true));
  systemTheme.addEventListener('change', event => { if (!explicitTheme) setTheme(event.matches ? 'dark' : 'light'); });

  const clocks = [...document.querySelectorAll('#local-clock, #footer-clock')];
  const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  function updateClock() {
    const now = new Date();
    const time = formatter.format(now);
    clocks.forEach(clock => {
      clock.textContent = time;
      clock.dateTime = now.toISOString();
      clock.setAttribute('aria-label', `${time} India Standard Time, Kolkata`);
    });
  }
  let clockTimer;
  function resumeClock() { clearInterval(clockTimer); updateClock(); clockTimer = setInterval(updateClock, 1000); }
  resumeClock();
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearInterval(clockTimer); else resumeClock(); });
  document.querySelector('#year').textContent = new Date().getFullYear();

  const sections = ['about', 'projects', 'notes', 'contact'].map(id => document.getElementById(id));
  const navLinks = [...document.querySelectorAll('[data-section]')];
  const progress = document.querySelector('#scroll-progress-bar');
  let scrollFrame = 0;
  function onScroll() {
    scrollFrame = 0;
    const max = root.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0})`;
    let active = sections[0].id;
    sections.forEach(section => { if (section.getBoundingClientRect().top <= innerHeight * .34) active = section.id; });
    if (innerHeight + scrollY >= root.scrollHeight - 3) active = 'contact';
    navLinks.forEach(link => {
      const selected = link.dataset.section === active;
      link.classList.toggle('is-active', selected);
      if (selected) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  }
  function queueScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(onScroll); }
  addEventListener('scroll', queueScroll, { passive: true });
  addEventListener('resize', queueScroll);
  onScroll();

  const projects = [...document.querySelectorAll('.project')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  filters.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    let count = 0;
    projects.forEach(project => {
      project.hidden = filter !== 'all' && !project.dataset.categories.split(' ').includes(filter);
      project.classList.remove('entering');
      if (!project.hidden) { count++; requestAnimationFrame(() => project.classList.add('entering')); }
    });
    filters.forEach(item => { const selected = item === button; item.classList.toggle('is-active', selected); item.setAttribute('aria-pressed', String(selected)); });
    document.querySelector('#project-count').textContent = `${count} ${count === 1 ? 'project' : 'projects'}`;
    queueScroll();
  }));
  const toggles = [...document.querySelectorAll('.abstract-toggle')];
  toggles.forEach(button => button.addEventListener('click', () => {
    const shouldOpen = button.getAttribute('aria-expanded') !== 'true';
    toggles.forEach(item => {
      const open = item === button && shouldOpen;
      item.setAttribute('aria-expanded', String(open));
      document.getElementById(item.getAttribute('aria-controls')).hidden = !open;
    });
    queueScroll();
  }));
  // In-page project links always reveal their destination, even after filtering.
  document.querySelectorAll('a[href^="#project-"]').forEach(link => link.addEventListener('click', () => {
    filters.find(button => button.dataset.filter === 'all').click();
  }));

  const toast = document.querySelector('#toast');
  let toastTimer;
  function announce(message) {
    toast.textContent = message; toast.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }
  document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    const email = button.dataset.copy;
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(email);
      else {
        const field = document.createElement('textarea'); field.value = email;
        field.style.cssText = 'position:fixed;left:-9999px'; document.body.append(field); field.select();
        const copied = document.execCommand('copy'); field.remove(); button.focus();
        if (!copied) throw new Error('Clipboard unavailable');
      }
      announce('Email address copied. Say hello!');
    } catch { announce(`Copy unavailable — email ${email}`); }
  }));
})();
