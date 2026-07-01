function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

try {
  document.body.classList.toggle('theme-light', localStorage.getItem('lillian-portfolio-theme') === 'light');
} catch (error) {
  document.body.classList.remove('theme-light');
}

function shuffleItems(items) {
  const cloned = [...items];
  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [cloned[index], cloned[swapIndex]] = [cloned[swapIndex], cloned[index]];
  }
  return cloned;
}

function buildCard(item, mediaBase) {
  const type = item.type === 'video' ? 'video' : 'image';
  const sizeClass = item.size ? ` masonry-${item.size}` : '';
  const videoClass = type === 'video' ? ' masonry-video' : '';
  const src = `${mediaBase}${item.src}`;
  const title = escapeHtml(item.title || item.label || 'Other Work');
  const caption = escapeHtml(item.label || title);
  const badge = item.badge ? `<span class="video-badge">${escapeHtml(item.badge)}</span>` : '';
  const poster = item.poster || item.image || '../media/project/04-other-project.webp';
  const posterSrc = poster.includes('/') ? poster : `${mediaBase}${poster}`;
  const media = type === 'video'
    ? `<video data-src="${escapeHtml(src)}" poster="${escapeHtml(posterSrc)}" muted loop playsinline preload="none"></video>${badge}`
    : `<img src="${escapeHtml(src)}" alt="${title}" loading="lazy" decoding="async">`;

  return `<figure class="masonry-item${sizeClass}${videoClass}" data-preview-type="${type}" data-preview-src="${escapeHtml(src)}" data-preview-title="${title}" tabindex="0">${media}<figcaption>${caption}</figcaption></figure>`;
}

function buildGroupHeading(title) {
  return `
    <div class="other-works-group-heading" aria-hidden="true">
      <h2>${escapeHtml(title)}</h2>
      <p>点击预览</p>
    </div>
  `;
}

function renderArchiveCopy() {
  const archive = window.OTHER_WORKS_DATA?.archive;
  if (!archive) return;

  const pairs = [
    ['[data-archive-nav-title]', archive.navTitle],
    ['[data-archive-nav-subtitle]', archive.navSubtitle],
    ['[data-archive-eyebrow]', archive.eyebrow],
    ['[data-archive-description]', archive.description],
    ['[data-archive-footer]', archive.footer]
  ];

  pairs.forEach(([selector, value]) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = value || '';
  });

  const title = document.querySelector('[data-archive-title]');
  if (title) title.innerHTML = archive.titleHtml || '';
  document.title = `${archive.navTitle || 'Other Works'} – Lillian`;
}

function initVariableProximity(root = document) {
  if (window.matchMedia('(max-width: 768px), (hover: none), (pointer: coarse)').matches) return;

  const targets = [...root.querySelectorAll('[data-variable-proximity]')].filter((target) => !target.dataset.vpReady);
  if (!targets.length) return;

  const escapeChar = (value) => value === ' ' ? '&nbsp;' : escapeHtml(value);
  const buildLine = (line) => line
    .split(/(\s+)/)
    .map((word) => {
      if (!word.trim()) return `<span class="vp-word">${word.split('').map(escapeChar).join('')}</span>`;
      return `<span class="vp-word">${[...word].map((char) => `<span class="vp-letter">${escapeChar(char)}</span>`).join('')}</span>`;
    })
    .join('');

  targets.forEach((target) => {
    const label = (target.innerText || target.textContent || '').replace(/\u00a0/g, ' ').trim();
    if (!label) return;
    const lines = label.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    target.dataset.vpReady = 'true';
    target.setAttribute('aria-label', label.replace(/\s+/g, ' '));
    target.classList.add('variable-proximity-ready');
    target.innerHTML = lines.map((line) => `<span class="vp-line">${buildLine(line)}</span>`).join('');
  });

  const letters = [...document.querySelectorAll('.variable-proximity-ready .vp-letter')];
  const radius = 170;
  let pointer = { x: -9999, y: -9999 };
  let raf = 0;

  const update = () => {
    raf = 0;
    letters.forEach((letter) => {
      const rect = letter.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const distance = Math.hypot(pointer.x - cx, pointer.y - cy);
      const strength = Math.max(0, 1 - distance / radius);
      const eased = strength * strength * (3 - 2 * strength);
      const direction = pointer.x <= cx ? 1 : -1;
      const weight = Math.round(820 + 110 * eased);
      letter.style.fontVariationSettings = `'wght' ${weight}`;
      letter.style.fontWeight = weight;
      letter.style.transform = `translateX(${direction * 4 * eased}px)`;
      letter.style.filter = eased ? `brightness(${1 + .12 * eased})` : '';
    });
  };

  const requestUpdate = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };

  window.addEventListener('pointermove', (event) => {
    pointer = { x: event.clientX, y: event.clientY };
    requestUpdate();
  }, { passive: true });

  window.addEventListener('scroll', requestUpdate, { passive: true });
}

