import type { ReactNode } from 'react';

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
 * Every box must keep display:'flex' (Satori requirement).
 */
export function OgToolFrame({
  title,
  subtitle,
  children,
  layout = 'stack',
  titleSize = 56,
}: OgToolFrameProps) {
  const spread = layout === 'spread';
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: '#fafafa',
        fontFamily: 'sans-serif',
        padding: spread ? '60px 80px' : '48px 64px',
        position: 'relative',
        justifyContent: spread ? 'space-between' : undefined,
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: 14,
          fontWeight: 600,
          color: '#a1a1aa',
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
        }}
      >
        CVin.Bio
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          marginTop: spread ? 0 : 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: titleSize,
            fontWeight: 800,
            color: '#09090b',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              fontWeight: 500,
              color: '#71717a',
              marginTop: spread ? 0 : 4,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
      {children}
      {spread ? (
        <div style={{ display: 'flex', width: '100%', height: 4, backgroundColor: '#09090b', borderRadius: 2 }} />
      ) : (
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: '#09090b',
          }}
        />
      )}
    </div>
  );
}
