import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  toJobDetail,
  buildJobJsonLd,
  validateJobPostingJsonLd,
  summarizeJobPostingValidation,
} from '@/lib/job-detail-data';
import { isJobDescriptionIndexable, jobDescriptionWordCount, jobSitemapPath } from '@/lib/job-description';
import type { JobRow } from '@/lib/job-detail-data';

export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = ['vatsvedang@gmail.com'];
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

async function assertAdmin(request: NextRequest) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user?.email || !ADMIN_EMAILS.includes(data.user.email)) return null;
  return data.user;
}

export async function GET(request: NextRequest) {
  const user = await assertAdmin(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: rows, error } = await supabaseAdmin
    .from('jobs')
    .select(
      'id,title,company,company_logo,location,job_type,salary,tags,apply_url,category,source,published_at,created_at,description,external_id'
    )
    .gt('created_at', thirtyDaysAgo)
    .order('created_at', { ascending: false })
    .limit(80);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let indexable = 0;
  let pretty = 0;
  let schemaOk = 0;
  let schemaWarn = 0;
  let schemaErr = 0;
  const issueCodes: Record<string, number> = {};
  const samples: any[] = [];

  for (const row of (rows || []) as JobRow[]) {
    const words = jobDescriptionWordCount(row.description);
    const idx = isJobDescriptionIndexable(row.description);
    if (idx) indexable++;
    const path = jobSitemapPath(row);
    if (path) pretty++;

    const detail = toJobDetail(row);
    const jsonLd = buildJobJsonLd(row, detail, siteUrl) as Record<string, unknown>;
    const summary = summarizeJobPostingValidation(validateJobPostingJsonLd(jsonLd));
    if (summary.ok && summary.warnCount === 0) schemaOk++;
    else if (summary.ok) schemaWarn++;
    else schemaErr++;
    for (const i of summary.issues) {
      issueCodes[i.code] = (issueCodes[i.code] || 0) + 1;
    }
    if (samples.length < 8) {
      samples.push({
        title: row.title,
        company: row.company,
        path: path || detail.public_path,
        words,
        indexable: idx,
        schemaOk: summary.ok,
        issues: summary.issues.slice(0, 5),
      });
    }
  }

  const n = (rows || []).length;
  return NextResponse.json({
    sampleSize: n,
    indexable,
    indexablePct: n ? Math.round((indexable / n) * 100) : 0,
    prettyUrls: pretty,
    prettyPct: n ? Math.round((pretty / n) * 100) : 0,
    schema: { ok: schemaOk, warnOnly: schemaWarn, errors: schemaErr },
    issueCodes,
    samples,
    gscChecklist: [
      'Search Console → Sitemaps → submit https://cvin.bio/sitemap.xml',
      'Search Console → Enhancements → Job postings (after crawl)',
      'Fix invalid JobPosting rows reported there',
      'IndexNow already pings Bing; Google is crawl/GSC based',
    ],
  });
}
