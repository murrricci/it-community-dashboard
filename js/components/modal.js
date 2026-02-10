// ==========================================================================
// Modal Component
// ==========================================================================

import { render } from '../renderer.js';

/**
 * Open a modal with given content
 */
export function openModal(title, bodyHtml, options = {}) {
  const sizeClass = options.large ? 'c-modal--lg' : '';
  const backdrop = document.getElementById('detail-modal');
  if (!backdrop) return;

  backdrop.innerHTML = `
    <div class="c-modal ${sizeClass}">
      <div class="c-modal__header">
        <h2 class="c-modal__title">${title}</h2>
        <button class="c-modal__close" aria-label="Закрыть">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
          </svg>
        </button>
      </div>
      <div class="c-modal__body">
        ${bodyHtml}
      </div>
    </div>
  `;

  backdrop.classList.add('is-active');
  document.body.style.overflow = 'hidden';

  // Close handlers
  backdrop.querySelector('.c-modal__close').addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });
  document.addEventListener('keydown', handleEscape);
}

export function closeModal() {
  const backdrop = document.getElementById('detail-modal');
  if (backdrop) {
    backdrop.classList.remove('is-active');
    document.body.style.overflow = '';
  }
  document.removeEventListener('keydown', handleEscape);
}

function handleEscape(e) {
  if (e.key === 'Escape') closeModal();
}
