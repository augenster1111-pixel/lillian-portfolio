(function () {
  try {
    document.body.classList.toggle("theme-light", localStorage.getItem("lillian-portfolio-theme") === "light");
  } catch (error) {
    document.body.classList.remove("theme-light");
  }

  const pageId = document.body.dataset.work04DetailId;
  const data = window.WORK04_DETAIL_DATA?.[pageId];

  if (!data) return;

  const pageTitle = document.querySelector("title");
  const navTitle = document.querySelector("[data-work04-nav-title]");
  const sectionNav = document.querySelector("[data-work04-section-nav]");
  const gallery = document.querySelector("[data-work04-gallery]");
  const menu = document.querySelector(".work-project-menu");
  const trigger = document.querySelector(".work-menu-trigger");

  if (pageTitle) pageTitle.textContent = data.pageTitle;
  if (navTitle) navTitle.textContent = data.navTitle;
  if (gallery) gallery.setAttribute("aria-label", data.ariaLabel);

  if (sectionNav) {
    sectionNav.innerHTML = data.items.map((item, index) => `
      <a class="${index === 0 ? "is-active" : ""}" href="#${item.id}">
        ${item.nav}<sup>${item.number}</sup>
      </a>
    `).join("");
  }

  if (gallery) {
    gallery.innerHTML = data.items.map((item) => `
      <article class="work04-detail-item" id="${item.id}">
        <div class="work04-detail-caption">
          <span class="work04-detail-number">${item.number}</span>
          <h2>${item.title}</h2>
          <p>${item.body}</p>
        </div>
        <img src="${item.image}" alt="${item.alt}">
      </article>
    `).join("");
  }

  trigger?.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = menu.classList.toggle("is-open");
    trigger.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!menu?.contains(event.target)) menu?.classList.remove("is-open");
  });

  document.querySelectorAll(".work04-section-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".work04-section-nav a").forEach((item) => item.classList.remove("is-active"));
      link.classList.add("is-active");
    });
  });
})();
