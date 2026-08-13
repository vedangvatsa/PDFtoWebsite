import type { ReactNode } from 'react';
import { satoriBox, satoriStyle } from '@/lib/satori-style';

export const OG_TOOL_SIZE = { width: 1200, height: 630 };
export const OG_TOOL_CONTENT_TYPE = 'image/png';

type OgToolFrameProps = {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  /** Default matches stacked tool cards; use spread for title+cards+bar layouts. */
  layout?: 'stack' | 'spread';
  titleSize?: number;
};

/**
 * Shared Satori chrome for nomad/tool Open Graph images.
 * Styles go through satoriStyle so undefined keys cannot reach @vercel/og.
 */
export function OgToolFrame({
  title,
  subtitle,
  children,
  layout = 'stack',
  titleSize = 56,
}: OgToolFrameProps) {
  const spread = layout === 'spread';
  const rootStyle = satoriStyle({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#fafafa',
    fontFamily: 'sans-serif',
    padding: spread ? '60px 80px' : '48px 64px',
    position: 'relative',
    ...(spread ? { justifyContent: 'space-between' as const } : {}),
  });

  const headingStyle = satoriStyle({
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    ...(spread ? {} : { marginTop: 24 }),
  });

  const subtitleStyle = satoriStyle({
    display: 'flex',
    fontSize: 24,
    fontWeight: 500,
    color: '#71717a',
    ...(spread ? {} : { marginTop: 4 }),
  });

  return (
    <div style={rootStyle}>
      <div
        style={satoriBox({
          fontSize: 14,
          fontWeight: 600,
          color: '#a1a1aa',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        })}
      >
        CVin.Bio
      </div>
      <div style={headingStyle}>
        <div
          style={satoriBox({
            fontSize: titleSize,
            fontWeight: 800,
            color: '#09090b',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          })}
        >
          {title}
        </div>
        {subtitle ? (
          <div style={subtitleStyle}>{subtitle}</div>
        ) : (
          <div style={satoriBox({ height: 0 })} />
        )}
      </div>
      {children}
      {spread ? (
        <div style={satoriBox({ width: '100%', height: 4, backgroundColor: '#09090b', borderRadius: 2 })} />
      ) : (
        <div
          style={satoriStyle({
            display: 'flex',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: '#09090b',
          })}
        />
      )}
    </div>
  );
}
