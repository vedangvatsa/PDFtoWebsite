import { ImageResponse } from 'next/og';
import { OgToolFrame, OG_TOOL_SIZE, OG_TOOL_CONTENT_TYPE } from '@/components/og/tool-frame';

export const alt = 'Nomad Visas | 50+ Visas and Visa Checker';
export const size = OG_TOOL_SIZE;
export const contentType = OG_TOOL_CONTENT_TYPE;

const visaCards = [
  { flag: '🇵🇹', name: 'Portugal D7 Visa' },
  { flag: '🇪🇸', name: 'Spain Digital Nomad' },
  { flag: '🇭🇷', name: 'Croatia DN Visa' },
];

export default function Image() {
  return new ImageResponse(
    (
      <OgToolFrame
        titleSize={64}
        title="Nomad Visas"
        subtitle="50+ digital nomad visas · Visa checker by passport"
      >
        <div style={{ display: 'flex', gap: 24, marginTop: 48 }}>
          {visaCards.map((visa) => (
            <div
              key={visa.name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                border: '1px solid #e4e4e7',
                borderRadius: 16,
                padding: '32px 36px',
                gap: 12,
                flex: 1,
              }}
            >
              <div style={{ display: 'flex', fontSize: 48 }}>{visa.flag}</div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#09090b',
                  textAlign: 'center' as const,
                }}
              >
                {visa.name}
              </div>
            </div>
          ))}
        </div>
      </OgToolFrame>
    ),
    { ...size }
  );
}
