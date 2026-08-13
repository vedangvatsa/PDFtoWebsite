import { ImageResponse } from 'next/og';
import { OgToolFrame, OG_TOOL_SIZE, OG_TOOL_CONTENT_TYPE } from '@/components/og/tool-frame';

export const alt = 'Cost of Living for Digital Nomads | 100 Cities Compared';
export const size = OG_TOOL_SIZE;
export const contentType = OG_TOOL_CONTENT_TYPE;

export default async function Image() {
  const cities = [
    { name: 'Bangkok', flag: '🇹🇭', cost: '$1,100/mo' },
    { name: 'Lisbon', flag: '🇵🇹', cost: '$2,100/mo' },
    { name: 'Bali', flag: '🇮🇩', cost: '$1,100/mo' },
  ];

  return new ImageResponse(
    (
      <OgToolFrame
        layout="spread"
        titleSize={72}
        title="Cost of Living"
        subtitle={
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 500, color: '#71717a', gap: 24 }}>
            <span>100 cities</span>
            <span style={{ display: 'flex', color: '#d4d4d8' }}>·</span>
            <span>Rent</span>
            <span style={{ display: 'flex', color: '#d4d4d8' }}>·</span>
            <span>Food</span>
            <span style={{ display: 'flex', color: '#d4d4d8' }}>·</span>
            <span>Coworking</span>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
          {cities.map((c) => (
            <div key={c.name} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1, backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 12, padding: '20px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', fontSize: 16, color: '#71717a', fontWeight: 600 }}>{`${c.flag} ${c.name}`}</div>
                <div style={{ display: 'flex', fontSize: 20, color: '#09090b', fontWeight: 700, marginTop: 4 }}>Total Cost</div>
              </div>
              <div style={{ display: 'flex', fontSize: 32, fontWeight: 800, color: '#09090b' }}>{c.cost}</div>
            </div>
          ))}
        </div>
      </OgToolFrame>
    ),
    { ...size }
  );
}
