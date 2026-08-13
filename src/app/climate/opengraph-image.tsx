import { ImageResponse } from 'next/og';
import { OgToolFrame, OG_TOOL_SIZE, OG_TOOL_CONTENT_TYPE } from '@/components/og/tool-frame';

export const alt = 'Climate Finder | Best Weather for Nomads by Month';
export const size = OG_TOOL_SIZE;
export const contentType = OG_TOOL_CONTENT_TYPE;

const cities = [
  { name: 'Lisbon', flag: '🇵🇹', temp: '22°C', condition: 'Sunny' },
  { name: 'Chiang Mai', flag: '🇹🇭', temp: '28°C', condition: 'Dry' },
  { name: 'Medellín', flag: '🇨🇴', temp: '24°C', condition: 'Spring' },
];

export default function Image() {
  return new ImageResponse(
    (
      <OgToolFrame
        title="Climate Finder"
        subtitle="Temperature · Humidity · Rainfall · By month"
      >
        <div style={{ display: 'flex', gap: 24, marginTop: 48 }}>
          {cities.map((city) => (
            <div
              key={city.name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                border: '1px solid #e4e4e7',
                borderRadius: 16,
                padding: '32px 40px',
                width: 320,
              }}
            >
              <span style={{ display: 'flex', fontSize: 48 }}>{city.flag}</span>
              <span style={{ display: 'flex', fontSize: 22, fontWeight: 700, color: '#09090b', marginTop: 12 }}>
                {city.name}
              </span>
              <span style={{ display: 'flex', fontSize: 36, fontWeight: 700, color: '#09090b', marginTop: 8 }}>
                {city.temp}
              </span>
              <span style={{ display: 'flex', fontSize: 16, color: '#71717a', marginTop: 4 }}>
                {city.condition}
              </span>
            </div>
          ))}
        </div>
      </OgToolFrame>
    ),
    { ...size }
  );
}
