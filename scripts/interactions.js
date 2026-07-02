function bindOtherWorksPhysics(container) {
  if (window.matchMedia('(max-width: 768px), (hover: none), (pointer: coarse)').matches) {
    container.classList.remove('is-physics-active');
    return;
  }

  const cards = [...container.querySelectorAll('.masonry-item')];
  if (!cards.length) return;

  const resetCards = () => {
    container.classList.remove('is-physics-active');
    container.style.removeProperty('--active-index');
    cards.forEach((card) => {
      card.classList.remove('is-active-physics');
      card.style.removeProperty('--distance');
      card.style.removeProperty('--direction');
      card.style.removeProperty('--push-x');
      card.style.removeProperty('--push-y');
      card.style.removeProperty('--neighbor-scale');
      card.style.removeProperty('--neighbor-brightness');
    });
  };

  const setActiveCard = (activeIndex) => {
    container.classList.add('is-physics-active');
    container.style.setProperty('--active-index', activeIndex);
    const activeRect = cards[activeIndex].getBoundingClientRect();
    const activeCenter = {
      x: activeRect.left + activeRect.width / 2,
      y: activeRect.top + activeRect.height / 2
    };
    const maxDistance = Math.hypot(window.innerWidth, window.innerHeight) * 0.46;

    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      const vectorX = center.x - activeCenter.x;
      const vectorY = center.y - activeCenter.y;
      const pixelDistance = Math.max(1, Math.hypot(vectorX, vectorY));
      const influence = Math.max(0, 1 - Math.min(pixelDistance / maxDistance, 1));
      const directionX = vectorX / pixelDistance;
      const directionY = vectorY / pixelDistance;
      const pushStrength = index === activeIndex ? 0 : 44 * influence;
      const scale = index === activeIndex ? 1 : Math.max(0.86, 1 - influence * 0.16);
      const brightness = index === activeIndex ? 1 : Math.max(0.68, 1 - influence * 0.26);

      card.classList.toggle('is-active-physics', index === activeIndex);
      card.style.setProperty('--distance', influence.toFixed(3));
      card.style.setProperty('--direction', directionX.toFixed(3));
      card.style.setProperty('--push-x', `${(directionX * pushStrength).toFixed(2)}px`);
      card.style.setProperty('--push-y', `${(directionY * pushStrength * 0.62).toFixed(2)}px`);
      card.style.setProperty('--neighbor-scale', scale);
      card.style.setProperty('--neighbor-brightness', brightness);
    });
  };

  cards.forEach((card, index) => {
    card.tabIndex = 0;
    card.addEventListener('mouseenter', () => setActiveCard(index));
    card.addEventListener('focus', () => setActiveCard(index));
    card.addEventListener('blur', resetCards);
  });

  container.addEventListener('mouseleave', resetCards);
}

function initVariableProximity(root = document) {
  if (window.matchMedia('(max-width: 768px), (hover: none), (pointer: coarse)').matches) {
    return;
  }

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
      letter.style.fontVariationSettings = '';
      letter.style.fontWeight = '';
      letter.style.transform = `translateX(${direction * 4 * eased}px)`;
      letter.style.filter = '';
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

function runInteractionStep(label, task) {
  try {
    console.log(`[portfolio] ${label}: start`);
    task();
    console.log(`[portfolio] ${label}: ready`);
  } catch (error) {
    console.warn(`[portfolio] ${label}: failed`, error);
  }
}

if (typeof renderOtherWorksHeading === 'function') {
  runInteractionStep('other works heading', renderOtherWorksHeading);
}
if (typeof renderOtherWorksPreview === 'function') {
  runInteractionStep('other works preview', renderOtherWorksPreview);
}
runInteractionStep('variable proximity', initVariableProximity);
