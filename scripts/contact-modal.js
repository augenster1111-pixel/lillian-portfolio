(() => {
  const contactEmail = 'augenster1111@gmail.com';
  const qrPath = 'media/about%20me/%E5%BE%AE%E4%BF%A1%E4%BA%8C%E7%BB%B4%E7%A0%81.webp';
  let closeTimer = null;
  let toastTimer = null;

  function modalMarkup(type) {
    if (type === 'email') {
      return `
        <h3>Email</h3>
        <p class="contact-modal-email">${contactEmail}</p>
        <button class="copy-email-btn" type="button">复制邮箱</button>
        <p class="copy-email-toast" aria-live="polite">已复制邮箱</p>
      `;
    }

    return `
      <h3>微信</h3>
      <p>扫码添加微信</p>
      <img class="contact-modal-qr" src="${qrPath}" alt="微信二维码">
    `;
  }

  function initContactModal() {
    const modalButtons = document.querySelectorAll('[data-contact-modal]');
    const overlay = document.querySelector('.contact-modal-overlay');
    const modal = document.querySelector('.contact-modal');
    const modalContent = document.querySelector('.contact-modal-content');
    const closeBtn = document.querySelector('.contact-modal-close');

    if (!modalButtons.length || !overlay || !modal || !modalContent) return;

    function openContactModal(type) {
      window.clearTimeout(closeTimer);
      modalContent.innerHTML = modalMarkup(type);
      overlay.classList.remove('is-hidden');
      modal.classList.remove('is-hidden', 'is-closing');
      modal.offsetHeight;
      overlay.classList.add('is-open');
      modal.classList.add('is-open');
      document.body.classList.add('modal-open');
      modal.focus({ preventScroll: true });
    }

    function closeContactModal() {
      if (modal.classList.contains('is-hidden')) return;
      overlay.classList.remove('is-open');
      modal.classList.remove('is-open');
      modal.classList.add('is-closing');
      document.body.classList.remove('modal-open');
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(() => {
        overlay.classList.add('is-hidden');
        modal.classList.add('is-hidden');
        modal.classList.remove('is-closing');
        modalContent.innerHTML = '';
      }, 220);
    }

    async function copyEmail(toast) {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(contactEmail);
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = contactEmail;
          textarea.setAttribute('readonly', '');
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.append(textarea);
          textarea.select();
          document.execCommand('copy');
          textarea.remove();
        }
        if (toast) {
          toast.textContent = '已复制邮箱';
          toast.classList.add('is-visible');
          window.clearTimeout(toastTimer);
          toastTimer = window.setTimeout(() => {
            toast.classList.remove('is-visible');
          }, 1500);
        }
      } catch {
        if (toast) {
          toast.textContent = '复制失败';
          toast.classList.add('is-visible');
          window.clearTimeout(toastTimer);
          toastTimer = window.setTimeout(() => {
            toast.classList.remove('is-visible');
            toast.textContent = '已复制邮箱';
          }, 1500);
        }
      }
    }

    modalButtons.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openContactModal(btn.dataset.contactModal);
      });
    });

    overlay.addEventListener('click', closeContactModal);
    closeBtn?.addEventListener('click', closeContactModal);

    modal.addEventListener('click', (event) => {
      const copyBtn = event.target.closest('.copy-email-btn');
      if (!copyBtn) return;
      copyEmail(modalContent.querySelector('.copy-email-toast'));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeContactModal();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactModal, { once: true });
  } else {
    initContactModal();
  }
})();
