import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const AGENTMAIL_ACCOUNTS_RAW = JSON.parse(readFileSync(join(__dirname, 'agentmail-accounts.json'), 'utf8'));
const AGENTMAIL_ACCOUNTS = AGENTMAIL_ACCOUNTS_RAW.flatMap(a =>
  a.inboxes.map(inbox => ({ apiKey: a.api_key, inbox, provider: 'agentmail' }))
);

const VOIDMAIL_ACCOUNTS = JSON.parse(readFileSync(join(__dirname, 'voidmail-accounts.json'), 'utf8'))
  .map(a => ({ apiKey: a.api_key, inbox: a.address, provider: 'voidmail' }));

const ACCOUNTS = [...AGENTMAIL_ACCOUNTS, ...VOIDMAIL_ACCOUNTS];

const MAX_PER_ACCOUNT = 100;

const CLEAN_LIST_PATH = join(__dirname, 'agentmail-list.json');
const LOGS_PATH = join(__dirname, 'email-logs.json');
const SENT_PATH = join(__dirname, 'sent-emails.json');

// 1. Data Loading
const queue = JSON.parse(readFileSync(CLEAN_LIST_PATH, 'utf8'));
const sentList = JSON.parse(readFileSync(SENT_PATH, 'utf8'));
const logs = JSON.parse(readFileSync(LOGS_PATH, 'utf8'));

// 2. Filter & Batch (with blacklist)
let doNotSend = new Set();
try { doNotSend = new Set(JSON.parse(readFileSync(join(__dirname, 'global-do-not-send.json'), 'utf8'))); } catch {}
if (doNotSend.size > 0) console.log(`🚫 Loaded ${doNotSend.size} blacklisted emails`);

const sentSet = new Set(sentList);
const cleanQueue = queue.filter(e => !doNotSend.has(e) && !sentSet.has(e));
const totalToSendCount = ACCOUNTS.length * MAX_PER_ACCOUNT;
const toSend = cleanQueue.slice(0, totalToSendCount);

if (toSend.length === 0) {
  console.log('No unsent emails in queue.');
  process.exit(0);
}

const SUBJECTS = [
  'your resume is probably invisible',
  'are recruiters even reading your resume?',
  'your CV deserves more than a PDF',
  '75% of resumes get rejected by a robot',
  'stop sending PDFs',
  'a recruiter spends 3 minutes on your resume',
  'your resume vs a link — which wins?',
  'PDFs die in folders. Links get clicked.',
  'why your resume isn\'t getting responses',
  'turn your CV into something people actually open',
];

const HEADLINES = [
  '75% of resumes never reach a human.',
  'A robot reads your resume before a human ever does.',
  'Most resumes get scanned, scored, and rejected in 3 minutes.',
  'Your resume is a PDF. PDFs sit in folders. Nobody opens folders.',
  'Recruiters don\'t download attachments. They click links.',
];

const SUBLINES = [
  'A robot scans it for keywords. Rejects it in 3 minutes. Nobody read it.',
  'An ATS strips your formatting, hunts for keywords, and filters you out.',
  'The ATS reads it first. If it doesn\'t like what it sees, a human never will.',
  'Applicant tracking systems scan for keywords and reject in minutes.',
  'Automated filters parse your CV and decide your fate before a human sees it.',
];

const MIDDLE_LINES = [
  'A PDF sits in a folder. A <b>link</b> gets shared, clicked, and tracked.',
  'A PDF gets downloaded and forgotten. A <b>link</b> gets opened and shared.',
  'A PDF is a dead end. A <b>link</b> is a live, trackable page.',
  'PDFs collect dust in downloads. <b>Links</b> get clicked, shared, and remembered.',
  'A PDF is static. A <b>link</b> shows your work in motion.',
];

const CTAS = [
  'Turn your CV into a live link. 2 minutes. Free.',
  'Make your CV a link in 2 minutes. Free.',
  'Convert your resume to a live link. Free, takes 2 minutes.',
  'Get your CV online as a link. 2 minutes, no cost.',
  'Your CV, but as a link. Free and takes 2 minutes.',
];

const SIGNATURES = [
  'Free. No credit card. &mdash; cvin.bio<br><br>Also: we post daily tech job openings on <a href="https://t.me/techjobsdaily" style="color:#2563eb;text-decoration:none">Telegram</a>.',
  'No signup needed. &mdash; cvin.bio<br><br>P.S. Daily tech job alerts on <a href="https://t.me/techjobsdaily" style="color:#2563eb;text-decoration:none">t.me/techjobsdaily</a>.',
  '100% free. &mdash; cvin.bio<br><br>Job hunting? Join <a href="https://t.me/techjobsdaily" style="color:#2563eb;text-decoration:none">Tech Jobs Daily on Telegram</a>.',
  'No catch, no cost. &mdash; cvin.bio<br><br>We also share fresh tech jobs daily on <a href="https://t.me/techjobsdaily" style="color:#2563eb;text-decoration:none">Telegram</a>.',
  'Built free for job seekers. &mdash; cvin.bio<br><br>Daily tech job openings: <a href="https://t.me/techjobsdaily" style="color:#2563eb;text-decoration:none">t.me/techjobsdaily</a>',
];

