import { ImageResponse } from 'next/og';
import { getProfileBySlug } from '@/lib/supabase-server';
import { blogMetadata } from '@/lib/blog-metadata';
import { getCompanyDirectoryForOg, resolveOgCompanyLogo } from '@/lib/og-company-logo';
import { CompanyLogoBadge } from '@/components/og/company-logo-badge';
import nomadCities from '@/lib/nomad-cities';

export const runtime = 'nodejs';

export const alt = 'CVin.Bio SEO Preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;

  const siteDomain = (process.env.NEXT_PUBLIC_SITE_URL || 'cvin.bio').replace(/^https?:\/\//, '');

  const post = blogMetadata.find((p: any) => p.slug === slug);
  if (post) {
    return new ImageResponse(
      (
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%', backgroundColor: '#ffffff', fontFamily: 'sans-serif' }}>
          
          {/* Left Text Side */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', width: '55%', height: '100%', padding: '80px', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', overflow: 'hidden', width: '100%', fontSize: 68, fontWeight: 800, color: '#09090b', letterSpacing: '-2px', lineHeight: 1.1, marginTop: 20 }}>
              {post.imageText || post.title}
            </div>
            
            <div style={{ display: 'flex', width: '100%' }}>
              <div style={{ display: 'flex', fontSize: 68, fontWeight: 800, color: '#09090b', letterSpacing: '-2px', lineHeight: 1.1 }}>
                CVin.Bio
              </div>
            </div>
          </div>

          {/* Right Visual Side */}
          <div style={{ display: 'flex', width: '45%', height: '100%', backgroundColor: '#f4f4f5' }}>
            <img src={post.featuredImage} alt={post.title} style={{ display: 'flex', width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

        </div>
      ), { ...size, headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' } }
    );
  }

  // Check if it is a city guide
  const cityData = nomadCities.find((c) => c.slug === slug) ?? null;

  if (cityData) {
    const costDisplay = `$${cityData.cost?.monthly_total?.toLocaleString() ?? '1,500'}`;
    const tempDisplay = `${Math.round(cityData.weather?.avg_temp ?? 25)}°C`;
    const spacesDisplay = `${cityData.spaces?.total ?? 0}`;
    const speedDisplay = `${Math.round(cityData.internet?.download_mbps ?? 50)} Mbps`;

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
            padding: '60px 80px',
            justifyContent: 'space-between',
          }}
        >
          {/* Top branding */}
          <div style={{ display: 'flex', fontSize: 14, fontWeight: 600, color: '#a1a1aa', letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>
            CVin.Bio · Digital Nomad Guide
          </div>

          {/* Title and location */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', fontSize: 72, fontWeight: 800, color: '#09090b', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              {cityData.emoji} {cityData.name}
            </div>
            <div style={{ display: 'flex', fontSize: 32, fontWeight: 500, color: '#71717a' }}>
              {cityData.country} · Quality Score {cityData.nomad_score ?? 90}/100
            </div>
          </div>

          {/* Info cards row */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 12, padding: '20px 24px' }}>
              <span style={{ display: 'flex', fontSize: 16, color: '#71717a', fontWeight: 600 }}>Monthly Cost</span>
              <span style={{ display: 'flex', fontSize: 36, fontWeight: 800, color: '#09090b', marginTop: 4 }}>{costDisplay}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 12, padding: '20px 24px' }}>
              <span style={{ display: 'flex', fontSize: 16, color: '#71717a', fontWeight: 600 }}>Avg Temp</span>
              <span style={{ display: 'flex', fontSize: 36, fontWeight: 800, color: '#09090b', marginTop: 4 }}>{tempDisplay}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 12, padding: '20px 24px' }}>
              <span style={{ display: 'flex', fontSize: 16, color: '#71717a', fontWeight: 600 }}>Coworking & Coliving</span>
              <span style={{ display: 'flex', fontSize: 36, fontWeight: 800, color: '#09090b', marginTop: 4 }}>{spacesDisplay}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 12, padding: '20px 24px' }}>
              <span style={{ display: 'flex', fontSize: 16, color: '#71717a', fontWeight: 600 }}>Internet Speed</span>
              <span style={{ display: 'flex', fontSize: 36, fontWeight: 800, color: '#09090b', marginTop: 4 }}>{speedDisplay}</span>
            </div>
          </div>

          {/* Bottom URL */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e4e4e7', paddingTop: 20 }}>
            <span style={{ display: 'flex', fontSize: 20, color: '#71717a', fontWeight: 500 }}>Find coliving, coworking, and costs</span>
            <span style={{ display: 'flex', fontSize: 20, color: '#6366f1', fontWeight: 600 }}>{`${siteDomain}/${slug}`}</span>
          </div>
        </div>
      ),
      { ...size, headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' } }
    );
  }

  const data = await getProfileBySlug(slug);

  const isEmptyProfile =
    data &&
    (() => {
      const { profile, workExperience, education } = data;
      const name = profile.fullName;
      return (
        !name ||
        name === 'Professional Profile' ||
        name === 'Your Name' ||
        (!profile.summary &&
          workExperience.length === 0 &&
          education.length === 0 &&
          (!profile.skills || profile.skills.length === 0))
      );
    })();

  if (!data || isEmptyProfile) {
    const companyDir = await getCompanyDirectoryForOg(slug);
    if (companyDir) {
      const companyDisplay = companyDir.name || slug.replace(/-/g, ' ');
      const jobCount = companyDir.role_count || 0;
      const logoSrc = await resolveOgCompanyLogo({
        slug,
        companyName: companyDisplay,
        storedLogo: companyDir.logo,
      });
      const roleLabel =
        jobCount === 1 ? '1 open role' : `${jobCount.toLocaleString()} open roles`;

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
                CVin.Bio  ·  Company careers
              </div>
              <CompanyLogoBadge logoSrc={logoSrc} size={96} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div
                style={{
                  display: 'flex',
                  fontSize: 64,
                  fontWeight: 800,
                  color: '#09090b',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.08,
                  maxWidth: 1000,
                }}
              >
                {companyDisplay.length > 48
                  ? companyDisplay.slice(0, 45).trimEnd() + '...'
                  : companyDisplay}
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 32,
                  fontWeight: 500,
                  color: '#52525b',
                }}
              >
                {roleLabel} · Browse active openings
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
                Hiring data on CVin.Bio
              </div>
              <div style={{ display: 'flex', fontSize: 22, color: '#09090b', fontWeight: 700 }}>
                {siteDomain}/{slug}
              </div>
            </div>
          </div>
        ),
        {
          ...size,
          headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
        }
      );
    }
  }

  if (!data) {
    return new ImageResponse(
      (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: '#fafafa', color: '#09090b', fontFamily: 'sans-serif' }}>
          <div style={{ display: 'flex', fontSize: 90, fontWeight: 800, letterSpacing: '-0.05em', marginBottom: 20 }}>CVin.Bio</div>
          <div style={{ display: 'flex', fontSize: 44, color: '#71717a' }}>Turn Your CV into a Website</div>
        </div>
      ), { ...size }
    );
  }

  const { profile, workExperience } = data;
  const name = profile.fullName;
  const jobTitle = workExperience.length > 0 ? workExperience[0].title : null;
  const company = workExperience.length > 0 ? workExperience[0].company : null;
  const fallbackRole = profile.summary?.slice(0, 70) || 'Professional Profile';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cvin.bio';
  const avatarUrl = profile.avatarUrl && !profile.avatarUrl.includes('picsum.photos')
    ? (profile.avatarUrl.startsWith('http') ? profile.avatarUrl : `${siteUrl}/api/avatar/${slug}`)
    : null;

  // Cache strategy: long cache to prevent WhatsApp/Telegram crawler timeouts on cold starts
  const cacheHeader = 'public, max-age=3600, stale-while-revalidate=86400';

  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: '#ffffff', padding: '0 90px', gap: 18, fontFamily: 'sans-serif' }}>
        
        {/* Avatar */}
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={name} 
            style={{ display: 'flex', width: 160, height: 160, borderRadius: 160, objectFit: 'cover', border: '1px solid #e4e4e7', background: '#fafafa' }} 
          />
        ) : (
          <div style={{ width: 160, height: 160, borderRadius: 160, background: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, fontWeight: 600, color: '#a1a1aa', border: '1px solid #e4e4e7' }}>
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        
        {/* Name — largest, boldest */}
        <div style={{ display: 'flex', fontSize: 76, fontWeight: 800, color: '#09090b', letterSpacing: '-0.03em', lineHeight: 1, whiteSpace: 'nowrap', textAlign: 'center' }}>
          {name}
        </div>

        {/* Job Title — bold, dark, clearly readable */}
        <div style={{ display: 'flex', fontSize: 34, fontWeight: 600, color: '#18181b', lineHeight: 1, whiteSpace: 'nowrap', textAlign: 'center' }}>
          {jobTitle ? (jobTitle.length > 52 ? jobTitle.slice(0, 52) + '…' : jobTitle) : fallbackRole}
        </div>

        {/* Company — secondary, readable, bigger than URL */}
        {company && (
          <div style={{ display: 'flex', fontSize: 30, fontWeight: 400, color: '#52525b', lineHeight: 1, whiteSpace: 'nowrap', textAlign: 'center' }}>
            {company.length > 52 ? company.slice(0, 52) + '…' : company}
          </div>
        )}

        {/* URL — footer branding, indigo */}
        <div style={{ display: 'flex', fontSize: 24, fontWeight: 500, color: '#6366f1', marginTop: 10, textAlign: 'center' }}>
          {`${siteDomain}/${slug}`}
        </div>

      </div>
    ),
    { ...size, headers: { 'Cache-Control': cacheHeader } }
  );
}
