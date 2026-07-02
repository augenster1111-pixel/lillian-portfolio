(function () {
  const manifest = window.PERF_IMAGE_MANIFEST || {};
  const script = document.currentScript || document.querySelector('script[src*="perf-image-manifest.js"]');
  const rootUrl = script ? new URL('../', script.src) : new URL('./', document.baseURI);
  let avifSupport = false;

  function encodeAssetPath(path) {
    return path.split('/').map(encodeURIComponent).join('/');
  }

  function assetUrl(path) {
    return new URL(encodeAssetPath(path), rootUrl).href;
  }

  function manifestKeyFromUrl(value) {
    if (!value) return '';
    const url = new URL(value, document.baseURI);
    const decodedPath = decodeURIComponent(url.pathname).replace(/\\/g, '/');
    const marker = '/website-code/';
    if (decodedPath.includes(marker)) return decodedPath.split(marker).pop();
    return decodedPath.replace(/^\/+/, '');
  }

  function bestSet(record) {
    const avifSet = avifSupport && record.avif?.length ? record.avif : [];
    return avifSet.length ? avifSet : (record.webp || []);
  }

  function preferredSizes(img) {
    if (img.closest('.project-preview, .about-card-media, .masonry-item, .placeholder-card, .work04-case-media')) {
      return '(max-width: 768px) 78vw, 50vw';
    }
    if (img.closest('.contact-socials, .contact-modal')) {
      return '96px';
    }
    return '(max-width: 768px) 100vw, 50vw';
  }

  function enhanceImage(img) {
    if (!img || img.dataset.perfMediaReady === 'true') return;
    const rawSrc = img.getAttribute('src') || img.currentSrc;
    const record = manifest[manifestKeyFromUrl(rawSrc)];
    if (!record) return;

    const candidates = bestSet(record);
    if (candidates.length) {
      img.srcset = candidates.map((item) => `${assetUrl(item.url)} ${item.width}w`).join(', ');
      if (!img.sizes) img.sizes = img.dataset.sizes || preferredSizes(img);
    }

    const preferred = avifSupport && record.avifOriginal ? record.avifOriginal : record.webpOriginal;
    if (preferred && rawSrc && !manifestKeyFromUrl(rawSrc).endsWith('.avif')) {
      img.src = assetUrl(preferred);
    }

    img.dataset.perfMediaReady = 'true';
  }

  function enhancePoster(video) {
    const poster = video.getAttribute('poster');
    if (!poster || video.dataset.perfPosterReady === 'true') return;
    const record = manifest[manifestKeyFromUrl(poster)];
    const preferred = avifSupport && record?.avifOriginal ? record.avifOriginal : null;
    if (preferred) video.poster = assetUrl(preferred);
    video.dataset.perfPosterReady = 'true';
  }

  function enhanceAll(root = document) {
    root.querySelectorAll('img[src]').forEach(enhanceImage);
    root.querySelectorAll('video[poster]').forEach(enhancePoster);
  }

  function observeNewMedia() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.matches?.('img[src]')) enhanceImage(node);
          if (node.matches?.('video[poster]')) enhancePoster(node);
          enhanceAll(node);
        });
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function detectAvif() {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image.width === 1);
      image.onerror = () => resolve(false);
      image.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxAAAAAG1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAHBpY3QAAAAAAAAAAAAAAABwaXRtAAAAAAAOaWxvYwAAAAAEQAABAAAAAAEAAAABAAAAAAEAAABpaW5mAAAAAAEAAAAZaW5mZQIAAAAAAQAAYXYwMUltYWdlAAAAAGlwcnAAAAAaaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAABNpcG1hAAAAAAAAAAEAAQQBAoOEAAAAG21kYXQSAAoIP8YE7A';
    });
  }

  window.perfMediaEnhance = enhanceAll;

  detectAvif().then((supported) => {
    avifSupport = supported;
    enhanceAll();
    observeNewMedia();
  });
})();