function getEmailVariant(accountIndex, inbox, provider) {
  const i = accountIndex;
  const subject = SUBJECTS[i % SUBJECTS.length];
  const headline = HEADLINES[i % HEADLINES.length];
  const subline = SUBLINES[i % SUBLINES.length];
  const middle = MIDDLE_LINES[i % MIDDLE_LINES.length];
  const cta = CTAS[i % CTAS.length];
  const sig = SIGNATURES[i % SIGNATURES.length];
  const utmCampaign = `cold_v${(i % 5) + 1}`;
  const utmContent = `inbox_${String(i + 1).padStart(2, '0')}_${inbox.split('@')[0]}`;
  const utmSource = provider || 'agentmail';
  
  const trackingPixel = `<img src="https://cvin.bio/api/email-open?campaign=${utmCampaign}&content=${utmContent}&source=${utmSource}" width="1" height="1" alt="" style="display:none;border:0;outline:none;text-decoration:none"/>`;
  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;max-width:480px;padding:16px;"><p style="font-size:22px;font-weight:900;color:#000;line-height:1.3;margin:0 0 12px">${headline}</p><p style="font-size:15px;color:#333;line-height:1.5;margin:0 0 8px">${subline}</p><p style="font-size:15px;color:#333;line-height:1.5;margin:0 0 8px">${middle}</p><p style="font-size:16px;font-weight:700;color:#000;margin:0 0 16px">${cta}</p><a href="https://cvin.bio?utm_source=${utmSource}&amp;utm_medium=email&amp;utm_campaign=${utmCampaign}&amp;utm_content=${utmContent}" style="display:inline-block;padding:10px 28px;font-size:15px;font-weight:700;color:#fff;background:#2563eb;border-radius:50px;text-decoration:none">Make your CV a link &rarr;</a><p style="font-size:12px;color:#bbb;margin:10px 0 0">${sig}</p>${trackingPixel}</div>`;
  
  const text = `${headline}\n\n${subline.replace(/<[^>]+>/g, '')}\n\n${middle.replace(/<[^>]+>/g, '')}\n\n${cta}\n\nhttps://cvin.bio?utm_source=${utmSource}&utm_medium=email&utm_campaign=${utmCampaign}&utm_content=${utmContent}`;
  
  return { subject, html, text };
}

let successfullySent = [];
let failedEmails = [];

console.log(`Starting campaign: Support for ${ACCOUNTS.length} accounts detectors. Total Batch: ${toSend.length}\n`);

for (let accountIndex = 0; accountIndex < ACCOUNTS.length; accountIndex++) {
  const account = ACCOUNTS[accountIndex];
  const startIdx = accountIndex * MAX_PER_ACCOUNT;
  const endIdx = Math.min(startIdx + MAX_PER_ACCOUNT, toSend.length);
  const accountBatch = toSend.slice(startIdx, endIdx);

  if (accountBatch.length === 0) continue;

  const variant = getEmailVariant(accountIndex, account.inbox, account.provider);
  console.log(`\n--- Using Account ${accountIndex + 1}: ${account.inbox} (subject: "${variant.subject}") ---`);
  let limitReached = false;

  for (const email of accountBatch) {
    if (limitReached) break;

    try {
      let res, data;
      
      if (account.provider === 'voidmail') {
        res = await fetch('https://api.voidly.ai/v1/agent-mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${account.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ to: email, subject: variant.subject, text: variant.text, html: variant.html, from_name: 'CVinBio' })
        });
        data = await res.json();
        
        if (res.ok && data.sent) {
          successfullySent.push(email);
          logs.push({ email, status: 'sent', id: data.messageId, sentAt: new Date().toISOString(), account: account.inbox });
          console.log(`[Account ${accountIndex + 1}] ✓ Sent → ${email}`);
        } else {
          failedEmails.push({ email, error: data.error || res.status });
          logs.push({ email, status: 'failed', error: data.error || res.status, sentAt: new Date().toISOString(), account: account.inbox });
          console.log(`[Account ${accountIndex + 1}] ✗ FAIL → ${email}: ${data.error || res.status}`);
        }
        await new Promise(r => setTimeout(r, 300));
      } else {
        res = await fetch(`https://api.agentmail.to/v0/inboxes/${encodeURIComponent(account.inbox)}/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${account.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ to: email, subject: variant.subject, html: variant.html, text: variant.text })
      });
      
      data = await res.json();
      
      if (res.ok) {
        successfullySent.push(email);
        logs.push({ email, status: 'sent', id: data.message_id, sentAt: new Date().toISOString(), account: account.inbox });
        console.log(`[Account ${accountIndex + 1}] ✓ Sent → ${email}`);
      } else {
        failedEmails.push({ email, error: data.message || res.status });
        logs.push({ email, status: 'failed', error: data.message || res.status, sentAt: new Date().toISOString(), account: account.inbox });
        console.log(`[Account ${accountIndex + 1}] ✗ FAIL → ${email}: ${data.message || res.status}`);
        
        if (data.message && (data.message.includes('Limit exceeded') || data.message.includes('Daily limit'))) {
          console.log(`Account ${accountIndex + 1} limit reached. Skipping remaining batch.`);
          limitReached = true;
        }
      }
      
      await new Promise(r => setTimeout(r, 600));
      } 
  } catch (e) {
    failedEmails.push({ email, error: e.message });
    console.log(`✗ ERROR → ${email}: ${e.message}`);
  }
  }
}

// 3. Update State
const updatedQueue = queue.filter(e => !successfullySent.includes(e));
const updatedSentList = [...new Set([...sentList, ...successfullySent])];

writeFileSync(CLEAN_LIST_PATH, JSON.stringify(updatedQueue, null, 2));
writeFileSync(SENT_PATH, JSON.stringify(updatedSentList, null, 2));
writeFileSync(LOGS_PATH, JSON.stringify(logs, null, 2));

console.log(`\nBatch complete! Sent: ${successfullySent.length}, Failed: ${failedEmails.length}`);
console.log(`Queue remaining: ${updatedQueue.length}`);
