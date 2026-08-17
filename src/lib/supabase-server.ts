import { cache } from 'react';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  withRetryOnTimeout,
  DB_BUDGET,
  ProfileUnavailableError,
  isProfileUnavailable,
} from '@/lib/db-timeout';
import {
  publicCustomSections,
  publicWorkExperience,
  publicEducation,
  enrichNameFromContact,
  normalizeName,
  cleanDescription,
  isResumeDumpText,
  isContactHeaderText,
  sanitizeSocialHandle,
  extractCleanSummary,
  repairSpacedEmail,
  splitSkills,
} from '@/lib/parse-guard';

export { ProfileUnavailableError, isProfileUnavailable };

const supabase = supabaseAdmin;

export interface ServerProfileData {
  profile: {
    userId: string;
    fullName: string;
    email?: string;
    phone?: string;
    location?: string;
    summary?: string;
    themeId?: string;
    slug: string;
    avatarUrl?: string;
    avatarHint?: string;
    website?: string;
    github?: string;
    linkedin?: string;
    viewCount?: number;
    skills?: string[];
    links?: any[];
  };
  workExperience: Array<{
    id: string;
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
  customSections: Array<{
    id: string;
    sectionTitle: string;
    items: Array<{ id: string; title: string; subtitle?: string; description?: string; date?: string }>;
    order: number;
  }>;
}

export type PublicProfileLookup =
  | { status: 'ok'; data: ServerProfileData }
  | { status: 'missing' }
  | { status: 'unavailable' };

const PROFILE_SELECT =
  'id, username, full_name, about, skills, experience, education, custom_sections, links, profile_picture_url, views, theme_id';

async function fetchProfileRow(slug: string) {
  const query = () =>
    supabase.from('profiles').select(PROFILE_SELECT).eq('username', slug).maybeSingle();
  let result: { data: any; error: any };
  try {
    result = await withRetryOnTimeout(query, DB_BUDGET.profile, `profile-slug:${slug}`);
  } catch (err) {
    // Timeout / network / PostgREST outage ≠ missing row. A null here used to
    // 404 live profiles (chris-mowforth and others, Aug 2026).
    console.warn(
      `[db-fail] profile-slug:${slug}:`,
      err instanceof Error ? err.message : err
    );
    throw new ProfileUnavailableError(slug);
  }
  if (result?.error && result.error.code !== 'PGRST116') {
    console.warn(`[db-fail] profile-slug:${slug}:`, result.error.message || result.error);
    throw new ProfileUnavailableError(slug);
  }
  return result;
}

async function getProfileBySlugUncached(slug: string): Promise<ServerProfileData | null> {
    const { data: profile } = await fetchProfileRow(slug);
    if (!profile) return null;

    const links = Array.isArray(profile.links) ? profile.links : [];
    const smartTitleCase = (name: string): string => {
        if (!name) return name;
        const isAllCaps = name === name.toUpperCase() && /[A-Z]/.test(name);
        const isAllLower = name === name.toLowerCase();
        if (isAllCaps || isAllLower) {
            return name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        }
        return name;
    };

    const getLink = (t: string) => links.find((l: any) => l.type === t)?.value || undefined;

    const rawName = String(profile.full_name || '').trim();
    const recovered = enrichNameFromContact(rawName, {
      email: getLink('email'),
      github: sanitizeSocialHandle(getLink('github') || '', 'github'),
      linkedin: sanitizeSocialHandle(getLink('linkedin') || '', 'linkedin'),
    });
    const displayName =
      smartTitleCase(normalizeName(recovered) || normalizeName(rawName) || '') ||
      'Professional Profile';

    let summary = String(profile.about || '');
    summary = isContactHeaderText(summary)
      ? ''
      : isResumeDumpText(summary)
        ? extractCleanSummary(summary)
        : cleanDescription(summary);

    const github = sanitizeSocialHandle(getLink('github') || '', 'github') || undefined;
    const linkedin = sanitizeSocialHandle(getLink('linkedin') || '', 'linkedin') || undefined;
    const emailRaw = getLink('email') || '';
    const email = emailRaw ? repairSpacedEmail(emailRaw) || emailRaw : undefined;

    const phoneRaw = getLink('phone');
    const phoneDigits = String(phoneRaw || '').replace(/\D/g, '');
    const phone = phoneDigits.length >= 8 ? phoneRaw : undefined;

    const rawLoc = getLink('location');
    const location = rawLoc
      ? rawLoc.replace(/^(?:university|college|institute|school|faculty)\s+of\s+[^,]+,\s*/i, '').trim()
      : undefined;

    return {
        profile: {
            userId: profile.id,
            fullName: displayName,
            slug: profile.username || slug,
            email,
            phone,
            location,
            summary,
            themeId: profile.theme_id || 'modern-creative',
            avatarUrl: profile.profile_picture_url || '',
            avatarHint: 'person portrait',
            website: getLink('website'),
            github,
            linkedin,
            viewCount: profile.views || 0,
            skills: splitSkills(profile.skills || []),
            links: (profile.links || []).flatMap((l: any) => {
              if (!l || typeof l !== 'object') return [l];
              if (l.type === 'linkedin') {
                const value = sanitizeSocialHandle(l.value || '', 'linkedin');
                return value ? [{ ...l, value }] : [];
              }
              if (l.type === 'github') {
                const value = sanitizeSocialHandle(l.value || '', 'github');
                return value ? [{ ...l, value }] : [];
              }
              if (l.type === 'email' && l.value) return [{ ...l, value: repairSpacedEmail(l.value) || l.value }];
              if (l.type === 'location' && l.value) return [{ ...l, value: l.value.replace(/^(?:university|college|institute|school|faculty)\s+of\s+[^,]+,\s*/i, '').trim() }];
              if (l.type === 'phone') {
                const digits = String(l.value || '').replace(/\D/g, '');
                return digits.length >= 8 ? [l] : [];
              }
              return [l];
            })
        },
        workExperience: publicWorkExperience(profile.experience || []),
        education: publicEducation(profile.education || []),
        customSections: publicCustomSections(profile.custom_sections || [])
    };
}

/** Request-scoped: generateMetadata + page share one lookup. */
export const getProfileBySlug = cache(getProfileBySlugUncached);

/** Distinguish miss (404) from outage (503). Never collapse the two. */
export async function lookupPublicProfile(slug: string): Promise<PublicProfileLookup> {
  try {
    const data = await getProfileBySlug(slug);
    return data ? { status: 'ok', data } : { status: 'missing' };
  } catch (err) {
    if (isProfileUnavailable(err)) return { status: 'unavailable' };
    throw err;
  }
}
