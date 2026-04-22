import https from 'https';
import crypto from 'crypto';

const CONSUMER_KEY        = process.env.X_CONSUMER_KEY;
const CONSUMER_SECRET     = process.env.X_CONSUMER_SECRET;
const ACCESS_TOKEN        = process.env.X_ACCESS_TOKEN;
const ACCESS_TOKEN_SECRET = process.env.X_ACCESS_TOKEN_SECRET;

const pct = s => encodeURIComponent(String(s));

function oauthHeader(method, url, queryParams = {}) {
  const p = {
    oauth_consumer_key:     CONSUMER_KEY,
    oauth_nonce:            crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp:        Math.floor(Date.now() / 1000).toString(),
    oauth_token:            ACCESS_TOKEN,
    oauth_version:          '1.0',
  };
  const allParams = { ...p, ...queryParams };
  const base    = Object.keys(allParams).sort().map(k => `${pct(k)}=${pct(allParams[k])}`).join('&');
  const sigBase = `${method.toUpperCase()}&${pct(url)}&${pct(base)}`;
  const sigKey  = `${pct(CONSUMER_SECRET)}&${pct(ACCESS_TOKEN_SECRET)}`;
  p.oauth_signature = crypto.createHmac('sha1', sigKey).update(sigBase).digest('base64');
  const hdr = Object.keys(p).filter(k => k.startsWith('oauth')).sort()
    .map(k => `${pct(k)}="${pct(p[k])}"`).join(', ');
  return `OAuth ${hdr}`;
}

function fetchUserTimeline() {
  return new Promise((resolve) => {
    const meUrl = 'https://api.twitter.com/2/users/me';
    const meAuth = oauthHeader('GET', meUrl);
    const meReq = https.request({
      hostname: 'api.twitter.com', path: '/2/users/me', method: 'GET',
      headers: { Authorization: meAuth },
    }, meRes => {
      let d = '';
      meRes.on('data', c => d += c);
      meRes.on('end', () => {
        try {
          const user = JSON.parse(d);
          console.log('User response:', res.statusCode, user);
          if (!user.data?.id) { resolve({ status: meRes.statusCode, body: { data: [] } }); return; }
          const userId = user.data.id;
          const tweetsUrl = `https://api.twitter.com/2/users/${userId}/tweets`;
          const qp = { max_results: '10' };
          const tweetsAuth = oauthHeader('GET', tweetsUrl, qp);
          const tweetsReq = https.request({
            hostname: 'api.twitter.com',
            path: `/2/users/${userId}/tweets?max_results=10`,
            method: 'GET',
            headers: { Authorization: tweetsAuth },
          }, tweetsRes => {
            let td = '';
            tweetsRes.on('data', c => td += c);
            tweetsRes.on('end', () => {
                console.log('Tweets response:', tweetsRes.statusCode, td)
              try { resolve({ status: tweetsRes.statusCode, body: JSON.parse(td) }); }
              catch { resolve({ status: tweetsRes.statusCode, body: { data: [] } }); }
            });
          });
          tweetsReq.on('error', () => resolve({ status: 0, body: { data: [] } }));
          tweetsReq.end();
        } catch { resolve({ status: meRes.statusCode, body: { data: [] } }); }
      });
    });
    meReq.on('error', () => resolve({ status: 0, body: { data: [] } }));
    meReq.end();
  });
}

fetchUserTimeline().then(console.log);
