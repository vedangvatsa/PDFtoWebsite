import { ImageResponse } from 'next/og';

export const alt = 'Digital Nomad Resources | Insurance, Banking, eSIMs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const categories = [
    { icon: '🛡️', label: 'Insurance' },
    { icon: '🏦', label: 'Banking' },
    { icon: '📱', label: 'eSIMs' },
    { icon: '🔒', label: 'VPNs' },
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
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 800, color: '#09090b', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Nomad Resources
          </div>
          <div style={{ display: 'flex', fontSize: 24, fontWeight: 500, color: '#71717a', gap: 16 }}>
            <span>Insurance</span>
            <span style={{ display: 'flex', color: '#d4d4d8' }}>·</span>
            <span>Banking</span>
            <span style={{ display: 'flex', color: '#d4d4d8' }}>·</span>
            <span>eSIMs</span>
            <span style={{ display: 'flex', color: '#d4d4d8' }}>·</span>
            <span>VPNs</span>
          </div>
        </div>

        {/* Category cards 2x2 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
            {categories.slice(0, 2).map((c) => (
              <div key={c.label} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flex: 1, backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 12, padding: '20px 24px', gap: 16 }}>
                <div style={{ display: 'flex', fontSize: 36 }}>{c.icon}</div>
                <div style={{ display: 'flex', fontSize: 22, fontWeight: 700, color: '#09090b' }}>{c.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
            {categories.slice(2, 4).map((c) => (
              <div key={c.label} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flex: 1, backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 12, padding: '20px 24px', gap: 16 }}>
                <div style={{ display: 'flex', fontSize: 36 }}>{c.icon}</div>
                <div style={{ display: 'flex', fontSize: 22, fontWeight: 700, color: '#09090b' }}>{c.label}</div>
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
