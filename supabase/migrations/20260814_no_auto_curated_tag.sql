-- curated-jd is a publish flag set by paraphrase/publish scripts.
-- Auto-tagging on description length made ingest ATS bodies public pages.
DROP TRIGGER IF EXISTS trg_jobs_curated_tag ON jobs;

CREATE OR REPLACE FUNCTION jobs_auto_curated_tag()
RETURNS trigger AS $$
BEGIN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE INDEX IF NOT EXISTS jobs_tags_gin_idx ON public.jobs USING GIN (tags);
