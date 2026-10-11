/** Only known uniqueness conflicts are recoverable; outages still fail loudly. */
export function jobInsertConflict(result) {
  if (result.status !== 409 || result.error?.code !== '23505') return null;
  const constraint = String(result.error.message || '').match(/constraint "([^"]+)"/)?.[1];
  if (constraint === 'jobs_dedup_hash_key' || constraint === 'jobs_external_id_key') return 'duplicate';
  if (constraint === 'jobs_slug_key') return 'slug';
  return null;
}

export async function insertJobWithRecovery(job, insert, remint, maxSlugRetries = 3) {
  let candidate = { ...job };
  for (let attempt = 0; attempt <= maxSlugRetries; attempt++) {
    const result = await insert(candidate);
    if (result.status >= 200 && result.status < 300) {
      if (!Array.isArray(result.data)) throw new Error('Insert returned an invalid row response');
      return result.data.length;
    }
    const conflict = jobInsertConflict(result);
    if (conflict === 'duplicate') return 0;
    if (conflict !== 'slug') throw new Error(`Individual insert failed (${result.status}, ${result.error?.code || 'unknown'})`);
    if (attempt === maxSlugRetries) throw new Error('Slug collision retry budget exhausted');
    candidate = remint(job, attempt + 1);
  }
}
