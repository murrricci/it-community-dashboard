import { loadAll, findMember } from '../data-loader.js';
import { render, profBadge, emptyState } from '../renderer.js';
import { formatDate, groupBy, CHANGELOG_TYPE_LABELS } from '../utils.js';
import { showToast } from '../components/toast.js';

export async function initChangelog() {
  const data = await loadAll(['changelog.json', 'professions.json', 'members.json']);
  const changelog = data.changelog || [];
  const professions = data.professions || [];
  const members = data.members || [];
  let filterProf = 'all', filterType = 'all';

  function filtered() {
    return changelog
      .filter(e => (filterProf === 'all' || e.profession === filterProf) && (filterType === 'all' || e.type === filterType))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function renderFilters() {
    const profChips = [['all', 'Все'], ...professions.map(p => [p.id, p.shortName])]
      .map(([k, v]) => `<button class="c-filter-chip${filterProf === k ? ' is-active' : ''}" data-fp="${k}">${v}</button>`).join('');
    const typeChips = [['all', 'Все'], ...Object.entries(CHANGELOG_TYPE_LABELS)]
      .map(([k, v]) => `<button class="c-filter-chip${filterType === k ? ' is-active' : ''}" data-ft="${k}">${v}</button>`).join('');
    return `<div class="c-filters">${profChips}</div><div class="c-filters u-mt-2">${typeChips}</div>`;
  }

  function renderTimeline(entries) {
    if (!entries.length) return emptyState('📜', 'Записей не найдено');
    const groups = groupBy(entries, 'date');
    return `<div class="c-timeline">${Object.entries(groups).map(([date, items]) => `
      <div class="c-timeline__group">
        <div class="c-timeline__date">${formatDate(date)}</div>
        ${items.map(e => {
          const author = findMember(members, e.author);
          return `<div class="c-timeline__item">
            <div class="c-timeline__item-header">
              <span class="p-changelog__type p-changelog__type--${e.type}">${CHANGELOG_TYPE_LABELS[e.type] || e.type}</span>
              ${e.profession ? profBadge(e.profession, professions) : ''}
            </div>
            <div class="c-timeline__item-title">${e.description}</div>
            <div class="c-timeline__item-meta">
              ${author?.name || ''} ${e.version ? `· <span class="p-changelog__version">v${e.version}</span>` : ''}
              ${e.relatedRfc ? `· <a href="rfc.html#${e.relatedRfc}">${e.relatedRfc}</a>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>
    `).join('')}</div>`;
  }

  function toMarkdown(entries) {
    const groups = groupBy(entries, 'date');
    return Object.entries(groups).map(([date, items]) =>
      `## ${formatDate(date)}\n\n` + items.map(e =>
        `- **[${(CHANGELOG_TYPE_LABELS[e.type] || e.type).toUpperCase()}]** ${e.description}${e.version ? ` (v${e.version})` : ''}`
      ).join('\n')
    ).join('\n\n');
  }

  function draw() {
    render('#changelog-filters', renderFilters());
    render('#changelog-timeline', renderTimeline(filtered()));

    const exportBtn = document.getElementById('changelog-export');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(toMarkdown(filtered())).then(() => showToast('Скопировано в Markdown!', 'success'));
      });
    }
    document.querySelectorAll('[data-fp]').forEach(b => b.addEventListener('click', () => { filterProf = b.dataset.fp; draw(); }));
    document.querySelectorAll('[data-ft]').forEach(b => b.addEventListener('click', () => { filterType = b.dataset.ft; draw(); }));
  }

  draw();
}
