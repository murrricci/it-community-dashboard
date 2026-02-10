// ==========================================================================
// Dashboard Page Controller
// ==========================================================================

import { preloadAll, findMember } from '../data-loader.js';
import { render, metricCard, contentCard, statusBadge, profBadge, avatar, statusColor, section } from '../renderer.js';
import { formatDate, formatShortDate, isFuture, EVENT_TYPE_LABELS, CHANGELOG_TYPE_LABELS } from '../utils.js';

export async function initDashboard() {
  const data = await preloadAll();
  if (!data) return;

  renderMetrics(data);
  renderRecentRfcs(data);
  renderUpcomingEvents(data);
  renderRecentChanges(data);
  renderAnnouncements(data);
  renderQuickLinks(data);
  renderTopContributors(data);
}

function renderMetrics(data) {
  const practices = data.practices?.practices || [];
  const rfcs = data.rfcs || [];
  const events = data.events || [];
  const members = data.members || [];

  const acceptedPractices = practices.filter(p => p.status === 'accepted').length;
  const activeRfcs = rfcs.filter(r => r.status === 'draft' || r.status === 'review').length;
  const upcomingEvents = events.filter(e => isFuture(e.date)).length;

  const html = [
    metricCard({ label: 'Принятых практик', value: acceptedPractices, icon: '✅', trend: { direction: 'up', text: `из ${practices.length} всего` } }),
    metricCard({ label: 'Активных RFC', value: activeRfcs, icon: '📝', trend: { direction: 'up', text: `${rfcs.filter(r => r.status === 'review').length} на ревью` } }),
    metricCard({ label: 'Ближайших событий', value: upcomingEvents, icon: '📅' }),
    metricCard({ label: 'Участников', value: members.length, icon: '👥', trend: { direction: 'up', text: `${members.filter(m => m.role === 'lead').length} лидов` } })
  ].join('');

  render('#dashboard-metrics', html);
}

function renderRecentRfcs(data) {
  const rfcs = (data.rfcs || []).slice(0, 5);
  const members = data.members || [];
  const professions = data.professions || [];

  const html = rfcs.map(rfc => {
    const author = findMember(members, rfc.author);
    return contentCard({
      accentColor: statusColor(rfc.status),
      title: `<span class="u-text-mono u-text-secondary">RFC-${String(rfc.number).padStart(3, '0')}</span> ${rfc.title}`,
      badges: statusBadge(rfc.status),
      meta: `${avatar(author, 'sm')} ${author?.name || 'Неизвестен'} · ${formatDate(rfc.createdAt, { month: 'short', year: undefined })}`,
      onClick: `rfc-${rfc.id}`
    });
  }).join('');

  render('#dashboard-rfcs', section('Последние RFC', html, 'rfc.html', 'Все RFC'));
}

function renderUpcomingEvents(data) {
  const events = (data.events || [])
    .filter(e => isFuture(e.date))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4);

  const professions = data.professions || [];
  const members = data.members || [];

  const html = events.map(evt => {
    const date = new Date(evt.date);
    const monthName = date.toLocaleDateString('ru-RU', { month: 'short' });
    const speaker = findMember(members, evt.speaker);

    return `
      <div class="c-event-card">
        <div class="c-event-card__date-box">
          <span class="c-event-card__date-month">${monthName}</span>
          <span class="c-event-card__date-day">${date.getDate()}</span>
        </div>
        <div class="c-event-card__content">
          <div class="c-event-card__title">${evt.title}</div>
          <div class="c-event-card__meta">
            <span class="c-badge c-badge--${evt.type}">${EVENT_TYPE_LABELS[evt.type] || evt.type}</span>
            ${evt.profession ? profBadge(evt.profession, professions) : ''}
            <span>${evt.time} · ${evt.duration}</span>
          </div>
          <div class="c-event-card__desc">${evt.description}</div>
        </div>
      </div>
    `;
  }).join('');

  render('#dashboard-events', section('Ближайшие события', `<div class="c-event-list">${html}</div>`, 'events.html', 'Все события'));
}

function renderRecentChanges(data) {
  const changes = (data.changelog || []).slice(0, 5);
  const professions = data.professions || [];
  const members = data.members || [];

  const html = changes.map(ch => {
    const author = findMember(members, ch.author);
    const typeLabel = CHANGELOG_TYPE_LABELS[ch.type] || ch.type;
    const typeClass = `p-changelog__type--${ch.type}`;

    return contentCard({
      accentColor: ch.type === 'added' ? 'var(--color-status-accepted)' :
                   ch.type === 'changed' ? 'var(--color-status-review)' :
                   ch.type === 'deprecated' ? 'var(--color-status-draft)' :
                   'var(--color-status-rejected)',
      title: ch.description,
      badges: `<span class="p-changelog__type ${typeClass}">${typeLabel}</span>`,
      meta: `${profBadge(ch.profession, professions)} · ${author?.name || ''} · ${formatShortDate(ch.date)}`
    });
  }).join('');

  render('#dashboard-changes', section('Последние изменения', html, 'changelog.html', 'Вся история'));
}

function renderAnnouncements(data) {
  const announcements = data.announcements || [];
  if (announcements.length === 0) return;

  const html = announcements.map(ann => `
    <a href="${ann.link}" class="c-announcement">
      <div class="c-announcement__date">${formatDate(ann.date, { month: 'short', year: undefined })}</div>
      <div class="c-announcement__title">${ann.title}</div>
      <div class="c-announcement__text">${ann.text}</div>
    </a>
  `).join('');

  render('#dashboard-announcements', `<div id="announcements">${section('Объявления', html)}</div>`);
}

function renderQuickLinks(data) {
  const professions = data.professions || [];

  const html = professions.map(prof => `
    <a href="professions.html#${prof.id}" class="p-dashboard__quick-link">
      <div class="p-dashboard__quick-link-icon" style="background:var(--color-prof-${prof.color}-bg); color:var(--color-prof-${prof.color})">
        ${prof.icon}
      </div>
      <div>
        <div class="p-dashboard__quick-link-text">${prof.shortName}</div>
        <div class="p-dashboard__quick-link-sub">${prof.name}</div>
      </div>
    </a>
  `).join('');

  render('#dashboard-quicklinks', section('Сообщества', `<div class="p-dashboard__quick-links">${html}</div>`));
}

function renderTopContributors(data) {
  const members = (data.members || [])
    .sort((a, b) => b.contributions - a.contributions)
    .slice(0, 5);

  const html = members.map(m => `
    <div class="p-dashboard__contributor">
      ${avatar(m, 'md')}
      <div class="p-dashboard__contributor-info">
        <div class="p-dashboard__contributor-name">${m.name}</div>
        <div class="p-dashboard__contributor-count">${m.contributions} контрибуций</div>
      </div>
    </div>
  `).join('');

  render('#dashboard-contributors', section('Активные контрибьюторы', `<div class="p-dashboard__contributors">${html}</div>`));
}
