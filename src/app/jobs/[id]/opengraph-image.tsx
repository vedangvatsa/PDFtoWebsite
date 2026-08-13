import { ImageResponse } from 'next/og';
import { cleanPublishText } from '@/lib/noslop';
import { jobTypeLabel, isJobId, jobPublicPath, companyToSlug } from '@/lib/job-description';
import { normalizeLocation } from '@/lib/normalize-location';
import { resolveOgCompanyLogo } from '@/lib/og-company-logo';
import { isPublicJobPage } from '@/lib/job-apply-source';
import { JobListingOgCard } from '@/components/og/job-listing-card';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withTimeoutFallback, DB_BUDGET } from '@/lib/db-timeout';

export const runtime = 'nodejs';
export const revalidate = 3600;
export const alt = 'Job listing on CVin.Bio';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Props = { params: Promise<{ id: string }> };

type OgJob = {
  id: string;
  title: string;
  company: string;
  company_logo: string | null;
  location: string | null;
  job_type: string | null;
  tags?: string[] | null;
  apply_url?: string | null;
};

/** Direct bounded lookup (no unstable_cache — it hangs in this route context). */
async function loadJobForOg(id: string): Promise<OgJob | null> {
  const res = await withTimeoutFallback(
    supabaseAdmin
      .from('jobs')
      .select('id,title,company,company_logo,location,job_type,tags,apply_url')
      .eq('id', id)
      .maybeSingle(),
    DB_BUDGET.fast,
    { data: null, error: null } as any,
    'og-job-id'
  );
  return (res?.data ?? null) as OgJob | null;
}

export default async function Image({ params }: Props) {
  const { id } = await params;
  const siteDomain = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cvin.bio').replace(
    /^https?:\/\//,
    ''
  );

  let title = 'Open role';
  let company = 'CVin.Bio';
  let location = 'Remote';
  let typeLabel: string | null = null;
  let path = `/jobs/${id}`;
  let companySlug: string | undefined;
  let storedLogo: string | null = null;

  if (isJobId(id)) {
    const job = await loadJobForOg(id);
    if (job && isPublicJobPage(job)) {
      title = cleanPublishText(job.title);
      company = cleanPublishText(job.company);
      location = cleanPublishText(normalizeLocation(job.location || '') || 'Remote');
      typeLabel = jobTypeLabel(job.job_type);
      path = jobPublicPath(job as any);
      companySlug = companyToSlug(company);
      storedLogo = job.company_logo;
    }
  }

  const logoSrc = await resolveOgCompanyLogo({
    slug: companySlug,
    companyName: company,
    storedLogo,
  });

  const displayTitle = title.length > 60 ? title.slice(0, 57).trimEnd() + '...' : title;
  const metaBits = [company, location, typeLabel].filter(Boolean).join('  ·  ');

  return new ImageResponse(
    (
      <JobListingOgCard
        displayTitle={displayTitle}
        metaBits={metaBits}
        path={path}
        siteDomain={siteDomain}
        logoSrc={logoSrc}
      />
    ),
    {
      ...size,
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    }
  );
}
