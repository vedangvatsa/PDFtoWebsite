/** Curl-empty / unofficial apply hosts. Newspaper boards and aggregators are not the employer ATS. */
export const CURL_EMPTY_APPLY_HOST_RE =
  /(?:^|\.)(?:linkedin\.com|lnkd\.in|jobviewtrack\.com|jooble\.org|adzuna\.[a-z.]+|indeed\.[a-z.]+|glassdoor\.[a-z.]+|ziprecruiter\.com|careerjet\.[a-z.]+|simplyhired\.com|talent\.com|theguardian\.com|reed\.co\.uk|totaljobs\.com|cv-library\.co\.uk|monster\.[a-z.]+|dice\.com|weworkremotely\.com|remoteok\.com|remoteok\.io|efinancialcareers\.com|wellfound\.com|angel\.co|otta\.com|workingnomads\.[a-z.]+|flexjobs\.com|himalayas\.app|risein\.com)$/i;

export function applyUrlHostname(url) {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return '';
  }
}

export function isLowQualityApplySource(url) {
  const host = applyUrlHostname(url);
  if (!host) return true;
  return CURL_EMPTY_APPLY_HOST_RE.test(host);
}
