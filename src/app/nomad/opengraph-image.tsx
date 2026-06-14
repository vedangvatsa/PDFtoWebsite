import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Digital Nomad Directory — 95 Cities in 52 Countries';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const cities = ['Bangkok', 'Lisbon', 'Bali', 'Medellín', 'Mexico City', 'Chiang Mai', 'Barcelona', 'Budapest', 'Tbilisi', 'Ho Chi Minh'];
  const flags = ['🇹🇭', '🇵🇹', '🇮🇩', '🇨🇴', '🇲🇽', '🇹🇭', '🇪🇸', '🇭🇺', '🇬🇪', '🇻🇳'];

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#fafafa',
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(20,184,166,0.08) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(99,102,241,0.06) 0%, transparent 50%)',
          color: '#09090b',
          fontFamily: 'sans-serif',
          padding: '60px 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top: Site name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', fontSize: 20, fontWeight: 600, color: '#a1a1aa', letterSpacing: '0.05em' }}>
            cvin.bio/nomad
          </div>
        </div>

        {/* Main title */}
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 32, gap: 8 }}>
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#09090b' }}>
            Digital Nomad
          </div>
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#0d9488' }}>
            Directory
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: 48, marginTop: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', fontSize: 48, fontWeight: 800, color: '#0d9488' }}>95</div>
            <div style={{ display: 'flex', fontSize: 16, color: '#71717a', fontWeight: 500 }}>Cities</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', fontSize: 48, fontWeight: 800, color: '#0d9488' }}>52</div>
            <div style={{ display: 'flex', fontSize: 16, color: '#71717a', fontWeight: 500 }}>Countries</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', fontSize: 48, fontWeight: 800, color: '#0d9488' }}>6</div>
            <div style={{ display: 'flex', fontSize: 16, color: '#71717a', fontWeight: 500 }}>Continents</div>
          </div>
        </div>

        {/* City chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 40 }}>
          {cities.map((city, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999, backgroundColor: '#ffffff', border: '1px solid #e4e4e7', fontSize: 15, fontWeight: 500, color: '#3f3f46', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              {flags[i]} {city}
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', borderRadius: 999, backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', fontSize: 15, fontWeight: 600, color: '#0d9488' }}>
            +85 more
          </div>
        </div>

        {/* Bottom: Subtitle */}
        <div style={{ display: 'flex', position: 'absolute', bottom: 50, left: 80, fontSize: 18, color: '#a1a1aa', fontWeight: 400 }}>
          Coliving · Coworking · Hostels · Apartments · Quality Scored
        </div>
      </div>
    ),
    { ...size }
  );
}
