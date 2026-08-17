/**
 * Host → company brand. Single implementation for Next and ingest scripts.
 *
 * Never treat a public-suffix node as the brand:
 *   iisc.ac.in → iisc (not ac)
 *   bbc.co.uk  → bbc (not co)
 *   foo.edu.au → foo (not edu)
 *
 * Do not copy this list into other files.
 */

/** Multi-part public suffixes. labels[-2] here is a registry, not a company. */
export const COMPOUND_PUBLIC_SUFFIXES = new Set([
  'ac.in', 'edu.in', 'res.in', 'co.in', 'gov.in', 'net.in', 'org.in', 'mil.in', 'nic.in', 'ernet.in',
  'ac.uk', 'co.uk', 'gov.uk', 'org.uk', 'net.uk', 'ltd.uk', 'plc.uk', 'me.uk', 'sch.uk',
  'com.au', 'net.au', 'org.au', 'edu.au', 'gov.au', 'asn.au', 'id.au',
  'co.nz', 'ac.nz', 'org.nz', 'govt.nz', 'net.nz', 'school.nz',
  'co.jp', 'ac.jp', 'ad.jp', 'ed.jp', 'go.jp', 'gr.jp', 'lg.jp', 'ne.jp', 'or.jp',
  'com.br', 'org.br', 'gov.br', 'edu.br', 'net.br',
  'co.za', 'ac.za', 'org.za', 'gov.za', 'net.za', 'web.za',
  'com.sg', 'edu.sg', 'gov.sg', 'org.sg', 'net.sg',
  'com.hk', 'edu.hk', 'gov.hk', 'org.hk', 'net.hk',
  'co.kr', 'ac.kr', 'go.kr', 'or.kr', 'ne.kr', 're.kr',
  'com.mx', 'gob.mx', 'org.mx', 'edu.mx', 'net.mx',
  'com.ar', 'gob.ar', 'org.ar', 'edu.ar',
  'com.tw', 'edu.tw', 'gov.tw', 'org.tw', 'net.tw',
  'com.cn', 'edu.cn', 'gov.cn', 'ac.cn', 'org.cn', 'net.cn',
  'co.il', 'ac.il', 'org.il', 'gov.il', 'net.il',
  'co.id', 'ac.id', 'go.id', 'or.id', 'web.id', 'sch.id',
  'com.my', 'edu.my', 'gov.my', 'org.my', 'net.my',
  'co.th', 'ac.th', 'go.th', 'or.th', 'in.th',
  'com.ph', 'edu.ph', 'gov.ph', 'org.ph',
  'com.pk', 'edu.pk', 'gov.pk', 'org.pk', 'net.pk',
  'com.ng', 'edu.ng', 'gov.ng', 'org.ng', 'net.ng',
  'com.tr', 'edu.tr', 'gov.tr', 'org.tr', 'net.tr',
  'co.ke', 'ac.ke', 'go.ke', 'or.ke', 'sc.ke', 'ne.ke', 'me.ke',
  'com.ua', 'org.ua', 'gov.ua', 'edu.ua', 'net.ua',
  'com.pl', 'edu.pl', 'gov.pl', 'org.pl', 'net.pl',
  'co.ao', 'edu.ao', 'gov.ao',
  'ac.ir', 'co.ir', 'gov.ir',
]);

/** Registry operator labels — never a company brand. */
export const REGISTRY_LABELS = new Set([
  'ac', 'co', 'com', 'net', 'org', 'edu', 'gov', 'gob', 'go', 'or', 'ne', 'res',
  'mil', 'sch', 'govt', 'ed', 'ad', 'gr', 'lg', 'nic', 'int', 'nom', 'web',
  'asn', 'gen', 'per', 'ltd', 'plc', 'idv', 'muni', 'idf', 'ernet',
]);

/** Host → public brand, only when the registrable label is not the brand. */
export const HOST_BRANDS = {
  'governance.ai': 'GovAI',
  'x.ai': 'xAI',
  'iisc.ac.in': 'IISc',
  'erafellowship.org': 'ERA',
  'nasa.gov': 'NASA',
  'sequoiacap.com': 'Sequoia Capital',
};

/** Mixed-case / known labels that Title Case / ALL CAPS would get wrong. */
export const SHORT_BRANDS = {
  iisc: 'IISc',
  era: 'ERA',
  nasa: 'NASA',
  sequoiacap: 'Sequoia Capital',
  sequoiacapital: 'Sequoia Capital',
};

export function hostnameOf(url) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return null;
  }
}

