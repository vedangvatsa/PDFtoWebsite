/**
 * Company logo / domain resolution for /companies and job cards.
 * Prefer ATS-provided company_logo; otherwise resolve a domain for favicon APIs.
 */

import { getCompanyMeta } from '@/lib/company-data';
import companyDomains from '@/lib/company-domains.json';
import companyLinksOverlay from '@/lib/company-links.json';
import { hostnameOf, isAtsVendorHost, registrableHostLabel } from '@/lib/company-host.mjs';
import { isLowQualityApplySource } from '@/lib/job-apply-hosts.mjs';

const LOGO_OVERRIDES: Record<string, string> = {
  google: '/company-logos/google.png',
  'indian army': '/company-logos/indian-army.png',
  'niti aayog': '/company-logos/niti-aayog.png',
  mospi: '/company-logos/mospi.png',
  'iit bombay': '/company-logos/iit-bombay.png',
  'iit bombay (sjmsom)': '/company-logos/iit-bombay.png',
  nasa: '/company-logos/nasa.png',
  iisc: '/company-logos/iisc.png',
  'indian institute of science': '/company-logos/iisc.png',
  govai: '/company-logos/govai.png',
  governance: '/company-logos/govai.png',
  'governance ai': '/company-logos/govai.png',
  anthropic: '/company-logos/anthropic.png',
  apple: '/company-logos/apple.png',
  era: '/company-logos/era.png',
  'era fellowship': '/company-logos/era.png',
  mats: '/company-logos/mats.png',
  spar: '/company-logos/spar.png',
  'horizon institute for public service': '/company-logos/horizon.png',
  horizonpublicservice: '/company-logos/horizon.png',
  'aspen tech policy hub': '/company-logos/aspen-tech-policy-hub.png',
  aspentechpolicyhub: '/company-logos/aspen-tech-policy-hub.png',
  'its rio': '/company-logos/its-rio.png',
  'the new york times': '/company-logos/the-new-york-times.png',
  'the good food institute': '/company-logos/the-good-food-institute.png',
  cern: '/company-logos/cern.png',
  'j street': '/company-logos/j-street.png',
  jstreet: '/company-logos/j-street.png',
  'scale ai': '/company-logos/scale-ai.png',
  anduril: '/company-logos/anduril.png',
  'anduril industries': '/company-logos/anduril.png',
  doordash: '/company-logos/doordash.png',
  'doordash usa': '/company-logos/doordash.png',
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
  era: 'erafellowship.org',
  'era fellowship': 'erafellowship.org',
  erafellowship: 'erafellowship.org',
  nasa: 'nasa.gov',
  iisc: 'iisc.ac.in',
  'indian institute of science': 'iisc.ac.in',
  govai: 'governance.ai',
  governance: 'governance.ai',
  'governance ai': 'governance.ai',
  mats: 'matsprogram.org',
  spar: 'sparai.org',
  'horizon institute for public service': 'horizonpublicservice.org',
  horizonpublicservice: 'horizonpublicservice.org',
  'aspen tech policy hub': 'aspentechpolicyhub.org',
  aspentechpolicyhub: 'aspentechpolicyhub.org',
  'its rio': 'itsrio.org',
  'the new york times': 'nytimes.com',
  'new york times': 'nytimes.com',
  'the good food institute': 'gfi.org',
  cern: 'home.cern',
  handshake: 'joinhandshake.com',
  'j street': 'jstreet.org',
  jstreet: 'jstreet.org',
  'alliance defending freedom': 'adflegal.org',
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

const LOGO_FORM_HOSTS = new Set(['airtable', 'typeform', 'google', 'gle', 'notion']);

function logoHostFromApply(applyUrl?: string | null): string | null {
  if (!applyUrl) return null;
  if (isLowQualityApplySource(applyUrl)) return null;
  const host = hostnameFromUrl(applyUrl) || hostnameOf(applyUrl);
  if (!host || isAtsVendorHost(host)) return null;
  const brand = registrableHostLabel(host);
  if (!brand || LOGO_FORM_HOSTS.has(brand)) return null;
  return host;
}

/**
 * Best-effort public website host for a company name.
 */
export function domainForCompany(name: string, applyUrl?: string | null): string {
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

  const fromApply = logoHostFromApply(applyUrl);
  if (fromApply) return fromApply;

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

/**
 * Last line of defense against fabricated domains: the resolved hostname must
 * share a meaningful token with the company name (or be a verified meta entry).
 * Catches map entries that point at a real-but-unrelated site (e.g. a company
 * name resolving to an unrelated brand's domain). Meta websites are verified
 * by hand and always trusted; map entries must pass the token check.
 */
// Known-good aliases where the live brand name differs from the ATS company
// label (rebrands / short domains). Never surfaced unless the domain map or
// meta already resolves them.
const VERIFIED_ALIAS_HOSTS = new Set([
  'mtch.com', 'mesh.xyz',
  // short-buyout / initials domains that resolve to the real brand
  'gwng.ca', 'sigcorp.com', 'divrad.com', 'fool.com', 'lg.com', 'air.org',
  'bndlstech.com', '5ipro.com', 'gc.com', 'circlein.com', 'svb.ro',
  'cenvironment.com', 'fbtm.com', 'hub.ca', 'jbcvi.com', 'liocegroup.com',
  'population.io', 'compact.org', 'ohf.org.nz', 'flyapg.com', 'buzzfeed.com',
  'eastgear-int.com', 'imembersdb.com', 'sqfi.com', 'itsasap.com', 'x-team.com',
  'avid4.com', 'arcteryx.com', 'asg.co.za', 'fleetinc.co.uk',
  'featherrivercamp.com', 'passports.io', 'dss.asia', 'pdx.net', 'teamweitz.com',
  'tech.gov.sg', 'ltvco.com',
]);
function hostnameMatchesCompany(name: string, host: string): boolean {
  const key = name.toLowerCase().trim();
  const slug = key.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (getCompanyMeta(slug)?.website) return true;
  if (VERIFIED_ALIAS_HOSTS.has(host.toLowerCase())) return true;

  const hostClean = host.toLowerCase().replace(/[^a-z0-9]/g, '');
  const baseClean = (companyBaseName(name) || key).toLowerCase().replace(/[^a-z0-9]/g, '');

  // Exact: host base equals the cleaned name ("rev" <-> "rev.com").
  const hostBase = hostClean.replace(/\.(com|co|io|ai|net|org|dev|app|tech|xyz|ca|jp|uk|de|fr|ru|br|in|it|ro|vn|hk|sg)$/, '');
  if (baseClean.length >= 2 && hostBase === baseClean) return true;
  if (baseClean.length >= 4 && (hostClean.includes(baseClean) || baseClean.includes(hostClean))) return true;

  // Meaningful token present in the host.
  const tokens = [...new Set(baseClean.split(/[^a-z0-9]+/).filter((w) => w.length > 3))];
  if (tokens.length === 0) return true; // nothing to verify against
  if (tokens.some((w) => hostClean.includes(w) || hostClean.includes(w.slice(0, 5)))) return true;

  // Abbreviation / initials pattern (e.g. "Strata Information Group" -> "sigcorp").
  const rawWords = key.split(/[^a-z0-9]+/).filter((w) => w.length > 2 && w !== 'the' && w !== 'and');
  if (rawWords.length >= 2) {
    const initials = rawWords.map((w) => w[0]).join('');
    if (initials.length >= 2 && hostClean.startsWith(initials)) return true;
    if (hostClean.startsWith(rawWords[0].slice(0, 4))) return true;
  }

  return false;
}

function overlayWebsiteFor(slug?: string, name?: string): string | null {
  const overlay = companyLinksOverlay as Record<string, { website?: string }>;
  const keys = [slug, name]
    .filter(Boolean)
    .map((s) =>
      String(s)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    );
  for (const key of keys) {
    const compact = key.replace(/-/g, '');
    const website = overlay[key]?.website || overlay[compact]?.website;
    if (website) return website;
  }
  return null;
}

function domainFromSlug(slug?: string): string | null {
  if (!slug) return null;
  const s = slug.toLowerCase().trim();
  for (const candidate of [s, s.replace(/-/g, ' '), s.replace(/-/g, '')]) {
    if (DOMAIN_OVERRIDES[candidate]) return DOMAIN_OVERRIDES[candidate];
  }
  return null;
}

/** Official website URL for a company page, or null when we would only be guessing. */
export function trustedCompanyWebsiteUrl(
  name: string,
  slug?: string
): string | null {
  const overlayWebsite = overlayWebsiteFor(slug, name);
  if (overlayWebsite) return overlayWebsite;
  const meta = getCompanyMeta(slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  if (meta?.website) return meta.website;
  const slugHost = domainFromSlug(slug);
  if (slugHost) return `https://${slugHost}`;
  if (!isTrustedCompanyDomain(name)) return null;
  const host = domainForCompany(name);
  if (!hostnameMatchesCompany(name, host)) return null;
  return `https://${host}`;
}

/** Google Search favicon CDN — returns a real mark at 32/64/128, not the 16px globe. */
export function googleFaviconUrl(domain: string, size = 64): string {
  const s = size >= 128 ? 128 : size >= 64 ? 64 : 32;
  return `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(`https://${domain}`)}&size=${s}`;
}

export function googleS2FaviconUrl(domain: string, size = 64): string {
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

function companyLogoSlug(name: string): string {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function localLogoPaths(name: string): string[] {
  const slug = companyLogoSlug(name);
  const compact = slug.replace(/-/g, '');
  const out: string[] = [];
  if (slug) out.push(`/company-logos/${slug}.png`);
  if (compact && compact !== slug) out.push(`/company-logos/${compact}.png`);
  const override = LOGO_OVERRIDES[name.toLowerCase().trim()];
  if (override) out.push(override);
  return out;
}

/**
 * Ordered logo candidates for a company.
 * Client walks the list on error / tiny default favicon.
 */
export function companyLogoCandidates(
  name: string,
  storedLogo?: string | null,
  size = 64,
  applyUrl?: string | null
): string[] {
  const domain = domainForCompany(name, applyUrl);
  const out: string[] = [];
  if (isReliableStoredLogo(storedLogo) && !/google\.com\/s2\/favicons|gstatic\.com\/favicon/i.test(storedLogo!)) {
    out.push(storedLogo!);
  }
  out.push(...localLogoPaths(name));
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
  out.push(googleS2FaviconUrl(domain, size));
  out.push(ddgIconUrl(domain));
  out.push(initialsLogoUrl(name, size));
  return [...new Set(out)];
}

/**
 * Single best logo URL for server-rendered lists (no client fallback waterfall).
 * Prefer ATS-stored logo, else known override, else Google favicon.
 */
export function primaryCompanyLogoUrl(
  name: string,
  storedLogo?: string | null,
  size = 64,
  applyUrl?: string | null
): string {
  const first = companyLogoCandidates(name, storedLogo, size, applyUrl)[0];
  return first || googleFaviconUrl(domainForCompany(name, applyUrl), size);
}
