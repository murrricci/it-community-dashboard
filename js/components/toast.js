// ==========================================================================
// Toast Component
// ==========================================================================

/**
 * Show a toast notification
 */
export function showToast(message, type = 'info', duration = 3000) {
  let container = document.querySelector('.c-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'c-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `c-toast c-toast--${type}`;
  toast.innerHTML = `
    <span class="c-toast__text">${message}</span>
    <button class="c-toast__close" aria-label="Закрыть">×</button>
  `;

  container.appendChild(toast);

  toast.querySelector('.c-toast__close').addEventListener('click', () => removeToast(toast));

  setTimeout(() => removeToast(toast), duration);
}

function removeToast(toast) {
  toast.classList.add('is-leaving');
  setTimeout(() => toast.remove(), 200);
}
