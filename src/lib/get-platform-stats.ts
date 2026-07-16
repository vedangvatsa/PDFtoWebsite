import { supabaseAdmin } from '@/lib/supabase-admin';

export interface PlatformStats {
  totalJobs: number;
  totalCompanies: number;
  totalUsers: number;
  jobCountDisplay: string;
  companyCountDisplay: string;
  userCountDisplay: string;
}

let cache: { data: PlatformStats; ts: number } | null = null;

// Free-tier friendly: long TTL so page views don't re-scan jobs constantly.
// Was 5 minutes + up to 40k row scans — that alone can knock out Nano compute.
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

  // Head-only counts (cheap)
  const { count: totalJobs } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .gt('created_at', thirtyDaysAgo);

  // Sample unique companies from a small window (not full table)
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

  const jobs = totalJobs || 0;
  // Sampled unique companies from recent rows only (not full-table scan)
  const companies = companySet.size;
  const users = totalUsers || 0;

  const jobThousands = Math.floor(jobs / 1000);
  const jobCountDisplay =
    jobThousands > 0
      ? `${jobThousands.toLocaleString()},000+`
      : `${jobs}+`;
  const companyCountDisplay = `${companies}+`;
  const userCountDisplay = `${users}`;

  const stats: PlatformStats = {
    totalJobs: jobs,
    totalCompanies: companies,
    totalUsers: users,
    jobCountDisplay,
    companyCountDisplay,
    userCountDisplay,
  };

  cache = { data: stats, ts: Date.now() };
  return stats;
}
