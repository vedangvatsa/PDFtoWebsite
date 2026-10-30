import { cache } from 'react';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { JobRow } from '@/lib/job-detail-data';

let jobsCache: JobRow[] | null = null;
let companiesCache: any[] | null = null;

async function getAssetsBinding(): Promise<any | null> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    return (ctx?.env as any)?.ASSETS ?? null;
  } catch {
    return null;
  }
}

export const getStaticJobs = cache(async (): Promise<JobRow[]> => {
  if (jobsCache) return jobsCache;

  const assets = await getAssetsBinding();
  if (assets) {
    try {
      const res = await assets.fetch('https://assets.local/cdn-cgi/jobs/jobs-runtime.json');
      if (res.ok) {
        jobsCache = (await res.json()) as JobRow[];
        return jobsCache;
      }
      await res.body?.cancel();
    } catch (err) {
      console.error('[getStaticJobs] Worker asset fetch failed:', err);
    }
  }

  // Node build/test fallback
  try {
    const { readFile } = await import('node:fs/promises');
    const { resolve } = await import('node:path');
    const raw = await readFile(resolve(process.cwd(), 'content', 'jobs-runtime.json'), 'utf8');
    jobsCache = JSON.parse(raw) as JobRow[];
    return jobsCache;
  } catch (err) {
    console.error('[getStaticJobs] Failed to read jobs-runtime.json:', err);
    return [];
  }
});

export const getStaticJobById = cache(async (id: string): Promise<JobRow | null> => {
  const jobs = await getStaticJobs();
  const found = jobs.find((j) => j.id === id);
  if (!found) return null;

  // Hydrate description from shard if omitted in compact catalog
  if (!found.description) {
    const shardKey = (found.slug || found.id) + '.json';
    const assets = await getAssetsBinding();
    if (assets) {
      try {
        const res = await assets.fetch(`https://assets.local/cdn-cgi/jobs/shards/${shardKey}`);
        if (res.ok) {
          const parsed = await res.json();
          return { ...found, description: parsed.description || null };
        }
        await res.body?.cancel();
      } catch (err) {
        console.error(`[getStaticJobById] Worker shard fetch failed for ${shardKey}:`, err);
      }
      return found;
    }

    try {
      const { readFile } = await import('node:fs/promises');
      const { resolve } = await import('node:path');
      const shardRaw = await readFile(resolve(process.cwd(), 'content', 'job-description-shards', shardKey), 'utf8');
      const parsed = JSON.parse(shardRaw);
      return { ...found, description: parsed.description || null };
    } catch {
      // Shard missing or unreadable
      return found;
    }
  }

  return found;
});

export const getStaticCompanies = cache(async (): Promise<any[]> => {
  if (companiesCache) return companiesCache;

  const assets = await getAssetsBinding();
  if (assets) {
    try {
      const res = await assets.fetch('https://assets.local/cdn-cgi/jobs/companies-runtime.json');
      if (res.ok) {
        const parsed = await res.json();
        companiesCache = Array.isArray(parsed) ? parsed : [];
        return companiesCache;
      }
      await res.body?.cancel();
    } catch (err) {
      console.error('[getStaticCompanies] Worker asset fetch failed:', err);
    }
  }

  try {
    const { readFile } = await import('node:fs/promises');
    const { resolve } = await import('node:path');
    const raw = await readFile(resolve(process.cwd(), 'content', 'companies-runtime.json'), 'utf8');
    const parsed = JSON.parse(raw);
    companiesCache = Array.isArray(parsed) ? parsed : [];
    return companiesCache;
  } catch (err) {
    console.error('[getStaticCompanies] Failed to read companies-runtime.json:', err);
    return [];
  }
});

