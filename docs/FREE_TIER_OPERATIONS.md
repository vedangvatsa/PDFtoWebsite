# Operating CVin.Bio on Cloudflare Free + Supabase Free

## Deployment architecture

- `cvinbio`: public Next.js site and APIs, static assets, cache revalidation queue.
- `cvinbio-parser`: service-bound CV parsing routes. No public workers.dev URL.
- `cvinbio-images`: service-bound social-preview image routes. No public workers.dev URL.
- `cvinbio-cache-tags`: D1 Free database for OpenNext cache tags and bounded runtime data.
- Supabase remains the authoritative Postgres database and Auth provider.

R2 and Workers KV are not required. Splitting the Worker is necessary for the Free
compressed-script limit. Company descriptions are generated into 256 static asset
shards, rather than embedding the entire dataset in each Worker. The UI and public
URLs use the existing application routes.

`src/cloudflare/incremental-cache.ts` stores at most 1,024 D1 cache slots, with a
128 KiB maximum value per slot. Full keys are checked so collisions are misses,
never incorrect data. Value storage is bounded to 128 MiB plus metadata. Expiry
and global invalidation are evaluated by Next/OpenNext; prerendered static assets
remain the fallback. Large query results are paged so their individual pages fit.

## Commands

```sh
npm ci
npm test
npm run cf-typegen
npx tsc --noEmit
npm run cf:build
npm run cf:check-size
npm run preview
npm run deploy
```

`npm run deploy` builds all workers, verifies every compressed bundle is below
3,000,000 bytes, initializes D1, deploys the private workers first, then switches
the public worker. Only the required Supabase/AI secrets are copied to private
workers. Temporary secret files are removed even when deployment fails.

The OpenNext adapter is pinned to 1.20.2. Its final Cloudflare bundler assumes the
default function directory; `bundle-split-workers.mjs` applies that pass to each
generated split. `patch-opennext-split.mjs` narrows the adapter's OG trace pass to
routes present in the current function. Review both helpers when upgrading.
`npm run upload` uploads versions without activating them; initial setup must use
deploy because it introduces the SQLite-backed queue namespace.

The Supabase migration `20261009105804_free_tier_efficiency.sql` was applied and
verified on 2026-10-09. It is additive for sitemap data and restricts internal
event/RPC access to the backend. It retains user data and username uniqueness.
Apply it before deploying the sitemap reader to a different database.

## Cache correctness

- Jobs API envelopes are private/no-store; only public query results are shared.
- Browser profile saves invalidate `public-profiles` after successful writes.
  Auth completion and account deletion invalidate it too, including old slugs.
- Ingestion invalidates `public-jobs` through the authenticated cache endpoint.
- No timeout is cached as a missing job/profile. Cold unavailable lookups fail
  instead of creating a permanent redirect for a live record.
- Anonymous, non-RSC stale-job redirects have a 60-second Cache API shortcut.
- Full misc sitemaps publish only when both profile and company reads complete.
- A shared D1 origin circuit opens for 30 seconds on API gateway/network failure.
  After cooldown it permits a single recovery probe, instead of letting every
  crawler URL and Worker isolate retry the unavailable PostgREST service.

## Free-plan budgets

These are hard limits, not promises of unlimited traffic:

- Workers Free: 100,000 requests/day across the account, 10 ms CPU/invocation,
  and 3 MiB compressed code per Worker. Static asset requests are free/unlimited.
  Service splitting solves code size; it does not increase account request or
  CPU allowances. Monitor CPU on document decoding and dynamic image rendering.
- D1 Free: 5 million rows read/day, 100,000 rows written/day, 5 GB total storage
  (also observe per-database limits). Cache operations are indexed point reads
  and single-slot writes, not whole-table scans.
- SQLite Durable Objects are available on Free; the queue uses concurrency 1
  per queue object and at most 2 retries to bound revalidation work.
- Supabase Free: 500 MB database/project; 5 GB uncached egress plus a separate
  5 GB cached allowance; 1 GB object storage; 50,000 MAU. Organization usage from
  other projects shares most quotas.

Warn at 300 MB database size, intervene by 400 MB. Review actual billed egress
at a 3 GB/month forecast and intervene by 4 GB. A stored-user count is not MAU,
and HTTP content-length sums are not a billing ledger. Keep raw job descriptions
out of Postgres until a deliberately bounded publishing/enrichment policy is used.

## Ingestion and maintenance

- Default: at most 500 new jobs/run, inserts of 75 rows with concurrency 2.
- Failed dedup reads stop inserts; failed writes/cleanup/rebuild/publication fail
  the workflow. A green run must represent a completed pipeline.
- Company rebuilds accept the current small inventory but reject empty results,
  incomplete scans, or a >50% unexpected drop in active companies.
- Sync uses `cleanup-old-jobs.mjs`, which protects described/curated jobs and
  Telegram-posted links, and rechecks guards at delete time.
- Do not restart the old high-concurrency enrichment daemon under the free-tier
  policy. CI currently uses the bounded thin-record/apply-out model.
- Do not delete all "unused" indexes, bulk-delete profiles, or schedule routine
  VACUUM FULL. The migration removes only confirmed redundant indexes.

## Verification performed

- Local Cloudflare runtime: cached board API and stale-job redirects, split
  parser's validation response, PNG social previews, OAuth private headers,
  and complete misc sitemap.
- PGlite migration rehearsal: owner-only profile writes, internal RPC grants,
  retained unique constraint, sitemap keyset/eligibility including malformed
  legacy JSON, newest-stamp job statistics, bounded counters.
- Live Supabase after migration: 1,802 profiles and 2,443 jobs retained; internal
  anonymous event inserts/counter calls denied; sitemap RPC returns 250-row pages;
  duplicate-index and RLS performance warnings cleared.

Continue to observe production error rates and CPU after deployment. Cached
local timings establish that caching works, not a measured monthly usage forecast.

## October 11 recovery check

The old September 15 application deployment was still active during the incident.
At 07:24 UTC, the Supabase health API reported DB/Auth/REST/Storage healthy. SQL
confirmed a database restart at 07:15 UTC, 54,668,435 bytes in the application
database, 1,803 profiles, 2,443 jobs, 17 connections and no lock waiters. Both
exposed schemas were present. The organization remained Pro and its billing
add-ons endpoint reported no selected add-ons. Monthly billed egress still needs
checking in the organization's Usage screen before a downgrade is cleared.
