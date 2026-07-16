/**
 * Send remaining profile reminders via Cloudflare.
 * - Reads /tmp/remaining-audience/remaining-audience.json
 * - Hard-excludes already-sent-profile-reminder.json + prior results
 * - Resumes if profile-reminder-pass2-results.json has successes
 * - Exponential backoff on throttle (CF daily/rate limits)
 *
 * Usage (from repo root):
 *   node .github/scripts/send-remaining-pass2-local.mjs
 */
import { readFileSync, writeFileSync, existsSync, writeSync } from 'fs';

// Always flush so nohup/file redirect shows live progress
function log(...args) {
  writeSync(1, args.map(String).join(' ') + '\n');
}

function loadEnvLocal() {
  if (!existsSync('.env.local')) return;
  const envText = readFileSync('.env.local', 'utf8');
  for (const line of envText.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[m[1]]) process.env[m[1]] = v;
  }
}

loadEnvLocal();

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const cfToken = process.env.CLOUDFLARE_API_TOKEN || '';
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cvin.bio').replace(
  /\/$/,
  ''
);
const campaign = 'profile-reminder-2026-07-15-pass2';
const alreadyPath = '.github/scripts/already-sent-profile-reminder.json';
const resultsPath = 'profile-reminder-pass2-results.json';
const remainingPath =
  process.env.REMAINING_AUDIENCE_PATH ||
  '/tmp/remaining-audience/remaining-audience.json';

const TELEGRAM_LABEL = 'Jobs feed on Telegram · 5,000+ subscribers';
const TELEGRAM_URL = 'https://t.me/techjobsdaily';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!accountId || !cfToken) {
  log('Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN');
  process.exit(1);
}
if (!existsSync(remainingPath)) {
  log('Missing remaining audience:', remainingPath);
  process.exit(1);
}

const alreadySet = new Set();
function addEmails(list) {
  for (const e of list) {
    if (e) alreadySet.add(String(e).toLowerCase().trim());
  }
}

if (existsSync(alreadyPath)) {
  addEmails(JSON.parse(readFileSync(alreadyPath, 'utf8')));
}
for (const p of [
  '/tmp/profile_reminder_results.json',
  resultsPath,
]) {
  if (!existsSync(p)) continue;
  try {
    const data = JSON.parse(readFileSync(p, 'utf8'));
    const list = Array.isArray(data) ? data : data.results || [];
    for (const r of list) {
      if (r?.email && r.ok === true) alreadySet.add(String(r.email).toLowerCase().trim());
      if (typeof r === 'string' && r.includes('@')) alreadySet.add(r.toLowerCase().trim());
    }
  } catch {
    /* ignore */
  }
}

const remaining = JSON.parse(readFileSync(remainingPath, 'utf8'));
const audience = [];
const seen = new Set();
for (const r of remaining) {
  const email = String(r.email || '')
    .toLowerCase()
    .trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) continue;
  if (alreadySet.has(email) || seen.has(email)) continue;
  seen.add(email);
  audience.push({
    email,
    firstName: r.firstName || 'there',
    username: r.username || '',
    score: Number(r.score) || 0,
    missing: Array.isArray(r.missing) ? r.missing : [],
  });
}

log(
  JSON.stringify(
    {
      campaign,
      alreadyBlocked: alreadySet.size,
      remainingFile: remaining.length,
      willSend: audience.length,
    },
    null,
    2
  )
);

