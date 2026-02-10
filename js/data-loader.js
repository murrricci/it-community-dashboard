// ==========================================================================
// Data Loader — Fetch & cache JSON files
// ==========================================================================

const cache = new Map();

/**
 * Load a JSON file from the data directory with caching
 */
export async function loadData(filename) {
  if (cache.has(filename)) {
    return cache.get(filename);
  }

  try {
    const response = await fetch(`data/${filename}`);
    if (!response.ok) throw new Error(`Failed to load ${filename}: ${response.status}`);
    const data = await response.json();
    cache.set(filename, data);
    return data;
  } catch (error) {
    console.error(`[DataLoader] Error loading ${filename}:`, error);
    return null;
  }
}

/**
 * Load multiple data files in parallel
 */
export async function loadAll(filenames) {
  const results = await Promise.all(filenames.map(f => loadData(f)));
  const data = {};
  filenames.forEach((f, i) => {
    const key = f.replace('.json', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    data[key] = results[i];
  });
  return data;
}

/**
 * Get cached data (synchronous, returns null if not loaded)
 */
export function getCached(filename) {
  return cache.get(filename) || null;
}

/**
 * Preload all common data files
 */
export async function preloadAll() {
  return loadAll([
    'professions.json',
    'practices.json',
    'rfcs.json',
    'events.json',
    'members.json',
    'changelog.json',
    'glossary.json',
    'announcements.json',
    'adoption-matrix.json',
    'practice-dependencies.json'
  ]);
}

/**
 * Helper: find member by id
 */
export function findMember(members, id) {
  return members?.find(m => m.id === id) || null;
}

/**
 * Helper: find profession by id
 */
export function findProfession(professions, id) {
  return professions?.find(p => p.id === id) || null;
}

/**
 * Helper: find practice by id
 */
export function findPractice(practices, id) {
  return practices?.practices?.find(p => p.id === id) || null;
}
