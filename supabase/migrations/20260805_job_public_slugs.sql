-- Pretty public job slug, minted at insert time.
--
-- Every job gets a `slug` = `{company_slug}_{jobSlug}` so its public URL is
-- ALWAYS /{company}/{jobSlug} — never /jobs/{uuid}. The slug is the canonical
-- source of truth for URLs; external_id stays the source dedup key.
--
-- format: 20260805_job_public_slugs.sql
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS slug TEXT;

-- A given {company_slug}_{jobSlug} may exist only once across the table.
CREATE UNIQUE INDEX IF NOT EXISTS jobs_slug_key
  ON jobs (slug)
  WHERE slug IS NOT NULL;

-- Equality lookups for the /[company]/[jobSlug] route.
CREATE INDEX IF NOT EXISTS idx_jobs_slug ON jobs (slug);
