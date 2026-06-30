(function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobileMotion = window.matchMedia('(max-width: 768px), (hover: none), (pointer: coarse)').matches;
  const body = document.body;

  const primaryTitleSelectors = [
    '.hero-title',
    '.section-heading h2',
    '.gallery-heading h2',
    '.contact h2',
    '.work-copy h1',
    '.work01-copy h1',
    '.work-placeholder h2',
    '.work-media h2',
    '.project-block-heading h2',
    '.work02-thinking-copy h2',
    '.work02-workflow-head h2',
    '.work03-wide-heading h2',
    '.work04-project-intro h1',
    '.work04-detail-caption h2',
    '.about-profile-copy h1',
    '.timeline-card h2',
    '.other-page-hero h1'
  ];

  const floatSelectors = [
    '.hero-title-layer .hero-content > *',
    '.hero-info-layer > *',
    '.hero-card-layer > *',
    '.section-heading',
    '.gallery-heading',
    '.project-browser',
    '.about-gallery',
    '.gallery-hint',
    '.about-skill-marquee',
    '.contact-inner > *',
    '.work-copy > *',
    '.work01-copy > *',
    '.work-cover',
    '.work-placeholder h2',
    '.work-media h2',
    '.project-block-heading > *',
    '.placeholder-card',
    '.work02-thinking-copy > *',
    '.work02-strategy > *',
    '.work02-workflow-head > *',
    '.work02-timeline > *',
    '.work03-wide-heading > *',
    '.stack-set',
    '.wide-kv-set',
    '.work04-case-card',
    '.work04-detail-caption > *',
    '.work04-detail-item > img',
    '.about-avatar',
    '.about-profile-copy > *',
    '.timeline-item',
    '.other-page-hero > *',
    '.other-works-grid > *'
  ];

  function initVariableProximity(root = document) {
    if (isMobileMotion) return;

    const targets = [...root.querySelectorAll('[data-variable-proximity]')].filter((target) => !target.dataset.vpReady);
    if (!targets.length) return;

    const escapeHtml = (value) => value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
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
        letter.style.transform = `translateX(${direction * 4 * eased}px)`;
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

  function markMotionTargets() {
    document.querySelectorAll(primaryTitleSelectors.join(',')).forEach((node) => {
      if (!node.textContent.trim()) return;
      node.classList.add('motion-title-reveal');
    });

    document.querySelectorAll(floatSelectors.join(',')).forEach((node, index) => {
      if (!node.textContent.trim() && !node.querySelector('img, video, canvas, picture')) return;
      node.classList.add('motion-float-in');
      node.style.setProperty('--motion-delay', `${Math.min(index % 6, 5) * 55}ms`);
    });
  }

  function initRevealObserver() {
    requestAnimationFrame(() => {
      document.querySelectorAll('.motion-title-reveal').forEach((node) => {
        node.classList.add('is-motion-visible');
      });
    });

    if (reducedMotion) {
      document.querySelectorAll('.motion-float-in, .motion-title-reveal').forEach((node) => {
        node.classList.add('is-motion-visible');
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-motion-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -42px' });

    document.querySelectorAll('.motion-float-in, .motion-title-reveal').forEach((node) => {
      observer.observe(node);
    });
  }

  function initHeroParallax() {
    const hero = document.querySelector('.hero');
    const background = document.querySelector('.hero-background-layer');
    if (!hero || !background || reducedMotion || isMobileMotion) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let raf = 0;

    const animate = () => {
      current.x += (target.x - current.x) * 0.075;
      current.y += (target.y - current.y) * 0.075;
      background.style.setProperty('--hero-parallax-x', `${current.x.toFixed(2)}px`);
      background.style.setProperty('--hero-parallax-y', `${current.y.toFixed(2)}px`);
      if (Math.abs(target.x - current.x) > 0.02 || Math.abs(target.y - current.y) > 0.02) {
        raf = requestAnimationFrame(animate);
      } else {
        raf = 0;
      }
    };

    const request = () => {
      if (!raf) raf = requestAnimationFrame(animate);
    };

    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      target.x = Math.max(-6, Math.min(6, x * 12));
      target.y = Math.max(-6, Math.min(6, y * 12));
      request();
    }, { passive: true });

    hero.addEventListener('pointerleave', () => {
      target.x = 0;
      target.y = 0;
      request();
    });
  }

  function initAboutTilt() {
    const cards = [...document.querySelectorAll('#about .about-gallery-card')];
    if (!cards.length || reducedMotion || isMobileMotion) return;

    cards.forEach((card) => {
      let raf = 0;
      const target = { x: 0, y: 0 };
      const current = { x: 0, y: 0 };

      const apply = () => {
        current.x += (target.x - current.x) * 0.14;
        current.y += (target.y - current.y) * 0.14;
        card.style.setProperty('--about-tilt-x', `${current.x.toFixed(2)}deg`);
        card.style.setProperty('--about-tilt-y', `${current.y.toFixed(2)}deg`);
        if (Math.abs(target.x - current.x) > 0.01 || Math.abs(target.y - current.y) > 0.01) {
          raf = requestAnimationFrame(apply);
        } else {
          raf = 0;
        }
      };

      const request = () => {
        if (!raf) raf = requestAnimationFrame(apply);
      };

      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        target.x = Math.max(-2, Math.min(2, -y * 4));
        target.y = Math.max(-2, Math.min(2, x * 4));
        request();
      }, { passive: true });

      card.addEventListener('pointerleave', () => {
        target.x = 0;
        target.y = 0;
        request();
      });
    });
  }

  function init() {
    body.classList.add('motion-ready');
    if (isMobileMotion) {
      document.querySelectorAll('.is-physics-active, .is-hovering, .is-hovered, .is-active-physics, .is-focus').forEach((node) => {
        node.classList.remove('is-physics-active', 'is-hovering', 'is-hovered', 'is-active-physics', 'is-focus');
      });
    }
    initVariableProximity();
    markMotionTargets();
    initRevealObserver();
    initHeroParallax();
    initAboutTilt();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
