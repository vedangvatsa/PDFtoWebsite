/**
 * Threads queue policy: recycle posts that already worked, never reschedule
 * posts that already flopped. Facebook / Instagram keep walking the raw list.
 */

export const WIN_MIN_LIKES = 200;
export const WIN_MIN_VIEWS = 8000;
export const WIN_MIN_SPREAD = 25; // reposts + shares
export const FLOP_MAX_LIKES = 20;
export const FLOP_MAX_VIEWS = 800;
export const FLOP_MIN_AGE_DAYS = 3;

export function normalizeThreadsText(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/https?:\/\/cvin\.bio/g, 'cvin.bio')
    .replace(/cvin\.bio(\/[^\s]*)?\/th\b/gi, (_, p = '') => `cvin.bio${p}`)
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function fingerprint(s) {
  return normalizeThreadsText(s).slice(0, 80);
}

export function emptyPerformance() {
  return { updatedAt: null, winners: {}, flops: {} };
}

export function classifyPost(post, now = Date.now()) {
  const likes = post.likes || 0;
  const views = post.views || 0;
  const quotes = post.quotes || 0;
  const spread = (post.reposts || 0) + (post.shares || 0);
  if (likes >= WIN_MIN_LIKES || views >= WIN_MIN_VIEWS || spread >= WIN_MIN_SPREAD) {
    return 'win';
  }
  const ageDays = post.timestamp
    ? (now - new Date(post.timestamp).getTime()) / 86400000
    : 99;
  if (ageDays < FLOP_MIN_AGE_DAYS) return 'pending';
  if (likes <= FLOP_MAX_LIKES && views < FLOP_MAX_VIEWS && spread === 0 && quotes === 0) {
    return 'flop';
  }
  return 'mid';
}

function tokenScore(a, b) {
  if (!a || !b) return 0;
  const a80 = a.slice(0, 80);
  const b80 = b.slice(0, 80);
  if (a === b || a.startsWith(b80) || b.startsWith(a80) || a.includes(b80) || b.includes(a80)) {
    return 80;
  }
  const aw = a.split(' ').slice(0, 12);
  const bw = new Set(b.split(' ').slice(0, 12));
  let hit = 0;
  for (const w of aw) if (w.length > 3 && bw.has(w)) hit++;
  return hit;
}

export function bestItemForPost(postText, items) {
  const pn = normalizeThreadsText(postText);
  let best = null;
  let bestScore = 0;
  let bestIndex = -1;
  for (let i = 0; i < items.length; i++) {
    const n = normalizeThreadsText(items[i]?.text);
    if (!n) continue;
    const s = tokenScore(pn, n);
    if (s > bestScore) {
      bestScore = s;
      best = items[i];
      bestIndex = i;
    }
  }
  if (!best || bestScore < 6) return null;
  return { item: best, index: bestIndex, score: bestScore };
}

function mergeStats(prev, post) {
  const next = {
    likes: Math.max(prev?.likes || 0, post.likes || 0),
    views: Math.max(prev?.views || 0, post.views || 0),
    replies: Math.max(prev?.replies || 0, post.replies || 0),
    reposts: Math.max(prev?.reposts || 0, post.reposts || 0),
    shares: Math.max(prev?.shares || 0, post.shares || 0),
    quotes: Math.max(prev?.quotes || 0, post.quotes || 0),
  };
  if (post.text) next.text = String(post.text).replace(/\s+/g, ' ').slice(0, 120);
  else if (prev?.text) next.text = prev.text;
  return next;
}

export function applyPostsToPerformance(perf, posts, items, now = Date.now()) {
  const next = {
    updatedAt: perf?.updatedAt || null,
    winners: { ...(perf?.winners || {}) },
    flops: { ...(perf?.flops || {}) },
  };
  for (const post of posts || []) {
    const match = bestItemForPost(post.text, items);
    if (!match) continue;
    const fp = fingerprint(match.item.text);
    const cls = classifyPost(post, now);
    if (cls === 'win') {
      next.winners[fp] = mergeStats(next.winners[fp], post);
      delete next.flops[fp];
    } else if (cls === 'flop' && !next.winners[fp]) {
      next.flops[fp] = mergeStats(next.flops[fp], post);
    }
  }
  return next;
}

export function isFlopItem(item, perf) {
  const fp = fingerprint(item?.text);
  return !!perf?.flops?.[fp] && !perf?.winners?.[fp];
}

export function uniqueWinnerItems(items, perf) {
  const byFp = new Map();
  (items || []).forEach((item, index) => {
    const fp = fingerprint(item?.text);
    if (!perf?.winners?.[fp]) return;
    const prev = byFp.get(fp);
    if (!prev || (!prev.item.img && item.img)) {
      byFp.set(fp, {
        item,
        index,
        likes: perf.winners[fp].likes || 0,
        views: perf.winners[fp].views || 0,
      });
    }
  });
  return [...byFp.values()].sort((a, b) => b.likes - a.likes || b.views - a.views);
}

function prefixOf(item) {
  return String(item?.text || '').slice(0, 120).toLowerCase().trim();
}

export function pickThreadsCandidate({
  items,
  index = 0,
  recycleIndex = 0,
  recentPrefixes = [],
  performance,
}) {
  const recent = new Set((recentPrefixes || []).map((t) => String(t || '').toLowerCase().trim()));
  const skippedFlops = [];
  let i = Math.max(0, index);

  const isRecent = (item) => recent.has(prefixOf(item));

  while (i < items.length) {
    if (isFlopItem(items[i], performance)) {
      skippedFlops.push(i);
      i++;
      continue;
    }
    if (isRecent(items[i])) {
      i++;
      continue;
    }
    return {
      kind: 'forward',
      index: i,
      nextIndex: i + 1,
      recycleIndex,
      skippedFlops,
    };
  }

  const winners = uniqueWinnerItems(items, performance).filter((w) => w.item?.img);
  if (!winners.length) {
    return {
      kind: 'none',
      index: items.length,
      nextIndex: items.length,
      recycleIndex,
      skippedFlops,
    };
  }

  const n = winners.length;
  const start = ((recycleIndex % n) + n) % n;
  for (let k = 0; k < n; k++) {
    const w = winners[(start + k) % n];
    if (isRecent(w.item)) continue;
    return {
      kind: 'recycle',
      index: w.index,
      nextIndex: items.length,
      recycleIndex: (start + k + 1) % n,
      skippedFlops,
    };
  }

  return {
    kind: 'none',
    index: items.length,
    nextIndex: items.length,
    recycleIndex: start,
    skippedFlops,
  };
}
