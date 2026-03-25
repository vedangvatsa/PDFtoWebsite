'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/auth';
import { createClient } from '@/utils/supabase/client';
import Header from '@/components/header';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Area, AreaChart } from 'recharts';
import { Loader2 } from 'lucide-react';

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
    provider: string; createdAt: string; hasPhoto: boolean; hasResume: boolean;
  }[];
  productTimeline: { date: string; tag: string; title: string; desc: string }[];
};

const chartConfig = { count: { label: 'Count', color: 'hsl(var(--foreground))' } } satisfies ChartConfig;
const viewsConfig = { views: { label: 'Views', color: 'hsl(var(--foreground))' } } satisfies ChartConfig;

function N({ v, label, sub }: { v: number | string; label: string; sub?: string }) {
  return (
    <div>
      <p className="text-2xl font-bold tracking-tight">{typeof v === 'number' ? v.toLocaleString() : v}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground/60">{sub}</p>}
    </div>
  );
}

function Pct({ has, total, label }: { has: number; total: number; label: string }) {
  const pct = total > 0 ? Math.round((has / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-bold">{pct}%</span>
        <span className="text-[10px] text-muted-foreground">{has}/{total}</span>
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isUserLoading) return;
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) { router.replace('/'); return; }
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      const token = session?.access_token;
      if (!token) { setError('No session'); setLoading(false); return; }
      fetch('/api/admin/analytics', { headers: { Authorization: `Bearer ${token}` } })
        .then(async r => { if (!r.ok) { const d = await r.json(); throw new Error(JSON.stringify(d)); } return r.json(); })
        .then(setData).catch(e => setError(e.message)).finally(() => setLoading(false));
    });
  }, [user, isUserLoading, router]);

  if (isUserLoading || loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (error || !data) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-sm text-muted-foreground font-mono">{error || 'Failed to load'}</p></div>;

  const { kpis, signupTrend, topProfiles, parseTrend, completeness, authProviders, recentUsers, productTimeline } = data;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-10">

        <div>
          <h1 className="text-lg font-bold tracking-tight">Admin</h1>
          <p className="text-xs text-muted-foreground">CVin.Bio platform data</p>
        </div>

        {/* Numbers */}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            <N v={kpis.totalUsers} label="Users" />
            <N v={kpis.totalViews} label="Views" sub={`avg ${kpis.avgViews} · med ${kpis.medianViews}`} />
            <N v={kpis.totalParses} label="CV Parses" />
            <N v={kpis.usersUpdatedLast7d} label="Active (7d)" sub={`${kpis.totalUsers > 0 ? Math.round((kpis.usersUpdatedLast7d / kpis.totalUsers) * 100) : 0}%`} />
            <N v={kpis.zeroViewProfiles} label="Zero views" sub={`${kpis.totalUsers > 0 ? Math.round((kpis.zeroViewProfiles / kpis.totalUsers) * 100) : 0}%`} />
          </div>
        </section>

        <hr className="border-border" />

        {/* Completeness */}
        <section>
          <h2 className="text-sm font-semibold mb-3">Completeness</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <Pct has={completeness.hasPhoto} total={kpis.totalUsers} label="Photo" />
            <Pct has={completeness.hasExperience} total={kpis.totalUsers} label="Experience" />
            <Pct has={completeness.hasEducation} total={kpis.totalUsers} label="Education" />
            <Pct has={completeness.hasSkills} total={kpis.totalUsers} label="Skills" />
            <Pct has={completeness.hasCustomSections} total={kpis.totalUsers} label="Extras" />
            <Pct has={completeness.hasLinks} total={kpis.totalUsers} label="Links" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs text-muted-foreground">
            <span>{kpis.totalWorkEntries} work entries</span>
            <span>{kpis.totalEduEntries} edu entries</span>
            <span>{kpis.avgSkillsPerUser} skills/user</span>
            <span>{kpis.totalLinksCount} total links</span>
          </div>
        </section>

        <hr className="border-border" />

        {/* Signups Chart */}
        <section>
          <h2 className="text-sm font-semibold mb-3">Signups</h2>
          <ChartContainer config={chartConfig} className="h-[160px] w-full">
            <AreaChart data={signupTrend}>
              <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity={0.15}/><stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 9 }} className="fill-muted-foreground" tickFormatter={(v: string) => `${new Date(v).getDate()}/${new Date(v).getMonth()+1}`} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9 }} className="fill-muted-foreground" allowDecimals={false} />
              <Area type="monotone" dataKey="count" stroke="hsl(var(--foreground))" fill="url(#sg)" strokeWidth={1.5} />
              <ChartTooltip content={<ChartTooltipContent />} />
            </AreaChart>
          </ChartContainer>
        </section>

        {/* Top Profiles */}
        <section>
          <h2 className="text-sm font-semibold mb-3">Top profiles</h2>
          <ChartContainer config={viewsConfig} className="h-[200px] w-full">
            <BarChart data={topProfiles} layout="vertical">
              <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 9 }} className="fill-muted-foreground" />
              <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 9 }} className="fill-muted-foreground" width={80} tickFormatter={(v: string) => v.length > 12 ? v.slice(0,12)+'…' : v} />
              <Bar dataKey="views" fill="hsl(var(--foreground))" radius={[0,2,2,0]} opacity={0.7} />
              <ChartTooltip content={<ChartTooltipContent />} />
            </BarChart>
          </ChartContainer>
        </section>

        {/* CV Parses Chart */}
        <section>
          <h2 className="text-sm font-semibold mb-3">CV Parses</h2>
          <ChartContainer config={chartConfig} className="h-[140px] w-full">
            <BarChart data={parseTrend}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 9 }} className="fill-muted-foreground" tickFormatter={(v: string) => `${new Date(v).getDate()}/${new Date(v).getMonth()+1}`} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9 }} className="fill-muted-foreground" allowDecimals={false} />
              <Bar dataKey="count" fill="hsl(var(--foreground))" radius={[2,2,0,0]} opacity={0.7} />
              <ChartTooltip content={<ChartTooltipContent />} />
            </BarChart>
          </ChartContainer>
        </section>

        {/* Auth Providers */}
        {authProviders.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold mb-2">Auth providers</h2>
            <div className="flex gap-6 text-sm">
              {authProviders.map(p => (
                <div key={p.provider}><span className="font-bold">{p.count}</span> <span className="text-muted-foreground">{p.provider}</span></div>
              ))}
            </div>
          </section>
        )}

        <hr className="border-border" />

        {/* Recent Signups */}
        <section>
          <h2 className="text-sm font-semibold mb-3">Recent signups</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Name</th>
                  <th className="pb-2 pr-4 font-medium">Slug</th>
                  <th className="pb-2 pr-4 font-medium text-right">Views</th>
                  <th className="pb-2 pr-4 font-medium text-center">Photo</th>
                  <th className="pb-2 pr-4 font-medium text-center">CV</th>
                  <th className="pb-2 font-medium text-right">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 pr-4">
                      <p className="font-medium">{u.name || '—'}</p>
                      <p className="text-muted-foreground text-[10px]">{u.email}</p>
                    </td>
                    <td className="py-2 pr-4">
                      {u.slug ? <a href={`https://cvin.bio/${u.slug}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">/{u.slug}</a> : '—'}
                    </td>
                    <td className="py-2 pr-4 text-right font-mono">{u.views}</td>
                    <td className="py-2 pr-4 text-center">{u.hasPhoto ? '✓' : '—'}</td>
                    <td className="py-2 pr-4 text-center">{u.hasResume ? '✓' : '—'}</td>
                    <td className="py-2 text-right text-muted-foreground">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <hr className="border-border" />

        {/* Timeline */}
        <section>
          <h2 className="text-sm font-semibold mb-3">Changelog</h2>
          <div className="space-y-3">
            {productTimeline.map((e, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-[10px] text-muted-foreground w-[50px] shrink-0 pt-0.5">{new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                <div>
                  <p className="text-xs font-medium">{e.title}</p>
                  <p className="text-[10px] text-muted-foreground">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className="text-[10px] text-muted-foreground/30 pt-4 pb-6">admin-only · not indexed</p>
      </main>
    </div>
  );
}
