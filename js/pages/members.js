import { loadAll } from '../data-loader.js';
import { render, avatar, roleBadge, profBadge, section, emptyState } from '../renderer.js';
import { ROLE_LABELS } from '../utils.js';

export async function initMembers() {
  const data = await loadAll(['members.json', 'professions.json']);
  const members = data.members || [];
  const professions = data.professions || [];
  let filterProf = 'all', filterRole = 'all';

  function filtered() {
    return members.filter(m =>
      (filterProf === 'all' || m.professions.includes(filterProf)) &&
      (filterRole === 'all' || m.role === filterRole)
    );
  }

  function renderChips() {
    const profChips = [['all', 'Все'], ...professions.map(p => [p.id, p.shortName])]
      .map(([k, v]) => `<button class="c-filter-chip${filterProf === k ? ' is-active' : ''}" data-fp="${k}">${v}</button>`).join('');
    const roleChips = [['all', 'Все'], ...Object.entries(ROLE_LABELS)]
      .map(([k, v]) => `<button class="c-filter-chip${filterRole === k ? ' is-active' : ''}" data-fr="${k}">${v}</button>`).join('');
    return `<div class="c-filters">${profChips}</div><div class="c-filters u-mt-2">${roleChips}</div>`;
  }

  function renderLeaderboard() {
    const top5 = [...members].sort((a, b) => b.contributions - a.contributions).slice(0, 5);
    const rows = top5.map((m, i) => `
      <div class="p-members__leaderboard-item">
        <span class="p-members__leaderboard-rank${i < 3 ? ` p-members__leaderboard-rank--${i + 1}` : ''}">${i + 1}</span>
        ${avatar(m, 'sm')}
        <div class="p-members__leaderboard-info">
          <div class="p-members__leaderboard-name">${m.name}</div>
        </div>
        <span class="p-members__leaderboard-score">${m.contributions}</span>
      </div>
    `).join('');
    return `<div class="p-members__leaderboard"><div class="p-members__leaderboard-title">Лидерборд</div><div class="p-members__leaderboard-list">${rows}</div></div>`;
  }

  function renderGrid(list) {
    if (!list.length) return emptyState('👥', 'Участники не найдены');
    const cards = list.map(m => {
      const badges = (m.professions || []).map(id => profBadge(id, professions)).join(' ');
      return `<div class="c-member-card">
        ${avatar(m, 'lg')}
        <div class="c-member-card__name">${m.name}</div>
        <div class="c-member-card__meta">${roleBadge(m.role)} ${badges}</div>
        <div class="c-member-card__stats">${m.contributions} контрибуций</div>
      </div>`;
    }).join('');
    return `<div class="l-grid l-grid--auto-fill-sm">${cards}</div>`;
  }

  function draw() {
    render('#members-filters', renderChips());
    render('#members-leaderboard', renderLeaderboard());
    render('#members-grid', renderGrid(filtered()));
    document.querySelectorAll('[data-fp]').forEach(b => b.addEventListener('click', () => { filterProf = b.dataset.fp; draw(); }));
    document.querySelectorAll('[data-fr]').forEach(b => b.addEventListener('click', () => { filterRole = b.dataset.fr; draw(); }));
  }

  draw();
}
