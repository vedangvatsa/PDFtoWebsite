import { ImageResponse } from 'next/og';
import { OgToolFrame, OG_TOOL_SIZE, OG_TOOL_CONTENT_TYPE } from '@/components/og/tool-frame';

export const alt = 'City Rankings | Internet, Safety and Walkability';
export const size = OG_TOOL_SIZE;
export const contentType = OG_TOOL_CONTENT_TYPE;

export default function Image() {
  const rankings = [
    { rank: 1, city: 'Tokyo', speed: '320 Mbps' },
    { rank: 2, city: 'Seoul', speed: '290 Mbps' },
    { rank: 3, city: 'Taipei', speed: '250 Mbps' },
  ];

  return new ImageResponse(
    (
      <OgToolFrame title="City Rankings" subtitle="Internet · Safety · Walkability">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 40 }}>
          {rankings.map((item) => (
            <div
              key={item.rank}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#ffffff',
                border: '1px solid #e4e4e7',
                borderRadius: 12,
                padding: '16px 28px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 9999,
                    backgroundColor: '#09090b',
                    color: '#ffffff',
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  {item.rank}
                </div>
                <div style={{ display: 'flex', fontSize: 28, fontWeight: 600, color: '#09090b' }}>
                  {item.city}
                </div>
              </div>
              <div style={{ display: 'flex', fontSize: 22, fontWeight: 500, color: '#71717a' }}>
                {item.speed}
              </div>
            </div>
          ))}
        </div>
      </OgToolFrame>
    ),
    { ...size }
  );
}
