import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Timezone Overlap Tool | Find Shared Work Hours';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const zones = [
    { city: 'New York', tz: 'EST', hours: '9am - 5pm', color: '#3b82f6' },
    { city: 'London', tz: 'GMT', hours: '2pm - 10pm', color: '#8b5cf6' },
    { city: 'Bangkok', tz: 'ICT', hours: '9pm - 5am', color: '#f59e0b' },
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
            Timezone Overlap
          </div>
          <div style={{ display: 'flex', fontSize: 24, fontWeight: 500, color: '#71717a' }}>
            Find shared work hours across timezones
          </div>
        </div>

        {/* Timezone cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {zones.map((z) => (
            <div key={z.city} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 12, padding: '16px 24px', gap: 16 }}>
              <div style={{ display: 'flex', width: 8, height: 40, backgroundColor: z.color, borderRadius: 4 }} />
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#09090b' }}>{z.city}</div>
                <div style={{ fontSize: 14, color: '#71717a', fontWeight: 500 }}>{z.tz}</div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#09090b' }}>{z.hours}</div>
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
