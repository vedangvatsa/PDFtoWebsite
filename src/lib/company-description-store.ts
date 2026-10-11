import { cache } from 'react';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { companyDescriptionShard } from './company-description-shard.mjs';

const loadShard = cache(async (shard: string): Promise<Record<string, string>> => {
  let assets;
  try { assets = (await getCloudflareContext({ async: true })).env.ASSETS; } catch { /* Node build/tests */ }
  if (assets) {
    const response = await assets.fetch(`https://assets.local/cdn-cgi/company-abouts/${shard}.json`);
    if (response.ok) return response.json();
    await response.body?.cancel();
    return {};
  }
  // Only a Node build/test fallback. Avoid a JSON import, which embeds 4 MB in
  // every Worker. Cloudflare always uses the bounded static asset above.
  const { readFile } = await import('node:fs/promises');
  const { join } = await import('node:path');
  return JSON.parse(await readFile(join(process.cwd(), 'public', 'cdn-cgi', 'company-abouts', `${shard}.json`), 'utf8'));
});

export async function cachedCompanyDescription(key: string): Promise<string | null> {
  if (!key || key.length > 200) return null;
  const shard = await loadShard(companyDescriptionShard(key));
  return Object.hasOwn(shard, key) ? shard[key] : null;
}
