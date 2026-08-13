import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createAnonFromRequest } from '@/utils/supabase/anon';
import { normalizeLocation } from '@/lib/normalize-location';
import { isJobId } from '@/lib/job-description';
import { publishSafeDescription } from '@/lib/job-detail-data';
import { isJobExpired } from '@/lib/job-age';
import { companyDisplayName } from '@/lib/company-directory';

const SELECT_COLS =
  'id,title,company,company_logo,location,job_type,salary,tags,apply_url,category,source,published_at,created_at,description,views,clicks';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!isJobId(id)) {
    return NextResponse.json({ error: 'Invalid job id' }, { status: 400 });
  }

  const { data: job, error } = await supabaseAdmin
    .from('jobs')
    .select(SELECT_COLS)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Job detail query error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  // Auth + profile for soft conversion signals
  let userSkills: string[] = [];
  let profileComplete = false;
  let isAuthenticated = false;
  try {
    const anonClient = createAnonFromRequest(request);
    const {
      data: { user },
    } = await anonClient.auth.getUser();
    if (user) {
      isAuthenticated = true;
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('skills, about')
        .eq('id', user.id)
        .single();
      if (profile) {
        userSkills = (profile.skills || []).map((s: string) => s.trim()).filter(Boolean);
        profileComplete = !!profile.about && userSkills.length > 0;
      }
    }
  } catch {
    // anonymous
  }

  // Publish-safe: raw scraped bodies are never exposed — only AI-rewritten or
  // synthesized original content.
  const published = publishSafeDescription(job as any, normalizeLocation(job.location) || '');
  const descriptionHtml = published.html;
  const expired = isJobExpired(job.published_at, job.created_at);

  const response = NextResponse.json({
    job: {
      id: job.id,
      title: job.title,
      company: companyDisplayName(job.company, job.apply_url),
      company_logo: job.company_logo,
      location: normalizeLocation(job.location),
      job_type: job.job_type,
      salary: job.salary,
      tags: job.tags || [],
      apply_url: expired ? '' : job.apply_url,
      expired,
      category: job.category,
      source: job.source,
      published_at: job.published_at,
      description_html: descriptionHtml,
      has_description: true,
      description_kind: published.kind === 'company' ? 'company' : 'job',
      excerpt: published.plain.slice(0, 200),
      views: job.views ?? 0,
      clicks: job.clicks ?? 0,
    },
    userSkills,
    profileComplete,
    isAuthenticated,
  });

  response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=120');
  return response;
}
