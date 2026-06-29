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
    tab.classList.remove('is-active');
    tab.setAttribute('aria-selected', 'false');
  });
  projectPanels.forEach((panel) => panel.classList.remove('is-active'));
  document.querySelectorAll('.project-category').forEach((category) => category.classList.remove('is-active'));
}

projectTabs.forEach((tab) => {
  tab.addEventListener('mouseenter', () => {
    if (!lockedProject) showProject(tab.dataset.project);
  });
  tab.addEventListener('focus', () => {
    if (!lockedProject) showProject(tab.dataset.project);
  });
  tab.addEventListener('click', () => {
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

aboutCards.forEach((card) => {
  card.tabIndex = 0;
  card.setAttribute('aria-pressed', 'false');
  card.addEventListener('mouseenter', () => {
    const activeCard = aboutCards.find((item) => item.classList.contains('is-active'));
    if (activeCard && activeCard !== card) return;
    aboutGallery.classList.add('is-hovering');
    card.classList.add('is-hovered');
  });
  card.addEventListener('mouseleave', () => {
    aboutGallery.classList.remove('is-hovering');
    card.classList.remove('is-hovered');
  });
  const activateCard = () => {
    const detailHref = card.dataset.aboutDetailHref;
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

galleryVideos.forEach((video) => {
  const card = video.closest('.masonry-video');
  card.addEventListener('mouseenter', () => video.play().catch(() => {}));
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
