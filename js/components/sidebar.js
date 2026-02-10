// ==========================================================================
// Sidebar Component
// ==========================================================================

export function initSidebar() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('.c-sidebar__link');

  links.forEach(link => {
    const href = link.getAttribute('href');
    // Exact page match, ignore links with hash fragments
    const hrefPage = href.split('#')[0];
    const hasHash = href.includes('#');
    if (!hasHash && (hrefPage === currentPage || (currentPage === '' && hrefPage === 'index.html'))) {
      link.classList.add('is-active');
    }
  });
}
