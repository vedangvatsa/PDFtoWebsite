/**
 * Verified website + social URLs for company hubs.
 * Overlay wins over curated company-data socials so we can correct bad handles
 * without rewriting every CompanyMeta block.
 */
import { getCompanyMeta } from '@/lib/company-data';
import { toCompanyKey } from '@/lib/company-directory';
import overlay from '@/lib/company-links.json';

export type CompanyLinks = {
  website?: string;
  x?: string;
  linkedin?: string;
  github?: string;
};

const OVERLAY = overlay as Record<string, CompanyLinks>;

function overlayFor(slugOrName: string): CompanyLinks {
  const key = toCompanyKey(slugOrName);
  const compact = key.replace(/-/g, '');
  const raw = String(slugOrName || '').trim().toLowerCase();
  for (const candidate of [raw, key, compact]) {
    if (candidate && OVERLAY[candidate]) return OVERLAY[candidate];
  }
  return {};
}

/** Merged official links: overlay first, then hand-curated company-data. */
export function getCompanyLinks(slugOrName: string): CompanyLinks {
  const extra = overlayFor(slugOrName);
  const key = toCompanyKey(slugOrName);
  const compact = key.replace(/-/g, '');
  const meta =
    (key && getCompanyMeta(key)) || (compact && getCompanyMeta(compact)) || null;
  return {
    website: extra.website || meta?.website,
    x: extra.x || meta?.socials?.x,
    linkedin: extra.linkedin || meta?.socials?.linkedin,
    github: extra.github || meta?.socials?.github,
  };
}
