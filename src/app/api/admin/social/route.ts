import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = ['vatsvedang@gmail.com'];

// ── Cache helpers ──────────────────────────────────────────────────────────
const CACHE_FILE = process.env.VERCEL
  ? join('/tmp', 'social-analytics-cache.json')
  : join(process.cwd(), '.github/scripts', 'social-analytics-cache.json');
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function readCache(): { data: any; timestamp: number } | null {
  if (!existsSync(CACHE_FILE)) return null;
  try {
    const raw = JSON.parse(readFileSync(CACHE_FILE, 'utf8'));
    if (raw.timestamp && Date.now() - raw.timestamp < CACHE_TTL_MS) return raw;
  } catch {}
  return null;
}

function writeCache(data: any) {
  try { writeFileSync(CACHE_FILE, JSON.stringify({ data, timestamp: Date.now() }, null, 2)); } catch {}
}

// ── Telegram Bot API (free) ────────────────────────────────────────────────
const TG_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TG_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const TG_API = TG_BOT_TOKEN ? `https://api.telegram.org/bot${TG_BOT_TOKEN}` : null;

async function fetchTelegramChannel(): Promise<any> {
  if (!TG_API || !TG_CHANNEL_ID) return null;
  try {
    const [chatRes, countRes] = await Promise.all([
      fetch(`${TG_API}/getChat?chat_id=${TG_CHANNEL_ID}`),
      fetch(`${TG_API}/getChatMemberCount?chat_id=${TG_CHANNEL_ID}`),
    ]);
    const chatData = chatRes.ok ? await chatRes.json() : null;
    const countData = countRes.ok ? await countRes.json() : null;
    
    const chat = chatData?.result;
    const memberCount = countData?.result || 0;
    
    return {
      title: chat?.title || '',
      username: chat?.username || '',
      memberCount,
      description: (chat?.description || '').slice(0, 100),
    };
  } catch {
    return null;
  }
}

async function fetchTelegramRecentPosts(): Promise<any[]> {
  if (!TG_API || !TG_CHANNEL_ID) return [];
  try {
    // Get recent channel history using getUpdates won't work for channels.
    // Instead we use the Supabase jobs table to count how many were telegram_posted_at
    // But we can't get view counts via Bot API — we'll just show posting stats
    return [];
  } catch {
    return [];
  }
}

// ── Bluesky API (free, public) ─────────────────────────────────────────────
const BSKY_HANDLE = 'cv-in-bio.bsky.social';

async function fetchBlueskyProfile(): Promise<any> {
  try {
    const res = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${BSKY_HANDLE}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      handle: data.handle,
      displayName: data.displayName,
      followersCount: data.followersCount || 0,
      followsCount: data.followsCount || 0,
      postsCount: data.postsCount || 0,
      avatar: data.avatar,
    };
  } catch {
    return null;
  }
}

async function fetchBlueskyFeed(): Promise<any[]> {
  try {
    const res = await fetch(
      `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${BSKY_HANDLE}&limit=50&filter=posts_no_replies`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.feed || []).map((item: any) => ({
      text: (item.post?.record?.text || '').slice(0, 80),
      createdAt: item.post?.record?.createdAt || null,
      likes: item.post?.likeCount || 0,
      reposts: item.post?.repostCount || 0,
      replies: item.post?.replyCount || 0,
      quotes: item.post?.quoteCount || 0,
      uri: item.post?.uri || '',
      url: `https://bsky.app/profile/${BSKY_HANDLE}/post/${(item.post?.uri || '').split('/').pop()}`,
    }));
  } catch {
    return [];
  }
}

// ── Threads API (free with threads token) ──────────────────────────────────
const THREADS_URL = 'https://graph.threads.net/v1.0';
const THREADS_USER_ID = process.env.THREADS_USER_ID;
const THREADS_TOKEN = process.env.THREADS_ACCESS_TOKEN;

