import { CompanyLogoBadge } from '@/components/og/company-logo-badge';
import { satoriBox, satoriStyle } from '@/lib/satori-style';

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
      style={satoriStyle({
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: '#ffffff',
        fontFamily: 'sans-serif',
        padding: 56,
        justifyContent: 'space-between',
      })}
    >
      <div
        style={satoriBox({
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        })}
      >
        <div
          style={satoriBox({
            fontSize: 16,
            fontWeight: 600,
            color: '#71717a',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          })}
        >
          CVin.Bio  ·  Job listing
        </div>
        <CompanyLogoBadge logoSrc={logoSrc} />
      </div>

      <div style={satoriBox({ flexDirection: 'column', gap: 24 })}>
        <div
          style={satoriBox({
            fontSize: 76,
            fontWeight: 800,
            color: '#09090b',
            letterSpacing: '-0.04em',
            lineHeight: 1.08,
            maxWidth: 1020,
          })}
        >
          {displayTitle}
        </div>
        <div
          style={satoriBox({
            fontSize: 34,
            fontWeight: 500,
            color: '#52525b',
            flexWrap: 'wrap',
          })}
        >
          {metaBits}
        </div>
      </div>

      <div
        style={satoriBox({
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #e4e4e7',
          paddingTop: 28,
        })}
      >
        <div style={satoriBox({ fontSize: 26, color: '#71717a', fontWeight: 500 })}>
          Now hiring
        </div>
        <div style={satoriBox({ fontSize: 26, color: '#09090b', fontWeight: 700 })}>
          {siteDomain}
          {path}
        </div>
      </div>
    </div>
  );
}
