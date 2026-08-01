/**
 * IndexNow ping for Node scripts (India import, deploys, etc.).
 * Key file: https://cvin.bio/6db32ca940dd46cab89375c221953bd6.txt
 */

export const INDEXNOW_KEY = '6db32ca940dd46cab89375c221953bd6';
const SITE_HOST = 'cvin.bio';
const KEY_LOCATION = `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`;
const ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
];

function toAbsoluteUrl(urlOrPath) {
  if (/^https?:\/\//i.test(urlOrPath)) return urlOrPath;
  const path = urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`;
  return `https://${SITE_HOST}${path}`;
}

/** @param {string|string[]} urls */
export async function pingIndexNow(urls) {
  const list = [...new Set((Array.isArray(urls) ? urls : [urls]).map(toAbsoluteUrl))];
  if (!list.length) return { ok: false, submitted: 0, error: 'empty' };

  const body = JSON.stringify({
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: list.slice(0, 10000),
  });

  let lastStatus = 0;
  let lastError = '';
  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body,
      });
      lastStatus = res.status;
      if (res.status === 200 || res.status === 202 || res.status === 204) {
        return { ok: true, submitted: list.length, status: res.status };
      }
      lastError = (await res.text().catch(() => res.statusText)).slice(0, 200);
    } catch (e) {
      lastError = e?.message || String(e);
    }
  }
  return { ok: false, submitted: list.length, status: lastStatus, error: lastError };
}
