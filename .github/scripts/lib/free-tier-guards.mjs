/** Small, bounded retries only for idempotent inventory reads. */
export async function readInventory(url, headers, { fetcher = fetch, pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) } = {}) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetcher(url, { headers, signal: AbortSignal.timeout(20_000) });
      if (!response.ok) {
        await response.body?.cancel();
        throw new Error(`Inventory read failed (HTTP ${response.status})`);
      }
      const rows = await response.json();
      if (!Array.isArray(rows)) throw new Error('Inventory read returned a non-array');
      return rows;
    } catch (error) {
      lastError = error;
      if (attempt < 2) await pause(500 * (attempt + 1));
    }
  }
  throw lastError;
}

/** Protect a complete small directory as well as a large one. */
export function assertDirectorySize(next, previous, { minimum = 1, maxDropFraction = 0.5, coverageVerified = false } = {}) {
  if (!Number.isInteger(next) || next < minimum) throw new Error('Incomplete company directory: below minimum');
  if (!Number.isInteger(previous) || previous < 0) throw new Error('Previous directory size unavailable');
  if (!coverageVerified && previous > 0 && next < previous * (1 - maxDropFraction)) {
    throw new Error(`Company directory dropped from ${previous} to ${next}; retaining the previous generation`);
  }
}

/** A successful request can still be truncated by PostgREST's row cap. */
export function assertCompleteCompanyStats(rows, expectedCount) {
  if (!Array.isArray(rows) || !Number.isSafeInteger(expectedCount) || expectedCount < 0 || rows.length !== expectedCount) {
    throw new Error('Incomplete company statistics; retaining the previous directory');
  }
  const names = new Set();
  for (const row of rows) {
    const count = Number(row?.role_count);
    if (typeof row?.company !== 'string' || names.has(row.company) || !Number.isSafeInteger(count) || count < 1) {
      throw new Error('Invalid company statistics; retaining the previous directory');
    }
    names.add(row.company);
  }
  return rows;
}
