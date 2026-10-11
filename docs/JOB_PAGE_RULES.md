# Job page rules

Canonical for public job URLs. Current policy (October 11): import original
employer descriptions without AI. `JD_PARAPHRASE_RULES.md` applies only to legacy
rewrites. Runtime expiry is defined in `src/lib/job-age.ts`.

## Lifecycle (30 days)

| Age | Ingest | Row | URL | Apply | Google Search | Google Jobs | Board / sitemap |
|-----|--------|-----|-----|-------|---------------|-------------|-----------------|
| Under 30 days | Accept if posting date is fresh | Keep; import original source text | 200 for verified source descriptions or valid legacy rewrites; otherwise 307 to employer | On | Index verified full descriptions | JobPosting only if indexable | Live cards; verified pages enter sitemap and posting feeds |
| 30 days or older | Drop. Do not insert. | Archive original source body; retain lightweight row and URL metadata | Original snapshot redirects after archival; legacy curated pages retain the closed notice | Off | Legacy curated pages may remain indexed | No JobPosting | No |

Missing row (never existed / already wiped): 301 to company hub or `/jobs`. Not a hard 404.

`published_at` **or** `created_at` — listing follows the **newest** stamp. A 2-day publish with an old `created_at` is still live. Runtime: `src/lib/job-age.mjs` (re-exported by `job-age.ts`). Do not copy a local expiry helper.

## Company hubs (`/{slug}`)

- List **live** jobs (not expired, not banned). `curated-jd` is a sitemap / job-URL gate, not a hub or `/jobs` card gate.
- Every `/{slug}` hub pages the full live set (not a 50-row sample). The header count is `jobs.length` — never overlay `companies.role_count`.
- Curated cards link to `/{company}/{jobSlug}`. Uncurated cards link to `apply_url` so they do not 301-loop back to the hub.
- Date filter is `published_at OR created_at` (`companyJobsDateOrFilter`). Never AND `created_at`.
- Join is equality only: `company_key` IN (slug key, directory-name key), then exact `company` name variants (`OpenAI` / `openai`). Never ILIKE.
- Company names never come from a public-suffix label. `iisc.ac.in` is **IISc**, not **AC**; `bbc.co.uk` is **BBC**, not **CO**. Shared helper: `src/lib/company-host.mjs` (`registrableHostLabel`, `companyNameFromApply`). Ingest (`jobs-sync` `filterAndNormalize`) and display (`companyDisplayName` / `companyDisplayNameFromJob`) both call it. Do not take `hostname.split('.')[-2]` as the brand. Tests: `src/lib/company-host.test.mjs` · `src/lib/company-directory.test.ts`.
- Generic employer labels (`Other`, `Unknown`, `Company`) are not brands. Do not take apply-path segments (`risein.com/other/…`) as the company. Aggregator apply hosts (RiseIn, Guardian, We Work Remotely, …) are not public job pages.
- Keep the hub if a directory row, live jobs, or a known profile cache/meta entry exists — even when about copy is unpublished Wikipedia.
- Do not wrap hub SQL in `withCuratedJdTag`. That emptied OpenAI/Stripe hubs while nested job URLs still existed.

Tests (CI `npm test`): `src/lib/company-hub-invariants.test.ts` · `src/lib/public-job-gate.contract.test.ts` · `src/lib/google-jobs-invariants.test.ts` · `src/lib/company-assets.test.ts` · `src/lib/job-apply-source.test.mjs`

## Content

- Fetch the exact posting from an official ATS API, matching its native job ID.
  Greenhouse, Ashby, Lever, Workable, SmartRecruiters, Workday, Gem and JazzHR
  are supported. Greenhouse's public API is global; hosted EU board links keep
  their EU hostname. Dotted/spaced Ashby board names retain URL case/encoding.
- Preserve employer wording, punctuation and paragraph/list order. Versioned
  `source-html` descriptions retain headings, paragraphs, lists, emphasis,
  tables and safe links through an HTML-parser allowlist at import and render.
  Scripts, event handlers, unsafe URLs and embedded widgets are removed. No AI.
- New descriptions carry `source-jd` plus `curated-jd`. The latter remains the
  existing SQL publication selector; the former selects the original-text path.
- Source bodies need at least 40 words and must fit 32 KiB UTF-8. Reject oversized
  bodies rather than truncating them. Legacy rewrites retain their 600-word floor.
- Pages, detail API responses, full-description feeds and JobPosting schema use
  the original body. The existing employer apply link remains the source link.
- New rows require a verified original description BEFORE insertion. Missing,
  unavailable, unsupported or oversized sources are deferred rather than added
  as basic listings. Never generate replacement prose or fabricate facts.
- Confirmed removed postings get `source-closed`, leave the live board and
  company counts, and retain metadata. A network failure alone never closes a job.
- Daily sync admits up to 500 complete listings from known remote-tech companies;
  funding language in company blurbs is no longer required. Source lookups are
  serial and bounded to four attempts per admission slot. Store at most 4,000
  original bodies (~125 MiB payload cap plus database overhead). After 30 days,
  source snapshots lose their body/publication tags and gain `source-archived`;
  cleanup retains the row so old links can redirect to the company hub.
- AI job rewriting's old entrypoint is disabled. Scheduled sync has no AI credentials.
- Ashby single-job JobPosting data avoids giant board downloads. A bounded
  64-MiB Node-only board fallback confirms missing IDs when pages lack metadata;
  ordinary source responses remain capped at 12 MiB. Backfill uses the same
  newest-of-created/published window as the public board.

## SEO

- Regular Google: index verified original descriptions or qualified legacy rewrites. Legacy closed pages stay indexable if they already qualify. Title may say `(closed)`.
- Google Jobs: emit `JobPosting` for every live, indexable, not-expired public job page. Worldwide `"Remote"` keeps `TELECOMMUTE` plus `applicantLocationRequirements` as `AdministrativeArea` (`Worldwide`) — do not drop the posting for lack of a country, and do not invent `USA` or emit `Worldwide` as a Country. GSC flags TELECOMMUTE without that field as critical. `validThrough` follows the newest listing stamp (`jobPostingValidThrough`). Schema `url` is `jobPublicPath`.
- Indexing API pings `jobPublicPath` only. Workflows must pass `NEXT_PUBLIC_SUPABASE_URL`. After markup changes, bump `SCHEMA_EPOCH` in `.github/scripts/google-indexing.mjs`.
- Sitemap job queries use `companyJobsDateOrFilter` (newest of published_at / created_at). Never AND `created_at`.
- Sitemap and `/jobs` lists: live inventory only.
- Locks: `src/lib/google-jobs-invariants.test.ts` · `.github/scripts/google-jobs-canary.mjs` (post-deploy Googlebot fetch).
