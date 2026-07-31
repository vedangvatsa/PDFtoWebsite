/**
 * Company logo / domain resolution for /companies and job cards.
 * Prefer ATS-provided company_logo; otherwise resolve a domain for favicon APIs.
 */

import { getCompanyMeta } from '@/lib/company-data';
import companyDomains from '@/lib/company-domains.json';

/** Normalize website value from company-domains.json to bare hostname. */
function hostFromDomainEntry(value: string): string {
  try {
    const u = new URL(value.startsWith('http') ? value : `https://${value}`);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return value.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
}

/** 2.9k known company → website map + a few high-value overrides. */
const DOMAIN_OVERRIDES: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(companyDomains as Record<string, string>).map(([k, v]) => [
      k.toLowerCase().trim(),
      hostFromDomainEntry(v),
    ])
  ),
  // High-value corrections / aliases
  google: 'google.com',
  meta: 'meta.com',
  microsoft: 'microsoft.com',
  amazon: 'amazon.com',
  apple: 'apple.com',
  elevenlabs: 'elevenlabs.io',
  openrouter: 'openrouter.ai',
  'opal security': 'opal.dev',
  opal: 'opal.dev',
  'scale ai': 'scale.com',
  scale: 'scale.com',
  'hugging face': 'huggingface.co',
  huggingface: 'huggingface.co',
  notion: 'notion.so',
  neon: 'neon.tech',
  railway: 'railway.app',
  lovable: 'lovable.dev',
  'character.ai': 'character.ai',
  'character ai': 'character.ai',
  character: 'character.ai',
  'govtech singapore': 'tech.gov.sg',
  govtech: 'tech.gov.sg',
};

const LEGAL_SUFFIX =
  /\b(inc|inc\.|incorporated|llc|l\.l\.c\.|ltd|ltd\.|limited|corp|corp\.|corporation|co|co\.|company|plc|gmbh|ag|sa|bv|nv|pty|pvt|private|public|group|holdings?|technologies|technology|tech|software|systems|solutions|labs?|studio|ventures|partners|international|global|digital|media|ai|the)\b/gi;

function hostnameFromUrl(url: string): string | null {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/** Strip legal/noise words for domain guessing. */
export function companyBaseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(LEGAL_SUFFIX, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, '');
}

/**
 * Best-effort public website host for a company name.
 */
export function domainForCompany(name: string): string {
  const key = name.toLowerCase().trim();
  if (DOMAIN_OVERRIDES[key]) return DOMAIN_OVERRIDES[key];

  // slug form in company-data
  const slug = key.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const meta = getCompanyMeta(slug);
  if (meta?.website) {
    const host = hostnameFromUrl(meta.website);
    if (host) return host;
  }

  // Compact key without spaces
  const compact = key.replace(/[^a-z0-9]/g, '');
  if (DOMAIN_OVERRIDES[compact]) return DOMAIN_OVERRIDES[compact];

  // Try base name (strip Inc/Ltd/etc.)
  const base = companyBaseName(name);
  if (base && DOMAIN_OVERRIDES[base]) return DOMAIN_OVERRIDES[base];

  // Name already looks like a domain
  if (/\.[a-z]{2,}$/i.test(key) && !/\s/.test(key)) {
    return key.replace(/^https?:\/\//, '').replace(/^www\./, '');
  }

  // Default: cleaned name + .com
  const guess = (base || compact || 'example').slice(0, 63);
  return `${guess}.com`;
}

/** Google favicon CDN (reliable, sometimes low-res for unknown domains). */
export function googleFaviconUrl(domain: string, size = 64): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}

/** DuckDuckGo icon service — good fallback when Google returns the globe. */
export function ddgIconUrl(domain: string): string {
  return `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`;
}

/** Clearbit-style logo (may 404 for smaller firms). */
export function clearbitLogoUrl(domain: string): string {
  return `https://logo.clearbit.com/${encodeURIComponent(domain)}`;
}

/** Initials avatar — always works. */
export function initialsLogoUrl(name: string, size = 64): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=18181b&color=fff&size=${size}&bold=true&format=png`;
}

/**
 * Ordered logo candidates for a company.
 * Client walks the list on error / tiny default favicon.
 */
export function companyLogoCandidates(
  name: string,
  storedLogo?: string | null,
  size = 64
): string[] {
  const domain = domainForCompany(name);
  const out: string[] = [];
  if (storedLogo && /^https?:\/\//i.test(storedLogo)) {
    out.push(storedLogo);
  }
  out.push(googleFaviconUrl(domain, size));
  out.push(ddgIconUrl(domain));
  out.push(clearbitLogoUrl(domain));
  out.push(initialsLogoUrl(name, size));
  // de-dupe
  return [...new Set(out)];
}

/**
 * Single best logo URL for server-rendered lists (no client fallback waterfall).
 * Prefer ATS-stored logo, else Google favicon for the resolved domain.
 */
export function primaryCompanyLogoUrl(
  name: string,
  storedLogo?: string | null,
  size = 64
): string {
  if (storedLogo && /^https?:\/\//i.test(storedLogo)) return storedLogo;
  return googleFaviconUrl(domainForCompany(name), size);
}
