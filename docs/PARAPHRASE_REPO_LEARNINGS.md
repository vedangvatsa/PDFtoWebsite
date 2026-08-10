# Learnings from top GitHub “paraphrase” repos

**Source:** [GitHub search `paraphrase` by stars](https://github.com/search?q=paraphrase&type=repositories&s=stars&o=desc)  
**Adoption layer:** [`docs/JD_PARAPHRASE_RULES.md`](./JD_PARAPHRASE_RULES.md) (this file is research → rules mapping only)  
**Skip:** QuillBot unlock/crack repos; Android Gradle projects named “paraphrase”

---

## What mattered (ranked for CVin.Bio)

| # | Learning | From | Locked into our rules as |
|---|----------|------|---------------------------|
| 1 | Score **adequacy, fluency/humanity, diversity/originality** separately | Parrot | Pillars A / H / O |
| 2 | **Preserve slots** (entities); rewrite only around them | Parrot NLU | Immutable `slots[]` |
| 3 | Generate **many candidates**, filter, rank | Parrot, T5 generators | `DRAFT×N` + ranking |
| 4 | High lexical overlap ≠ same meaning; need structure/order | PAWS | Order-sensitive origin gates |
| 5 | Generate from **content units**, not full sentences | Latent BoW | Fact Sheet → draft |
| 6 | Force **lexical + syntactic/order** change | DIPPER, SCPN, diverse beams | Law O4 |
| 7 | **Retrieval** catches paraphrased copies better than AI-detectors | DIPPER, SentAugment | Neighbor check §6.4 |
| 8 | Diversity tools: Levenshtein, embeddings, difflib | Parrot filters | Origin toolbox |
| 9 | Fluency classifiers help; style ≠ meaning | STRAP / CoLA | Humanity pillar separate |
| 10 | Taxonomy: trivial / phrase-swap / reorder / complex | wasiahmad | `fail_reason` vocabulary |
| 11 | Dual similarity: meaning↑ vs source-surface↓ | SIM / SBERT lesson | Never one score for A and O |
| 12 | Explicit **anti-copy**; segment-level scores | Prism | Per-sentence gates |
| 13 | Tunable “modes/intensity” as config | QuillBot *concept* | Config knobs table |
| 14 | BLEU vs source is a bad publish KPI | MT/paraphrase eval | Banned as publish metric |
| 15 | Public paraphrase data is short-form | All generators | Don’t expect off-the-shelf JD quality |

---

## Repo triage (one glance)

| Keep studying | Ignore |
|---------------|--------|
| Parrot, PAWS, SentAugment, DIPPER, SCPN, Latent BoW, Prism, STRAP, nelson-liu / wasiahmad ID notes | QuillBot helpers, JakeWharton/cashapp paraphrase |

---

## Anti-patterns these repos accidentally encourage

| Anti-pattern | Why it hurts jobs | Our ban |
|--------------|-------------------|---------|
| Synonym spin of ATS lines | Plagiarism-adjacent + ugly | O3, patchwrite gates |
| Optimize BLEU vs source | Rewards theft | §6.5 |
| One similarity score for “quality” | Confuses A with O | Pillar split |
| Utterance max-len (~32) models on full JDs | Truncation / garbage | Fact Sheet chunking, not raw dump |
| Paraphrase to evade AI detectors | Wrong objective | We optimize employer-copy distance + truth |

---

## Implementation checklist (from learnings → code)

- [ ] Fact Sheet extractor with slots  
- [ ] Writer call with source sealed  
- [ ] `candidate_count` ≥ 3, seeded  
- [ ] Adequacy: coverage + invention + slot immutability  
- [ ] Origin: LCS, 5-gram, twin, patchwrite, spin, O4 structure  
- [ ] Retrieval neighbors vs source (+ sibling pages)  
- [ ] Humanity: noslop + rhythm/verb rules  
- [ ] Rank full passes; repair ≤2; else stub  
- [ ] Metrics dashboard by `fail_reason`  
- [ ] Weekly human audit sample  

---

## One-line synthesis

**Keep facts/slots. Change form (words + structure). Measure A, O, H apart. Retrieve to catch copies. Never spin the ATS.**
