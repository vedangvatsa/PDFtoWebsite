import { sourcePublicationPatch } from '../../../src/lib/source-job-description.mjs';

/** Admit only complete, source-verified jobs. An unavailable source never
 * becomes a public placeholder just to increase the inventory counter.
 */
export async function completeJobCandidates(candidates, { limit, fetchOriginal, onOutcome = () => {} }) {
  const jobs = [];
  const stats = { attempted: 0, complete: 0, skipped: {}, failed: 0 };
  const cap = Math.max(0, Math.min(500, Number(limit) || 0));
  for (const job of candidates) {
    if (jobs.length >= cap || stats.attempted >= cap * 4) break;
    stats.attempted++;
    try {
      const source = await fetchOriginal(job);
      const patch = source.ok ? sourcePublicationPatch(job, source.html || source.text, { html: Boolean(source.html) }) : null;
      if (!patch) {
        const reason = source.ok ? 'invalid_source_body' : source.reason;
        stats.skipped[reason] = (stats.skipped[reason] || 0) + 1;
        onOutcome(job, `source_deferred:${reason}`);
        continue;
      }
      jobs.push({ ...job, ...patch });
      stats.complete++;
      onOutcome(job, 'source_verified');
    } catch (error) {
      stats.failed++;
      onOutcome(job, 'source_failed');
      console.warn(`Source verification deferred for ${job.external_id}: ${error.message}`);
    }
  }
  for (const job of candidates.slice(stats.attempted)) onOutcome(job, 'capacity_deferred');
  return { jobs, stats };
}
