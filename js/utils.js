// ==========================================================================
// Utility Functions
// ==========================================================================

/**
 * Format date to Russian locale string
 */
export function formatDate(dateStr, options = {}) {
  const date = new Date(dateStr);
  const defaults = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('ru-RU', { ...defaults, ...options });
}

/**
 * Format short date (e.g., "15 фев")
 */
export function formatShortDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

/**
 * Format relative date ("2 дня назад", "через 3 дня")
 */
export function formatRelativeDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date - now;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'сегодня';
  if (diffDays === 1) return 'завтра';
  if (diffDays === -1) return 'вчера';

  if (diffDays > 0) {
    return `через ${pluralize(diffDays, 'день', 'дня', 'дней')}`;
  }
  return `${pluralize(Math.abs(diffDays), 'день', 'дня', 'дней')} назад`;
}

/**
 * Russian pluralization
 */
export function pluralize(n, one, few, many) {
  const abs = Math.abs(n);
  const mod10 = abs % 10;
  const mod100 = abs % 100;

  if (mod100 >= 11 && mod100 <= 19) return `${n} ${many}`;
  if (mod10 === 1) return `${n} ${one}`;
  if (mod10 >= 2 && mod10 <= 4) return `${n} ${few}`;
  return `${n} ${many}`;
}

/**
 * Get initials from a name
 */
export function getInitials(name) {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Status label mapping
 */
export const STATUS_LABELS = {
  draft: 'Черновик',
  review: 'Ревью',
  accepted: 'Принято',
  rejected: 'Отклонено',
  deprecated: 'Устарело'
};

/**
 * Role label mapping
 */
export const ROLE_LABELS = {
  lead: 'Лид',
  expert: 'Эксперт',
  contributor: 'Контрибьютор',
  newcomer: 'Новичок'
};

/**
 * Event type labels
 */
export const EVENT_TYPE_LABELS = {
  meetup: 'Митап',
  workshop: 'Воркшоп',
  'review-event': 'Ревью',
  demo: 'Демо',
  retro: 'Ретро'
};

/**
 * Changelog type labels
 */
export const CHANGELOG_TYPE_LABELS = {
  added: 'Добавлено',
  changed: 'Изменено',
  deprecated: 'Устарело',
  removed: 'Удалено'
};

/**
 * Adoption status labels
 */
export const ADOPTION_LABELS = {
  adopted: 'Внедрено',
  'in-progress': 'Внедряется',
  planned: 'Запланировано',
  na: '—'
};

/**
 * Simple search filter across multiple fields
 */
export function matchesSearch(item, query, fields) {
  if (!query) return true;
  const lower = query.toLowerCase();
  return fields.some(field => {
    const value = field.split('.').reduce((o, k) => o?.[k], item);
    if (typeof value === 'string') return value.toLowerCase().includes(lower);
    if (Array.isArray(value)) return value.some(v => String(v).toLowerCase().includes(lower));
    return false;
  });
}

/**
 * Group array by a key
 */
export function groupBy(arr, keyFn) {
  return arr.reduce((map, item) => {
    const key = typeof keyFn === 'function' ? keyFn(item) : item[keyFn];
    if (!map[key]) map[key] = [];
    map[key].push(item);
    return map;
  }, {});
}

/**
 * Debounce function
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Get color CSS class for a profession
 */
export function getProfessionColor(profId) {
  return `var(--color-prof-${profId})`;
}

/**
 * Get month/day for calendar display
 */
export function getMonthName(monthIndex) {
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  return months[monthIndex];
}

export function getWeekdayNames() {
  return ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
}

/**
 * Check if a date is in the future
 */
export function isFuture(dateStr) {
  return new Date(dateStr) > new Date();
}

/**
 * Check if a date is today
 */
export function isToday(date) {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

/**
 * Get a hash parameter from the URL
 */
export function getHashParam() {
  return window.location.hash.slice(1);
}

/**
 * Set a hash parameter in the URL
 */
export function setHashParam(value) {
  if (value) {
    window.location.hash = value;
  } else {
    history.replaceState(null, '', window.location.pathname);
  }
}
