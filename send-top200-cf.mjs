#!/usr/bin/env node
/**
 * Send the top-200 most-viewed cvin.bio profile campaign via Cloudflare Email Sending.
 *
 * Usage:
 *   node send-top200-cf.mjs              # dry-run only
 *   node send-top200-cf.mjs --send       # actually send
 *
 * Requirements:
 *   - .env.local with CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN
 *   - /tmp/top200-profiles.json (created by get-top-profiles.mjs)
 *   - top200-campaign-draft.json (edit for copy)
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const DRAFT_PATH = './top200-campaign-draft.json';
const PROFILES_PATH = '/tmp/top200-profiles.json';
const SENT_PATH = '/tmp/top200-cf-sent.json';
const SENT_LOG_PATH = '/tmp/top200-cf-results.json';

function loadEnvLocal() {
  const p = resolve(process.cwd(), '.env.local');
  if (!existsSync(p)) return {};
  const out = {};
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[m[1]] = v;
  }
  return out;
}

const env = loadEnvLocal();
const ACCOUNT_ID = env.CLOUDFLARE_ACCOUNT_ID;
const CF_TOKEN = env.CLOUDFLARE_API_TOKEN;

function need(name, val) {
  if (!val) { console.error(`Missing ${name} in .env.local`); process.exit(1); }
}

need('CLOUDFLARE_ACCOUNT_ID', ACCOUNT_ID);
need('CLOUDFLARE_API_TOKEN', CF_TOKEN);

async function cf(path, options = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${CF_TOKEN}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function render(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
}

async function main() {
  const SEND = process.argv.includes('--send');
  const draft = JSON.parse(readFileSync(DRAFT_PATH, 'utf8'));
  const profiles = JSON.parse(readFileSync(PROFILES_PATH, 'utf8')).filter(p => p.email);
  const targets = profiles.slice(0, 200);

  const sent = existsSync(SENT_PATH) ? JSON.parse(readFileSync(SENT_PATH, 'utf8')) : [];
  const sentSet = new Set(sent);
  const results = [];

  console.log(`Targets with email: ${targets.length}`);
  console.log(`Already sent (from ${SENT_PATH}): ${sentSet.size}`);
  console.log(`Mode: ${SEND ? 'SENDING' : 'DRY-RUN'}`);
  if (!SEND) console.log('Add --send to actually send.\n');

  let i = 0;
  for (const p of targets) {
    i++;
    if (sentSet.has(p.email)) {
      console.log(`[${i}/${targets.length}] SKIP already sent: ${p.email}`);
      continue;
    }

    const vars = {
      full_name: p.full_name || p.username,
      username: p.username,
      link: p.link,
      views: String(p.views),
    };

    const payload = {
      from: { address: draft.from_address, name: draft.from_name },
      to: p.email,
      subject: render(draft.subject, vars),
      text: render(draft.text, vars),
      html: render(draft.html, vars),
    };

    console.log(`[${i}/${targets.length}] ${SEND ? 'SEND' : 'DRY'}: ${p.email} (${p.views} views)`);
    if (!SEND) continue;

    const result = await cf(`/accounts/${ACCOUNT_ID}/email/sending/send`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (result.data?.success) {
      sent.push(p.email);
      sentSet.add(p.email);
      writeFileSync(SENT_PATH, JSON.stringify(sent, null, 2));
      results.push({ ok: true, email: p.email, views: p.views, message: result.data });
      console.log('  → sent');
    } else {
      const code = result.data?.errors?.[0]?.code;
      const msg = JSON.stringify(result.data?.errors || result.data);
      results.push({ ok: false, email: p.email, views: p.views, error: msg });
      console.log('  → error:', msg);
      if (code === 'E_DAILY_LIMIT_EXCEEDED') { console.log('Daily limit hit, stopping.'); break; }
      if (code === 'E_RATE_LIMIT_EXCEEDED') { console.log('Rate limit hit, sleeping 10s...'); await sleep(10000); continue; }
    }

    // 2s between sends to stay under Cloudflare rate limits
    await sleep(2000);
  }

  writeFileSync(SENT_LOG_PATH, JSON.stringify(results, null, 2));
  console.log(`\nDone. Results saved to ${SENT_LOG_PATH}`);
  if (SEND) console.log(`Sent count: ${sent.length}`);
}

main();
