import { gzipSync, gunzipSync } from 'node:zlib';

export const CACHE_SLOT_BYTES = 131_072;
const MAX_DECODED_BYTES = 2_000_000;
const GZIP_PREFIX = 'gzip:';

/** Keep large HTML refreshes inside the fixed D1 slot budget. */
export function encodeCacheValue(value: unknown): string | null {
  const json = JSON.stringify(value);
  if (typeof json !== 'string') return null;
  const bytes = Buffer.byteLength(json, 'utf8');
  if (bytes <= CACHE_SLOT_BYTES) return json;
  if (bytes > MAX_DECODED_BYTES) return null;
  const encoded = GZIP_PREFIX + gzipSync(json, { level: 1 }).toString('base64');
  return Buffer.byteLength(encoded, 'utf8') <= CACHE_SLOT_BYTES ? encoded : null;
}

export function decodeCacheValue(value: string): unknown {
  const json = value.startsWith(GZIP_PREFIX)
    ? gunzipSync(Buffer.from(value.slice(GZIP_PREFIX.length), 'base64'), { maxOutputLength: MAX_DECODED_BYTES }).toString('utf8')
    : value;
  return JSON.parse(json);
}
