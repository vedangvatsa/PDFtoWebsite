/**
 * Pass 2 — pure Node, no tsx. Uses GH secrets for Supabase service role + Cloudflare.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const cfToken = process.env.CLOUDFLARE_API_TOKEN;
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cvin.bio').replace(/\/$/, '');

console.log('start', new Date().toISOString());
console.log({
  url: url ? new URL(url).host : null,
  serviceKeyLen: serviceKey?.length || 0,
  accountIdLen: accountId?.length || 0,
  cfTokenLen: cfToken?.length || 0,
});

if (!url || !serviceKey || !accountId || !cfToken) {
  console.error('Missing required env');
  process.exit(1);
}

const TELEGRAM_LABEL = 'Jobs feed on Telegram · 5,000+ subscribers';
const TELEGRAM_URL = 'https://t.me/techjobsdaily';
const campaign = 'profile-reminder-2026-07-15-pass2';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function analyze(p) {
  const hasPhoto = !!(
    p.profile_picture_url &&
    String(p.profile_picture_url).trim() &&
    !String(p.profile_picture_url).includes('picsum.photos')
  );
  const hasSummary = !!(p.about && String(p.about).trim());
  const links = Array.isArray(p.links) ? p.links : [];
  const hasLocation = links.some(
    (l) => l?.type === 'location' && String(l?.value || '').trim()
  );
  const exp = Array.isArray(p.experience) ? p.experience : [];
  const edu = Array.isArray(p.education) ? p.education : [];
  const skills = Array.isArray(p.skills) ? p.skills : [];
  const hasWork = exp.some((w) =>
    (w?.title || w?.company || w?.description || '').toString().trim()
  );
  const hasEdu = edu.some((ed) =>
    (ed?.institution || ed?.degree || '').toString().trim()
  );
  const hasSkill = skills.some((s) => {
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

const LABELS = {
  hasPhoto: 'Profile photo',
  hasSummary: 'Short summary',
  hasLocation: 'Location',
  hasWork: 'Work experience',
  hasEdu: 'Education',
  hasSkill: 'At least one skill',
};

function missingProse(missing) {
  const labels = missing.map((m) => LABELS[m] || m);
  if (labels.length === 1) {
    const raw = labels[0];
    const line =
      raw === 'Profile photo'
        ? 'a profile photo'
        : raw === 'Short summary'
          ? 'a short summary'
          : raw === 'Location'
            ? 'your location'
            : raw === 'Work experience'
              ? 'work experience'
              : raw === 'Education'
                ? 'education'
                : raw === 'At least one skill'
                  ? 'at least one skill'
                  : raw.toLowerCase();
    return { single: true, line, labels };
  }
  return { single: false, line: '', labels };
}

function buildEmail({ firstName, score, username, missing, email }) {
  const m = missingProse(missing);
  const subject =
    missing.length === 1
      ? 'One thing left on your CVin.Bio profile'
      : score <= 33
        ? 'Finish setting up your CVin.Bio profile'
        : `Your profile is ${score}% complete`;

  const utm = (path, content) => {
    const u = new URL(path.startsWith('http') ? path : `${siteUrl}${path}`);
    u.searchParams.set('utm_source', 'email');
    u.searchParams.set('utm_medium', 'email');
    u.searchParams.set('utm_campaign', campaign);
    u.searchParams.set('utm_content', content);
    return u.toString();
  };
  const track = (finalUrl) => {
    const t = new URL(`${siteUrl}/api/email-track`);
    t.searchParams.set('action', 'click');
    t.searchParams.set('cid', campaign);
    t.searchParams.set('email', email);
    t.searchParams.set('url', finalUrl);
    return t.toString();
  };

  const editorDest = utm('/editor', 'editor');
  const editorUrl = track(editorDest);
  const telegramUrl = track(TELEGRAM_URL);
  const openPixel = `${siteUrl}/api/email-track?action=open&cid=${encodeURIComponent(campaign)}&email=${encodeURIComponent(email)}`;

  const whatsLeftText = m.single
    ? `Your profile is ${score}% complete. What's left: ${m.line}.`
    : `Your profile is ${score}% complete. What's left:\n${m.labels.map((l) => `- ${l}`).join('\n')}`;

  const whatsLeftHtml = m.single
    ? `<p style="margin:0;font-size:14px;line-height:1.55;color:#3F3F46;">What's left: <span style="font-weight:600;color:#09090B;">${escapeHtml(m.line)}</span></p>`
    : `<p style="margin:0 0 8px 0;font-size:14px;line-height:1.55;color:#3F3F46;">What's left:</p>${m.labels
        .map(
          (l) =>
            `<p style="margin:0 0 6px 0;font-size:14px;line-height:1.5;color:#3F3F46;">• ${escapeHtml(l)}</p>`
        )
        .join('')}`;

  const text = `Hi ${firstName},

CVin.Bio turns your CV into a live website of your profile. Recruiters open one link instead of a PDF or Word file.

${whatsLeftText}

Finish here: ${editorDest}

${TELEGRAM_LABEL}:
${TELEGRAM_URL}

— CVin.Bio

You have a CVin.Bio account. Reply to stop these emails.`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;width:100%;background:#FAFAFA;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;">
<tr><td align="center" style="padding:32px 12px 48px;">
<table role="presentation" width="100%" style="max-width:560px;background:#FFFFFF;border:1px solid #E4E4E7;">
<tr><td style="padding:32px 24px 40px;word-break:break-word;">
<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#3F3F46;">Hi ${escapeHtml(firstName)},</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:#3F3F46;">CVin.Bio turns your CV into a live website of your profile. Recruiters open one link instead of a PDF or Word file.</p>
<table role="presentation" width="100%" style="margin:0 0 24px;border:1px solid #E4E4E7;"><tr><td style="padding:16px;">
<p style="margin:0 0 6px;font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#71717A;">Profile score</p>
<p style="margin:0 0 10px;font-size:28px;font-weight:800;letter-spacing:-0.05em;line-height:1.15;color:#09090B;">${score}%</p>
${whatsLeftHtml}
</td></tr></table>
<table role="presentation" width="100%" style="margin:0 0 12px;"><tr>
<td align="center" style="background:#18181B;border-radius:8px;">
<a href="${editorUrl}" style="display:block;width:100%;box-sizing:border-box;padding:14px 16px;font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;text-align:center;white-space:normal;word-break:break-word;">Finish profile</a>
</td></tr></table>
<table role="presentation" width="100%" style="margin:0 0 28px;"><tr>
<td align="center" style="background:#FFFFFF;border:1px solid #18181B;border-radius:8px;">
<a href="${telegramUrl}" style="display:block;width:100%;box-sizing:border-box;padding:13px 16px;font-size:13px;font-weight:600;color:#18181B;text-decoration:none;text-align:center;white-space:normal;word-break:break-word;">${escapeHtml(TELEGRAM_LABEL)}</a>
</td></tr></table>
<p style="margin:0 0 20px;font-size:14px;font-weight:600;color:#09090B;">— CVin.Bio</p>
<table role="presentation" width="100%" style="border-top:1px solid #E4E4E7;"><tr>
<td style="padding:16px 0 8px;font-size:12px;line-height:1.55;color:#A1A1AA;">You have a CVin.Bio account. Reply to stop these emails.</td>
</tr></table>
<img src="${openPixel}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;"/>
</td></tr></table>
</td></tr></table>
</body></html>`;

  return { subject, text, html };
}

async function main() {
  console.log('start', new Date().toISOString());
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const alreadyPath = '.github/scripts/already-sent-profile-reminder.json';
  const already = existsSync(alreadyPath)
    ? JSON.parse(readFileSync(alreadyPath, 'utf8'))
    : [];
  const alreadySet = new Set(already.map((e) => String(e).toLowerCase()));
  console.log('already sent', alreadySet.size);

  console.log('profiles...');
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(
      'id, username, full_name, links, profile_picture_url, about, skills, experience, education, created_at'
    );
  if (error) {
    console.error('profiles error', error);
    process.exit(1);
  }
  console.log('profiles', profiles?.length || 0);

  console.log('auth users...');
  const allUsers = [];
  for (let page = 1; page <= 50; page++) {
    const { data, error: ae } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (ae) {
      console.error('listUsers', page, ae);
      process.exit(1);
    }
    const batch = data?.users || [];
    allUsers.push(...batch);
    console.log('page', page, batch.length, 'total', allUsers.length);
    if (batch.length < 200) break;
  }
  const byId = Object.fromEntries(allUsers.map((u) => [u.id, u]));

  const seen = new Set();
  const audience = [];
  for (const p of profiles || []) {
    const a = analyze(p);
    if (a.complete) continue;
    if (
      p.created_at &&
      Date.now() - new Date(p.created_at).getTime() < 86400000
    )
      continue;
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
  console.log('audience', audience.length);

  const results = [];
  for (let i = 0; i < audience.length; i++) {
    const r = audience[i];
    const built = buildEmail(r);
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
            from: { address: 'news@cvin.bio', name: 'CVin.Bio' },
            to: r.email,
            reply_to: 'hi@cvin.bio',
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
    } catch (err) {
      results.push({ email: r.email, ok: false, error: String(err) });
      console.log(`[${i + 1}] ERR`, err);
    }
    await sleep(300);
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
