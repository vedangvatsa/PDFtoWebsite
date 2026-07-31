import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  PLATFORM_JOBS_DISPLAY,
  PLATFORM_JOBS_TOTAL,
} from '@/lib/platform-job-count';
import { withTimeoutFallback, DB_BUDGET } from '@/lib/db-timeout';

export interface PlatformStats {
  totalJobs: number;
  totalCompanies: number;
  totalUsers: number;
  jobCountDisplay: string;
  companyCountDisplay: string;
  userCountDisplay: string;
}

let cache: { data: PlatformStats; ts: number } | null = null;

const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

/** Static-ish fallbacks so marketing pages never hang on Supabase. */
const FALLBACK_STATS: PlatformStats = {
  totalJobs: PLATFORM_JOBS_TOTAL,
  totalCompanies: 500,
  totalUsers: 2000,
  jobCountDisplay: PLATFORM_JOBS_DISPLAY,
  companyCountDisplay: '500+',
  userCountDisplay: '2000+',
};

export async function getPlatformStats(): Promise<PlatformStats> {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return cache.data;
  }

  const supabase = supabaseAdmin;

  // Prefer companies table (O(1) count of directory) over jobs scan.
  const companiesRes = await withTimeoutFallback(
    supabase
      .from('companies')
      .select('slug', { count: 'estimated', head: true }),
    DB_BUDGET.stats,
    { count: null, error: { message: 'timeout' } } as any,
    'stats-companies-count'
  );

  const usersRes = await withTimeoutFallback(
    supabase.from('profiles').select('id', { count: 'estimated', head: true }),
    DB_BUDGET.stats,
    { count: null, error: { message: 'timeout' } } as any,
    'stats-users-count'
  );

  const companies = companiesRes.count ?? FALLBACK_STATS.totalCompanies;
  const users = usersRes.count ?? FALLBACK_STATS.totalUsers;

  const stats: PlatformStats = {
    totalJobs: PLATFORM_JOBS_TOTAL,
    totalCompanies: companies,
    totalUsers: users,
    jobCountDisplay: PLATFORM_JOBS_DISPLAY,
    companyCountDisplay: `${companies}+`,
    userCountDisplay: `${users}`,
  };

  cache = { data: stats, ts: Date.now() };
  return stats;
}
