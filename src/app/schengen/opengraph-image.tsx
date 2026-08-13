import { ImageResponse } from 'next/og';
import { OgToolFrame, OG_TOOL_SIZE, OG_TOOL_CONTENT_TYPE } from '@/components/og/tool-frame';

export const alt = 'Schengen Calculator | 90/180 Day Rule Tracker';
export const size = OG_TOOL_SIZE;
export const contentType = OG_TOOL_CONTENT_TYPE;

export default async function Image() {
  return new ImageResponse(
    (
      <OgToolFrame
        layout="spread"
        titleSize={64}
        title="Schengen Calculator"
        subtitle={
          <div style={{ display: 'flex', fontSize: 24, fontWeight: 500, color: '#71717a', gap: 16 }}>
            <span>90/180 day rule tracker</span>
            <span style={{ display: 'flex', color: '#d4d4d8' }}>·</span>
            <span>Plan your Europe stays</span>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'row', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 12, padding: '24px' }}>
            <div style={{ display: 'flex', fontSize: 14, color: '#71717a', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Days Used</div>
            <div style={{ display: 'flex', fontSize: 48, fontWeight: 800, color: '#09090b', marginTop: 8 }}>45</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 12, padding: '24px' }}>
            <div style={{ display: 'flex', fontSize: 14, color: '#71717a', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Days Left</div>
            <div style={{ display: 'flex', fontSize: 48, fontWeight: 800, color: '#16a34a', marginTop: 8 }}>45</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 12, padding: '24px' }}>
            <div style={{ display: 'flex', fontSize: 14, color: '#71717a', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Window Resets</div>
            <div style={{ display: 'flex', fontSize: 48, fontWeight: 800, color: '#09090b', marginTop: 8 }}>Sep 15</div>
          </div>
        </div>
      </OgToolFrame>
    ),
    { ...size }
  );
}
