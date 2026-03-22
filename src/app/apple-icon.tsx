import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Route segment config
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#ffffff',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="120"
          height="120"
          viewBox="-2 -2 28 28"
          fill="none"
          stroke="#18181b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
