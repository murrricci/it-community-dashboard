import { loadAll } from '../data-loader.js';
import { render, emptyState } from '../renderer.js';
import { matchesSearch, debounce } from '../utils.js';

export async function initGlossary() {
  const data = await loadAll(['glossary.json']);
  const glossary = data.glossary || [];
  const sorted = [...glossary].sort((a, b) => a.term.localeCompare(b.term, 'ru'));
  const letters = [...new Set(sorted.map(t => t.term[0].toUpperCase()))].sort();
  let search = '';

  function filtered() {
    if (!search) return sorted;
    return sorted.filter(t => matchesSearch(t, search, ['term', 'definition']));
  }

  function draw() {
    const terms = filtered();

    // Alpha nav
    render('#glossary-alpha-nav', `
      <nav class="p-glossary__alpha-nav">
        ${letters.map(l => `<button class="p-glossary__alpha-btn" data-letter="${l}">${l}</button>`).join('')}
      </nav>
    `);

    // Search
    render('#glossary-search', `
      <div class="c-filters__search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="search" class="c-filters__search-input" placeholder="Поиск терминов..." value="${search}">
      </div>
    `);

    // Terms grouped by letter
    if (!terms.length) {
      render('#glossary-content', emptyState('📖', 'Термины не найдены'));
    } else {
      const grouped = {};
      terms.forEach(t => { const l = t.term[0].toUpperCase(); (grouped[l] ??= []).push(t); });

      const html = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([letter, items]) => `
        <div class="p-glossary__letter-group" id="letter-${letter}">
          <h2 class="p-glossary__letter">${letter}</h2>
          ${items.map(t => {
            const related = (t.related || []).map(r =>
              `<span class="c-tag c-tag--clickable" data-scroll-term="${r}">${r}</span>`
            ).join(' ');
            return `<div class="p-glossary__term" id="term-${t.id}">
              <div class="p-glossary__term-name">${t.term}</div>
              <div class="p-glossary__term-def">${t.definition}</div>
              <div class="p-glossary__term-related">
                <span class="c-badge">${t.category}</span>
                ${related}
              </div>
            </div>`;
          }).join('')}
        </div>
      `).join('');
      render('#glossary-content', html);
    }

    // Bind events
    document.querySelectorAll('.p-glossary__alpha-btn').forEach(btn =>
      btn.addEventListener('click', () => {
        document.getElementById(`letter-${btn.dataset.letter}`)?.scrollIntoView({ behavior: 'smooth' });
      })
    );
    document.querySelector('.c-filters__search-input')?.addEventListener('input', debounce(e => {
      search = e.target.value.trim();
      draw();
    }, 200));
  }

  draw();
}
