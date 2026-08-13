import { CompanyLogoBadge } from '@/components/og/company-logo-badge';

type JobListingOgCardProps = {
  displayTitle: string;
  metaBits: string;
  path: string;
  siteDomain: string;
  logoSrc: string | null;
};

export function JobListingOgCard({
  displayTitle,
  metaBits,
  path,
  siteDomain,
  logoSrc,
}: JobListingOgCardProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: '#ffffff',
        fontFamily: 'sans-serif',
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
            textTransform: 'uppercase',
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
        <div
          style={{
            display: 'flex',
            fontSize: 34,
            fontWeight: 500,
            color: '#52525b',
            flexWrap: 'wrap',
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
  );
}
