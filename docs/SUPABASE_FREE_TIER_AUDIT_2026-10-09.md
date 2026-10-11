# CVin.Bio: Supabase free-tier audit

Date: 2026-10-09. Repository: `PDFtoWebsite`.

## Conclusion

**The current dataset fits comfortably within Supabase Free. The immediate problem is reliability and unnecessary database work, especially requests for missing job URLs, rather than database capacity.** Keep Supabase as the transactional source of truth and Auth provider; serve public reads from a functioning Cloudflare cache. Fix cache isolation before adding shared caching.

This is an investigation and implementation plan. Remote inspection used read-only SQL, aggregate logs, advisors, GitHub run inspection, and three public HTTP requests. No application changes, migrations, deployments, or data deletions were performed.

## Scope and confidence

- Fast-forwarded `main` from `d639e9d2` to `b63876c5` with `git pull --ff-only`. Existing local edits and untracked files were preserved.
- Matched the local Supabase hostname to the hostname in live gateway logs: `mkrwlyjjlngzozekkmec.supabase.co`.
- Fixed log window: **2026-10-08 10:20 UTC through 2026-10-09 10:20 UTC**.
- Database measurements were taken around 10:22–10:33 UTC on October 9; values may change.
- `pg_stat_statements` reset on **2026-09-29 08:57:25 UTC**. Its counts are cumulative since that time, not daily counts.
- Source findings describe the pulled working tree. The existing local `jobs-sync.mjs` modification adds an opt-in company/tech-role filter; the findings below concern surrounding code, not that modification.
- The latest listed deployment workflow ran September 15. Its Worker deployment and live canary succeeded; the later Google Indexing step failed. GitHub run status alone does not prove a deployment failed. Manual deployments were not independently enumerated, so the exact live commit is unverified.
- Monthly billed egress, organization subscription, CPU/RAM time series, disk/WAL usage, and billing MAU were not available through this audit's access. Do not infer a quota breach or a specific CPU/memory failure from request counts alone.

## Current capacity and health

| Measure | Observed | Interpretation |
| --- | ---: | --- |
| Application database size | 55,381,139 bytes / 52.8 MiB | Well below the 500 MB quota |
| Sum across all three databases, including templates | 70,496,433 bytes / 67.2 MiB | Also comfortably below quota; distinguish from full disk/WAL usage |
| Profiles | 1,802 | Exact count, not table-statistics estimate |
| Auth users | 1,852 | Registered accounts, not MAU |
| Users with `last_sign_in_at` within 30 days | 30 | Activity proxy only; billed MAU also includes token refreshes |
| Jobs | 2,443 | All currently have company keys and slugs |
| Companies | 187 | Current directory size |
| Curated jobs / stored descriptions | 0 / 0 | Current pipeline deliberately inserts thin apply-out records |
| Storage objects | 0 | Supabase file storage is not the present bottleneck |
| Email-open rows | 18,544 | Only 9 created in the last 30 days |
| Current connections | 17 / 60 maximum | One active connection at sampling; no lock waiters |
| Gateway requests in fixed 24 hours | 128,011 | About 1.48/second on average; count alone does not establish overload |
| Gateway 5xx responses | 2,215 / 1.73% | Includes 504 and 522 errors |
| Successful GETs with empty-result ranges | 121,814 of 125,607 / 97.0% | `Content-Range` exactly `*/*` or `*/0`; excludes HEAD responses |
| Peak requests per minute | 828 | Bursts matter more than daily averages |
| Minutes with a 5xx | 530 | Errors were not confined to one short incident |

Some `pg_stat_user_tables.n_live_tup` values were misleading: profiles reported 4 and companies 0, whereas exact counts were 1,802 and 187. Planner estimates (`pg_class.reltuples`) were much closer. Do not design cleanup or capacity decisions around those statistics alone.

Largest application relations, including indexes/TOAST:

