# Operating CVin.Bio on Cloudflare Free + Supabase Free

## Deployment architecture

- `cvinbio`: lightweight public gateway, static assets and legacy queue namespace.
- `cvinbio-render`: private Next.js renderer; four SQLite `AppRenderer` actors,
  each admitting four streaming responses, plus the cache revalidation queue.
- `cvinbio-parser`: two SQLite `ParserRenderer` actors, one active response each.
- `cvinbio-images`: two SQLite `ImageRenderer` actors, one active response each.
- The three private workers have no public workers.dev or preview URL. The
  gateway calls their Durable Object bindings directly, preserving the public
  authority, cookies, request bodies, redirects and streamed responses.
- `cvinbio-cache-tags`: D1 Free database for OpenNext cache tags and bounded runtime data.
- Supabase remains the authoritative Postgres database and Auth provider.

R2 and Workers KV are not required. Splitting the Worker is necessary for the Free
compressed-script limit. Company descriptions are generated into 256 static asset
shards, rather than embedding the entire dataset in each Worker. The UI and public
URLs use the existing application routes.

Heavy modules initialize lazily inside the Durable Object request budget. Fixed
path-hashed pools prevent arbitrary crawler URLs from creating unlimited actors;
CV uploads are sharded by client IP. The semaphore releases on stream completion,
cancellation, HEAD and errors; saturation returns `503 RENDER_BUSY` with
`Retry-After: 5`. It retains no session data and starts no keepalive timers.

Upstream fetch deadlines are cancellable through body completion. Never replace
them with `AbortSignal.timeout`: an uncleared 8-second timer was keeping actors
active after successful database calls. Body EOF, cancellation, no-body responses
and failures clear timers; stalled headers/bodies still time out. News responses
discarded on HTTP errors are explicitly cancelled too.

Application and parser actors use the `us` jurisdiction with an Eastern North
America hint because both call Gemini (autofill and resume parsing). A generic
APAC hint can place them in an unsupported Gemini region. Jurisdiction is a
placement constraint, unlike a best-effort hint; derive and resolve IDs through
the same scoped namespace. Image actors retain the APAC hint.

At build time, `generate-static-pages.mjs` extracts only immutable public SSG
HTML and its security headers (23 routes in the October 11 build). Ordinary
browser requests use these assets without initializing Next.js. Auth routes,
actions, RSC, revalidation, negotiated markdown, crawlers, profiles and ISR stay
on the application path. Analytics forwarding uses fixed PostHog origins.

`src/cloudflare/incremental-cache.ts` stores at most 1,024 D1 cache slots, with a
128 KiB maximum value per slot. Full keys are checked so collisions are misses,
never incorrect data. Value storage is bounded to 128 MiB plus metadata.
Large HTML entries are compressed within the same slot limit (maximum decoded
payload 2 MB), so a large company-directory refresh can replace its build-time
snapshot without increasing the storage budget.
Expiry and global invalidation are evaluated by Next/OpenNext; prerendered static assets
remain the fallback. Large query results are paged so their individual pages fit.

## Commands

```sh
npm ci
npm test
npm run cf:build
npx tsc --noEmit
npm run cf:check-size
npm run preview
npm run deploy
```

`npm run deploy` builds all workers, verifies every compressed bundle is below
3,000,000 bytes and the gateway below 100,000 bytes, initializes D1, then deploys
render, parser, images and finally the public gateway. Runtime secrets are copied
from explicit per-worker allowlists. Temporary secret files are removed even
when deployment fails. `cf:build` regenerates binding types after creating the
generated imports, so a fresh checkout does not need build output for typegen.

The OpenNext adapter is pinned to 1.20.2. Its final Cloudflare bundler assumes the
default function directory; `bundle-split-workers.mjs` applies that pass to each
generated split. `patch-opennext-split.mjs` narrows the adapter's OG trace pass to
routes present in the current function. Review both helpers when upgrading.
`npm run upload` uploads versions without activating them; initial setup must use
deploy because it introduces SQLite-backed namespaces. A rollback across the
initial namespace migrations must preserve the new class exports; do not blindly
roll a private worker back to a pre-migration version.

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
  The browser-facing response remains no-store, so zone browser-TTL settings
  cannot turn a short server cache entry into a sticky permanent redirect.
- Full misc sitemaps publish only when both profile and company reads complete.
- A shared D1 origin circuit opens for 30 seconds on API gateway/network failure.
  After cooldown it permits a single recovery probe, instead of letting every
  crawler URL and Worker isolate retry the unavailable PostgREST service.

## Free-plan budgets

These are hard limits, not promises of unlimited traffic:

