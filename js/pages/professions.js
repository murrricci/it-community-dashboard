// ==========================================================================
// Professions Page Controller
// ==========================================================================

import { loadAll, findMember } from '../data-loader.js';
import { render, avatar, roleBadge, profBadge, statusBadge, progressBar, section } from '../renderer.js';
import { formatDate, ROLE_LABELS, STATUS_LABELS, getHashParam, setHashParam } from '../utils.js';

// ── Constants ──────────────────────────────────────────────────────────────

const LEVEL_LABELS = {
  basic: 'Базовый',
  intermediate: 'Средний',
  advanced: 'Продвинутый'
};

const LEVEL_ORDER = { advanced: 0, intermediate: 1, basic: 2 };

const RESOURCE_TYPE_LABELS = {
  guide: 'Гайд',
  template: 'Шаблон',
  checklist: 'Чеклист',
  dashboard: 'Дашборд'
};

const ADOPTION_LABELS = {
  adopted: 'Внедрено',
  'in-progress': 'Внедряется',
  planned: 'Запланировано',
  na: '—'
};

// ── Module state ───────────────────────────────────────────────────────────

let state = {
  professions: [],
  members: [],
  practices: [],
  adoptionMatrix: null,
  selected: null
};

// ── Public entry point ─────────────────────────────────────────────────────

export async function initProfessions() {
  const data = await loadAll([
    'professions.json',
    'members.json',
    'practices.json',
    'adoption-matrix.json'
  ]);
  if (!data) return;

  state.professions = data.professions || [];
  state.members = data.members || [];
  state.practices = data.practices?.practices || [];
  state.adoptionMatrix = data.adoptionMatrix?.matrix || {};

  renderGrid();
  handleHashNavigation();

  window.addEventListener('hashchange', handleHashNavigation);
}

// ── Hash navigation ────────────────────────────────────────────────────────

function handleHashNavigation() {
  const hash = getHashParam();
  const prof = state.professions.find(p => p.id === hash);

  if (prof) {
    selectProfession(prof.id);
  } else {
    clearDetail();
  }
}

// ── Grid rendering ─────────────────────────────────────────────────────────

function renderGrid() {
  const html = state.professions.map(prof => {
    const memberCount = countMembers(prof);
    const practiceCount = prof.practices?.length || 0;
    const isActive = state.selected === prof.id;

    return `
      <div class="c-prof-card ${isActive ? 'is-active' : ''}" data-prof-id="${prof.id}">
        <div class="c-prof-card__icon" style="background:var(--color-prof-${prof.color}-bg); color:var(--color-prof-${prof.color})">
          ${prof.icon}
        </div>
        <div class="c-prof-card__name">${prof.shortName}</div>
        <div class="c-prof-card__count">${memberCount} участн. · ${practiceCount} практик</div>
      </div>
    `;
  }).join('');

  render('#professions-grid', `<div class="p-professions__grid">${html}</div>`);
  bindCardClicks();
}

function bindCardClicks() {
  const cards = document.querySelectorAll('.c-prof-card[data-prof-id]');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const profId = card.dataset.profId;
      setHashParam(profId);
    });
  });
}

// ── Selection ──────────────────────────────────────────────────────────────

function selectProfession(profId) {
  state.selected = profId;
  updateActiveCard();
  renderDetail(profId);
}

function clearDetail() {
  state.selected = null;
  updateActiveCard();
  render('#profession-detail', '');
}

function updateActiveCard() {
  document.querySelectorAll('.c-prof-card').forEach(card => {
    card.classList.toggle('is-active', card.dataset.profId === state.selected);
  });
}

// ── Detail rendering ───────────────────────────────────────────────────────

function renderDetail(profId) {
  const prof = state.professions.find(p => p.id === profId);
  if (!prof) return;

  const html = `
    <div class="p-professions__detail">
      <div class="p-professions__detail-main">
        ${renderDetailHeader(prof)}
        ${renderDescription(prof)}
        ${renderCompetencies(prof)}
        ${renderPractices(prof)}
      </div>
      <div class="p-professions__detail-sidebar">
        ${renderTeam(prof)}
        ${renderResources(prof)}
        ${renderMeta(prof)}
      </div>
    </div>
  `;

  render('#profession-detail', html);
}

// ── Detail: header ─────────────────────────────────────────────────────────

