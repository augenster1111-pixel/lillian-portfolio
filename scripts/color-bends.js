(function () {
  const ROOT = document.documentElement;
  const REDUCED_MOTION = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let targetX = 50;
  let targetY = 50;
  let currentX = 50;
  let currentY = 50;
  let frameId = null;

  function isHomePage() {
    const path = decodeURIComponent(window.location.pathname).replace(/\\/g, "/");
    return /\/website-code\/index\.html$/i.test(path) || /\/website-code\/?$/i.test(path);
  }

  function removeLayer() {
    const layer = document.querySelector(".global-color-bends");
    if (layer) layer.remove();
  }

  function ensureLayer() {
    if (document.querySelector(".global-color-bends")) return;
    const layer = document.createElement("div");
    layer.className = "global-color-bends";
    layer.setAttribute("aria-hidden", "true");
    document.body.prepend(layer);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function updatePointer(event) {
    if (!window.innerWidth || !window.innerHeight) return;
    const normalizedX = event.clientX / window.innerWidth - 0.5;
    const normalizedY = event.clientY / window.innerHeight - 0.5;
    targetX = clamp(50 + normalizedX * 14, 43, 57);
    targetY = clamp(50 + normalizedY * 10, 45, 55);
    if (!frameId && !REDUCED_MOTION) frameId = requestAnimationFrame(tick);
  }

  function tick() {
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;

    ROOT.style.setProperty("--bend-x", currentX.toFixed(2) + "%");
    ROOT.style.setProperty("--bend-y", currentY.toFixed(2) + "%");
    ROOT.style.setProperty("--bend-shift-x", ((currentX - 50) * 0.12).toFixed(2) + "px");
    ROOT.style.setProperty("--bend-shift-y", ((currentY - 50) * 0.1).toFixed(2) + "px");

    if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
      frameId = requestAnimationFrame(tick);
    } else {
      frameId = null;
    }
  }

  function init() {
    if (isHomePage()) {
      removeLayer();
      return;
    }

    ensureLayer();
    ROOT.style.setProperty("--bend-x", "50%");
    ROOT.style.setProperty("--bend-y", "50%");
    if (!REDUCED_MOTION) {
      window.addEventListener("pointermove", updatePointer, { passive: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
