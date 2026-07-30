import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  PLATFORM_JOBS_DISPLAY,
  PLATFORM_JOBS_TOTAL,
} from '@/lib/platform-job-count';

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
const MAX_COMPANY_PAGES = process.env.NEXT_IS_BUILD_PHASE === '1' ? 1 : 3; // 3k rows max

export async function getPlatformStats(): Promise<PlatformStats> {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return cache.data;
  }

  const supabase = supabaseAdmin;
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  // Job total is static (100k+) — never COUNT(*) the full jobs table here.
  // Sample unique companies from a small recent window only.
  const companySet = new Set<string>();
  let page = 0;
  while (page < MAX_COMPANY_PAGES) {
    const { data } = await supabase
      .from('jobs')
      .select('company')
      .gt('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: false })
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (!data || data.length === 0) break;
    data.forEach((j) => {
      if (j.company && !j.company.includes('...')) {
        companySet.add(j.company.toLowerCase().trim());
      }
    });
    if (data.length < 1000) break;
    page++;
  }

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true });

  const companies = companySet.size;
  const users = totalUsers || 0;

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
