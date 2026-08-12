/**
 * AgentMail inbox reader — reads the cvinbio@agentmail.to inbox and prints
 * subjects + extracted links (for completing email-verified signups).
 * Usage: AM_KEY=<key> node .github/scripts/agentmail-inbox.mjs [--body]
 */
const KEY = process.env.AM_KEY;
if (!KEY) { console.error('Set AM_KEY'); process.exit(1); }
const INBOX = 'cvinbio@agentmail.to';
const SHOW_BODY = process.argv.includes('--body');

const res = await fetch(`https://api.agentmail.to/v0/inboxes/${encodeURIComponent(INBOX)}/messages?limit=10`, {
  headers: { Authorization: `Bearer ${KEY}` },
});
const data = await res.json();
for (const m of data.messages || []) {
  console.log('---', m.timestamp?.slice(0, 19), '|', (m.subject || '').slice(0, 50), '| from:', (m.from || '').slice(0, 35));
  if (SHOW_BODY) {
    const d = await (await fetch(`https://api.agentmail.to/v0/inboxes/${encodeURIComponent(INBOX)}/messages/${encodeURIComponent(m.message_id)}`, {
      headers: { Authorization: `Bearer ${KEY}` },
    })).json();
    const body = d.body || d.preview || '';
    const links = body.match(/https?:\/\/[^\s"<>)\]]+/g) || [];
    console.log('   BODY:', body.slice(0, 300).replace(/\n/g, ' '));
    for (const l of links.slice(0, 5)) console.log('   LINK:', l.slice(0, 150));
  }
}