| Relation | Allocated size | Index portion |
| --- | ---: | ---: |
| `profiles` | 20.45 MiB | 0.33 MiB |
| `email_opens` | 6.95 MiB | 2.45 MiB |
| `jobs` | 4.81 MiB | 3.16 MiB |
| `companies` | 0.12 MiB | 0.05 MiB |

The logs also contain 303 PostgreSQL statement-timeout errors, 754 occurrences of `Warp server error: Thread killed by timeout manager`, 52 schema-cache load timeouts, and 45 PostgREST pool initializations. Even a settings query was logged taking about 13.6 seconds. This establishes intermittent backend distress, but CPU/RAM/IO metrics are still needed to distinguish resource pressure from platform or network problems. Increasing timeouts is not an adequate primary fix.

## Verified free-tier limits

Current official documentation, checked October 9, 2026:

| Resource | Free allowance | Project relevance |
| --- | --- | --- |
| Database | 500 MB per project | Not close at present; exceeding the limit can cause read-only mode |
| Uncached egress | 5 GB per billing cycle | Database/API traffic and other services share this allowance |
| Cached egress | Separate 5 GB per billing cycle | Not an extra 5 GB usable for ordinary uncached database queries |
| Object storage | 1 GB | Currently unused |
| Auth | 50,000 MAU | Sign-ins and refreshes, not anonymous visitors or stored profile count |
| Edge Functions | 500,000 invocations | App routes/AI parsing run on Cloudflare; no function invocation log source appeared in the sampled day |
| Realtime | 2 million messages; 200 peak connections | No application subscriptions found in the inspected source |

Most usage allowances are organization-wide; database allowance is per project. Usage from another project in the same organization can matter. Free projects can be paused for low activity over seven days, and downloadable platform backups are not included. These are availability constraints even if code is efficient.

**Egress is not proven to be high today.** Most observed responses were empty. Gateway content-length fields summed to only 624,167 bytes, but they were absent for some responses and do not constitute a billing ledger. Use the organization Usage page for the actual monthly total; do not multiply 128,011 requests by an assumed full job/profile payload.

## Findings, ordered by priority

### P0 — Correct cache boundaries before turning caching on

Evidence:

- `next.config.ts:176–192` gives `/jobs/:id` and **every two-segment path** `/:slug/:jobSlug` a 30-day shared/CDN TTL.
- That second rule includes `/api/jobs`, `/auth/callback`, and unrelated two-segment routes.
- `src/app/api/jobs/route.ts:119–148,546–560` computes user-specific matches and returns `userSkills` and `profileComplete`, yet applies shared-cache headers.
- Job pages call `getViewerJobContext()`, which reads cookies and includes user context in the rendered payload (`src/lib/job-detail-data.ts:426–471`). A route-level `revalidate` declaration does not make that personalized render public-cache-safe.
- Two anonymous live reads of `/api/jobs?limit=1` both returned `Cache-Control: public, max-age=3600, s-maxage=2592000, stale-while-revalidate=86400`, confirming the broad rule affects the live API. No cache-hit header was exposed; headers alone do not prove an edge hit.
- `/openai` returned `private, no-cache, no-store, max-age=0, must-revalidate` and took about 2.76 seconds in the single sample.

Implementation:

1. Replace the generic two-segment caching rule with explicit public route/cache handling. Auth, editor, admin, token-bearing and personalized responses must have consistent `private, no-store` behavior across Cache-Control and CDN-specific headers.
2. Cache **public job/company data**, independently of viewer context. Keep personalized HTML private unless a tested public/private rendering split is introduced.
3. For `/api/jobs`, share only a provably anonymous/public representation. Any response containing matching context stays private. Include all output-affecting filters in cache keys; do not store per-client rate-limit state in a shared response.
4. Respect RSC versus HTML versus markdown representations. A blanket HTML response cache that ignores representation is unsafe.
5. Purge any old shared entries for affected routes when changing policy.

