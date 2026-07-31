/**
 * Shared loaders for job detail pages (/jobs/{id} and /{company}/{jobSlug}).
 * Public path is cache-first + hard-timeout (see job-snapshots.ts).
 */
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { normalizeLocation } from '@/lib/normalize-location';
import {
  formatJobDescription,
  jobDescriptionExcerpt,
  isJobId,
  isShortJobSlug,
  companyToSlug,
  shortJobSlug,
  jobPublicPath,
  jobTypeLabel,
} from '@/lib/job-description';
import { cleanPublishText } from '@/lib/noslop';
import type { JobDetail } from '@/app/jobs/[id]/job-detail-client';
import {
  getCachedJobById,
  getCachedJobByCompanyAndSlug,
} from '@/lib/job-snapshots';
import { withTimeoutFallback, DB_BUDGET } from '@/lib/db-timeout';

export type JobRow = {
  id: string;
  title: string;
  company: string;
  company_logo: string | null;
  location: string | null;
  job_type: string | null;
  salary: string | null;
  tags: string[] | null;
  apply_url: string;
  category: string | null;
  source: string;
  published_at: string | null;
  description: string | null;
  external_id: string | null;
};

export async function fetchJobById(id: string): Promise<JobRow | null> {
  if (!isJobId(id)) return null;
  return getCachedJobById(id);
}

/** Resolve `/google/mkt` via external_id = google_mkt + company match. */
export async function fetchJobByCompanyAndSlug(
  companySlug: string,
  jobSlug: string
): Promise<JobRow | null> {
  if (!companySlug || !isShortJobSlug(jobSlug)) return null;
  return getCachedJobByCompanyAndSlug(companySlug, jobSlug);
}

export function toJobDetail(job: JobRow): JobDetail {
  const descriptionHtml = formatJobDescription(job.description);
  return {
    id: job.id,
    title: cleanPublishText(job.title),
    company: cleanPublishText(job.company),
    company_logo: job.company_logo,
    location: cleanPublishText(normalizeLocation(job.location || '')),
    job_type: job.job_type,
    salary: job.salary ? cleanPublishText(job.salary) : job.salary,
    tags: job.tags || [],
    apply_url: job.apply_url,
    category: job.category,
    source: job.source,
    published_at: job.published_at,
    description_html: descriptionHtml,
    has_description: descriptionHtml.length > 40,
    excerpt: jobDescriptionExcerpt(job.description, 200),
    company_slug: companyToSlug(job.company),
    job_slug: shortJobSlug(job.company, job.external_id),
    public_path: jobPublicPath(job),
  };
}

export async function getViewerJobContext(): Promise<{
  userSkills: string[];
  profileComplete: boolean;
  isAuthenticated: boolean;
}> {
  const empty = {
    userSkills: [] as string[],
    profileComplete: false,
    isAuthenticated: false,
  };
  // Auth must not block job page render when Supabase is slow.
  return withTimeoutFallback(
    (async () => {
      try {
        const cookieStore = await cookies();
        const anonClient = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll: () => cookieStore.getAll(),
            },
          }
        );
        const {
          data: { user },
        } = await anonClient.auth.getUser();
        if (!user) return empty;

        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('skills, about')
          .eq('id', user.id)
          .single();

        if (!profile) {
          return { ...empty, isAuthenticated: true };
        }
        const userSkills = (profile.skills || [])
          .map((s: string) => s.trim())
          .filter(Boolean);
        return {
          userSkills,
          profileComplete: !!profile.about && userSkills.length > 0,
          isAuthenticated: true,
        };
      } catch {
        return empty;
      }
    })(),
    DB_BUDGET.fast,
    empty,
    'viewer-job-context'
  );
}

export function buildJobMetadata(job: JobRow, siteUrl: string) {
  const location = cleanPublishText(normalizeLocation(job.location || '') || 'Remote');
  const type = jobTypeLabel(job.job_type);
  const jobTitle = cleanPublishText(job.title);
  const company = cleanPublishText(job.company);
  const title = `${jobTitle} at ${company}${type ? ` (${type})` : ''}`;
  const excerpt = jobDescriptionExcerpt(job.description, 140);
  const description =
    excerpt || `${jobTitle} at ${company}. ${location}. Apply via CVin.Bio.`;
  const canonical = `${siteUrl}${jobPublicPath(job)}`;

  return {
    title,
    description: description.slice(0, 160),
    alternates: { canonical },
    openGraph: {
      type: 'website' as const,
      url: canonical,
      title,
      description: description.slice(0, 160),
      siteName: 'CVin.Bio',
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description: description.slice(0, 160),
    },
    robots: { index: true, follow: true },
  };
}

export function buildJobJsonLd(job: JobRow, detail: JobDetail, siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: detail.excerpt || `${job.title} at ${job.company}`,
    datePosted: job.published_at || undefined,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company,
      logo: job.company_logo || undefined,
    },
    jobLocation: job.location
      ? {
          '@type': 'Place',
          address: detail.location,
        }
      : undefined,
    employmentType: job.job_type
      ? (
          {
            full_time: 'FULL_TIME',
            part_time: 'PART_TIME',
            contract: 'CONTRACTOR',
            internship: 'INTERN',
            freelance: 'OTHER',
          } as Record<string, string>
        )[job.job_type] || 'OTHER'
      : undefined,
    url: `${siteUrl}${detail.public_path}`,
    directApply: false,
  };
}