export function compactCompanyLabel(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

export function isRegistryCompanyLabel(name) {
  const compact = compactCompanyLabel(name);
  return Boolean(compact) && REGISTRY_LABELS.has(compact);
}

/**
 * Placeholder employer names from aggregators (JSearch `employer_name: Other`,
 * RiseIn `/other/…` path buckets). Never a public brand. Do not treat apply-URL
 * path segments as the company — that is how `/other/` became "Other".
 */
export const GENERIC_COMPANY_LABELS = new Set([
  'other', 'unknown', 'company', 'companies', 'job', 'jobs', 'career', 'careers',
  'hiring', 'various', 'none', 'null', 'undefined', 'na', 'tba', 'tbd',
  'confidential', 'selfemployed', 'freelance', 'recruitment', 'staffing',
  'multiplecompanies', 'notapplicable',
]);

export function isGenericCompanyLabel(name) {
  const compact = compactCompanyLabel(name);
  return Boolean(compact) && GENERIC_COMPANY_LABELS.has(compact);
}

/** Brand label of a host: iisc.ac.in → iisc, jobs.stripe.com → stripe. */
export function registrableHostLabel(host) {
  const labels = String(host || '')
    .replace(/^www\./i, '')
    .toLowerCase()
    .split('.')
    .filter(Boolean);
  if (labels.length === 0) return '';
  if (labels.length === 1) return labels[0];
  const last = labels[labels.length - 1];
  const second = labels[labels.length - 2];
  const pair = `${second}.${last}`;
  if (COMPOUND_PUBLIC_SUFFIXES.has(pair) && labels.length >= 3) {
    return labels[labels.length - 3];
  }
  if (labels.length >= 3 && last.length === 2 && REGISTRY_LABELS.has(second)) {
    return labels[labels.length - 3];
  }
  return second;
}

/** ATS products — never the employer brand (asgi.bamboohr.com is not BambooHR). */
export const ATS_VENDOR_LABELS = new Set([
  'bamboohr', 'greenhouse', 'lever', 'ashbyhq', 'ashby', 'smartrecruiters',
  'workday', 'myworkdayjobs', 'icims', 'jobvite', 'recruitee', 'breezy',
  'workable', 'personio', 'greenhouseio',
]);

const ATS_TENANT_SKIP = new Set([
  'www', 'jobs', 'job', 'boards', 'board', 'app', 'careers', 'apply', 'cdn',
]);

export function isAtsVendorHost(host) {
  const brand = registrableHostLabel(host);
  return Boolean(brand) && ATS_VENDOR_LABELS.has(brand);
}

function labelToDisplay(label) {
  const compact = compactCompanyLabel(label);
  if (!compact) return String(label || '').trim();
  if (SHORT_BRANDS[compact]) return SHORT_BRANDS[compact];
  if (/^[a-z]{2,4}$/.test(compact)) return compact.toUpperCase();
  return compact.charAt(0).toUpperCase() + compact.slice(1);
}

/**
 * Repair a stored company using the apply URL.
 * Never returns a registry operator (AC, CO, EDU, GOV) when the host has a real brand.
 */
export function companyNameFromApply(name, applyUrl) {
  const trimmed = String(name || '').trim();
  const host = hostnameOf(applyUrl);
  if (!host) {
    const compact = compactCompanyLabel(trimmed);
    return SHORT_BRANDS[compact] || trimmed;
  }
  if (HOST_BRANDS[host]) return HOST_BRANDS[host];

  const labels = host.split('.').filter(Boolean);
  const brandLabel = registrableHostLabel(host);
  if (isAtsVendorHost(host)) {
    if (
      trimmed &&
      !isGenericCompanyLabel(trimmed) &&
      !isRegistryCompanyLabel(trimmed) &&
      compactCompanyLabel(trimmed) !== brandLabel
    ) {
      return trimmed;
    }
    const tenant = labels.find(
      (l) =>
        l &&
        !ATS_TENANT_SKIP.has(l) &&
        !ATS_VENDOR_LABELS.has(l) &&
        !REGISTRY_LABELS.has(l) &&
        !isGenericCompanyLabel(l)
    );
    if (tenant) return labelToDisplay(tenant);
    return trimmed;
  }
  const tld = labels[labels.length - 1] || '';
  const stored = compactCompanyLabel(trimmed);
  if (brandLabel && HOST_BRANDS[`${brandLabel}.${tld}`]) {
    return HOST_BRANDS[`${brandLabel}.${tld}`];
  }
  const pair = labels.length >= 2 ? `${labels[labels.length - 2]}.${tld}` : '';
  if (pair && HOST_BRANDS[pair]) return HOST_BRANDS[pair];

  const hostHasBrand =
    Boolean(brandLabel) && brandLabel.length >= 2 && !REGISTRY_LABELS.has(brandLabel);
  const storedIsWrong =
    isRegistryCompanyLabel(stored) ||
    (stored !== brandLabel && labels.includes(stored));

  if (hostHasBrand && storedIsWrong) return labelToDisplay(brandLabel);
  if (hostHasBrand && isRegistryCompanyLabel(trimmed)) return labelToDisplay(brandLabel);
  if (SHORT_BRANDS[stored]) return SHORT_BRANDS[stored];
  return trimmed;
}

/** Ingest + display: stamp the repaired brand onto a job row. */
export function applyCanonicalCompany(job) {
  if (!job) return job;
  const next = companyNameFromApply(job.company, job.apply_url);
  if (next) job.company = next;
  return job;
}
