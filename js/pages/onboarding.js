import { render, section } from '../renderer.js';
import { initAccordion } from '../components/accordion.js';
import { showToast } from '../components/toast.js';

const STEPS = [
  { title: 'Присоединяйтесь к сообществу', desc: 'Зарегистрируйтесь на платформе и представьтесь в общем канале.' },
  { title: 'Выберите профессию', desc: 'Просмотрите доступные профессии и выберите ту, что соответствует вашей экспертизе.' },
  { title: 'Изучите правила', desc: 'Ознакомьтесь с кодексом поведения, правилами контрибуций и процессом RFC.' },
  { title: 'Сделайте первый вклад', desc: 'Начните с малого — исправьте опечатку, добавьте термин в глоссарий или прокомментируйте открытый RFC.' },
  { title: 'Растите и помогайте', desc: 'Получите роль эксперта через регулярные контрибуции и помогайте новичкам.' },
];

const FAQ = [
  ['Как сменить профессию?', 'Вы можете обновить профессию в любое время через настройки профиля. Изменения вступают в силу сразу.'],
  ['Что считается контрибуцией?', 'RFC, записи в changelog, дополнения глоссария, код-ревью и менторские сессии — всё считается.'],
  ['Как назначаются роли?', 'Роли основаны на контрибуциях: новичок (0-5), контрибьютор (6-20), эксперт (21-50), лид (50+).'],
  ['Можно ли участвовать в нескольких профессиях?', 'Да. У вас есть основная профессия, но можно добавить дополнительные.'],
  ['Как работает процесс RFC?', 'Подайте предложение по шаблону ниже. Оно проходит этапы: черновик → ревью → принятие/отклонение.'],
  ['К кому обратиться за помощью?', 'Напишите любому лиду сообщества или в канал #help.'],
];

const RFC_TEMPLATE = `# RFC: [Название]

## Краткое описание
Краткое описание предложения.

## Мотивация
Почему это изменение необходимо?

## Детальный дизайн
Технические детали и план реализации.

## Рассмотренные альтернативы
Какие другие подходы были оценены?

## Стратегия внедрения
Как это будет развёрнуто?`;

export async function initOnboarding() {
  const stepsHtml = STEPS.map((s, i) => `
    <div class="p-onboarding__step">
      <div class="p-onboarding__step-number">${i + 1}</div>
      <div class="p-onboarding__step-content">
        <div class="p-onboarding__step-title">${s.title}</div>
        <div class="p-onboarding__step-text">${s.desc}</div>
      </div>
    </div>
  `).join('');

  const faqHtml = FAQ.map(([q, a]) => `
    <div class="c-accordion__item">
      <button class="c-accordion__trigger">
        ${q}
        <svg class="c-accordion__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="c-accordion__content"><div class="c-accordion__body">${a}</div></div>
    </div>
  `).join('');

  render('#onboarding-steps', `<div class="p-onboarding__steps">${stepsHtml}</div>`);
  render('#onboarding-faq', `
    <div class="p-onboarding__faq">
      <h2 class="p-onboarding__faq-title">Часто задаваемые вопросы</h2>
      <div class="c-accordion" id="faq-accordion">${faqHtml}</div>
    </div>
  `);
  render('#onboarding-template', `
    <div class="p-rfc-template">
      <div class="p-rfc-template__header">
        <span class="p-rfc-template__title">Шаблон RFC</span>
        <button class="p-rfc-template__copy-btn" id="copy-rfc-tpl">Копировать</button>
      </div>
      <pre><code>${RFC_TEMPLATE}</code></pre>
    </div>
  `);

  initAccordion('#faq-accordion');

  document.getElementById('copy-rfc-tpl')?.addEventListener('click', () => {
    navigator.clipboard.writeText(RFC_TEMPLATE).then(() => showToast('Шаблон RFC скопирован!', 'success'));
  });
}
