import { ImageResponse } from 'next/og';
import { fetchJobByCompanyAndSlug } from '@/lib/job-detail-data';
import { cleanPublishText } from '@/lib/noslop';
import { jobTypeLabel, isShortJobSlug } from '@/lib/job-description';
import { normalizeLocation } from '@/lib/normalize-location';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';
export const revalidate = 3600;
export const alt = 'Job listing on CVin.Bio';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Props = { params: Promise<{ slug: string; jobSlug: string }> };

function localCompanyLogoDataUrl(slug: string): string | null {
  const file = join(process.cwd(), 'public', 'company-logos', `${slug}.png`);
  if (!existsSync(file)) return null;
  const b64 = readFileSync(file).toString('base64');
  return `data:image/png;base64,${b64}`;
}

export default async function Image({ params }: Props) {
  const { slug, jobSlug } = await params;
  const siteDomain = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cvin.bio').replace(
    /^https?:\/\//,
    ''
  );

  let title = 'Open role';
  let company = slug.replace(/-/g, ' ');
  let location = 'Remote';
  let typeLabel: string | null = null;
  let path = `/${slug}/${jobSlug}`;
  let logoSrc: string | null = localCompanyLogoDataUrl(slug);

  if (isShortJobSlug(jobSlug)) {
    const job = await fetchJobByCompanyAndSlug(slug, jobSlug);
    if (job) {
      title = cleanPublishText(job.title);
      company = cleanPublishText(job.company);
      location = cleanPublishText(normalizeLocation(job.location || '') || 'Remote');
      typeLabel = jobTypeLabel(job.job_type);
      if (!logoSrc && job.company_logo && /^https?:\/\//i.test(job.company_logo)) {
        logoSrc = job.company_logo;
      }
    }
  }

  const displayTitle = title.length > 72 ? title.slice(0, 69).trimEnd() + '...' : title;
  const metaBits = [company, location, typeLabel].filter(Boolean).join('  ·  ');

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#fafafa',
          fontFamily: 'sans-serif',
          padding: '56px 72px',
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
              fontSize: 14,
              fontWeight: 600,
              color: '#a1a1aa',
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
            }}
          >
            CVin.Bio  ·  Job listing
          </div>
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoSrc}
              alt=""
              width={88}
              height={88}
              style={{
                width: 88,
                height: 88,
                borderRadius: 16,
                objectFit: 'contain',
                backgroundColor: '#ffffff',
                border: '1px solid #e4e4e7',
              }}
            />
          ) : null}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 56,
              fontWeight: 800,
              color: '#09090b',
              letterSpacing: '-0.03em',
              lineHeight: 1.12,
              maxWidth: 1000,
            }}
          >
            {displayTitle}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 28,
              fontWeight: 500,
              color: '#52525b',
              flexWrap: 'wrap' as const,
            }}
          >
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
            paddingTop: 24,
          }}
        >
          <div style={{ display: 'flex', fontSize: 22, color: '#71717a', fontWeight: 500 }}>
            Review on CVin.Bio · Continue with your CV
          </div>
          <div style={{ display: 'flex', fontSize: 22, color: '#09090b', fontWeight: 700 }}>
            {siteDomain}
            {path}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    }
  );
}
