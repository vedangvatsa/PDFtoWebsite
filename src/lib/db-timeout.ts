/**
 * Hard timeouts for public Supabase calls.
 * Public SSR must never hang on a slow/unhealthy primary.
 */

export class DbTimeoutError extends Error {
  constructor(label: string, ms: number) {
    super(`[db-timeout] ${label} exceeded ${ms}ms`);
    this.name = 'DbTimeoutError';
  }
}

/** Race a thenable (incl. Supabase builders) against a wall-clock deadline. */
export function withTimeout<T>(
  promise: PromiseLike<T>,
  ms: number,
  label = 'query'
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new DbTimeoutError(label, ms)), ms);
  });
  // Promise.resolve so PostgrestBuilder (thenable) is a real Promise for race/finally.
  return Promise.race([Promise.resolve(promise), timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  }) as Promise<T>;
}

/** Like withTimeout but returns fallback instead of throwing. */
export async function withTimeoutFallback<T>(
  promise: PromiseLike<T>,
  ms: number,
  fallback: T,
  label = 'query'
): Promise<T> {
  try {
    return await withTimeout(promise, ms, label);
  } catch (err) {
    if (err instanceof DbTimeoutError) {
      console.warn(err.message);
      return fallback;
    }
    // Network / PostgREST errors: also fail open for public pages
    console.warn(`[db-fail] ${label}:`, err instanceof Error ? err.message : err);
    return fallback;
  }
}

/** Public-page budgets (ms). Keep well under CF Worker / browser patience. */
export const DB_BUDGET = {
  /** PK / unique lookups (external_id, id, companies.slug) */
  fast: 2500,
  /** Company jobs list, directory, filtered board */
  list: 4000,
  /** Stats / multi-page samples */
  stats: 5000,
} as const;
