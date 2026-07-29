import { ImageResponse } from 'next/og';

export const alt = 'Compare Cities for Digital Nomads';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const left = { name: 'Bangkok', flag: '🇹🇭', cost: '$1,100/mo' };
  const right = { name: 'Lisbon', flag: '🇵🇹', cost: '$2,100/mo' };

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
          <div style={{ display: 'flex', fontSize: 72, fontWeight: 800, color: '#09090b', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Compare Cities
          </div>
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 500, color: '#71717a', gap: 24 }}>
            <span>Cost</span>
            <span style={{ display: 'flex', color: '#d4d4d8' }}>·</span>
            <span>Weather</span>
            <span style={{ display: 'flex', color: '#d4d4d8' }}>·</span>
            <span>Internet</span>
            <span style={{ display: 'flex', color: '#d4d4d8' }}>·</span>
            <span>Side by side</span>
          </div>
        </div>

        {/* Comparison cards */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 24 }}>
          {/* Left city card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              backgroundColor: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: 16,
              padding: '32px 24px',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', fontSize: 48 }}>{left.flag}</div>
            <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, color: '#09090b' }}>{left.name}</div>
            <div style={{ display: 'flex', fontSize: 22, fontWeight: 600, color: '#71717a' }}>{left.cost}</div>
          </div>

          {/* VS badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#09090b',
              color: '#fafafa',
              fontSize: 22,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            VS
          </div>

          {/* Right city card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              backgroundColor: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: 16,
              padding: '32px 24px',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', fontSize: 48 }}>{right.flag}</div>
            <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, color: '#09090b' }}>{right.name}</div>
            <div style={{ display: 'flex', fontSize: 22, fontWeight: 600, color: '#71717a' }}>{right.cost}</div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', width: '100%', height: 4, backgroundColor: '#09090b', borderRadius: 2 }} />
      </div>
    ),
    { ...size }
  );
}
