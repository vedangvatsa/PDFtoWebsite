import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// 1x1 transparent GIF
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

const LOG_PATH = join(process.cwd(), '.github/scripts/ses-track-log.json');

function appendLog(entry: Record<string, unknown>) {
  let logs: Record<string, unknown>[] = [];
  try {
    if (existsSync(LOG_PATH)) {
      logs = JSON.parse(readFileSync(LOG_PATH, 'utf8'));
    }
  } catch {}
  logs.push({ ...entry, timestamp: new Date().toISOString() });
  writeFileSync(LOG_PATH, JSON.stringify(logs, null, 2));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action'); // 'open' or 'click'
  const cid = searchParams.get('cid') || '';
  const email = searchParams.get('email') || '';
  const url = searchParams.get('url') || '';

  appendLog({ action, campaign: cid, email: decodeURIComponent(email) });

  if (action === 'click' && url) {
    return NextResponse.redirect(url, 302);
  }

  // Return 1x1 transparent GIF for open tracking
  return new NextResponse(PIXEL, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  });
}
