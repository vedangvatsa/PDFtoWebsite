import { NextResponse } from 'next/server';

// ── Tech news RSS sources ──
const RSS_FEEDS = [
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', icon: 'techcrunch.com' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', icon: 'theverge.com' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', icon: 'arstechnica.com' },
  { name: 'Hacker News', url: 'https://hnrss.org/frontpage?count=30', icon: 'news.ycombinator.com' },
  { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/', icon: 'technologyreview.com' },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss', icon: 'wired.com' },
  { name: 'VentureBeat', url: 'https://venturebeat.com/feed/', icon: 'venturebeat.com' },
  { name: 'The Information', url: 'https://www.theinformation.com/feed', icon: 'theinformation.com' },
];

interface NewsItem {
  title: string;
  url: string;
  source: string;
  sourceIcon: string;
  publishedAt: string;
  description: string;
}

// Simple XML tag extraction (no dependency needed)
function extractTag(xml: string, tag: string): string {
  // Try <tag>...<![CDATA[...]]></tag> first
  const cdataMatch = xml.match(new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i'));
  if (cdataMatch) return cdataMatch[1].trim();
  // Then plain <tag>...</tag>
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return match ? match[1].trim() : '';
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').trim();
}

function parseRSS(xml: string, source: string, icon: string): NewsItem[] {
  const items: NewsItem[] = [];
  
  // RSS 2.0 format
  const rssItems = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
  for (const item of rssItems.slice(0, 15)) {
    const title = stripHtml(extractTag(item, 'title'));
    const link = extractTag(item, 'link') || '';
    const pubDate = extractTag(item, 'pubDate');
    const description = stripHtml(extractTag(item, 'description')).slice(0, 200);
    
    if (title && link) {
      items.push({
        title,
        url: link,
        source,
        sourceIcon: icon,
        publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        description,
      });
    }
  }
  
  // Atom format (<entry>)
  if (items.length === 0) {
    const entries = xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
    for (const entry of entries.slice(0, 15)) {
      const title = stripHtml(extractTag(entry, 'title'));
      // Atom links: <link href="..." />
      const linkMatch = entry.match(/<link[^>]*href="([^"]+)"[^>]*\/?\s*>/i);
      const link = linkMatch?.[1] || extractTag(entry, 'link') || '';
      const updated = extractTag(entry, 'updated') || extractTag(entry, 'published');
      const summary = stripHtml(extractTag(entry, 'summary') || extractTag(entry, 'content')).slice(0, 200);
      
      if (title && link) {
        items.push({
          title,
          url: link,
          source,
          sourceIcon: icon,
          publishedAt: updated ? new Date(updated).toISOString() : new Date().toISOString(),
          description: summary,
        });
      }
    }
  }
  
  return items;
}

// In-memory cache (60s TTL)
let cache: { items: NewsItem[]; ts: number } | null = null;
const CACHE_TTL = 60_000;

async function fetchAllNews(): Promise<NewsItem[]> {
  if (cache && Date.now() - cache.ts < CACHE_TTL) return cache.items;

  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      try {
        const res = await fetch(feed.url, {
          headers: { 'User-Agent': 'cvin.bio/news-aggregator' },
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) return [];
        const xml = await res.text();
        return parseRSS(xml, feed.name, feed.icon);
      } catch {
        return [];
      }
    })
  );

  const allItems: NewsItem[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') allItems.push(...r.value);
  }

  // Sort by date (newest first) and deduplicate by URL
  allItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const seen = new Set<string>();
  const deduped = allItems.filter(item => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });

  cache = { items: deduped, ts: Date.now() };
  return deduped;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const source = searchParams.get('source');
  const q = searchParams.get('q')?.toLowerCase().trim();

  let items = await fetchAllNews();

  // Filter by source
  if (source && source !== 'all') {
    items = items.filter(i => i.source.toLowerCase().includes(source.toLowerCase()));
  }

  // Search
  if (q) {
    items = items.filter(i =>
      i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
    );
  }

  const total = items.length;
  const offset = (page - 1) * limit;
  const paged = items.slice(offset, offset + limit);

  const response = NextResponse.json({
    items: paged,
    total,
    page,
    limit,
    hasMore: offset + limit < total,
    sources: RSS_FEEDS.map(f => f.name),
  });

  response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  return response;
}
