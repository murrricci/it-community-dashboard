// ==========================================================================
// RFC Page Controller
// ==========================================================================

import { loadAll, findMember } from '../data-loader.js';
import { render, statusBadge, profBadge, avatar, statusColor, emptyState } from '../renderer.js';
import { formatDate, getHashParam, setHashParam, STATUS_LABELS } from '../utils.js';
import { openModal } from '../components/modal.js';

let state = { rfcs: [], members: [], professions: [], filter: 'all' };

export async function initRfc() {
  const data = await loadAll(['rfcs.json', 'members.json', 'professions.json']);
  if (!data) return;

  state.rfcs = data.rfcs || [];
  state.members = data.members || [];
  state.professions = data.professions || [];

  renderFilters();
  renderList();
  renderTemplate();
  handleHash();
  window.addEventListener('hashchange', handleHash);
}

function handleHash() {
  const hash = getHashParam();
  if (!hash) return;
  const rfc = state.rfcs.find(r => `rfc-${String(r.number).padStart(3, '0')}` === hash || r.id === hash);
  if (rfc) openRfcModal(rfc);
}

function rfcLabel(rfc) { return `RFC-${String(rfc.number).padStart(3, '0')}`; }

// ── Filters ───────────────────────────────────────────────────────────────

function renderFilters() {
  const chips = [['all', 'Все'], ['draft', 'Черновики'], ['review', 'Ревью'], ['accepted', 'Принятые'], ['rejected', 'Отклонённые']]
    .map(([v, l]) => `<button class="c-filter-chip ${state.filter === v ? 'is-active' : ''}" data-filter="${v}">${l}</button>`)
    .join('');

  render('#rfc-filters', `<div class="c-filters"><div class="c-filters__group">${chips}</div></div>`);
  document.querySelectorAll('#rfc-filters [data-filter]').forEach(btn =>
    btn.addEventListener('click', () => { state.filter = btn.dataset.filter; renderFilters(); renderList(); }));
}

// ── List ──────────────────────────────────────────────────────────────────

function renderList() {
  const filtered = state.rfcs.filter(r => state.filter === 'all' || r.status === state.filter);
  if (!filtered.length) { render('#rfc-list', emptyState('📝', 'RFC не найдены')); return; }

  const items = filtered.map(rfc => {
    const author = findMember(state.members, rfc.author);
    const profBadges = (rfc.professions || []).map(id => profBadge(id, state.professions)).join(' ');
    const hashId = `rfc-${String(rfc.number).padStart(3, '0')}`;

    return `
      <div class="p-rfc-item c-card" data-rfc="${rfc.id}" data-hash="${hashId}">
        <div class="p-rfc-item__accent" style="background:${statusColor(rfc.status)}"></div>
        <div class="p-rfc-item__body">
          <div class="p-rfc-item__header">
            <span class="u-text-mono u-text-secondary">${rfcLabel(rfc)}</span>
            <span class="p-rfc-item__title">${rfc.title}</span>
            ${statusBadge(rfc.status)}
          </div>
          <div class="p-rfc-item__meta">
            ${avatar(author, 'sm')} ${author?.name || 'Неизвестен'}
            · ${formatDate(rfc.createdAt, { month: 'short', year: undefined })}
            ${profBadges}
          </div>
        </div>
      </div>
    `;
  }).join('');

  render('#rfc-list', items);
  document.querySelectorAll('[data-rfc]').forEach(el =>
    el.addEventListener('click', () => {
      setHashParam(el.dataset.hash);
      openRfcModal(state.rfcs.find(r => r.id === el.dataset.rfc));
    }));
}

// ── Modal ─────────────────────────────────────────────────────────────────

function openRfcModal(rfc) {
  if (!rfc) return;
  const author = findMember(state.members, rfc.author);
  const profBadges = (rfc.professions || []).map(id => profBadge(id, state.professions)).join(' ');

  // Status timeline
  const timeline = (rfc.statusHistory || []).map((entry, i, arr) => `
    <div class="c-status-timeline__item ${i === arr.length - 1 ? 'is-current' : ''}">
      <div class="c-status-timeline__dot" style="background:${statusColor(entry.status)}"></div>
      ${i < arr.length - 1 ? '<div class="c-status-timeline__line"></div>' : ''}
      <div class="c-status-timeline__content">
        ${statusBadge(entry.status)} <span class="u-text-secondary">${formatDate(entry.date, { month: 'short', year: undefined })}</span>
        ${entry.comment ? `<div class="u-text-secondary" style="font-size:var(--font-size-xs)">${entry.comment}</div>` : ''}
      </div>
    </div>
  `).join('');

  // Voting
  const v = rfc.voting;
  const votingHtml = v ? `
    <h3>Голосование</h3>
    <div class="p-rfc-voting">
      <span class="c-badge c-badge--accepted">За: ${v.for ?? 0}</span>
      <span class="c-badge c-badge--rejected">Против: ${v.against ?? 0}</span>
      <span class="c-badge">Воздержались: ${v.abstain ?? 0}</span>
    </div>
  ` : '';

  // Discussions
  const discussions = (rfc.discussions || []).map(d => `
    <div class="p-rfc-detail__question">${typeof d === 'string' ? d : (d.question || d.title || '')}</div>
  `).join('');

  const body = `
    <div style="margin-bottom:var(--space-3)">
      ${statusBadge(rfc.status)} ${profBadges}
      <div style="margin-top:var(--space-2)">${avatar(author, 'sm')} ${author?.name || 'Неизвестен'} · ${formatDate(rfc.createdAt)}</div>
    </div>
    ${rfc.description ? `<p class="u-text-secondary">${rfc.description}</p>` : ''}
    ${rfc.body ? `<div class="p-rfc-body">${rfc.body}</div>` : ''}
    ${timeline ? `<h3>История статуса</h3><div class="c-status-timeline">${timeline}</div>` : ''}
    ${votingHtml}
    ${discussions ? `<h3>Обсуждение</h3>${discussions}` : ''}
    ${rfc.relatedPractice ? `<p><strong>Связанная практика:</strong> <a href="practices.html#${rfc.relatedPractice}">${rfc.relatedPractice}</a></p>` : ''}
  `;
  openModal(`${rfcLabel(rfc)} — ${rfc.title}`, body, { large: true });
}

// ── Template ──────────────────────────────────────────────────────────────

function renderTemplate() {
  const tpl = `# RFC-XXX: Название\n\n## Описание\n...\n\n## Обоснование\n...\n\n## Детали реализации\n...\n\n## Альтернативы\n...\n\n## Влияние\n...`;

  render('#rfc-template', `
    <div class="p-rfc-template c-card">
      <div class="p-rfc-template__header">
        <h3>Шаблон RFC</h3>
        <button class="c-filter-chip" id="copy-rfc-tpl">Копировать</button>
      </div>
      <pre class="p-rfc-template__body">${tpl}</pre>
    </div>
  `);
  document.getElementById('copy-rfc-tpl')?.addEventListener('click', () => {
    navigator.clipboard.writeText(tpl).then(() => {
      const btn = document.getElementById('copy-rfc-tpl');
      btn.textContent = 'Скопировано!';
      setTimeout(() => btn.textContent = 'Копировать', 2000);
    });
  });
}
