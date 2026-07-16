-- Free-tier performance: indexes for common filters/sorts.
-- Note: jobs.external_id and jobs.dedup_hash are already UNIQUE (have unique indexes).
-- telegram may already have idx_jobs_telegram_posted from 20260417 migration.
-- IF NOT EXISTS makes this safe to re-run.

CREATE INDEX IF NOT EXISTS jobs_created_at_idx ON public.jobs (created_at);
CREATE INDEX IF NOT EXISTS jobs_external_id_idx ON public.jobs (external_id);
CREATE INDEX IF NOT EXISTS jobs_dedup_hash_idx ON public.jobs (dedup_hash);
CREATE INDEX IF NOT EXISTS jobs_telegram_posted_at_idx ON public.jobs (telegram_posted_at);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (username);
