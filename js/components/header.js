// ==========================================================================
// Header Component
// ==========================================================================

export function initHeader() {
  const burger = document.querySelector('.c-header__burger');
  const sidebar = document.querySelector('.l-sidebar');
  const overlay = document.querySelector('.l-overlay');

  if (burger && sidebar) {
    burger.addEventListener('click', () => {
      sidebar.classList.toggle('is-open');
      overlay?.classList.toggle('is-active');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar?.classList.remove('is-open');
      overlay.classList.remove('is-active');
    });
  }

  // Profession selector — store in localStorage
  const profSelect = document.querySelector('.c-header__prof-select');
  if (profSelect) {
    const saved = localStorage.getItem('selectedProfession');
    if (saved) profSelect.value = saved;

    profSelect.addEventListener('change', (e) => {
      localStorage.setItem('selectedProfession', e.target.value);
      window.dispatchEvent(new CustomEvent('profession-changed', { detail: e.target.value }));
    });
  }
}

export function getSelectedProfession() {
  return localStorage.getItem('selectedProfession') || 'all';
}
