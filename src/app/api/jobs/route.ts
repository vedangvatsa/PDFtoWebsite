import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const type = searchParams.get('type'); // full_time, contract, etc.
  const loc = searchParams.get('loc');   // remote, hybrid, onsite
  const q = searchParams.get('q')?.toLowerCase().trim();
  const offset = (page - 1) * limit;

  // Try to get authenticated user's profile for matching
  let userSkills: string[] = [];
  let profileComplete = false;
  try {
    const anonClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => request.cookies.getAll().map(c => ({ name: c.name, value: c.value })) } }
    );
    const { data: { user } } = await anonClient.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('skills, profile_picture_url, about, experience, education, links')
        .eq('id', user.id)
        .single();
      userSkills = profile?.skills || [];
      // Profile is "complete" for matching if they have a summary and skills
      if (profile) {
        const hasSummary = !!profile.about;
        const hasSkills = userSkills.length > 0;
        profileComplete = hasSummary && hasSkills;
      }
    }
  } catch (_) {
    // Not authenticated — show all jobs unfiltered
  }

  // Build query
  let query = supabase
    .from('jobs')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false, nullsFirst: false });

  // Filter by job type
  if (type && type !== 'all') {
    query = query.eq('job_type', type);
  }

  // Filter by location type
  if (loc === 'remote') {
    query = query.or('location.ilike.%remote%,location.ilike.%anywhere%,location.ilike.%distributed%,location.ilike.%worldwide%');
  } else if (loc === 'onsite') {
    query = query.not('location', 'ilike', '%remote%');
  }

  // Search by keyword in title or company
  if (q) {
    query = query.or(`title.ilike.%${q}%,company.ilike.%${q}%`);
  }

  // If user has complete profile AND match=true, filter to jobs that overlap with their skills
  const matchOnly = searchParams.get('match') === 'true';
  if (profileComplete && userSkills.length > 0 && matchOnly && !q) {
    query = query.overlaps('tags', userSkills);
  }

  // Paginate
  query = query.range(offset, offset + limit - 1);

  const { data: jobs, error, count } = await query;

  if (error) {
    console.error('Jobs query error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }

  // Calculate matched skills per job
  const jobsWithMatches = (jobs || []).map(job => {
    const matchedSkills = userSkills.filter(skill =>
      job.tags?.some((tag: string) => tag.toLowerCase() === skill.toLowerCase())
    );
    return {
      id: job.id,
      title: job.title,
      company: job.company,
      company_logo: job.company_logo,
      location: job.location,
      job_type: job.job_type,
      salary: job.salary,
      tags: job.tags || [],
      apply_url: job.apply_url,
      category: job.category,
      source: job.source,
      published_at: job.published_at,
      matched_skills: matchedSkills,
      match_count: matchedSkills.length,
    };
  });

  // Sort: highest match count first if user is authenticated
  if (userSkills.length > 0) {
    jobsWithMatches.sort((a, b) => b.match_count - a.match_count);
  }

  return NextResponse.json({
    jobs: jobsWithMatches,
    total: count || 0,
    page,
    limit,
    hasMore: offset + limit < (count || 0),
    userSkills,
    profileComplete,
  });
}
