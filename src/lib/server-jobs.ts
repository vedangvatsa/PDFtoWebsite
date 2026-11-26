import { getStaticJobs } from '@/lib/jobs-static';
import { displayJobLocation } from '@/lib/normalize-location';
import { cleanJobTitle, cleanSalaryDisplay, looksLikeFellowship } from '@/lib/job-description';
import { companyDisplayNameFromJob } from '@/lib/company-directory';
import { shouldListLiveJobCard } from '@/lib/job-apply-source';
import { companyHubJobLink } from '@/lib/company-hub-query';
import { filterMeaningfulSkillTags } from '@/lib/job-skill-tags';
import { isBannedJobTitle } from '@/lib/banned-jobs.mjs';
import {
  normalizeCompany,
  isNonEnglishTitle,
  sanitizeFilterTerm,
  computeMatchScore,
  guessCategory,
  type MatchUserProfile,
} from '@/lib/job-match';

const CARD_SKILL_BLOCKLIST = new Set([
  'ai', 'go', 'hr', 'vp', 'qa', 'r', 'growth', 'support', 'recruiting', 'recruiter', 'talent', 'content',
]);

function jobCardInfo(job: any) {
  const title = cleanJobTitle(job.title || 'role');
  const company = companyDisplayNameFromJob(job);
  const category = guessCategory(job);
  const location = displayJobLocation(job.location, job.job_type);
  const salary = cleanSalaryDisplay(job.salary);
  const skills = filterMeaningfulSkillTags(
    Array.isArray(job.tags) ? job.tags.map((tag: unknown) => String(tag || '').trim()) : [],
    { companyName: company },
  ).filter((tag) => !CARD_SKILL_BLOCKLIST.has(tag.toLowerCase())).slice(0, 4);

  const focus = skills.length > 0 ? ` with ${skills.slice(0, 3).join(', ')}` : '';
  const where = location ? `, ${location}` : '';
  const summary = `${company} is hiring a ${title} in ${category}${focus}${where}.`;
  const highlights: string[] = [category, salary, ...skills].filter((h): h is string => Boolean(h)).slice(0, 5);
  return { summary, highlights };
}

export interface ServerJobsQuery {
  page?: number;
  limit?: number;
  type?: string;
  loc?: string;
  kind?: string;
  q?: string;
}

export async function fetchServerJobs(options: ServerJobsQuery = {}) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(50, Math.max(1, options.limit || 50));
  const offset = (page - 1) * limit;
  const fellowshipsOnly = options.kind === 'fellowship';
  const type = options.type;
  const loc = options.loc;
  const q = sanitizeFilterTerm(options.q?.toLowerCase().trim() || '');

  const staticJobs = await getStaticJobs();
  if (!staticJobs || staticJobs.length === 0) {
    return { jobs: [], total: 0, page, limit, hasMore: false };
  }

  let pool = staticJobs.filter((job) => shouldListLiveJobCard(job));
  if (fellowshipsOnly) {
    pool = pool.filter((j) => looksLikeFellowship({ title: j.title, category: j.category, tags: j.tags }) || j.category?.toLowerCase() === 'fellowship');
  } else if (!type || type === 'all') {
    pool = pool.filter((j) => j.job_type !== 'internship' || looksLikeFellowship({ title: j.title, category: j.category, tags: j.tags }));
  }
  if (type && type !== 'all') {
    pool = pool.filter((j) => j.job_type?.toLowerCase() === type.toLowerCase());
  }
  if (loc && loc !== 'all') {
    if (loc === 'worldwide' || loc === 'remote') {
      pool = pool.filter((j) => /\b(worldwide|anywhere|global|everywhere|wfh)\b/i.test(j.location || '') || (j.location || '').trim().toLowerCase() === 'remote');
    } else if (loc === 'us') {
      pool = pool.filter((j) => /\b(us|usa|united states|north america|canada)\b/i.test(j.location || ''));
    } else if (loc === 'europe') {
      pool = pool.filter((j) => /\b(europe|emea|uk|united kingdom|germany|france|spain|netherlands|ireland|poland|switzerland|sweden)\b/i.test(j.location || ''));
    } else if (loc === 'apac') {
      pool = pool.filter((j) => /\b(apac|asia|australia|india|singapore|japan|nz|new zealand|philippines|indonesia)\b/i.test(j.location || ''));
    } else {
      pool = pool.filter((j) => j.location?.toLowerCase().includes(loc.toLowerCase()));
    }
  }
  if (q) {
    const qLower = q.toLowerCase();
    pool = pool.filter((j) => j.title?.toLowerCase().includes(qLower) || j.company?.toLowerCase().includes(qLower));
  }

  const total = pool.length;
  const rawWindow = pool.slice(offset, offset + limit + 1);

  const cleanRows = rawWindow.filter((job) => {
    if (!job.title || typeof job.title !== 'string') return false;
    if (isBannedJobTitle(job.title)) return false;
    if (isNonEnglishTitle(job.title)) return false;
    return true;
  });

  const scoringProfile: MatchUserProfile = {
    skills: [],
    experience: [],
    location: '',
    about: '',
  };

  const scoredJobs = cleanRows.map((job) => {
    const result = computeMatchScore(scoringProfile, {
      title: job.title,
      tags: job.tags || [],
      location: job.location || '',
      company: job.company,
    });
    return { ...job, _score: result.score, _matchedSkills: result.matchedSkills, _signals: result.signals };
  });

  scoredJobs.sort((a, b) => {
    if (b._score !== a._score) return b._score - a._score;
    const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
    const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
    return dateB - dateA;
  });

  const candidatePool = scoredJobs.slice(0, limit * 3);
  const catBuckets: Record<string, Record<string, any[]>> = {};
  for (const job of candidatePool) {
    const cat = guessCategory(job);
    const co = normalizeCompany(job.company);
    if (!catBuckets[cat]) catBuckets[cat] = {};
    if (!catBuckets[cat][co]) catBuckets[cat][co] = [];
    catBuckets[cat][co].push(job);
  }

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

  const jobsWithMatches = jobs.map((job) => {
    const link = companyHubJobLink(job);
    const cardInfo = jobCardInfo(job);
    return {
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
      path: link.href,
      external: link.external,
      matched_skills: job._matchedSkills || [],
      match_count: (job._matchedSkills || []).length,
      match_score: job._score || 0,
      match_signals: job._signals || [],
      summary: cardInfo.summary,
      highlights: cardInfo.highlights,
      company_about: null,
    };
  });

  const hasMore = rawWindow.length > limit;

  return {
    jobs: jobsWithMatches,
    total,
    page,
    limit,
    hasMore,
  };
}
