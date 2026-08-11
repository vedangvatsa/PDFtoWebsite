# Job Page Assembly Rules (non-AI)

**Status:** canonical for **fail-closed stubs / non-AI fallback only**  
**For indexable paraphrased JDs see:** [`docs/JD_PARAPHRASE_RULES.md`](./JD_PARAPHRASE_RULES.md)  
**Companion docs:** `noslop.md`, `docs/ARTICLE_GUIDELINES.md`  
**Runtime today:** `publishSafeDescription` in `src/lib/job-detail-data.ts`, enrich script `.github/scripts/enrich-remote-job-descriptions.mjs`, index floor `JOB_INDEXABLE_MIN_WORDS = 600` in `src/lib/job-description.ts`

This rulebook covers **non-AI assembly** of short, true stubs from metadata when paraphrase is unavailable or fails gates.  
It does **not** authorize inventing employer duties from role playbooks.  
Scraped ATS/HTML is a **fact feed only** for stubs. Indexable full pages follow the paraphrase rulebook.

---

## 0. Goals and non-goals

### Goals
1. True **meta-only** stubs when paraphrase cannot run or fails.
2. Never invent employer duties or compensation.
3. Never publish scraped ATS prose.
4. Keep uncurated / failed pages **noindex**.
5. Grammatically correct stub copy via fixed templates + noslop.

### Non-goals
1. Replacing paraphrase for full indexable JDs (see `JD_PARAPHRASE_RULES.md`).
2. Role-playbook duties attributed to a specific employer.
3. Forcing 600 words without true source substance.
4. Synonym-spinning source sentences.

### Product honesty
Stub pages are short CVin.Bio summaries from listing metadata.  
Full curated pages must follow the paraphrase rulebook.

---

## 1. Publishing law (absolute)

| # | Law | Fail action |
|---|-----|-------------|
| L1 | Never publish a sentence (or ≥8-word span) copied from scraped source | Reject assemble |
| L2 | Never synonym-replace source sentences | Reject; rewrite library instead |
| L3 | Never index below 600 words | No `curated-jd` for index path; keep short noindex stub |
| L4 | Never invent employer-specific facts | Omit line; use honesty template |
| L5 | Never use `Math.random()` for variant selection | Deterministic `hash(job.id + key) % N` |
| L6 | All published text passes `noslop.md` | Strip/reject |
| L7 | Fail closed: if gates fail, ship short noindex page | Do not force 600w fluff |

### Index vs render
- **Uncurated / no curl body:** original company about (or a one-line hiring note). Never process/queue copy. **noindex.**
- **Low-quality apply hosts** (LinkedIn, jobviewtrack, etc.): hidden from board/company lists unless `curated-jd`.
- **Passed gates:** full assembled body, tag `curated-jd`, eligible for sitemap/IndexNow only if `wordCount >= 600` and uniqueness gates pass.

### Note on DB auto-tag
`jobs_auto_curated_tag` currently may add `curated-jd` around ~200 words.  
**Assembler rule:** only write a long `description` when the page is meant to be curated **and** all gates in §7 pass.  
Do not upsert a long body that failed uniqueness. Prefer leaving description null/short until pass.  
Follow-up: align DB trigger with 600-word + quality flag when implementing.

---

## 2. Pipeline (every sync / every 2 days)

```
1. Ingest job row (title, company, location, salary, tags, apply_url, …)
2. Curl apply_url / ATS HTML (and Archive fallback if you already use it)
3. Fact extract → JobFacts JSON (no prose)
4. Map title → role_family
5. Assemble page from libraries + facts + evergreen + related links
6. Run gates (§7)
7. PASS → upsert description, curated-jd, pretty slug, IndexNow
   FAIL → short stub only, noindex, log fail_reason
```

Curl frequency: reuse existing sync cadence. Do not re-shuffle variant IDs on every run if facts unchanged (crawler stability).

---

## 3. Fact extraction (curl → structured data)

### 3.1 Allowed outputs (JobFacts)

```text
title, company, company_key
location_raw, location_norm
workplace: remote | hybrid | onsite | unknown
job_type / engagement
salary_raw, salary_display          # only if clearly present
years_min, years_max                # only if clearly present
must_skills[]                       # short tokens only
nice_skills[]
tools[]
degree_signals[]                    # bachelor | master | phd | none_stated
visa_signals[]                      # sponsorship | no_sponsorship | unknown
benefit_tokens[]                    # allowlisted tokens only, never sentences
team_name, department               # if explicit headings/labels
source_fingerprint                  # simhash of cleaned source plain text
source_word_count
scrape_status: ok | blocked | empty | stale
extracted_at
```

