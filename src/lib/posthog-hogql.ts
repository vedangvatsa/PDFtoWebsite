/** Shared PostHog HogQL client and referrer labels. */

// ── PostHog HogQL helper ────────────────────────────────────────────────────
const PH_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const PH_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
const PH_HOST = 'https://us.posthog.com';

export function isPosthogConfigured(): boolean {
  return !!(PH_API_KEY && PH_PROJECT_ID);
}

/**
 * Headless Chrome-114 / macOS-10.15.7 crawler that inflated Aug-5 pageviews
 * (~10.6k one-page "visits"). Excluded from traffic KPIs so analytics reflect
 * real users. Client-side before_send also drops future headless traffic.
 */
export const POSTHOG_NOT_BOT =
  `AND NOT (properties.$browser = 'Chrome' AND properties.$browser_version = '114' AND properties.$os = 'Mac OS X' AND properties.$os_version = '10.15.7')`;

/** Map raw referrer domains AND utm_source values to friendly names */
const SOURCE_MAP: Record<string, string> = {
  // Direct / empty
  '$direct': 'Direct', '': 'Direct', 'direct': 'Direct',
  // Google
  'www.google.com': 'Google Search', 'google.com': 'Google Search', 'search.google.com': 'Google Search',
  'google': 'Google Search',
  'accounts.google.com': 'Google Auth', 'com.google.android.googlequicksearchbox': 'Google Search',
  'docs.google.com': 'Google Docs',
  // LinkedIn
  'www.linkedin.com': 'LinkedIn', 'linkedin.com': 'LinkedIn', 'lnkd.in': 'LinkedIn', 'com.linkedin.android': 'LinkedIn',
  'linkedin': 'LinkedIn',
  // Facebook
  'www.facebook.com': 'Facebook', 'facebook.com': 'Facebook', 'm.facebook.com': 'Facebook', 'l.facebook.com': 'Facebook', 'lm.facebook.com': 'Facebook',
  'facebook': 'Facebook',
  'l.messenger.com': 'Messenger', 'messenger': 'Messenger',
  // Instagram (domains + UTM sources from Meta/IG in-app browser)
  'www.instagram.com': 'Instagram', 'instagram.com': 'Instagram', 'l.instagram.com': 'Instagram',
  'instagram': 'Instagram', 'ig': 'Instagram',
  'ig_text_feed_timeline': 'Instagram', 'ig_text_post_permalink': 'Instagram',
  'ig_story': 'Instagram', 'ig_profile': 'Instagram', 'ig_explore': 'Instagram',
  'ig_direct': 'Instagram', 'ig_reel': 'Instagram', 'ig_web': 'Instagram',
  // Threads
  'l.threads.com': 'Threads', 'threads.net': 'Threads', 'www.threads.net': 'Threads',
  'threads': 'Threads',
  // X / Twitter
  'twitter.com': 'X (Twitter)', 'x.com': 'X (Twitter)', 't.co': 'X (Twitter)', 'com.twitter.android': 'X (Twitter)',
  'x': 'X (Twitter)', 'twitter': 'X (Twitter)',
  // Reddit
  'www.reddit.com': 'Reddit', 'reddit.com': 'Reddit', 'reddit': 'Reddit',
  // WhatsApp
  'wa.me': 'WhatsApp', 'web.whatsapp.com': 'WhatsApp', 'whatsapp.com': 'WhatsApp',
  'whatsapp': 'WhatsApp',
  // Telegram
  't.me': 'Telegram', 'web.telegram.org': 'Telegram', 'org.telegram.messenger.web': 'Telegram',
  'org.telegram.messenger': 'Telegram', 'org.telegram.plus': 'Telegram',
  'telegram': 'Telegram',
  // Bluesky
  'bsky.app': 'Bluesky', 'bsky.social': 'Bluesky', 'bluesky': 'Bluesky', 'bsky': 'Bluesky',
  // TikTok
  'www.tiktok.com': 'TikTok', 'tiktok.com': 'TikTok', 'tiktok': 'TikTok',
  // Tumblr
  'www.tumblr.com': 'Tumblr', 'tumblr.com': 'Tumblr',
  // Dev platforms
  'dev.to': 'Dev.to', 'hashnode.com': 'Hashnode', 'medium.com': 'Medium',
  // YouTube
  'www.youtube.com': 'YouTube', 'youtube.com': 'YouTube', 'youtu.be': 'YouTube', 'youtube': 'YouTube',
  // GitHub
  'github.com': 'GitHub', 'www.github.com': 'GitHub', 'github': 'GitHub',
  // Email clients
  'mail.google.com': 'Gmail', 'com.google.android.gm': 'Gmail',
  'outlook.live.com': 'Outlook', 'outlook.office.com': 'Outlook',
  'statics.teams.cdn.office.net': 'MS Teams',
  'email': 'Email', 'mail': 'Email', 'newsletter': 'Email',
  // Search engines
  'search.brave.com': 'Brave Search',
  'bing.com': 'Bing', 'www.bing.com': 'Bing', 'cn.bing.com': 'Bing',
  'duckduckgo.com': 'DuckDuckGo', 'www.duckduckgo.com': 'DuckDuckGo',
  'search.yahoo.com': 'Yahoo', 'in.search.yahoo.com': 'Yahoo', 'fr.search.yahoo.com': 'Yahoo', 'ca.search.yahoo.com': 'Yahoo',
  // AI chatbots
  'chatgpt.com': 'ChatGPT', 'chatgpt': 'ChatGPT', 'claude.ai': 'Claude',
  // UTM source catch-alls
  'social': 'Social (other)', 'referral': 'Referral', 'organic': 'Organic Search',
  'paid': 'Paid', 'cpc': 'Paid', 'display': 'Paid',
  // Internal / known sites
  'vercel.com': 'Vercel',
  'cvin.bio': 'Internal', 'veda.ng': 'Internal', 'internal': 'Internal',
  'hashtagweb3': 'HashtagWeb3', 'hashtagweb3.com': 'HashtagWeb3', 'www.hashtagweb3.com': 'HashtagWeb3',
  // Disposable email
  'temp-mail.org': 'Email', '10minutemail.com': 'Email', 'substack.com': 'Substack',
};
export function friendlySource(raw: string, unknown: 'passthrough' | 'title' = 'passthrough'): string {
  if (!raw) return 'Direct';
  const lower = raw.toLowerCase().trim();
  if (SOURCE_MAP[lower]) return SOURCE_MAP[lower];
  if (unknown === 'title') {
    const clean = lower.replace(/^www\./, '').replace(/\.(com|org|net|io|co|app|me)$/, '');
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  return raw;
}

export async function hogql(query: string, name?: string): Promise<any[] | null> {
  if (!PH_API_KEY || !PH_PROJECT_ID) return null;
  try {
    const res = await fetch(`${PH_HOST}/api/projects/${PH_PROJECT_ID}/query/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PH_API_KEY}`,
      },
      body: JSON.stringify({
        query: { kind: 'HogQLQuery', query },
        ...(name ? { name } : {}),
      }),
    });
    if (!res.ok) {
      console.error('PostHog query failed:', res.status, await res.text().catch(() => ''));
      return null;
    }
    const data = await res.json();
    // HogQL returns { columns: [...], results: [[...], ...] }
    if (!data.results || !data.columns) return null;
    return data.results.map((row: any[]) => {
      const obj: any = {};
      data.columns.forEach((col: string, i: number) => { obj[col] = row[i]; });
      return obj;
    });
  } catch (e) {
    console.error('PostHog query error:', e);
    return null;
  }
}

