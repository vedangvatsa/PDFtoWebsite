/**
 * Pass 2: incomplete profiles with auth email, skip already-sent.
 * Uses GitHub secrets; plain fetch for reliability in CI.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { buildProfileReminderEmail } from '../../src/lib/profile-reminder-email';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing env: ${name}`);
    process.exit(1);
  }
  return v;
}

function analyze(p: any) {
  const hasPhoto = !!(
    p.profile_picture_url &&
    String(p.profile_picture_url).trim() &&
    !String(p.profile_picture_url).includes('picsum.photos')
  );
  const hasSummary = !!(p.about && String(p.about).trim());
  const links = Array.isArray(p.links) ? p.links : [];
  const hasLocation = links.some(
    (l: any) => l?.type === 'location' && String(l?.value || '').trim()
  );
  const exp = Array.isArray(p.experience) ? p.experience : [];
  const edu = Array.isArray(p.education) ? p.education : [];
  const skills = Array.isArray(p.skills) ? p.skills : [];
  const hasWork = exp.some((w: any) =>
    (w?.title || w?.company || w?.description || '').toString().trim()
  );
  const hasEdu = edu.some((ed: any) =>
    (ed?.institution || ed?.degree || '').toString().trim()
  );
  const hasSkill = skills.some((s: any) => {
    const val = typeof s === 'string' ? s : s?.name || '';
    return String(val).trim().length > 0;
  });
  const checks = {
    hasPhoto,
    hasSummary,
    hasLocation,
    hasWork,
    hasEdu,
    hasSkill,
  };
  const missing = Object.entries(checks)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  return {
    complete: missing.length === 0,
    missing,
    score: Math.round(((6 - missing.length) / 6) * 100),
  };
}

async function main() {
  console.log('pass2 start', new Date().toISOString());

  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const accountId = requireEnv('CLOUDFLARE_ACCOUNT_ID');
  const cfToken = requireEnv('CLOUDFLARE_API_TOKEN');
  process.env.NEXT_PUBLIC_SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://cvin.bio';

  console.log('url host', new URL(url).host);
  console.log('serviceKey len', serviceKey.length);
  console.log('cf token len', cfToken.length);

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const alreadyPath = '.github/scripts/already-sent-profile-reminder.json';
  const already: string[] = existsSync(alreadyPath)
    ? JSON.parse(readFileSync(alreadyPath, 'utf8'))
    : [];
  const alreadySet = new Set(already.map((e) => e.toLowerCase()));
  console.log('already sent', alreadySet.size);

  console.log('fetching profiles...');
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(
      'id, username, full_name, links, profile_picture_url, about, skills, experience, education, created_at'
    );
  if (error) {
    console.error('profiles error', error);
    process.exit(1);
  }
  console.log('profiles', profiles?.length ?? 0);

  console.log('listing auth users...');
  const allUsers: any[] = [];
  for (let page = 1; page <= 50; page++) {
    const { data, error: ae } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (ae) {
      console.error('listUsers error page', page, ae);
      process.exit(1);
    }
    const batch = data?.users || [];
    allUsers.push(...batch);
    console.log('auth page', page, 'got', batch.length, 'total', allUsers.length);
    if (batch.length < 200) break;
  }
  const byId = Object.fromEntries(allUsers.map((u) => [u.id, u]));

  const seen = new Set<string>();
  const audience: any[] = [];
  for (const p of profiles || []) {
    const a = analyze(p);
    if (a.complete) continue;
    if (
      p.created_at &&
      Date.now() - new Date(p.created_at).getTime() < 86400000
    ) {
      continue;
    }
    if (!p.username || /^user\d+$/i.test(String(p.username))) continue;
    const u = byId[p.id];
    const email = (u?.email || '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) continue;
    if (alreadySet.has(email) || seen.has(email)) continue;
    seen.add(email);
    const firstName =
      (p.full_name || u?.user_metadata?.full_name || '')
        .trim()
        .split(/\s+/)[0] || 'there';
    audience.push({
      email,
      firstName,
      username: p.username,
      score: a.score,
      missing: a.missing,
    });
  }

  console.log('pass2 audience', audience.length);

  const campaign = 'profile-reminder-2026-07-15-pass2';
  const results: any[] = [];

  for (let i = 0; i < audience.length; i++) {
    const r = audience[i];
    const built = buildProfileReminderEmail({
      firstName: r.firstName,
      score: r.score,
      username: r.username,
      missing: r.missing,
      email: r.email,
      campaignId: campaign,
    });

    try {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/email/sending/send`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${cfToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: built.from,
            to: r.email,
            reply_to: built.replyTo,
            subject: built.subject,
            text: built.text,
            html: built.html,
            headers: {
              'X-Email-Purpose': 'profile-reminder',
              'X-Campaign-ID': campaign,
            },
          }),
        }
      );
      const data = await res.json();
      const ok = !!data.success;
      results.push({
        email: r.email,
        username: r.username,
        score: r.score,
        ok,
        messageId: data.result?.message_id,
        errors: data.errors,
      });
      console.log(
        `[${i + 1}/${audience.length}] ${ok ? 'OK' : 'FAIL'} ${r.email}`,
        ok ? '' : JSON.stringify(data.errors)
      );
      if (!ok) {
        const msg = String(data.errors?.[0]?.message || '');
        if (/throttl|rate/i.test(msg)) {
          await sleep(30000);
          i--;
          continue;
        }
        if (/daily|limit|quota|disabled/i.test(msg)) break;
      }
    } catch (err: any) {
      results.push({
        email: r.email,
        ok: false,
        error: String(err?.message || err),
      });
      console.log(`[${i + 1}] ERR`, err?.message || err);
    }
    await sleep(400);
  }

  const sent = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  const out = {
    campaign,
    audience: audience.length,
    sent,
    failed,
    attempted: results.length,
    results,
  };
  writeFileSync(
    'profile-reminder-pass2-results.json',
    JSON.stringify(out, null, 2)
  );
  console.log(JSON.stringify({ campaign, audience: audience.length, sent, failed }, null, 2));
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
