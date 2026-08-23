import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  MARKDOWN_PAGES,
  isAgentInfraPath,
  negotiatesMarkdown,
} from '@/lib/agent-negotiation';

// ============================================================================
// 1. CONSTANTS & CONFIGURATION
// ============================================================================

/**
 * In-app browser user-agent patterns. When detected on the signup page,
 * we inject a meta refresh / JS redirect page that tries to escape to
 * the system browser before Google OAuth is attempted.
 */
const IN_APP_BROWSER_UA = [
  /Instagram/i,
  /FBAN|FBAV/i,
  /LinkedInApp/i,
  /Twitter|Tweetbot/i,
  /TikTok/i,
  /Snapchat/i,
  /WhatsApp/i,
  /GSA/i,
  /Line\//i,
  /MicroMessenger/i,
  /Pinterest/i,
  /Reddit/i,
  /Discord/i,
  /Slack/i,
  /Teams/i,
];

/**
 * Declared crawlers we WANT to keep (AI assistants, search engines, social
 * link-previewers, SEO tools). They identify themselves by User-Agent, respect
 * robots.txt, and (for AI assistants) drive real referral users. This mirrors
 * the allow-list in src/app/robots.ts — never block these.
 */
const ALLOWED_CRAWLER_UA = [
  // AI model training & AI search assistants
  /GPTBot|ChatGPT-User|OAI-SearchBot|GPTBot-Extended/i,
  /ClaudeBot|Claude-Web|Claude-SearchBot|anthropic-ai/i,
  /Google-Extended|Googlebot|GoogleOther|Storebot-Google|Google-InspectionTool|AdsBot-Google|APIs-Google|FeedFetcher-Google/i,
  /PerplexityBot|Perplexity-User/i,
  /DeepSeekBot|MistralBot|MistralAI|cohere-ai|AI2Bot|xAI-Grok|YouBot|PanguBot|Bytespider|CCBot/i,
  /Meta-ExternalAgent|Meta-ExternalFetcher/i,
  // Search engines
  /Bingbot|msnbot|adidxbot|DuckDuckBot|YandexBot|YandexMobileBot|Baiduspider|Slurp|Qwantify|PetalBot|Mojeek|Seznam|NaverBot/i,
  // Social & link preview
  /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|WhatsApp|TelegramBot|Discordbot|Pinterestbot|redditbot|SkypeUriPreview|Embedly|Quora-Bot|vkShare/i,
  // Platforms / research / SEO / archive / feeds
  /Applebot|Amazonbot|HuggingFaceBot|AhrefsBot|SemrushBot|MJ12bot|DotBot|Screaming Frog|rogerbot|SiteAuditBot|archive\.org_bot|Wayback|ia_archiver|ScholarBot|Feedly|Feedspot|NewsBlur/i,
  // MCP clients & agent runtimes hitting machine-facing endpoints
  /\bMCP\b|MCP-Client|^ora-agent$|LangChain|OpenAI-Agents|Cursor-/i,
  // First-party CI link checks (GitHub Actions; see google-jobs-canary.mjs, telegram-post.mjs)
  /cvin-google-jobs-canary|cvin-telegram-link-check/i,
];

/**
 * Anonymous scrapers / headless automation. These do NOT identify as a
 * declared bot, ignore robots.txt, and scrape content.
 */
const SCRAPER_UA = [
  /headlesschrome|phantomjs|puppeteer|playwright|selenium/i,
  /htmlunit|scrapy|aiohttp|python-requests|python-urllib/i,
  /^curl\/|^wget\/|^go-http-client|^java\/|^okhttp/i,
  /Macintosh; Intel Mac OS X 10_15_7.*Chrome\/114\.0\.0\.0/i,
];

/**
 * UTM suffixes — append /th, /wa, /li etc. to ANY page URL
 * to automatically add UTM tracking parameters.
 */
const UTM_SUFFIXES: Record<string, string> = {
  th:   'threads',
  wa:   'whatsapp',
  tg:   'telegram',
  li:   'linkedin',
  x:    'twitter',
  tw:   'twitter',
  ig:   'instagram',
  fb:   'facebook',
  bsky: 'bluesky',
  yt:   'youtube',
  rd:   'reddit',
};

const SUFFIX_SET = new Set(Object.keys(UTM_SUFFIXES));


// ============================================================================
// 2. HELPER FUNCTIONS
// ============================================================================

const isInAppBrowser = (ua: string): boolean => IN_APP_BROWSER_UA.some((p) => p.test(ua));
const isAllowedCrawler = (ua: string): boolean => ALLOWED_CRAWLER_UA.some((p) => p.test(ua));
const isScraperAgent = (ua: string): boolean => SCRAPER_UA.some((p) => p.test(ua));


// ============================================================================
// 3. TEMPLATES
// ============================================================================

