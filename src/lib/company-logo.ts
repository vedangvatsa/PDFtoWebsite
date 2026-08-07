/**
 * Company logo / domain resolution for /companies and job cards.
 * Prefer ATS-provided company_logo; otherwise resolve a domain for favicon APIs.
 */

import { getCompanyMeta } from '@/lib/company-data';
import companyDomains from '@/lib/company-domains.json';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cvin.bio').replace(/\/$/, '');

/**
 * Hard-coded logos for orgs without a public web favicon.
 * Indian Army emblem mirrored at /company-logos/indian-army.png (from IAIP posting asset).
 * MoSPI: national emblem from internship.mospi.gov.in favicon (mirrored at /company-logos/mospi.png).
 */
const LOGO_OVERRIDES: Record<string, string> = {
  google: `${SITE_URL}/company-logos/google.png`,
  'indian army': `${SITE_URL}/company-logos/indian-army.png`,
  'niti aayog': `${SITE_URL}/company-logos/niti-aayog.png`,
  mospi: `${SITE_URL}/company-logos/mospi.png`,
  'iit bombay': `${SITE_URL}/company-logos/iit-bombay.png`,
  elevenlabs: 'https://elevenlabs.io/favicon.ico',
};

/** Hotlink-blocked or expired CDN logos — skip and use fallbacks. */
const UNRELIABLE_LOGO_HOSTS = ['media.licdn.com', 'licdn.com', 'linkedin.com'];

function isReliableStoredLogo(url: string | null | undefined): boolean {
  if (!url || !/^https?:\/\//i.test(url)) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return !UNRELIABLE_LOGO_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

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
  mospi: 'mospi.gov.in',
  'niti aayog': 'niti.gov.in',
  'indian army': 'joinindianarmy.nic.in',
  'indian-army': 'joinindianarmy.nic.in',
  cursor: 'cursor.com',
  applied: 'applied.co',
  sierra: 'sierra.ai',
  'field ai': 'fieldai.com',
  'field-ai': 'fieldai.com',
  fieldai: 'fieldai.com',
  horizon3ai: 'horizon3.ai',
  'horizon3 ai': 'horizon3.ai',
  'horizon3-ai': 'horizon3.ai',
  shieldai: 'shield.ai',
  'shield ai': 'shield.ai',
  doordash: 'doordash.com',
  'doordash usa': 'doordash.com',
  langchain: 'langchain.com',
  nvidia: 'nvidia.com',
  hellofresh: 'hellofresh.com',
  roku: 'roku.com',
  oracle: 'oracle.com',
  deloitte: 'deloitte.com',
  sophos: 'sophos.com',
  brillio: 'brillio.com',
  hadrian: 'hadrian.co',
  skydio: 'skydio.com',
  workato: 'workato.com',
  filevine: 'filevine.com',
  hcltech: 'hcltech.com',
  'hcl tech': 'hcltech.com',
  figure: 'figure.ai',
  'base power': 'basepowercompany.com',
  'base-power': 'basepowercompany.com',
  'the exploration company': 'exploration.space',
  'the-exploration-company': 'exploration.space',
  doctolib: 'doctolib.com',
  wellhub: 'wellhub.com',
  pwc: 'pwc.com',
  thales: 'thalesgroup.com',
  aecom: 'aecom.com',
  leidos: 'leidos.com',
  citigroup: 'citigroup.com',
  'jpmorgan chase': 'jpmorganchase.com',
  'jp morgan chase': 'jpmorganchase.com',
  'oscar health': 'hioscar.com',
  'c6 bank': 'c6bank.com.br',
  deliveryhero: 'deliveryhero.com',
  'delivery hero': 'deliveryhero.com',
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

/**
 * True when the domain comes from a verified map/meta entry — not a guessed `.com`.
 * Used to avoid linking company pages to parking / NXDOMAIN hosts.
 */
export function isTrustedCompanyDomain(name: string): boolean {
  const key = name.toLowerCase().trim();
  if (DOMAIN_OVERRIDES[key]) return true;

  const slug = key.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (getCompanyMeta(slug)?.website) return true;

  const compact = key.replace(/[^a-z0-9]/g, '');
  if (DOMAIN_OVERRIDES[compact]) return true;

  const base = companyBaseName(name);
  if (base && DOMAIN_OVERRIDES[base]) return true;

  // Name already looks like a real domain (e.g. "example.io")
  if (/\.[a-z]{2,}$/i.test(key) && !/\s/.test(key)) return true;

  return false;
}

/** Official website URL for a company page, or null when we would only be guessing. */
export function trustedCompanyWebsiteUrl(
  name: string,
  slug?: string
): string | null {
  const meta = getCompanyMeta(slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  if (meta?.website) return meta.website;
  if (!isTrustedCompanyDomain(name)) return null;
  return `https://${domainForCompany(name)}`;
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
  if (isReliableStoredLogo(storedLogo)) {
    out.push(storedLogo!);
  }
  const override = LOGO_OVERRIDES[name.toLowerCase().trim()];
  if (override) out.push(override);
  // Fallback: original IAIP-hosted Indian Army emblem if CDN mirror 404s pre-deploy
  if (name.toLowerCase().trim() === 'indian army') {
    out.push(
      'https://internship.aicte-india.org/dashboard/indianarmy/images/logo/circle%20indian%20army%20logo.png'
    );
  }
  if (name.toLowerCase().trim() === 'mospi') {
    out.push('https://www.internship.mospi.gov.in/favicon.ico');
  }
  if (name.toLowerCase().trim() === 'niti aayog') {
    out.push('https://www.niti.gov.in/favicon.ico');
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
 * Prefer ATS-stored logo, else known override, else Google favicon.
 */
export function primaryCompanyLogoUrl(
  name: string,
  storedLogo?: string | null,
  size = 64
): string {
  if (isReliableStoredLogo(storedLogo)) return storedLogo!;
  const override = LOGO_OVERRIDES[name.toLowerCase().trim()];
  if (override) return override;
  return googleFaviconUrl(domainForCompany(name), size);
}