Acceptance: anonymous and authenticated callers cannot receive each other's representation; auth callbacks and mutations are never shared; headers reflect the intended TTL; warm public reads demonstrably avoid Supabase.

### P1 — Install a writable runtime cache

Evidence:

- `open-next.config.ts:7–12` selects `static-assets-incremental-cache`.
- The installed implementation explicitly says it is only for prerendered data; `set()` and `delete()` only log read-only errors (`node_modules/@opennextjs/cloudflare/dist/api/overrides/incremental-cache/static-assets-incremental-cache.js:9–40`).
- `src/lib/job-snapshots.ts:111–132` expects 300-second `unstable_cache` entries.
- `src/lib/company-page.ts:82–238` expects 900-second runtime entries.
- `wrangler.jsonc` has no R2 incremental-cache, revalidation queue, or tag-cache binding.
- Public profiles use React `cache()` (`src/lib/supabase-server.ts:192–193`), which deduplicates a render, not reads across visitors.

Recommended architecture:

```text
Public requests
  -> Cloudflare public-data cache / published job-route manifest
  -> Supabase only on a controlled miss or refresh

Signed-in editor and Auth
  -> Supabase with user authorization

Scheduled ingestion
  -> bounded DB writes
  -> publish updated public job/company snapshots and route aliases
  -> invalidate affected cache keys
```

Use the supported OpenNext R2 incremental cache with a Durable Object revalidation queue. Add the supported tag cache when using `revalidateTag`/`revalidatePath` (the admin analytics route already uses a tag). Adapt the deploy workflow: it currently populates static-asset cache files and runs raw `wrangler deploy`; the new cache needs supported deployment-time population, such as OpenNext's deploy/upload flow. A configuration-only adapter switch is incomplete.

Start with these **proposed**, measurable policies:

| Data | Freshness target | Failure behavior |
| --- | --- | --- |
| Public job detail | 5–15 minutes; invalidate after relevant writes | Last good snapshot, with expiry evaluated correctly |
| Public company list/detail | 15–60 minutes | Last good snapshot |
| Anonymous board/filter results | 1–5 minutes, bounded keys | Last good result, not a cached empty outage |
| Public profile | Per-slug 5-minute cache, invalidate on save/rename/delete | Retain missing vs unavailable distinction |
| Confirmed missing job/alias | 5–15 minutes | Cache only a confirmed miss, never a timeout |
| Sitemaps/aggregate statistics | Hourly or publication-triggered | Last complete generation |

Use bounded stale windows and single-flight refreshes so concurrent misses do not stampede the database. Per-profile cache entries must contain only the existing public projection; this is not a bulk profile-export feature. Cache invalidation must cover browser-originated editor writes, not just server API writes.

The existing `withSitemapCache` uses Cloudflare Cache API directly and therefore is separate from the broken runtime adapter. However, Cache API entries are local to a data center; `stale-while-revalidate` headers do not implement SWR for `cache.match`/`cache.put`. A shared backing snapshot or explicit refresh mechanism is needed for last-good behavior across regions.

R2 Standard currently includes 10 GB-month storage, 1 million Class A and 10 million Class B operations/month, with free egress. This is a good fit for small public snapshots and avatars, but Workers/DO/D1 usage must be budgeted separately; Supabase Free does not imply the entire stack costs zero.

### P1 — Replace expensive missing-job resolution with direct aliases/tombstones

Daily jobs-query breakdown:

| Query shape | Requests | 504s |
| --- | ---: | ---: |
| Exact external ID | 23,151 | 617 |
| Exact slug | 22,864 | 561 |
| Company-key list | 18,857 | 126 |
| Company-name list | 18,135 | 52 |
| Legacy external-ID prefix | 11,349 | 298 |
| Legacy slug prefix | 11,333 | 276 |
| Other | 1,340 | 4 |

Root path:

