// ==========================================================================
// Renderer — HTML rendering utilities
// ==========================================================================

import { getInitials, STATUS_LABELS, ROLE_LABELS, EVENT_TYPE_LABELS } from './utils.js';

/**
 * Safely set innerHTML of an element
 */
export function render(selector, html) {
  const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (el) el.innerHTML = html;
  return el;
}

/**
 * Create a status badge
 */
export function statusBadge(status) {
  const label = STATUS_LABELS[status] || status;
  return `<span class="c-badge c-badge--${status}">${label}</span>`;
}

/**
 * Create a profession badge
 */
export function profBadge(profId, professions) {
  const prof = professions?.find(p => p.id === profId);
  const name = prof?.shortName || profId;
  return `<span class="c-badge c-badge--${profId}">${name}</span>`;
}

/**
 * Create a role badge
 */
export function roleBadge(role) {
  const label = ROLE_LABELS[role] || role;
  return `<span class="c-badge c-badge--${role}">${label}</span>`;
}

/**
 * Create an event type badge
 */
export function eventTypeBadge(type) {
  const label = EVENT_TYPE_LABELS[type] || type;
  const cssClass = type === 'review-event' ? 'review-event' : type;
  return `<span class="c-badge c-badge--${cssClass}">${label}</span>`;
}

/**
 * Create an avatar element
 */
export function avatar(member, size = 'md') {
  if (!member) return `<span class="c-avatar c-avatar--${size}">?</span>`;
  const initials = getInitials(member.name);
  return `<span class="c-avatar c-avatar--${size}" title="${member.name}">${initials}</span>`;
}

/**
 * Create a metric card
 */
export function metricCard({ label, value, icon, trend }) {
  const trendHtml = trend
    ? `<span class="c-metric-card__trend c-metric-card__trend--${trend.direction}">${trend.text}</span>`
    : '';
  return `
    <div class="c-metric-card">
      <div class="c-metric-card__header">
        <span class="c-metric-card__label">${label}</span>
        <span class="c-metric-card__icon">${icon || ''}</span>
      </div>
      <span class="c-metric-card__value">${value}</span>
      ${trendHtml}
    </div>
  `;
}

/**
 * Create a content card (for RFC, changelog items)
 */
export function contentCard({ accentColor, title, badges, meta, description, onClick }) {
  const dataAttr = onClick ? `data-action="${onClick}"` : '';
  return `
    <div class="c-content-card" ${dataAttr}>
      <div class="c-content-card__accent" style="background:${accentColor}"></div>
      <div class="c-content-card__body">
        <div class="c-content-card__title">
          ${title}
          ${badges || ''}
        </div>
        ${meta ? `<div class="c-content-card__meta">${meta}</div>` : ''}
        ${description ? `<div class="c-content-card__desc">${description}</div>` : ''}
      </div>
    </div>
  `;
}

/**
 * Create loading state
 */
export function loading(text = 'Загрузка...') {
  return `
    <div class="c-loading">
      <div class="c-loading__spinner"></div>
      <span>${text}</span>
    </div>
  `;
}

/**
 * Create empty state
 */
export function emptyState(icon, text) {
  return `
    <div class="c-empty">
      <div class="c-empty__icon">${icon}</div>
      <p class="c-empty__text">${text}</p>
    </div>
  `;
}

/**
 * Create a section wrapper
 */
export function section(title, content, linkHref, linkText) {
  const linkHtml = linkHref
    ? `<a href="${linkHref}" class="l-section__link">${linkText || 'Все'} →</a>`
    : '';
  return `
    <div class="l-section">
      <div class="l-section__header">
        <h2 class="l-section__title">${title}</h2>
        ${linkHtml}
      </div>
      ${content}
    </div>
  `;
}

/**
 * Create progress bar
 */
export function progressBar(percent, colorClass = '') {
  return `
    <div class="c-progress">
      <div class="c-progress__bar">
        <div class="c-progress__fill ${colorClass}" style="width:${percent}%"></div>
      </div>
      <span class="c-progress__label">${percent}%</span>
    </div>
  `;
}

/**
 * Map status to accent color CSS variable
 */
export function statusColor(status) {
  const map = {
    draft: 'var(--color-status-draft)',
    review: 'var(--color-status-review)',
    accepted: 'var(--color-status-accepted)',
    rejected: 'var(--color-status-rejected)',
    deprecated: 'var(--color-status-deprecated)'
  };
  return map[status] || 'var(--color-border-primary)';
}
