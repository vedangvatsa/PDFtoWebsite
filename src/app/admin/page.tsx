'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/auth';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Area, AreaChart, Cell, Pie, PieChart } from 'recharts';
import { Loader2, Users, Eye, FileUp, TrendingUp, Camera, Briefcase, GraduationCap, Sparkles, Shield } from 'lucide-react';

const ADMIN_EMAILS = ['vatsvedang@gmail.com'];

type Analytics = {
  kpis: {
    totalUsers: number;
    totalViews: number;
    totalParses: number;
    avgViews: number;
    usersWithPhoto: number;
    usersWithExperience: number;
    usersWithEducation: number;
    usersWithSkills: number;
  };
  signupTrend: { date: string; count: number }[];
  topProfiles: { name: string; slug: string; views: number }[];
  parseTrend: { date: string; count: number }[];
  completeness: {
    hasPhoto: number; noPhoto: number;
    hasExperience: number; noExperience: number;
    hasEducation: number; noEducation: number;
    hasSkills: number; noSkills: number;
    hasCustomSections: number;
    hasLinks: number;
  };
  authProviders: { provider: string; count: number }[];
  recentUsers: {
    email: string; name: string; slug: string; views: number;
    provider: string; createdAt: string; hasPhoto: boolean; hasResume: boolean;
  }[];
};

const signupConfig = { count: { label: 'Signups', color: 'hsl(250, 85%, 65%)' } } satisfies ChartConfig;
const viewsConfig = { views: { label: 'Views', color: 'hsl(172, 66%, 50%)' } } satisfies ChartConfig;
const parseConfig = { count: { label: 'Parses', color: 'hsl(38, 92%, 55%)' } } satisfies ChartConfig;
const pieConfig = {
  has: { label: 'Has', color: 'hsl(142, 71%, 45%)' },
  missing: { label: 'Missing', color: 'hsl(0, 0%, 30%)' },
} satisfies ChartConfig;
const providerConfig = { count: { label: 'Users', color: 'hsl(250, 85%, 65%)' } } satisfies ChartConfig;

