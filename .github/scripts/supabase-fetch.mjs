/**
 * Free-tier-friendly Supabase REST fetch.
 *
 * Free Nano / small projects often return Cloudflare 522 when overloaded.
 * This helper retries with backoff, uses short timeouts, and avoids
 * Prefer:count so responses stay light.
 */

const RETRYABLE = new Set([408, 425, 429, 500, 502, 503, 504, 520, 521, 522, 523, 524]);

/**
 * @param {string} url full REST URL
 * @param {object} opts
 * @param {string} opts.apiKey Supabase service/anon key
 * @param {number} [opts.timeoutMs=20000]
 * @param {number} [opts.retries=4]
 * @param {string} [opts.label='supabase']
 */
export async function supabaseFetch(url, { apiKey, timeoutMs = 20000, retries = 4, label = 'supabase' } = {}) {
  if (!apiKey) throw new Error('supabaseFetch: apiKey required');

  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);
    const t0 = Date.now();
    try {
      const res = await fetch(url, {
        signal: ac.signal,
        headers: {
          apikey: apiKey,
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json',
          // Don't ask for exact counts — cheaper on free tier
          Prefer: 'count=none',
        },
      });
      clearTimeout(timer);
      const ms = Date.now() - t0;

      if (res.ok) {
        if (attempt > 1) console.log(`  ✅ ${label}: ok on attempt ${attempt} (${ms}ms)`);
        return await res.json();
      }

      const body = await res.text();
      const retryable = RETRYABLE.has(res.status);
      lastErr = new Error(`${label} HTTP ${res.status}: ${body.slice(0, 180)}`);

      if (!retryable || attempt === retries) throw lastErr;

      const wait = Math.min(30_000, 1500 * 2 ** (attempt - 1) + Math.floor(Math.random() * 500));
      console.warn(`  ⚠️  ${label}: HTTP ${res.status} in ${ms}ms — retry ${attempt}/${retries} in ${wait}ms`);
      await sleep(wait);
    } catch (e) {
      clearTimeout(timer);
      const ms = Date.now() - t0;
      const aborted = e?.name === 'AbortError';
      lastErr = aborted
        ? new Error(`${label} timeout after ${timeoutMs}ms`)
        : e;

      if (attempt === retries) throw lastErr;

      const wait = Math.min(30_000, 1500 * 2 ** (attempt - 1) + Math.floor(Math.random() * 500));
      console.warn(
        `  ⚠️  ${label}: ${aborted ? 'timeout' : e.message} in ${ms}ms — retry ${attempt}/${retries} in ${wait}ms`
      );
      await sleep(wait);
    }
  }
  throw lastErr;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Build a PostgREST URL for /rest/v1/{table}?params */
export function restUrl(baseUrl, table, params) {
  const u = new URL(`${baseUrl.replace(/\/$/, '')}/rest/v1/${table}`);
  for (const [k, v] of Object.entries(params || {})) {
    if (v !== undefined && v !== null && v !== '') u.searchParams.set(k, String(v));
  }
  return u.toString();
}
