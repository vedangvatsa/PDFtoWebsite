import { ImageResponse } from 'next/og';

export const alt = 'Schengen Calculator | 90/180 Day Rule Tracker';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
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
        {/* Top: Label */}
        <div style={{ display: 'flex', fontSize: 14, fontWeight: 600, color: '#a1a1aa', letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>
          CVin.Bio
        </div>

        {/* Middle: Title + Subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 800, color: '#09090b', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Schengen Calculator
          </div>
          <div style={{ display: 'flex', fontSize: 24, fontWeight: 500, color: '#71717a', gap: 16 }}>
            <span>90/180 day rule tracker</span>
            <span style={{ display: 'flex', color: '#d4d4d8' }}>·</span>
            <span>Plan your Europe stays</span>
          </div>
        </div>

        {/* Stats cards */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 12, padding: '24px' }}>
            <div style={{ display: 'flex', fontSize: 14, color: '#71717a', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Days Used</div>
            <div style={{ display: 'flex', fontSize: 48, fontWeight: 800, color: '#09090b', marginTop: 8 }}>45</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 12, padding: '24px' }}>
            <div style={{ display: 'flex', fontSize: 14, color: '#71717a', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Days Left</div>
            <div style={{ display: 'flex', fontSize: 48, fontWeight: 800, color: '#16a34a', marginTop: 8 }}>45</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 12, padding: '24px' }}>
            <div style={{ display: 'flex', fontSize: 14, color: '#71717a', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Window Resets</div>
            <div style={{ display: 'flex', fontSize: 48, fontWeight: 800, color: '#09090b', marginTop: 8 }}>Sep 15</div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', width: '100%', height: 4, backgroundColor: '#09090b', borderRadius: 2 }} />
      </div>
    ),
    { ...size }
  );
}
