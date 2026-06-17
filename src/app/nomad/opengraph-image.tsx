import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Digital Nomad Directory — 100 Cities in 56 Countries';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const cities = [
    { name: 'Bangkok', flag: '🇹🇭', score: 97 },
    { name: 'Lisbon', flag: '🇵🇹', score: 95 },
    { name: 'Canggu', flag: '🇮🇩', score: 94 },
    { name: 'Medellín', flag: '🇨🇴', score: 93 },
    { name: 'Mexico City', flag: '🇲🇽', score: 92 },
    { name: 'Chiang Mai', flag: '🇹🇭', score: 91 },
  ];

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

        {/* Middle: Title + Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', fontSize: 72, fontWeight: 800, color: '#09090b', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Digital Nomad Directory
          </div>
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 500, color: '#71717a', gap: 24 }}>
            <span>100 cities</span>
            <span style={{ color: '#d4d4d8' }}>·</span>
            <span>52 countries</span>
            <span style={{ color: '#d4d4d8' }}>·</span>
            <span>Quality scored</span>
          </div>
        </div>

        {/* Bottom: City card grid — 2 rows × 3 cols */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
            {cities.slice(0, 3).map((c) => (
              <div key={c.name} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1, backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 12, padding: '20px 24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 16, color: '#71717a', fontWeight: 600 }}>{c.flag} {c.name}</div>
                  <div style={{ fontSize: 20, color: '#09090b', fontWeight: 700, marginTop: 4 }}>Nomad Score</div>
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#09090b' }}>{c.score}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
            {cities.slice(3, 6).map((c) => (
              <div key={c.name} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1, backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 12, padding: '20px 24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 16, color: '#71717a', fontWeight: 600 }}>{c.flag} {c.name}</div>
                  <div style={{ fontSize: 20, color: '#09090b', fontWeight: 700, marginTop: 4 }}>Nomad Score</div>
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#09090b' }}>{c.score}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', width: '100%', height: 4, backgroundColor: '#09090b', borderRadius: 2 }} />
      </div>
    ),
    { ...size }
  );
}
