import { ImageResponse } from 'next/og';
import { OgToolFrame, OG_TOOL_SIZE, OG_TOOL_CONTENT_TYPE } from '@/components/og/tool-frame';

export const alt = 'Compare Cities for Digital Nomads';
export const size = OG_TOOL_SIZE;
export const contentType = OG_TOOL_CONTENT_TYPE;

export default async function Image() {
  const left = { name: 'Bangkok', flag: '🇹🇭', cost: '$1,100/mo' };
  const right = { name: 'Lisbon', flag: '🇵🇹', cost: '$2,100/mo' };

  return new ImageResponse(
    (
      <OgToolFrame
        layout="spread"
        titleSize={72}
        title="Compare Cities"
        subtitle={
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 500, color: '#71717a', gap: 24 }}>
            <span>Cost</span>
            <span style={{ display: 'flex', color: '#d4d4d8' }}>·</span>
            <span>Weather</span>
            <span style={{ display: 'flex', color: '#d4d4d8' }}>·</span>
            <span>Internet</span>
            <span style={{ display: 'flex', color: '#d4d4d8' }}>·</span>
            <span>Side by side</span>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 24 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              backgroundColor: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: 16,
              padding: '32px 24px',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', fontSize: 48 }}>{left.flag}</div>
            <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, color: '#09090b' }}>{left.name}</div>
            <div style={{ display: 'flex', fontSize: 22, fontWeight: 600, color: '#71717a' }}>{left.cost}</div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#09090b',
              color: '#fafafa',
              fontSize: 22,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            VS
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              backgroundColor: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: 16,
              padding: '32px 24px',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', fontSize: 48 }}>{right.flag}</div>
            <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, color: '#09090b' }}>{right.name}</div>
            <div style={{ display: 'flex', fontSize: 22, fontWeight: 600, color: '#71717a' }}>{right.cost}</div>
          </div>
        </div>
      </OgToolFrame>
    ),
    { ...size }
  );
}
