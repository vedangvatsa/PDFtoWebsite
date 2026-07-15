/**
 * Second pass: incomplete profiles whose email is only in auth.users
 * (not on profile links), excluding already-sent list from pass 1.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { buildProfileReminderEmail } from '../../src/lib/profile-reminder-email.ts';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
const cfToken = process.env.CLOUDFLARE_API_TOKEN!;

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!accountId || !cfToken) {
  console.error('Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const alreadyPath =
    '.github/scripts/already-sent-profile-reminder.json';
  const already: string[] = existsSync(alreadyPath)
    ? JSON.parse(readFileSync(alreadyPath, 'utf8'))
    : [];
  const alreadySet = new Set(already.map((e) => e.toLowerCase()));

  console.log('Already sent (pass 1):', alreadySet.size);

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(
      'id, username, full_name, links, profile_picture_url, about, skills, experience, education, created_at'
    );
  if (error) throw error;

  // auth users
  const allUsers: any[] = [];
  for (let page = 1; page <= 50; page++) {
    const { data, error: ae } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (ae) throw ae;
    allUsers.push(...(data?.users || []));
    if (!data?.users?.length || data.users.length < 1000) break;
  }
  console.log('Auth users:', allUsers.length);
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
    if (alreadySet.has(email)) continue;
    if (seen.has(email)) continue;
    seen.add(email);

    // prefer not re-sending if profile link email was already used under different casing
    const firstName =
      (p.full_name || u?.user_metadata?.full_name || '')
        .trim()
        .split(/\s+/)[0] || 'there';

    audience.push({
      id: p.id,
      email,
      firstName,
      username: p.username,
      score: a.score,
      missing: a.missing,
    });
  }

  console.log('Pass-2 audience:', audience.length);

  const campaign = 'profile-reminder-2026-07-15-pass2';
  const results: any[] = [];
  const DELAY_MS = 400;

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
      if ((i + 1) % 10 === 0 || !ok) {
        console.log(
          `[${i + 1}/${audience.length}] ${ok ? 'OK' : 'FAIL'} ${r.email}`,
          ok ? '' : JSON.stringify(data.errors)
        );
      }
      if (!ok) {
        const msg = String(data.errors?.[0]?.message || '');
        if (/throttl|rate/i.test(msg)) {
          await sleep(30000);
          i--;
          continue;
        }
        if (/daily|limit|quota|disabled/i.test(msg)) {
          console.log('Stopping:', msg);
          break;
        }
      }
    } catch (err: any) {
      results.push({
        email: r.email,
        username: r.username,
        ok: false,
        error: String(err),
      });
      console.log(`[${i + 1}] ERR`, err?.message || err);
    }
    await sleep(DELAY_MS);
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
  writeFileSync('profile-reminder-pass2-results.json', JSON.stringify(out, null, 2));
  console.log(JSON.stringify({ campaign, audience: audience.length, sent, failed }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
