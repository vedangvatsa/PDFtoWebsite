import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';

// Only these emails can access the admin dashboard
const ADMIN_EMAILS = ['vatsvedang@gmail.com'];

export async function GET() {
  try {
    // 1. Auth check — must be logged in as admin
    const supabaseUser = await createClient();
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();

    if (authError || !user || !ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 2. Use service role for full DB access
    const supabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ── Parallel queries for speed ──
    const [
      profilesRes,
      authUsersRes,
      parseLogsRes,
    ] = await Promise.all([
      supabase.from('profiles').select('id, full_name, username, profile_picture_url, views, skills, experience, education, custom_sections, links, created_at, updated_at'),
      supabase.auth.admin.listUsers({ perPage: 1000 }),
      supabase.from('parse_logs').select('id, user_id, ip, created_at').order('created_at', { ascending: false }).limit(500),
    ]);

    const profiles = profilesRes.data || [];
    const authUsers = authUsersRes.data?.users || [];
    const parseLogs = parseLogsRes.data || [];

    // ── KPIs ──
    const totalUsers = profiles.length;
    const totalViews = profiles.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalParses = parseLogs.length;
    const usersWithPhoto = profiles.filter(p => p.profile_picture_url && p.profile_picture_url.trim() !== '').length;
    const usersWithExperience = profiles.filter(p => Array.isArray(p.experience) && p.experience.length > 0).length;
    const usersWithEducation = profiles.filter(p => Array.isArray(p.education) && p.education.length > 0).length;
    const usersWithSkills = profiles.filter(p => Array.isArray(p.skills) && p.skills.length > 0).length;
    const usersWithCustomSections = profiles.filter(p => Array.isArray(p.custom_sections) && p.custom_sections.length > 0).length;
    const usersWithLinks = profiles.filter(p => Array.isArray(p.links) && p.links.length > 0).length;
    const avgViews = totalUsers > 0 ? Math.round(totalViews / totalUsers) : 0;

    // ── Signup trend (last 30 days) ──
    const signupsByDay: Record<string, number> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      signupsByDay[key] = 0;
    }
    for (const u of authUsers) {
      const day = new Date(u.created_at).toISOString().split('T')[0];
      if (day in signupsByDay) signupsByDay[day]++;
    }
    const signupTrend = Object.entries(signupsByDay).map(([date, count]) => ({ date, count }));

    // ── Views distribution (top 15 profiles) ──
    const topProfiles = [...profiles]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 15)
      .map(p => ({ name: p.full_name || p.username || 'Unknown', slug: p.username, views: p.views || 0 }));

    // ── Parse trend (last 14 days) ──
    const parsesByDay: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      parsesByDay[key] = 0;
    }
    for (const log of parseLogs) {
      const day = new Date(log.created_at).toISOString().split('T')[0];
      if (day in parsesByDay) parsesByDay[day]++;
    }
    const parseTrend = Object.entries(parsesByDay).map(([date, count]) => ({ date, count }));

    // ── Profile completeness breakdown ──
    const completeness = {
      hasPhoto: usersWithPhoto,
      noPhoto: totalUsers - usersWithPhoto,
      hasExperience: usersWithExperience,
      noExperience: totalUsers - usersWithExperience,
      hasEducation: usersWithEducation,
      noEducation: totalUsers - usersWithEducation,
      hasSkills: usersWithSkills,
      noSkills: totalUsers - usersWithSkills,
      hasCustomSections: usersWithCustomSections,
      hasLinks: usersWithLinks,
    };

    // ── Auth providers breakdown ──
    const providerCounts: Record<string, number> = {};
    for (const u of authUsers) {
      const provider = u.app_metadata?.provider || 'unknown';
      providerCounts[provider] = (providerCounts[provider] || 0) + 1;
    }
    const authProviders = Object.entries(providerCounts).map(([provider, count]) => ({ provider, count }));

    // ── Recent signups (last 10) ──
    const recentUsers = [...authUsers]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(u => {
        const profile = profiles.find(p => p.id === u.id);
        return {
          email: u.email || '',
          name: profile?.full_name || u.user_metadata?.full_name || '',
          slug: profile?.username || '',
          views: profile?.views || 0,
          provider: u.app_metadata?.provider || 'unknown',
          createdAt: u.created_at,
          hasPhoto: !!(profile?.profile_picture_url && profile.profile_picture_url.trim()),
          hasResume: Array.isArray(profile?.experience) && profile.experience.length > 0,
        };
      });

    return NextResponse.json({
      kpis: {
        totalUsers,
        totalViews,
        totalParses,
        avgViews,
        usersWithPhoto,
        usersWithExperience,
        usersWithEducation,
        usersWithSkills,
      },
      signupTrend,
      topProfiles,
      parseTrend,
      completeness,
      authProviders,
      recentUsers,
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
