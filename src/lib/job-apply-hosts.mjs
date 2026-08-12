/** Curl-empty apply hosts. Imported by TS app code and Node scripts. */
export const CURL_EMPTY_APPLY_HOST_RE =
  /(?:^|\.)(?:linkedin\.com|lnkd\.in|jobviewtrack\.com|jooble\.org|adzuna\.[a-z.]+|indeed\.[a-z.]+|glassdoor\.[a-z.]+|ziprecruiter\.com|careerjet\.[a-z.]+|simplyhired\.com|talent\.com)$/i;

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
