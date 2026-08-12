# Job Description Paraphrase Rules

**Canonical for indexable `curated-jd` pages.**  
**Also:** `noslop.md` · `docs/JD_ASSEMBLY_RULES.md` (stubs only) · `docs/PARAPHRASE_REPO_LEARNINGS.md`

---

## Quick card

| Must | Must not |
|------|----------|
| Every claim supported by the posting | Invent duties, perks, culture, years, salary, visa |
| New sentence structures (not synonym spin) | Copy or patchwrite ATS prose |
| Read like a careful human editor | Brochure / AI slop / brick-template bullets |
| ≥600 words **only if** the above hold | Pad to hit 600 |

**Method:** `ATS → Fact Sheet → seal ATS → write from Fact Sheet → score A/O/H → publish or stub`

```text
A = Adequacy (true to Fact Sheet)
O = Originality (not stolen from ATS)
H = Humanity (editor-quality English)
Publish only if A ∧ O ∧ H ∧ words∈[600,900]
Else: short true stub, noindex, log fail_reason
```

---

## 1. Why this method

| Approach | Result |
|----------|--------|
| Rewrite ATS sentences in place | Spin + patchwrite + robotic cadence |
| Invent “typical” role duties | False content |
| **Fact Sheet → sealed write → multi-gate** | True + original + human |

Public paraphrase repos converge on the same idea: **keep slots, change form, measure adequacy and diversity apart, retrieve to catch copies.** See `PARAPHRASE_REPO_LEARNINGS.md`.

---

## 2. Pipeline

```text
FETCH    clean apply_url body
EXTRACT  FactSheet + slots  (sees ATS)
SEAL     ATS stored for judges only
DRAFT×3  writer sees FactSheet + meta + format only
SCORE    A, O, H (page + per-sentence)
REPAIR≤2 FactSheet + fail_reasons only (still no ATS)
SELECT   best full pass
PUBLISH  curated-jd  OR  stub/noindex
```

**Reproducibility:** seed RNG with `hash(fact_sheet_hash)`. Same sheet → same candidate set.

### Config (single source of truth)

```jsonc
{
  "candidate_count": 3,
  "max_repair": 2,
  "min_words_index": 600,
  "max_words": 900,
  "max_lcs_words": 6,              // fail if shared contiguous words >= 7
  "max_5gram_jaccard": 0.05,
  "twin_token_overlap": 0.72,
  "twin_max_edit_ratio": 0.25,
  "patchwrite_token_overlap": 0.55,
  "spin_bigram_overlap": 0.45,
  "retrieval_cosine": 0.88,
  "retrieval_token_overlap": 0.40,
  "order_change_min_tokens": 12
}
```

---

## 3. Fact Sheet

### Schema

```jsonc
{
  "meta": {
    "title": "", "company": "", "location": "",
    "workplace": "remote|hybrid|onsite|unknown",
    "engagement": "", "salary_raw": "",
    "team": "", "department": "", "apply_url": ""
  },
  "slots": [
    { "type": "years|salary|skill|location|visa|product|other", "value": "5+" }
  ],
  "duties": ["define API contracts for payments with product"],
  "must_have": ["production Go or Java"],
  "nice_to_have": ["Kafka"],
  "skills": ["Go", "Postgres", "Kubernetes"],
  "systems": ["V-BAT", "Hivemind"],
  "constraints": ["no visa sponsorship"],
  "comp_notes": ["$180k-$220k + equity"],
  "omissions": ["benefits not listed"]
}
```

### Extract rules
1. One claim per line. Telegraphic. No hype.  
2. Digits/units exact. Must vs nice preserved.  
3. Unsure → `omissions`. Never guess.  
4. Long ATS quotes are not duties; distill or drop.  
5. `slots[].value` are **immutable** in the final page.  
6. `skills` = methods/tools; `systems` = products/platforms.  
7. Do not drop salary bands, technical judgment, risk assessments, balance/priority clauses, or preferred degrees when present.

### Richness (for indexing)

| Tier | Signal | Index path |
|------|--------|------------|
| Rich | ≥6 duties and ≥4 must_have (or equiv. substance) | Aim 600–900 |
| Medium | Some duties/skills | Faithful length; index only if ≥600 without padding |
| Thin | Title/meta only, blocked scrape | Stub only, noindex |

---

## 4. Page format

```text
{Title} at {Company}.

About the role
Key facts
What you'll do
Requirements
Nice to have          # omit if empty
Engineering methods   # methods/tools from sheet.skills
Relevant systems      # products/platforms from sheet.systems
Skills & tools        # only if systems empty and skills non-empty
Practical notes
```

