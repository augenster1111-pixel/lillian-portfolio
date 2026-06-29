(function () {
  const initWideKvGallery = () => {
    const project = window.PROJECTS_DATA?.["03"];
    const gallery = document.querySelector("[data-wide-kv-gallery]");
    const slides = Array.isArray(project?.wideGalleryImages)
      ? project.wideGalleryImages.filter(Boolean)
      : [];

    if (!gallery || !slides.length) return;

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
      <div class="wide-kv-dots" data-wide-dots aria-label="KV 图片切换"></div>
    `;

    const sideNav = document.createElement("div");
    sideNav.className = "wide-kv-side-nav";
    sideNav.innerHTML = `
      <button type="button" class="wide-kv-side-button wide-kv-side-button--prev" data-wide-side-prev aria-label="上一张 KV">←</button>
      <button type="button" class="wide-kv-side-button wide-kv-side-button--next" data-wide-side-next aria-label="下一张 KV">→</button>
    `;

    const detail = document.createElement("div");
    detail.className = "wide-kv-detail";
    detail.innerHTML = `
      <div class="wide-kv-detail-frame">
        <img data-wide-detail-image alt="">
      </div>
      <div class="wide-kv-tools">
        <button type="button" data-wide-prev aria-label="上一张">←</button>
        <span data-wide-counter>01 / ${String(slides.length).padStart(2, "0")}</span>
        <button type="button" data-wide-next aria-label="下一张">→</button>
        <button type="button" data-wide-close aria-label="关闭">CLOSE</button>
      </div>
    `;

    let activeIndex = 0;
    let slideWidth = 0;
    let gap = 28;
    let currentX = 0;
    let targetX = 0;
    let frameId = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartTarget = 0;

    const clampIndex = (index) => {
      const safeIndex = Number.isFinite(index) ? index : 0;
      return Math.max(0, Math.min(slides.length - 1, safeIndex));
    };

    const measure = () => {
      const firstCard = track.querySelector(".wide-kv-card");
      const viewportWidth = viewport.clientWidth || gallery.clientWidth || window.innerWidth;
      const nextWidth = firstCard?.getBoundingClientRect().width || Math.min(viewportWidth * 0.76, 1180);
      slideWidth = nextWidth || viewportWidth;
      gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 28;
    };

    const getTranslateX = (index) => {
      const safeIndex = clampIndex(index);
      const card = track.querySelectorAll(".wide-kv-card")[safeIndex];
      const viewportWidth = viewport.clientWidth || gallery.clientWidth || window.innerWidth;

      if (!card) {
        return (viewportWidth - slideWidth) / 2 - safeIndex * (slideWidth + gap);
      }

      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      return viewportWidth / 2 - cardCenter;
    };

    const updateVisualState = () => {
      const cards = Array.from(track.querySelectorAll(".wide-kv-card"));
      const dots = Array.from(controls.querySelectorAll("[data-wide-dot]"));
      const progress = controls.querySelector("[data-wide-progress]");
      const counter = detail.querySelector("[data-wide-counter]");
      const detailImage = detail.querySelector("[data-wide-detail-image]");
      const prevSideButton = sideNav.querySelector("[data-wide-side-prev]");
      const nextSideButton = sideNav.querySelector("[data-wide-side-next]");

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
      if (counter) counter.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
      if (detailImage) {
        detailImage.src = slides[activeIndex];
        detailImage.alt = `游戏广告 KV ${String(activeIndex + 1).padStart(2, "0")}`;
      }
      if (prevSideButton) prevSideButton.hidden = activeIndex === 0;
      if (nextSideButton) nextSideButton.hidden = activeIndex === slides.length - 1;
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

    const snapToNearest = () => {
      const cards = Array.from(track.querySelectorAll(".wide-kv-card"));
      const viewportCenter = (viewport.clientWidth || gallery.clientWidth || window.innerWidth) / 2;
      let nearestIndex = activeIndex;
      let nearestDistance = Number.POSITIVE_INFINITY;

      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2 + targetX;
        const distance = Math.abs(cardCenter - viewportCenter);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      setActiveIndex(nearestIndex);
    };

    const openDetail = (index) => {
      setActiveIndex(index, { instant: true });
      section.classList.add("is-detail");
      document.body.classList.add("work03-modal-open");
      updateVisualState();
    };

    const closeDetail = () => {
      section.classList.remove("is-detail");
      document.body.classList.remove("work03-modal-open");
      setActiveIndex(activeIndex, { instant: true });
    };

    slides.forEach((src, index) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "wide-kv-card";
      card.style.setProperty("--kv-delay", `${index * 45}ms`);
      card.setAttribute("aria-label", `查看游戏广告 KV ${String(index + 1).padStart(2, "0")}`);

      const image = document.createElement("img");
      image.src = src;
      image.alt = `游戏广告 KV ${String(index + 1).padStart(2, "0")}`;
      image.loading = index < 2 ? "eager" : "lazy";
      image.addEventListener("load", () => {
        measure();
        setActiveIndex(activeIndex, { instant: true });
      }, { once: true });

      card.append(image);
      card.addEventListener("mouseenter", () => card.classList.add("is-focus"));
      card.addEventListener("mouseleave", () => card.classList.remove("is-focus"));
      card.addEventListener("click", () => openDetail(index));
      track.append(card);
    });

    const dotsWrap = controls.querySelector("[data-wide-dots]");
    slides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "wide-kv-dot";
      dot.dataset.wideDot = "";
      dot.setAttribute("aria-label", `切换到第 ${index + 1} 张 KV`);
      dot.addEventListener("click", (event) => {
        event.preventDefault();
        setActiveIndex(index);
      });
      dotsWrap.append(dot);
    });

    viewport.addEventListener("pointerdown", (event) => {
      if (section.classList.contains("is-detail")) return;
      isDragging = true;
      dragStartX = event.clientX;
      dragStartTarget = targetX;
      viewport.classList.add("is-dragging");
      viewport.setPointerCapture(event.pointerId);
    });

    viewport.addEventListener("pointermove", (event) => {
      if (!isDragging) return;
      const delta = event.clientX - dragStartX;
      targetX = dragStartTarget + delta;
      currentX = targetX;
      setTrackX(currentX);
    });

    const endDrag = (event) => {
      if (!isDragging) return;
      isDragging = false;
      viewport.classList.remove("is-dragging");
      if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
      snapToNearest();
    };

    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);

    viewport.addEventListener("wheel", (event) => {
      if (section.classList.contains("is-detail")) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(delta) < 2) return;
      event.preventDefault();
      targetX -= delta;
      window.clearTimeout(viewport._snapTimer);
      viewport._snapTimer = window.setTimeout(snapToNearest, 120);
    }, { passive: false });

    sideNav.querySelector("[data-wide-side-prev]").addEventListener("click", () => setActiveIndex(activeIndex - 1));
    sideNav.querySelector("[data-wide-side-next]").addEventListener("click", () => setActiveIndex(activeIndex + 1));
    detail.querySelector("[data-wide-prev]").addEventListener("click", () => setActiveIndex(activeIndex - 1, { instant: true }));
    detail.querySelector("[data-wide-next]").addEventListener("click", () => setActiveIndex(activeIndex + 1, { instant: true }));
    detail.querySelector("[data-wide-close]").addEventListener("click", closeDetail);
    detail.addEventListener("click", (event) => {
      if (event.target === detail) closeDetail();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && section.classList.contains("is-detail")) closeDetail();
    });

    viewport.append(track);
    section.append(viewport, sideNav, controls, detail);
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWideKvGallery, { once: true });
  } else {
    initWideKvGallery();
  }
})();