async function fetchThreadsProfile(): Promise<any> {
  if (!THREADS_USER_ID || !THREADS_TOKEN) return null;
  try {
    const res = await fetch(
      `${THREADS_URL}/${THREADS_USER_ID}?fields=threads_profile_picture_url,threads_biography,username&access_token=${THREADS_TOKEN}`
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchThreadsPosts(): Promise<any> {
  if (!THREADS_USER_ID || !THREADS_TOKEN) return null;
  try {
    // Get recent threads
    const feedRes = await fetch(
      `${THREADS_URL}/${THREADS_USER_ID}/threads?fields=id,text,timestamp,media_type,shortcode,is_quote_post&limit=25&access_token=${THREADS_TOKEN}`
    );
    if (!feedRes.ok) return null;
    const feedData = await feedRes.json();
    const threads = feedData?.data || [];

    // Fetch insights for each thread (views, likes, replies, reposts, quotes)
    const postsWithInsights = [];
    for (const thread of threads.slice(0, 25)) {
      try {
        const insightsRes = await fetch(
          `${THREADS_URL}/${thread.id}/insights?metric=views,likes,replies,reposts,quotes&access_token=${THREADS_TOKEN}`
        );
        if (!insightsRes.ok) {
          postsWithInsights.push({
            text: (thread.text || '').slice(0, 100),
            createdAt: thread.timestamp,
            views: 0, likes: 0, replies: 0, reposts: 0, quotes: 0,
            url: thread.shortcode ? `https://www.threads.net/post/${thread.shortcode}` : '',
          });
          continue;
        }
        const insightsData = await insightsRes.json();
        const metrics: Record<string, number> = {};
        for (const m of (insightsData?.data || [])) {
          metrics[m.name] = m.values?.[0]?.value || 0;
        }
        postsWithInsights.push({
          text: (thread.text || '').slice(0, 100),
          createdAt: thread.timestamp,
          views: metrics.views || 0,
          likes: metrics.likes || 0,
          replies: metrics.replies || 0,
          reposts: metrics.reposts || 0,
          quotes: metrics.quotes || 0,
          url: thread.shortcode ? `https://www.threads.net/post/${thread.shortcode}` : '',
        });
      } catch {
        postsWithInsights.push({
          text: (thread.text || '').slice(0, 100),
          createdAt: thread.timestamp,
          views: 0, likes: 0, replies: 0, reposts: 0, quotes: 0,
          url: thread.shortcode ? `https://www.threads.net/post/${thread.shortcode}` : '',
        });
      }
    }

    const totalViews = postsWithInsights.reduce((s, p) => s + p.views, 0);
    const totalLikes = postsWithInsights.reduce((s, p) => s + p.likes, 0);
    const totalReplies = postsWithInsights.reduce((s, p) => s + p.replies, 0);
    const totalReposts = postsWithInsights.reduce((s, p) => s + p.reposts, 0);
    const totalQuotes = postsWithInsights.reduce((s, p) => s + p.quotes, 0);
    const topPosts = [...postsWithInsights].sort((a, b) => b.views - a.views).slice(0, 5);

    return {
      posts: postsWithInsights,
      topPosts,
      totals: {
        views: totalViews,
        likes: totalLikes,
        replies: totalReplies,
        reposts: totalReposts,
        quotes: totalQuotes,
        postsAnalyzed: postsWithInsights.length,
      },
    };
  } catch (e) {
    console.error('Threads API error:', e);
    return null;
  }
}

// ── Meta Graph API (free with page token) ──────────────────────────────────
const GRAPH_URL = 'https://graph.facebook.com/v22.0';
const META_PAGE_ID = process.env.META_PAGE_ID;
const META_PAGE_TOKEN = process.env.META_PAGE_TOKEN;
const META_IG_USER_ID = process.env.META_IG_USER_ID;

async function fetchFacebookPageInsights(): Promise<any> {
  if (!META_PAGE_ID || !META_PAGE_TOKEN) return null;
  try {
    // Page-level metrics
    const metricsRes = await fetch(
      `${GRAPH_URL}/${META_PAGE_ID}?fields=name,followers_count,fan_count&access_token=${META_PAGE_TOKEN}`
    );
    const pageData = metricsRes.ok ? await metricsRes.json() : null;

    // Recent posts with engagement
    const postsRes = await fetch(
      `${GRAPH_URL}/${META_PAGE_ID}/published_posts?fields=message,created_time,shares,reactions.summary(true),comments.summary(true)&limit=25&access_token=${META_PAGE_TOKEN}`
    );
    const postsData = postsRes.ok ? await postsRes.json() : null;

    const posts = (postsData?.data || []).map((p: any) => ({
      text: (p.message || '').slice(0, 80),
      createdAt: p.created_time,
      reactions: p.reactions?.summary?.total_count || 0,
      comments: p.comments?.summary?.total_count || 0,
      shares: p.shares?.count || 0,
    }));

    const totalReactions = posts.reduce((s: number, p: any) => s + p.reactions, 0);
    const totalComments = posts.reduce((s: number, p: any) => s + p.comments, 0);
    const totalShares = posts.reduce((s: number, p: any) => s + p.shares, 0);

    return {
      page: {
        name: pageData?.name || '',
        followers: pageData?.followers_count || pageData?.fan_count || 0,
      },
      posts,
      totals: {
        reactions: totalReactions,
        comments: totalComments,
        shares: totalShares,
        postsAnalyzed: posts.length,
      },
    };
  } catch (e) {
    console.error('Facebook API error:', e);
    return null;
  }
}

async function fetchInstagramInsights(): Promise<any> {
  if (!META_IG_USER_ID || !META_PAGE_TOKEN) return null;
  try {
    // Profile info
    const profileRes = await fetch(
      `${GRAPH_URL}/${META_IG_USER_ID}?fields=username,followers_count,follows_count,media_count&access_token=${META_PAGE_TOKEN}`
    );
    const profile = profileRes.ok ? await profileRes.json() : null;

    // Recent media with engagement
    const mediaRes = await fetch(
      `${GRAPH_URL}/${META_IG_USER_ID}/media?fields=caption,timestamp,like_count,comments_count,media_type&limit=25&access_token=${META_PAGE_TOKEN}`
    );
    const mediaData = mediaRes.ok ? await mediaRes.json() : null;

    const posts = (mediaData?.data || []).map((m: any) => ({
      text: (m.caption || '').slice(0, 80),
      createdAt: m.timestamp,
      likes: m.like_count || 0,
      comments: m.comments_count || 0,
      type: m.media_type || 'IMAGE',
    }));

    const totalLikes = posts.reduce((s: number, p: any) => s + p.likes, 0);
    const totalComments = posts.reduce((s: number, p: any) => s + p.comments, 0);

    return {
      profile: {
        username: profile?.username || '',
        followers: profile?.followers_count || 0,
        following: profile?.follows_count || 0,
        posts: profile?.media_count || 0,
      },
      recentPosts: posts,
      totals: {
        likes: totalLikes,
        comments: totalComments,
        postsAnalyzed: posts.length,
      },
    };
  } catch (e) {
    console.error('Instagram API error:', e);
    return null;
  }
}

// ── Buffer API (free tier) ─────────────────────────────────────────────────
const BUFFER_TOKEN = process.env.BUFFER_TOKEN;

async function fetchBufferAnalytics(): Promise<any> {
  if (!BUFFER_TOKEN) return null;
  try {
    // Get profiles
    const profilesRes = await fetch('https://api.bufferapp.com/1/profiles.json', {
      headers: { Authorization: `Bearer ${BUFFER_TOKEN}` },
    });
    if (!profilesRes.ok) return null;
    const profiles = await profilesRes.json();

    const results: any[] = [];
    for (const profile of (profiles || []).slice(0, 5)) {
      // Get recent sent updates with analytics
      try {
        const updatesRes = await fetch(
          `https://api.bufferapp.com/1/profiles/${profile.id}/updates/sent.json?count=10`,
          { headers: { Authorization: `Bearer ${BUFFER_TOKEN}` } }
        );
        if (!updatesRes.ok) continue;
        const updates = await updatesRes.json();

        const posts = (updates.updates || []).map((u: any) => ({
          text: (u.text || '').slice(0, 80),
          createdAt: u.sent_at ? new Date(u.sent_at * 1000).toISOString() : null,
          clicks: u.statistics?.clicks || 0,
          likes: u.statistics?.likes || u.statistics?.favorites || 0,
          shares: u.statistics?.shares || u.statistics?.retweets || u.statistics?.repins || 0,
          comments: u.statistics?.comments || u.statistics?.replies || 0,
          reach: u.statistics?.reach || u.statistics?.impressions || 0,
        }));

        results.push({
          service: profile.service,
          serviceUsername: profile.service_username,
          followers: profile.counts?.followers || 0,
          posts,
          totals: {
            clicks: posts.reduce((s: number, p: any) => s + p.clicks, 0),
            likes: posts.reduce((s: number, p: any) => s + p.likes, 0),
            shares: posts.reduce((s: number, p: any) => s + p.shares, 0),
            comments: posts.reduce((s: number, p: any) => s + p.comments, 0),
            reach: posts.reduce((s: number, p: any) => s + p.reach, 0),
            postsAnalyzed: posts.length,
          },
        });
      } catch { continue; }
    }

    return results;
  } catch (e) {
    console.error('Buffer API error:', e);
    return null;
  }
}

// ── Read state files ────────────────────────────────────────────────────────
function readStateFile(filename: string): any {
  const paths = [
    join(process.cwd(), '.github/scripts', filename),
    join(process.cwd(), '.github', 'scripts', filename),
  ];
  for (const p of paths) {
    if (existsSync(p)) {
      try { return JSON.parse(readFileSync(p, 'utf8')); } catch { continue; }
    }
  }
  return null;
}

function readContentFile(filename: string): any {
  const p = join(process.cwd(), '.github/scripts', filename);
  if (existsSync(p)) {
    try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; }
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 403 });

    const supabase = supabaseAdmin;
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user || !ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check cache first for expensive API calls
    const cached = readCache();

    // Read state files (always fresh, they're local)
    const xState = readStateFile('x-state.json');
    const bskyState = readStateFile('bsky-state.json');
    const metaState = readStateFile('meta-state.json');
    const bufferState = readStateFile('buffer-state.json');
    const bloggerState = readStateFile('blogger-state.json');

    // Read content files
    const xContent = readContentFile('x-content.json');

    // Fetch live engagement data (cached for 12h)
    let bskyProfile: any = null;
    let bskyFeed: any[] = [];
    let fbInsights: any = null;
    let igInsights: any = null;
    let bufferAnalytics: any = null;
    let threadsProfile: any = null;
    let threadsInsights: any = null;
    let telegramChannel: any = null;

    if (cached) {
      bskyProfile = cached.data.bskyProfile;
      bskyFeed = cached.data.bskyFeed || [];
      fbInsights = cached.data.fbInsights;
      igInsights = cached.data.igInsights;
      bufferAnalytics = cached.data.bufferAnalytics;
      threadsProfile = cached.data.threadsProfile;
      threadsInsights = cached.data.threadsInsights;
      telegramChannel = cached.data.telegramChannel;
    } else {
      // Fetch all in parallel
      [bskyProfile, bskyFeed, fbInsights, igInsights, bufferAnalytics, threadsProfile, threadsInsights, telegramChannel] = await Promise.all([
        fetchBlueskyProfile(),
        fetchBlueskyFeed(),
        fetchFacebookPageInsights(),
        fetchInstagramInsights(),
        fetchBufferAnalytics(),
        fetchThreadsProfile(),
        fetchThreadsPosts(),
        fetchTelegramChannel(),
      ]);

      // Cache the results
      writeCache({ bskyProfile, bskyFeed, fbInsights, igInsights, bufferAnalytics, threadsProfile, threadsInsights, telegramChannel });
    }

    // Calculate Bluesky engagement totals
    const bskyTotalLikes = bskyFeed.reduce((s, p) => s + p.likes, 0);
    const bskyTotalReposts = bskyFeed.reduce((s, p) => s + p.reposts, 0);
    const bskyTotalReplies = bskyFeed.reduce((s, p) => s + p.replies, 0);
    const bskyTopPosts = [...bskyFeed].sort((a, b) => (b.likes + b.reposts) - (a.likes + a.reposts)).slice(0, 5);

    // Calculate queue stats
    const xQueue = {
      threads: { total: xContent?.threads?.length || 0, posted: xState?.threads?.index || 0 },
      insights: { total: xContent?.insights?.length || 0, posted: xState?.insights?.index || 0 },
      engagement: { total: xContent?.engagement?.length || 0, posted: xState?.engagement?.index || 0 },
      threadHistory: (xState?.threadHistory || []).map((t: any) => ({
        topic: t.topic,
        tweetCount: t.tweetIds?.length || 0,
        postedAt: t.postedAt,
      })),
      lastPostedAt: xState?.lastPostedAt || {},
    };

    const bskyQueue = {
      posted: bskyState?.index || 0,
      lastPostedAt: bskyState?.lastPostedAt || null,
    };

    const metaQueue = {
      facebook: { posted: metaState?.facebook?.index || 0 },
      instagram: { posted: metaState?.instagram?.index || 0 },
      threads: { posted: metaState?.threads?.index || 0 },
      lastPostedAt: metaState?.lastPostedAt || null,
    };

    const bufferQueue = {
      linkedin: bufferState?.linkedin || 0,
      instagram: bufferState?.instagram || 0,
      facebook: bufferState?.facebook || 0,
    };

    const bloggerQueue = {
      posted: bloggerState?.index || 0,
      lastPostedAt: bloggerState?.lastPostedAt || null,
      publishedCount: bloggerState?.published?.length || 0,
    };

    // Summary stats
    const totalPostsAcrossPlatforms =
      (xQueue.threads.posted + xQueue.insights.posted + xQueue.engagement.posted) +
      bskyQueue.posted +
      (metaQueue.facebook.posted + metaQueue.instagram.posted + metaQueue.threads.posted) +
      (bufferQueue.linkedin + bufferQueue.instagram + bufferQueue.facebook) +
      bloggerQueue.posted;

    const totalTweetsInThreads = (xState?.threadHistory || []).reduce(
      (s: number, t: any) => s + (t.tweetIds?.length || 0), 0
    );

    // Total engagement across all platforms
    const totalEngagement =
      bskyTotalLikes + bskyTotalReposts + bskyTotalReplies +
      (fbInsights?.totals?.reactions || 0) + (fbInsights?.totals?.comments || 0) + (fbInsights?.totals?.shares || 0) +
      (igInsights?.totals?.likes || 0) + (igInsights?.totals?.comments || 0) +
      (threadsInsights?.totals?.likes || 0) + (threadsInsights?.totals?.replies || 0) + (threadsInsights?.totals?.reposts || 0) +
      (bufferAnalytics || []).reduce((s: number, b: any) => s + (b.totals?.clicks || 0) + (b.totals?.likes || 0), 0);

    const totalViews =
      (threadsInsights?.totals?.views || 0);

    const totalFollowers =
      (bskyProfile?.followersCount || 0) +
      (fbInsights?.page?.followers || 0) +
      (igInsights?.profile?.followers || 0) +
      (threadsProfile?.followers || 0) +
      (telegramChannel?.memberCount || 0) +
      (bufferAnalytics || []).reduce((s: number, b: any) => s + (b.followers || 0), 0);

    // Count platforms that actually returned data
    const activePlatforms = [
      true, // X (always active — queue-based)
      !!bskyProfile,
      !!threadsProfile || !!threadsInsights,
      !!fbInsights,
      !!igInsights,
      !!(bufferAnalytics && bufferAnalytics.length > 0),
      !!telegramChannel,
    ].filter(Boolean).length;

    return NextResponse.json({
      summary: {
        totalPostsAcrossPlatforms,
        totalTweetsInThreads,
        activePlatforms,
        totalEngagement,
        totalFollowers,
        totalViews,
        cacheAge: cached ? Math.round((Date.now() - cached.timestamp) / 60000) : 0, // minutes
      },
      x: {
        queue: xQueue,
        note: 'X API requires paid tier ($100/mo). Showing queue stats only.',
      },
      bluesky: {
        live: bskyProfile,
        queue: bskyQueue,
        engagement: {
          totalLikes: bskyTotalLikes,
          totalReposts: bskyTotalReposts,
          totalReplies: bskyTotalReplies,
          postsAnalyzed: bskyFeed.length,
          topPosts: bskyTopPosts,
        },
      },
      threads: {
        queue: { posted: metaQueue.threads.posted },
        profile: threadsProfile,
        insights: threadsInsights,
      },
      meta: {
        queue: metaQueue,
        facebook: fbInsights,
        instagram: igInsights,
      },
      buffer: {
        queue: bufferQueue,
        analytics: bufferAnalytics,
      },
      blogger: {
        queue: bloggerQueue,
      },
      telegram: {
        channel: telegramChannel,
      },
    });
  } catch (error) {
    console.error('Social API error:', error);
    return NextResponse.json(
      { error: 'Internal error', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
