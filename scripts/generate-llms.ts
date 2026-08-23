/**
 * Build llms.txt + llms-full.txt and write them into public/ so they are
 * served as immutable static assets (Cloudflare edge, 0 ms, no Worker).
 * Run as part of npm run deploy or CI before opennextjs-cloudflare build.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in env.
 * When a local .env.production.local is present it is auto-loaded.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');

// Load .env.production.local when present (CI sets env directly via secrets).
const envPath = join(REPO_ROOT, '.env.production.local');
try {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)=(.*)/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = (m[2] ?? '').replace(/^["'](.*)["']\s*$/, '$1').trim();
    }
  }
} catch {
  // File absent in non-deploy contexts — env must already be set.
}

async function main() {
  const t0 = Date.now();

  // Dynamic import so the module only loads after env is populated.
  const { buildDirectory } = await import('@/lib/llms-directory');
  const publicDir = join(REPO_ROOT, 'public');
  mkdirSync(publicDir, { recursive: true });

  console.log('Generating /llms.txt (navigation index)…');
  const index = await buildDirectory('index');
  writeFileSync(join(publicDir, 'llms.txt'), index);
  console.log(`  llms.txt  ${index.length.toLocaleString()} B  (${(Date.now() - t0) / 1000}s)`);

  const sectionJobs: Array<[string, () => Promise<string>]> = [
    ['companies', () => buildDirectory('companies')],
    ['jobs', () => buildDirectory('jobs')],
  ];
  // Privacy: no bulk profile directory file — personal profile pages stay
  // discoverable individually but are never packaged as a scraped list.
  for (const [name, build] of sectionJobs) {
    const t = Date.now();
    const text = await build();
    writeFileSync(join(publicDir, `llms-${name}.txt`), text);
    console.log(`  llms-${name} ${text.length.toLocaleString()} B  (${(Date.now() - t) / 1000}s)`);
  }

  // Scoped product-area llms files (no DB needed).
  const siteUrlForLlms = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
  const docsLlms = `# CVin.Bio Developer Docs

> Scoped context for CVin.Bio developer resources. Parent index: ${siteUrlForLlms}/llms.txt

- API overview and conventions: ${siteUrlForLlms}/docs
- OpenAPI 3.1 spec (operationIds, schemas, error model): ${siteUrlForLlms}/openapi.json
- MCP server manifest: ${siteUrlForLlms}/.well-known/mcp.json
- MCP Streamable HTTP endpoint (JSON-RPC 2.0): ${siteUrlForLlms}/mcp
- Agent instructions & when-to-use: ${siteUrlForLlms}/agent.txt
- Authentication walkthrough (zero-auth reads): ${siteUrlForLlms}/auth.md
- Agent skills index: ${siteUrlForLlms}/.well-known/agent-skills/index.json
- Agentic resource catalog: ${siteUrlForLlms}/.well-known/ai-catalog.json
- Rate limits: RateLimit-* headers on responses; Retry-After on 429; 300 req/min reads, 5 req/hour contact writes
- Pagination: opaque cursor — pass next_cursor back as ?cursor= until null
`;
  const apiLlms = `# CVin.Bio Public API

> Scoped context for the REST + MCP surface. Spec of record: ${siteUrlForLlms}/openapi.json

## REST endpoints

- GET /api/jobs?page|cursor&limit&q&type&loc&kind → operationId listJobs (cursor pagination via next_cursor)
- GET /api/jobs/{id} → getJob
- GET /api/news?limit → listTechNews
- GET /api/profile/{username} → getPublicProfile
- POST /api/contact → submitContactMessage (202 Accepted; Idempotency-Key supported)
- POST /mcp → mcpJsonRpc (JSON-RPC 2.0: initialize, tools/list, tools/call)

## Conventions

- Errors: JSON { error, code, hint }; codes enum in ErrorEnvelope component
- Auth: zero-auth reads; optional Supabase bearer on GET /api/jobs for match scores
- Versioning: /v1/api/* aliases /api/*; API-Version header on list responses
- Rate limits: RateLimit-* + X-RateLimit-* headers; Retry-After on 429
`;
  mkdirSync(join(publicDir, 'docs'), { recursive: true });
  mkdirSync(join(publicDir, 'api'), { recursive: true });
  writeFileSync(join(publicDir, 'docs', 'llms.txt'), docsLlms);
  writeFileSync(join(publicDir, 'api', 'llms.txt'), apiLlms);
  console.log(`  docs/llms.txt ${docsLlms.length} B | api/llms.txt ${apiLlms.length} B`);

  const t1 = Date.now();
  console.log('Generating /llms-full.txt (all curated jobs)…');
  const full = await buildDirectory('full');
  writeFileSync(join(publicDir, 'llms-full.txt'), full);
  console.log(`  llms-full ${full.length.toLocaleString()} B  (${(Date.now() - t1) / 1000}s)`);

  console.log(`Done in ${Math.round((Date.now() - t0) / 1000)}s.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
