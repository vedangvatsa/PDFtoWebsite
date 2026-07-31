type CompanyLogoBadgeProps = {
  logoSrc: string | null;
  size?: number;
};

/** Company logo tile for next/og ImageResponse cards. */
export function CompanyLogoBadge({ logoSrc, size = 88 }: CompanyLogoBadgeProps) {
  if (!logoSrc) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoSrc}
      alt=""
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        borderRadius: size >= 96 ? 18 : 16,
        objectFit: 'contain',
        backgroundColor: '#ffffff',
        border: '1px solid #e4e4e7',
      }}
    />
  );
}