- Workers Free: 100,000 requests/day across the account, 10 ms CPU/invocation,
  and 3 MiB compressed code per Worker. Static asset requests are free/unlimited.
  Service splitting alone solves code size, not the CPU allowance. The gateway
  performs only routing/static-serving/proxy work; Next.js, CV decoding and
  dynamic images execute inside SQLite Durable Objects.
- D1 Free: 5 million rows read/day, 100,000 rows written/day, 5 GB total storage
  (also observe per-database limits). Cache operations are indexed point reads
  and single-slot writes, not whole-table scans.
- SQLite Durable Objects Free: 100,000 requests/day, 13,000 GB-s duration/day,
  5 million rows read/day, 100,000 rows written/day, 5 GB total storage. Default
  CPU allowance is 30 seconds per invocation. Duration includes pending I/O and
  non-hibernateable idle time, not just CPU; eligible idle objects incur no
  duration usage. At 128 MB per actor, 13,000 GB-s is about 28.2 aggregate active
  actor-hours/day. Eight fixed render actors are a concurrency bound, **not** a
  daily-duration guarantee. The queue uses concurrency 1 and at most 2 retries.
- Supabase Free: 500 MB database/project; 5 GB uncached egress plus a separate
  5 GB cached allowance; 1 GB object storage; 50,000 MAU. Organization usage from
  other projects shares most quotas.

Warn at 300 MB database size, intervene by 400 MB. Review actual billed egress
at a 3 GB/month forecast and intervene by 4 GB. A stored-user count is not MAU,
and HTTP content-length sums are not a billing ledger. Keep raw job descriptions
out of Postgres until a deliberately bounded publishing/enrichment policy is used.

Read aggregate Cloudflare usage (defaults to the last hour, ending 15 minutes
ago to allow ingestion; optional explicit ISO start/end, at most 24 hours):

```sh
node --env-file=.env.local .github/scripts/check-free-tier-usage.mjs
```

This reports gateway CPU in milliseconds, Durable Object duration directly in
GB-s, errors/memory, account-wide UTC-day counters and clearly labelled window
extrapolations. Check both request budgets, DO duration and D1 operations. Review
at 70% of a daily allowance and intervene at 80%; never infer compliance from
successful requests or compressed bundle size alone. No-data values remain null.
During rollout, Durable Object counters arrived over ten minutes after the
gateway CPU metrics; do not extrapolate from a partially ingested window.