const getEscapeHtmlTemplate = (fullUrl: string, isIOS: boolean, isAndroid: boolean): string => `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Open in Browser — CVin.Bio</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 24px; background: #fafaf9; color: #1c1917; display: flex; min-height: 100vh; align-items: center; justify-content: center; }
  .card { max-width: 380px; text-align: center; }
  .icon { width: 56px; height: 56px; margin: 0 auto 16px; border-radius: 50%; background: #fef3c7; display: flex; align-items: center; justify-content: center; }
  .icon svg { width: 28px; height: 28px; color: #d97706; }
  h1 { font-size: 20px; font-weight: 600; margin: 0 0 8px; }
  p { font-size: 14px; color: #57534e; line-height: 1.5; margin: 0 0 20px; }
  .btn { display: inline-block; padding: 12px 24px; background: #1c1917; color: #fff; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; }
  .hint { font-size: 12px; color: #a8a29e; margin-top: 16px; }
</style>
</head>
<body>
<div class="card">
  <div class="icon">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
  </div>
  <h1>Open in your browser to continue</h1>
  <p>Google sign-in doesn't work inside this app's built-in browser. Tap below to open CVin.Bio in your system browser.</p>
  <a href="${fullUrl}" class="btn" target="_blank" rel="noopener noreferrer">Open in Browser</a>
  <p class="hint">If the button doesn't work, tap the ••• menu in your current app and select "Open in Browser" or "Open in Safari".</p>
</div>
<script>
  // Auto-redirect attempts to escape the in-app browser
  (function() {
    var url = ${JSON.stringify(fullUrl)};
    ${isIOS ? `
    try { window.location.href = url.replace(/^https?:\\/\\//, 'x-safari-https://'); return; } catch(e) {}
    try { window.location.href = url.replace(/^https?:\\/\\//, 'googlechrome://'); return; } catch(e) {}` : ''}
    ${isAndroid ? `
    try { window.location.href = url.replace(/^https?:\\/\\//, 'intent://') + '#Intent;scheme=https;action=android.intent.action.VIEW;end;'; return; } catch(e) {}` : ''}
    try { window.open(url, '_blank', 'noopener,noreferrer'); } catch(e) {}
  })();
</script>
</body>
</html>`;


// ============================================================================
// 4. MAIN MIDDLEWARE
// ============================================================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ua = request.headers.get('user-agent') || '';

  // Sitemaps must stay readable by Googlebot, GSC validators, curl health
  // checks, and SEO tools.
  if (pathname.startsWith('/sitemap')) {
    return NextResponse.next();
  }

  // ── Agent infrastructure bypass ──────────────────────────────────────────
  // Machine-readable endpoints are for agents — never anti-scraper block
  // them regardless of User-Agent.
  const isAgentInfra = isAgentInfraPath(pathname);

  // ── Markdown content negotiation (acceptmarkdown.com) ────────────────────
  const mdPage = MARKDOWN_PAGES[pathname];
  if (mdPage !== undefined) {
    if (!isAgentInfra && negotiatesMarkdown(request.headers.get('accept'))) {
      const url = request.nextUrl.clone();
      url.pathname = `/md/${mdPage}`;
      url.search = '';
      const rewrite = NextResponse.rewrite(url);
      rewrite.headers.set('Vary', 'Accept, Accept-Encoding');
      return rewrite;
    }
    const response = NextResponse.next();
    response.headers.append('Vary', 'Accept');
    response.headers.append('Vary', 'Accept-Encoding');
    return response;
  }

  // ── Anti-scraper edge block ──────────────────────────────────────────────
  // Stop anonymous scrapers before any HTML/JS is served. Declared AI/search/
  // social crawlers and real browsers pass straight through.
  if (!isAgentInfra && isScraperAgent(ua) && !isAllowedCrawler(ua)) {
    return new NextResponse(null, {
      status: 403,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  // ── In-App Browser Escape ────────────────────────────────────────────────
  // Detect in-app browsers on the signup page and serve an escape page
  if (pathname === '/signup' && isInAppBrowser(ua)) {
    const fullUrl = request.nextUrl.toString();
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/i.test(ua);

    return new NextResponse(getEscapeHtmlTemplate(fullUrl, isIOS, isAndroid), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // ── UTM Tracking Links ───────────────────────────────────────────────────
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  // Check if the last segment is a UTM suffix
  if (lastSegment && SUFFIX_SET.has(lastSegment)) {
    // Rebuild the path without the suffix
    const basePath = '/' + segments.slice(0, -1).join('/') || '/';
    const url = request.nextUrl.clone();
    url.pathname = basePath;
    url.searchParams.set('utm_source', UTM_SUFFIXES[lastSegment]);
    url.searchParams.set('utm_medium', 'social');
    url.searchParams.set('utm_campaign', 'social-share');
    return NextResponse.redirect(url, 302);
  }

  return NextResponse.next();
}

// Only run on page routes, skip static assets and API routes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|ingest|api|.*\\.).*)',
  ],
};