const PIE_COLORS = ['hsl(142, 71%, 45%)', 'hsl(0, 0%, 25%)'];
const PROVIDER_COLORS = ['hsl(250, 85%, 65%)', 'hsl(172, 66%, 50%)', 'hsl(38, 92%, 55%)', 'hsl(350, 80%, 55%)', 'hsl(200, 70%, 50%)'];

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <Card className="bg-gradient-to-br from-background to-secondary/20 border-border/40 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
            <p className="text-3xl font-bold mt-1 tracking-tight" style={{ color }}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
            {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className="rounded-lg p-2 bg-secondary/50">
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CompletePie({ has, total, label }: { has: number; total: number; label: string }) {
  const pct = total > 0 ? Math.round((has / total) * 100) : 0;
  const data = [
    { name: 'Has', value: has },
    { name: 'Missing', value: total - has },
  ];
  return (
    <div className="flex flex-col items-center gap-1">
      <ChartContainer config={pieConfig} className="h-[100px] w-[100px]">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={28} outerRadius={42} paddingAngle={2} dataKey="value" strokeWidth={0}>
            {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
          </Pie>
        </PieChart>
      </ChartContainer>
      <p className="text-2xl font-bold text-foreground">{pct}%</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
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
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      router.replace('/');
      return;
    }

    fetch('/api/admin/analytics')
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, isUserLoading, router]);

  if (isUserLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive font-medium">{error || 'Failed to load analytics'}</p>
      </div>
    );
  }

  const { kpis, signupTrend, topProfiles, parseTrend, completeness, authProviders, recentUsers } = data;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">CVin.Bio platform analytics — real-time</p>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={Users} label="Total Users" value={kpis.totalUsers} color="hsl(250, 85%, 65%)" />
          <StatCard icon={Eye} label="Total Views" value={kpis.totalViews} sub={`${kpis.avgViews} avg / profile`} color="hsl(172, 66%, 50%)" />
          <StatCard icon={FileUp} label="CV Parses" value={kpis.totalParses} sub="Last 500 logged" color="hsl(38, 92%, 55%)" />
          <StatCard icon={TrendingUp} label="Profiles w/ Photo" value={kpis.usersWithPhoto} sub={`${kpis.totalUsers > 0 ? Math.round((kpis.usersWithPhoto / kpis.totalUsers) * 100) : 0}% of users`} color="hsl(350, 80%, 55%)" />
        </div>

        {/* ── Charts Row 1: Signups + Top Profiles ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Signup Trend */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-semibold">Signups — Last 30 Days</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <ChartContainer config={signupConfig} className="h-[220px] w-full">
                <AreaChart data={signupTrend}>
                  <defs>
                    <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(250, 85%, 65%)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(250, 85%, 65%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(0,0%,20%)" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 9 }}
                    tickFormatter={(v: string) => { const d = new Date(v); return `${d.getDate()}/${d.getMonth() + 1}`; }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9 }} allowDecimals={false} />
                  <Area type="monotone" dataKey="count" stroke="hsl(250, 85%, 65%)" fill="url(#signupGrad)" strokeWidth={2} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Top Profiles by Views */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-semibold">Top Profiles by Views</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <ChartContainer config={viewsConfig} className="h-[220px] w-full">
                <BarChart data={topProfiles} layout="vertical">
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(0,0%,20%)" />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 9 }} />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 9 }} width={90}
                    tickFormatter={(v: string) => v.length > 12 ? v.slice(0, 12) + '…' : v} />
                  <Bar dataKey="views" fill="hsl(172, 66%, 50%)" radius={[0, 4, 4, 0]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* ── Charts Row 2: CV Parses + Auth Providers ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* CV Parse Trend */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-semibold">CV Parses — Last 14 Days</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <ChartContainer config={parseConfig} className="h-[200px] w-full">
                <BarChart data={parseTrend}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(0,0%,20%)" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 9 }}
                    tickFormatter={(v: string) => { const d = new Date(v); return `${d.getDate()}/${d.getMonth() + 1}`; }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9 }} allowDecimals={false} />
                  <Bar dataKey="count" fill="hsl(38, 92%, 55%)" radius={[4, 4, 0, 0]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Auth Providers */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-semibold">Auth Providers</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <ChartContainer config={providerConfig} className="h-[200px] w-full">
                <BarChart data={authProviders}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(0,0%,20%)" />
                  <XAxis dataKey="provider" tickLine={false} axisLine={false} tick={{ fontSize: 10 }}
                    tickFormatter={(v: string) => v.charAt(0).toUpperCase() + v.slice(1)} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9 }} allowDecimals={false} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {authProviders.map((_, i) => <Cell key={i} fill={PROVIDER_COLORS[i % PROVIDER_COLORS.length]} />)}
                  </Bar>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* ── Profile Completeness Ring ── */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold">Profile Completeness</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              <CompletePie has={completeness.hasPhoto} total={kpis.totalUsers} label="Photo" />
              <CompletePie has={completeness.hasExperience} total={kpis.totalUsers} label="Experience" />
              <CompletePie has={completeness.hasEducation} total={kpis.totalUsers} label="Education" />
              <CompletePie has={completeness.hasSkills} total={kpis.totalUsers} label="Skills" />
              <CompletePie has={completeness.hasCustomSections} total={kpis.totalUsers} label="Custom Sections" />
              <CompletePie has={completeness.hasLinks} total={kpis.totalUsers} label="Links" />
            </div>
          </CardContent>
        </Card>

        {/* ── Recent Signups Table ── */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold">Recent Signups</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left px-5 py-2 text-muted-foreground font-medium uppercase tracking-wider">User</th>
                    <th className="text-left px-3 py-2 text-muted-foreground font-medium uppercase tracking-wider">Slug</th>
                    <th className="text-center px-3 py-2 text-muted-foreground font-medium uppercase tracking-wider">Views</th>
                    <th className="text-center px-3 py-2 text-muted-foreground font-medium uppercase tracking-wider">Provider</th>
                    <th className="text-center px-3 py-2 text-muted-foreground font-medium uppercase tracking-wider">Photo</th>
                    <th className="text-center px-3 py-2 text-muted-foreground font-medium uppercase tracking-wider">CV</th>
                    <th className="text-right px-5 py-2 text-muted-foreground font-medium uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((u, i) => (
                    <tr key={i} className="border-b border-border/20 hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-2.5">
                        <p className="font-medium text-foreground">{u.name || '—'}</p>
                        <p className="text-muted-foreground text-[10px]">{u.email}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        {u.slug ? (
                          <a href={`https://cvin.bio/${u.slug}`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">/{u.slug}</a>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="text-center px-3 py-2.5 font-mono text-foreground">{u.views}</td>
                      <td className="text-center px-3 py-2.5">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${u.provider === 'google' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                          {u.provider}
                        </span>
                      </td>
                      <td className="text-center px-3 py-2.5">
                        {u.hasPhoto ? <span className="text-green-400">✓</span> : <span className="text-muted-foreground/40">✗</span>}
                      </td>
                      <td className="text-center px-3 py-2.5">
                        {u.hasResume ? <span className="text-green-400">✓</span> : <span className="text-muted-foreground/40">✗</span>}
                      </td>
                      <td className="text-right px-5 py-2.5 text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] text-muted-foreground/40 pb-4">
          Admin-only · Data refreshed on page load
        </p>
      </main>
    </div>
  );
}