if (audience.length === 0) {
  log('Nothing left to send (all excluded or already sent).');
  process.exit(0);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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

function buildEmail({ firstName, score, missing, email }) {
  const m = missingProse(missing);
  const showScore = score > 0;
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
    ? showScore
      ? `Your profile is ${score}% complete. What's left: ${m.line}.`
      : `What's left: ${m.line}.`
    : showScore
      ? `Your profile is ${score}% complete. What's left:\n${m.labels.map((l) => `- ${l}`).join('\n')}`
      : `What's left:\n${m.labels.map((l) => `- ${l}`).join('\n')}`;

  const whatsLeftHtml = m.single
    ? `<p style="margin:0;font-size:14px;line-height:1.55;color:#3F3F46;">What's left: <span style="font-weight:600;color:#09090B;">${escapeHtml(m.line)}</span></p>`
    : `<p style="margin:0 0 8px 0;font-size:14px;line-height:1.55;color:#3F3F46;">What's left:</p>${m.labels
        .map(
          (l) =>
            `<p style="margin:0 0 6px 0;font-size:14px;line-height:1.5;color:#3F3F46;">• ${escapeHtml(l)}</p>`
        )
        .join('')}`;

  const scoreBoxHtml = showScore
    ? `<table role="presentation" width="100%" style="margin:0 0 24px;border:1px solid #E4E4E7;"><tr><td style="padding:16px;">
<p style="margin:0 0 6px;font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#71717A;">Profile score</p>
<p style="margin:0 0 10px;font-size:28px;font-weight:800;letter-spacing:-0.05em;line-height:1.15;color:#09090B;">${score}%</p>
${whatsLeftHtml}
</td></tr></table>`
    : `<table role="presentation" width="100%" style="margin:0 0 24px;border:1px solid #E4E4E7;"><tr><td style="padding:16px;">
${whatsLeftHtml}
</td></tr></table>`;

  const text = `Hi ${firstName},

You created a CVin.Bio account, but your profile is still incomplete. CVin.Bio turns your CV into a live website of your profile. Recruiters open one link instead of a PDF or Word file.

${whatsLeftText}

Finish here: ${editorDest}

${TELEGRAM_LABEL}:
${TELEGRAM_URL}

— CVin.Bio

You have a CVin.Bio account. Reply to stop these emails.`;

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;width:100%;background:#FAFAFA;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;"><tr><td align="center" style="padding:32px 12px 48px;">
<table role="presentation" width="100%" style="max-width:560px;background:#FFFFFF;border:1px solid #E4E4E7;"><tr><td style="padding:32px 24px 40px;word-break:break-word;">
<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#3F3F46;">Hi ${escapeHtml(firstName)},</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:#3F3F46;">You created a CVin.Bio account, but your profile is still incomplete. CVin.Bio turns your CV into a live website of your profile. Recruiters open one link instead of a PDF or Word file.</p>
${scoreBoxHtml}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 12px 0;width:100%;"><tr><td align="center" style="background-color:#18181B;border-radius:8px;width:100%;">
<a href="${editorUrl}" style="display:block;width:100%;max-width:100%;box-sizing:border-box;padding:14px 16px;font-size:14px;font-weight:600;line-height:1.45;color:#FFFFFF;text-decoration:none;text-align:center;white-space:normal;word-break:break-word;">Finish profile</a>
</td></tr></table>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 28px 0;width:100%;"><tr><td align="center" style="background-color:#FFFFFF;border:1px solid #18181B;border-radius:8px;width:100%;">
<a href="${telegramUrl}" style="display:block;width:100%;max-width:100%;box-sizing:border-box;padding:14px 16px;font-size:13px;font-weight:600;line-height:1.45;color:#18181B;text-decoration:none;text-align:center;white-space:normal;word-break:break-word;">${escapeHtml(TELEGRAM_LABEL)}</a>
</td></tr></table>
<p style="margin:0 0 20px;font-size:14px;font-weight:600;color:#09090B;">— CVin.Bio</p>
<table role="presentation" width="100%" style="border-top:1px solid #E4E4E7;"><tr>
<td style="padding:16px 0 8px;font-size:12px;line-height:1.55;color:#A1A1AA;">You have a CVin.Bio account. Reply to stop these emails.</td>
</tr></table>
<img src="${openPixel}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;"/>
</td></tr></table></td></tr></table></body></html>`;

  return { subject, text, html };
}

function persist(results) {
  const sent = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  writeFileSync(
    resultsPath,
    JSON.stringify(
      {
        campaign,
        willSend: audience.length,
        sent,
        failed,
        attempted: results.length,
        results,
      },
      null,
      2
    )
  );
  writeFileSync(alreadyPath, JSON.stringify([...alreadySet], null, 2));
}

const results = [];
let throttleMs = 60_000;
const maxThrottleMs = 15 * 60_000;
let consecutiveThrottle = 0;

for (let i = 0; i < audience.length; i++) {
  const r = audience[i];
  if (alreadySet.has(r.email)) {
    log(`[${i + 1}/${audience.length}] SKIP already-sent ${r.email}`);
    continue;
  }
  const built = buildEmail(r);

  let attempt = 0;
  while (true) {
    attempt++;
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
      if (ok) {
        results.push({
          email: r.email,
          username: r.username,
          score: r.score,
          ok: true,
          messageId: data.result?.message_id,
        });
        alreadySet.add(r.email);
        consecutiveThrottle = 0;
        throttleMs = 60_000;
        log(
          `[${i + 1}/${audience.length}] OK ${r.email} ${data.result?.message_id || ''}`
        );
        persist(results);
        break;
      }

      const msg = String(data.errors?.[0]?.message || '');
      if (/throttl|rate|429/i.test(msg) || res.status === 429) {
        consecutiveThrottle++;
        log(
          `[${i + 1}/${audience.length}] THROTTLED ${r.email} wait ${Math.round(throttleMs / 1000)}s (x${consecutiveThrottle})`
        );
        if (consecutiveThrottle >= 12) {
          log(
            'Still throttled after many waits — likely daily quota. Saving progress and exiting.'
          );
          results.push({
            email: r.email,
            ok: false,
            errors: data.errors,
            deferred: true,
          });
          persist(results);
          log(
            JSON.stringify(
              {
                campaign,
                sent: results.filter((x) => x.ok).length,
                remaining: audience.length - results.filter((x) => x.ok).length,
                note: 'Resume later with same script',
              },
              null,
              2
            )
          );
          process.exit(2);
        }
        await sleep(throttleMs);
        throttleMs = Math.min(maxThrottleMs, Math.floor(throttleMs * 1.5));
        continue;
      }

      results.push({
        email: r.email,
        username: r.username,
        score: r.score,
        ok: false,
        errors: data.errors,
      });
      log(
        `[${i + 1}/${audience.length}] FAIL ${r.email}`,
        JSON.stringify(data.errors)
      );
      persist(results);
      break;
    } catch (err) {
      log(`[${i + 1}] ERR attempt ${attempt}`, err);
      if (attempt >= 3) {
        results.push({ email: r.email, ok: false, error: String(err) });
        persist(results);
        break;
      }
      await sleep(5000);
    }
  }

  await sleep(800); // pace between successful sends
}

const sent = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok).length;
persist(results);
log(JSON.stringify({ campaign, willSend: audience.length, sent, failed }, null, 2));
