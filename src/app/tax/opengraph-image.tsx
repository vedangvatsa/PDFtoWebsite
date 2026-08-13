import { ImageResponse } from 'next/og';
import { OgToolFrame, OG_TOOL_SIZE, OG_TOOL_CONTENT_TYPE } from '@/components/og/tool-frame';

export const alt = 'Nomad Tax Comparison | Tax Rates by Country';
export const size = OG_TOOL_SIZE;
export const contentType = OG_TOOL_CONTENT_TYPE;

export default function Image() {
  const countries = [
    { flag: '🇵🇹', name: 'Portugal', rate: '20%' },
    { flag: '🇪🇸', name: 'Spain', rate: '24%' },
    { flag: '🇩🇪', name: 'Germany', rate: '42%' },
  ];

  return new ImageResponse(
    (
      <OgToolFrame title="Nomad Tax Comparison" titleSize={52} subtitle="Tax rates by country for remote workers">
        <div style={{ display: 'flex', gap: 24, marginTop: 48 }}>
          {countries.map((country) => (
            <div
              key={country.name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                border: '1px solid #e4e4e7',
                borderRadius: 16,
                padding: '32px 48px',
                minWidth: 200,
              }}
            >
              <div style={{ display: 'flex', fontSize: 48 }}>{country.flag}</div>
              <div style={{ display: 'flex', fontSize: 20, fontWeight: 600, color: '#09090b', marginTop: 12 }}>
                {country.name}
              </div>
              <div style={{ display: 'flex', fontSize: 36, fontWeight: 700, color: '#09090b', marginTop: 8 }}>
                {country.rate}
              </div>
            </div>
          ))}
        </div>
      </OgToolFrame>
    ),
    { ...size }
  );
}