const grid = document.querySelector('[data-other-all]');
const mediaBase = grid?.dataset.mediaBase || '../media/other/';
const source = window.OTHER_WORKS_DATA?.items || [];
const items = shuffleItems(source.filter((item) => item.enabled !== false));
const mobileArchiveQuery = window.matchMedia('(max-width: 768px)');
let isMobileArchiveLayout = null;

renderArchiveCopy();
initVariableProximity();

function createPreviewModal() {
  const modal = document.createElement('div');
  modal.className = 'media-preview-modal';
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <button class="media-preview-close" type="button" aria-label="关闭预览">×</button>
    <div class="media-preview-stage" role="dialog" aria-modal="true" aria-label="素材预览"></div>
  `;
  document.body.appendChild(modal);
  return modal;
}

const previewModal = createPreviewModal();
const previewStage = previewModal.querySelector('.media-preview-stage');
const previewClose = previewModal.querySelector('.media-preview-close');

function closePreview() {
  previewModal.classList.remove('is-open');
  previewModal.setAttribute('aria-hidden', 'true');
  document.documentElement.classList.remove('is-preview-open');
  document.body.classList.remove('is-preview-open');
  previewStage.innerHTML = '';
}

function openPreview(card) {
  const type = card.dataset.previewType;
  const src = card.dataset.previewSrc;
  const title = card.dataset.previewTitle || 'Other Work';
  if (!src) return;

  document.querySelectorAll('.masonry-video video').forEach((video) => video.pause());
  previewStage.innerHTML = type === 'video'
    ? `<video class="media-preview-content" src="${escapeHtml(src)}" poster="../media/project/04-other-project.webp" controls playsinline preload="metadata"></video>`
    : `<img class="media-preview-content" src="${escapeHtml(src)}" alt="${escapeHtml(title)}" decoding="async">`;
  previewModal.classList.add('is-open');
  previewModal.setAttribute('aria-hidden', 'false');
  document.documentElement.classList.add('is-preview-open');
  document.body.classList.add('is-preview-open');

  const previewVideo = previewStage.querySelector('video');
  previewVideo?.play().catch(() => {});
}

function initLazyVideos(scope = document) {
  const videos = [...scope.querySelectorAll('video[data-src]')];
  if (!videos.length) return;

  const loadVideo = (video) => {
    if (video.dataset.loaded === 'true') return;
    video.dataset.loaded = 'true';
    video.src = video.dataset.src;
    video.preload = 'metadata';
    video.load();
  };

  const onError = (video) => {
    video.addEventListener('error', () => {
      console.warn('[portfolio] archive video failed', video.dataset.src);
      video.removeAttribute('src');
      video.load();
    }, { once: true });
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        loadVideo(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '240px 0px' });
    videos.forEach((video) => {
      onError(video);
      observer.observe(video);
    });
    return;
  }

  videos.forEach((video) => {
    onError(video);
    window.setTimeout(() => loadVideo(video), 1200);
  });
}

function bindVideoHover() {
  document.querySelectorAll('.masonry-video video').forEach((video) => {
    if (window.matchMedia('(max-width: 768px), (hover: none), (pointer: coarse)').matches) return;
    const card = video.closest('.masonry-video');
    card.addEventListener('mouseenter', () => video.play().catch(() => {}));
    card.addEventListener('mouseleave', () => video.pause());
  });
}

function bindPreviewCards() {
  document.querySelectorAll('.other-works-grid .masonry-item').forEach((card) => {
    card.addEventListener('click', () => openPreview(card));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openPreview(card);
      }
    });
  });
}

function renderArchiveGrid() {
  if (!grid) return;

  const useMobileLayout = mobileArchiveQuery.matches;
  if (useMobileLayout === isMobileArchiveLayout && grid.innerHTML) return;

  isMobileArchiveLayout = useMobileLayout;

  try {
    console.log('[portfolio] archive grid: start');
    if (useMobileLayout) {
      const imageItems = items.filter((item) => item.type !== 'video');
      const videoItems = items.filter((item) => item.type === 'video');
      grid.innerHTML = [
        imageItems.length ? buildGroupHeading('图片') : '',
        imageItems.map((item) => buildCard(item, mediaBase)).join(''),
        videoItems.length ? buildGroupHeading('视频') : '',
        videoItems.map((item) => buildCard(item, mediaBase)).join('')
      ].join('');
    } else {
      grid.innerHTML = items.map((item) => buildCard(item, mediaBase)).join('');
    }

    initLazyVideos(grid);
    bindPreviewCards();
    bindVideoHover();
    console.log('[portfolio] archive grid: ready');
  } catch (error) {
    console.warn('[portfolio] archive grid: failed', error);
  }
}

renderArchiveGrid();

if (mobileArchiveQuery.addEventListener) {
  mobileArchiveQuery.addEventListener('change', renderArchiveGrid);
} else {
  mobileArchiveQuery.addListener(renderArchiveGrid);
}

previewClose.addEventListener('click', closePreview);
previewModal.addEventListener('click', (event) => {
  if (event.target === previewModal) closePreview();
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && previewModal.classList.contains('is-open')) closePreview();
});
