import type { CSSProperties } from 'react';

/**
 * @vercel/og / Satori calls `.trim()` on style values during prerender.
 * `undefined` / `null` / NaN in a style object crash static OG generation
 * (`Cannot read properties of undefined (reading 'trim')`).
 */
export function satoriStyle(style: CSSProperties): CSSProperties {
  const out: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(style)) {
    if (value === undefined || value === null || value === false) continue;
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) continue;
      out[key] = value;
      continue;
    }
    if (typeof value === 'string') {
      out[key] = value;
    }
  }
  return out as CSSProperties;
}

/** Satori requires `display:'flex'` on every box. */
export function satoriBox(style: Omit<CSSProperties, 'display'> = {}): CSSProperties {
  return satoriStyle({ display: 'flex', ...style });
}
