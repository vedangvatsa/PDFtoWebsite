import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { assessOriginality } from '../../src/lib/job-originality.ts';
import { hasPublishSlop } from '../../src/lib/noslop.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env.local') });
config();
const OR = String(process.env.OPENROUTER_API_KEY || '').trim();
const MODEL = process.env.OPENROUTER_MODEL || 'inclusionai/ling-2.6-flash';

async function wikiSummary(title) {
  const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, {
    headers: { 'User-Agent': 'cvin.bio-job-site/1.0' },
  });
  if (!r.ok) return null;
  const d = await r.json();
  const text = String(d?.extract || '').trim();
  if (text.length < 60) return null;
  return { text, url: d?.content_urls?.desktop?.page || '' };
}

const name = process.argv[2] || 'Accord Technologies Inc';
console.log('name:', name);
for (const c of [name, `${name} (company)`]) {
  const w = await wikiSummary(c);
  console.log(c, '->', w ? `wiki ${w.text.length} chars` : 'no wiki');
  if (w) {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OR}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://cvin.bio', 'X-Title': 'test' },
      body: JSON.stringify({
        model: MODEL, temperature: 0.2, max_tokens: 400, reasoning: { effort: 'none' },
        messages: [{ role: 'system', content: 'Rewrite into an original 60-90 word paragraph. No copy, no spin, plain sentences.' }, { role: 'user', content: w.text.slice(0, 2200) }],
      }),
    });
    console.log('openrouter:', r.status);
    if (r.ok) {
      const d = await r.json();
      const about = String(d.choices?.[0]?.message?.content || '').trim();
      console.log('about:', about.slice(0, 180));
      console.log('gate length:', about.length);
      console.log('noslop:', hasPublishSlop(about));
      const o = assessOriginality(about, w.text, { company: name });
      console.log('origin:', o.ok, o.reasons, JSON.stringify(o.metrics));
    } else {
      console.log('err:', (await r.text()).slice(0, 200));
    }
    break;
  }
}
