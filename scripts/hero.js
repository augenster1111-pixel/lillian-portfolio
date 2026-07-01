function initHeroFerrofluid() {
  const canvas = document.querySelector('.hero-ferrofluid');
  const hero = document.querySelector('.hero');
  if (!canvas || !hero) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const blobs = Array.from({ length: 11 }, (_, index) => ({
    x: 0,
    y: 0,
    radius: 80 + (index % 5) * 28 + Math.random() * 26,
    ampX: 42 + Math.random() * 120,
    ampY: 30 + Math.random() * 74,
    phase: Math.random() * Math.PI * 2,
    speed: 0.12 + Math.random() * 0.22,
    drift: 10 + Math.random() * 34
  }));

  const mouse = {
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    active: false
  };

  let width = 0;
  let height = 0;
  let dpr = 1;
  let running = true;
  let frameId = 0;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    blobs.forEach((blob, index) => {
      blob.x = width * (0.12 + (index % 6) * 0.16) + (Math.random() - 0.5) * 80;
      blob.y = height * (0.16 + Math.floor(index / 3) * 0.18) + Math.random() * 120;
    });
  };

  const drawBlob = (x, y, radius, alpha = 1) => {
    const gradient = ctx.createRadialGradient(x - radius * 0.22, y - radius * 0.28, radius * 0.06, x, y, radius);
    gradient.addColorStop(0, `rgba(255,255,255,${0.95 * alpha})`);
    gradient.addColorStop(0.18, `rgba(255,255,255,${0.5 * alpha})`);
    gradient.addColorStop(0.44, `rgba(255,255,255,${0.12 * alpha})`);
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(255,255,255,${0.16 * alpha})`;
    ctx.lineWidth = Math.max(1, radius * 0.018);
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.72, 0.15, Math.PI * 1.68);
    ctx.stroke();
  };

  const render = (time = 0) => {
    frameId = requestAnimationFrame(render);
    if (!running || !width || !height) return;

    const t = time * 0.001;
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowColor = 'rgba(255,255,255,.34)';
    ctx.shadowBlur = 34;

    mouse.x += (mouse.tx - mouse.x) * 0.09;
    mouse.y += (mouse.ty - mouse.y) * 0.09;

    blobs.forEach((blob, index) => {
      const flowY = ((blob.y + t * blob.drift * 10) % (height + blob.radius * 3)) - blob.radius;
      const x = blob.x + Math.sin(t * blob.speed + blob.phase) * blob.ampX;
      const y = flowY + Math.cos(t * blob.speed * 1.4 + blob.phase) * blob.ampY;
      drawBlob(x, y, blob.radius, index % 3 === 0 ? 0.5 : 0.36);
    });

    if (mouse.active) {
      drawBlob(mouse.x, mouse.y, Math.min(width, height) * 0.16, 0.78);
      drawBlob(mouse.x + Math.sin(t * 1.3) * 32, mouse.y - 26, Math.min(width, height) * 0.075, 0.48);
    }

    ctx.restore();
  };

  canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.tx = event.clientX - rect.left;
    mouse.ty = event.clientY - rect.top;
    mouse.active = true;
  }, { passive: true });

  canvas.addEventListener('pointerleave', () => {
    mouse.active = false;
  });

  const visibilityObserver = new IntersectionObserver((entries) => {
    running = entries.some((entry) => entry.isIntersecting);
    if (running && !frameId) frameId = requestAnimationFrame(render);
  }, { threshold: 0.05 });
  visibilityObserver.observe(hero);

  window.addEventListener('resize', resize, { passive: true });
  resize();
  frameId = requestAnimationFrame(render);
}

function deferHeroInit() {
  const start = () => {
    try {
      console.log('[portfolio] hero motion: start');
      initHeroFerrofluid();
      console.log('[portfolio] hero motion: ready');
    } catch (error) {
      console.warn('[portfolio] hero motion: failed', error);
    }
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(start, { timeout: 1800 });
    return;
  }

  window.setTimeout(start, 700);
}

deferHeroInit();
