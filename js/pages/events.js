// ==========================================================================
// Events Page Controller
// ==========================================================================

import { loadAll, findMember } from '../data-loader.js';
import { render, eventTypeBadge, profBadge, avatar, emptyState } from '../renderer.js';
import { formatDate, isFuture, getMonthName, getWeekdayNames, isToday, EVENT_TYPE_LABELS } from '../utils.js';
import { openModal } from '../components/modal.js';

let state = { events: [], members: [], professions: [], view: 'list', typeFilter: 'all', timeFilter: 'upcoming', calMonth: new Date().getMonth(), calYear: new Date().getFullYear() };

export async function initEvents() {
  const data = await loadAll(['events.json', 'members.json', 'professions.json']);
  if (!data) return;

  state.events = data.events || [];
  state.members = data.members || [];
  state.professions = data.professions || [];

  renderControls();
  renderContent();
}

// ── Controls ──────────────────────────────────────────────────────────────

function renderControls() {
  const viewBtns = [['list', 'Список'], ['calendar', 'Календарь']]
    .map(([v, l]) => `<button class="c-filter-chip ${state.view === v ? 'is-active' : ''}" data-view="${v}">${l}</button>`).join('');

  const typeChips = [['all', 'Все'], ...Object.entries(EVENT_TYPE_LABELS)]
    .map(([v, l]) => `<button class="c-filter-chip ${state.typeFilter === v ? 'is-active' : ''}" data-type="${v}">${l}</button>`).join('');

  const timeChips = [['upcoming', 'Предстоящие'], ['past', 'Прошедшие']]
    .map(([v, l]) => `<button class="c-filter-chip ${state.timeFilter === v ? 'is-active' : ''}" data-time="${v}">${l}</button>`).join('');

  render('#events-toolbar', `
    <div class="c-filters">
      <div class="c-view-toggle">${viewBtns}</div>
      <div class="c-filters__group">${typeChips}</div>
      <div class="c-filters__group">${timeChips}</div>
    </div>
  `);

  document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => { state.view = b.dataset.view; renderControls(); renderContent(); }));
  document.querySelectorAll('[data-type]').forEach(b => b.addEventListener('click', () => { state.typeFilter = b.dataset.type; renderControls(); renderContent(); }));
  document.querySelectorAll('[data-time]').forEach(b => b.addEventListener('click', () => { state.timeFilter = b.dataset.time; renderControls(); renderContent(); }));
}

function getFiltered() {
  return state.events.filter(e =>
    (state.typeFilter === 'all' || e.type === state.typeFilter) &&
    (state.timeFilter === 'upcoming' ? isFuture(e.date) : !isFuture(e.date))
  ).sort((a, b) => state.timeFilter === 'upcoming'
    ? new Date(a.date) - new Date(b.date)
    : new Date(b.date) - new Date(a.date));
}

// ── Content ───────────────────────────────────────────────────────────────

function renderContent() {
  render('#events-content', state.view === 'list' ? renderList() : renderCalendar());
}

// ── List View ─────────────────────────────────────────────────────────────

function renderList() {
  const events = getFiltered();
  if (!events.length) return emptyState('📅', 'Событий не найдено');

  const cards = events.map(evt => {
    const d = new Date(evt.date);
    const month = d.toLocaleDateString('ru-RU', { month: 'short' });
    const speaker = findMember(state.members, evt.speaker);

    return `
      <div class="c-event-card" data-event="${evt.id}">
        <div class="c-event-card__date-box">
          <span class="c-event-card__date-month">${month}</span>
          <span class="c-event-card__date-day">${d.getDate()}</span>
        </div>
        <div class="c-event-card__content">
          <div class="c-event-card__title">${evt.title}</div>
          <div class="c-event-card__meta">
            ${eventTypeBadge(evt.type)}
            ${evt.profession ? profBadge(evt.profession, state.professions) : ''}
            ${speaker ? `${avatar(speaker, 'sm')} ${speaker.name}` : ''}
            <span>${evt.time || ''} · ${evt.duration || ''}</span>
          </div>
          <div class="c-event-card__desc">${evt.description || ''}</div>
        </div>
      </div>
    `;
  }).join('');

  setTimeout(() => bindEventClicks(), 0);
  return `<div class="c-event-list">${cards}</div>`;
}

