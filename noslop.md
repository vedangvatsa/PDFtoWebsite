# No-Slop Publishing Rules (mandatory)

Every string that ships to production (job pages, company pages, marketing, UI copy, Telegram, social) must pass these rules. Prefer short, plain sentences. Treat readers as busy professionals.

See also: `docs/ARTICLE_GUIDELINES.md`.

## Forbidden punctuation

| Do not use | Use instead |
|------------|-------------|
| Em dash `—` (U+2014) | Period, comma, or hyphen `-` |
| En dash `–` (U+2013) | Hyphen `-` or rewrite |
| Ellipsis `…` (U+2026) | Three dots `...` or cut the sentence |
| Curly quotes `“ ” ‘ ’` | Straight `" ' ` |
| Fancy bullets `•` in plain text | `-` or real `<ul>` |

## Forbidden filler (AI / corporate slop)

Do not use these as empty decoration:

- delve, navigate the landscape, tapestry, testament, demystify, unveil
- moreover, furthermore, crucially, vital, robust, seamless, leverage (as fluff)
- "In today's fast-paced world", "unlock your potential", "game-changing"
- Loud hard-sell CTAs: "buy now", "sign up instantly", "don't miss out"

## Voice

- Short sentences. Prefer periods over clause stacking.
- Front-load the fact. Skip throat-clearing openers.
- No colon-led list poetry in marketing headlines when a plain sentence works.
- Product language: **CV** not "resume" in CVin.Bio product copy (employer job text may keep their own wording after punctuation cleanup).

## Job listings from employers

We do **not** invent duties. We **do**:

1. Sanitize HTML (strip scripts, styles, MSO junk).
2. Run punctuation cleanup (this file).
3. Keep meaning intact.

## Enforcement

- Runtime: `src/lib/noslop.ts` (`cleanPublishText` / `cleanPublishHtml`).
- All job description rendering goes through `formatJobDescription` → noslop.
- New publish scripts must import `cleanPublishText` before insert/upsert.
- Local checks: `node scripts/check-slop.js` (expand as needed).

If content fails these rules, it is not ready to publish.