### 3.2 Extraction rules
1. **Skills/tools:** match against shared tech lexicon + title tokens + list items under Requirements / Skills / Stack headings. Max 30. Strip category prefixes.
2. **Years:** `\b(\d+)\s*\+?\s*years?\b` near experience wording. If multiple, store min and max. Cap sanity 0–40.
3. **Workplace:** keyword map (Remote, Hybrid, On-site, WFH). Default `unknown`.
4. **Salary:** currency + range patterns only. If ambiguous, leave empty.
5. **Visa / benefits:** allowlist phrase → token. Never copy the surrounding sentence.
6. **Contamination rule:** any candidate “bullet” with >12 words that shares a 5-gram with source is **discarded** (not stored as a skill or duty).
7. **Empty scrape:** facts from job row meta only. Assembler may still pass if libraries + company blurb + tags carry enough entropy; else fail `sparse_facts`.

### 3.3 Forbidden uses of source text
- Filling What you'll do / Requirements with employer bullets
- Quoting About the company from ATS or Wikipedia without human rewrite into owned blurb store
- Padding word count with scraped paragraphs

---

## 4. Role family mapping (fixes edge titles)

### 4.1 Mapping algorithm
1. Normalize title: lowercase, strip level words (`senior`, `staff`, `principal`, `jr`, `sr`, `i`, `ii`, `iii`).
2. Score families by keyword hits (weighted).
3. Pick top family if score ≥ threshold.
4. Else try **secondary** family from tags/category.
5. Else `role_family = general-professional` **and** mark `family_confidence = low`.

### 4.2 Low-confidence rule (smart fix for long tail)
- `family_confidence = low` → **do not index** unless fact entropy (§7.2) is high **and** company blurb exists.
- Log `unmatched_title` for playbook backlog.
- Do not force `general-professional` into the index at scale (doorway risk).

### 4.3 Initial family set (ship order)
**Tier 1 (build first):** backend, frontend, fullstack, mobile, devops-sre, data-engineer, data-scientist, ml-ai, product-manager, designer-ux, marketing, sales, customer-success, recruiter-people, finance-ops, general-professional (restricted).

**Tier 2:** security, qa, technical-writer, support, legal, healthcare, education, hardware, other as volume demands.

Each family lives in versioned data (YAML/JSON) under something like `content/job-playbooks/{id}.yaml`.

---

## 5. Libraries (owned content)

### 5.1 Role playbook schema

```yaml
id: backend-engineer
version: 1
match_keywords: ["backend", "back-end", "server engineer", "api engineer"]
about_role:          # ≥6 variants, 2–4 sentences each
responsibilities:    # ≥40 bullets
requirements:        # ≥30 bullets
nice_to_have:        # ≥15 bullets
skills_default:      # 8–20 short tokens
practical:           # ≥8 bullets
interview_prep:      # ≥4 short paragraphs (evergreen-adjacent)
cv_angle:            # ≥3 paragraphs: why a CV link helps for this family
banned_phrases: []   # optional extras beyond global noslop
```

### 5.2 Writing rules for playbooks (meaningfulness)
1. Every bullet must contain a **concrete noun or verb phrase** (API, pipeline, quota, design system, onboard, deploy). Ban empty “support the team” alone.
2. Max ~20 words per bullet. Prefer 8–16.
3. No employer product names unless injected from facts.
4. No first-person (“I will”). Prefer second-person or neutral (“You will”, “This role usually…”).
5. Role-true, not company-true: “Build production APIs” OK; “Own Stripe Radar at {company}” only if fact says so.
6. Pass `noslop.md` (no em dashes, no leverage/delve/cutting-edge, …).
7. At least 6 **about_role** variants that differ in structure, not just synonyms of one line.

### 5.3 Company blurbs (fixes generic “any brand” feel)
- Keyed by `company_key`.
- Length 120–220 words.
- Human-written once; store in DB or `content/company-blurbs/{key}.md`.
- Allowed sources for authors: public about page, press, own knowledge. **Authors must rewrite**; no paste.
- Cold-start stub (≤40 words) is allowed in assembly but **does not count** toward the company-blurb entropy bonus in §7.2.

**Priority:** top employers by job volume first.

