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

/**
 * Public profile exists-or-not is unknown because the database timed out or
 * returned a transient error. Callers MUST map this to HTTP 503 / a retry UI —
 * never to notFound() / 404, or live profiles disappear from Google.
 */
export class ProfileUnavailableError extends Error {
  readonly slug: string;
  constructor(slug: string) {
    super('This profile is taking too long to load. Please try again in a moment.');
    this.name = 'ProfileUnavailableError';
    this.slug = slug;
  }
}

export function isProfileUnavailable(err: unknown): boolean {
  return (
    err instanceof ProfileUnavailableError ||
    (err instanceof Error && err.name === 'ProfileUnavailableError')
  );
}

/** Extra attempts after the first timeout. Public profile lookups use this. */
export const PROFILE_LOOKUP_RETRIES = 1;

/** Retry a thenable on DbTimeoutError only; other errors propagate immediately. */
export async function withRetryOnTimeout<T>(
  run: () => PromiseLike<T>,
  ms: number,
  label: string,
  retries = PROFILE_LOOKUP_RETRIES
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const attemptLabel = attempt === 0 ? label : `${label}-retry`;
    try {
      return await withTimeout(run(), ms, attemptLabel);
    } catch (err) {
      lastErr = err;
      if (!(err instanceof DbTimeoutError)) throw err;
      if (attempt < retries) {
        console.warn(`${err.message} — retrying once`);
      }
    }
  }
  throw lastErr;
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
  /**
   * Profile rows carry large JSON (experience/education/custom_sections).
   * Too-tight budgets turn a slow primary into a public 404.
   */
  profile: 8000,
  /** Stats / multi-page samples */
  stats: 5000,
} as const;
