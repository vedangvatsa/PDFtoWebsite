/**
 * Voidmail inbox reader — reads cvinbio-hr-01@voidmail.ai (receives
 * hi@cvin.bio's catch-all) and prints subjects + extracted links.
 * Usage: VOIDMAIL_KEY=<key> node .github/scripts/voidmail-inbox.mjs [--body]
 */
const KEY = process.env.VOIDMAIL_KEY;
if (!KEY) { console.error('Set VOIDMAIL_KEY'); process.exit(1); }
const SHOW_BODY = process.argv.includes('--body');

const res = await fetch('https://api.voidly.ai/v1/agent-mail/inbox', {
  headers: { Authorization: `Bearer ${KEY}` },
});
const data = await res.json();
for (const e of data.emails || []) {
  console.log('---', (e.timestamp || '').slice(0, 19), '|', (e.subject || '').slice(0, 55), '| from:', (e.from_address || '').slice(0, 35), '| to:', (e.to_address || '').slice(0, 30));
  if (SHOW_BODY) {
    const body = e.body_text || e.body_html || '';
    const links = body.match(/https?:\/\/[^\s"<>)\]]+/g) || [];
    console.log('   BODY:', body.slice(0, 250).replace(/\n/g, ' '));
    for (const l of links.slice(0, 5)) console.log('   LINK:', l.slice(0, 150));
  }
}
