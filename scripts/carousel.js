(function () {
  const isMobileWide = () => window.matchMedia("(max-width: 768px)").matches;

  const initWideKvGallery = () => {
    const project = window.PROJECTS_DATA?.["03"];
    const gallery = document.querySelector("[data-wide-kv-gallery]");
    const slides = Array.isArray(project?.wideGalleryImages)
      ? project.wideGalleryImages.filter(Boolean)
      : [];

    if (!gallery || !slides.length) return;

    const renderMobileSwitchers = () => {
      const groups = [4, 3, 2, 2].reduce((items, size) => {
        const start = items.offset;
        const images = slides.slice(start, start + size);
        if (images.length) items.groups.push(images);
        items.offset = start + size;
        return items;
      }, { offset: 0, groups: [] }).groups;

      const createGroup = (images, groupIndex) => {
        const section = document.createElement("article");
        section.className = "wide-kv-set wide-kv-single wide-kv-switcher";
        section.dataset.activeIndex = "0";

        const deck = document.createElement("div");
        deck.className = "wide-kv-deck";

        const cards = images.map((src, index) => {
          const card = document.createElement("button");
          card.type = "button";
          card.className = "wide-kv-card";
          card.setAttribute("aria-label", `Creative ad image ${groupIndex + 1}-${index + 1}`);

          const image = document.createElement("img");
          image.src = src;
          image.alt = `Creative ad image ${groupIndex + 1}-${String(index + 1).padStart(2, "0")}`;
          image.loading = groupIndex === 0 && index === 0 ? "eager" : "lazy";

          card.append(image);
          card.addEventListener("click", () => setActive(index));
          return card;
        });

        const tools = document.createElement("div");
        tools.className = "wide-kv-tools";
        tools.innerHTML = '<button type="button" data-wide-kv-prev aria-label="Previous image">&larr;</button><span data-wide-kv-counter>01 / 01</span><button type="button" data-wide-kv-next aria-label="Next image">&rarr;</button>';

        const setActive = (index) => {
          const total = cards.length;
          const nextIndex = (index + total) % total;
          section.dataset.activeIndex = String(nextIndex);
          cards.forEach((card, cardIndex) => {
            const isActive = cardIndex === nextIndex;
            card.classList.toggle("is-active", isActive);
            card.setAttribute("aria-pressed", isActive ? "true" : "false");
          });
          const counter = tools.querySelector("[data-wide-kv-counter]");
          if (counter) counter.textContent = `${String(nextIndex + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
        };

        tools.querySelector("[data-wide-kv-prev]").addEventListener("click", () => {
          setActive(Number(section.dataset.activeIndex || 0) - 1);
        });
        tools.querySelector("[data-wide-kv-next]").addEventListener("click", () => {
          setActive(Number(section.dataset.activeIndex || 0) + 1);
        });

        deck.replaceChildren(...cards);
        section.replaceChildren(deck, tools);
        setActive(0);
        return section;
      };

      gallery.replaceChildren(...groups.map(createGroup));
    };

    const renderDesktopCarousel = () => {
      const section = document.createElement("article");
      section.className = "wide-kv-set wide-kv-single";

      const viewport = document.createElement("div");
      viewport.className = "wide-kv-viewport";

      const track = document.createElement("div");
      track.className = "wide-kv-track";

      const controls = document.createElement("div");
      controls.className = "wide-kv-indicator";
      controls.innerHTML = `
        <div class="wide-kv-progress" aria-hidden="true"><span data-wide-progress></span></div>
        <div class="wide-kv-dots" data-wide-dots aria-label="KV image navigation"></div>
      `;

      const sideNav = document.createElement("div");
      sideNav.className = "wide-kv-side-nav";
      sideNav.setAttribute("aria-label", "KV side navigation");
      sideNav.innerHTML = `
        <button type="button" class="wide-kv-side-button wide-kv-side-button--prev" data-wide-side-prev aria-label="Previous image">&larr;</button>
        <button type="button" class="wide-kv-side-button wide-kv-side-button--next" data-wide-side-next aria-label="Next image">&rarr;</button>
      `;

      let activeIndex = 0;
      let slideWidth = 0;
      let gap = 28;
      let currentX = 0;
      let targetX = 0;
      let frameId = 0;

      const clampIndex = (index) => Math.max(0, Math.min(slides.length - 1, Number.isFinite(index) ? index : 0));

      const measure = () => {
        const firstCard = track.querySelector(".wide-kv-card");
        const viewportWidth = viewport.clientWidth || gallery.clientWidth || window.innerWidth;
        slideWidth = firstCard?.getBoundingClientRect().width || Math.min(viewportWidth * 0.76, 1180);
        gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 28;
      };

      const getTranslateX = (index) => {
        const safeIndex = clampIndex(index);
        const card = track.querySelectorAll(".wide-kv-card")[safeIndex];
        const viewportWidth = viewport.clientWidth || gallery.clientWidth || window.innerWidth;
        if (!card) return (viewportWidth - slideWidth) / 2 - safeIndex * (slideWidth + gap);
        return viewportWidth / 2 - (card.offsetLeft + card.offsetWidth / 2);
      };

      const updateVisualState = () => {
        const cards = Array.from(track.querySelectorAll(".wide-kv-card"));
        const dots = Array.from(controls.querySelectorAll("[data-wide-dot]"));
        const progress = controls.querySelector("[data-wide-progress]");
        const prevButton = sideNav.querySelector("[data-wide-side-prev]");
        const nextButton = sideNav.querySelector("[data-wide-side-next]");
        cards.forEach((card, index) => {
          const distance = Math.abs(index - activeIndex);
          card.classList.toggle("is-active", index === activeIndex);
          card.style.setProperty("--kv-distance", String(distance));
        });
        dots.forEach((dot, index) => {
          dot.classList.toggle("is-active", index === activeIndex);
          dot.setAttribute("aria-current", index === activeIndex ? "true" : "false");
        });
        if (progress) progress.style.width = `${((activeIndex + 1) / slides.length) * 100}%`;
        if (prevButton) prevButton.hidden = activeIndex === 0;
        if (nextButton) nextButton.hidden = activeIndex === slides.length - 1;
      };

      const setTrackX = (value) => {
        track.style.transform = `translate3d(${value}px, 0, 0)`;
      };

      const setActiveIndex = (index, options = {}) => {
        activeIndex = clampIndex(index);
        targetX = getTranslateX(activeIndex);
        if (options.instant) {
          currentX = targetX;
          setTrackX(currentX);
        }
        updateVisualState();
      };

      const animate = () => {
        currentX += (targetX - currentX) * 0.18;
        if (Math.abs(targetX - currentX) < 0.15) currentX = targetX;
        setTrackX(currentX);
        frameId = requestAnimationFrame(animate);
      };

      slides.forEach((src, index) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "wide-kv-card";
        card.style.setProperty("--kv-delay", `${index * 45}ms`);
        card.setAttribute("aria-label", `View game advertising KV ${String(index + 1).padStart(2, "0")}`);

        const image = document.createElement("img");
        image.src = src;
        image.alt = `Game advertising KV ${String(index + 1).padStart(2, "0")}`;
        image.loading = index < 2 ? "eager" : "lazy";
        image.addEventListener("load", () => {
          measure();
          setActiveIndex(activeIndex, { instant: true });
        }, { once: true });

        card.append(image);
        card.addEventListener("mouseenter", () => card.classList.add("is-focus"));
        card.addEventListener("mouseleave", () => card.classList.remove("is-focus"));
        card.addEventListener("click", () => setActiveIndex(index));
        track.append(card);
      });

      const dotsWrap = controls.querySelector("[data-wide-dots]");
      slides.forEach((_, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "wide-kv-dot";
        dot.dataset.wideDot = "";
        dot.setAttribute("aria-label", `Go to KV ${index + 1}`);
        dot.addEventListener("click", (event) => {
          event.preventDefault();
          setActiveIndex(index);
        });
        dotsWrap.append(dot);
      });

      sideNav.querySelector("[data-wide-side-prev]").addEventListener("click", (event) => {
        event.preventDefault();
        setActiveIndex(activeIndex - 1);
      });
      sideNav.querySelector("[data-wide-side-next]").addEventListener("click", (event) => {
        event.preventDefault();
        setActiveIndex(activeIndex + 1);
      });

      viewport.append(track);
      section.append(viewport, sideNav, controls);
      gallery.replaceChildren(section);

      requestAnimationFrame(() => {
        measure();
        setActiveIndex(0, { instant: true });
        cancelAnimationFrame(frameId);
        animate();
      });

      window.addEventListener("resize", () => {
        measure();
        setActiveIndex(activeIndex, { instant: true });
      });
    };

    if (isMobileWide()) renderMobileSwitchers();
    else renderDesktopCarousel();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWideKvGallery, { once: true });
  } else {
    initWideKvGallery();
  }
})();
