function buildOtherWorkCard(item, mediaBase = 'media/other/') {
  const type = item.type === 'video' ? 'video' : 'image';
  const sizeClass = item.size ? ` masonry-${item.size}` : '';
  const videoClass = type === 'video' ? ' masonry-video' : '';
  const src = `${mediaBase}${item.src}`;
  const caption = escapeHtml(item.label || item.title || 'OTHER WORK');
  const title = escapeHtml(item.title || caption);
  const badge = item.badge ? `<span class="video-badge">${escapeHtml(item.badge)}</span>` : '';
  const media = type === 'video'
    ? `<video src="${escapeHtml(src)}" muted loop playsinline preload="metadata"></video>${badge}`
    : `<img src="${escapeHtml(src)}" alt="${title}" loading="lazy">`;

  return `<figure class="masonry-item${sizeClass}${videoClass} reveal">${media}<figcaption>${caption}</figcaption></figure>`;
}

function applyControlledMasonryPattern(container) {
  const pattern = ['feature', 'standard', 'accent', 'standard', 'controlled-wide', 'accent', 'standard', 'feature'];
  [...container.querySelectorAll('.masonry-item')].forEach((card, index) => {
    card.classList.remove('masonry-feature', 'masonry-standard', 'masonry-accent', 'masonry-controlled-wide');
    card.classList.add(`masonry-${pattern[index % pattern.length]}`);
  });
}

function renderOtherWorksHeading() {
  const home = window.OTHER_WORKS_DATA?.home;
  if (!home) return;

  const sectionNo = document.querySelector('[data-other-section-no]');
  const title = document.querySelector('[data-other-title]');
  const description = document.querySelector('[data-other-description]');
  const cta = document.querySelector('[data-other-cta]');

  if (sectionNo) sectionNo.textContent = home.sectionNo || '';
  if (title) title.innerHTML = home.titleHtml || '';
  if (description) description.innerHTML = home.descriptionHtml || '';
  if (cta) {
    const arrow = cta.querySelector('span')?.outerHTML || '<span>→</span>';
    cta.innerHTML = `${escapeHtml(home.ctaText || '浏览更多作品')} ${arrow}`;
  }
}

function initMobileOtherWorksDeck(container) {
  const cards = [...container.querySelectorAll('.masonry-item')];
  if (!cards.length) return;

  const mobileQuery = window.matchMedia('(max-width: 768px)');
  let activeIndex = 0;
  let startX = 0;
  let startY = 0;
  let isDragging = false;
  let isAnimating = false;

  const renderDeck = () => {
    const isMobile = mobileQuery.matches;
    container.classList.toggle('is-mobile-deck', isMobile);
    cards.forEach((card, index) => {
      card.classList.remove('is-active', 'is-prev', 'is-next', 'is-hidden');
      if (!isMobile) return;

      const previousIndex = (activeIndex - 1 + cards.length) % cards.length;
      const nextIndex = (activeIndex + 1) % cards.length;
      card.classList.toggle('is-active', index === activeIndex);
      card.classList.toggle('is-prev', index === previousIndex);
      card.classList.toggle('is-next', index === nextIndex);
      card.classList.toggle('is-hidden', index !== activeIndex && index !== previousIndex && index !== nextIndex);
    });
  };

  const moveDeck = (step) => {
    if (isAnimating) return;
    isAnimating = true;
    activeIndex = (activeIndex + step + cards.length) % cards.length;
    renderDeck();
    window.setTimeout(() => {
      isAnimating = false;
    }, 260);
  };

  container.addEventListener('touchstart', (event) => {
    if (!mobileQuery.matches || !event.touches.length) return;
    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    isDragging = true;
  }, { passive: true });

  container.addEventListener('touchend', (event) => {
    if (!mobileQuery.matches || !isDragging) return;
    isDragging = false;
    const touch = event.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    if (Math.abs(deltaX) < 36 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
    moveDeck(deltaX < 0 ? 1 : -1);
  }, { passive: true });

  cards.forEach((card, index) => {
    card.addEventListener('click', (event) => {
      if (!mobileQuery.matches || index === activeIndex) return;
      event.preventDefault();
      activeIndex = index;
      renderDeck();
    });
  });

  mobileQuery.addEventListener?.('change', renderDeck);
  renderDeck();
}

function renderOtherWorksPreview() {
  const target = document.querySelector('[data-other-preview]');
  const source = window.OTHER_WORKS_DATA?.items || [];
  if (!target || !source.length) return;

  const mediaBase = target.dataset.mediaBase || 'media/other/';
  const limit = Number(target.dataset.limit || 8);
  const items = source
    .filter((item) => item.enabled !== false && item.showOnHome !== false)
    .slice(0, limit);

  target.innerHTML = items.map((item) => buildOtherWorkCard(item, mediaBase)).join('');
  applyControlledMasonryPattern(target);
  target.querySelectorAll('.reveal').forEach((node) => node.classList.add('is-visible'));
  initMobileOtherWorksDeck(target);
  if (typeof bindOtherWorksPhysics === 'function') {
    bindOtherWorksPhysics(target);
  }
}

