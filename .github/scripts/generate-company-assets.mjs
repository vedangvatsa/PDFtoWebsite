import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { companyDescriptionShard } from '../../src/lib/company-description-shard.mjs';
const data = JSON.parse(readFileSync('src/lib/company-descriptions.json', 'utf8'));
const shards = new Map();
for (const [key, value] of Object.entries(data)) {
  const shard = companyDescriptionShard(key);
  if (!shards.has(shard)) shards.set(shard, Object.create(null));
  shards.get(shard)[key] = value;
}
mkdirSync('public/cdn-cgi/company-abouts', { recursive: true });
for (const [shard, data] of shards) writeFileSync(`public/cdn-cgi/company-abouts/${shard}.json`, JSON.stringify(data));
console.log(`Generated ${shards.size} public company-copy asset shards`);