References: [DO pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/),
[DO CPU limits](https://developers.cloudflare.com/durable-objects/platform/limits/),
[hibernation](https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/).

## Ingestion and maintenance

- Default: at most 500 new jobs/run, inserts of 75 rows with concurrency 2.
- Failed dedup reads stop inserts; failed writes/cleanup/rebuild/publication fail
  the workflow. A green run must represent a completed pipeline.
- Company rebuilds prove source completeness using SQL group counts, RPC exact
  counts, or a fully counted keyset scan. This permits legitimate large expiry
  contractions (including a genuinely empty window) while rejecting truncated
  or malformed results. Successful rebuilds invalidate public directory caches.
- Insert retries distinguish duplicate jobs from slug collisions. Slug retries
  use distinct, deterministic suffixes and a bounded retry count; infrastructure
  errors still fail the workflow instead of silently discarding records.
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

Deployment `1f489444` passed CI and deployed all three workers at 07:41 UTC.
Live checks returned 200 for jobs, company HTML, PNG previews and sitemap XML;
OAuth responses were private/no-store and cache invalidation endpoints rejected
unauthenticated requests. A subsequent three-minute Supabase gateway sample had
no error responses and no old exact-slug/external-ID lookup shape on jobs.

**Remaining budget evidence:** the management API cannot expose billed org
egress with a personal access token (the dashboard usage endpoint rejects it).
Also, an initial five-minute post-deployment Cloudflare sample (41 main-worker
requests) reported median CPU 253.8 ms and p99 1,019.5 ms. The API confirms these
metrics are in microseconds. The sample includes cold starts and is not a steady
state forecast, but it exceeds the strict Workers Free 10 ms CPU allowance.
Bundle-size compliance and zero observed errors do not certify CPU compliance.
Further CPU reduction/static-serving work is needed before declaring the whole
stack reliably free-tier-ready. Supabase capacity/health and Cloudflare CPU are
separate downgrade considerations.

## Verification after the Supabase downgrade

At 11:23 UTC on October 11 the organization API confirmed `plan: free`, all four
services were healthy, the database was writable, and there were no lock waiters.
Live public pages, job search, images and sitemaps returned successful responses.
A synthetic account passed sign-in, session verification, owner profile insert
and update, public reads, authenticated cache invalidation and account deletion.
The account and its profile were removed afterwards. A synthetic CV upload
returned a structured result via the regex fallback parser.

Two scheduled maintenance failures were application-level regressions:

- The expiry job successfully removed 2,241 old unenriched jobs, but its company
  rebuild then rejected the legitimate 193-to-34 company contraction. Completeness
  checks now distinguish a verified contraction from a truncated response.
- Import recovery encountered a second uniqueness conflict after reminting a
  slug. Every individual response is now classified, duplicate jobs are skipped,
  and actual slug collisions get distinct bounded retries.

The verified company rebuild completed in 2.8 seconds on Free, preserving company
pages while zeroing inactive role counts. Native Cloudflare preview testing also
verified a 231 KB directory page could be stored and read as an 85 KB compressed
cache entry after invalidation, retaining the 128 KiB per-slot storage cap.

## October 11 CPU migration verification

Before the CPU migration, the 14:32–15:32 UTC sample reported 1,113 successful
main-worker invocations with median CPU 41.535 ms and p99 1,169.540 ms, plus
63 `exceededResources` failures. Image-worker median CPU was 106.424 ms.
These measurements establish the need to move rendering out of the gateway.

Local checks for the new architecture: 327 passing tests, one credential-dependent
skip, successful TypeScript and 23-file OG style checks. The OpenNext build clears
its output before rebuilding; all generated gateway imports and binding types
were recreated successfully. Compressed bundles: gateway 9.64 KiB, application
2,845.76 KiB, parser 2,900.60 KiB, images 1,877.74 KiB.

Four-worker native preview passed static HTML/security headers/HEAD, dynamic
pages, APIs, markdown, RSC, social PNGs, parser validation and OAuth callback
routing. Two concurrent synthetic users received separate private personalized
responses. The account lifecycle passed sign-in, verified session, profile
save/update, authenticated invalidation, public reads and deletion; synthetic
records were removed. Wrangler's custom-domain preview rewrites local authority
to `http://cvin.bio`, so the local origin-check fixture uses that origin; production
continues to require the actual `https://cvin.bio` origin.

Production CPU and Durable Object duration must be checked after activating this
migration using `check-free-tier-usage.mjs` and an entirely post-deployment window.

### Production result after deadline cleanup

The rollout completed in three application commits: `1574a656` (gateway/object
pools), `3d030359` (Gemini-supported US placement), and `9a075f95` (cancellable
upstream deadlines). The final deployment completed at 16:16 UTC:
[successful CI run](https://github.com/vedangvatsa/PDFtoWebsite/actions/runs/38154400785).
Regression checks passed 335 tests with one credential-dependent skip; typecheck,
OG styles, clean build and all compressed-size gates passed.

The completed 16:17–16:25 UTC window was queried after 16:40 UTC to allow Durable
Object analytics to arrive. It includes synthetic functional verification:

| Metric | Observed result | Free allowance |
| --- | --- | --- |
| Successful gateway CPU p50 / p99 | 1.344 / 5.423 ms | 10 ms per invocation |
| Gateway invocations / resource errors | 153 / 0 | 100,000 requests/day |
| DO requests, projected at window rate | 27,180/day | 100,000/day |
| DO duration | 41.764 GB-s over 8 minutes; 7,518/day at that rate | 13,000 GB-s/day |
| DO CPU / memory / fatal-limit errors | 0 / 0 / 0 | No quota failures |
| Largest DO isolate memory p99 | 59.8 MB | 128 MB |
| D1 reads / writes, projected at window rate | 280,080 / 80,280 per day | 5 million / 100,000 per day |

The quieter 16:21–16:25 follow-up projected 4,655 GB-s/day of DO duration and
56,880 D1 writes/day. Actual UTC-day counters through 16:25 were 15,333 Worker
requests, 848 DO requests, 352.487 GB-s DO duration, and 16,047 D1 writes. These
are short-window observations, not a promise about future traffic. Continue to
use the usage command above for daily capacity checks.

DO invocation analytics also classify cancelled response streams as
`clientDisconnected` (34 in the eight-minute window); do not relabel those as
CPU failures or claim zero errors of every kind. Redirect/HEAD handling cancels
upstream bodies deliberately. One transient `RENDER_BUSY` response was observed
during the earlier cold US rollout; subsequent full live smoke checks passed.

Final live checks passed public pages, companies, search, PNGs, markdown, RSC,
sitemaps, API aliases, authenticated invalidation and origin rejection. Two
concurrent synthetic users retained separate private results, and account
save/update/read/delete plus AI autofill passed with synthetic cleanup. Gemini
extracted the synthetic candidate's name, experience and skills from an image;
text and PDF uploads also used the AI parser after the regional correction.
Safari verified static-homepage hydration, client navigation to jobs and a
submitted `engineer` search showing 32 results without a degraded-state error.
