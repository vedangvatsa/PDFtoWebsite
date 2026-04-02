import https from 'https';
import crypto from 'crypto';
import fs from 'fs';

const CONSUMER_KEY        = process.env.X_CONSUMER_KEY;
const CONSUMER_SECRET     = process.env.X_CONSUMER_SECRET;
const ACCESS_TOKEN        = process.env.X_ACCESS_TOKEN;
const ACCESS_TOKEN_SECRET = process.env.X_ACCESS_TOKEN_SECRET;

const pct = s => encodeURIComponent(String(s));

function oauthHeader(method, url) {
  const p = {
    oauth_consumer_key:     CONSUMER_KEY,
    oauth_nonce:            crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp:        Math.floor(Date.now() / 1000).toString(),
    oauth_token:            ACCESS_TOKEN,
    oauth_version:          '1.0',
  };
  const base    = Object.keys(p).sort().map(k => `${pct(k)}=${pct(p[k])}`).join('&');
  const sigBase = `${method.toUpperCase()}&${pct(url)}&${pct(base)}`;
  const sigKey  = `${pct(CONSUMER_SECRET)}&${pct(ACCESS_TOKEN_SECRET)}`;
  p.oauth_signature = crypto.createHmac('sha1', sigKey).update(sigBase).digest('base64');
  const hdr = Object.keys(p).filter(k => k.startsWith('oauth')).sort()
    .map(k => `${pct(k)}="${pct(p[k])}"`).join(', ');
  return `OAuth ${hdr}`;
}

function uploadMedia(imgPath) {
  if (!imgPath) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const data     = fs.readFileSync(imgPath);
    const boundary = `----Boundary${crypto.randomBytes(8).toString('hex')}`;
    const UPLOAD_URL = 'https://upload.twitter.com/1.1/media/upload.json';
    const parts    = [
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="media"\r\n\r\n`),
      data,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ];
    const body = Buffer.concat(parts);
    const auth = oauthHeader('POST', UPLOAD_URL);
    const url  = new URL(UPLOAD_URL);

    const req = https.request({
      hostname: url.hostname,
      path:     url.pathname,
      method:   'POST',
      headers: {
        Authorization:  auth,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          j.media_id_string ? resolve(j.media_id_string) : reject(new Error(d));
        } catch { reject(new Error('Parse error: ' + d)); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function postTweet(text, mediaId, replyToTweetId) {
  return new Promise((resolve, reject) => {
    const url  = 'https://api.twitter.com/2/tweets';
    
    const payload = { text };
    if (mediaId) payload.media = { media_ids: [mediaId] };
    if (replyToTweetId) payload.reply = { in_reply_to_tweet_id: replyToTweetId };
    
    const body = JSON.stringify(payload);
    const auth = oauthHeader('POST', url);
    const req  = https.request({
      hostname: 'api.twitter.com',
      path:     '/2/tweets',
      method:   'POST',
      headers: {
        Authorization:   auth,
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const TWEETS = [
  {
    text: "You applied to 150 jobs and got 0 interviews.\nIt’s not your experience. It’s your PDF.\n\nWe spent the last 3 months building a CV parsing engine. Here is exactly the engineering reality of what happens when you upload your resume to an ATS database: 🧵👇",
    img: "./.github/images/thread/gemini_ats_stats_white_1775136463693.png"
  },
  {
    text: "1/ The Two-Column Collapse\n\nOlder enterprise systems parse PDFs strictly top-to-bottom, left-to-right. They don't understand columns. If you have 'Skills' next to 'Work History', the ATS concatenates them into garbled strings. It instantly rejects it.",
    img: "./.github/images/thread/gemini_two_column_white_1775136479072.png"
  },
  {
    text: "2/ Invisible SVG Contact Info\n\nIf you use custom vector icons (like a mail icon) instead of raw text, older OCR libraries skip them entirely. Without 'Email:' as a text anchor, legacy parsers fail to map the string to the correct DB column. Goodbye contact info.",
    img: "./.github/images/thread/gemini_invisible_svg_white_1775136495794.png"
  },
  {
    text: "3/ Keyword matching is a dumb boolean\n\nLegacy scoring isn't an LLM. It's exact string matching. If a job calls for 'Node.js' and you put 'NodeJS', your score drops. We had to build complex fuzzy-matching arrays mapping 40+ variations just to standardize input.",
    img: "./.github/images/thread/gemini_keyword_match_white_1775136509138.png"
  },
  {
    text: "4/ DOCX is just a ZIP file of XML\n\nUpload a .docx and you're uploading an XML tree. Use complex nested tables? The XML becomes deeply layered. If the parser's expected node path fails, it throws a silent error and returns an empty payload to the recruiter.",
    img: "./.github/images/thread/gemini_docx_xml_white_1775136527677.png"
  },
  {
    text: "5/ Stop trusting the black box.\n\nA massive portion of rejection happens simply because an old parser choked on your formatting.\n\nBypass the parser entirely. Send a structured live URL instead.\n\nGet your free profile link: https://cvin.bio",
    img: "./.github/images/thread/gemini_bypass_parser_white_1775136543249.png"
  }
];

async function main() {
  if (!CONSUMER_KEY) {
    console.error("Missing X API Environment Variables (X_CONSUMER_KEY etc).");
    process.exit(1);
  }
  
  let previousTweetId = null;
  
  console.log("Posting Thread of " + TWEETS.length + " tweets...");
  for (let i = 0; i < TWEETS.length; i++) {
    const t = TWEETS[i];
    console.log("Processing Tweet " + (i+1));
    let mediaId = null;
    if (t.img) {
      console.log("Uploading media: " + t.img);
      mediaId = await uploadMedia(t.img);
      console.log("- Media uploaded: " + mediaId);
    }
    
    console.log("- Posting tweet...")
    const res = await postTweet(t.text, mediaId, previousTweetId);
    if (res.status !== 201) {
      console.error("Failed to post tweet:", res.body);
      process.exit(1);
    }
    previousTweetId = res.body.data.id;
    console.log("- Success! Tweet ID: " + previousTweetId);
    
    // Add small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log("Thread posted successfully!");
}

main().catch(console.error);
