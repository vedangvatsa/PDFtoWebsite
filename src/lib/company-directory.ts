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
export function preferCompanyDisplayName(a: string, b: string): string {
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
  return COMPANY_NAME_MAP[lower] || trimmed;
}
