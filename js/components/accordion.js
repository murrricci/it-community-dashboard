// ==========================================================================
// Accordion Component
// ==========================================================================

export function initAccordion(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const items = container.querySelectorAll('.c-accordion__item');
  items.forEach(item => {
    const trigger = item.querySelector('.c-accordion__trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        item.classList.toggle('is-open');
      });
    }
  });
}
