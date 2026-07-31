-- company_key: normalized company slug for equality filters (kills public ILIKE scans).
-- Backfill via .github/scripts/backfill-company-key.mjs (batched) after column exists.

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS company_key TEXT;

-- Partial index: only rows with a key, sorted for "recent jobs at company" lists.
CREATE INDEX IF NOT EXISTS jobs_company_key_created_idx
  ON public.jobs (company_key, created_at DESC)
  WHERE company_key IS NOT NULL AND company_key <> '';

-- Cover external_id lookups used by /{company}/{jobSlug} (already unique often, but ensure).
CREATE INDEX IF NOT EXISTS jobs_external_id_lookup_idx
  ON public.jobs (external_id)
  WHERE external_id IS NOT NULL;

COMMENT ON COLUMN public.jobs.company_key IS
  'Normalized company slug (toCompanyKey); use .eq(company_key) not ILIKE company on public pages.';
