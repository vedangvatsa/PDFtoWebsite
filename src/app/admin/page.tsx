'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/auth';
import { createClient } from '@/utils/supabase/client';
import Header from '@/components/header';
import CVinBioVisualCalendar from '@/components/admin/cvinbio-visual-calendar';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Area, AreaChart } from 'recharts';
import { Loader2, TrendingUp, TrendingDown, Minus, Globe, Monitor, Smartphone, Tablet, Share2, Send } from 'lucide-react';

const ADMIN_EMAILS = ['vatsvedang@gmail.com'];

type Analytics = {
  kpis: {
    totalUsers: number; totalViews: number; totalParses: number;
    avgViews: number; medianViews: number;
    usersWithPhoto: number; usersWithExperience: number;
    usersWithEducation: number; usersWithSkills: number;
    usersUpdatedLast7d: number; zeroViewProfiles: number;
    avgSkillsPerUser: number; totalLinksCount: number;
    totalWorkEntries: number; totalEduEntries: number;
    totalJobs: number;
  };
  signupTrend: { date: string; count: number }[];
  topProfiles: { name: string; slug: string; views: number }[];
  parseTrend: { date: string; count: number }[];
  completeness: {
    hasPhoto: number; noPhoto: number;
    hasExperience: number; noExperience: number;
    hasEducation: number; noEducation: number;
    hasSkills: number; noSkills: number;
    hasCustomSections: number; hasLinks: number;
  };
  authProviders: { provider: string; count: number }[];
  recentUsers: {
    email: string; name: string; slug: string; views: number;
    provider: string; createdAt: string; lastSignIn: string | null; hasPhoto: boolean; hasResume: boolean;
  }[];
  productTimeline: { date: string; tag: string; title: string; desc: string }[];
  contactSubmissions: { id: string; email: string; purpose: string; message: string; is_read: boolean; created_at: string }[];
  dataScience?: any;
  posthog: {
    available: boolean;
    pageviewsByDay: { day: string; views: number }[] | null;
    uniqueVisitors: { this_week: number; last_week: number } | null;
    topPages: { page: string; views: number; uniques: number }[] | null;
    topReferrers: { referrer: string; visits: number }[] | null;
    deviceTypes: { device: string; cnt: number }[] | null;
    osTypes: { os: string; cnt: number }[] | null;
    topCountries: { country: string; visits: number }[] | null;
    topBrowsers: { browser: string; cnt: number }[] | null;
    profileViewsTrend: { day: string; views: number; unique_viewers: number }[] | null;
    avgTimeOnProfile: { avg_seconds: number; max_seconds: number; sample_size: number } | null;
    funnelEvents: { event: string; cnt: number; unique_users: number }[] | null;
    shareEvents: { event: string; cnt: number }[] | null;
    pageviewsWoW: { this_week: number; last_week: number } | null;
    activeToday: number;
    jobClicksTotal: number;
    referrerConversions: { referrer: string; signups: number; visitors: number }[] | null;
  };
};

const chartConfig = { count: { label: 'Count', color: 'hsl(var(--foreground))' } } satisfies ChartConfig;
const viewsConfig = { views: { label: 'Views', color: 'hsl(var(--foreground))' } } satisfies ChartConfig;

function Stat({ v, label, sub }: { v: number | string; label: string; sub?: string }) {
  return (
    <div className="py-2">
      <p className="text-3xl font-bold tracking-tight">{typeof v === 'number' ? v.toLocaleString() : v}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
      {sub && <p className="text-xs text-muted-foreground/60 mt-0.5">{sub}</p>}
    </div>
  );
}

function WoWStat({ v, label, thisWeek, lastWeek }: { v: number | string; label: string; thisWeek: number; lastWeek: number }) {
  const diff = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : thisWeek > 0 ? 100 : 0;
  const isUp = diff > 0;
  const isDown = diff < 0;
  return (
    <div className="py-2">
      <p className="text-3xl font-bold tracking-tight">{typeof v === 'number' ? v.toLocaleString() : v}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
      <div className="flex items-center gap-1 mt-0.5">
        {isUp ? <TrendingUp className="h-3 w-3 text-green-500" /> : isDown ? <TrendingDown className="h-3 w-3 text-red-500" /> : <Minus className="h-3 w-3 text-muted-foreground" />}
        <span className={`text-xs font-medium ${isUp ? 'text-green-500' : isDown ? 'text-red-500' : 'text-muted-foreground'}`}>
          {isUp ? '+' : ''}{diff}% vs last week
        </span>
      </div>
    </div>
  );
}

