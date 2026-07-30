-- Materialized company directory for /companies (option D).
-- Rebuilt by .github/scripts/rebuild-companies.mjs after jobs-sync.
-- Avoids scanning tens of thousands of job rows on every page ISR.

CREATE TABLE IF NOT EXISTS public.companies (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role_count INTEGER NOT NULL DEFAULT 0,
  logo TEXT,
  locations TEXT[] NOT NULL DEFAULT '{}',
  latest_job_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS companies_role_count_idx
  ON public.companies (role_count DESC);

CREATE INDEX IF NOT EXISTS companies_name_idx
  ON public.companies (name);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read companies" ON public.companies;
CREATE POLICY "Anyone can read companies"
  ON public.companies FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role can manage companies" ON public.companies;
CREATE POLICY "Service role can manage companies"
  ON public.companies FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Raw per-company stats from jobs (last N days). App applies name map / blocklist.
-- Note: PostgREST often caps statements ~8–10s; rebuild-companies prefers
-- management SQL or paginated scan when this times out. Indexes:
-- jobs_company_idx, jobs_created_at_company_idx help a lot.
CREATE OR REPLACE FUNCTION public.jobs_company_stats(days integer DEFAULT 30)
RETURNS TABLE (
  company text,
  role_count bigint,
  logo text,
  locations text[],
  latest_job_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET statement_timeout = '120s'
AS $$
  SELECT
    j.company,
    count(*)::bigint AS role_count,
    min(j.company_logo) FILTER (
      WHERE j.company_logo IS NOT NULL AND btrim(j.company_logo) <> ''
    ) AS logo,
    (array_agg(j.location) FILTER (
      WHERE j.location IS NOT NULL
        AND btrim(j.location) <> ''
        AND j.location !~* 'remote|hybrid|worldwide|anywhere'
    ))[1:6] AS locations,
    max(coalesce(j.published_at, j.created_at)) AS latest_job_at
  FROM public.jobs j
  WHERE j.created_at > (now() - make_interval(days => greatest(days, 1)))
    AND j.company IS NOT NULL
    AND btrim(j.company) <> ''
    AND j.company NOT LIKE '%...%'
  GROUP BY j.company;
$$;

CREATE INDEX IF NOT EXISTS jobs_company_idx ON public.jobs (company);
CREATE INDEX IF NOT EXISTS jobs_created_at_company_idx ON public.jobs (created_at DESC, company);

REVOKE ALL ON FUNCTION public.jobs_company_stats(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.jobs_company_stats(integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.jobs_company_stats(integer) TO anon;
GRANT EXECUTE ON FUNCTION public.jobs_company_stats(integer) TO authenticated;

COMMENT ON TABLE public.companies IS
  'Directory of hiring companies; rebuilt from jobs by rebuild-companies.mjs / jobs-sync.';
