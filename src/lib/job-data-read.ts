import { DB_BUDGET, requireDatabaseResult, withRetryOnTimeout } from './db-timeout';

/** Critical, read-only job data. Recreate the lazy query after cancelling a
 * timed-out attempt. Never retry API errors or turn unavailable data into a
 * cached null/empty list, which would redirect or hide a real opening.
 */
export async function readJobQuery<T extends { data: unknown; error: unknown }>(
  run: () => PromiseLike<T>,
  label: string,
  timeoutMs: number = DB_BUDGET.job,
): Promise<T> {
  try {
    const result = await withRetryOnTimeout(run, timeoutMs, label, 1);
    requireDatabaseResult(result, label);
    return result;
  } catch (error) {
    // Structured diagnostics survive the production RSC message redaction.
    // Labels are fixed operation names, never query values or profile data.
    console.error(JSON.stringify({ event: 'job_data_read_failed', operation: label,
      error: error instanceof Error ? error.name : 'UnknownError', timeoutMs }));
    throw error;
  }
}
