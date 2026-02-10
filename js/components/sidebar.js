// ==========================================================================
// Sidebar Component
// ==========================================================================

export function initSidebar() {
  // Highlight current page in sidebar
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('.c-sidebar__link');

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('is-active');
    }
  });
}
