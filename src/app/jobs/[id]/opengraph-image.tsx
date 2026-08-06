import { ImageResponse } from 'next/og';
import { cleanPublishText } from '@/lib/noslop';
import { jobTypeLabel, isJobId, jobPublicPath, companyToSlug } from '@/lib/job-description';
import { normalizeLocation } from '@/lib/normalize-location';
import { resolveOgCompanyLogo } from '@/lib/og-company-logo';
import { loadInterFont } from '@/lib/og-fonts';
import { CompanyLogoBadge } from '@/components/og/company-logo-badge';
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
};

/** Direct bounded lookup (no unstable_cache — it hangs in this route context). */
async function loadJobForOg(id: string): Promise<OgJob | null> {
  const res = await withTimeoutFallback(
    supabaseAdmin
      .from('jobs')
      .select('id,title,company,company_logo,location,job_type')
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
    if (job) {
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
  const fonts = await loadInterFont([400, 500, 700, 800]);

  const displayTitle = title.length > 60 ? title.slice(0, 57).trimEnd() + '...' : title;
  const metaBits = [company, location, typeLabel].filter(Boolean).join('  ·  ');

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#ffffff',
          fontFamily: 'Inter',
          padding: 56,
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 16,
              fontWeight: 600,
              color: '#71717a',
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
            }}
          >
            CVin.Bio  ·  Job listing
          </div>
          <CompanyLogoBadge logoSrc={logoSrc} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 76,
              fontWeight: 800,
              color: '#09090b',
              letterSpacing: '-0.04em',
              lineHeight: 1.08,
              maxWidth: 1020,
            }}
          >
            {displayTitle}
          </div>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 500, color: '#52525b' }}>
            {metaBits}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #e4e4e7',
            paddingTop: 28,
          }}
        >
          <div style={{ display: 'flex', fontSize: 26, color: '#71717a', fontWeight: 500 }}>
            Now hiring
          </div>
          <div style={{ display: 'flex', fontSize: 26, color: '#09090b', fontWeight: 700 }}>
            {siteDomain}
            {path}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts,
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    }
  );
}
