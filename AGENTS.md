# AGENTS.md

Instructions for AI coding agents working in this repository.

## What this is

CVin.Bio — a Next.js 16 (App Router, Turbopack) job board + CV-to-website product deployed to Cloudflare Workers via `@opennextjs/cloudflare` + wrangler.

## Commands

- Typecheck: `npx tsc --noEmit`
- Tests: `npm test` (node:test via tsx; suites live next to the code as `*.test.ts`)
- Dev: `npx next dev --turbopack -p 3210` (loads `.env.local`; Cloudflare bindings via `initOpenNextCloudflareForDev`)
- Deploy: push to `main` — GitHub Actions (`deploy-cloudflare.yml`) builds and deploys; it also regenerates `public/llms*.txt` via `scripts/generate-llms.ts`

## Conventions

- Machine-readable agent surface lives in: `src/middleware.ts` (UA allowlist + markdown negotiation), `src/lib/agent-markdown.ts`, `src/lib/agent-negotiation.ts`, `src/app/md/[page]/route.ts`, `src/app/openapi.json/route.ts` (spec source: `src/lib/openapi-spec.ts`), `src/app/mcp/route.ts` (+ `src/lib/mcp-tools.ts`, `src/lib/mcp-rpc.ts`), and static files under `public/.well-known/`.
- API errors are always JSON `{ error, code, hint }`; codes belong in the `ErrorEnvelope` enum in `src/lib/openapi-spec.ts`.
- Never commit personal-data artifacts: `.github/scripts/email-logs.json`, `scripts/cvinbio-jobs-export*.csv`, enrichment state JSONs (see `.gitignore`). These were purged from history once already.
- No bulk exports of user profile data anywhere (pages are per-profile only).
- UI changes require explicit user approval; agentic work must stay invisible (files, headers, metadata, negotiation).
