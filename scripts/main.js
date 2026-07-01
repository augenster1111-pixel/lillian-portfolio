function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function runSafely(label, task) {
  try {
    console.log(`[portfolio] ${label}: start`);
    task();
    console.log(`[portfolio] ${label}: ready`);
  } catch (error) {
    console.warn(`[portfolio] ${label}: failed`, error);
  }
}

function deferNonCriticalTask(task) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(task, { timeout: 1800 });
    return;
  }
  window.setTimeout(task, 600);
}

function loadDeferredVideo(video, options = {}) {
  if (!video || video.dataset.loaded === 'true') return;
  const source = video.dataset.src || video.dataset.darkSrc || video.getAttribute('src');
  if (!source) return;

  video.dataset.loaded = 'true';
  video.preload = options.preload || 'metadata';
  video.src = source;
  video.load();
  if (options.play) {
    video.play().catch((error) => {
      console.warn('[portfolio] hero video play skipped', error);
    });
  }
}

function initThemeToggle() {
  const buttons = [...document.querySelectorAll('[data-theme-set]')];
  if (!buttons.length) return;

  const toggle = buttons[0].closest('.theme-toggle');
  const storageKey = 'lillian-portfolio-theme';
  const applyTheme = (theme) => {
    const mode = theme === 'light' ? 'light' : 'dark';
    document.body.classList.toggle('theme-light', mode === 'light');
    if (toggle) toggle.dataset.themeCurrent = mode;
    document.querySelectorAll('.hero-bg-video[data-dark-src][data-light-src]').forEach((video) => {
      const nextSrc = mode === 'light' ? video.dataset.lightSrc : video.dataset.darkSrc;
      video.dataset.src = nextSrc || '';
      if (video.dataset.loaded === 'true' && nextSrc && video.getAttribute('src') !== nextSrc) {
        video.src = nextSrc;
        video.load();
        video.play().catch(() => {});
      }
    });
    buttons.forEach((button) => {
      const isActive = button.dataset.themeSet === mode;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
    localStorage.setItem(storageKey, mode);
  };

  applyTheme(localStorage.getItem(storageKey) || 'dark');

  buttons.forEach((button) => {
    button.addEventListener('click', () => applyTheme(button.dataset.themeSet));
  });
}

function initMobileNavigation() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.nav-links');
  if (!toggle || !nav) return;

  const close = () => {
    nav.classList.remove('is-mobile-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = nav.classList.toggle('is-mobile-open');
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target) && !toggle.contains(event.target)) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
}

function initDeferredHeroVideo() {
  const videos = document.querySelectorAll('.hero-bg-video');
  if (!videos.length) return;

  videos.forEach((video) => {
    video.addEventListener('error', () => {
      console.warn('[portfolio] hero video failed, poster remains visible', video.currentSrc || video.dataset.src);
      video.removeAttribute('src');
      video.load();
    }, { once: true });
  });

  deferNonCriticalTask(() => {
    videos.forEach((video) => loadDeferredVideo(video, { preload: 'metadata', play: true }));
  });
}

runSafely('theme toggle', initThemeToggle);
runSafely('mobile navigation', initMobileNavigation);
runSafely('deferred hero video', initDeferredHeroVideo);
