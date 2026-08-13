import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { displayJobLocation } from '@/lib/normalize-location';
import { jobPublicPath, cleanJobTitle, isGarbageJobTitle, cleanSalaryDisplay, looksLikeFellowship } from '@/lib/job-description';
import { companyDisplayNameFromJob, isJunkCompanyName } from '@/lib/company-directory';
import { shouldListJobOnBoard, withCuratedJdTag } from '@/lib/job-apply-source';
import { PLATFORM_JOBS_TOTAL } from '@/lib/platform-job-count';
import { withTimeoutFallback, DB_BUDGET } from '@/lib/db-timeout';
import { createAnonFromRequest } from '@/utils/supabase/anon';
import {
  normalizeCompany,
  isNonEnglishTitle,
  sanitizeFilterTerm,
  computeMatchScore,
  guessCategory,
  normalizeMatchLocation,
  type MatchUserProfile,
} from '@/lib/job-match';

const supabase = supabaseAdmin;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const type = searchParams.get('type'); // full_time, contract, etc.
  const loc = searchParams.get('loc');   // remote, hybrid, onsite
  const q = sanitizeFilterTerm(searchParams.get('q')?.toLowerCase().trim() || '');
  const offset = (page - 1) * limit;

  // Try to get authenticated user's profile for matching
  let userProfile: MatchUserProfile | null = null;
  let profileComplete = false;
  try {
    const anonClient = createAnonFromRequest(request);
    const { data: { user } } = await anonClient.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('skills, profile_picture_url, about, experience, education, links')
        .eq('id', user.id)
        .single();
      if (profile) {
        const skills = (profile.skills || []).map((s: string) => sanitizeFilterTerm(s)).filter(Boolean);
        const links = profile.links || [];
        const location = links.find((l: any) => l.type === 'location')?.value || '';
        userProfile = {
          skills,
          experience: profile.experience || [],
          location,
          about: profile.about || '',
        };
        const hasSkills = skills.length > 0;
        const hasSummary = !!profile.about;
        profileComplete = hasSummary && hasSkills;
      }
    }
  } catch (_) {
    // Not authenticated — show all jobs unfiltered
  }

  // Build query — select only needed columns (skip description to reduce payload)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const boardSince = q ? ninetyDaysAgo : sixtyDaysAgo;
  const selectCols = 'id,title,company,company_logo,location,job_type,salary,tags,apply_url,category,source,published_at,created_at,external_id,slug';

  // Base filters shared by all queries
  function applyBaseFilters(q: any) {
    q = withCuratedJdTag(q);
    if (type && type !== 'all') q = q.eq('job_type', type);
    return q;
  }

  // --- Query 1: Remote + location-matched jobs (priority pool) ---
  let priorityFilter = 'location.ilike.%remote%,location.ilike.%anywhere%,location.ilike.%distributed%,location.ilike.%worldwide%';
  if (userProfile?.location) {
    const userLoc = normalizeMatchLocation(userProfile.location);
    if (!userLoc.isRemote && userLoc.tokens.length > 0) {
      priorityFilter += ',' + userLoc.tokens.map((t: string) => `location.ilike.%${sanitizeFilterTerm(t)}%`).join(',');
    }
  }

  let priorityQuery = supabase
    .from('jobs')
    .select(selectCols)
    .gt('created_at', thirtyDaysAgo)
    .or(priorityFilter)
    .order('published_at', { ascending: false, nullsFirst: false })
    .range(0, limit * 2 - 1);
  priorityQuery = applyBaseFilters(priorityQuery);

  // Unfiltered board: skip DB count (static total). Keyword search skips count
  // too — estimated count + ilike is what timed out and returned 0 engineers.
  const matchOnlyEarly = searchParams.get('match') === 'true';
  const needsDbCount = Boolean(
    (type && type !== 'all') || loc || matchOnlyEarly
  );

  // --- Query 2: All jobs (backfill pool) ---
  let query = withCuratedJdTag(
    supabase
      .from('jobs')
      .select(selectCols, needsDbCount ? { count: 'estimated' } : undefined)
      .gt('created_at', boardSince)
      .order('published_at', { ascending: false, nullsFirst: false })
  );

  // Filter by job type
  if (type && type !== 'all') {
    query = query.eq('job_type', type);
  }

  // Filter by location type (user-selected filter)
  if (loc === 'remote') {
    query = query.or('location.ilike.%remote%,location.ilike.%anywhere%,location.ilike.%distributed%,location.ilike.%worldwide%');
  } else if (loc === 'onsite') {
    query = query.not('location', 'ilike', '%remote%');
  }

  // Search by keyword in title or company
  if (q) {
    query = query.or(`title.ilike.%${q}%,company.ilike.%${q}%`);
  }

  // Unfiltered board: internships stay off unless asked. Fellowships are jobs —
  // many are stored as internship, so keep any row whose title/category is a fellowship.
  const qWantsIntern = /\b(intern|interns|internship)\b/i.test(q);
  const hideInternships = (!type || type === 'all') && (!q || !qWantsIntern);
  if (hideInternships) {
    const notInternOrIsFellow =
      'job_type.neq.internship,title.ilike.%fellow%,category.eq.fellowship';
    priorityQuery = priorityQuery.or(notInternOrIsFellow);
    query = query.or(notInternOrIsFellow);
  }

  // If user has complete profile AND match=true, filter to jobs that match their skills and location
  const matchOnly = searchParams.get('match') === 'true';
  if (profileComplete && userProfile && userProfile.skills.length > 0 && matchOnly && !q) {
    // Build OR filter: match tags overlap OR any skill appears in the title
    const titleFilters = userProfile.skills.map(s => `title.ilike.%${s}%`).join(',');
    query = query.or(`tags.ov.{${userProfile.skills.join(',')}},${titleFilters}`);

    // If candidate has a location (and is not purely 'remote'), ensure jobs match location or are remote
    if (userProfile.location) {
      const userLoc = normalizeMatchLocation(userProfile.location);
      if (!userLoc.isRemote && userLoc.tokens.length > 0) {
        const locFilters = [
          'location.ilike.%remote%',
          'location.ilike.%anywhere%',
          'location.ilike.%worldwide%',
          'location.ilike.%distributed%',
          ...userLoc.tokens.map((t: string) => `location.ilike.%${sanitizeFilterTerm(t)}%`)
        ].join(',');
        query = query.or(locFilters);
      }
    }
  }

  // Fetch a larger batch to allow company interleaving (3x is enough)
  const fetchLimit = limit * 3;
  query = query.range(offset, offset + fetchLimit - 1);

  // Run both queries in parallel with hard timeout — never hang the board.
  const timeoutResult = {
    data: [] as any[],
    error: { message: 'timeout', code: 'TIMEOUT' },
    count: null,
    status: 200,
    statusText: 'OK',
  } as any;
  const emptyResult = {
    data: [] as any[],
    error: null,
    count: null,
    status: 200,
    statusText: 'OK',
  } as any;
  const [priorityResult, mainResult] = await Promise.all([
    loc === 'onsite' || q
      ? Promise.resolve(emptyResult)
      : withTimeoutFallback(
          priorityQuery as any,
          DB_BUDGET.list,
          timeoutResult,
          'api-jobs-priority'
        ),
    withTimeoutFallback(query as any, DB_BUDGET.list, timeoutResult, 'api-jobs-main'),
  ]);

  const { data: mainJobs, error, count } = mainResult as any;
  const mainTimedOut = error?.code === 'TIMEOUT';
  const priorityJobs = (priorityResult as any).data || [];

  // Merge: priority jobs first (deduped), then backfill from main
  const mergedIds = new Set<string>();
  const rawJobs: any[] = [];
  for (const job of priorityJobs) {
    if (!mergedIds.has(job.id)) { mergedIds.add(job.id); rawJobs.push(job); }
  }
  for (const job of (mainJobs || [])) {
    if (!mergedIds.has(job.id)) { mergedIds.add(job.id); rawJobs.push(job); }
  }

  if (error && error.code !== 'TIMEOUT') {
    console.error('Jobs query error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return NextResponse.json(
      {
        error: 'Failed to fetch jobs',
        // Safe, non-secret diagnostic for operators (no keys / tokens)
        reason: error.message || error.code || 'unknown',
      },
      { status: 500 }
    );
  }

  // Clean titles: strip noise so only the meaningful role name remains
  for (const job of (rawJobs || [])) {
    if (job.title) {
      let t = job.title;
      // 1. Strip bracketed or parenthesized prefixes AND suffixes (e.g. [Remote], (US), [Rem...])
      t = t.replace(/^\s*\[[^\]]*\]\s*/g, '');
      t = t.replace(/^\s*\([^\)]*\)\s*/g, '');
      t = t.replace(/\s*\[[^\]]*\]\s*$/g, '');
      t = t.replace(/\s*\([^\)]*\)\s*$/g, '');
      // Also strip mid-title brackets/parens containing location/remote info
      t = t.replace(/\s*\[(remote|hybrid|onsite|on-site|contract|full[- ]?time|part[- ]?time|freelance|temporary|intern(?:ship)?)[^\]]*\]/gi, '');
      t = t.replace(/\s*\((remote|hybrid|onsite|on-site|contract|full[- ]?time|part[- ]?time|freelance|temporary|intern(?:ship)?)[^\)]*\)/gi, '');
      // 2. Strip complex requisition codes like 'M-11/13 - 8751 - '
      t = t.replace(/^[\w\-\/]+\s*\-\s*\d+\s*\-\s*/g, '');
      // 3. Strip percentage remote indicators like '75% remote: '
      t = t.replace(/^\s*\d+%\s*remote\s*[:\|-]?\s*/i, '');
      // 4. Strip standard Req/Ref codes like 'Req-1234: '
      t = t.replace(/^\s*(req|ref)[a-z0-9\-]*\s*[:\-]\s*/i, '');
      // 5. Strip "Urgently Hiring:", "Now Hiring:", "Hiring:", "New:" prefixes
      t = t.replace(/^\s*(urgently\s+)?hiring\s*[:!\-]\s*/i, '');
      t = t.replace(/^\s*now\s+hiring\s*[:!\-]\s*/i, '');
      t = t.replace(/^\s*new\s*[:!\-]\s*/i, '');
      t = t.replace(/^\s*hot\s+job\s*[:!\-]\s*/i, '');
      // 6. Strip trailing metadata after | or — or – (e.g. "Engineer | Remote | USA")
      t = t.replace(/\s*[|—–].*$/i, '');
      // 7. Strip trailing " - Location" patterns (e.g. "Engineer - New York, NY")
      t = t.replace(/\s+-\s+(remote|hybrid|onsite|home\s+based|work\s+from\s+home).*$/i, '');
      // 8. Strip trailing comma + location-like patterns (e.g. ", Remote, US")
      t = t.replace(/,\s*(remote|hybrid|worldwide|global|anywhere)\s*$/i, '');
      // 9. Strip filler phrases (e.g. "to be part of a company", "to join our team")
      t = t.replace(/\s+(to\s+(be\s+part|join)\s+.*)$/i, '');
      t = t.replace(/\s+(for\s+(our|a|the)\s+.*)$/i, '');
      t = t.replace(/\s+(at\s+.{15,})$/i, '');
      t = t.replace(/\s+(who\s+will\s+.*)$/i, '');
      t = t.replace(/\s+(with\s+(experience|focus|expertise)\s+.*)$/i, '');
      // 10. Strip after colon when followed by a list/department (e.g. "DevRel Lead: Content, Social & Events")
      t = t.replace(/\s*:\s+.+$/, '');
      // 11. Strip after comma when followed by a department/team name (not a role qualifier)
      //     Keep: "Member of Technical Staff, Platform Engineering" 
      //     Cut: "Finance Operations Specialist, Newsletter Sponsorships & Partnerships"
      const commaMatch = t.match(/^(.{10,}?),\s+(.+)$/);
      if (commaMatch) {
        const [, before, after] = commaMatch;
        // Generic base roles that NEED a qualifier to be meaningful
        const isGenericBase = /\b(member of technical staff|analyst|specialist|coordinator|associate|advisor|consultant|representative|intern)\s*$/i.test(before);
        // Only strip if NOT a generic base, and (matches dept words OR is too long)
        if (!isGenericBase) {
          const isDeptOrTeam = /^(professional|enterprise|global|corporate|commercial|strategic|digital|consumer|internal|regional|national|technical|newsletter|campaign|growth|revenue|customer|partner|people|talent|content|creative|brand|performance|clinical|medical|supply|logistics|demand|home\b)/i.test(after);
          const isTooLong = after.length > 30;
          if (isDeptOrTeam || isTooLong) {
            t = before;
          }
        } else if (after.length > 35) {
          // Even for generic roles, cut if the qualifier is absurdly long
          t = before;
        }
      }
      // 12. Strip trailing " - <long text>" (department after dash, but only if very long)
      const dashMatch = t.match(/^(.{10,}?)\s+-\s+(.{20,})$/);
      if (dashMatch) {
        t = dashMatch[1];
      }
      // 13. Clean up any leading/trailing junk / markdown leftovers
      job.title = cleanJobTitle(t);
    }
  }

  // Filter out non-English titles and vague/generic postings
  const VAGUE_TITLE_PATTERNS = [
    /\bmultiple\s+(roles?|positions?|openings?|opportunities)\b/i,
    /\bvarious\s+(roles?|positions?|openings?)\b/i,
    /\bcleared\s+candidates?\b/i,
    /\bvetting\s+cleared\b/i,
    /\bexpressions?\s+of\s+interest\b/i,
    /\btalent\s+(pool|community|pipeline|network)\b/i,
    /\bgeneral\s+application\b/i,
    /\bopen\s+application\b/i,
    /\bspontaneous\s+application\b/i,
    /\bjoin\s+our\s+(team|talent)\b/i,
    /\bfuture\s+(opportunities|openings|roles?)\b/i,
    /\bregister\s+(your\s+)?interest\b/i,
    /\bwe\s+are\s+hiring\b/i,
    /\bwe\'?re\s+hiring\b/i,
    /\bapply\s+now\b/i,
    /\bread more\b/i,
    /\bexplaining the\b/i,
    /\band introducing (our|the)\b/i,
    /^(website|home|about|blog|news|careers)$/i,
  ];
  const VAGUE_COMPANY_PATTERNS = [
    /\bjobradars?\b/i,
    /\bstaffing\s+agency\b/i,
  ];

  const englishFiltered = (rawJobs || []).filter(job => {
    const title = cleanJobTitle(job.title);
    if (isNonEnglishTitle(title)) return false;
    // Block junk company names & Gopuff (to avoid expensive wildcard database queries)
    const companyLower = (job.company || '').toLowerCase().trim();
    if (isJunkCompanyName(job.company || '') || companyLower.includes('gopuff')) return false;
    // Block vague/generic titles
    if (VAGUE_TITLE_PATTERNS.some(p => p.test(title))) return false;
    if (isGarbageJobTitle(title)) return false;
    const isBareInternship =
      String(job.job_type || '').toLowerCase() === 'internship' &&
      !looksLikeFellowship({ title, category: job.category, tags: job.tags });
    if (hideInternships && isBareInternship) return false;
    // Block known junk sources
    if (VAGUE_COMPANY_PATTERNS.some(p => p.test(job.company))) return false;
    // Hide LinkedIn / aggregator apply URLs unless already fully enriched
    if (!shouldListJobOnBoard(job)) return false;
    return true;
  });

  // Deduplicate by normalized company+title (cross-source dupes)
  const seen = new Set<string>();
  const englishJobs = englishFiltered.filter(job => {
    const key = `${normalizeCompany(job.company)}::${cleanJobTitle(job.title).toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // ── Score all jobs FIRST so location/skill priority drives selection ──
  const scoringProfile: MatchUserProfile = userProfile || {
    skills: [],
    experience: [],
    location: '',
    about: '',
  };

  const scoredJobs = englishJobs.map(job => {
    const result = computeMatchScore(scoringProfile, {
      title: job.title,
      tags: job.tags || [],
      location: job.location || '',
      company: job.company,
    });
    return { ...job, _score: result.score, _matchedSkills: result.matchedSkills, _signals: result.signals };
  });

  // Sort by score DESC, then recency — so remote/location-matched jobs come first
  scoredJobs.sort((a, b) => {
    if (b._score !== a._score) return b._score - a._score;
    const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
    const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
    return dateB - dateA;
  });

  // Take top candidates (enough for interleaving)
  const candidatePool = scoredJobs.slice(0, limit * 3);

  // Two-level interleave: by department category, then by company within each category
  // Group by category → company (preserving score order within each bucket)
  const catBuckets: Record<string, Record<string, any[]>> = {};
  for (const job of candidatePool) {
    const cat = guessCategory(job);
    const co = normalizeCompany(job.company);
    if (!catBuckets[cat]) catBuckets[cat] = {};
    if (!catBuckets[cat][co]) catBuckets[cat][co] = [];
    catBuckets[cat][co].push(job);
  }

  // Build per-category streams (company-interleaved within each category)
  const catStreams: Record<string, any[]> = {};
  for (const [cat, companies] of Object.entries(catBuckets)) {
    const coKeys = Object.keys(companies).sort((a, b) => companies[b].length - companies[a].length);
    const stream: any[] = [];
    let r = 0;
    while (true) {
      let added = false;
      for (const co of coKeys) {
        if (r < companies[co].length) { stream.push(companies[co][r]); added = true; }
      }
      if (!added) break;
      r++;
    }
    catStreams[cat] = stream;
  }

  // Round-robin across categories to produce a diverse feed
  const catKeys = Object.keys(catStreams).sort((a, b) => catStreams[b].length - catStreams[a].length);
  const catPointers: Record<string, number> = {};
  for (const k of catKeys) catPointers[k] = 0;

  const jobs: any[] = [];
  const seenIds = new Set<string>();
  while (jobs.length < limit) {
    let added = false;
    for (const cat of catKeys) {
      while (catPointers[cat] < catStreams[cat].length) {
        const job = catStreams[cat][catPointers[cat]];
        catPointers[cat]++;
        if (!seenIds.has(job.id)) {
          seenIds.add(job.id);
          jobs.push(job);
          added = true;
          break;
        }
      }
      if (jobs.length >= limit) break;
    }
    if (!added) break;
  }

  // Map to response format (scores already computed)
  const jobsWithMatches = jobs.map(job => ({
    id: job.id,
    title: cleanJobTitle(job.title),
    company: companyDisplayNameFromJob(job),
    company_logo: job.company_logo,
    location: displayJobLocation(job.location, job.job_type),
    job_type: job.job_type,
    salary: cleanSalaryDisplay(job.salary),
    tags: job.tags || [],
    apply_url: job.apply_url,
    category: job.category,
    source: job.source,
    published_at: job.published_at,
    external_id: job.external_id,
    path: jobPublicPath(job),
    matched_skills: job._matchedSkills,
    match_count: job._matchedSkills.length,
    match_score: job._score,
    match_signals: job._signals,
  }));

  // Final sort: score first, then recency
  jobsWithMatches.sort((a, b) => {
    if (b.match_score !== a.match_score) return b.match_score - a.match_score;
    const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
    const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
    return dateB - dateA;
  });

  const degraded = jobsWithMatches.length === 0 && Boolean(mainTimedOut);

  if (degraded) {
    const response = NextResponse.json({
      jobs: [],
      total: 0,
      page,
      limit,
      hasMore: false,
      degraded: true,
      userSkills: (userProfile?.skills || []).map((s) => s.trim()).filter(Boolean),
      profileComplete,
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  const total = needsDbCount
    ? (count || jobsWithMatches.length)
    : PLATFORM_JOBS_TOTAL;

  const response = NextResponse.json({
    jobs: jobsWithMatches,
    total,
    page,
    limit,
    hasMore: needsDbCount
      ? offset + limit < (count || 0)
      : jobsWithMatches.length >= limit,
    userSkills: (userProfile?.skills || []).map(s => s.trim()).filter(Boolean),
    profileComplete,
  });

  // Cache for 60s on CDN, serve stale while revalidating for up to 5 min
  response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  return response;
}
