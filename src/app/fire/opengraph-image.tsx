import { ImageResponse } from 'next/og';
import { OgToolFrame, OG_TOOL_SIZE, OG_TOOL_CONTENT_TYPE } from '@/components/og/tool-frame';

export const alt = 'FIRE Calculator | Savings Runway by City';
export const size = OG_TOOL_SIZE;
export const contentType = OG_TOOL_CONTENT_TYPE;

export default function Image() {
  const cities = [
    { name: 'Bangkok', months: 48 },
    { name: 'Lisbon', months: 24 },
    { name: 'Bali', months: 45 },
  ];

  return new ImageResponse(
    (
      <OgToolFrame title="FIRE Calculator" subtitle="How long will your savings last in each city?">
        <div style={{ display: 'flex', gap: 24, marginTop: 40 }}>
          {cities.map((city) => (
            <div
              key={city.name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#ffffff',
                border: '1px solid #e4e4e7',
                borderRadius: 16,
                padding: '28px 36px',
                minWidth: 200,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#71717a',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                }}
              >
                {city.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 8, gap: 6 }}>
                <span style={{ display: 'flex', fontSize: 48, fontWeight: 800, color: '#09090b' }}>
                  {city.months}
                </span>
                <span style={{ display: 'flex', fontSize: 20, color: '#a1a1aa', fontWeight: 500 }}>
                  mo
                </span>
              </div>
            </div>
          ))}
        </div>
      </OgToolFrame>
    ),
    { ...size }
  );
}