### 5.4 Evergreen pools (fixes word count without nonsense)
| Pool id | Purpose | Words | Min variants |
|---------|---------|-------|--------------|
| `apply_with_cvinbio` | How to use a CV link when applying | 80–120 | 10 |
| `remote_work_notes` | Remote/hybrid working notes | 60–100 | 8 |
| `family_cv_angle` | From playbook `cv_angle` | 80–120 | 3+/family |
| `family_interview` | From playbook `interview_prep` | 80–120 | 4+/family |
| `resources_deeplink` | Link visas/tax/timezone/jobs hubs | 40–80 | 6 |

**Cap:** evergreen + deeplink blocks ≤ **40%** of total words (Gate E).

### 5.5 Fact line templates (grammar-safe)
Only emit when fact present:

- `{title} at {company} is listed as a {engagement} role on CVin.Bio.`
- `Location is listed as {location}.`
- `Workplace type appears as {workplace}.`
- `Compensation is listed as {salary_display}.`
- `The listing signals about {years_min}+ years of relevant experience.`
- `Highlighted skills include {skill1}, {skill2}, and {skill3}.`
- `Confirm start date, visa, and compensation on the official apply page.`

---

## 6. Assembly recipe (fixes structure + 600 words)

### 6.1 Section order (plain text, exact headers)

```text
{Title} at {Company}.

About the role
Key facts
What you'll do
Requirements
Nice to have          # omit if <2 bullets after selection
Skills & tools
Practical notes
About {Company}
Applying with a CV link
Related roles on CVin.Bio
```

### 6.2 Word budget (target 650–850, hard min 600, soft max 900)

| Section | Target words | How filled |
|---------|--------------|------------|
| About the role | 70–110 | 1 about_role variant + 1–2 fact lines |
| Key facts | 40–80 | fact templates only |
| What you'll do | 140–200 | 8–12 responsibility bullets |
| Requirements | 100–160 | 5–10 requirement bullets + years/degree fact lines |
| Nice to have | 40–80 | 0 or 3–6 bullets |
| Skills & tools | 30–60 | extracted ∪ defaults, deduped |
| Practical notes | 40–70 | 2–5 practical bullets + honesty line |
| About company | 120–220 | owned blurb (or skip section if only cold stub) |
| Applying with a CV link | 80–120 | 1 evergreen variant |
| Related roles | 40–80 | up to 6 real internal links + 2 sentences |

### 6.3 Variant selection (deterministic uniqueness)
```text
pick(list, jobId, salt) = list[ hash(jobId + ":" + salt) % list.length ]
```
- Responsibilities: pick 10 from ≥40 using salts `resp:0`… or shuffle indices via hash without replacement.
- Never reuse the exact same responsibility set for two jobs in the same family on the same day if avoidable: include `company_key` in hash salt.

### 6.4 Related roles (real uniqueness, not filler)
Use existing related-job scoring (same company, title tokens, tags).  
Require ≥2 related links for entropy credit. If none, omit section and do not pad with fake links.

---

## 7. Quality gates (must all pass to curate)

### 7.1 Gate A — Source overlap (anti-plagiarism)
- Compare assembled plain text to cleaned source.
- Fail if any contiguous **≥8-word** span matches.
- Fail if **5-gram Jaccard > 0.08** (tune with logged samples; start strict).
- If source empty, Gate A passes vacuously; Gate B/C carry the load.

### 7.2 Gate B — Fact entropy (anti-doorway)
Score points (need **≥ 5**):

| Signal | Points |
|--------|--------|
| Distinct location_norm | 1 |
| salary_display present | 2 |
| ≥3 extracted skills (not only defaults) | 2 |
| years_min present | 1 |
| workplace not unknown | 1 |
| Full company blurb (≥120w owned) | 2 |
| ≥2 related role links | 1 |
| family_confidence = high | 1 |

Fail `low_entropy` if score < 5.  
This is the smart fix for “same 12 bullets, swap company name.”

### 7.3 Gate C — Length and structure
- Word count ∈ **[600, 900]**
- Required headers present
- ≥8 What you'll do bullets, ≥5 Requirements bullets
- ≥3 Skills items
- No duplicate consecutive sentences

### 7.4 Gate D — Noslop / grammar surface
- Run publish cleaner
- Fail on banned filler lexicon (leverage, delve, cutting-edge, exciting opportunity to join, …)
- No em/en dashes in output

