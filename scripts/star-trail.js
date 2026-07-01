(function () {
  const startWhenIdle = (task) => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(task, { timeout: 2200 });
      return;
    }
    window.setTimeout(task, 900);
  };

  startWhenIdle(() => {
  try {
  console.log('[portfolio] star trail: start');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');

  if (reduceMotion.matches || !finePointer.matches) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  canvas.className = 'star-trail-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '9990',
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    mixBlendMode: 'screen'
  });
  document.body.appendChild(canvas);

  let width = 0;
  let height = 0;
  let dpr = 1;
  let raf = 0;
  let lastPoint = null;
  let lastSpawn = 0;
  const stars = [];
  const maxStars = 56;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const getPalette = () => {
    const light = document.body.classList.contains('theme-light');
    canvas.style.mixBlendMode = light ? 'normal' : 'screen';
    return light
      ? ['rgba(255, 224, 72, ', 'rgba(255, 238, 128, ', 'rgba(255, 246, 178, ']
      : ['rgba(255, 252, 236, ', 'rgba(245, 240, 215, ', 'rgba(255, 244, 198, '];
  };

  const getStarSize = () => {
    const roll = Math.random();
    if (roll > 0.82) return 5.6 + Math.random() * 1.8;
    if (roll > 0.42) return 3.4 + Math.random() * 1.5;
    return 2.1 + Math.random() * 1.1;
  };

  const drawStar = (star) => {
    const points = star.points;
    const outer = star.size * star.scale;
    const inner = outer * 0.38;

    ctx.save();
    ctx.translate(star.x, star.y);
    ctx.rotate(star.rotation);
    ctx.beginPath();
    for (let i = 0; i < points * 2; i += 1) {
      const radius = i % 2 === 0 ? outer : inner;
      const angle = (Math.PI * i) / points - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.shadowBlur = star.outline ? 7 * star.alpha : 10 * star.alpha;
    ctx.shadowColor = `${star.color}${Math.min(star.alpha * 0.45, 0.22)})`;
    if (star.outline) {
      ctx.lineWidth = Math.max(0.75, outer * 0.16);
      ctx.strokeStyle = `${star.color}${star.alpha * 0.92})`;
      ctx.stroke();
    } else {
      ctx.fillStyle = `${star.color}${star.alpha})`;
      ctx.fill();
    }
    ctx.restore();
  };

  const drawMote = (star) => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size * star.scale, 0, Math.PI * 2);
    ctx.fillStyle = `${star.color}${star.alpha * 0.72})`;
    ctx.fill();
  };

  const tick = () => {
    ctx.clearRect(0, 0, width, height);

    for (let i = stars.length - 1; i >= 0; i -= 1) {
      const star = stars[i];
      star.age += 1;
      star.x += star.vx;
      star.y += star.vy;
      star.vx *= 0.986;
      star.vy = star.vy * 0.986 + star.gravity;
      star.rotation += star.spin;

      const life = star.age / star.life;
      const fade = 1 - life;
      star.alpha = Math.max(0, fade * fade * star.opacity);
      star.scale = 0.72 + Math.sin(life * Math.PI) * 0.44;

      if (star.alpha <= 0.01) {
        stars.splice(i, 1);
      } else if (star.kind === 'mote') {
        drawMote(star);
      } else {
        drawStar(star);
      }
    }

    if (stars.length) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = 0;
    }
  };

  const start = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };

  const spawn = (x, y, velocity) => {
    const palette = getPalette();
    const count = velocity > 38 ? 3 : 2;

    for (let i = 0; i < count; i += 1) {
      if (stars.length >= maxStars) stars.shift();
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.22 + Math.random() * 0.72 + Math.min(velocity / 80, 0.62);
      const offset = Math.random() * 4.5;
      const kind = i === 0 && Math.random() > 0.22 ? 'star' : 'mote';

      stars.push({
        kind,
        x: x + Math.cos(angle) * offset,
        y: y + Math.sin(angle) * offset,
        vx: Math.cos(angle) * speed - velocity * 0.006,
        vy: Math.sin(angle) * speed - 0.12,
        gravity: kind === 'star' ? 0.006 : 0.003,
        age: 0,
        life: kind === 'star' ? 30 + Math.random() * 18 : 22 + Math.random() * 16,
        size: kind === 'star' ? getStarSize() : 1.1 + Math.random() * 1.7,
        scale: 1,
        alpha: 1,
        opacity: kind === 'star' ? 0.4 + Math.random() * 0.15 : 0.16 + Math.random() * 0.1,
        color: palette[Math.floor(Math.random() * palette.length)],
        outline: kind === 'star' && Math.random() > 0.64,
        points: 5,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.075
      });
    }

    start();
  };

  const handlePointerMove = (event) => {
    const now = performance.now();
    const point = { x: event.clientX, y: event.clientY };

    if (!lastPoint) {
      lastPoint = point;
      spawn(point.x, point.y, 0);
      return;
    }

    const distance = Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y);
    if (distance < 14 || now - lastSpawn < 22) return;

    lastSpawn = now;
    lastPoint = point;
    spawn(point.x, point.y, distance);
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  window.addEventListener('pointerleave', () => { lastPoint = null; }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stars.length = 0;
      ctx.clearRect(0, 0, width, height);
    }
  });
  console.log('[portfolio] star trail: ready');
  } catch (error) {
    console.warn('[portfolio] star trail: failed', error);
  }
  });
})();
