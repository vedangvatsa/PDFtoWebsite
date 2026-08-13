/**
 * Shared company directory normalization for /companies rebuild + page fallbacks.
 */

export function toCompanySlug(name: string): string {
  return name
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/-+$/, '')
    .replace(/^-+/, '');
}

/**
 * Stable join key for jobs.company_key (and companies.slug).
 * Prefer equality on this over ILIKE company scans on public pages.
 */
export function toCompanyKey(name: string): string {
  return toCompanySlug(name || '');
}

/** Known brand casing — only where Title Case of the label is wrong. */
const BRAND_DISPLAY_NAMES: Record<string, string> = {
  elevenlabs: 'ElevenLabs',
  togetherai: 'Together AI',
  'together ai': 'Together AI',
  openrouter: 'OpenRouter',
  opensea: 'OpenSea',
  devops: 'DevOps',
  runpod: 'RunPod',
  supabase: 'Supabase',
  vercel: 'Vercel',
  github: 'GitHub',
  gitlab: 'GitLab',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  paypal: 'PayPal',
  mckinsey: 'McKinsey',
  jpmorgan: 'JPMorgan',
  'jp morgan': 'JPMorgan',
};

/** Host → public brand, only when the registrable label is not the brand. */
const HOST_BRANDS: Record<string, string> = {
  'governance.ai': 'GovAI',
  'x.ai': 'xAI',
};

/** Common org / place tokens used to split mashed domain labels (apartresearch). */
const MASHED_TOKENS = [
  'research', 'network', 'policy', 'institute', 'initiative', 'fellowship',
  'center', 'centre', 'safety', 'health', 'watch', 'bulletin',
  'education', 'congress', 'studio', 'labs', 'group', 'systems', 'solutions',
  'global', 'foundation', 'university', 'college', 'technologies', 'technology',
  'digital', 'media', 'capital', 'ventures', 'partners', 'consulting',
  'analytics', 'security', 'software', 'robotics', 'robotic',
  'texas', 'california', 'colorado', 'florida', 'georgia', 'washington',
  'york', 'jersey', 'india', 'canada', 'europe',
];

/** After the first suffix peel, only keep stacking these org words. */
const STACKABLE_MASHED = new Set([
  'research', 'network', 'policy', 'institute', 'initiative', 'fellowship',
  'safety', 'education', 'foundation', 'university', 'college',
]);

