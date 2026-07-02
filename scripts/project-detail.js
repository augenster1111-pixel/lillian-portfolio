const projectId = document.body.dataset.projectId;
const project = window.PROJECTS_DATA?.[projectId];

function logStep(label, state = 'ready', detail) {
  const message = `[portfolio] project ${projectId || 'unknown'} ${label}: ${state}`;
  if (detail) console.warn(message, detail);
  else console.log(message);
}

function runSafely(label, task) {
  try {
    logStep(label, 'start');
    task();
    logStep(label, 'ready');
  } catch (error) {
    logStep(label, 'failed', error);
  }
}

function deferNonCriticalTask(task) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(task, { timeout: 1600 });
    return;
  }
  window.setTimeout(task, 500);
}

function inferPosterFromMedia(src = '') {
  if (!src || !/\.mp4(?:[?#].*)?$/i.test(src)) return '';
  return src.replace(/\.mp4(?:[?#].*)?$/i, '.poster.webp');
}

function initLazyVideos(scope = document) {
  const videos = [...scope.querySelectorAll('video[data-src]')];
  if (!videos.length) return;

  const loadVideo = (video, shouldPlay = false) => {
    if (video.dataset.loaded === 'true') {
      if (shouldPlay) video.play().catch(() => {});
      return;
    }
    if (!video.dataset.src) return;
    video.dataset.loaded = 'true';
    video.src = video.dataset.src;
    video.preload = 'metadata';
    video.load();
    if (shouldPlay) video.play().catch(() => {});
  };

  const bindError = (video) => {
    video.addEventListener('error', () => {
      logStep('video', 'failed', video.dataset.src || video.currentSrc);
      video.removeAttribute('src');
      video.load();
    }, { once: true });
  };

  const bindActivation = (video) => {
    if (video.dataset.clickLoadBound === 'true') return;
    video.dataset.clickLoadBound = 'true';
    video.setAttribute('tabindex', '0');
    const activate = (event) => {
      event?.preventDefault();
      loadVideo(video, true);
    };
    video.addEventListener('click', activate);
    video.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      activate(event);
    });
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.dataset.inView = 'true';
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '260px 0px' });

    videos.forEach((video) => {
      bindError(video);
      bindActivation(video);
      observer.observe(video);
    });
    return;
  }

  videos.forEach((video) => {
    bindError(video);
    bindActivation(video);
  });
}

function syncStoredTheme() {
  try {
    document.body.classList.toggle('theme-light', localStorage.getItem('lillian-portfolio-theme') === 'light');
  } catch (error) {
    document.body.classList.remove('theme-light');
  }
}

syncStoredTheme();

function bindExclusiveProjectVideos(scope = document) {
  const videos = Array.from(scope.querySelectorAll('video'));
  if (!videos.length) return;

  videos.forEach((video) => {
    if (video.dataset.exclusivePlaybackBound === 'true') return;
    video.dataset.exclusivePlaybackBound = 'true';

    video.addEventListener('play', () => {
      videos.forEach((otherVideo) => {
        if (otherVideo === video) return;
        otherVideo.pause();
        otherVideo.muted = true;
      });

      video.muted = false;
      video.volume = 1;
    });

    video.addEventListener('pause', () => {
      if (!video.ended) video.muted = true;
    });

    video.addEventListener('ended', () => {
      video.muted = true;
    });
  });
}

const projectMobilePreviewQuery = window.matchMedia('(max-width: 768px), (hover: none), (pointer: coarse)');
let projectMediaPreviewModal = null;

function shouldUseProjectMediaPreview() {
  return ['01', '02'].includes(projectId) && projectMobilePreviewQuery.matches;
}

function ensureProjectMediaPreview() {
  if (projectMediaPreviewModal) return projectMediaPreviewModal;

  const modal = document.createElement('div');
  modal.className = 'project-media-preview-modal';
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <button class="project-media-preview-close" type="button" aria-label="关闭预览">×</button>
    <div class="project-media-preview-stage" role="dialog" aria-modal="true" aria-label="素材预览"></div>
  `;
  document.body.append(modal);

  const close = () => closeProjectMediaPreview();
  modal.querySelector('.project-media-preview-close')?.addEventListener('click', close);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) close();
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) close();
  });

  projectMediaPreviewModal = modal;
  return modal;
}

function closeProjectMediaPreview() {
  const modal = projectMediaPreviewModal;
  if (!modal) return;
  const stage = modal.querySelector('.project-media-preview-stage');
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.documentElement.classList.remove('is-project-media-preview-open');
  document.body.classList.remove('is-project-media-preview-open');
  if (stage) stage.innerHTML = '';
}

function openProjectMediaPreview(media) {
  if (!shouldUseProjectMediaPreview()) return;
  const src = media.currentSrc || media.src || media.dataset.src;
  if (!src) return;

  const modal = ensureProjectMediaPreview();
  const stage = modal.querySelector('.project-media-preview-stage');
  if (!stage) return;

  document.querySelectorAll('video').forEach((video) => video.pause());
  stage.innerHTML = '';

  if (media.tagName.toLowerCase() === 'video') {
    const video = document.createElement('video');
    video.className = 'project-media-preview-content';
    video.src = src;
    video.controls = true;
    video.playsInline = true;
    video.muted = false;
    video.preload = 'metadata';
    const poster = media.getAttribute('poster');
    const inferredPoster = poster || inferPosterFromMedia(src);
    if (inferredPoster) video.poster = inferredPoster;
    stage.append(video);
    video.play().catch(() => {});
  } else {
    const image = document.createElement('img');
    image.className = 'project-media-preview-content';
    image.src = src;
    image.alt = media.alt || '';
    image.loading = 'eager';
    image.decoding = 'async';
    stage.append(image);
  }

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.documentElement.classList.add('is-project-media-preview-open');
  document.body.classList.add('is-project-media-preview-open');
}

function bindProjectMobileMediaPreview(scope = document) {
  if (!['01', '02'].includes(projectId)) return;

  const openFromEvent = (event, media) => {
    if (!shouldUseProjectMediaPreview()) return;
    event.preventDefault();
    event.stopPropagation();
    openProjectMediaPreview(media);
  };

  const mediaItems = Array.from(scope.querySelectorAll(
    '.work01-assets .placeholder-card img, .work01-assets .placeholder-card video, .work-media video'
  ));

  mediaItems.forEach((media, index) => {
    if (media.dataset.projectMobilePreviewBound === 'true') return;
    media.dataset.projectMobilePreviewBound = 'true';
    media.classList.add('project-mobile-preview-target');
    media.setAttribute('tabindex', '0');

    media.addEventListener('click', (event) => {
      openFromEvent(event, media);
    });

    media.addEventListener('keydown', (event) => {
      if (!shouldUseProjectMediaPreview()) return;
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openProjectMediaPreview(media);
    });

    if (media.tagName.toLowerCase() !== 'video') return;

    const card = media.closest('.placeholder-card');
    if (!card || card.dataset.projectMobileVideoPreviewBound === 'true') return;
    card.dataset.projectMobileVideoPreviewBound = 'true';
    card.classList.add('has-project-mobile-video-trigger');

    const trigger = document.createElement('button');
    trigger.className = 'project-mobile-preview-video-trigger';
    trigger.type = 'button';
    trigger.setAttribute('aria-label', `Open video preview ${index + 1}`);
    trigger.addEventListener('click', (event) => openFromEvent(event, media));
    card.append(trigger);
  });
}

function initWork02BorderGlow(scope = document) {
  if (projectId !== '02') return;
  if (window.matchMedia('(max-width: 768px), (hover: none), (pointer: coarse)').matches) return;

  const cards = Array.from(scope.querySelectorAll('.work02-strategy-row'));
  if (!cards.length) return;

  cards.forEach((card) => {
    if (card.dataset.borderGlowReady === 'true') return;
    card.dataset.borderGlowReady = 'true';
    card.classList.add('work02-border-glow');

    const edgeLight = document.createElement('span');
    edgeLight.className = 'edge-light';
    edgeLight.setAttribute('aria-hidden', 'true');
    card.prepend(edgeLight);

    const updateGlow = (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = x - cx;
      const dy = y - cy;
      const kx = dx === 0 ? Infinity : cx / Math.abs(dx);
      const ky = dy === 0 ? Infinity : cy / Math.abs(dy);
      const edge = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
      let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (angle < 0) angle += 360;

      card.style.setProperty('--edge-proximity', `${(edge * 100).toFixed(3)}`);
      card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
    };

    card.addEventListener('pointermove', updateGlow, { passive: true });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--edge-proximity', '0');
    });
  });
}

if (!project) {
  document.body.innerHTML = '<main class="work-error">Project data not found.</main>';
} else {
  document.title = project.pageTitle;
  const navTitle = document.querySelector('[data-nav-title]');
  if (navTitle) navTitle.textContent = project.navTitle || project.titleLines.join(' · ');
  const backIcon = document.querySelector('.work-back-icon');
  if (backIcon) backIcon.textContent = '←';

  const brand = document.querySelector('.work-brand');
  if (brand) {
    const projects = [
      { id: '01', label: '游戏买量视频', href: '../01/index.html' },
      { id: '02', label: 'AI创意广告短片', href: '../02/index.html' },
      { id: '03', label: '游戏营销视觉设计', href: '../03/index.html' },
      { id: '04', label: '其他综合设计项目', href: '../04/index.html' }
    ];
    const menu = document.createElement('div');
    menu.className = 'work-project-menu';
    menu.innerHTML = `
      <button class="work-menu-trigger" type="button" aria-label="打开项目导航" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <nav class="work-project-dropdown" aria-label="项目导航">
        ${projects.map((item) => `<a href="${item.href}" class="${item.id === projectId ? 'is-current' : ''}"><strong>${item.label}</strong><span>${item.id}</span></a>`).join('')}
      </nav>
    `;
    brand.replaceWith(menu);

    const trigger = menu.querySelector('.work-menu-trigger');
    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = menu.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', String(isOpen));
    });
    document.addEventListener('click', (event) => {
      if (!menu.contains(event.target)) {
        menu.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        menu.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  document.querySelector('[data-project-number]').textContent = project.number;
  document.querySelector('[data-project-title]').innerHTML = project.titleLines.join('<br>');
  document.querySelector('[data-project-description]').textContent = project.description;

  const subtitle = document.querySelector('[data-project-subtitle]');
  if (subtitle) subtitle.textContent = project.subtitle || '';

  const cover = document.querySelector('[data-project-cover]');
  if (cover) {
    cover.src = project.cover;
    cover.alt = project.titleLines.join(' ');
    cover.loading = 'eager';
    cover.decoding = 'async';
    cover.fetchPriority = 'high';
  }

  const sectionNav = document.querySelector('[data-section-nav]');
  if (sectionNav && Array.isArray(project.blocks)) {
    sectionNav.replaceChildren(...project.blocks
      .filter((block) => block.anchor)
      .map((block) => {
        const link = document.createElement('a');
        link.href = `#${block.anchor}`;
        link.textContent = block.navTitle || block.nav || block.title || block.eyebrow || `项目 ${block.number}`;
        const sup = document.createElement('sup');
        sup.textContent = block.number || '';
        link.append(sup);
        return link;
      }));
  }

  const hero = document.querySelector('.work-hero');
  if (hero && projectId === '03' && project.cover) {
    hero.style.setProperty('--work-hero-bg', `url("${project.cover}")`);
    hero.style.backgroundImage = `url("${project.cover}")`;
  }

  const tags = document.querySelector('[data-project-tags]');
  if (tags) {
    tags.replaceChildren(...project.tags.map((tag) => {
      const node = document.createElement('span');
      node.textContent = tag;
      return node;
    }));
  }

  const renderWork02Content = () => {
    const content = window.WORK02_CONTENT;
    if (projectId !== '02' || !content) return;

    const setText = (selector, value) => {
      const node = document.querySelector(selector);
      if (node && value) node.textContent = value;
    };

    setText('[data-work02-thinking-kicker]', content.thinking?.kicker);
    setText('[data-work02-thinking-title]', content.thinking?.title);
    setText('[data-work02-thinking-subtitle]', content.thinking?.subtitle);
    setText('[data-work02-thinking-intro]', content.thinking?.intro);

    const tagWrap = document.querySelector('[data-work02-tags]');
    if (tagWrap && Array.isArray(content.thinking?.tags)) {
      tagWrap.replaceChildren(...content.thinking.tags.map((tag) => {
        const node = document.createElement('span');
        node.textContent = tag;
        return node;
      }));
    }

    const strategyWrap = document.querySelector('[data-work02-strategy]');
    if (strategyWrap && content.strategy) {
      const label = document.createElement('p');
      label.className = 'work02-section-label';
      label.textContent = content.strategy.label || 'CREATIVE STRATEGY';
      const items = (content.strategy.items || []).map((item) => {
        const card = document.createElement('article');
        card.className = 'work02-strategy-row';
        const number = document.createElement('span');
        number.textContent = item.number;
        const copy = document.createElement('div');
        const title = document.createElement('h3');
        title.textContent = item.title;
        const body = document.createElement('p');
        body.textContent = item.body;
        copy.append(title, body);
        card.append(number, copy);
        return card;
      });
      strategyWrap.replaceChildren(label, ...items);
      initWork02BorderGlow(strategyWrap);
    }

    setText('[data-work02-workflow-kicker]', content.workflow?.kicker);
    setText('[data-work02-workflow-title]', content.workflow?.title);
    setText('[data-work02-workflow-intro]', content.workflow?.intro);

    const workflowWrap = document.querySelector('[data-work02-workflow]');
    if (workflowWrap && Array.isArray(content.workflow?.steps)) {
      workflowWrap.replaceChildren(...content.workflow.steps.map((step) => {
        const card = document.createElement('article');
        card.className = 'work02-flow-step';
        const number = document.createElement('span');
        number.className = 'work02-step-dot';
        number.textContent = step.number;
        const title = document.createElement('h3');
        title.textContent = step.title;
        const tool = document.createElement('p');
        tool.className = 'work02-tool';
        tool.textContent = step.tool;
        const body = document.createElement('p');
        body.textContent = step.body;
        card.append(number, title, tool, body);
        return card;
      }));
    }
  };

  renderWork02Content();

  const renderWork03Copy = () => {
    if (projectId !== '03') return;
    const wideHeading = project.wideHeading || {};
    const eyebrow = document.querySelector('[data-wide-heading-eyebrow]');
    const title = document.querySelector('[data-wide-heading-title]');
    const description = document.querySelector('[data-wide-heading-description]');
    if (eyebrow) {
      eyebrow.textContent = wideHeading.eyebrow || '';
      eyebrow.dataset.number = String(wideHeading.number || '04').padStart(2, '0');
    }
    if (title) title.textContent = wideHeading.title || '';
    if (description) description.textContent = wideHeading.description || '';
  };

  renderWork03Copy();

  const renderStackGallery = () => {
    const gallery = document.querySelector('[data-stack-gallery]');
    if (projectId !== '03' || !gallery || !Array.isArray(project.galleryImages)) return;
    const getSetMeta = (src) => {
      const fileName = decodeURIComponent(src.split('/').pop() || src);
      const sets = project.gallerySets || {};
      if (fileName.includes('Cady-Panda')) {
        return { key: 'cady-panda', ...(sets.cadyPanda || { label: '01 / CREATIVE SET', title: 'Cady Panda', english: 'STORE KEY VISUAL SERIES' }) };
      }
      if (fileName.includes('Estella-Zoey')) {
        return { key: 'estella-zoey', ...(sets.estellaZoey || { label: '02 / CREATIVE SET', title: 'Estella Zoey', english: 'AIGC CAMPAIGN VISUALS' }) };
      }
      return { key: 'other-visuals', ...(sets.defaultSet || { label: 'CREATIVE SET', title: 'Other Visuals', english: 'GAME MARKETING ASSETS' }) };
    };

    const grouped = project.galleryImages.reduce((sets, src) => {
      const meta = getSetMeta(src);
      if (!sets.has(meta.key)) sets.set(meta.key, { ...meta, images: [] });
      sets.get(meta.key).images.push(src);
      return sets;
    }, new Map());

    const stackLightbox = document.createElement('div');
    stackLightbox.className = 'stack-lightbox';
    stackLightbox.innerHTML = `
      <button type="button" class="stack-lightbox-close" data-stack-lightbox-close aria-label="关闭详情">CLOSE</button>
      <button type="button" class="stack-lightbox-arrow stack-lightbox-arrow--prev" data-stack-lightbox-prev aria-label="上一张">←</button>
      <figure class="stack-lightbox-frame">
        <img data-stack-lightbox-image alt="">
      </figure>
      <button type="button" class="stack-lightbox-arrow stack-lightbox-arrow--next" data-stack-lightbox-next aria-label="下一张">→</button>
      <span class="stack-lightbox-counter" data-stack-lightbox-counter>01 / 05</span>
    `;
    document.body.append(stackLightbox);

    let activeStackSet = null;

    const getCoverflowSlot = (index, activeIndex, total) => {
      let relative = index - activeIndex;
      if (relative > total / 2) relative -= total;
      if (relative < -total / 2) relative += total;

      const slots = {
        '-2': { x: '-195%', scale: '0.68', opacity: '0.30', z: '3', depth: '-68px', shade: '0.24', brightness: '0.58', blur: '1.4px', rotate: '10deg' },
        '-1': { x: '-105%', scale: '0.84', opacity: '0.60', z: '4', depth: '-34px', shade: '0.12', brightness: '0.82', blur: '0.35px', rotate: '5deg' },
        0: { x: '0%', scale: '1', opacity: '1', z: '5', depth: '28px', shade: '0', brightness: '1', blur: '0px', rotate: '0deg' },
        1: { x: '105%', scale: '0.84', opacity: '0.60', z: '4', depth: '-34px', shade: '0.12', brightness: '0.82', blur: '0.35px', rotate: '-5deg' },
        2: { x: '195%', scale: '0.68', opacity: '0.30', z: '3', depth: '-68px', shade: '0.24', brightness: '0.58', blur: '1.4px', rotate: '-10deg' }
      };

      return { relative, ...(slots[relative] || slots[0]) };
    };

    const setActiveCard = (setNode, index) => {
      const cards = Array.from(setNode.querySelectorAll('.stack-card'));
      const counter = setNode.querySelector('[data-stack-counter]');
      const total = cards.length;
      const nextIndex = (index + total) % total;
      setNode.dataset.activeIndex = String(nextIndex);
      cards.forEach((card, cardIndex) => {
        const isActive = cardIndex === nextIndex;
        card.classList.toggle('is-active', isActive);
        card.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        const slot = getCoverflowSlot(cardIndex, nextIndex, total);
        card.style.setProperty('--stack-offset', slot.relative);
        card.style.setProperty('--stack-distance', Math.abs(slot.relative));
        card.style.setProperty('--stack-coverflow-x', slot.x);
        card.style.setProperty('--stack-coverflow-scale', slot.scale);
        card.style.setProperty('--stack-coverflow-opacity', slot.opacity);
        card.style.setProperty('--stack-coverflow-depth', slot.depth);
        card.style.setProperty('--stack-coverflow-shade', slot.shade);
        card.style.setProperty('--stack-coverflow-brightness', slot.brightness);
        card.style.setProperty('--stack-coverflow-blur', slot.blur);
        card.style.setProperty('--stack-coverflow-rotate', slot.rotate);
        card.style.setProperty('--stack-coverflow-z', slot.z);
        card.style.zIndex = slot.z;
      });
      if (counter) counter.textContent = `${String(nextIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
      return nextIndex;
    };

    const closeStackDetail = () => {
      stackLightbox.classList.remove('is-open');
      activeStackSet = null;
      document.body.classList.remove('work03-modal-open');
    };

    const updateStackLightbox = (index) => {
      if (!activeStackSet) return;
      const total = activeStackSet.images.length;
      activeStackSet.index = (index + total) % total;
      const image = stackLightbox.querySelector('[data-stack-lightbox-image]');
      const counter = stackLightbox.querySelector('[data-stack-lightbox-counter]');
      image.src = activeStackSet.images[activeStackSet.index];
      image.alt = `${activeStackSet.title} 素材 ${String(activeStackSet.index + 1).padStart(2, '0')}`;
      counter.textContent = `${String(activeStackSet.index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    };

    const openStackDetail = (setNode, set, index) => {
      activeStackSet = { title: set.title, images: set.images, index };
      updateStackLightbox(index);
      stackLightbox.classList.add('is-open');
      document.body.classList.add('work03-modal-open');
      setActiveCard(setNode, index);
    };

    stackLightbox.querySelector('[data-stack-lightbox-close]').addEventListener('click', closeStackDetail);
    stackLightbox.querySelector('[data-stack-lightbox-prev]').addEventListener('click', () => updateStackLightbox((activeStackSet?.index || 0) - 1));
    stackLightbox.querySelector('[data-stack-lightbox-next]').addEventListener('click', () => updateStackLightbox((activeStackSet?.index || 0) + 1));
    stackLightbox.addEventListener('click', (event) => {
      if (event.target === stackLightbox) closeStackDetail();
    });

    const setNodes = Array.from(grouped.values()).map((set, setIndex) => {
      const setNode = document.createElement('article');
      setNode.className = 'stack-set stack-coverflow';
      setNode.dataset.activeIndex = '0';
      const setRatio = set.images[0]?.includes('Cady-Panda') ? 1242 / 2208 : 2048 / 2732;
      setNode.style.setProperty('--stack-stage-height', setRatio > 0.65 ? 'clamp(520px, 32vw, 560px)' : 'clamp(680px, 44vw, 720px)');
      setNode.style.setProperty('--stack-card-top', '45%');
      let activeIndex = 0;
      const updateActiveIndex = (index) => {
        activeIndex = setActiveCard(setNode, index);
      };

      const heading = document.createElement('header');
      heading.className = 'stack-set-heading';
      const labelText = set.label || 'CREATIVE SET';
      const numberText = String(set.number || setIndex + 1).padStart(2, '0');
      heading.innerHTML = `<strong>${numberText}</strong><span>${labelText}</span><h3>${set.title}</h3><p>${set.english}</p>`;

      const stage = document.createElement('div');
      stage.className = 'stack-stage';

      const cards = set.images.map((src, index) => {
        const card = document.createElement('button');
        card.className = `stack-card stack-card-${index + 1}`;
        card.type = 'button';
        const ratio = src.includes('Cady-Panda') ? 1242 / 2208 : 2048 / 2732;
        card.style.setProperty('--ratio', ratio.toFixed(4));
        card.style.setProperty('--enter-delay', `${index * 70}ms`);
        card.style.setProperty('--detail-width', src.includes('Cady-Panda') ? '360px' : '500px');
        card.setAttribute('aria-label', `${set.title} 素材 ${index + 1}`);

        const image = document.createElement('img');
        image.src = src;
        image.alt = `${set.title} 商店图 ${String(index + 1).padStart(2, '0')}`;
        image.loading = 'lazy';
        image.decoding = 'async';

        card.append(image);
        card.addEventListener('mouseenter', () => {
          if (setNode.classList.contains('is-detail')) return;
          setNode.classList.add('is-hovering');
          card.classList.add('is-hovered');
        });
        card.addEventListener('mouseleave', () => {
          card.classList.remove('is-hovered');
          if (!setNode.querySelector('.stack-card.is-hovered')) {
            setNode.classList.remove('is-hovering');
          }
        });
        card.addEventListener('click', () => {
          updateActiveIndex(index);
        });
        return card;
      });

      const tools = document.createElement('div');
      tools.className = 'stack-detail-tools';
      tools.innerHTML = `<button type="button" data-stack-prev aria-label="Previous image">←</button><span data-stack-counter>01 / 05</span><button type="button" data-stack-next aria-label="Next image">→</button>`;

      tools.querySelector('[data-stack-prev]').addEventListener('click', () => {
        updateActiveIndex(activeIndex - 1);
      });
      tools.querySelector('[data-stack-prev]').textContent = '\u2190';
      tools.querySelector('[data-stack-next]').textContent = '\u2192';
      tools.querySelector('[data-stack-next]').addEventListener('click', () => {
        updateActiveIndex(activeIndex + 1);
      });
      setNode.addEventListener('click', (event) => {
        if (setNode.classList.contains('is-detail') && event.target === setNode) {
          closeStackDetail();
        }
      });

      stage.replaceChildren(...cards, tools);
      setNode.append(heading, stage);
      updateActiveIndex(0);
      return setNode;
    });

    gallery.replaceChildren(...setNodes);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeStackDetail();
    });
  };

  deferNonCriticalTask(() => runSafely('stack gallery', renderStackGallery));

  const renderWideKvGallery = () => {
    const gallery = document.querySelector('[data-wide-kv-gallery]');
    if (projectId !== '03' || !gallery || !Array.isArray(project.wideGalleryImages)) return;
    if (window.matchMedia('(min-width: 769px)').matches) return;

    const getWideMeta = (src) => {
      const fileName = decodeURIComponent(src.split('/').pop() || src);
      if (fileName.includes('密室逃脱')) return { key: 'escape-room', title: '密室逃脱', english: 'ESCAPE ROOM KV SERIES' };
      if (fileName.includes('峡谷运输')) return { key: 'canyon-transport', title: '峡谷运输', english: 'CANYON TRANSPORT VISUALS' };
      if (fileName.includes('搜打撤')) return { key: 'extraction', title: '搜打撤', english: 'EXTRACTION SHOOTER CAMPAIGN' };
      if (fileName.includes('西部侦探')) return { key: 'western-detective', title: '西部侦探', english: 'WESTERN DETECTIVE AD KV' };
      return { key: 'other-kv', title: 'Other KV', english: 'GAME ADVERTISING VISUALS' };
    };

    const wideGroupSizes = [4, 3, 2, 2];
    const grouped = wideGroupSizes.reduce((sets, size) => {
      const start = sets.offset;
      const images = project.wideGalleryImages.slice(start, start + size);
      if (!images.length) return sets;
      const meta = getWideMeta(images[0]);
      sets.values.push({ ...meta, images });
      sets.offset = start + size;
      return sets;
    }, { offset: 0, values: [] }).values;

    const nodes = grouped.map((set, setIndex) => {
      const section = document.createElement('article');
      section.className = 'wide-kv-set';
      section.dataset.activeIndex = '0';

      const heading = document.createElement('header');
      heading.className = 'wide-kv-heading';
      const numberText = String(setIndex + 1).padStart(2, '0');
      heading.innerHTML = `<strong>${numberText}</strong><span>${numberText} / KV SET</span><h3>${set.title}</h3><p>${set.english}</p>`;

      const deck = document.createElement('div');
      deck.className = 'wide-kv-deck';

      const setActiveWideCard = (index) => {
        const wideCards = Array.from(deck.querySelectorAll('.wide-kv-card'));
        const counter = section.querySelector('[data-wide-kv-counter]');
        const total = wideCards.length;
        const nextIndex = (index + total) % total;
        section.dataset.activeIndex = String(nextIndex);
        wideCards.forEach((card, cardIndex) => {
          const isActive = cardIndex === nextIndex;
          card.classList.toggle('is-active', isActive);
          card.setAttribute('aria-pressed', isActive ? 'true' : 'false');
          card.style.setProperty('--kv-active-offset', cardIndex - nextIndex);
          card.style.setProperty('--kv-active-distance', Math.abs(cardIndex - nextIndex));
        });
        if (counter) counter.textContent = `${String(nextIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
      };

      const cards = set.images.map((src, index) => {
        const card = document.createElement('button');
        card.className = 'wide-kv-card';
        card.type = 'button';
        card.style.setProperty('--kv-index', index);
        card.style.setProperty('--kv-total', set.images.length);
        card.style.setProperty('--kv-delay', `${index * 80}ms`);
        card.style.setProperty('--kv-opacity', Math.max(0.58, 1 - index * 0.08).toFixed(2));
        card.style.setProperty('--kv-scale', Math.max(0.88, 1 - index * 0.025).toFixed(3));
        card.style.setProperty('--kv-offset', `${index * 18}px`);
        card.style.setProperty('--kv-depth', `${index * -16}px`);
        card.setAttribute('aria-label', `${set.title} KV ${index + 1}`);

        const image = document.createElement('img');
        image.src = src;
        image.alt = `${set.title} KV ${String(index + 1).padStart(2, '0')}`;
        image.loading = 'lazy';
        image.decoding = 'async';
        card.append(image);

        card.addEventListener('mouseenter', () => {
          deck.style.setProperty('--focus-index', index);
          section.classList.add('is-hovering');
          cards.forEach((item) => item.classList.toggle('is-focus', item === card));
        });
        deck.addEventListener('mouseleave', () => {
          section.classList.remove('is-hovering');
          cards.forEach((item) => item.classList.remove('is-focus'));
          deck.style.removeProperty('--focus-index');
        });
        card.addEventListener('click', () => {
          setActiveWideCard(index);
        });
        return card;
      });

      const tools = document.createElement('div');
      tools.className = 'wide-kv-tools';
      tools.innerHTML = '<button type="button" data-wide-kv-prev aria-label="Previous image">&larr;</button><span data-wide-kv-counter>01 / 01</span><button type="button" data-wide-kv-next aria-label="Next image">&rarr;</button>';
      tools.querySelector('[data-wide-kv-prev]').addEventListener('click', () => {
        setActiveWideCard(Number(section.dataset.activeIndex || 0) - 1);
      });
      tools.querySelector('[data-wide-kv-next]').addEventListener('click', () => {
        setActiveWideCard(Number(section.dataset.activeIndex || 0) + 1);
      });

      deck.replaceChildren(...cards);
      section.append(heading, deck, tools);
      setActiveWideCard(0);
      return section;
    });

    gallery.replaceChildren(...nodes);
  };

  deferNonCriticalTask(() => runSafely('wide gallery', renderWideKvGallery));

  const createSectionCard = (section) => {
    const card = document.createElement('article');
    card.className = 'placeholder-card';
    const createMediaPlaceholder = (type) => {
      const placeholder = document.createElement('div');
      placeholder.className = `media-placeholder media-placeholder-${type}`;
      placeholder.setAttribute('aria-label', `${section.title}待补充`);
      const hint = document.createElement('span');
      const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;
      if (isMobileViewport && type === 'video') {
        hint.textContent = section.aspect === 'portrait' ? '9:16 · 待补充' : '待补充';
      } else if (projectId === '02' && type === 'video') {
        hint.textContent = section.aspect === 'portrait' ? '9:16 · 待补充' : '待补充';
      } else {
        hint.textContent = section.aspect === 'portrait'
          ? `9:16 ${type === 'video' ? 'VIDEO' : 'IMAGE'}`
          : `${type === 'video' ? 'VIDEO' : 'IMAGE'} · 待补充`;
      }
      placeholder.append(hint);
      return placeholder;
    };
    const label = document.createElement('span');
    label.className = 'project-item-label';
    label.dataset.itemLabel = String(section.label || '').trim().toUpperCase();
    label.textContent = section.label;
    const title = document.createElement('h3');
    title.textContent = section.title;
    const body = document.createElement('p');
    body.textContent = section.body;
    if (!section.hideMeta) {
      if (!(projectId === '02' && section.label === 'VIDEO')) card.append(label);
      card.append(title, body);
    }
    if (section.image) {
      const image = document.createElement('img');
      image.src = section.image;
      image.alt = section.title;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.addEventListener('error', () => {
        image.replaceWith(createMediaPlaceholder('image'));
        card.classList.remove('has-image');
        card.classList.add('has-placeholder-media');
      }, { once: true });
      card.prepend(image);
      card.classList.add('has-image');
    }
    if (section.video) {
      const video = document.createElement('video');
      video.dataset.src = section.video;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.controls = true;
      video.preload = 'none';
      const poster = section.poster || inferPosterFromMedia(section.video);
      if (poster) video.poster = poster;
      video.addEventListener('error', () => {
        video.replaceWith(createMediaPlaceholder('video'));
        card.classList.remove('has-video');
        card.classList.add('has-placeholder-media');
      }, { once: true });
      card.prepend(video);
      card.classList.add('has-video');
      if (section.hint) {
        const hint = document.createElement('span');
        hint.className = 'media-action-hint';
        hint.textContent = section.hint;
        card.append(hint);
      }
    }
    if (section.placeholderMedia) {
      const placeholder = createMediaPlaceholder(section.placeholderMedia);
      card.append(placeholder);
      card.classList.add('has-placeholder-media');
    }
    if (section.subgroup && section.layout === 'open-video') {
      const itemTitle = document.createElement('p');
      itemTitle.className = 'project-item-subtitle';
      itemTitle.textContent = section.subgroup;
      card.prepend(itemTitle);
    }
    if (section.aspect === 'portrait') card.classList.add('portrait-card');
    return card;
  };

  const sectionGrid = document.querySelector('[data-project-sections]');
  if (sectionGrid && projectId === '04' && Array.isArray(project.caseProjects)) {
    sectionGrid.classList.add('work04-case-grid');
    const cards = project.caseProjects.map((item, index) => {
      const card = document.createElement('a');
      card.className = 'work04-case-card';
      card.href = item.href || '#';
      card.style.setProperty('--case-index', index + 1);
      card.style.setProperty('--case-x', `${22 + index * 16}%`);

      const media = document.createElement('div');
      media.className = 'work04-case-media';
      if (item.image) {
        const image = document.createElement('img');
        image.src = item.image;
        image.alt = item.title;
        image.loading = 'lazy';
        image.decoding = 'async';
        image.addEventListener('error', () => media.classList.add('is-placeholder'), { once: true });
        media.append(image);
      } else {
        media.classList.add('is-placeholder');
        const mark = document.createElement('span');
        mark.textContent = String(index + 1).padStart(2, '0');
        media.append(mark);
      }

      const meta = document.createElement('div');
      meta.className = 'work04-case-meta';
      meta.innerHTML = `
        <div>
          <span>${item.label || String(index + 1).padStart(2, '0')}</span>
          <h3>${item.title || 'Untitled Project'}</h3>
          <p>${item.year || '待补充'}</p>
        </div>
        <strong>${item.category || 'PROJECT'}</strong>
      `;

      card.append(media, meta);
      return card;
    });
    sectionGrid.replaceChildren(...cards);
  } else if (sectionGrid && project.blocks?.length) {
    document.body.classList.add('has-project-blocks');
    sectionGrid.classList.add('project-block-list');
    sectionGrid.replaceChildren(...project.blocks.map((block) => {
      const wrapper = document.createElement('section');
      wrapper.className = 'project-block';
      if (block.anchor) wrapper.id = block.anchor;
      const heading = document.createElement('header');
      heading.className = 'project-block-heading';
      const number = document.createElement('span');
      number.className = 'project-block-number';
      number.textContent = block.number;
      const eyebrow = document.createElement('p');
      eyebrow.className = 'project-block-eyebrow';
      eyebrow.textContent = block.eyebrow;
      const title = document.createElement('h2');
      title.textContent = block.title;
      const english = document.createElement('p');
      english.className = 'project-block-english';
      english.textContent = block.english || '';
      heading.append(number, eyebrow, title, english);
      const content = document.createElement('div');
      content.className = 'project-block-content';
      const renderedItems = [];
      const groupMap = new Map();
      block.items.forEach((item) => {
        if (!item.group) {
          renderedItems.push(createSectionCard(item));
          return;
        }
        let group = groupMap.get(item.group);
        if (!group) {
          const groupWrapper = document.createElement('article');
          groupWrapper.className = 'project-subproject-card';
          const groupLabel = document.createElement('span');
          groupLabel.className = 'project-subproject-label';
          groupLabel.textContent = item.group;
          const groupContent = document.createElement('div');
          groupContent.className = 'project-subproject-content';
          groupWrapper.append(groupLabel, groupContent);
          group = { wrapper: groupWrapper, content: groupContent, subgroups: new Set() };
          groupMap.set(item.group, group);
          renderedItems.push(groupWrapper);
        }
        if (item.groupTitle && !group.wrapper.querySelector('.project-subproject-title')) {
          const groupTitle = document.createElement('h3');
          groupTitle.className = 'project-subproject-title';
          groupTitle.textContent = item.groupTitle;
          if (item.groupEnglish) {
            const groupEnglish = document.createElement('span');
            groupEnglish.className = 'project-subproject-title-en';
            groupEnglish.textContent = item.groupEnglish;
            groupTitle.append(groupEnglish);
          }
          group.wrapper.insertBefore(groupTitle, group.content);
        }
        if (item.subgroup && item.layout !== 'open-video' && !group.subgroups.has(item.subgroup)) {
          const subgroupTitle = document.createElement('p');
          subgroupTitle.className = 'project-subproject-subtitle';
          subgroupTitle.textContent = item.subgroup;
          group.content.append(subgroupTitle);
          group.subgroups.add(item.subgroup);
        }
        if (item.aspect === 'portrait') group.wrapper.classList.add('has-portrait-media');
        if (item.layout) group.wrapper.classList.add(`is-${item.layout}`);
        group.content.append(createSectionCard(item));
      });
      content.replaceChildren(...renderedItems);
      if (!block.hideHeading) wrapper.append(heading);
      wrapper.append(content);
      return wrapper;
    }));

    const sectionNavLinks = Array.from(document.querySelectorAll('.work-section-nav a'));
    const sectionTargets = sectionNavLinks
      .map((link) => {
        const id = link.getAttribute('href')?.replace('#', '');
        return id ? { link, target: document.getElementById(id) } : null;
      })
      .filter((item) => item?.target);

    const setActiveSectionLink = (activeLink) => {
      sectionNavLinks.forEach((link) => {
        const isActive = link === activeLink;
        link.classList.toggle('is-active', isActive);
        link.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    };

    if (sectionTargets.length) {
      setActiveSectionLink(sectionTargets[0].link);

      sectionTargets.forEach(({ link, target }) => {
        link.addEventListener('click', (event) => {
          event.preventDefault();
          setActiveSectionLink(link);
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, '', `#${target.id}`);
        });
      });

      const observer = new IntersectionObserver((entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const current = sectionTargets.find((item) => item.target === visible.target);
        if (current) setActiveSectionLink(current.link);
      }, { rootMargin: '-35% 0px -45% 0px', threshold: [0.08, 0.18, 0.32] });

      sectionTargets.forEach(({ target }) => observer.observe(target));
    }
  } else if (sectionGrid && project.sections?.length) {
    sectionGrid.replaceChildren(...project.sections.map(createSectionCard));
  }

  const mediaSection = document.querySelector('[data-project-media]');
  const videoGrid = document.querySelector('[data-project-videos]');
  if (mediaSection && videoGrid && project.videos?.length) {
    mediaSection.hidden = false;
    videoGrid.replaceChildren(...project.videos.map((source) => {
      const video = document.createElement('video');
      video.dataset.src = source;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.controls = true;
      video.preload = 'none';
      const poster = inferPosterFromMedia(source);
      if (poster) video.poster = poster;
      return video;
    }));
  }

  bindExclusiveProjectVideos(document);
  bindProjectMobileMediaPreview(document);
  initWork02BorderGlow(document);
  initLazyVideos(document);
}
