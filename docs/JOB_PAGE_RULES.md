# Job page rules

Canonical for public job URLs. Also: `noslop.md` · `docs/JD_PARAPHRASE_RULES.md` · `src/lib/job-age.ts`

## Lifecycle (30 days)

| Age | Ingest | Row | URL | Apply | Google Search | Google Jobs | Board / sitemap |
|-----|--------|-----|-----|-------|---------------|-------------|-----------------|
    | Under 30 days | Accept if posting date is fresh | Keep (enrich queue until curated) | 200 only if curated-jd **and ≥600 words**; else 301 to hub/`/jobs` | On | Index only if curated ≥600w + gates | JobPosting only if indexable | Yes if curated + not expired |
    | 30 days or older | Drop. Do not insert. | Keep. Do not hard-delete. | 200 + closed notice only if curated-jd **and ≥600 words**; else 301 | Off | Same as above. Closed is not a reason to noindex. | No JobPosting | No |

Missing row (never existed / already wiped): 301 to company hub or `/jobs`. Not a hard 404.

`published_at` **or** `created_at` — listing follows the **newest** stamp. A 2-day publish with an old `created_at` is still live. Runtime: `src/lib/job-age.mjs` (re-exported by `job-age.ts`). Do not copy a local expiry helper.

## Company hubs (`/{slug}`)

- List **live** jobs (not expired, not banned). `curated-jd` is a board / sitemap / job-URL gate, not a hub-card gate.
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

- Clean ATS → one paraphrase. Invent nothing.
- Do not write 600 words from a compressed fact sheet. Fact sheet = tags, salary, location, job type only.
- Reach 600 words by expanding real ATS claims into full sentences, then owned company / apply notes. Never invent duties, perks, years, or pay.
- Originality fail-closed: 7-word copy, 5-gram overlap, patchwrite, synonym-spin.
- noslop. Owned headings. No `[placeholder]`. No raw ATS / EEO paste.
- Thin or failing drafts: do not save as `curated-jd`. Uncurated rows are an enrich queue only — they must not render as public job pages, list on `/jobs`, or be posted to Telegram. Company hubs may show them as apply-out cards.

## SEO

- Regular Google: index when the body is a trusted curated paraphrase (≥600w, headings, gates). Closed pages stay indexable if they already qualify. Title may say `(closed)`.
- Google Jobs: emit `JobPosting` for every live, indexable, not-expired public job page. Worldwide `"Remote"` keeps `TELECOMMUTE` — do not drop the posting for lack of a country, and do not invent `USA` / `Worldwide`. `validThrough` follows the newest listing stamp (`jobPostingValidThrough`). Schema `url` is `jobPublicPath`.
- Indexing API pings `jobPublicPath` only. Workflows must pass `NEXT_PUBLIC_SUPABASE_URL`. After markup changes, bump `SCHEMA_EPOCH` in `.github/scripts/google-indexing.mjs`.
- Sitemap job queries use `companyJobsDateOrFilter` (newest of published_at / created_at). Never AND `created_at`.
- Sitemap and `/jobs` lists: live inventory only.
- Locks: `src/lib/google-jobs-invariants.test.ts` · `.github/scripts/google-jobs-canary.mjs` (post-deploy Googlebot fetch).
