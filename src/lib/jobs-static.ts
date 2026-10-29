import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { JobRow } from '@/lib/job-detail-data';

let jobsCache: JobRow[] | null = null;
let companiesCache: any[] | null = null;

const CONTENT_DIR = resolve(process.cwd(), 'content');

export function getStaticJobs(): JobRow[] {
  if (jobsCache) return jobsCache;
  try {
    const raw = readFileSync(resolve(CONTENT_DIR, 'jobs-runtime.json'), 'utf8');
    jobsCache = JSON.parse(raw) as JobRow[];
    return jobsCache;
  } catch (err) {
    console.error('[getStaticJobs] Failed to read jobs-runtime.json:', err);
    return [];
  }
}

export function getStaticJobById(id: string): JobRow | null {
  const jobs = getStaticJobs();
  const found = jobs.find((j) => j.id === id);
  if (!found) return null;

  // Hydrate description from shard if omitted in compact catalog
  if (!found.description) {
    const shardKey = (found.slug || found.id) + '.json';
    try {
      const shardRaw = readFileSync(resolve(CONTENT_DIR, 'job-description-shards', shardKey), 'utf8');
      const parsed = JSON.parse(shardRaw);
      return { ...found, description: parsed.description || null };
    } catch {
      // Shard missing or unreadable
      return found;
    }
  }

  return found;
}

export function getStaticCompanies(): any[] {
  if (companiesCache) return companiesCache;
  try {
    const raw = readFileSync(resolve(CONTENT_DIR, 'companies-runtime.json'), 'utf8');
    companiesCache = JSON.parse(raw);
    return companiesCache;
  } catch (err) {
    console.error('[getStaticCompanies] Failed to read companies-runtime.json:', err);
    return [];
  }
}
