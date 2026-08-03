import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createServerClient } from '@supabase/ssr';
import { normalizeLocation as normalizeLocationDisplay } from '@/lib/normalize-location';
import { jobPublicPath } from '@/lib/job-description';
import { PLATFORM_JOBS_TOTAL } from '@/lib/platform-job-count';
import { withTimeoutFallback, DB_BUDGET } from '@/lib/db-timeout';

const supabase = supabaseAdmin;

// ── Company name normalization (merge cross-source variants) ──
const COMPANY_NAME_MAP: Record<string, string> = {
  'doordash usa': 'doordash', 'shopback 2': 'shopback', 'brillio 2': 'brillio',
  'lyrahealth': 'lyra health', 'ciandt': 'ci&t', 'ci&t': 'ci&t',
  'hadrian-automation': 'hadrian', 'relativity space': 'relativity',
  'unity technologies': 'unity', 'scale ai': 'scale ai',
  'base-power': 'base power', 'heidihealth.com.au': 'heidi health',
  'roadsurfer.com': 'roadsurfer', 'the-exploration-company': 'the exploration company',
  'finni-health': 'finni health', 'apex-technology-inc': 'apex technology',
  'northwoodspace': 'northwood space', 'horizon3ai': 'horizon3.ai',
  'govtech singapore': 'govtech', 'kraken.com': 'kraken',
  'chime financial, inc': 'chime', 'gusto, inc.': 'gusto',
};
const COMPANY_BLOCKLIST = new Set([
  'leverdemo 8', 'getwingapp', 'leverdemo', 'test company', 'demo company',
  'smart working solutions', 'confidential', '10xteam', 'careers - think digitally',
  'careers.azx.io', 'brook hiddink - highticket.io',
]);
function normalizeCompany(name: string): string {
  const key = (name || '').toLowerCase().trim();
  return COMPANY_NAME_MAP[key] || key;
}

// ── Non-English title detection ──
// Matches titles that are clearly non-English (German, French, Spanish, etc.)
const NON_ENGLISH_PATTERNS = [
  // German
  /\b(und|oder|für|mit|bei|zur|zum|ein|eine|des|dem|den|als|auf|nach|aus|über|unter|vor|zwischen|durch|gegen|ohne|während)\b/i,
  /\b(Stellvertretend|Abteilung|Geschäftsführ|Sachbearbeit|Fachangestellt|Mitarbeiter|Leiter|Berater|Steuer|Buchhalt|Werkstudent|Praktikant|Ausbildung|Kaufm[aä]nn|Entwickl)\w*/,
  /\b(gmbh|gesellschaft|verwaltung|beratung|betrieb|abteilung|fachkraft)\b/i,
  // French
  /\b(responsable|ingénieur|développeur|chargé|adjoint|directeur|gestionnaire|conseiller|technicien)\b/i,
  /\b(avec|dans|pour|chez|entre|cette|sont|nous|vous|leur|mais|donc|alors)\b/i,
  // Spanish
  /\b(ingeniero|desarrollador|gerente|coordinador|analista|ejecutivo|técnico|especialista|asesor)\b/i,
  /\b(para|como|está|este|esta|pero|también|desde|donde|cuando|porque)\b/i,
  // Portuguese
  /\b(engenheiro|desenvolvedor|analista|gerente|coordenador|especialista|técnico)\b/i,
  // Dutch
  /\b(medewerker|adviseur|beheerder|directeur|coördinator|verantwoordelijk)\b/i,
  // Detect extended non-ASCII chars heavily used in European languages (ä,ö,ü,ß,ñ,ç etc.)
  /[äöüßñçàèìòùâêîôûëïãõ]{2,}/i,
];

function isNonEnglishTitle(title: string): boolean {
  if (!title) return false;
  return NON_ENGLISH_PATTERNS.some(p => p.test(title));
}