function titleCaseWord(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/** apartresearch → Apart Research; csepf → Csepf; wvu → WVU */
export function splitMashedLabel(raw: string): string {
  const s = String(raw || '').replace(/[-_]+/g, ' ').trim();
  if (!s) return s;
  if (/\s/.test(s)) return s.split(/\s+/).map(titleCaseWord).join(' ');
  if (/\./.test(s)) {
    return s.replace(/(^|[.\s-])([a-z])/g, (_, a: string, b: string) => a + b.toUpperCase());
  }
  if (/^[a-z]{2,4}$/i.test(s)) return s.toUpperCase();
  const lower = s.toLowerCase();
  const tokens = [...MASHED_TOKENS].sort((a, b) => b.length - a.length);
  const parts: string[] = [];
  let rest = lower;
  let peeled = true;
  let peels = 0;
  while (peeled && rest.length > 2) {
    peeled = false;
    for (const t of tokens) {
      if (rest.endsWith(t) && rest.length > t.length + 1) {
        if (peels > 0 && !STACKABLE_MASHED.has(t)) continue;
        parts.unshift(t);
        rest = rest.slice(0, -t.length);
        peeled = true;
        peels += 1;
        break;
      }
    }
  }
  if (rest) parts.unshift(rest);
  return parts.map(titleCaseWord).join(' ');
}

function mappedBrand(label: string): string | undefined {
  const lower = String(label || '').trim().toLowerCase();
  if (!lower) return undefined;
  const slug = toCompanySlug(label);
  const compact = slug.replace(/-/g, '');
  return (
    COMPANY_NAME_MAP[lower] ||
    COMPANY_NAME_MAP[slug] ||
    COMPANY_NAME_MAP[compact] ||
    BRAND_DISPLAY_NAMES[slug] ||
    BRAND_DISPLAY_NAMES[compact] ||
    BRAND_DISPLAY_NAMES[lower]
  );
}

function brandedLabel(label: string): string {
  return mappedBrand(label) || splitMashedLabel(label);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hostnameOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Display name for a company on job pages.
 * applyUrl is used when the stored name is a subdomain or mashed domain label —
 * so every host of that shape is fixed, not a per-company list.
 */
export function companyDisplayName(
  name: string | null | undefined,
  applyUrl?: string | null
): string {
  if (!name) return name || '';
  const trimmed = String(name).trim();
  const host = hostnameOf(applyUrl);
  if (host && HOST_BRANDS[host]) return HOST_BRANDS[host];

  if (host) {
    const labels = host.split('.').filter(Boolean);
    const sld = labels.length >= 2 ? labels[labels.length - 2] : labels[0];
    const tld = labels[labels.length - 1] || '';
    const stored = toCompanySlug(trimmed);
    if (HOST_BRANDS[`${sld}.${tld}`]) return HOST_BRANDS[`${sld}.${tld}`];
    // Stored name is a host label (subdomain), not the registrable brand.
    if (stored !== sld && labels.includes(stored) && sld.length >= 2) {
      return brandedLabel(sld);
    }
  }

  const mapped = mappedBrand(trimmed);
  if (mapped) return mapped;

  // Smashed domain labels, including Title Case ("Apartresearch", "talosnetwork")
  if (!/\s/.test(trimmed) && /^[A-Za-z0-9._-]+$/.test(trimmed)) {
    const split = splitMashedLabel(trimmed);
    if (/\s/.test(split)) return split;
    if (/^[a-z0-9._-]+$/.test(trimmed)) return split;
  }

  // "acme corp" / "STRIPE" — uniform case with spaces
  const hasLower = /[a-z]/.test(trimmed);
  const hasUpper = /[A-Z]/.test(trimmed);
  if (
    !(hasLower && hasUpper) &&
    /[a-zA-Z]/.test(trimmed) &&
    /^[a-zA-Z0-9][a-zA-Z0-9 .'_-]*$/.test(trimmed)
  ) {
    return splitMashedLabel(trimmed);
  }

  return trimmed.replace(/\s+(?:usa|u\.s\.a?\.?|uk)$/i, '').trim() || trimmed;
}

/**
 * Rewrite stored/lowercase company mentions in page copy to the public brand.
 * Skips HTML attributes and hostnames (openai.com).
 */
export function applyCompanyDisplayCasing(
  text: string,
  rawName: string | null | undefined,
  displayName: string | null | undefined
): string {
  const raw = String(rawName || '').trim();
  const display = String(displayName || '').trim();
  if (!text || !display) return text;

  const variants = new Set<string>();
  const add = (s: string) => {
    const v = String(s || '').trim();
    if (v.length >= 2 && v !== display) variants.add(v);
  };

  if (raw && raw !== display) {
    add(raw);
    add(toCompanySlug(raw));
    add(toCompanySlug(raw).replace(/-/g, ' '));
    if (raw === raw.toLowerCase() || /^[A-Z0-9._-]+$/.test(raw)) {
      add(splitMashedLabel(raw));
    }
  }

  // OpenAI/GitHub-style brands: Title Case of the slug is wrong, so rewrite it.
  const slug = toCompanySlug(display);
  const titleOfSlug = splitMashedLabel(slug);
  if (display !== titleOfSlug && slug.length >= 3) {
    add(slug);
    add(slug.replace(/-/g, ' '));
    add(titleOfSlug);
  }

  const list = [...variants].sort((a, b) => b.length - a.length);
  if (!list.length) return text;

  const applyToText = (chunk: string) => {
    let out = chunk;
    for (const v of list) {
      const re = new RegExp(
        `(?<![\\w/@])${escapeRegExp(v)}(?![\\w]|\\.(?:com|io|ai|org|net|co|dev|app|so|gg)\\b)`,
        'g'
      );
      out = out.replace(re, display);
    }
    return out;
  };

  if (!/<[a-z]/i.test(text)) return applyToText(text);
  return text.replace(/(<[^>]+>)|([^<]+)/gi, (_full, tag?: string, txt?: string) =>
    tag ? tag : applyToText(txt || '')
  );
}

/** Junk/test company names to exclude entirely */
export const COMPANY_BLOCKLIST = new Set([
  'leverdemo 8',
  'getwingapp',
  'leverdemo',
  'test company',
  'demo company',
  'smart working solutions',
  'confidential',
  '10xteam',
  'careers - think digitally',
  'careers.azx.io',
  'brook hiddink - highticket.io',
  'unknown',
  'n/a',
  'na',
  'none',
  'null',
  'undefined',
  'company',
  'hiring',
  'jobs',
  'careers',
  'recruitment',
  'staffing',
  'tbd',
  'tba',
  'self-employed',
  'self employed',
  'freelance',
  'various',
  'multiple companies',
]);

/**
 * True if a company label looks like ATS junk / parse garbage (not a real brand).
 * Used by llms.txt, company hubs, and directory rebuilds.
 */
export function isJunkCompanyName(raw: string): boolean {
  const name = (raw || '').trim();
  if (!name || name.length < 2) return true;
  if (name.includes('...')) return true;
  const lower = name.toLowerCase();
  if (COMPANY_BLOCKLIST.has(lower)) return true;
  // Leading noise: "100 Salesforce", "1100 Micron…", "@GLC", "+MEDRITE"
  if (/^[\d@+\#\*]+/.test(name) && !/^(1password|1inch|2modern|3m|6sense|7-eleven|10x|15five|21shares)/i.test(name)) {
    // Allow known brands that start with digits; block generic "100 Foo Inc" patterns
    if (/^\d{2,}\s/.test(name) || /^@/.test(name) || /^\+/.test(name)) return true;
  }
  // Pure numeric / id-like
  if (/^[\d\s\-_.]+$/.test(name)) return true;
  // Mostly symbols / emoji
  const letters = name.replace(/[^a-zA-Z]/g, '');
  if (letters.length < 2) return true;
  // URL / email fragments used as company
  if (/^(https?:|www\.)/i.test(name) || name.includes('://')) return true;
  if (/@/.test(name) && !/\.ai\b/i.test(name)) return true;
  // "Careers - Foo", "Jobs at Foo" as company field
  if (/^(careers?|jobs?|hiring)\s*[-–—|:]/i.test(name)) return true;
  return false;
}

/** Prefer a cleaner display name for the same slug (fewer leading digits, better casing). */
function preferCompanyDisplayName(a: string, b: string): string {
  const score = (n: string) => {
    let s = 0;
    if (!/^\d/.test(n)) s += 5;
    if (!/^@/.test(n)) s += 2;
    if (n === n.replace(/\b\w/g, (c) => c.toUpperCase()) || /[A-Z]/.test(n)) s += 1;
    if (n.length >= 3 && n.length <= 40) s += 1;
    if (COMPANY_NAME_MAP[n.toLowerCase()]) s += 10;
    return s - (n.match(/\d/g) || []).length * 0.1;
  };
  return score(a) >= score(b) ? a : b;
}

/** Normalize variant company names to canonical form */
export const COMPANY_NAME_MAP: Record<string, string> = {
  'doordash usa': 'DoorDash',
  doordash: 'DoorDash',
  'shopback 2': 'ShopBack',
  shopback: 'ShopBack',
  'brillio 2': 'Brillio',
  brillio: 'Brillio',
  lyrahealth: 'Lyra Health',
  'lyra health': 'Lyra Health',
  ciandt: 'CI&T',
  'ci&t': 'CI&T',
  'hadrian-automation': 'Hadrian',
  hadrian: 'Hadrian',
  'relativity space': 'Relativity',
  relativity: 'Relativity',
  'scale ai': 'Scale AI',
  scale: 'Scale AI',
  'unity technologies': 'Unity',
  unity: 'Unity',
  'base-power': 'Base Power',
  'heidihealth.com.au': 'Heidi Health',
  'roadsurfer.com': 'Roadsurfer',
  'the-exploration-company': 'The Exploration Company',
  'finni-health': 'Finni Health',
  'apex-technology-inc': 'Apex Technology',
  northwoodspace: 'Northwood Space',
  horizon3ai: 'Horizon3.ai',
  marianaminerals: 'Mariana Minerals',
  'vertical-aerospace': 'Vertical Aerospace',
  'govtech singapore': 'GovTech',
  'govtech ': 'GovTech',
  'amplitude ': 'Amplitude',
  'kraken.com': 'Kraken',
  kraken: 'Kraken',
  'chime financial, inc': 'Chime',
  'gusto, inc.': 'Gusto',
  openai: 'OpenAI',
  airwallex: 'Airwallex',
  snowflake: 'Snowflake',
  deel: 'Deel',
  notion: 'Notion',
  vanta: 'Vanta',
  ramp: 'Ramp',
  cohere: 'Cohere',
  langchain: 'LangChain',
  plaid: 'Plaid',
  perplexity: 'Perplexity',
  replit: 'Replit',
  clickup: 'ClickUp',
  cursor: 'Cursor',
  socure: 'Socure',
  sentry: 'Sentry',
  persona: 'Persona',
  sanity: 'Sanity',
  pleo: 'Pleo',
  sardine: 'Sardine',
  modal: 'Modal',
  drata: 'Drata',
  attio: 'Attio',
  twenty: 'Twenty',
  linear: 'Linear',
  infisical: 'Infisical',
  writer: 'Writer',
  confluent: 'Confluent',
  semgrep: 'Semgrep',
  livekit: 'LiveKit',
  anyscale: 'Anyscale',
  plain: 'Plain',
  column: 'Column',
  unit: 'Unit',
  supabase: 'Supabase',
  render: 'Render',
  trivago: 'trivago',
  oyster: 'Oyster',
  character: 'Character.AI',
  n8n: 'n8n',
  posthog: 'PostHog',
  stream: 'Stream',
  railway: 'Railway',
  mindvalley: 'Mindvalley',
  resend: 'Resend',
  neon: 'Neon',
  statsig: 'Statsig',
  stytch: 'Stytch',
  runway: 'Runway',
  clerk: 'Clerk',
  axiom: 'Axiom',
  inngest: 'Inngest',
  causal: 'Causal',
  doppler: 'Doppler',
  hightouch: 'Hightouch',
  huggingface: 'Hugging Face',
  consensys: 'ConsenSys',
  gopuff: 'Gopuff',
  spotify: 'Spotify',
  deliveroo: 'Deliveroo',
  okta: 'Okta',
  klaviyo: 'Klaviyo',
  robinhood: 'Robinhood',
  jfrog: 'JFrog',
  handshake: 'Handshake',
  palantir: 'Palantir',
  lyft: 'Lyft',
  coinbase: 'Coinbase',
  hostinger: 'Hostinger',
  instacart: 'Instacart',
  remote: 'Remote',
  dropbox: 'Dropbox',
  duolingo: 'Duolingo',
  cribl: 'Cribl',
  databricks: 'Databricks',
  harvey: 'Harvey',
  everai: 'EverAI',
  applied: 'Applied',
  illumio: 'Illumio',
  instructure: 'Instructure',
  deepl: 'DeepL',
  siteminder: 'SiteMinder',
  gamma: 'Gamma',
  lovable: 'Lovable',
  floqast: 'FloQast',
  elfbeauty: 'e.l.f. Beauty',
  swordhealth: 'Sword Health',
  rothys: "Rothy's",
};

export function canonicalizeCompanyName(raw: string): string | null {
  const trimmed = (raw || '').trim();
  if (!trimmed || trimmed.includes('...')) return null;
  if (isJunkCompanyName(trimmed)) return null;
  const lower = trimmed.toLowerCase();
  if (COMPANY_BLOCKLIST.has(lower)) return null;
  return companyDisplayName(trimmed);
}
