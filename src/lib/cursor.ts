/**
 * Opaque pagination cursors for list endpoints.
 *
 * The wire format is base64url-encoded JSON ({ "o": <offset> }) so agents
 * treat it as an opaque token; the offset backing keeps server-side queries
 * simple and stable for the board's scored/interleaved ordering.
 */

export function encodeCursor(offset: number): string {
  return Buffer.from(JSON.stringify({ o: Math.max(0, Math.floor(offset)) })).toString('base64url');
}

/** Returns the decoded offset, or null when the cursor is malformed/foreign. */
export function decodeCursor(cursor: string): number | null {
  try {
    const parsed: unknown = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
    const o =
      typeof parsed === 'object' && parsed !== null ? (parsed as { o?: unknown }).o : undefined;
    if (typeof o !== 'number' || !Number.isInteger(o) || o < 0 || o > 1_000_000_000) return null;
    return o;
  } catch {
    return null;
  }
}
