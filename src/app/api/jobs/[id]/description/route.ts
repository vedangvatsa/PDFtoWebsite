import { NextRequest, NextResponse } from 'next/server';
import { fetchJobById } from '@/lib/job-detail-data';
import { isThinJobPage } from '@/lib/job-apply-source';
import { jobDescriptionPlainText } from '@/lib/job-description';

export const runtime = 'nodejs';

const MAX_ATS_BYTES = 1_500_000;
const MAX_DESCRIPTION_CHARS = 12_000;

function extractText(html: string): string {
  return jobDescriptionPlainText(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
      .replace(/<svg[\s\S]*?<\/svg>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<form[\s\S]*?<\/form>/gi, '')
  ).slice(0, MAX_DESCRIPTION_CHARS);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = await fetchJobById(id);
  if (!job || !isThinJobPage(job)) {
    return NextResponse.json({ error: 'Job details are unavailable' }, { status: 404 });
  }

  let url: URL;
  try {
    url = new URL(job.apply_url);
  } catch {
    return NextResponse.json({ error: 'Employer listing is unavailable' }, { status: 404 });
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return NextResponse.json({ error: 'Employer listing is unavailable' }, { status: 404 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9',
        'User-Agent': 'CVinBioJobPreview/1.0 (+https://cvin.bio)',
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    if (!response.ok) {
      return NextResponse.json({ error: 'Employer listing is unavailable' }, { status: 502 });
    }
    const length = Number(response.headers.get('content-length') || 0);
    if (length > MAX_ATS_BYTES) {
      return NextResponse.json({ error: 'Employer listing is too large' }, { status: 413 });
    }
    const description = extractText(await response.text());
    if (description.length < 120) {
      return NextResponse.json({ error: 'Employer details are unavailable' }, { status: 404 });
    }
    return NextResponse.json(
      { description },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
    );
  } catch {
    return NextResponse.json({ error: 'Employer listing is unavailable' }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
