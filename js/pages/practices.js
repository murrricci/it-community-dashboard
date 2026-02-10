// ==========================================================================
// Practices Page Controller
// ==========================================================================

import { loadAll, findPractice } from '../data-loader.js';
import { render, statusBadge, profBadge, progressBar, section, emptyState } from '../renderer.js';
import { formatDate, getHashParam, setHashParam, STATUS_LABELS, ADOPTION_LABELS } from '../utils.js';
import { openModal } from '../components/modal.js';

let state = { practices: [], professions: [], matrix: {}, deps: [], filter: 'all', category: 'all', view: 'grid' };

export async function initPractices() {
  const data = await loadAll(['practices.json', 'professions.json', 'adoption-matrix.json', 'practice-dependencies.json']);
  if (!data) return;

  state.practices = data.practices?.practices || [];
  state.professions = data.professions || [];
  state.matrix = data.adoptionMatrix?.matrix || {};
  state.deps = data.practiceDependencies || [];

  const categories = [...new Set(state.practices.map(p => p.category))];
  renderFilters(categories);
  renderViewToggle();
  renderContent();
  handleHash();
  window.addEventListener('hashchange', handleHash);
}

function handleHash() {
  const id = getHashParam();
  const p = state.practices.find(pr => pr.id === id);
  if (p) openPracticeModal(p);
}

// ── Filters ───────────────────────────────────────────────────────────────

function renderFilters(categories) {
  const statusChips = [['all', 'Все'], ['accepted', 'Принятые'], ['review', 'Ревью'], ['draft', 'Черновики']]
    .map(([v, l]) => `<button class="c-filter-chip ${state.filter === v ? 'is-active' : ''}" data-filter="${v}">${l}</button>`)
    .join('');

  const catChips = [['all', 'Все категории'], ...categories.map(c => [c, c])]
    .map(([v, l]) => `<button class="c-filter-chip ${state.category === v ? 'is-active' : ''}" data-category="${v}">${l}</button>`)
    .join('');

  render('#practices-filters', `
    <div class="c-filters">
      <div class="c-filters__group">${statusChips}</div>
      <div class="c-filters__group">${catChips}</div>
    </div>
  `);

  document.querySelectorAll('[data-filter]').forEach(btn =>
    btn.addEventListener('click', () => { state.filter = btn.dataset.filter; renderFilters(categories); renderContent(); }));
  document.querySelectorAll('[data-category]').forEach(btn =>
    btn.addEventListener('click', () => { state.category = btn.dataset.category; renderFilters(categories); renderContent(); }));
}

function renderViewToggle() {
  render('#practices-view-toggle', `
    <div class="c-view-toggle">
      <button class="c-filter-chip ${state.view === 'grid' ? 'is-active' : ''}" data-view="grid">Карточки</button>
      <button class="c-filter-chip ${state.view === 'matrix' ? 'is-active' : ''}" data-view="matrix">Матрица</button>
    </div>
  `);
  document.querySelectorAll('[data-view]').forEach(btn =>
    btn.addEventListener('click', () => { state.view = btn.dataset.view; renderViewToggle(); renderContent(); }));
}

// ── Content ───────────────────────────────────────────────────────────────

function renderContent() {
  const filtered = state.practices.filter(p =>
    (state.filter === 'all' || p.status === state.filter) &&
    (state.category === 'all' || p.category === state.category)
  );

  if (!filtered.length) { render('#practices-content', emptyState('📋', 'Практики не найдены')); return; }
  render('#practices-content', state.view === 'grid' ? renderGrid(filtered) : renderMatrix(filtered));
}

function renderGrid(practices) {
  const cards = practices.map(p => {
    const profBadges = (p.professions || []).map(id => profBadge(id, state.professions)).join(' ');
    const desc = p.description?.length > 120 ? p.description.slice(0, 120) + '...' : p.description;
    return `
      <div class="p-practice-card c-card" data-practice="${p.id}">
        <div class="p-practice-card__header">
          <span class="p-practice-card__name">${p.name}</span>
          ${statusBadge(p.status)}
        </div>
        <div class="p-practice-card__category">${p.category}</div>
        <div class="p-practice-card__desc">${desc}</div>
        ${progressBar(p.adoptionLevel || 0)}
        <div class="p-practice-card__badges">${profBadges}</div>
      </div>
    `;
  }).join('');

  setTimeout(() => document.querySelectorAll('[data-practice]').forEach(el =>
    el.addEventListener('click', () => { setHashParam(el.dataset.practice); openPracticeModal(state.practices.find(p => p.id === el.dataset.practice)); })
  ), 0);

  return `<div class="l-grid l-grid--auto-fill">${cards}</div>`;
}

// ── Matrix ────────────────────────────────────────────────────────────────

function renderMatrix(practices) {
  const profs = state.professions;
  const header = `<tr><th>Практика</th>${profs.map(pr => `<th>${pr.shortName}</th>`).join('')}</tr>`;
  const rows = practices.map(p => {
    const cells = profs.map(pr => {
      const val = state.matrix[p.id]?.[pr.id] || 'na';
      return `<td><span class="c-badge c-badge--${val}">${ADOPTION_LABELS[val] || '—'}</span></td>`;
    }).join('');
    return `<tr><td>${p.name}</td>${cells}</tr>`;
  }).join('');

  const legend = Object.entries(ADOPTION_LABELS)
    .map(([k, v]) => `<span class="c-badge c-badge--${k}">${v}</span>`).join(' ');

  return `
    <div class="c-matrix__legend">${legend}</div>
    <div class="c-matrix"><table>${header}${rows}</table></div>
  `;
}

// ── Modal ─────────────────────────────────────────────────────────────────

function openPracticeModal(p) {
  if (!p) return;
  const profBadges = (p.professions || []).map(id => profBadge(id, state.professions)).join(' ');
  const dep = state.deps.find(d => d.practice === p.id);
  const depsHtml = dep
    ? `<div class="p-practice-card__deps">
        ${dep.requires?.length ? `<div><strong>Требует:</strong> ${dep.requires.map(id => state.practices.find(x => x.id === id)?.name || id).join(', ')}</div>` : ''}
        ${dep.recommends?.length ? `<div><strong>Рекомендует:</strong> ${dep.recommends.map(id => state.practices.find(x => x.id === id)?.name || id).join(', ')}</div>` : ''}
      </div>` : '';

  const body = `
    <div style="margin-bottom:var(--space-3)">${statusBadge(p.status)} ${profBadges}</div>
    ${p.description ? `<p>${p.description}</p>` : ''}
    ${p.rationale ? `<h3>Обоснование</h3><p>${p.rationale}</p>` : ''}
    ${p.adoptionGuide ? `<h3>Гайд по внедрению</h3><p>${p.adoptionGuide}</p>` : ''}
    ${p.relatedRfc ? `<p><strong>Связанный RFC:</strong> <a href="rfc.html#${p.relatedRfc}">${p.relatedRfc}</a></p>` : ''}
    ${progressBar(p.adoptionLevel || 0)}
    ${depsHtml}
  `;
  openModal(p.name, body, { large: true });
}
