# CLAUDE.md — Project Context

## Project Overview

IT Community Dashboard — static multi-page site for IT engineering communities. Tracks RFC proposals, engineering practices, events, members, standards changes across 6 professions. All content in Russian. No backend — JSON data files loaded at runtime via fetch.

**Live:** https://murrricci.github.io/it-community-dashboard/
**Repo:** git@github.com:murrricci/it-community-dashboard.git (SSH only — HTTPS blocked by corporate firewall)

## Tech Stack

- Vanilla HTML/CSS/JS, no frameworks, no bundlers, no build step
- ES modules (`type="module"`) — native browser support
- CSS Custom Properties for design tokens, `@import` aggregation in `main.css`
- Data: 11 JSON files in `data/`, fetched and cached at runtime
- Deploy: GitHub Actions → `peaceiris/actions-gh-pages@v4` → `gh-pages` branch → GitHub Pages

## Architecture

Multi-page app (not SPA). Each HTML page = separate file with shared sidebar/header shell. JS routing in `app.js` maps page name to init function. Pages are self-contained controllers that load data and render HTML into container elements.

**Data flow:** `data/*.json` → `data-loader.js` (fetch + cache Map) → page controller → `renderer.js` helpers → `render(selector, html)` injects innerHTML.

## File Structure (73 files)

```
├── *.html (10)          — index, professions, practices, rfc, events, members, changelog, glossary, onboarding, 404
├── css/
│   ├── variables.css    — design tokens (colors, fonts, spacing, shadows, transitions)
│   ├── reset.css, base.css, layout.css — foundation
│   ├── components/ (16) — header, sidebar, cards, badges, timeline, calendar, tabs, filters, modal, avatar, progress, matrix, accordion, tag, breadcrumb, toast
│   ├── pages/ (9)       — one per page
│   ├── responsive.css   — breakpoints: 640/768/1024/1280px, mobile-first
│   ├── print.css
│   └── main.css         — @import aggregator
├── js/
│   ├── app.js           — entry point, DOMContentLoaded, route to page init
│   ├── data-loader.js   — loadData, loadAll, preloadAll, getCached, findMember/findProfession/findPractice
│   ├── renderer.js      — render, statusBadge, profBadge, roleBadge, avatar, metricCard, contentCard, section, progressBar, statusColor
│   ├── utils.js         — formatDate, pluralize (Russian), matchesSearch, STATUS_LABELS, EVENT_TYPE_LABELS, CHANGELOG_TYPE_LABELS, isFuture, getHashParam, setHashParam, debounce, groupBy
│   ├── search.js        — global search (⌘K), searches all entity types, arrow key nav
│   ├── components/ (6)  — header (burger, profession select + localStorage), sidebar (active link), modal, tabs, accordion, toast
│   └── pages/ (9)       — dashboard, professions, practices, rfc, events, members, changelog, glossary, onboarding
├── data/ (11)           — professions, practices, rfcs, events, members, changelog, glossary, announcements, resources, adoption-matrix, practice-dependencies
└── .github/workflows/deploy.yml
```

## Naming Conventions

- **CSS BEM-like with prefixes:** `.c-` (component), `.l-` (layout), `.p-` (page-specific), `.u-` (utility), `.is-` (state)
- **Examples:** `.c-card`, `.c-metric-card__value`, `.l-grid--3`, `.p-dashboard__contributor`, `.u-mt-4`, `.is-active`
- **JS:** camelCase functions, page controllers export single `initPageName()` function
- **Data:** JSON files use camelCase keys, IDs are kebab-case strings

## Design System

- **Theme:** dark, GitHub-style. Background `#0d1117`, cards `#161b22`, text `#e6edf3`
- **Fonts:** Inter (body), JetBrains Mono (code)
- **Status colors:** draft=yellow `#d29922`, review=blue `#58a6ff`, accepted=green `#3fb950`, rejected=red `#f85149`
- **Profession colors:** backend=purple, frontend=blue, qa=green, devops=orange, mobile=pink, data=teal
- All colors defined as CSS custom properties in `variables.css`

## Key Patterns

- `preloadAll()` loads all 11 JSON files, returns object with camelCase keys (e.g., `data.rfcs`, `data.members`)
- `render(selector, htmlString)` sets innerHTML on querySelector result
- `section(title, content, linkHref?, linkText?)` wraps content in titled section with optional "view all" link
- `contentCard({ accentColor, title, badges, meta, onClick })` renders card with left accent bar
- Deep linking via URL hash: `getHashParam()` / `setHashParam()` in utils.js
- `matchesSearch(obj, query, fields[])` — multi-field case-insensitive search
- Profession preference stored in localStorage, dispatches `profession-changed` custom event

## HTML Page Shell

All 9 main pages share identical structure: sidebar (SVG icons, 4 nav groups), header (burger, breadcrumb, search trigger ⌘K, profession select), search modal (`#search-modal`), detail modal (`#detail-modal`), overlay. Differ in: `<title>`, active sidebar link, breadcrumb text, `<main>` content with page-specific container IDs.

## Container IDs per Page

| Page | Containers |
|------|-----------|
| dashboard | `#dashboard-metrics`, `#dashboard-rfcs`, `#dashboard-events`, `#dashboard-changes`, `#dashboard-announcements`, `#dashboard-quicklinks`, `#dashboard-contributors` |
| professions | `#professions-grid`, `#profession-detail` |
| practices | `#practices-filters`, `#practices-view-toggle`, `#practices-content` |
| rfc | `#rfc-filters`, `#rfc-list`, `#rfc-template` |
| events | `#events-toolbar`, `#events-content` |
| members | `#members-filters`, `#members-leaderboard`, `#members-grid` |
| changelog | `#changelog-filters`, `#changelog-timeline`, `#changelog-export` |
| glossary | `#glossary-search`, `#glossary-alpha-nav`, `#glossary-content` |
| onboarding | `#onboarding-steps`, `#onboarding-faq`, `#onboarding-template` |

## Data Models (key fields)

- **Profession:** id, name, shortName, icon, color, description, competencies[], practices[], lead, experts[], contributors[], resources[], lastUpdated, version
- **Practice:** id, name, category, status (draft/review/accepted/rejected/deprecated), description, rationale, adoptionGuide, relatedRfc, professions[], adoptionLevel (0-100)
- **RFC:** id, number, title, author (member ID), status, createdAt, updatedAt, description, body, relatedPractice, professions[], statusHistory[], voting {for,against,abstain}, discussions[]
- **Event:** id, title, type (meetup/workshop/review-event/demo/retro), date, time, duration, speaker (member ID), profession, location, description
- **Member:** id, name, role (lead/expert/contributor/newcomer), professions[], contributions, joinedAt, bio
- **Changelog:** date, type (added/changed/deprecated/removed), description, profession, author, relatedRfc, version

## Known Constraints

- HTTPS to api.github.com is blocked (corporate firewall) — use SSH for all git operations
- `gh` CLI not installed — cannot use GitHub API programmatically
- No build step — all CSS/JS served as-is, CSS uses @import chain
- Announcement sidebar link points to `index.html#announcements` (not a separate page)

## Common Pitfalls (from past bugs)

- `loadAll()` returns an **object** (not array) — destructure as `const data = await loadAll(...)`, access `data.members`
- Container IDs in HTML must match what JS renders into — verify both sides when adding pages
- `matchesSearch(obj, query, fields[])` requires 3 arguments — fields array is mandatory
- Sidebar active state: links with `#` fragments are skipped to avoid double-highlighting
- RFC discussions are string arrays, not objects
- Search modal input class: `.c-search-modal__input` (not `.c-search-input__field`)
