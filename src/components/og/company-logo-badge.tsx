import { satoriStyle } from '@/lib/satori-style';

type CompanyLogoBadgeProps = {
  logoSrc: string | null;
  size?: number;
};

/** Company logo tile for next/og ImageResponse cards. */
export function CompanyLogoBadge({ logoSrc, size = 88 }: CompanyLogoBadgeProps) {
  if (!logoSrc) return <div style={satoriStyle({ display: 'flex' })} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoSrc}
      alt=""
      width={size}
      height={size}
      style={satoriStyle({
        width: size,
        height: size,
        borderRadius: 9999,
        objectFit: 'cover',
        backgroundColor: '#ffffff',
        border: '1px solid #e4e4e7',
      })}
    />
  );
}