- `src/lib/job-snapshots.ts:68–107` loops over aliases and the short slug, querying external ID and then slug individually.
- `src/app/[slug]/[jobSlug]/page.tsx:65–161` follows a miss with two prefix searches per company alias, plus company-key and company-name candidate scans.
- Metadata and page rendering both call this resolution path (`:163–197`), without an explicit request-memoized legacy resolver.
- For an ordinary one-prefix miss, one loader/fallback pass can issue eight jobs queries, plus later company redirect checks. Alias-rich paths can issue more.
- Since September 29, the two legacy prefix shapes ran **265,265 and 265,262 times**, consuming about **1,134 and 522 seconds** of execution time respectively.
- A read-only `EXPLAIN ANALYZE` of an absent `openai_swe%` slug scanned all 2,443 jobs. Its execution was only about 2 ms in that sample: the problem is repeated unnecessary work and many round trips, not evidence that this individual scan always takes seconds.

Implementation:

1. Build a compact **public jobs-only** route/alias map during ingest/publication. Resolve old paths directly to a job, canonical path, or known removal destination at Cloudflare.
2. Persist historical aliases/tombstones before removing records. Preserve existing closed-page/redirect behavior and company ownership checks.
3. Batch exact identifier candidates into at most two indexed queries (`external_id IN (...)`, `slug IN (...)`) while preserving current external-ID precedence.
4. Request-memoize the complete resolution result for metadata and page rendering.
5. Move fuzzy legacy discovery to a one-time/offline backfill rather than every visitor request. Negative-cache confirmed misses, with bounded key sizes/cardinality and invalidation on new publication.
6. Represent `found`, `missing`, and `unavailable` separately. Current job loaders turn timeouts into `null`, which can trigger more scans and permanent redirects; profile lookup already has a better tri-state contract to follow.

Negative caching alone is insufficient: the day contained 7,725 distinct exact-external-ID query strings and about 4,500 distinct strings for each prefix shape. A published route map prevents database work even for first-time crawls of old URLs.

### P1 — Make deadlines cancel work and prevent retry amplification

`src/lib/db-timeout.ts:60–73` races the query against a timer but never aborts its request. Profile lookup can start a retry while the first request continues. Company paging retries timed-out pages up to twice (`src/lib/company-page.ts:109–122`).

Pass an AbortSignal through query factories and Supabase builders. Use a total request deadline, bounded concurrency, jittered retries where justified, and a brief circuit-breaker/last-good fallback during backend outages. Abort on the client side does not replace database statement timeouts; retain an appropriate server-side budget too. Do not retry each stage of a missing-job waterfall.

The job tracking endpoint compounds an RPC failure into up to 100 read/write requests for 50 IDs (`src/app/api/jobs/track/route.ts:29–36`). Replace that fallback with a bounded retry/queue or a documented best-effort counter policy. Analytics must not amplify a database outage.

### P1 — Repair ingestion's correctness and health signals

Existing protections are useful: 500-new-job cap per run, 75-row insert batches, database write concurrency 2, bounded dedup reads, no raw ATS descriptions, and roughly every-other-day sync. Keep those protections.

Concrete failures:

- October 9 sync is green, but its logs show `fetchExistingKeys HTTP 522`, three insert batch errors, cleanup `522`, and a failed company rebuild. The dedup fetch then reports zero existing keys and treats 218 jobs as new. `fetchExistingKeys` breaks on non-OK responses and returns partial sets (`jobs-sync.mjs:255–304`). Failed reads must not be treated as complete empty inventories.
- `rebuild-companies.mjs:386–395` defaults to a minimum of **1,000 companies**. October 4's cleanup run successfully completed the cleanup step, then failed because its valid 193-company rebuild was below that threshold. The current stored directory has 187 companies. The latest three cleanup workflow runs are marked failed.
- The sync wrapper logs company rebuild failure but still exits successfully (`jobs-sync.mjs:2849–2863`).
- Same-run enrichment is explicitly disabled at `jobs-sync.mjs:2865`, although the workflow title/env still refer to enrichment. Zero stored descriptions and zero curated tags corroborate the current thin-record model.
- `run-enrich-daemon.sh:27–30` is a separate potential writer: four workers × concurrency 40, `RE_ENRICH=1`, and a 9,999-day window. Its launchd service was **not loaded** at inspection; do not attribute current load to it. If re-enabled, it would bypass the intended small-write budget.

