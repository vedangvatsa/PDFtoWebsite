import { ImageResponse } from 'next/og';
import { OgToolFrame, OG_TOOL_SIZE, OG_TOOL_CONTENT_TYPE } from '@/components/og/tool-frame';

export const alt = 'Timezone Overlap Tool | Find Shared Work Hours';
export const size = OG_TOOL_SIZE;
export const contentType = OG_TOOL_CONTENT_TYPE;

export default async function Image() {
  const zones = [
    { city: 'New York', tz: 'EST', hours: '9am - 5pm', color: '#3b82f6' },
    { city: 'London', tz: 'GMT', hours: '2pm - 10pm', color: '#8b5cf6' },
    { city: 'Bangkok', tz: 'ICT', hours: '9pm - 5am', color: '#f59e0b' },
  ];

  return new ImageResponse(
    (
      <OgToolFrame
        layout="spread"
        titleSize={64}
        title="Timezone Overlap"
        subtitle="Find shared work hours across timezones"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {zones.map((z) => (
            <div key={z.city} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 12, padding: '16px 24px', gap: 16 }}>
              <div style={{ display: 'flex', width: 8, height: 40, backgroundColor: z.color, borderRadius: 4 }} />
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', fontSize: 20, fontWeight: 700, color: '#09090b' }}>{z.city}</div>
                <div style={{ display: 'flex', fontSize: 14, color: '#71717a', fontWeight: 500 }}>{z.tz}</div>
              </div>
              <div style={{ display: 'flex', fontSize: 20, fontWeight: 600, color: '#09090b' }}>{z.hours}</div>
            </div>
          ))}
        </div>
      </OgToolFrame>
    ),
    { ...size }
  );
}
