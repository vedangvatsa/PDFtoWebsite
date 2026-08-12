# Job page rules

Canonical for public job URLs. Also: `noslop.md` · `docs/JD_PARAPHRASE_RULES.md` · `src/lib/job-age.ts`

## Lifecycle (30 days)

| Age | Ingest | Row | URL | Apply | Google Search | Google Jobs | Board / sitemap |
|-----|--------|-----|-----|-------|---------------|-------------|-----------------|
| Under 30 days | Accept if posting date is fresh | Keep | 200 | On | Index only if curated ≥600w + gates | JobPosting only if indexable | Yes if curated + not expired |
| 30 days or older | Drop. Do not insert. | Keep. Do not hard-delete. | 200 + closed notice | Off | Same as above. Closed is not a reason to noindex. | No JobPosting | No |

Missing row (never existed / already wiped): 301 to company hub or `/jobs`. Not a hard 404.

`published_at` or `created_at` past 30 days counts as closed. Runtime: `isJobExpired`.

## Content

- Clean ATS → one paraphrase. Invent nothing.
- Do not write 600 words from a compressed fact sheet. Fact sheet = tags, salary, location, job type only.
- Reach 600 words by expanding real ATS claims into full sentences, then owned company / apply notes. Never invent duties, perks, years, or pay.
- Originality fail-closed: 7-word copy, 5-gram overlap, patchwrite, synonym-spin.
- noslop. Owned headings. No `[placeholder]`. No raw ATS / EEO paste.
- Thin or failing drafts: do not save as `curated-jd`.

## SEO

- Regular Google: index when the body is a trusted curated paraphrase (≥600w, headings, gates). Closed pages stay indexable if they already qualify. Title may say `(closed)`.
- Google Jobs: emit `JobPosting` only for live, indexable, not-expired pages.
- Sitemap and `/jobs` lists: live inventory only.