Implementation:

1. Treat failed/partial dedup reads as unavailable and stop/retry that phase; never proceed with a fabricated empty set.
2. Replace the fixed 1,000-company floor with a guard based on the current bounded inventory, query completeness, and a reasonable maximum drop from the previous successful generation. Preserve the previous directory on failure.
3. Make required ingestion/cleanup/publication failures return a failing exit status. Report inserted/skipped/failed rows and the last successful publication timestamp.
4. Use one coordinated writer budget across CI and any local daemon. Start with 1–2 concurrent DB writes and lower enrichment concurrency if enrichment is deliberately restored. External ATS-fetch concurrency is distinct from DB concurrency.
5. Request only inserted IDs (or minimal responses when IDs are not needed), rather than whole-row `return=representation` payloads.
6. Align jobs, directory counts, and snapshots on the existing newest-of-published/created date rule. In this snapshot 2,443 jobs are inside the current OR-date window versus only 450 under `coalesce(published_at,created_at)`. Changing this rule silently would materially change the product.

### P2 — Slim the sitemap and other repeated reads

- `src/app/sitemap-misc.xml/route.ts:51–75` fetches full `about`, skills, experience and education just to decide whether a profile belongs in the sitemap. The full current projected corpus serializes to about **7.24 MB** before transport compression. This aggregate was computed in SQL; no profile corpus was exported.
- That query shape has 111 calls since the stats reset, mean execution about **1.4 seconds**, and 26,268 temporary blocks written. `.limit(5000)` is also subject to the project's PostgREST max-row setting; a larger client limit does not guarantee all rows are returned.
- Move indexability calculation to a maintained scalar flag or a narrowly scoped SQL function that returns **only username and updated_at**. Page by a stable key, publish one complete XML snapshot, and update after relevant profile writes.
- `withSitemapCache` only tests whether XML contains any `<loc>`. The misc sitemap always has static entries, so missing profile/company data can still produce a cacheable partial sitemap. Track completeness explicitly and retain the previous complete version on upstream failure.
- `loadCompanyJobs` fetches up to 2,000 jobs with exact counts and additional description hydration. Populate public display eligibility/word counts during ingestion so card lists do not need full descriptions as curated content returns. Cache company directory/about resolution together and request-memoize it.
- `/api/jobs` already selects slim card columns, but fetches 3× the page size. Its opaque cursor contains an offset (`src/lib/cursor.ts`), not a database keyset. Preserve interleaving behavior now; adopt stable `(published_at,id)` keyset pagination only when needed and explicitly test ordering/filter semantics.
- Keep keyword-search work bounded. Do not add broad trigram/full-text indexes to every text column before measuring actual search load; indexes have storage/write costs too.

### P2 — Move avatars out of profile rows

Measured:

- **611 embedded data-URL avatars** totaling **9,835,237 bytes** (~9.38 MiB of encoded text).
- Mean full profile JSON is about 11.8 KB; maximum is about 87.3 KB.
- `avatar-cropper.tsx:43–58` emits a 200×200 JPEG data URL.
- `src/app/api/avatar/[slug]/route.ts:21` loads the full public profile, and the embedded-image branch explicitly sends `no-store` (`:69–83`).

Upload compressed image bytes to object storage and store only the object URL/key and version in Postgres. R2 is a natural fit with the proposed cache backend; Supabase Storage also has ample capacity today, but its downloads consume Supabase bandwidth quotas. Serve immutable/versioned URLs and delete superseded objects with a bounded lifecycle policy.