// PostgREST or()/ov() filters are parsed as a filter string — strip characters
// that could break out of the intended filter expression (e.g. `,` or `)`).
function sanitizeFilterTerm(term: string): string {
  return term
    .replace(/[,(){}[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
}

// ── Role keyword families for title matching ──
const ROLE_FAMILIES: Record<string, string[]> = {
  frontend:    ['frontend', 'front-end', 'front end', 'react', 'vue', 'angular', 'ui engineer', 'ui developer', 'css', 'next.js', 'nextjs'],
  backend:     ['backend', 'back-end', 'back end', 'server', 'api', 'node', 'python', 'java', 'golang', 'go developer', 'ruby', 'django', 'flask', 'express', 'spring'],
  fullstack:   ['full stack', 'fullstack', 'full-stack'],
  mobile:      ['mobile', 'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin'],
  devops:      ['devops', 'sre', 'site reliability', 'infrastructure', 'platform engineer', 'cloud engineer', 'kubernetes', 'docker', 'terraform', 'ci/cd'],
  data:        ['data engineer', 'data scientist', 'data analyst', 'analytics', 'etl', 'data platform', 'business intelligence', 'bi engineer'],
  ml:          ['machine learning', 'ml engineer', 'ai engineer', 'deep learning', 'nlp', 'computer vision', 'llm'],
  security:    ['security', 'cybersecurity', 'infosec', 'penetration', 'appsec'],
  design:      ['designer', 'ux', 'ui/ux', 'product design', 'design system', 'figma'],
  product:     ['product manager', 'program manager', 'product owner', 'product lead', 'tpm'],
  qa:          ['qa', 'quality', 'test engineer', 'sdet', 'automation engineer'],
  embedded:    ['embedded', 'firmware', 'hardware', 'iot', 'fpga'],
};

// ── Seniority levels and their numeric rank ──
const SENIORITY_MAP: Record<string, number> = {
  intern: 1, internship: 1, trainee: 1, apprentice: 1,
  junior: 2, associate: 2, entry: 2, 'early career': 2,
  mid: 3, intermediate: 3,
  senior: 4, 'sr.': 4, 'sr': 4,
  staff: 5, principal: 5,
  lead: 6, 'team lead': 6, 'tech lead': 6,
  director: 7, head: 7,
  vp: 8, 'vice president': 8,
  cto: 9, ceo: 9, coo: 9, cfo: 9, 'c-level': 9,
};

/** Extract seniority level from a title string */
function extractSeniority(title: string): number {
  const lower = title.toLowerCase();
  for (const [keyword, level] of Object.entries(SENIORITY_MAP)) {
    if (lower.includes(keyword)) return level;
  }
  return 3; // default to mid-level
}

/** Extract role families from a title string */
function extractRoleFamilies(title: string): string[] {
  const lower = title.toLowerCase();
  const families: string[] = [];
  for (const [family, keywords] of Object.entries(ROLE_FAMILIES)) {
    if (keywords.some(kw => lower.includes(kw))) {
      families.push(family);
    }
  }
  return families;
}

/** Normalize location string for comparison */
function normalizeLocation(loc: string): { isRemote: boolean; tokens: string[] } {
  const lower = loc.toLowerCase().trim();
  const isRemote = /remote|anywhere|distributed|worldwide|global/i.test(lower);
  const tokens = lower
    .replace(/[,\-\/|·•]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !['and', 'the', 'or'].includes(t));
  return { isRemote, tokens };
}

interface UserProfile {
  skills: string[];
  experience: Array<{ title?: string; company?: string; description?: string }>;
  location: string;
  about: string;
}

/**
 * Compute a match score (0–100) between a user profile and a job listing.
 * 
 * Weights:
 * - Skills overlap:     40 points max
 * - Title/role match:   25 points max
 * - Seniority match:    10 points max
 * - Location match:     25 points max
 */
function computeMatchScore(
  user: UserProfile,
  job: { title: string; tags: string[]; location: string; company: string }
): { score: number; matchedSkills: string[]; signals: string[] } {
  const signals: string[] = [];
  let score = 0;

  // ── 1. Skills overlap (40 pts) ──
  const userSkillsLower = user.skills.map(s => s.toLowerCase());
  const jobTagsLower = (job.tags || []).map(t => t.toLowerCase());
  const jobTitleLower = job.title.toLowerCase();
  // Match against both tags AND job title (bidirectional: skill⊂tag OR tag⊂skill)
  const matchedSkills = user.skills.filter(s => {
    const sl = s.toLowerCase();
    // Split compound skills like "AI & Automation" into parts
    const parts = sl.split(/[\s&,/]+/).filter(p => p.length > 2);
    return jobTagsLower.some(t => t.includes(sl) || sl.includes(t) || parts.some(p => t === p || t.includes(p)))
      || parts.some(p => jobTitleLower.includes(p));
  });
  if (matchedSkills.length > 0) {
    const skillScore = Math.min(40, matchedSkills.length * 10);
    score += skillScore;
    signals.push(`${matchedSkills.length} skill${matchedSkills.length > 1 ? 's' : ''}`);
  }

  // ── 2. Title/role match (30 pts) ──
  // Extract role families from user's most recent job titles
  const userRoleFamilies = new Set<string>();
  for (const exp of (user.experience || []).slice(0, 3)) {
    if (exp.title) {
      for (const f of extractRoleFamilies(exp.title)) {
        userRoleFamilies.add(f);
      }
    }
  }
  // Also extract from user's about/summary
  if (user.about) {
    for (const f of extractRoleFamilies(user.about)) {
      userRoleFamilies.add(f);
    }
  }
  // Also extract from skills (e.g., "React" → frontend)
  const skillText = userSkillsLower.join(' ');
  for (const f of extractRoleFamilies(skillText)) {
    userRoleFamilies.add(f);
  }

  const jobRoleFamilies = new Set(extractRoleFamilies(job.title));
  // Also check job tags for role families
  const tagText = jobTagsLower.join(' ');
  for (const f of extractRoleFamilies(tagText)) {
    jobRoleFamilies.add(f);
  }

  const roleOverlap = [...userRoleFamilies].filter(f => jobRoleFamilies.has(f));
  if (roleOverlap.length > 0) {
    const roleScore = Math.min(25, roleOverlap.length * 12);
    score += roleScore;
    signals.push(`role: ${roleOverlap.join(', ')}`);
  }

  // ── 3. Seniority match (15 pts) ──
  // Get user's seniority from most recent title
  const userTitles = (user.experience || []).slice(0, 2).map(e => e.title || '');
  const userSeniority = userTitles.length > 0 ? Math.max(...userTitles.map(extractSeniority)) : 3;
  const jobSeniority = extractSeniority(job.title);
  const seniorityDiff = Math.abs(userSeniority - jobSeniority);
  if (seniorityDiff === 0) {
    score += 10;
    signals.push('seniority: exact');
  } else if (seniorityDiff === 1) {
    score += 7;
    signals.push('seniority: close');
  } else if (seniorityDiff === 2) {
    score += 3;
  }

  // ── 4. Location match (25 pts) ──
  if (job.location) {
    const jobLoc = normalizeLocation(job.location);

    if (user.location) {
      const userLoc = normalizeLocation(user.location);
      if (userLoc.tokens.some(t => jobLoc.tokens.includes(t))) {
        // City/country overlap — strongest signal
        score += 25;
        signals.push('location: match');
      } else if (jobLoc.isRemote) {
        // Remote jobs are a good match for everyone with a location
        score += 20;
        signals.push('location: remote');
      }
    } else {
      // No user location — boost remote jobs
      if (jobLoc.isRemote) {
        score += 25;
        signals.push('location: remote');
      }
    }
  }

  return { score, matchedSkills, signals };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const type = searchParams.get('type'); // full_time, contract, etc.
  const loc = searchParams.get('loc');   // remote, hybrid, onsite
  const q = sanitizeFilterTerm(searchParams.get('q')?.toLowerCase().trim() || '');
  const offset = (page - 1) * limit;

  // Try to get authenticated user's profile for matching
  let userProfile: UserProfile | null = null;
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
  const selectCols = 'id,title,company,company_logo,location,job_type,salary,tags,apply_url,category,source,published_at,external_id';

  // Base filters shared by all queries
  function applyBaseFilters(q: any) {
    if (type && type !== 'all') q = q.eq('job_type', type);
    return q;
  }

  // --- Query 1: Remote + location-matched jobs (priority pool) ---
  let priorityFilter = 'location.ilike.%remote%,location.ilike.%anywhere%,location.ilike.%distributed%,location.ilike.%worldwide%';
  if (userProfile?.location) {
    const userLoc = normalizeLocation(userProfile.location);
    if (!userLoc.isRemote && userLoc.tokens.length > 0) {
      priorityFilter += ',' + userLoc.tokens.map(t => `location.ilike.%${sanitizeFilterTerm(t)}%`).join(',');
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

  // Unfiltered board: skip DB count (static total). Filtered search: estimated only.
  const matchOnlyEarly = searchParams.get('match') === 'true';
  const needsDbCount = Boolean(
    (type && type !== 'all') || loc || q || matchOnlyEarly
  );

  // --- Query 2: All jobs (backfill pool) ---
  let query = supabase
    .from('jobs')
    .select(selectCols, needsDbCount ? { count: 'estimated' } : undefined)
    .gt('created_at', thirtyDaysAgo)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

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

  // If user has complete profile AND match=true, filter to jobs that match their skills and location
  const matchOnly = searchParams.get('match') === 'true';
  if (profileComplete && userProfile && userProfile.skills.length > 0 && matchOnly && !q) {
    // Build OR filter: match tags overlap OR any skill appears in the title
    const titleFilters = userProfile.skills.map(s => `title.ilike.%${s}%`).join(',');
    query = query.or(`tags.ov.{${userProfile.skills.join(',')}},${titleFilters}`);

    // If candidate has a location (and is not purely 'remote'), ensure jobs match location or are remote
    if (userProfile.location) {
      const userLoc = normalizeLocation(userProfile.location);
      if (!userLoc.isRemote && userLoc.tokens.length > 0) {
        const locFilters = [
          'location.ilike.%remote%',
          'location.ilike.%anywhere%',
          'location.ilike.%worldwide%',
          'location.ilike.%distributed%',
          ...userLoc.tokens.map(t => `location.ilike.%${sanitizeFilterTerm(t)}%`)
        ].join(',');
        query = query.or(locFilters);
      }
    }
  }

  // Fetch a larger batch to allow company interleaving (3x is enough)
  const fetchLimit = limit * 3;
  query = query.range(offset, offset + fetchLimit - 1);

  // Run both queries in parallel with hard timeout — never hang the board.
  const emptyResult = {
    data: [] as any[],
    error: null,
    count: null,
    status: 200,
    statusText: 'OK',
  } as any;
  const [priorityResult, mainResult] = await Promise.all([
    loc === 'onsite'
      ? Promise.resolve(emptyResult)
      : withTimeoutFallback(
          priorityQuery as any,
          DB_BUDGET.list,
          emptyResult,
          'api-jobs-priority'
        ),
    withTimeoutFallback(query as any, DB_BUDGET.list, emptyResult, 'api-jobs-main'),
  ]);

  const { data: mainJobs, error, count } = mainResult as any;
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

  if (error) {
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
      // 13. Clean up any leading/trailing junk
      job.title = t.replace(/^[\s:\-\|]+/, '').replace(/[\s:\-\|,]+$/, '').trim();
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
  ];
  const VAGUE_COMPANY_PATTERNS = [
    /\bjobradars?\b/i,
    /\bstaffing\s+agency\b/i,
  ];

  const englishFiltered = (rawJobs || []).filter(job => {
    if (isNonEnglishTitle(job.title)) return false;
    // Block junk company names & Gopuff (to avoid expensive wildcard database queries)
    const companyLower = (job.company || '').toLowerCase().trim();
    if (COMPANY_BLOCKLIST.has(companyLower) || companyLower.includes('gopuff')) return false;
    // Block vague/generic titles
    if (VAGUE_TITLE_PATTERNS.some(p => p.test(job.title))) return false;
    // Block known junk sources
    if (VAGUE_COMPANY_PATTERNS.some(p => p.test(job.company))) return false;
    return true;
  });

  // Deduplicate by normalized company+title (cross-source dupes)
  const seen = new Set<string>();
  const englishJobs = englishFiltered.filter(job => {
    const key = `${normalizeCompany(job.company)}::${(job.title || '').toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // ── Score all jobs FIRST so location/skill priority drives selection ──
  const scoringProfile: UserProfile = userProfile || {
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
  // This ensures marketing, sales, design, content roles surface alongside engineering
  function guessCategory(job: any): string {
    const t = (job.title || '').toLowerCase();
    const c = (job.category || '').toLowerCase();
    if (/engineer|developer|swe|software|devops|sre|platform|architect|backend|frontend|full.?stack/.test(t) || c === 'engineering') return 'Engineering';
    if (/marketing|growth|seo|sem|content strat|brand/.test(t) || c === 'marketing') return 'Marketing';
    if (/content|writer|editor|copywrite|blog|communi/.test(t) || c === 'content') return 'Content';
    if (/design|ux|ui|creative|graphic/.test(t) || c === 'design') return 'Design';
    if (/\bsale|account exec|business dev|bdm|revenue/.test(t) || c === 'sales') return 'Sales';
    if (/product manag|product own|tpm|program manag/.test(t) || c === 'product') return 'Product';
    if (/data scien|data analy|analytics|bi |data eng|machine learn|ml |ai /.test(t) || c === 'data') return 'Data & AI';
    if (/recrui|talent|people|hr |human res/.test(t)) return 'People';
    if (/financ|account|controller|treasury|fp&a/.test(t)) return 'Finance';
    if (/customer|support|success/.test(t)) return 'Customer Success';
    if (/opera|ops |supply|logistics/.test(t)) return 'Operations';
    if (/legal|counsel|compliance/.test(t)) return 'Legal';
    if (/security|infosec|cyber/.test(t)) return 'Security';
    return 'Other';
  }

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
    title: job.title,
    company: job.company,
    company_logo: job.company_logo,
    location: normalizeLocationDisplay(job.location),
    job_type: job.job_type,
    salary: job.salary,
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
