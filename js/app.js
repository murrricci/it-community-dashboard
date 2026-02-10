import { preloadAll } from './data-loader.js';
import { initHeader } from './components/header.js';
import { initSidebar } from './components/sidebar.js';
import { initSearch } from './search.js';
import { initDashboard } from './pages/dashboard.js';
import { initProfessions } from './pages/professions.js';
import { initMembers } from './pages/members.js';
import { initChangelog } from './pages/changelog.js';
import { initGlossary } from './pages/glossary.js';
import { initPractices } from './pages/practices.js';
import { initRfc } from './pages/rfc.js';
import { initEvents } from './pages/events.js';
import { initOnboarding } from './pages/onboarding.js';

const ROUTES = {
  'index': initDashboard,
  'professions': initProfessions,
  'practices': initPractices,
  'members': initMembers,
  'changelog': initChangelog,
  'glossary': initGlossary,
  'rfc': initRfc,
  'events': initEvents,
  'onboarding': initOnboarding,
};

document.addEventListener('DOMContentLoaded', async () => {
  initHeader();
  initSidebar();
  initSearch();

  const path = window.location.pathname;
  const page = path.replace(/.*\//, '').replace('.html', '') || 'index';
  const init = ROUTES[page];

  preloadAll();
  if (init) await init();
});