Migrate one profile at a time: copy, verify the image, update the pointer, preserve compatibility until verified. Do not create a bulk profile export. Initially, even a slim avatar-only query plus correct versioned caching reduces unnecessary profile JSON transfer.

The encoded bytes are not an exact estimate of reclaimed on-disk space because Postgres compresses/TOASTs values and reuses allocated pages. Avoid promising a 9.38 MiB immediate shrink or running `VACUUM FULL` routinely.

### P2 — Close direct database quota-abuse paths

This matters to Free because bypassing the app also bypasses its cache and rate limiter.

- Live `email_events` has an `allow_all` policy for ALL commands with `USING true`; anon has SELECT/INSERT/UPDATE/DELETE grants. This is a concrete unrestricted table, not merely an advisor warning. The app's writer is the server-side email tracking route. Restrict it to its intended backend access.
- `contact_submissions` permits public inserts; a caller can bypass the app's email/contact validation. Prefer the existing bounded server endpoint as the write boundary.
- Advisors confirm anon/authenticated can directly execute `batch_increment_jobs`, `increment_views`, and `jobs_company_stats` as SECURITY DEFINER. The stats function sets a 120-second statement timeout. Restrict internal RPC execution to intended server roles, set safe search paths, and validate bounds. Keep the intended profile editor access intact.
- Public SELECT on jobs/companies also allows bypassing Cloudflare. The inspected application reads those through server routes. Audit every consumer, then consider backend-only table reads or a constrained public API. Public profile reads require separate handling because the editor currently uses Supabase directly.
- `rate-limit.ts:14–18` is per-isolate memory. Its comment asserting one isolate per deployment is incorrect. Use Cloudflare's supported rate-limiting primitive for local protection or a coordinated limiter where a strict global budget is required; cover HTML misses as well as `/api/jobs`.

The sampled traffic is overwhelmingly the server Supabase client (127,901 requests identify `supabase-js-node/2.99.3`), not proof of direct-key abuse. Original browser/crawler identity was not forwarded in those log fields, so attribution to a specific bot is unverified.

### P3 — Index/RLS cleanup and lifecycle budgets

Confirmed duplicate index groups:

- `jobs`: `idx_jobs_tags` / `jobs_tags_gin_idx` (352,256 bytes each).
- `jobs`: `idx_jobs_dedup_hash` / `jobs_dedup_hash_idx` (196,608 bytes each), plus an existing unique dedup-hash index.
- `profiles`: `profiles_username_key` / `profiles_username_unique` (90,112 bytes each), plus a nonunique username index.

Removing just one member of each exact duplicate pair saves roughly **0.61 MiB** currently. Useful for write efficiency, but not the main fix. Inspect constraint dependencies and representative plans before removing anything; preserve unique constraints and indexes supporting FK/rare maintenance workloads. Do not delete every advisor-labelled unused index.

The advisor reports five auth/RLS per-row initialization warnings and overlapping permissive policies. Use role-scoped policies, `(select auth.uid())` where appropriate, and consolidate redundant policies without changing access. These are secondary to cache/miss handling, especially for service-role reads that bypass RLS.

Keep a deliberate lifecycle:

- Active jobs bounded to the existing product window; retain curated closed pages/posted links according to `docs/JOB_PAGE_RULES.md` and the cleanup protections.
- Archive public job bodies/snapshots outside the hot database when justified, and preserve cheap aliases/tombstones before cleanup.
- Aggregate old email events and expire raw events under an explicit retention period, e.g. 30–90 days. `email_opens` is historical accumulation, not a current high write rate.
- Prune parse logs only beyond the period needed for rate limiting/operations.
- Let ordinary autovacuum reuse dead-tuple space; investigate bloat before disruptive maintenance. Deletion does not instantly shrink allocated database files.

## Implementation order and acceptance targets

