const navLinks = [...document.querySelectorAll('.nav-links a')];
const sections = [...document.querySelectorAll('main section[id]')];
const reveals = [...document.querySelectorAll('.reveal')];
const projectTabs = [...document.querySelectorAll('.project-tab')];
const projectPanels = [...document.querySelectorAll('.project-preview')];
const galleryVideos = [...document.querySelectorAll('.masonry-video video')];
const aboutCards = [...document.querySelectorAll('.about-gallery-card')];
const aboutGallery = document.querySelector('.about-gallery');
const heroCard = document.querySelector('.hero-id-card');
const contactButton = document.querySelector('.contact-pill');
const projectBrowser = document.querySelector('.project-browser');
let lockedProject = null;


const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px' });

reveals.forEach((node, index) => {
  node.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  revealObserver.observe(node);
});

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const activeSection = entry.target.id === 'gallery' ? 'projects' : entry.target.id;
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${activeSection}`);
    });
  });
}, { rootMargin: '-40% 0px -50%', threshold: 0 });

sections.forEach((section) => sectionObserver.observe(section));

function showProject(projectName) {
  projectTabs.forEach((tab) => {
    const isCurrent = tab.dataset.project === projectName;
    tab.classList.toggle('is-active', isCurrent);
    tab.classList.toggle('is-locked', isCurrent && lockedProject === projectName);
    tab.setAttribute('aria-selected', String(isCurrent));
  });

  projectPanels.forEach((panel) => {
    const isCurrent = panel.dataset.panel === projectName;
    panel.classList.toggle('is-active', isCurrent);
    panel.classList.toggle('is-locked', isCurrent && lockedProject === projectName);
  });

  document.querySelectorAll('.project-category').forEach((category) => {
    const isCurrent = category.dataset.category === projectName;
    category.classList.toggle('is-active', isCurrent);
    category.classList.toggle('is-locked', isCurrent && lockedProject === projectName);
  });
}

function hideProjects() {
  projectTabs.forEach((tab) => {
    tab.classList.remove('is-active', 'is-locked');
    tab.setAttribute('aria-selected', 'false');
  });
  projectPanels.forEach((panel) => panel.classList.remove('is-active', 'is-locked'));
  document.querySelectorAll('.project-category').forEach((category) => category.classList.remove('is-active', 'is-locked'));
}

projectTabs.forEach((tab) => {
  tab.addEventListener('mouseenter', () => {
    if (window.matchMedia('(max-width: 768px), (hover: none), (pointer: coarse)').matches) return;
    if (!lockedProject) showProject(tab.dataset.project);
  });
  tab.addEventListener('focus', () => {
    if (window.matchMedia('(max-width: 768px), (hover: none), (pointer: coarse)').matches) return;
    if (!lockedProject) showProject(tab.dataset.project);
  });
  tab.addEventListener('click', () => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile && lockedProject === tab.dataset.project) {
      lockedProject = null;
      projectBrowser?.classList.remove('has-locked');
      hideProjects();
      return;
    }
    lockedProject = tab.dataset.project;
    projectBrowser?.classList.add('has-locked');
    showProject(lockedProject);
  });
});

document.querySelectorAll('.project-category').forEach((category) => {
  category.addEventListener('mouseleave', () => {
    if (lockedProject) showProject(lockedProject);
    else hideProjects();
  });
});

projectPanels.forEach((panel) => {
  const openProject = () => {
    if (panel.dataset.url) window.location.href = panel.dataset.url;
  };
  panel.addEventListener('click', (event) => {
    if (!event.target.closest('a')) openProject();
  });
  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openProject();
    }
  });
});

if (heroCard) {
  heroCard.tabIndex = 0;
  heroCard.setAttribute('aria-pressed', 'false');
  const lockHeroCard = () => {
    heroCard.classList.add('is-active');
    heroCard.setAttribute('aria-pressed', 'true');
  };
  heroCard.addEventListener('click', lockHeroCard);
  heroCard.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      lockHeroCard();
    }
  });
}

if (contactButton) {
  contactButton.addEventListener('click', () => contactButton.classList.add('is-active'));
}

let mobileAboutActiveIndex = 0;
let mobileAboutStartX = 0;
let mobileAboutStartY = 0;
let mobileAboutDragging = false;
let mobileAboutSuppressClick = false;
const mobileAboutQuery = window.matchMedia('(max-width: 768px)');

const renderMobileAboutDeck = () => {
  if (!aboutGallery || !aboutCards.length) return;
  const isMobile = mobileAboutQuery.matches;
  aboutGallery.classList.toggle('is-mobile-deck', isMobile);
  if (isMobile) {
    aboutGallery.classList.remove('is-hovering');
  }
  aboutCards.forEach((card, index) => {
    card.classList.remove('is-active', 'is-prev', 'is-next', 'is-hidden', 'is-hovered');
    if (!isMobile) return;

    const previousIndex = (mobileAboutActiveIndex - 1 + aboutCards.length) % aboutCards.length;
    const nextIndex = (mobileAboutActiveIndex + 1) % aboutCards.length;
    card.classList.toggle('is-active', index === mobileAboutActiveIndex);
    card.classList.toggle('is-prev', index === previousIndex);
    card.classList.toggle('is-next', index === nextIndex);
    card.classList.toggle('is-hidden', index !== mobileAboutActiveIndex && index !== previousIndex && index !== nextIndex);
    card.setAttribute('aria-pressed', String(index === mobileAboutActiveIndex));
  });
  if (isMobile) aboutGallery.classList.add('has-active');
};

const moveMobileAboutDeck = (step) => {
  mobileAboutActiveIndex = (mobileAboutActiveIndex + step + aboutCards.length) % aboutCards.length;
  renderMobileAboutDeck();
};

aboutCards.forEach((card) => {
  const cardIndex = aboutCards.indexOf(card);
  card.tabIndex = 0;
  card.setAttribute('aria-pressed', 'false');
  card.addEventListener('mouseenter', () => {
    if (mobileAboutQuery.matches) {
      aboutGallery.classList.remove('is-hovering');
      card.classList.remove('is-hovered');
      renderMobileAboutDeck();
      return;
    }
    const activeCard = aboutCards.find((item) => item.classList.contains('is-active'));
    if (activeCard && activeCard !== card) return;
    aboutGallery.classList.add('is-hovering');
    card.classList.add('is-hovered');
  });
  card.addEventListener('mouseleave', () => {
    if (mobileAboutQuery.matches) {
      aboutGallery.classList.remove('is-hovering');
      card.classList.remove('is-hovered');
      renderMobileAboutDeck();
      return;
    }
    aboutGallery.classList.remove('is-hovering');
    card.classList.remove('is-hovered');
  });
  const activateCard = () => {
    const detailHref = card.dataset.aboutDetailHref;
    if (mobileAboutQuery.matches) {
      if (mobileAboutSuppressClick) return;
      if (detailHref) {
        window.location.href = detailHref;
        return;
      }
      mobileAboutActiveIndex = cardIndex;
      renderMobileAboutDeck();
      return;
    }
    if (detailHref) {
      window.location.href = detailHref;
      return;
    }
    aboutCards.forEach((item) => {
      const isActive = item === card;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });
    aboutGallery.classList.add('has-active');
  };
  card.addEventListener('click', activateCard);
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activateCard();
    }
  });
});

if (aboutGallery && aboutCards.length) {
  aboutGallery.addEventListener('touchstart', (event) => {
    if (!mobileAboutQuery.matches || !event.touches.length) return;
    aboutGallery.classList.remove('is-hovering');
    aboutCards.forEach((card) => card.classList.remove('is-hovered'));
    const touch = event.touches[0];
    mobileAboutStartX = touch.clientX;
    mobileAboutStartY = touch.clientY;
    mobileAboutDragging = true;
  }, { passive: true });

  aboutGallery.addEventListener('touchend', (event) => {
    if (!mobileAboutQuery.matches || !mobileAboutDragging) return;
    mobileAboutDragging = false;
    const touch = event.changedTouches[0];
    if (!touch) return;
    const deltaX = touch.clientX - mobileAboutStartX;
    const deltaY = touch.clientY - mobileAboutStartY;
    if (Math.abs(deltaX) < 36 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
    mobileAboutSuppressClick = true;
    window.setTimeout(() => {
      mobileAboutSuppressClick = false;
    }, 260);
    moveMobileAboutDeck(deltaX < 0 ? 1 : -1);
  }, { passive: true });

  mobileAboutQuery.addEventListener?.('change', renderMobileAboutDeck);
  window.addEventListener('resize', () => {
    renderMobileAboutDeck();
  }, { passive: true });

  renderMobileAboutDeck();
}

galleryVideos.forEach((video) => {
  const card = video.closest('.masonry-video');
  card.addEventListener('mouseenter', () => {
    if (video.dataset.loaded === 'true') video.play().catch(() => {});
  });
  card.addEventListener('mouseleave', () => video.pause());
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
