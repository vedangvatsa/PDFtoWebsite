import { ImageResponse } from 'next/og';

export const alt = 'Cost of Living for Digital Nomads | 100 Cities Compared';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const cities = [
    { name: 'Bangkok', flag: '🇹🇭', cost: '$1,100/mo' },
    { name: 'Lisbon', flag: '🇵🇹', cost: '$2,100/mo' },
    { name: 'Bali', flag: '🇮🇩', cost: '$1,100/mo' },
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

        {/* Middle: Title + Subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', fontSize: 72, fontWeight: 800, color: '#09090b', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Cost of Living
          </div>
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 500, color: '#71717a', gap: 24 }}>
            <span>100 cities</span>
            <span style={{ display: 'flex', color: '#d4d4d8' }}>·</span>
            <span>Rent</span>
            <span style={{ display: 'flex', color: '#d4d4d8' }}>·</span>
            <span>Food</span>
            <span style={{ display: 'flex', color: '#d4d4d8' }}>·</span>
            <span>Coworking</span>
          </div>
        </div>

        {/* Bottom: City cost cards — 1 row × 3 cols */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
          {cities.map((c) => (
            <div key={c.name} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1, backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 12, padding: '20px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', fontSize: 16, color: '#71717a', fontWeight: 600 }}>{`${c.flag} ${c.name}`}</div>
                <div style={{ display: 'flex', fontSize: 20, color: '#09090b', fontWeight: 700, marginTop: 4 }}>Total Cost</div>
              </div>
              <div style={{ display: 'flex', fontSize: 32, fontWeight: 800, color: '#09090b' }}>{c.cost}</div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', width: '100%', height: 4, backgroundColor: '#09090b', borderRadius: 2 }} />
      </div>
    ),
    { ...size }
  );
}
