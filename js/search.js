// ==========================================================================
// Global Search
// ==========================================================================

import { getCached } from './data-loader.js';
import { matchesSearch, STATUS_LABELS, EVENT_TYPE_LABELS } from './utils.js';
import { render } from './renderer.js';

let isOpen = false;
let highlightedIndex = -1;
let results = [];

export function initSearch() {
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      toggleSearch();
    }
    if (e.key === 'Escape' && isOpen) {
      closeSearch();
    }
  });

  const trigger = document.querySelector('[data-search-trigger]');
  if (trigger) {
    trigger.addEventListener('click', () => toggleSearch());
  }
}

function toggleSearch() {
  isOpen ? closeSearch() : openSearch();
}

function openSearch() {
  isOpen = true;
  const backdrop = document.getElementById('search-modal');
  if (!backdrop) return;
  backdrop.classList.add('is-active');
  const input = backdrop.querySelector('.c-search-modal__input');
  if (input) {
    input.value = '';
    input.focus();
  }
  renderResults('');
  backdrop.addEventListener('click', handleBackdropClick);
  const inputEl = backdrop.querySelector('.c-search-modal__input');
  inputEl?.addEventListener('input', handleSearchInput);
  inputEl?.addEventListener('keydown', handleSearchKeydown);
}

function closeSearch() {
  isOpen = false;
  const backdrop = document.getElementById('search-modal');
  if (!backdrop) return;
  backdrop.classList.remove('is-active');
  highlightedIndex = -1;
}

function handleBackdropClick(e) {
  if (e.target.id === 'search-modal') closeSearch();
}

function handleSearchInput(e) {
  renderResults(e.target.value);
}

function handleSearchKeydown(e) {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    highlightedIndex = Math.min(highlightedIndex + 1, results.length - 1);
    updateHighlight();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    highlightedIndex = Math.max(highlightedIndex - 1, 0);
    updateHighlight();
  } else if (e.key === 'Enter' && highlightedIndex >= 0) {
    e.preventDefault();
    const item = results[highlightedIndex];
    if (item?.link) {
      window.location.href = item.link;
      closeSearch();
    }
  }
}

function updateHighlight() {
  const items = document.querySelectorAll('.c-search-results__item');
  items.forEach((el, i) => {
    el.classList.toggle('is-highlighted', i === highlightedIndex);
  });
}

function renderResults(query) {
  results = [];
  highlightedIndex = -1;

  if (!query || query.length < 2) {
    render('#search-results', `
      <div class="c-search-results__empty">Введите минимум 2 символа для поиска</div>
    `);
    return;
  }

  const practices = getCached('practices.json');
  const rfcs = getCached('rfcs.json');
  const members = getCached('members.json');
  const events = getCached('events.json');
  const glossary = getCached('glossary.json');

  // Search practices
  if (practices?.practices) {
    practices.practices
      .filter(p => matchesSearch(p, query, ['name', 'description', 'category']))
      .forEach(p => results.push({
        group: 'Практики',
        title: p.name,
        subtitle: `${STATUS_LABELS[p.status]} · ${p.category}`,
        icon: '📋',
        link: `practices.html#${p.id}`
      }));
  }

  // Search RFCs
  if (rfcs) {
    rfcs
      .filter(r => matchesSearch(r, query, ['title', 'description']))
      .forEach(r => results.push({
        group: 'RFC',
        title: `RFC-${String(r.number).padStart(3, '0')}: ${r.title}`,
        subtitle: STATUS_LABELS[r.status],
        icon: '📝',
        link: `rfc.html#${r.id}`
      }));
  }

  // Search members
  if (members) {
    members
      .filter(m => matchesSearch(m, query, ['name', 'bio']))
      .forEach(m => results.push({
        group: 'Участники',
        title: m.name,
        subtitle: m.bio,
        icon: '👤',
        link: `members.html#${m.id}`
      }));
  }

  // Search events
  if (events) {
    events
      .filter(e => matchesSearch(e, query, ['title', 'description']))
      .forEach(e => results.push({
        group: 'События',
        title: e.title,
        subtitle: `${EVENT_TYPE_LABELS[e.type] || e.type} · ${e.date}`,
        icon: '📅',
        link: `events.html#${e.id}`
      }));
  }

  // Search glossary
  if (glossary) {
    glossary
      .filter(g => matchesSearch(g, query, ['term', 'definition']))
      .forEach(g => results.push({
        group: 'Глоссарий',
        title: g.term,
        subtitle: g.definition.slice(0, 80) + '...',
        icon: '📖',
        link: `glossary.html#${g.id}`
      }));
  }

  if (results.length === 0) {
    render('#search-results', `
      <div class="c-search-results__empty">Ничего не найдено по запросу «${query}»</div>
    `);
    return;
  }

  // Group results
  const grouped = {};
  results.forEach(r => {
    if (!grouped[r.group]) grouped[r.group] = [];
    grouped[r.group].push(r);
  });

  let html = '';
  let idx = 0;
  for (const [group, items] of Object.entries(grouped)) {
    html += `<div class="c-search-results__group-title">${group}</div>`;
    for (const item of items) {
      html += `
        <a href="${item.link}" class="c-search-results__item" data-index="${idx}">
          <span class="c-search-results__item-icon">${item.icon}</span>
          <div class="c-search-results__item-text">
            <div class="c-search-results__item-title">${item.title}</div>
            <div class="c-search-results__item-subtitle">${item.subtitle}</div>
          </div>
        </a>
      `;
      idx++;
    }
  }

  render('#search-results', html);

  // Add click handlers
  document.querySelectorAll('.c-search-results__item').forEach(el => {
    el.addEventListener('click', () => closeSearch());
  });
}