### Phase A: correctness and biggest read amplification

1. Fix public/private cache boundaries and confirm effective live headers.
2. Add writable OpenNext caching and its deploy population, plus observability for cache status and DB-call count.
3. Batch/memoize exact resolution; add route aliases/tombstones and confirmed-miss caching.
4. Preserve `unavailable` separately and implement abortable deadlines/bounded retries.

### Phase B: stable publishing and smaller reads

5. Repair ingestion exit statuses and company-count guard; ensure snapshot publication is based on a complete successful run.
6. Slim sitemap generation and publish complete snapshots.
7. Remove outage-amplifying analytics fallbacks and restrict internal database write/RPC surfaces.
8. Move avatars to versioned object storage.

### Phase C: capacity housekeeping

9. Consolidate proven duplicate indexes and redundant RLS policies in reviewed migrations.
10. Add retention/size alerts and reassess the actual month-to-date egress trend.

Suggested operational targets (goals, not measured improvements):

- **At least 80% fewer daily Supabase reads** under comparable traffic after Phase A; review against the 128,011-request baseline and changing crawl volume.
- A warm anonymous job/board/company request performs **zero** Supabase reads.
- A first-time stale URL resolves via a published alias map or a tightly bounded lookup, not a table-scan waterfall.
- Database-backed public 5xx rate below **0.1%**, with Auth checked independently. If database-internal timeouts persist after load reduction, inspect CPU/RAM/IO metrics and platform health rather than assuming more indexes will fix them.
- Initial database warning at **300 MB**, intervention by **400 MB**, leaving headroom below 500 MB.
- Egress warning at a **3 GB/month forecast**, intervention around **4 GB**; use actual organization billing metrics.
- Track origin requests, cache hit/miss/stale/error, bytes returned, and per-route database-call count. Avoid logging profile bodies or tokens.
- Verify publishing freshness, closed-job behavior, profile save/rename/delete invalidation, and cross-user cache isolation in tests before deployment. Exercise the OpenNext cache in a Cloudflare-compatible preview; ordinary `next dev` is insufficient.

This investigation did not run a load test or claim measured post-fix savings. No production load test is needed to establish the findings above.

## Sources and evidence links

- [Supabase billing quotas](https://supabase.com/docs/guides/platform/billing-on-supabase)
- [Supabase egress accounting and separate cached allowance](https://supabase.com/docs/guides/platform/manage-your-usage/egress)
- [Database versus disk size and Free read-only threshold](https://supabase.com/docs/guides/platform/database-size)
- [MAU definition](https://supabase.com/docs/guides/platform/manage-your-usage/monthly-active-users)
- [Free project pausing](https://supabase.com/docs/guides/platform/free-project-pausing)
- [Availability and backup limitations](https://supabase.com/docs/guides/deployment/going-into-prod)
- [OpenNext Cloudflare cache implementations and deployment setup](https://opennext.js.org/cloudflare/caching)
- [Cloudflare Cache API: regional scope and unsupported SWR directives](https://developers.cloudflare.com/workers/runtime-apis/cache/)
- [R2 pricing and included usage](https://developers.cloudflare.com/r2/pricing/)
- [Duplicate-index advisor remediation](https://supabase.com/docs/guides/database/database-linter?lint=0009_duplicate_index)
- [RLS initialization advisor remediation](https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan)
- [Overlapping policies remediation](https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies)
- [Public SECURITY DEFINER RPC remediation](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)
- [Mutable function search-path remediation](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)
- [October 9 sync: green run with database failures](https://github.com/vedangvatsa/PDFtoWebsite/actions/runs/37883436047)
- [October 4 cleanup: company-count guard failure](https://github.com/vedangvatsa/PDFtoWebsite/actions/runs/37195401312)
- [September 15 deployment: deploy succeeded, indexing step failed](https://github.com/vedangvatsa/PDFtoWebsite/actions/runs/34966318757)
