import { createClient } from '@supabase/supabase-js';
import { pathToFileURL } from 'node:url';
import { createOriginalJobFetcher, ORIGINAL_JOB_SOURCES } from './lib/fetch-original-job.mjs';
import { sourcePublicationPatch, SOURCE_DESCRIPTION_MAX_ROWS, SOURCE_ARCHIVED_TAG } from '../../src/lib/source-job-description.mjs';

/** Serialized by the jobs-sync workflow. Retain lightweight rows/URLs when
 * source snapshots expire; legacy manually curated descriptions are untouched.
 */
export async function importOriginalDescriptions({ client, fetchOriginal = createOriginalJobFetcher(), limit = 100, dryRun = false, now = new Date() }) {
  const cutoff = new Date(now.getTime() - 30 * 86400000).toISOString();
  const budget = Math.max(1, Math.min(100, Number(limit) || 100));
  const stats = { selected: 0, imported: 0, archived: 0, skipped: {}, failed: 0 };
  if (!dryRun) {
    const { data: expired, error } = await client.from('jobs').select('id,tags')
      .contains('tags', ['source-jd']).lt('created_at', cutoff)
      .or(`published_at.is.null,published_at.lt.${cutoff}`).limit(100);
    if (error) throw new Error(`Source retention read failed: ${error.message}`);
    for (const row of expired || []) {
      const tags = row.tags.filter((tag) => !['source-jd', 'curated-jd'].includes(tag));
      const { error: updateError } = await client.from('jobs').update({ description: null, tags: [...new Set([...tags, SOURCE_ARCHIVED_TAG])] })
        .eq('id', row.id).contains('tags', ['source-jd']).lt('created_at', cutoff).or(`published_at.is.null,published_at.lt.${cutoff}`);
      if (updateError) throw new Error(`Source retention write failed: ${updateError.message}`);
      stats.archived++;
    }
  }
  const { count, error: countError } = await client.from('jobs').select('id', { count: 'exact', head: true }).contains('tags', ['source-jd']);
  if (countError || !Number.isSafeInteger(count) || count < 0) throw new Error('Cannot verify source-description storage budget');
  const remaining = Math.min(budget, Math.max(0, SOURCE_DESCRIPTION_MAX_ROWS - count));
  if (!remaining) { console.log('Original-description storage budget reached; retaining apply-out listings'); return stats; }
  const { data: rows, error } = await client.from('jobs')
    .select('id,title,company,source,external_id,apply_url,tags,created_at,published_at')
    .in('source', ORIGINAL_JOB_SOURCES).is('description', null)
    .or('tags.is.null,tags.not.cs.{curated-jd}').gte('published_at', cutoff)
    .order('created_at', { ascending: false }).limit(remaining);
  if (error) throw new Error(`Original-description queue read failed: ${error.message}`);
  stats.selected = (rows || []).length;
  for (const job of rows || []) {
    try {
      const source = await fetchOriginal(job);
      const patch = source.ok ? sourcePublicationPatch(job, source.text) : null;
      if (!patch) {
        const reason = source.ok ? 'empty_short_or_oversized_source' : source.reason;
        stats.skipped[reason] = (stats.skipped[reason] || 0) + 1;
        continue;
      }
      if (!dryRun) {
        const { data: updated, error: updateError } = await client.from('jobs').update(patch)
          .eq('id', job.id).eq('apply_url', job.apply_url).is('description', null)
          .or('tags.is.null,tags.not.cs.{curated-jd}').select('id');
        if (updateError) throw new Error(`Source publication write failed: ${updateError.message}`);
        if (!updated?.length) continue;
      }
      stats.imported++;
      console.log(`${dryRun ? 'Would publish' : 'Published'} original description: ${job.id} (${Buffer.byteLength(patch.description)} bytes)`);
    } catch (error) {
      if (error.code === 'SOURCE_BYTE_BUDGET') {
        stats.skipped.source_response_too_large = (stats.skipped.source_response_too_large || 0) + 1;
        continue;
      }
      stats.failed++;
      console.error(`Original description unavailable for ${job.id}: ${error.message}`);
    }
  }
  return stats;
}

export async function main() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!url || !key) throw new Error('Supabase credentials are required');
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(20_000) }) },
  });
  const dryRun = process.env.DRY_RUN === '1';
  const stats = await importOriginalDescriptions({ client, limit: process.env.SOURCE_IMPORT_BATCH_SIZE, dryRun });
  console.log(JSON.stringify({ originalDescriptions: stats, dryRun, aiCalls: 0 }));
  if (!dryRun && (stats.imported || stats.archived)) {
    const response = await fetch('https://cvin.bio/api/cache/jobs', {
      method: 'POST', headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(20_000),
    });
    await response.body?.cancel();
    if (!response.ok) throw new Error(`Source-description cache invalidation failed (${response.status})`);
  }
  if (stats.failed) throw new Error(`${stats.failed} original-description imports failed; inspect the run output`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
