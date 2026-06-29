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
  if (typeof bindOtherWorksPhysics === 'function') {
    bindOtherWorksPhysics(target);
  }
}

