-- Applied via Supabase MCP at 20261009105804; keep the local history aligned.
-- Keep all data and ownership constraints. Bound lock waits on the live Nano.
SET lock_timeout = '2s';
SET statement_timeout = '15s';

-- Backend-only event writes must not bypass the application's validation and
-- rate limits through PostgREST. Public profile/editor policies remain intact.
REVOKE ALL ON TABLE public.email_events, public.email_opens,
  public.parse_logs, public.contact_submissions FROM anon, authenticated;
GRANT ALL ON TABLE public.email_events, public.email_opens,
  public.parse_logs, public.contact_submissions TO service_role;
DROP POLICY IF EXISTS allow_all ON public.email_events;
DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON public.contact_submissions;
ALTER POLICY "Service role can read all submissions" ON public.contact_submissions
  TO service_role USING (true);
ALTER POLICY "Service role can manage jobs" ON public.jobs
  TO service_role USING (true) WITH CHECK (true);
ALTER POLICY "Service role can manage companies" ON public.companies
  TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS profiles_public_read ON public.profiles;
ALTER POLICY "Users can insert their own profile." ON public.profiles
  TO authenticated WITH CHECK ((select auth.uid()) = id);
ALTER POLICY "Users can update own profile." ON public.profiles
  TO authenticated USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);

CREATE OR REPLACE FUNCTION public.increment_views(profile_id uuid)
RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path = '' AS $$
  UPDATE public.profiles SET views = coalesce(views, 0) + 1 WHERE id = profile_id;
$$;

CREATE OR REPLACE FUNCTION public.batch_increment_jobs(job_ids uuid[], col_name text)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  IF cardinality(job_ids) NOT BETWEEN 1 AND 50 OR col_name NOT IN ('views', 'clicks') THEN
    RAISE EXCEPTION 'invalid tracking event' USING ERRCODE = '22023';
  END IF;
  IF col_name = 'views' THEN
    UPDATE public.jobs SET views = coalesce(views, 0) + 1 WHERE id = ANY(job_ids);
  ELSE
    UPDATE public.jobs SET clicks = coalesce(clicks, 0) + 1 WHERE id = ANY(job_ids);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.jobs_company_stats(days integer DEFAULT 30)
RETURNS TABLE(company text, role_count bigint, logo text, locations text[], latest_job_at timestamptz)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' SET statement_timeout = '8s' AS $$
  SELECT j.company, count(*)::bigint,
    min(j.company_logo) FILTER (WHERE j.company_logo IS NOT NULL AND btrim(j.company_logo) <> ''),
    (array_agg(j.location) FILTER (WHERE j.location IS NOT NULL AND btrim(j.location) <> ''
      AND j.location !~* 'remote|hybrid|worldwide|anywhere'))[1:6],
    max(greatest(j.published_at, j.created_at))
  FROM public.jobs j
  WHERE (j.created_at > now() - make_interval(days => greatest(1, least(days, 90)))
    OR j.published_at > now() - make_interval(days => greatest(1, least(days, 90))))
    AND j.company IS NOT NULL AND btrim(j.company) <> '' AND j.company NOT LIKE '%...%'
  GROUP BY j.company;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_views(uuid),
  public.batch_increment_jobs(uuid[], text), public.jobs_company_stats(integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_views(uuid),
  public.batch_increment_jobs(uuid[], text), public.jobs_company_stats(integer) TO service_role;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

-- Sitemap projection: evaluate eligibility in Postgres, transfer only URLs
-- and timestamps. Keyset paging uses the retained unique username index.
CREATE OR REPLACE FUNCTION public.profile_sitemap_page(after_username text DEFAULT '', page_size integer DEFAULT 250)
RETURNS TABLE(username text, updated_at timestamptz)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' SET statement_timeout = '8s' AS $$
  SELECT p.username, p.updated_at
  FROM public.profiles p
  WHERE p.username > coalesce(after_username, '') AND length(p.username) >= 3
    AND p.full_name IS NOT NULL AND p.full_name <> 'Your Name' AND length(p.full_name) > 1
    AND (length(p.about) > 10
      OR CASE WHEN jsonb_typeof(p.skills) = 'array' THEN jsonb_array_length(p.skills) > 0 ELSE false END
      OR CASE WHEN jsonb_typeof(p.experience) = 'array' THEN jsonb_array_length(p.experience) > 0 ELSE false END
      OR CASE WHEN jsonb_typeof(p.education) = 'array' THEN jsonb_array_length(p.education) > 0 ELSE false END)
  ORDER BY p.username
  LIMIT greatest(1, least(page_size, 250));
$$;
REVOKE ALL ON FUNCTION public.profile_sitemap_page(text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.profile_sitemap_page(text, integer) TO service_role;

-- Only proven redundant indexes. Retain the unique username/dedup constraints.
DROP INDEX IF EXISTS public.idx_jobs_tags;
DROP INDEX IF EXISTS public.idx_jobs_dedup_hash;
DROP INDEX IF EXISTS public.jobs_dedup_hash_idx;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_username_unique;

NOTIFY pgrst, 'reload schema';
