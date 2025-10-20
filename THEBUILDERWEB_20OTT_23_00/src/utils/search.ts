// Utility helpers for robust, user-friendly search across lists
// - normalizes diacritics and punctuation
// - supports multi-word queries in any order
// - ranks results by relevance (exact phrase, word-boundary hits, partial hits)

export function normalizeString(input: string): string {
  return (input || "")
    .toLowerCase()
    // remove diacritics
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // unify separators to spaces
    .replace(/[\-_./]+/g, " ")
    .replace(/["'’]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(input: string): string[] {
  const n = normalizeString(input);
  if (!n) return [];
  return n.split(/\s+/);
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function deriveAdjacencyConstraints(query: string): string[] {
  const constraints: string[] = [];
  if (!query) return constraints;
  const raw = query;
  const numPairRe = /(\d+)\s*[_\-xX×]\s*(\d+)/g;
  let m: RegExpExecArray | null;
  while ((m = numPairRe.exec(raw)) !== null) {
    const a = m[1];
    const b = m[2];
    // In normalized candidate we use space as separator
    constraints.push(`${a} ${b}`);
  }
  return constraints;
}

function isAlphaToken(token: string) {
  return /[a-z]/i.test(token) && !/[0-9]/.test(token);
}

export function hardMatch(candidate: string, query: string) {
  const candNorm = normalizeString(candidate);
  const words = tokenize(query);
  const adjacency = deriveAdjacencyConstraints(query);
  if (words.length === 0) return false;

  // 1) All adjacency constraints must appear
  for (const a of adjacency) {
    if (!candNorm.includes(a)) return false;
  }

  // 2) Every token must match. Alpha tokens (len>=2) must match at word start.
  for (const w of words) {
    if (isAlphaToken(w) && w.length >= 2) {
      const re = new RegExp(`\\b${escapeRegex(w)}`);
      if (!re.test(candNorm)) return false;
    } else {
      if (!candNorm.includes(w)) return false;
    }
  }
  return true;
}

export function scoreMatch(candidate: string, query: string) {
  const candNorm = normalizeString(candidate);
  const queryNorm = normalizeString(query);
  if (!queryNorm) return { score: 0, matchesAll: true };

  const words = tokenize(queryNorm);
  const adjacency = deriveAdjacencyConstraints(query);
  const matchesAll = hardMatch(candidate, queryNorm) && adjacency.every((a) => candNorm.includes(a));
  if (!matchesAll) return { score: 0, matchesAll: false };

  let score = 0;

  // Exact phrase boost
  if (candNorm.includes(queryNorm)) score += 50;
  // Adjacency constraints bonus (e.g., "6 8" from query "6_8")
  for (const a of adjacency) {
    if (candNorm.includes(a)) score += 25;
  }

  // Word-by-word scoring with boundary preference
  for (const w of words) {
    const boundaryRe = new RegExp(`\\b${escapeRegex(w)}\\b`);
    if (boundaryRe.test(candNorm)) score += 5; // word boundary hit
    else score += 2; // partial substring
  }

  // Ordered adjacency bonus (words next to each other in order)
  const orderedPhrase = words.join(" ");
  if (candNorm.includes(orderedPhrase)) score += 10;

  // Shorter names that still match get a tiny boost (readability)
  score += Math.max(0, 10 - Math.floor(candNorm.length / 20));

  return { score, matchesAll: true };
}

export function filterAndRank<T>(items: T[], getName: (x: T) => string, query: string, limit = 200): T[] {
  if (!query || !query.trim()) return [];
  const scored: Array<{ item: T; score: number }> = [];
  for (const item of items) {
    const name = getName(item);
    const { score, matchesAll } = scoreMatch(name, query);
    if (matchesAll && score > 0) scored.push({ item, score });
  }

  scored.sort((a, b) => b.score - a.score || getName(a.item).localeCompare(getName(b.item)));
  if (limit > 0 && scored.length > limit) return scored.slice(0, limit).map((s) => s.item);
  return scored.map((s) => s.item);
}

export function strictFilter<T>(items: T[], getName: (x: T) => string, query: string): T[] {
  if (!query || !query.trim()) return [];
  return items.filter((it) => hardMatch(getName(it), query));
}