| Section | Rules |
|---------|--------|
| About | 3–5 sentences. Mix ≤12-word and ≥18-word. Scope from duties only. Editorial synthesis OK; no invented facts. |
| Key facts | `Location:` / `Engagement:` / `Compensation:` / `Team:` — omit unknown lines. **Include exact salary when in sheet.** |
| What you'll do | 8–12 bullets when sheet supports; else fewer (may block index). **Reorder/merge by workflow** — do not mirror ATS sequence 1:1. |
| Requirements | Hard stays hard. **Do not drop** judgment, risk assessments, balance/priority clauses, or other must_have items. |
| Nice to have | Only if sheet has optionals (preferred degrees, env prefs, etc.) |
| Engineering methods | Methods/tools only (FRACAS, FMEA, HubSpot) — not product names |
| Relevant systems | Products/platforms named in posting (V-BAT, Hivemind) — not soft skills |
| Skills & tools | Fallback single list when `systems` is empty |
| Practical notes | Sourced constraints + *Confirm details on the official apply page.* Distinguish products precisely (e.g. Aechelon = simulation/synthetic reality when sheet says so). |

**Allowed growth:** turn a note into one clear sentence; split a compound note; regroup related duties.  
**Forbidden growth:** culture, perks, industry filler, role-family essays, triple restatements, inventing partner order ("first X then Y"), stretching "operational context" into unsupported specifics.

**Tone:** no em/en dashes; no marketing "pain/chase/surprise"; prefer "individual-contributor role" over "IC seat"; prefer "risk assessments" over "risk calls".

**Source:** always `curl`/fetch of `apply_url` (or equivalent ATS API). Never write ≥600w from CVin.Bio stubs or title/tags alone → stub/noindex.

---

## 5. Pillar A — Adequacy

### Pass iff
1. Every `duties|must_have|nice_to_have|skills|constraints|comp_notes` item is clearly reflected.  
2. Every `slots[].value` appears unchanged.  
3. No duty-like bullet lacks a Fact Sheet mapping.  
4. Must-have items are not moved to Nice to have.

### Pseudocode

```text
for item in fact_sheet.content_items:
  if not reflected_in(draft, item): fail missing_facts
for slot in fact_sheet.slots:
  if slot.value not in normalize(draft): fail slot_mutation
for sentence in draft.content_sentences:
  if claimy(sentence) and not maps_to_any_item(sentence, fact_sheet):
    fail invented_facts
```

`reflected_in` may match paraphrase of the **note**, not ATS wording.

---

## 6. Pillar O — Originality

Normalize: lowercase, strip punct to space, collapse spaces.  
Compare draft ↔ **sealed ATS** (never use BLEU↑ as quality).

### 6.1 Page gates (all)

| Test | Fail if |
|------|---------|
| LCS | contiguous shared words ≥ 7 |
| 5-gram Jaccard | > 0.05 |
| Ordered 3-gram run | ≥4 shared 3-grams in a row |
| Spin | bigram overlap ≥ 0.45 and length ±20% |

### 6.2 Sentence gates (skip pure `Label: slot` lines)

Against best ATS sentence:

| Test | Fail if |
|------|---------|
| Copy | exact or ≥7-word subspan |
| Twin | token overlap ≥ 0.72 and edit_ratio ≤ 0.25 |
| Patchwrite | overlap ≥ 0.55 and same opener+closer content words and same clause order |
| Trivial | only stopword/inflection edits |

### 6.3 Structure change (long units ≥12 tokens)

Require ≥1 of: new root verb, reordered major constituents, split/merge vs any single ATS sentence.  
Synonym-only rewrite → `spin` / `reorder_only` fail.

### 6.4 Retrieval (recommended)

Embed draft sentence; top neighbor in ATS sentences.  
Fail `retrieval_hit` if cosine ≥ 0.88 **and** token overlap ≥ 0.40.  
Also compare to recent same-family curated pages → `near_duplicate_internal`.

---

## 7. Pillar H — Humanity

### Auto-fail
- Em/en dashes; noslop lexicon (leverage, delve, robust, seamless, cutting-edge, passionate, exciting opportunity, furthermore, moreover, landscape, tapestry, …)
- Same opener (`You will` / `In this role`) ≥3× in one section  
- ≥6 bullets with lengths within ±2 words  
- All About sentences 12–18 words  
- Brochure fluff without Fact Sheet basis (“world-class”, “drive impact”, “self-starter”)

### Auto-require
- About: ≥1 short (≤12w) and ≥1 longer (≥18w) if ≥3 sentences  
- In any 8 bullets: same opening verb ≤2×  
- Cut-test: removable ~15% words without losing Fact Sheet coverage (else `padded`)

