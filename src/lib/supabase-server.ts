import { supabaseAdmin } from '@/lib/supabase-admin';
import { withTimeoutFallback, DB_BUDGET } from '@/lib/db-timeout';
import { publicCustomSections, enrichNameFromContact, normalizeName, cleanDescription, isResumeDumpText, isContactHeaderText, sanitizeSocialHandle, extractCleanSummary, repairSpacedEmail } from '@/lib/parse-guard';

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

export async function getProfileBySlug(slug: string): Promise<ServerProfileData | null> {
    const { data: profile } = await withTimeoutFallback(
      supabase.from('profiles').select('*').eq('username', slug).maybeSingle(),
      DB_BUDGET.fast,
      { data: null, error: null } as any,
      `profile-slug:${slug}`
    );
    if (!profile) return null;

    const links = Array.isArray(profile.links) ? profile.links : [];
    // Normalize ALL CAPS or all lowercase names to Title Case
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

    // Never ship section-title "names" or LinkedIn-glued last names to the public page
    const rawName = String(profile.full_name || '').trim();
    const recovered = enrichNameFromContact(rawName, {
      email: getLink('email'),
      github: sanitizeSocialHandle(getLink('github') || '', 'github'),
      linkedin: sanitizeSocialHandle(getLink('linkedin') || '', 'linkedin'),
    });
    const displayName =
      smartTitleCase(normalizeName(recovered) || normalizeName(rawName) || '') ||
      'Professional Profile';

    // Strip glued section labels; never publish a full CV dump as the summary
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

    return {
        profile: {
            userId: profile.id,
            fullName: displayName,
            slug: profile.username || slug,
            email,
            phone: getLink('phone'),
            location: getLink('location'),
            summary,
            themeId: profile.theme_id || 'modern-creative',
            avatarUrl: profile.profile_picture_url || '',
            avatarHint: 'person portrait',
            website: getLink('website'),
            github,
            linkedin,
            viewCount: profile.views || 0,
            skills: (profile.skills || []).map((s: any) => typeof s === 'string' ? s.trim() : String(s?.name ?? '').trim()).filter(Boolean),
            links: (profile.links || []).map((l: any) => {
              if (!l || typeof l !== 'object') return l;
              if (l.type === 'linkedin') return { ...l, value: sanitizeSocialHandle(l.value || '', 'linkedin') };
              if (l.type === 'github') return { ...l, value: sanitizeSocialHandle(l.value || '', 'github') };
              if (l.type === 'email' && l.value) return { ...l, value: repairSpacedEmail(l.value) || l.value };
              return l;
            })
        },
        workExperience: profile.experience || [],
        education: profile.education || [],
        // Editor-only salvage sections (e.g. "Imported CV text") stay out of the public site
        customSections: publicCustomSections(profile.custom_sections || [])
    };
}