function Pct({ has, total, label }: { has: number; total: number; label: string }) {
  const pct = total > 0 ? Math.round((has / total) * 100) : 0;
  return (
    <div className="py-2">
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold">{pct}%</span>
        <span className="text-xs text-muted-foreground">{has}/{total}</span>
      </div>
      <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function Section({ title, children, badge }: { title: string; children: React.ReactNode; badge?: string }) {
  return (
    <section className="pt-2">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
        {badge && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-semibold uppercase tracking-wider">{badge}</span>}
      </div>
      {children}
    </section>
  );
}

// Pretty event name: editor_cv_parse_started → CV Parse Started
function prettyEvent(event: string): string {
  return event
    .replace(/^(landing_|auth_|editor_|profile_|user_|db_)/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

// Device icon
function DeviceIcon({ type }: { type: string }) {
  const t = (type || '').toLowerCase();
  if (t === 'mobile') return <Smartphone className="h-3.5 w-3.5" />;
  if (t === 'tablet') return <Tablet className="h-3.5 w-3.5" />;
  return <Monitor className="h-3.5 w-3.5" />;
}

// PostHog Placeholder Card
function PostHogPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-border/80 bg-card/40 backdrop-blur-sm min-h-[180px] w-full">
      <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
        <Globe className="h-5 w-5 text-indigo-500" />
      </div>
      <h4 className="text-sm font-semibold text-foreground mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground max-w-sm">
        Web traffic analytics are powered by PostHog. Configure <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px] text-foreground">POSTHOG_PERSONAL_API_KEY</code> and <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px] text-foreground">POSTHOG_PROJECT_ID</code> in <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px] text-indigo-500">.env.local</code> to enable real-time tracking, geo-location, and device telemetry.
      </p>
    </div>
  );
}

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [data, setData] = useState<Analytics | null>(null);
  const [socialData, setSocialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isUserLoading) return;
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) { router.replace('/'); return; }
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      const token = session?.access_token;
      if (!token) { setError('No session'); setLoading(false); return; }
      Promise.all([
        fetch('/api/admin/analytics', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
          .then(async r => { if (!r.ok) { const d = await r.json(); throw new Error(JSON.stringify(d)); } return r.json(); }),
        fetch('/api/admin/social', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
          .then(async r => r.ok ? r.json() : null).catch(() => null),
      ]).then(([analytics, social]) => {
        setData(analytics);
        setSocialData(social);
      }).catch(e => setError(e.message)).finally(() => setLoading(false));
    });
  }, [user, isUserLoading, router]);

  if (isUserLoading || loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (error || !data) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-sm text-muted-foreground font-mono max-w-md text-center px-4">{error || 'Failed to load'}</p></div>;

  const { kpis, signupTrend, topProfiles, parseTrend, completeness, authProviders, recentUsers, productTimeline, contactSubmissions, posthog: ph } = data;
  const maxViews = topProfiles.length > 0 ? topProfiles[0].views : 1;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[1400px] mx-auto px-5 sm:px-8 py-10 space-y-16">

        <div>
          <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            CVin.Bio platform metrics
            {ph.available && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 font-semibold">PostHog Live</span>}
          </p>
        </div>

        {/* ═══ REAL-TIME KPIs (PostHog + Supabase) ═══ */}
        <Section title="Overview">
          <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-x-8 gap-y-6`}>
            <Stat v={kpis.totalUsers} label="Users" />
            <Stat v={kpis.totalViews} label="Total Views" sub={`avg ${kpis.avgViews} · median ${kpis.medianViews}`} />
            <Stat v={kpis.totalParses} label="CV Parses" />
            <Stat v={kpis.totalJobs} label="Jobs in DB" sub="Full board count" />
            <Stat v={kpis.usersUpdatedLast7d} label="Active Profiles (7d)" />
            <Stat v={kpis.zeroViewProfiles} label="Zero-View Profiles" sub={`${kpis.totalUsers > 0 ? Math.round((kpis.zeroViewProfiles / kpis.totalUsers) * 100) : 0}% of total`} />
            <Stat v={ph.activeToday || 0} label="Active Today" />
            <Stat v={ph.jobClicksTotal || 0} label="Job Apply Clicks" sub="Last 30 days" />
          </div>
        </Section>

        {/* ═══ SOCIAL MEDIA STATS ═══ */}
        {socialData && (
           <Section title="Social Media" badge={socialData.summary?.cacheAge ? `cached ${socialData.summary.cacheAge}m ago` : 'Live'}>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-x-8 gap-y-6 mb-8">
              <Stat v={(socialData.x?.queue?.threads?.posted || 0) + (socialData.x?.queue?.insights?.posted || 0) + (socialData.x?.queue?.engagement?.posted || 0)} label="X Posts" sub="Threads + Insights + Engagement" />
              {socialData.bluesky?.live && (
                <>
                  <Stat v={socialData.bluesky.live.followersCount || 0} label="BSky Followers" />
                </>
              )}
              <Stat v={socialData.threads?.insights?.totals?.views || 0} label="Threads Views" sub={`Last ${socialData.threads?.insights?.totals?.postsAnalyzed || 25} posts`} />
              <Stat v={socialData.summary?.totalPostsAcrossPlatforms || 0} label="Total posts" sub="All platforms" />
              <Stat v={socialData.summary?.totalEngagement || 0} label="Total engagement" sub="Likes + reposts + comments" />
              <Stat v={socialData.summary?.totalFollowers || 0} label="Total followers" sub="All platforms" />
              <Stat v={socialData.summary?.activePlatforms || 0} label="Active platforms" />
            </div>

            {/* Platform Detail Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
              {/* X Queue */}
              <div className="p-4 rounded-xl border border-border/50 bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  <span className="text-sm font-semibold">X (Twitter)</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-semibold ml-auto">Queue only</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Threads</span><span className="font-mono">{socialData.x?.queue?.threads?.posted || 0}/{socialData.x?.queue?.threads?.total || 0}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Insights</span><span className="font-mono">{socialData.x?.queue?.insights?.posted || 0}/{socialData.x?.queue?.insights?.total || 0}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Engagement</span><span className="font-mono">{socialData.x?.queue?.engagement?.posted || 0}/{socialData.x?.queue?.engagement?.total || 0}</span></div>
                  {socialData.summary?.totalTweetsInThreads > 0 && (
                    <div className="flex justify-between text-muted-foreground/60 text-xs pt-1 border-t border-border/30">
                      <span>Total thread tweets</span><span className="font-mono">{socialData.summary.totalTweetsInThreads}</span>
                    </div>
                  )}
                  {socialData.x?.queue?.lastPostedAt?.engagement && (
                    <div className="flex justify-between text-muted-foreground/60 text-xs">
                      <span>Last posted</span><span className="font-mono">{new Date(socialData.x.queue.lastPostedAt.engagement).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bluesky with Engagement */}
              <div className="p-4 rounded-xl border border-border/50 bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 600 530"><path d="M135.72 44.03C202.216 93.951 273.74 195.86 300 249.49c26.262-53.63 97.782-155.54 164.28-205.46C512.26 8.009 590-19.862 590 68.825c0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.38-3.69-10.832-3.708-7.896-.017-2.936-1.193.516-3.707 7.896-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.256 82.697-152.22-67.108 11.421-142.549-7.449-163.25-81.433C20.15 217.613 10 86.536 10 68.824c0-88.687 77.742-60.816 125.72-24.795z"/></svg>
                  <span className="text-sm font-semibold">Bluesky</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 font-semibold ml-auto">Live</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Posts published</span><span className="font-mono">{socialData.bluesky?.queue?.posted || 0}</span></div>
                  {socialData.bluesky?.live && (
                    <div className="flex justify-between"><span className="text-muted-foreground">Following</span><span className="font-mono">{socialData.bluesky.live.followsCount || 0}</span></div>
                  )}
                  {socialData.bluesky?.engagement && (
                    <>
                      <div className="pt-1 border-t border-border/30 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Engagement (last {socialData.bluesky.engagement.postsAnalyzed} posts)</div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Likes</span><span className="font-mono text-green-600">{socialData.bluesky.engagement.totalLikes}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Reposts</span><span className="font-mono text-blue-500">{socialData.bluesky.engagement.totalReposts}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Replies</span><span className="font-mono text-amber-500">{socialData.bluesky.engagement.totalReplies}</span></div>
                    </>
                  )}
                </div>
                {/* Top posts */}
                {socialData.bluesky?.engagement?.topPosts?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
                    <div className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Top posts</div>
                    {socialData.bluesky.engagement.topPosts.slice(0, 3).map((p: any, i: number) => (
                      <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="block text-xs text-muted-foreground truncate hover:text-foreground transition-colors">
                        <span className="font-mono text-foreground mr-1">{p.likes}♡ {p.reposts}⟳</span>
                        {p.text}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Threads (Meta) with Views */}
              <div className="p-4 rounded-xl border border-border/50 bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 192 192"><path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.745C82.2364 44.745 69.7731 51.1399 62.1308 62.6747L75.4077 71.0693C81.1525 62.5765 89.752 60.0826 97.2527 60.0826C97.3293 60.0826 97.4066 60.0826 97.4833 60.0833C105.262 60.1332 111.239 62.588 115.235 67.3541C118.063 70.7079 119.936 75.2083 120.815 80.8103C115.262 79.8577 109.243 79.4748 102.804 79.6658C84.1334 80.2242 71.8016 90.4963 72.5625 104.529C72.9471 111.618 76.4872 117.799 82.5362 121.986C87.6912 125.539 94.3342 127.244 101.258 126.861C110.346 126.36 117.575 122.652 122.65 115.847C126.386 110.896 128.828 104.498 130.055 96.4717C135.367 99.5581 139.35 103.672 141.653 108.788C145.509 117.283 146.043 131.627 136.008 141.585C127.093 150.437 116.426 154.653 97.3077 154.791C76.2293 154.638 60.4527 148.054 50.0766 135.044C40.3393 122.853 35.2673 105.624 35.1013 83.9999C35.2673 62.376 40.3393 45.1468 50.0766 32.9559C60.4527 19.946 76.2293 13.3619 97.3077 13.2089C118.506 13.363 134.415 20.0023 145.005 33.1272C150.19 39.553 154.133 47.4605 156.768 56.6019L170.831 52.8832C167.676 41.8832 163.015 32.4625 156.727 24.6475C143.804 8.46255 125.555 0.10947 97.3462 0H97.2694C69.1837 0.0993418 51.0669 8.51169 38.1512 24.8197C26.5571 39.3801 20.5448 59.4305 20.35 83.9448L20.3484 83.9999L20.35 84.055C20.5448 108.569 26.5571 128.62 38.1512 143.18C51.0669 159.488 69.1837 167.901 97.2694 168H97.3462C119.369 167.838 133.02 162.476 144.336 151.222C159.784 135.86 159.03 116.052 153.843 104.277C150.179 96.0946 143.555 89.5738 141.537 88.9883ZM100.536 113.637C92.5345 114.087 86.0574 109.739 85.7382 103.955C85.4944 99.4766 88.8577 94.2584 102.356 93.8207C104.152 93.7647 105.916 93.7389 107.649 93.7389C112.118 93.7389 116.344 94.1455 120.244 94.9389C118.671 108.921 110.363 113.087 100.536 113.637Z"/></svg>
                  <span className="text-sm font-semibold">Threads</span>
                  {socialData.threads?.insights && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 font-semibold ml-auto">Live</span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Posts published</span><span className="font-mono">{socialData.threads?.queue?.posted || 0}</span></div>
                  {socialData.threads?.insights?.totals && (
                    <>
                      <div className="pt-1 border-t border-border/30 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Engagement ({socialData.threads.insights.totals.postsAnalyzed} posts)</div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Views</span><span className="font-mono text-purple-500 font-semibold">{socialData.threads.insights.totals.views.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Likes</span><span className="font-mono text-green-600">{socialData.threads.insights.totals.likes}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Replies</span><span className="font-mono text-amber-500">{socialData.threads.insights.totals.replies}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Reposts</span><span className="font-mono text-blue-500">{socialData.threads.insights.totals.reposts}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Quotes</span><span className="font-mono text-indigo-400">{socialData.threads.insights.totals.quotes}</span></div>
                    </>
                  )}
                </div>
                {/* Top posts by views */}
                {socialData.threads?.insights?.topPosts?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
                    <div className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Top posts by views</div>
                    {socialData.threads.insights.topPosts.slice(0, 5).map((p: any, i: number) => (
                      <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-purple-500 font-semibold shrink-0">{p.views.toLocaleString()} views</span>
                          <span className="font-mono text-foreground/60 shrink-0">{p.likes}♡ {p.reposts}⟳</span>
                        </div>
                        <div className="truncate mt-0.5 text-muted-foreground/80">{p.text}</div>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl border border-border/50 bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <Share2 className="h-4 w-4" />
                  <span className="text-sm font-semibold">Meta + Buffer</span>
                  {(socialData.meta?.facebook || socialData.meta?.instagram) && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 font-semibold ml-auto">Live</span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  {/* Queue counts */}
                  <div className="flex justify-between"><span className="text-muted-foreground">Facebook posts</span><span className="font-mono">{socialData.meta?.queue?.facebook?.posted || 0}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Instagram posts</span><span className="font-mono">{socialData.meta?.queue?.instagram?.posted || 0}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Threads posts</span><span className="font-mono">{socialData.meta?.queue?.threads?.posted || 0}</span></div>

                  {/* Facebook engagement */}
                  {socialData.meta?.facebook?.totals && (
                    <>
                      <div className="pt-1 border-t border-border/30 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">FB Engagement ({socialData.meta.facebook.totals.postsAnalyzed} posts)</div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Reactions</span><span className="font-mono text-green-600">{socialData.meta.facebook.totals.reactions}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Comments</span><span className="font-mono text-amber-500">{socialData.meta.facebook.totals.comments}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Shares</span><span className="font-mono text-blue-500">{socialData.meta.facebook.totals.shares}</span></div>
                      {socialData.meta.facebook.page?.followers > 0 && (
                        <div className="flex justify-between"><span className="text-muted-foreground">Followers</span><span className="font-mono">{socialData.meta.facebook.page.followers}</span></div>
                      )}
                    </>
                  )}

                  {/* Instagram engagement */}
                  {socialData.meta?.instagram?.totals && (
                    <>
                      <div className="pt-1 border-t border-border/30 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">IG Engagement ({socialData.meta.instagram.totals.postsAnalyzed} posts)</div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Likes</span><span className="font-mono text-green-600">{socialData.meta.instagram.totals.likes}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Comments</span><span className="font-mono text-amber-500">{socialData.meta.instagram.totals.comments}</span></div>
                      {socialData.meta.instagram.profile?.followers > 0 && (
                        <div className="flex justify-between"><span className="text-muted-foreground">Followers</span><span className="font-mono">{socialData.meta.instagram.profile.followers}</span></div>
                      )}
                    </>
                  )}

                  {/* Buffer stats */}
                  <div className="flex justify-between text-muted-foreground/60 text-xs pt-1 border-t border-border/30">
                    <span>Buffer - LinkedIn</span><span className="font-mono">{socialData.buffer?.queue?.linkedin || 0}</span>
                  </div>
                  {socialData.buffer?.analytics?.map((b: any, i: number) => (
                    b.totals && b.totals.clicks > 0 && (
                      <div key={i} className="flex justify-between text-muted-foreground/60 text-xs">
                        <span>Buffer {b.service} clicks</span><span className="font-mono text-blue-500">{b.totals.clicks}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Telegram Channel */}
              <div className="p-4 rounded-xl border border-border/50 bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  <span className="text-sm font-semibold">Telegram</span>
                  {socialData.telegram?.channel && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 font-semibold ml-auto">Live</span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  {socialData.telegram?.channel ? (
                    <>
                      <div className="flex justify-between"><span className="text-muted-foreground">Channel</span><span className="font-mono text-xs">@{socialData.telegram.channel.username}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Subscribers</span><span className="font-mono text-green-600 font-semibold">{socialData.telegram.channel.memberCount.toLocaleString()}</span></div>
                      {socialData.telegram.channel.description && (
                        <div className="text-xs text-muted-foreground/60 pt-1 border-t border-border/30 truncate">{socialData.telegram.channel.description}</div>
                      )}
                    </>
                  ) : (
                    <div className="text-xs text-muted-foreground/60">No Telegram token configured</div>
                  )}
                </div>
              </div>
            </div>
          </Section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ═══ PAGEVIEWS CHART (PostHog) ═══ */}
          <Section title="Pageviews (30 days)" badge={ph.available ? "PostHog" : "Supabase"}>
            {ph.pageviewsByDay && ph.pageviewsByDay.length > 0 ? (
              <ChartContainer config={viewsConfig} className="h-[180px] w-full">
                <AreaChart data={ph.pageviewsByDay}>
                  <defs><linearGradient id="pvg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity={0.12}/><stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={(v: string) => `${new Date(v).getDate()}/${new Date(v).getMonth()+1}`} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} className="fill-muted-foreground" allowDecimals={false} width={30} />
                  <Area type="monotone" dataKey="views" stroke="hsl(var(--foreground))" fill="url(#pvg)" strokeWidth={1.5} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </AreaChart>
              </ChartContainer>
            ) : null}
          </Section>

          {/* ═══ SIGNUPS CHART (Supabase) ═══ */}
          <Section title="Signups">
            <ChartContainer config={chartConfig} className="h-[180px] w-full">
              <AreaChart data={signupTrend}>
                <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity={0.1}/><stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={(v: string) => `${new Date(v).getDate()}/${new Date(v).getMonth()+1}`} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} className="fill-muted-foreground" allowDecimals={false} width={24} />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--foreground))" fill="url(#sg)" strokeWidth={1.5} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </AreaChart>
            </ChartContainer>
          </Section>
        </div>

        {/* ═══ PROFILE ENGAGEMENT (PostHog / Supabase) ═══ */}
        <Section title="Profile engagement (30 days)" badge={ph.available ? "PostHog" : "Supabase"}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-4 mb-6">
            <Stat
              v={ph.profileViewsTrend ? ph.profileViewsTrend.reduce((s, d) => s + d.views, 0) : kpis.totalViews}
              label={ph.available ? "Profile views" : "Profile views (30d)"}
              sub={ph.profileViewsTrend ? `${ph.profileViewsTrend.reduce((s, d) => s + d.unique_viewers, 0)} unique` : `avg ${kpis.avgViews} · median ${kpis.medianViews}`}
            />
            {ph.avgTimeOnProfile ? (
              <Stat
                v={`${Math.round(ph.avgTimeOnProfile.avg_seconds || 0)}s`}
                label="Avg. time on profile"
                sub={`max ${Math.round(ph.avgTimeOnProfile.max_seconds || 0)}s · ${ph.avgTimeOnProfile.sample_size} samples`}
              />
            ) : (
              <Stat v={kpis.zeroViewProfiles} label="Zero-view profiles" sub={`${kpis.totalUsers > 0 ? Math.round((kpis.zeroViewProfiles / kpis.totalUsers) * 100) : 0}% of total`} />
            )}
            <Stat v={kpis.usersUpdatedLast7d} label="Active profiles (7d)" sub="Recently updated in Supabase" />
          </div>
          {ph.profileViewsTrend && ph.profileViewsTrend.length > 0 && (
            <ChartContainer config={viewsConfig} className="h-[160px] w-full">
              <BarChart data={ph.profileViewsTrend}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={(v: string) => `${new Date(v).getDate()}/${new Date(v).getMonth()+1}`} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} className="fill-muted-foreground" allowDecimals={false} width={24} />
                <Bar dataKey="views" fill="hsl(var(--foreground))" radius={[2,2,0,0]} opacity={0.5} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ChartContainer>
          )}
        </Section>

        {/* ═══ TRAFFIC SOURCES (PostHog) ═══ */}
        <Section title="Traffic sources (7 days)" badge={ph.available ? "PostHog" : "Estimated"}>
          {ph.topReferrers && ph.topReferrers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
              {ph.topReferrers.map((r, i) => {
                const maxR = ph.topReferrers![0].visits || 1;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 mb-0.5">
                        <span className="text-sm truncate">{r.referrer || 'Direct'}</span>
                        <span className="text-xs text-muted-foreground font-mono shrink-0">{r.visits}</span>
                      </div>
                      <div className="h-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-indigo-500/40" style={{ width: `${(r.visits / maxR) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground/60">No referrer data available yet.</p>
          )}
        </Section>

        {/* ═══ REFERRER CONVERSIONS (PostHog) ═══ */}
        {ph.referrerConversions && ph.referrerConversions.length > 0 && (
          <Section title="Referrer → Signups (90 days)" badge="PostHog">
            <p className="text-xs text-muted-foreground mb-4">Which traffic sources led to user signups (first-touch attribution)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
              {ph.referrerConversions.map((r, i) => {
                const maxR = ph.referrerConversions![0].signups || 1;
                const total = ph.referrerConversions!.reduce((s, x) => s + x.signups, 0);
                const sharePct = total > 0 ? ((r.signups / total) * 100).toFixed(0) : '0';
                const convRate = r.visitors > 0 ? ((r.signups / r.visitors) * 100).toFixed(1) : null;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 mb-0.5">
                        <span className="text-sm truncate">{r.referrer || 'Direct'}</span>
                        <span className="text-xs text-muted-foreground font-mono shrink-0">
                          {r.signups} <span className="text-muted-foreground/60">({sharePct}%)</span>
                          {convRate && <span className="text-green-500 ml-1">~CVR {convRate}%</span>}
                        </span>
                      </div>
                      <div className="h-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-green-500/40" style={{ width: `${(r.signups / maxR) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* ═══ TOP PAGES (PostHog) ═══ */}
        <Section title="Top pages (7 days)" badge={ph.available ? "PostHog" : "Estimated"}>
          {ph.topPages && ph.topPages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
              {ph.topPages.slice(0, 15).map((p, i) => {
                const maxP = ph.topPages![0].views || 1;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4 text-right shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 mb-0.5">
                        <a href={`https://cvin.bio${p.page}`} target="_blank" rel="noopener noreferrer" className="text-sm font-mono truncate hover:underline underline-offset-2">{p.page}</a>
                        <span className="text-xs text-muted-foreground shrink-0">{p.views} <span className="text-muted-foreground/50">({p.uniques}u)</span></span>
                      </div>
                      <div className="h-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-foreground/20" style={{ width: `${(p.views / maxP) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground/60">No page data available yet.</p>
          )}
        </Section>

        {/* ═══ GEOGRAPHY & DEVICES (PostHog) ═══ */}
        <Section title="Audience (7 days)" badge={ph.available ? "PostHog" : "Supabase"}>
          {ph.topCountries || ph.deviceTypes || ph.osTypes || ph.topBrowsers ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Countries */}
              {ph.topCountries && ph.topCountries.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">Countries</p>
                  <div className="space-y-2">
                    {ph.topCountries.slice(0, 8).map((c, i) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <span className="text-sm truncate">{c.country}</span>
                        <span className="text-xs text-muted-foreground font-mono shrink-0">{c.visits}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Devices */}
              {ph.deviceTypes && ph.deviceTypes.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">Devices</p>
                  <div className="space-y-2">
                    {ph.deviceTypes.map((d, i) => {
                      const total = ph.deviceTypes!.reduce((s, x) => s + x.cnt, 0);
                      const pct = total > 0 ? Math.round((d.cnt / total) * 100) : 0;
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <DeviceIcon type={d.device} />
                          <span className="text-sm flex-1">{d.device || 'Unknown'}</span>
                          <span className="text-xs text-muted-foreground font-mono">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* OSes */}
              {ph.osTypes && ph.osTypes.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">OS</p>
                  <div className="space-y-2">
                    {ph.osTypes.map((o, i) => {
                      const total = ph.osTypes!.reduce((s, x) => s + x.cnt, 0);
                      const pct = total > 0 ? Math.round((o.cnt / total) * 100) : 0;
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm flex-1">{o.os || 'Unknown'}</span>
                          <span className="text-xs text-muted-foreground font-mono">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Browsers */}
              {ph.topBrowsers && ph.topBrowsers.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">Browsers</p>
                  <div className="space-y-2">
                    {ph.topBrowsers.slice(0, 6).map((b, i) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <span className="text-sm truncate">{b.browser}</span>
                        <span className="text-xs text-muted-foreground font-mono shrink-0">{b.cnt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground/60">No audience data available yet.</p>
          )}
        </Section>

        {/* ═══ CONVERSION FUNNEL (PostHog / Supabase Fallback) ═══ */}
        {ph.funnelEvents && ph.funnelEvents.length > 0 && (
          <Section title={ph.available ? "Event funnel (30 days)" : "Conversion Funnel"} badge={ph.available ? "PostHog" : "Estimated"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {ph.funnelEvents.map((e, i) => {
                const maxE = ph.funnelEvents![0].cnt;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 mb-0.5">
                        <span className="text-sm truncate">{prettyEvent(e.event)}</span>
                        <span className="text-xs text-muted-foreground shrink-0 font-mono">
                          {e.cnt} 
                          {ph.available && <span className="text-muted-foreground/50"> ({e.unique_users}u)</span>}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-indigo-500/50" style={{ width: `${maxE > 0 ? (e.cnt / maxE) * 100 : 0}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* ═══ SHARE ANALYTICS (PostHog) ═══ */}
        <Section title="Sharing (30 days)" badge={ph.available ? "PostHog" : "Estimated"}>
          {ph.shareEvents && ph.shareEvents.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-8 gap-y-4">
              {ph.shareEvents.map((e, i) => (
                <div key={i} className="py-1">
                  <p className="text-xl font-bold">{e.cnt}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{prettyEvent(e.event)}</p>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ═══ PROFILE COMPLETENESS (Supabase) ═══ */}
        <Section title="Profile completeness">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-8 gap-y-6">
            <Pct has={completeness.hasPhoto} total={kpis.totalUsers} label="Photo" />
            <Pct has={completeness.hasExperience} total={kpis.totalUsers} label="Experience" />
            <Pct has={completeness.hasEducation} total={kpis.totalUsers} label="Education" />
            <Pct has={completeness.hasSkills} total={kpis.totalUsers} label="Skills" />
            <Pct has={completeness.hasCustomSections} total={kpis.totalUsers} label="Custom sections" />
            <Pct has={completeness.hasLinks} total={kpis.totalUsers} label="Links" />
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-1 mt-6 text-xs text-muted-foreground">
            <span>{kpis.totalWorkEntries} work entries</span>
            <span>{kpis.totalEduEntries} edu entries</span>
            <span>{kpis.avgSkillsPerUser} skills/user</span>
            <span>{kpis.totalLinksCount} total links</span>
          </div>
        </Section>


        {/* ═══ TOP PROFILES (Supabase) ═══ */}
        <Section title="Top profiles by views">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
            {topProfiles.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-5 shrink-0 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <a href={`https://cvin.bio/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium truncate hover:underline underline-offset-2">{p.name}</a>
                    <span className="text-xs text-muted-foreground shrink-0 font-mono">{p.views}</span>
                  </div>
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-foreground/30" style={{ width: `${(p.views / maxViews) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══ CV PARSES CHART (Supabase) ═══ */}
        <Section title="CV Parses">
          <ChartContainer config={chartConfig} className="h-[160px] w-full">
            <BarChart data={parseTrend}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={(v: string) => `${new Date(v).getDate()}/${new Date(v).getMonth()+1}`} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} className="fill-muted-foreground" allowDecimals={false} width={24} />
              <Bar dataKey="count" fill="hsl(var(--foreground))" radius={[2,2,0,0]} opacity={0.6} />
              <ChartTooltip content={<ChartTooltipContent />} />
            </BarChart>
          </ChartContainer>
        </Section>

        {/* ═══ AUTH PROVIDERS (Supabase) ═══ */}
        {authProviders.length > 0 && (
          <Section title="Auth providers">
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {authProviders.map(p => (
                <div key={p.provider}>
                  <span className="text-xl font-bold">{p.count}</span>
                  <span className="text-sm text-muted-foreground ml-2">{p.provider}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ═══ RECENT SIGNUPS (Supabase) ═══ */}
        <Section title="Recent signups">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
            {recentUsers.map((u, i) => (
              <div key={i} className="flex items-start justify-between gap-4 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{u.name || '—'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{u.email}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-[11px] text-muted-foreground/70">
                    {u.slug && <a href={`https://cvin.bio/${u.slug}`} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-2">/{u.slug}</a>}
                    <span>{u.views} views</span>
                    {u.lastSignIn && <span>Last active: {new Date(u.lastSignIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                    <span>{u.hasPhoto ? 'Photo ✓' : 'No photo'}</span>
                    <span>{u.hasResume ? 'CV ✓' : 'No CV'}</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══ TIMELINE (static) ═══ */}
        <Section title="Changelog">
          <div className="space-y-5">
            {productTimeline.map((e, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-xs text-muted-foreground w-12 shrink-0 pt-0.5 text-right">{new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                <div className="pb-5 border-l border-border/60 pl-4 -mt-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{e.title}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground leading-none">{e.tag}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══ CONTACT SUBMISSIONS (Supabase) ═══ */}
        {contactSubmissions.length > 0 && (
          <Section title={`Contact submissions (${contactSubmissions.length})`}>
            <div className="space-y-4">
              {contactSubmissions.map((s) => (
                <div key={s.id} className="pb-4 border-b border-border/50 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{s.email}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground leading-none">
                          {s.purpose.replace('-', ' ')}
                        </span>
                        {!s.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" title="Unread" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed whitespace-pre-wrap">
                        {s.message}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ═══ DATA SCIENCE INSIGHTS ═══ */}
        <Section title="Data Science Insights" badge="Mathematical Analysis">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-5 rounded-xl border border-border/50 bg-indigo-500/5">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-indigo-700 mb-4">
                <TrendingUp className="h-4 w-4" /> Statistical Signals
              </h3>
              <ul className="space-y-3">
                {(() => {
                  const items = [];
                  const ds = data.dataScience;
                  if (ds) {
                    if (Math.abs(ds.correlation_views_signups) > 0) {
                      const r = ds.correlation_views_signups;
                      const strength = Math.abs(r) > 0.7 ? 'Strong' : Math.abs(r) > 0.4 ? 'Moderate' : 'Weak';
                      const direction = r > 0 ? 'positive' : 'negative';
                      items.push(
                        <li key="corr" className="text-sm text-muted-foreground">
                          <strong>Conversion Causality (Pearson r):</strong> {r.toFixed(2)}.<br/>
                          Demonstrates a <em>{strength.toLowerCase()} {direction} linear correlation</em> between daily pageviews and account signups. {r > 0.5 ? 'This implies highly targeted traffic acquisition where views reliably predict account creation.' : 'This suggests traffic is generating brand awareness but not acting as a direct causal vector for signups.'}
                        </li>
                      );
                    }
                    if (ds.traffic_velocity_slope !== 0) {
                      const vel = ds.traffic_velocity_slope;
                      items.push(
                        <li key="vel" className="text-sm text-muted-foreground">
                          <strong>Growth Velocity (Regression Slope):</strong> {vel > 0 ? '+' : ''}{vel.toFixed(1)} views/day.<br/>
                          The linear regression modeling across a 30-day index shows a {vel > 0 ? 'compounding' : 'decaying'} trajectory. {vel > 0 ? 'Your top-of-funnel retention curve is upward trending.' : 'You are observing baseline decay; marketing injection is required to break the plateau.'}
                        </li>
                      );
                    }
                  }
                  
                  const cvRatio = kpis.totalParses > 0 ? (kpis.totalUsers / kpis.totalParses) : 0;
                  if (cvRatio > 0) {
                     items.push(<li key="cv" className="text-sm text-muted-foreground"><strong>Drop-off Coefficient:</strong> {(cvRatio * 100).toFixed(0)}% retention from parser initialization to database persistence, indicating UI friction delta.</li>);
                  }

                  // Engagement Concentration (top profiles vs total)
                  if (topProfiles.length > 0 && kpis.totalViews > 0) {
                    const topViewsSum = topProfiles.reduce((s: number, p: any) => s + p.views, 0);
                    const concentration = topViewsSum / kpis.totalViews;
                    items.push(<li key="gini" className="text-sm text-muted-foreground"><strong>Engagement Concentration:</strong> Top {topProfiles.length} profiles capture {(concentration * 100).toFixed(0)}% of all views ({topViewsSum.toLocaleString()} of {kpis.totalViews.toLocaleString()}). {concentration > 0.8 ? 'Extreme concentration: a handful of profiles absorb nearly all traffic. Distribution follows a power-law pattern typical of early-stage platforms.' : concentration > 0.5 ? 'Moderate concentration. Views are spreading across profiles but top performers still dominate.' : 'Healthy distribution: views are relatively spread across the user base.'}</li>);
                  }

                  // Skill Density Distribution
                  if (kpis.avgSkillsPerUser > 0) {
                    const skillDensity = kpis.avgSkillsPerUser;
                    items.push(<li key="skill" className="text-sm text-muted-foreground"><strong>Skill Density Index:</strong> {skillDensity} skills/user average. {skillDensity > 8 ? 'High signal density indicates users are investing effort in structured profiles, improving matching accuracy.' : skillDensity > 4 ? 'Moderate skill density. Profiles contain enough data points for meaningful skill-based filtering.' : 'Low skill density. Consider prompting users to add more skills during onboarding to improve match quality.'}</li>);
                  }

                  // Profile Freshness Index
                  const freshnessRate = kpis.totalUsers > 0 ? (kpis.usersUpdatedLast7d / kpis.totalUsers) : 0;
                  items.push(<li key="fresh" className="text-sm text-muted-foreground"><strong>Profile Freshness Index:</strong> {(freshnessRate * 100).toFixed(0)}% of profiles updated in the last 7 days. {freshnessRate > 0.3 ? 'Healthy recency signal. Active user base is maintaining profile freshness, which directly improves data quality for employer queries.' : freshnessRate > 0.1 ? 'Moderate freshness. Consider re-engagement prompts for dormant profiles to maintain data currency.' : 'Low freshness rate signals a retention gap. Users are creating profiles but not returning to update them.'}</li>);

                  // Signup acceleration (7d vs previous 7d)
                  if (signupTrend.length >= 14) {
                    const last7 = signupTrend.slice(-7).reduce((s, d) => s + d.count, 0);
                    const prev7 = signupTrend.slice(-14, -7).reduce((s, d) => s + d.count, 0);
                    const accel = prev7 > 0 ? ((last7 - prev7) / prev7 * 100) : (last7 > 0 ? 100 : 0);
                    items.push(<li key="accel" className="text-sm text-muted-foreground"><strong>Signup Acceleration:</strong> {accel > 0 ? '+' : ''}{accel.toFixed(0)}% week-over-week. {last7} signups this week vs {prev7} prior week. {accel > 20 ? 'Growth is accelerating, indicating effective acquisition channels.' : accel > -10 ? 'Growth is holding steady at the current baseline.' : 'Deceleration detected. Review acquisition channels and referral sources for drop-off.'}</li>);
                  }
                  
                  if (items.length === 0) items.push(<li key="none" className="text-sm text-muted-foreground">Gathering sufficient timeline arrays to compute regression matrices.</li>);
                  return items;
                })()}
              </ul>
            </div>
            
            <div className="p-5 rounded-xl border border-border/50 bg-amber-500/5">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-amber-700 mb-4">
                <Globe className="h-4 w-4" /> Anomaly &amp; Variance Detection
              </h3>
              <ul className="space-y-3">
                {(() => {
                  const items = [];
                  const ds = data.dataScience;
                  
                  if (ds && ds.anomaly_days && ds.anomaly_days.length > 0) {
                    items.push(
                      <li key="anom" className="text-sm text-muted-foreground">
                        <strong>Z-Score Anomalies (σ &gt; 2.0):</strong> Detected {ds.anomaly_days.length} statistically significant deviances from the moving average.
                        <ul className="mt-2 space-y-1 ml-4 list-disc text-xs opacity-80">
                          {ds.anomaly_days.map((an: any, i: number) => (
                            <li key={i}>{new Date(an.date).toLocaleDateString()} - {an.type === 'surge' ? '+' : ''}{an.dev}σ {an.type}</li>
                          ))}
                        </ul>
                      </li>
                    );
                  }

                  const zeroViewsRate = kpis.totalUsers > 0 ? (kpis.zeroViewProfiles / kpis.totalUsers) : 0;
                  if (zeroViewsRate > 0.3) items.push(<li key="zero" className="text-sm text-muted-foreground"><strong>Network Centrality Deficit:</strong> {(zeroViewsRate * 100).toFixed(0)}% of nodes (profiles) have 0 inbound edges (views). High distribution variance indicates a power-law curve where top profiles absorb the majority of traffic.</li>);
                  
                  const desktopVol = ph.deviceTypes?.find(d => d.device.toLowerCase() === 'desktop')?.cnt || 0;
                  const mobileVol = ph.deviceTypes?.find(d => d.device.toLowerCase() === 'mobile')?.cnt || 0;
                  if (mobileVol > 0 && desktopVol > 0) {
                    const ratio = mobileVol / desktopVol;
                    items.push(<li key="mobile" className="text-sm text-muted-foreground"><strong>Device Vector Imbalance:</strong> Mobile-to-desktop ratio is {ratio.toFixed(1)}x. {ratio > 1.5 ? 'Mobile traffic significantly outpaces desktop, misaligning with the desktop-biased CV parser utilization curve. Consider mobile-first parsing UX.' : ratio < 0.7 ? 'Desktop-heavy traffic aligns well with CV editing workflows but indicates limited mobile discovery channels.' : 'Balanced device distribution suggests healthy multi-channel acquisition.'}</li>);
                  }

                  // Content Completeness Skew
                  const photoRate = kpis.totalUsers > 0 ? (kpis.usersWithPhoto / kpis.totalUsers) : 0;
                  const expRate = kpis.totalUsers > 0 ? (kpis.usersWithExperience / kpis.totalUsers) : 0;
                  const eduRate = kpis.totalUsers > 0 ? (kpis.usersWithEducation / kpis.totalUsers) : 0;
                  const skillRate = kpis.totalUsers > 0 ? (kpis.usersWithSkills / kpis.totalUsers) : 0;
                  const rates = [photoRate, expRate, eduRate, skillRate];
                  const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;
                  const completenessVariance = Math.sqrt(rates.reduce((a, b) => a + Math.pow(b - avgRate, 2), 0) / rates.length);
                  items.push(<li key="complete" className="text-sm text-muted-foreground"><strong>Completeness Skew (σ):</strong> {completenessVariance.toFixed(2)} across 4 profile dimensions (photo {(photoRate*100).toFixed(0)}%, experience {(expRate*100).toFixed(0)}%, education {(eduRate*100).toFixed(0)}%, skills {(skillRate*100).toFixed(0)}%). {completenessVariance > 0.2 ? 'High variance suggests users complete some fields but abandon others. Target the lowest-completion field in onboarding prompts.' : 'Low variance indicates consistent profile completion behavior.'}</li>);

                  // Referrer Concentration (HHI)
                  if (ph.topReferrers && ph.topReferrers.length > 1) {
                    const totalRefs = ph.topReferrers.reduce((s: number, r: any) => s + r.visits, 0);
                    if (totalRefs > 0) {
                      const hhi = ph.topReferrers.reduce((s: number, r: any) => {
                        const share = r.visits / totalRefs;
                        return s + share * share;
                      }, 0);
                      items.push(<li key="hhi" className="text-sm text-muted-foreground"><strong>Referrer Concentration (HHI):</strong> {(hhi * 10000).toFixed(0)} / 10,000. {hhi > 0.25 ? 'High concentration: traffic depends on 1-2 dominant sources. Diversify acquisition to reduce single-channel risk.' : hhi > 0.15 ? 'Moderate concentration. Primary channels are effective but expansion would reduce dependency risk.' : 'Healthy distribution across multiple referral sources.'}</li>);
                    }
                  }

                  // Geographic Concentration
                  if (ph.topCountries && ph.topCountries.length > 1) {
                    const totalGeo = ph.topCountries.reduce((s: number, c: any) => s + c.visits, 0);
                    const topCountryShare = totalGeo > 0 ? (ph.topCountries[0].visits / totalGeo) : 0;
                    items.push(<li key="geo" className="text-sm text-muted-foreground"><strong>Geographic Concentration:</strong> {ph.topCountries[0].country} accounts for {(topCountryShare * 100).toFixed(0)}% of traffic across {ph.topCountries.length} detected countries. {topCountryShare > 0.6 ? 'Single-market dominance. International expansion would diversify the user base and reduce geographic risk.' : 'Distributed across multiple regions, indicating global appeal.'}</li>);
                  }

                  // Work-to-Education Ratio
                  if (kpis.totalWorkEntries > 0 || kpis.totalEduEntries > 0) {
                    const weRatio = kpis.totalEduEntries > 0 ? (kpis.totalWorkEntries / kpis.totalEduEntries) : kpis.totalWorkEntries;
                    items.push(<li key="weratio" className="text-sm text-muted-foreground"><strong>Work-to-Education Ratio:</strong> {weRatio.toFixed(1)}x ({kpis.totalWorkEntries} work entries vs {kpis.totalEduEntries} education entries). {weRatio > 3 ? 'Experienced professional user base. Users prioritize work history over credentials, typical of mid-career and senior profiles.' : weRatio > 1.5 ? 'Balanced mix of professional experience and educational background. Healthy distribution for a talent platform.' : 'Education-heavy profiles suggest early-career users or recent graduates dominate the user base.'}</li>);
                  }
                  
                  if (items.length === 0) items.push(<li key="none" className="text-sm text-muted-foreground">Variance across cohorts remains within standard deviation thresholds (σ &lt; 1.0).</li>);
                  return items;
                })()}
              </ul>
            </div>
          </div>
        </Section>

        {/* ═══ PostHog config notice ═══ */}
        {!ph.available && (
          <div className="text-xs text-muted-foreground/40 text-center py-4 border border-dashed border-border rounded-lg">
            Add <code className="bg-muted px-1 rounded text-[10px]">POSTHOG_PERSONAL_API_KEY</code> and <code className="bg-muted px-1 rounded text-[10px]">POSTHOG_PROJECT_ID</code> to .env.local for live analytics
          </div>
        )}

        {/* ═══ Web3 Jobs Social Schedule ═══ */}
        <CVinBioVisualCalendar />

        <p className="text-[10px] text-muted-foreground/30 pt-6 pb-8 text-center">admin-only · not indexed</p>
      </main>
    </div>
  );
}