### Humanization pass
Break openers → swap abstractions for sheet nouns → noslop → **re-run O**.

---

## 8. Rank & repair

Among candidates with A∧O∧H∧length:

```text
rank = 3*(duty_coverage) + 2*(1 - fivegram_jaccard) + 2*(humanity_score)
     + 0.5*(unique_sheet_objects_mentioned) - 1.0*(padding_ratio)
```

Repair prompt input: Fact Sheet + failing sentences + `fail_reason[]`.  
Still **no ATS prose**. Max 2 repairs.

---

## 9. Prompts (copy into enrich)

### Extractor (sees ATS)
```text
You extract a Fact Sheet JSON for a job posting.
Schema: meta, slots[], duties[], must_have[], nice_to_have[],
skills[], constraints[], comp_notes[], omissions[].
duties are short neutral notes, not marketing sentences.
slots values are exact immutable strings (pay, years, skills, visa).
If unsure, omit and list under omissions.
Output JSON only.
```

### Writer (ATS sealed)
```text
Write a cvin.bio job page from the Fact Sheet only.
You do not have the original posting text.
Rules:
- Cover every Fact Sheet item. Invent nothing. Do not change slot values.
- Use exact headers: About the role, Key facts, What you'll do,
  Requirements, Nice to have (if any), Engineering methods / Relevant systems
  (or Skills & tools), Practical notes.
- Do NOT mirror ATS bullet order. Regroup by workflow; merge related duties.
- Include exact salary when in comp_notes / salary_raw.
- Change wording AND sentence structure from typical ATS phrasing.
- Sound like a careful human editor: varied rhythm, concrete verbs,
  no AI filler, no em dashes, no brochure tone.
- Aim 600–900 words only if the Fact Sheet supports it; otherwise shorter.
- End Practical notes with: confirm details on the official apply page.
Output plain text only.
```

### Repair
```text
Revise the draft using the Fact Sheet. Fix only these fail_reasons:
{fail_reasons}
Offending spans:
{spans}
Do not invent facts. Do not reintroduce copied phrasing.
Keep section headers. Output full page plain text.
```

---

## 10. Golden micro-fixture

**ATS fragment:**  
`You will be responsible for leveraging best practices to collaborate cross-functionally with product managers in order to define and iterate on API contracts for our payments platform.`

**Fact Sheet duty:** `define and iterate API contracts for payments with product`

| Draft | A | O | H | Result |
|-------|---|---|---|--------|
| Copy of ATS | | ✗ | ✗ | reject |
| Synonym-spin of ATS | ✓ | ✗ | ✗ | reject |
| Adds on-call + hiring | ✗ | | | reject |
| `Define and refine API contracts for payments with product.` | ✓ | ✓ | ✓ | accept unit |
| `Work with product on payments API contracts and update them as the product changes.` | ✓ | ✓ | ✓ | accept unit |

Unit tests should encode these five rows.

---

## 11. Fail reasons

`invented_facts` `missing_facts` `slot_mutation`  
`copy_span` `ngram_overlap` `sentence_twin` `patchwrite` `spin` `trivial` `reorder_only` `retrieval_hit` `near_duplicate_internal`  
`slop` `robot_rhythm` `brochure` `padded`  
`short` `structure` `source_thin` `blocked_source`

---

## 12. Ops

**Single enrich script:** `.github/scripts/enrich-remote-job-descriptions.mjs`  
- Default: scrape → `manual-jd-queue/` (no LLM)  
- `ALLOW_AI_ENRICH=1`: JD rewrite via OpenRouter `inclusionai/ling-2.6-flash` only  
- `ALLOW_AI_ENRICH=1 ABOUT_ONLY=1`: unique About-the-company blurbs → `src/lib/company-descriptions.json`  

`queue-manual-jd-priority.mjs` / `publish-manual-jd.mjs` remain the manual publish path.

**Decision tree**
```text
usable source?  no → stub
sheet thin?     yes → stub (or short faithful noindex)
manual rewrite per this rulebook → curated-jd
(optional AI path) draft×N → pass A∧O∧H∧len?  yes → curated-jd
repair×2 → still no? → stub
```

**Weekly audit (n=20):** employer-true? any ATS trench-coat sentences? publish under your name? cut 15% without losing facts?  
If >10% fail → tighten O knobs before raising volume.

**SEO:** scraped/spun/thin scaled pages hurt; honest original summaries do not. Protection is A∧O∧H + noindex-when-thin.

---

## 13. One line

> **Extract facts. Seal the ATS. Write like an editor. Prove truth. Prove you didn’t copy. Sound human. Index only then.**