### 7.5 Gate E — Meaningfulness / filler ratio
- Evergreen pools ≤ 40% of words
- Cold company stub alone cannot carry About company for index
- Reject if responsibilities equal the previous curated job in same family with same salt set and entropy < 7

### 7.6 Gate F — Honesty
- No visa/benefits/salary/years claims unless in JobFacts
- Practical notes must include apply-on-official-site guidance

### 7.7 Gate outcomes
```text
PASS → curated-jd + full body + indexable if also isJobDescriptionIndexable
FAIL → short stub, no curated-jd (or remove it), log:
  job_id, fail_reason, role_family, entropy, overlap, word_count
```

Common `fail_reason` values:  
`overlap`, `low_entropy`, `short`, `long`, `structure`, `slop`, `filler_ratio`, `low_family_confidence`, `sparse_facts`, `scrape_blocked`.

---

## 8. Fixes mapped to earlier risks

| Risk | Smart fix in this rulebook |
|------|----------------------------|
| Plagiarism / duplicate employer text | L1–L2 + Gate A; source never in body |
| Thin / doorway templates | Gate B entropy; related links; company blurbs; noindex low confidence |
| Meaningless filler to hit 600w | Gate E; concrete-bullet writing rules; evergreen cap |
| Bad grammar | Human templates only; noslop |
| Edge / weird titles | low_confidence → noindex until playbook exists |
| Sparse scrape | entropy gate; meta-only assembly may fail closed |
| AI cost | No LLM in pipeline |
| Crawler instability | Deterministic variants; don’t reshuffle if facts unchanged |
| User expects full ATS clone | Product honesty §0; apply link primary |

---

## 9. Operational runbook

### 9.1 Cron
1. Enrich jobs from last 30 days lacking successful assemble.
2. Skip if `facts_hash` + `playbook_version` + `blurb_version` unchanged and already curated.
3. Respect curl rate limits; record `scrape_status`.

### 9.2 Logging (required for tuning)
Store per attempt: family, confidence, entropy breakdown, overlap score, word count, variant ids, gate failures.

### 9.3 Weekly human audit
Sample 20 curated URLs:
- Any feel identical? → expand variants / tighten Gate B
- Any false facts? → fix extractors; add honesty
- Any source-sounding prose? → tighten Gate A; purge library line

### 9.4 Backlog from logs
- Top unmatched titles → new playbooks
- Top companies by volume without blurb → write blurbs
- High `filler_ratio` fails → expand responsibilities pools

### 9.5 Rollback
If spam/thin signals appear: raise entropy threshold, lower sitemap inclusion, pause IndexNow, keep stubs noindex.

---

## 10. Implementation checklist (engineering)

1. [ ] `JobFacts` type + extractor from HTML/text (no LLM)
2. [ ] Playbook loader + family matcher
3. [ ] Assembler producing exact section headers
4. [ ] Gates A–F as pure functions + unit tests with fixtures
5. [ ] Replace LLM path in enrich script with assembler
6. [ ] Keep short stub path for failures (current synthesizer)
7. [ ] Align `curated-jd` tagging with gate pass (not mere length ~200)
8. [ ] Seed Tier-1 playbooks + top company blurbs + evergreen pools
9. [ ] Admin/metrics: curated rate, fail_reason histogram, overlap distribution

---

## 11. Editorial acceptance test (library PR)

A playbook/blurb PR is rejected unless:
- [ ] Reads natural aloud (no template awkwardness)
- [ ] Every responsibility bullet is role-concrete
- [ ] No noslop violations
- [ ] No pasted third-party sentences
- [ ] ≥6 about_role variants with structural diversity
- [ ] Author confirms no employer confidential claims

---

## 12. Success metrics

| Metric | Healthy target |
|--------|----------------|
| % new jobs curated within 7d | Quality over coverage; start ~20–40% |
| Gate A fail rate | >0 (proves detector works); investigate spikes |
| Median entropy of curated | ≥ 6 |
| Indexable word count | 650–850 median |
| AI enrich spend | $0 |
| Manual spam/thin incidents | 0 |

**Do not optimize for 100% curated.** Optimizing for that recreates the thin-content problem.

---

## 13. One-line doctrine

> Extract facts from the posting. Write the page from our libraries.  
> Index only when the page is original, specific, and useful.  
> Everything else stays a short noindex stub.

---

*When this rulebook and the assembler disagree, this rulebook wins until the rulebook is updated in git.*
