import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Config ───────────────────────────────────────────────────────────────
const BLOG_ID = '3228687016233406726';
const CLIENT_ID = '686967749966-3re7gdglg4u6u090vqjmhnsljb171ts6.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REFRESH_TOKEN = process.env.BLOGGER_REFRESH_TOKEN;
const STATE_FILE = path.join(__dirname, 'blogger-state.json');
const SITE_URL = 'https://cvin.bio';

// ── Blog articles with featured images ───────────────────────────────────
const ARTICLES = [
  { slug: 'cv-attachments', title: 'Why You Should Stop Sending PDF Resumes', image: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=1200&q=80' },
  { slug: 'mobile-responsive-cv', title: 'The Silent Killer: How Non-Responsive Resumes Cost You Interviews', image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&q=80' },
  { slug: 'cv-web-link', title: 'Why a URL is the Ultimate Professional Move', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80' },
  { slug: 'bypass-ats', title: 'Bypassing Formatting Destruction with Dual-Submissions', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80' },
  { slug: 'stand-out-inbox', title: 'Using Clean URLs to Stand Out in Application Inboxes', image: 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=1200&q=80' },
  { slug: 'pdf-breaks-ats', title: 'Why Complex PDFs Break Recruiter Algorithms', image: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=1200&q=80' },
  { slug: 'tech-resume-keywords', title: 'Mapping Visual Hierarchy for Technical Recruiters', image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1200&q=80' },
  { slug: 'update-cv-anytime', title: 'The Hidden Advantage of Fixing Typos Anytime', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80' },
  { slug: 'objective-statement-death', title: 'Drop the Objective Section', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80' },
  { slug: 'overstuffing-bullets', title: 'Write Shorter Job Details', image: 'https://images.unsplash.com/photo-1542626991-cbc4e32524cc?w=1200&q=80' },
  { slug: 'measuring-impact-no-data', title: 'How to Show Value Without Money Numbers', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80' },
  { slug: 'short-tenures-tech', title: 'How to Explain Short Jobs', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80' },
  { slug: 'keyword-trust', title: 'Stop Faking Your Skills List', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80' },
  { slug: 'soft-skills-evidence', title: 'Prove You Can Work With Others', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80' },
  { slug: 'the-30-second-scan', title: 'Write For the 30 Second Scan', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80' },
  { slug: 'gap-explanation', title: 'How to Explain Time Off', image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80' },
  { slug: 'academic-to-commercial', title: 'How to Sell Your PhD', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&q=80' },
  { slug: 'generic-skill-bars', title: 'Stop Using Skill Progress Bars', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80' },
  { slug: 'beat-smart-ai-bots', title: 'How to Beat Smart AI Resume Bots', image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80' },
  { slug: 'where-to-put-ai-skills', title: 'Where to Put AI Skills on Your Page', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80' },
  { slug: 'show-your-code', title: 'Show Your Code Do Not Just List It', image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&q=80' },
  { slug: 'college-degrees-matter-less', title: 'Why College Degrees Matter Less Now', image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80' },
  { slug: 'two-page-resume-myth', title: 'The Two Page Resume Myth', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80' },
];

// ── Get access token ─────────────────────────────────────────────────────
function getAccessToken() {
  return new Promise((resolve, reject) => {
    const body = `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&refresh_token=${REFRESH_TOKEN}&grant_type=refresh_token`;
    const req = https.request({
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          j.access_token ? resolve(j.access_token) : reject(new Error(d));
        } catch { reject(new Error('Token parse error: ' + d)); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Fetch full article HTML from cvin.bio ────────────────────────────────
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchPage(res.headers.location).then(resolve).catch(reject);
        return;
      }
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

function extractArticleContent(html) {
  let content = '';

  // Try to extract the main article content
  // Strategy 1: article tag
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (articleMatch) {
    content = articleMatch[1];
  }

  // Strategy 2: main content area
  if (!content) {
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (mainMatch) content = mainMatch[1];
  }

  if (!content) return null;

  // Clean: remove className, data-*, style attributes, SVGs, script tags
  content = content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/\s*class(?:Name)?="[^"]*"/gi, '')
    .replace(/\s*data-[a-z-]+="[^"]*"/gi, '')
    .replace(/\s*style="[^"]*"/gi, '')
    // Fix internal links to point to cvin.bio
    .replace(/href="\//g, `href="${SITE_URL}/`)
    // Clean up whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return content;
}

// ── Create Blogger post ──────────────────────────────────────────────────
function createPost(token, title, htmlContent) {
  return new Promise((resolve, reject) => {
    const postBody = JSON.stringify({
      kind: 'blogger#post',
      blog: { id: BLOG_ID },
      title,
      content: htmlContent,
    });
    const req = https.request({
      hostname: 'www.googleapis.com',
      path: `/blogger/v3/blogs/${BLOG_ID}/posts/`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postBody),
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(postBody);
    req.end();
  });
}

// ── Delete existing post (for re-publishing) ─────────────────────────────
function deletePost(token, postId) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'www.googleapis.com',
      path: `/blogger/v3/blogs/${BLOG_ID}/posts/${postId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode }));
    });
    req.on('error', reject);
    req.end();
  });
}

// ── List posts to find duplicates ────────────────────────────────────────
function listPosts(token) {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: 'www.googleapis.com',
      path: `/blogger/v3/blogs/${BLOG_ID}/posts?maxResults=50`,
      headers: { Authorization: `Bearer ${token}` },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch { resolve({ items: [] }); }
      });
    }).on('error', reject);
  });
}

// ── Main ─────────────────────────────────────────────────────────────────
async function main() {
  let state = { index: 0, lastPostedAt: null, published: [] };
  if (fs.existsSync(STATE_FILE)) state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));

  if (state.index >= ARTICLES.length) {
    console.log(`✅ All ${ARTICLES.length} articles published to Blogger.`);
    process.exit(0);
  }

  const article = ARTICLES[state.index];
  console.log(`Publishing #${state.index + 1}/${ARTICLES.length}: "${article.title}"`);

  const token = await getAccessToken();
  console.log('✅ Got access token');

  // Delete any existing post with same title (for re-runs)
  const existing = await listPosts(token);
  if (existing.items) {
    for (const post of existing.items) {
      if (post.title === article.title) {
        console.log(`Deleting duplicate post: ${post.id}`);
        await deletePost(token, post.id);
      }
    }
  }

  // Fetch full article from cvin.bio
  const canonicalUrl = `${SITE_URL}/${article.slug}`;
  console.log(`Fetching article from ${canonicalUrl}...`);
  const pageHtml = await fetchPage(canonicalUrl);
  console.log(`Fetched ${pageHtml.length} bytes`);

  let articleBody = extractArticleContent(pageHtml);

  if (!articleBody || articleBody.length < 200) {
    console.log('⚠️ Could not extract rich content, using excerpt');
    articleBody = `<p>Read the full article for practical tips and strategies.</p>`;
  }

  // Build final HTML: featured image + canonical + full content + CTA
  const htmlContent = `
<div style="text-align:center;margin-bottom:24px;">
  <img src="${article.image}" alt="${article.title}" style="width:100%;max-width:800px;border-radius:8px;" />
</div>

<p><em>Originally published at <a href="${canonicalUrl}" rel="canonical">${canonicalUrl}</a></em></p>

<hr/>

${articleBody}

<hr/>

<div style="background:#f8f9fa;padding:20px;border-radius:12px;text-align:center;margin-top:24px;">
  <h3>Turn your CV into a shareable webpage</h3>
  <p>Drop any format. Get a live profile link. Share with recruiters.</p>
  <p><a href="${SITE_URL}?utm_source=blogger&utm_medium=blog&utm_campaign=cta" style="display:inline-block;padding:10px 24px;background:#4f46e5;color:white;border-radius:8px;text-decoration:none;font-weight:600;">Try CVin.Bio →</a></p>
</div>
  `.trim();

  console.log(`Article content: ${htmlContent.length} chars`);

  const result = await createPost(token, article.title, htmlContent);

  if (result.status === 200 || result.status === 201) {
    console.log(`✅ Published "${article.title}" to Blogger (${htmlContent.length} chars)`);
    state.index++;
    state.lastPostedAt = new Date().toISOString();
    if (!state.published) state.published = [];
    state.published.push({ slug: article.slug, publishedAt: state.lastPostedAt });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } else {
    console.error(`❌ Failed (${result.status}):`, result.body);
    process.exit(1);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
