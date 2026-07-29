#!/usr/bin/env node
/**
 * Cloudflare Email Service setup for cvin.bio — MARKETING only.
 *
 * Hard guarantees this script is designed around:
 *   - Hosting is Cloudflare Workers (OpenNext)
 *   - Onboarding/transactional mail remains on Resend (do not edit those routes)
 *   - Cloudflare Email Sending is only for marketing (from news@cvin.bio)
 *
 * DNS note: Email Service requires Cloudflare DNS for the domain. Website
 * Email Sending auth lives under cf-bounce.*.
 *
 * Usage:
 *   node setup-cloudflare-email.mjs status
 *   node setup-cloudflare-email.mjs export-dns
 *   node setup-cloudflare-email.mjs migrate-dns
 *   node setup-cloudflare-email.mjs set-ns
 *   node setup-cloudflare-email.mjs enable-sending
 *   node setup-cloudflare-email.mjs test you@email.com
 *
 * Env (.env.local):
 *   CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN
 *   NAMECHEAP_API_USER, NAMECHEAP_API_KEY
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const DOMAIN = 'cvin.bio';
const SLD = 'cvin';
const TLD = 'bio';

function loadEnvLocal() {
  const p = resolve(process.cwd(), '.env.local');
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
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

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const NC_USER = process.env.NAMECHEAP_API_USER;
const NC_KEY = process.env.NAMECHEAP_API_KEY;
const FROM =
  process.env.CLOUDFLARE_MARKETING_FROM ||
  process.env.CLOUDFLARE_EMAIL_FROM ||
  'news@cvin.bio';

// Never default marketing tests to Resend's onboarding address
if (['hi@cvin.bio', 'onboarding@cvin.bio', 'noreply@cvin.bio'].includes(FROM.toLowerCase())) {
  console.error(`Refusing FROM=${FROM} — reserved for Resend/onboarding. Use news@cvin.bio`);
  process.exit(1);
}

function need(name, val) {
  if (!val) {
    console.error(`Missing ${name}`);
    process.exit(1);
  }
}

async function publicIp() {
  const r = await fetch('https://api.ipify.org');
  return (await r.text()).trim();
}

async function cf(path, options = {}) {
  need('CLOUDFLARE_API_TOKEN', CF_TOKEN);
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${CF_TOKEN}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function namecheap(command, extra = {}) {
  need('NAMECHEAP_API_USER', NC_USER);
  need('NAMECHEAP_API_KEY', NC_KEY);
  const ip = await publicIp();
  const params = new URLSearchParams({
    ApiUser: NC_USER,
    ApiKey: NC_KEY,
    UserName: NC_USER,
    ClientIp: ip,
    Command: command,
    ...extra,
  });
  const res = await fetch(
    `https://api.namecheap.com/xml.response?${params.toString()}`
  );
  const text = await res.text();
  return text;
}

function parseNcHosts(xml) {
  const hosts = [];
  const re =
    /<host\s+([^>]+)\/>/gi;
  let m;
  while ((m = re.exec(xml))) {
    const attrs = m[1];
    const get = (k) => {
      const a = attrs.match(new RegExp(`${k}="([^"]*)"`, 'i'));
      return a ? a[1] : '';
    };
    hosts.push({
      name: get('Name'),
      type: get('Type'),
      address: get('Address'),
      mxPref: get('MXPref') || '10',
      ttl: get('TTL') || '1800',
    });
  }
  return hosts;
}

async function findZone() {
  const { data } = await cf(
    `/zones?name=${encodeURIComponent(DOMAIN)}&account.id=${ACCOUNT_ID}`
  );
  return data?.result?.[0] || null;
}

async function status() {
  console.log('=== Isolation check ===');
  console.log('  Website hosting : Cloudflare Workers');
  console.log('  Onboarding email: Resend (hi@cvin.bio) — do not touch');
  console.log('  Marketing email : Cloudflare Email Service (news@cvin.bio)');
  console.log('');

  need('CLOUDFLARE_ACCOUNT_ID', ACCOUNT_ID);
  need('CLOUDFLARE_API_TOKEN', CF_TOKEN);

  const verify = await cf(`/accounts/${ACCOUNT_ID}/tokens/verify`);
  console.log(
    'CF token:',
    verify.data?.success ? 'valid' : JSON.stringify(verify.data?.errors)
  );

  const zone = await findZone();
  if (!zone) {
    console.log(`\nZone ${DOMAIN}: NOT on Cloudflare account ${ACCOUNT_ID}`);
    console.log(`
Next steps:
  1. Add site (token cannot create zones):
     https://dash.cloudflare.com/?to=/:account/add-site
     Domain: ${DOMAIN}
     Account: Vatsavedang@gmail.com's Account

  2. After the zone appears (even pending), run:
     node setup-cloudflare-email.mjs migrate-dns
     node setup-cloudflare-email.mjs set-ns
     node setup-cloudflare-email.mjs enable-sending

  3. Test marketing send:
     node setup-cloudflare-email.mjs test you@example.com

Namecheap currently holds DNS (Resend DKIM, SES, etc.).
migrate-dns copies those records into Cloudflare before set-ns flips nameservers.
`);
  } else {
    console.log(
      `Zone ${DOMAIN}: ${zone.id} status=${zone.status} ns=${(zone.name_servers || []).join(', ')}`
    );
    const subs = await cf(`/zones/${zone.id}/email/sending/subdomains`);
    console.log(
      'Email Sending subdomains:',
      JSON.stringify(subs.data?.result ?? subs.data, null, 2)
    );
  }

  if (NC_USER && NC_KEY) {
    const list = await namecheap('namecheap.domains.dns.getList', {
      SLD,
      TLD,
    });
    const usingOurs = /IsUsingOurDNS="true"/i.test(list);
    const ns = [...list.matchAll(/<Nameserver>([^<]+)<\/Nameserver>/gi)].map(
      (x) => x[1]
    );
    console.log(`\nNamecheap DNS: ourDNS=${usingOurs} ns=${ns.join(', ')}`);
  }
}

async function exportDns() {
  const xml = await namecheap('namecheap.domains.dns.getHosts', {
    SLD,
    TLD,
  });
  const hosts = parseNcHosts(xml);
  console.log(JSON.stringify(hosts, null, 2));
  console.log(`\n# ${hosts.length} records on Namecheap for ${DOMAIN}`);
}

async function migrateDns() {
  const zone = await findZone();
  if (!zone) {
    console.error(
      `No Cloudflare zone for ${DOMAIN}. Add the site in the dashboard first.`
    );
    process.exit(1);
  }

  const xml = await namecheap('namecheap.domains.dns.getHosts', {
    SLD,
    TLD,
  });
  const hosts = parseNcHosts(xml);
  console.log(`Migrating ${hosts.length} Namecheap records → zone ${zone.id}`);

  // Existing CF records (to skip exact duplicates)
  const existing = await cf(
    `/zones/${zone.id}/dns_records?per_page=500`
  );
  const existingKeys = new Set(
    (existing.data?.result || []).map(
      (r) => `${r.type}|${r.name}|${r.content}`
    )
  );

  for (const h of hosts) {
    const name =
      h.name === '@' ? DOMAIN : `${h.name}.${DOMAIN}`.replace(/\.+/g, '.');
    // Namecheap sometimes stores trailing dots on MX/CNAME targets
    let content = h.address;
    if (
      (h.type === 'CNAME' || h.type === 'MX' || h.type === 'NS') &&
      content.endsWith('.')
    ) {
      content = content.slice(0, -1);
    }

    const key = `${h.type}|${name}|${content}`;
    // Cloudflare apex often already has a placeholder — still try
    if (existingKeys.has(key)) {
      console.log(`  skip exists ${h.type} ${name} → ${content}`);
      continue;
    }

    const payload = {
      type: h.type,
      name,
      content,
      ttl: Math.max(parseInt(h.ttl, 10) || 1800, 60),
      proxied: false, // keep DNS-only for mail records
    };
    if (h.type === 'MX') {
      payload.priority = parseInt(h.mxPref, 10) || 10;
    }
    // Cloudflare does not proxy MX/TXT/CNAME for mail the same way — leave proxied false
    if (!['A', 'AAAA', 'CNAME'].includes(h.type)) {
      delete payload.proxied;
    }

    const created = await cf(`/zones/${zone.id}/dns_records`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (created.data?.success) {
      console.log(`  + ${h.type} ${name} → ${content}`);
    } else {
      console.log(
        `  ! ${h.type} ${name}: ${JSON.stringify(created.data?.errors || created.data)}`
      );
    }
  }

  console.log(`
Done. Review DNS in Cloudflare dashboard, then:
  node setup-cloudflare-email.mjs set-ns
`);
}

async function setNs() {
  const zone = await findZone();
  if (!zone) {
    console.error('Zone not found on Cloudflare.');
    process.exit(1);
  }
  const ns = zone.name_servers;
  if (!ns || ns.length < 2) {
    console.error('Cloudflare did not return name_servers for this zone.');
    process.exit(1);
  }

  console.log(`Setting Namecheap custom NS for ${DOMAIN}:`);
  ns.forEach((n, i) => console.log(`  ${i + 1}. ${n}`));

  // Namecheap setCustom requires comma-separated Nameservers=
  // https://www.namecheap.com/support/api/methods/domains-dns/set-custom/
  const xml = await namecheap('namecheap.domains.dns.setCustom', {
    SLD,
    TLD,
    Nameservers: ns.join(','),
  });
  console.log(xml.includes('Status="OK"') ? 'Namecheap NS update: OK' : xml);

  if (!xml.includes('Status="OK"')) process.exit(1);

  console.log(`
Nameservers updated. Propagation usually 5–30 minutes (up to 48h).
When zone status is "active":
  node setup-cloudflare-email.mjs enable-sending
`);
}

async function enableSending() {
  const zone = await findZone();
  if (!zone) {
    console.error('Zone not found.');
    process.exit(1);
  }
  if (zone.status !== 'active') {
    console.warn(
      `Warning: zone status is "${zone.status}" (want "active"). Continuing anyway…`
    );
  }

  console.log(`Enabling Cloudflare Email Sending for ${DOMAIN}…`);
  const created = await cf(`/zones/${zone.id}/email/sending/subdomains`, {
    method: 'POST',
    body: JSON.stringify({ name: DOMAIN }),
  });
  console.log(JSON.stringify(created.data, null, 2));

  if (!created.data?.success) {
    console.error(`
API enable failed. Use dashboard instead:
  https://dash.cloudflare.com/?to=/:account/email-service/sending
  → Onboard Domain → ${DOMAIN}

This only adds cf-bounce.* records for outbound marketing auth.
It does not change Resend DKIM or SES inbound MX.
`);
    process.exit(1);
  }

  console.log(`
Email Sending enabled. Default from: ${FROM}
Hosting is on Cloudflare Workers.
Test: node setup-cloudflare-email.mjs test you@example.com
`);
}

async function test(to) {
  if (!to) {
    console.error('Usage: node setup-cloudflare-email.mjs test recipient@example.com');
    process.exit(1);
  }
  need('CLOUDFLARE_ACCOUNT_ID', ACCOUNT_ID);

  console.log(`Cloudflare Email Sending test: ${FROM} → ${to}`);
  const result = await cf(`/accounts/${ACCOUNT_ID}/email/sending/send`, {
    method: 'POST',
    body: JSON.stringify({
      from: {
        address: FROM,
        name: process.env.CLOUDFLARE_EMAIL_FROM_NAME || process.env.CLOUDFLARE_MARKETING_FROM_NAME || 'CVin.Bio',
      },
      to,
      subject: 'CVin.Bio — Cloudflare Email Sending test',
      text: 'Test email via Cloudflare Email Sending. App hosting is on Cloudflare Workers.',
      html: '<p>Test email via <strong>Cloudflare Email Sending</strong>.</p><p>App hosting is on Cloudflare Workers.</p>',
    }),
  });
  console.log(JSON.stringify(result.data, null, 2));
  if (!result.data?.success) process.exit(1);
}

const cmd = process.argv[2] || 'status';
const arg = process.argv[3];

const cmds = {
  status,
  'export-dns': exportDns,
  'migrate-dns': migrateDns,
  'set-ns': setNs,
  'enable-sending': enableSending,
  test: () => test(arg),
};

if (!cmds[cmd]) {
  console.error(
    'Commands: status | export-dns | migrate-dns | set-ns | enable-sending | test <email>'
  );
  process.exit(1);
}

await cmds[cmd]();
