(function () {
  try {
    document.body.classList.toggle('theme-light', localStorage.getItem('lillian-portfolio-theme') === 'light');
  } catch (error) {
    document.body.classList.remove('theme-light');
  }

  const data = window.ABOUT_DETAIL_DATA;
  if (!data) return;

  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (node && value) node.textContent = value;
  };

  setText('[data-about-nav-title]', data.navTitle);
  setText('[data-about-nav-subtitle]', data.navSubtitle);
  setText('[data-about-name]', data.profile.name);
  setText('[data-about-english]', data.profile.englishName);
  setText('[data-about-role]', data.profile.role);
  setText('[data-about-location]', data.profile.location);

  const avatar = document.querySelector('[data-about-avatar]');
  if (avatar && data.profile.avatar) avatar.src = encodeURI(data.profile.avatar);

  const intro = document.querySelector('[data-about-intro]');
  if (intro) {
    intro.innerHTML = (data.profile.intro || []).map((item) => `<p>${item}</p>`).join('');
  }

  const timeline = document.querySelector('[data-about-timeline]');
  if (timeline) {
    timeline.innerHTML = (data.timeline || []).map((item) => `
      <div class="timeline-item">
        <span class="timeline-marker" aria-hidden="true"></span>
        <article class="timeline-card">
          <div class="timeline-top">
            <h2>${item.company}</h2>
            <span class="timeline-period">${item.period}</span>
          </div>
          <strong class="timeline-role">${item.title}</strong>
          <p>${item.description}</p>
        </article>
      </div>
    `).join('');
  }

  const menu = document.querySelector('.work-project-menu');
  const trigger = document.querySelector('.work-menu-trigger');
  if (menu && trigger) {
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
  }
})();
