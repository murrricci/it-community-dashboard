// ==========================================================================
// Tabs Component
// ==========================================================================

/**
 * Initialize tabs behavior
 * @param {string} containerSelector - The tabs container selector
 * @param {Function} onTabChange - Callback when tab changes
 */
export function initTabs(containerSelector, onTabChange) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const tabs = container.querySelectorAll('.c-tabs__tab');
  const panels = container.parentElement?.querySelectorAll('.c-tabs__panel') || [];

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.tab;

      // Update active tab
      tabs.forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');

      // Update active panel
      panels.forEach(p => {
        p.classList.toggle('is-active', p.dataset.tabPanel === tabId);
      });

      if (onTabChange) onTabChange(tabId);
    });
  });
}