function bindEventClicks() {
  document.querySelectorAll('[data-event]').forEach(el =>
    el.addEventListener('click', () => {
      const evt = state.events.find(e => e.id === el.dataset.event);
      if (evt) openEventModal(evt);
    }));
}

// ── Calendar View ─────────────────────────────────────────────────────────

function renderCalendar() {
  const { calYear: y, calMonth: m } = state;
  const firstDay = new Date(y, m, 1);
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  let startWeekday = firstDay.getDay(); // 0=Sun
  startWeekday = startWeekday === 0 ? 6 : startWeekday - 1; // shift to Mon=0

  // Events this month
  const monthEvents = state.events.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === m && d.getFullYear() === y;
  });
  const byDay = {};
  monthEvents.forEach(e => { const day = new Date(e.date).getDate(); (byDay[day] = byDay[day] || []).push(e); });

  const weekdays = getWeekdayNames().map(d => `<div class="c-calendar__weekday">${d}</div>`).join('');
  let cells = '';
  for (let i = 0; i < startWeekday; i++) cells += '<div class="c-calendar__cell c-calendar__cell--empty"></div>';
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(y, m, day);
    const todayCls = isToday(date) ? ' c-calendar__cell--today' : '';
    const dots = (byDay[day] || []).map(e => `<span class="c-calendar__dot c-badge--${e.type}" title="${e.title}"></span>`).join('');
    cells += `<div class="c-calendar__cell${todayCls}" data-cal-day="${day}"><span class="c-calendar__day">${day}</span><div class="c-calendar__dots">${dots}</div></div>`;
  }

  setTimeout(() => {
    document.getElementById('cal-prev')?.addEventListener('click', () => { if (state.calMonth === 0) { state.calMonth = 11; state.calYear--; } else state.calMonth--; renderContent(); });
    document.getElementById('cal-next')?.addEventListener('click', () => { if (state.calMonth === 11) { state.calMonth = 0; state.calYear++; } else state.calMonth++; renderContent(); });
    document.querySelectorAll('[data-cal-day]').forEach(cell => cell.addEventListener('click', () => {
      const day = +cell.dataset.calDay;
      const evts = byDay[day];
      if (evts?.length === 1) openEventModal(evts[0]);
      else if (evts?.length > 1) openModal(`${day} ${getMonthName(m)}`, evts.map(e => `<div style="margin-bottom:var(--space-2)">${eventTypeBadge(e.type)} <strong>${e.title}</strong> — ${e.time || ''}</div>`).join(''));
    }));
  }, 0);

  return `
    <div class="c-calendar">
      <div class="c-calendar__nav">
        <button class="c-filter-chip" id="cal-prev">&larr;</button>
        <span class="c-calendar__month-label">${getMonthName(m)} ${y}</span>
        <button class="c-filter-chip" id="cal-next">&rarr;</button>
      </div>
      <div class="c-calendar__grid">
        ${weekdays}
        ${cells}
      </div>
    </div>
  `;
}

// ── Event Modal ───────────────────────────────────────────────────────────

function openEventModal(evt) {
  const speaker = findMember(state.members, evt.speaker);
  const body = `
    <div style="margin-bottom:var(--space-3)">
      ${eventTypeBadge(evt.type)}
      ${evt.profession ? profBadge(evt.profession, state.professions) : ''}
    </div>
    <p><strong>Дата:</strong> ${formatDate(evt.date)} · ${evt.time || ''}</p>
    <p><strong>Длительность:</strong> ${evt.duration || '—'}</p>
    ${speaker ? `<p><strong>Спикер:</strong> ${avatar(speaker, 'sm')} ${speaker.name}</p>` : ''}
    ${evt.location ? `<p><strong>Место:</strong> ${evt.location}</p>` : ''}
    ${evt.description ? `<p>${evt.description}</p>` : ''}
    ${evt.link ? `<p><a href="${evt.link}" target="_blank">Ссылка на событие &rarr;</a></p>` : ''}
  `;
  openModal(evt.title, body);
}