function renderDetailHeader(prof) {
  const lead = findMember(state.members, prof.lead);
  return `
    <div class="p-professions__section">
      <div style="display:flex; align-items:center; gap:var(--space-4)">
        <div class="c-prof-card__icon" style="background:var(--color-prof-${prof.color}-bg); color:var(--color-prof-${prof.color})">
          ${prof.icon}
        </div>
        <div>
          <h2 style="margin:0; font-size:var(--font-size-xl)">${prof.name}</h2>
          <div style="font-size:var(--font-size-sm); color:var(--color-text-secondary); margin-top:var(--space-1)">
            Лид: ${avatar(lead, 'sm')} ${lead?.name || 'Не назначен'}
            · Версия ${prof.version}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── Detail: description ────────────────────────────────────────────────────

function renderDescription(prof) {
  return `
    <div class="p-professions__section">
      <div class="p-professions__section-title">Описание</div>
      <p style="margin:0; font-size:var(--font-size-sm); color:var(--color-text-secondary); line-height:var(--line-height-relaxed)">
        ${prof.description}
      </p>
    </div>
  `;
}

// ── Detail: competencies ───────────────────────────────────────────────────

function renderCompetencies(prof) {
  if (!prof.competencies?.length) return '';

  const sorted = [...prof.competencies].sort(
    (a, b) => (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99)
  );

  const items = sorted.map(comp => `
    <div class="p-professions__competency">
      <span>${comp.name}</span>
      <span class="c-badge c-badge--${comp.level}">${LEVEL_LABELS[comp.level] || comp.level}</span>
    </div>
  `).join('');

  return `
    <div class="p-professions__section">
      <div class="p-professions__section-title">Компетенции</div>
      <div class="p-professions__competencies">${items}</div>
    </div>
  `;
}

// ── Detail: practices ──────────────────────────────────────────────────────

function renderPractices(prof) {
  if (!prof.practices?.length) return '';

  const items = prof.practices.map(practiceId => {
    const practice = state.practices.find(p => p.id === practiceId);
    if (!practice) return '';

    const adoption = state.adoptionMatrix[practiceId]?.[prof.id];
    const adoptionLabel = ADOPTION_LABELS[adoption] || '—';
    const adoptionLevel = practice.adoptionLevel ?? 0;

    return `
      <div class="p-professions__section" style="padding:var(--space-4)">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-2)">
          <div style="display:flex; align-items:center; gap:var(--space-2)">
            <span style="font-size:var(--font-size-sm); font-weight:var(--font-weight-medium)">${practice.name}</span>
            ${statusBadge(practice.status)}
          </div>
          <span class="c-badge c-badge--${adoption || 'na'}">${adoptionLabel}</span>
        </div>
        ${progressBar(adoptionLevel)}
        <div style="font-size:var(--font-size-xs); color:var(--color-text-tertiary); margin-top:var(--space-2)">
          ${practice.description}
        </div>
      </div>
    `;
  }).filter(Boolean).join('');

  return section('Принятые практики', items);
}

// ── Detail: team ───────────────────────────────────────────────────────────

function renderTeam(prof) {
  const groups = [
    { key: 'lead', ids: [prof.lead], label: 'Лид' },
    { key: 'experts', ids: prof.experts || [], label: 'Эксперты' },
    { key: 'contributors', ids: prof.contributors || [], label: 'Контрибьюторы' }
  ];

  const teamHtml = groups.map(group => {
    if (!group.ids.length) return '';

    const membersHtml = group.ids.map(memberId => {
      const member = findMember(state.members, memberId);
      if (!member) return '';

      return `
        <div class="p-professions__team-member">
          ${avatar(member, 'md')}
          <div class="p-professions__team-member-info">
            <div class="p-professions__team-member-name">${member.name}</div>
            <div class="p-professions__team-member-role">
              ${roleBadge(member.role)}
              · ${member.contributions} контрибуций
            </div>
          </div>
        </div>
      `;
    }).filter(Boolean).join('');

    if (!membersHtml) return '';

    return `
      <div style="margin-bottom:var(--space-3)">
        <div style="font-size:var(--font-size-xs); color:var(--color-text-tertiary); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:var(--space-2)">
          ${group.label}
        </div>
        ${membersHtml}
      </div>
    `;
  }).filter(Boolean).join('');

  return `
    <div class="p-professions__section">
      <div class="p-professions__section-title">Команда</div>
      <div class="p-professions__team">${teamHtml}</div>
    </div>
  `;
}

// ── Detail: resources ──────────────────────────────────────────────────────

function renderResources(prof) {
  if (!prof.resources?.length) return '';

  const items = prof.resources.map(res => {
    const typeLabel = RESOURCE_TYPE_LABELS[res.type] || res.type;
    return `
      <a href="${res.url}" class="p-professions__team-member" style="text-decoration:none; color:inherit">
        <span style="font-size:var(--font-size-lg)">📄</span>
        <div class="p-professions__team-member-info">
          <div class="p-professions__team-member-name">${res.title}</div>
          <div class="p-professions__team-member-role">
            <span class="c-badge c-badge--sm">${typeLabel}</span>
          </div>
        </div>
      </a>
    `;
  }).join('');

  return `
    <div class="p-professions__section">
      <div class="p-professions__section-title">Ресурсы</div>
      <div class="p-professions__team">${items}</div>
    </div>
  `;
}

// ── Detail: meta ───────────────────────────────────────────────────────────

function renderMeta(prof) {
  return `
    <div class="p-professions__section" style="font-size:var(--font-size-xs); color:var(--color-text-tertiary)">
      <div style="display:flex; justify-content:space-between; margin-bottom:var(--space-2)">
        <span>Последнее обновление</span>
        <span>${formatDate(prof.lastUpdated)}</span>
      </div>
      <div style="display:flex; justify-content:space-between">
        <span>Версия</span>
        <span>${prof.version}</span>
      </div>
    </div>
  `;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function countMembers(prof) {
  const ids = new Set();
  if (prof.lead) ids.add(prof.lead);
  (prof.experts || []).forEach(id => ids.add(id));
  (prof.contributors || []).forEach(id => ids.add(id));
  return ids.size;
}
