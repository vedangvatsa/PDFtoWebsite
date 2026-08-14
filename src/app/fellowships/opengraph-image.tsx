import { ImageResponse } from 'next/og';

export const revalidate = 3600;

export const alt = 'CVin.Bio | Open Fellowships';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const cards = [
    { company: 'NASA', title: 'MUREP / GEM Fellowship' },
    { company: 'IISc', title: 'AI Postdoctoral Fellowship' },
    { company: 'ERA', title: 'AI Fellowship' },
    { company: 'Anthropic', title: 'Alignment Fellowship' },
    { company: 'Apple', title: 'AIML Residency' },
    { company: 'Horizon', title: 'Public Service Fellowship' },
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
        <div style={{ display: 'flex', fontSize: 14, fontWeight: 600, color: '#a1a1aa', letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>
          CVin.Bio
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', fontSize: 72, fontWeight: 800, color: '#09090b', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Open Fellowships
          </div>
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 500, color: '#71717a', gap: 24 }}>
            <span>NASA · IISc · ERA · Anthropic</span>
            <span style={{ display: 'flex', color: '#d4d4d8' }}>·</span>
            <span>Updated daily</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
            {cards.slice(0, 3).map((c) => (
              <div key={c.company} style={{ display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 12, padding: '20px 24px' }}>
                <div style={{ display: 'flex', fontSize: 16, color: '#71717a', fontWeight: 600 }}>{c.company}</div>
                <div style={{ display: 'flex', fontSize: 20, color: '#09090b', fontWeight: 700, marginTop: 4 }}>{c.title}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
            {cards.slice(3, 6).map((c) => (
              <div key={c.company} style={{ display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 12, padding: '20px 24px' }}>
                <div style={{ display: 'flex', fontSize: 16, color: '#71717a', fontWeight: 600 }}>{c.company}</div>
                <div style={{ display: 'flex', fontSize: 20, color: '#09090b', fontWeight: 700, marginTop: 4 }}>{c.title}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', width: '100%', height: 4, backgroundColor: '#09090b', borderRadius: 2 }} />
      </div>
    ),
    { ...size }
  );
}
