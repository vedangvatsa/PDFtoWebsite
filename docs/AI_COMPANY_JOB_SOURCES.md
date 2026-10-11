# Remote jobs from 100 prominent AI employers

The editorial roster is `.github/scripts/data/ai-companies-100.json`. It contains
exactly 100 employer brands selected using the linked Forbes AI 50, CB Insights
AI 100 and a16z consumer-AI coverage, alongside prominent labs/infrastructure
companies. This is a coverage shortlist, not a numerical ranking or a promise
that all 100 employers have fresh remote vacancies. Grammarly now recruits on
Superhuman's unified board and uses its current employer name.

## Verified sources and admission

- Runtime uses only `.github/scripts/data/ai-company-sources.json`. The roster's
  `candidateBoards` are audit hints, never automatic ingestion sources.
- Official-careers links, embedded board settings and ATS employer branding
  establish board ownership. `additionalEvidence` records less-obvious links.
- Ashby, Greenhouse (including EU hosted pages), Lever, Workable, Workday, Gem
  and JazzHR feeds retain native IDs and employer application URLs.
- Require explicit remote workplace metadata or a remote location. Hybrid,
  in-office, unspecified and merely "Worldwide" roles do not qualify. Preserve
  geographic restrictions; remote does not mean worldwide. Never infer remote
  eligibility from the employer's general culture or incidental description text.
- Require an absolute source posting/update timestamp within 30 days. Relative
  dates are never converted into new timestamps. Workday's absolute `startDate`
  comes from the individual posting; its "30+ days" label only excludes work.
- Existing banned-role, English-title, dedup and complete-description policies
  still apply. Original text is fetched independently by native posting identity,
  sanitized without rewriting, and checked before insertion. No AI calls.
  Greenhouse prospect posts (`internal_job_id: null`) and talent-pool/general
  application titles are not vacancies. Real Community Manager roles qualify.
- AI100 runs first, round-robin by company after existing-record filtering,
  sharing the 500-new-job/run and 4,000-original-body limits with other sources.
  Source detail verification remains serial; inserts are at most 75 × 2.
- `ai100:<id>` is internal provenance, hidden from displayed skill lists.

## Coverage and source limitations

Each run reports all 100 companies with feed status, total/remote/candidate
counts, exclusions and errors. Intake outcomes separately count existing jobs,
duplicates, policy exclusions, verified bodies, source failures, deferred jobs
and actual inserts. `ready` means candidates exist, not that every candidate was
inserted. Workday's unfiltered total may be capped by the upstream service;
remote pagination must be complete within a 1,000-listing bound or fail visibly.

Current special cases are recorded in the source map's `limitations`:

- **Google DeepMind:** official remote-eligible Google Careers results are
  discoverable, but lack a verified absolute posting date. They remain excluded.
- **Tabnine:** the official careers page is monitored and currently returns
  HTTP 502. This is a source failure, not zero vacancies.
- **Galileo:** its official Rippling board currently lists zero jobs. If listings
  return, report that its detail/date adapter needs review instead of silently
  treating them as zero or importing incomplete data.
- **DeepSeek:** the employer publishes a bundled careers snapshot with locations
  but no individual dates. Do not use the snapshot/import date for freshness.
- Partial job-detail failures (for example malformed JazzHR structured data)
  remain visible independently from successful jobs on the same board.

## Running and auditing

Read-only, no database credentials required:

```sh
node .github/scripts/check-ai-company-jobs.mjs --verify-samples
AI_AUDIT_IDS=openai,anthropic node .github/scripts/check-ai-company-jobs.mjs
```

Set `AI_COVERAGE_OUTPUT` to a JSON path in an existing directory to retain the
public-employer coverage report. Source discovery uses
`audit-ai-company-sources.mjs`; `--probe` checks provisional board branding.

Daily **Jobs Sync (daily original listings)** includes AI100 first. For a
bounded AI-only refresh, dispatch `.github/workflows/x-scheduler.yml` with
`scope=ai100`. The workflow uploads the `ai100-coverage` artifact for 14 days,
including when intake fails. Local equivalent with existing credentials:

```sh
JOBS_SYNC_SCOPE=ai100 node --env-file=.env.local .github/scripts/jobs-sync.mjs
```

After importing, verify actual live inventory, original-HTML coverage, company
counts, complete API pagination, job pages/schema and resource usage. A roster
size of 100 must never be presented as 100 employers with active remote jobs.
