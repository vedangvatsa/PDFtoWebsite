import { NextResponse, NextRequest } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = ['vatsvedang@gmail.com'];


// ── Bluesky API ────────────────────────────────────────────────────────────
async function fetchBlueskyStats(): Promise<any> {
  try {
    const handle = 'cv-in-bio.bsky.social';
    const res = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${handle}`);
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
  } catch (e) {
    console.error('Bluesky API error:', e);
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createAdminClient(supabaseUrl, serviceKey || anonKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user || !ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch live APIs (only free ones)
    const bskyData = await fetchBlueskyStats();

    // Read state files
    const xState = readStateFile('x-state.json');
    const bskyState = readStateFile('bsky-state.json');
    const metaState = readStateFile('meta-state.json');
    const bufferState = readStateFile('buffer-state.json');
    const bloggerState = readStateFile('blogger-state.json');

    // Read content files
    const xContent = readContentFile('x-content.json');

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

    return NextResponse.json({
      summary: {
        totalPostsAcrossPlatforms,
        totalTweetsInThreads,
        activePlatforms: 7,
      },
      x: {
        queue: xQueue,
      },
      bluesky: {
        live: bskyData,
        queue: bskyQueue,
      },
      meta: {
        queue: metaQueue,
      },
      buffer: {
        queue: bufferQueue,
      },
      blogger: {
        queue: bloggerQueue,
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
