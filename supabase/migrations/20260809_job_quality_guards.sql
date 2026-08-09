-- Auto-tag curated-jd whenever a non-trivial description is set.
-- This ensures every populated job page renders its full description
-- instead of a 2-sentence summary, regardless of which pipeline/source
-- created the row.

CREATE OR REPLACE FUNCTION jobs_auto_curated_tag()
RETURNS trigger AS $$
BEGIN
  -- Only act when description is actually set or changed
  IF NEW.description IS NOT NULL AND NEW.description != '' THEN
    -- Add curated-jd if missing and description is substantial
    IF (NEW.tags IS NULL OR NOT (NEW.tags @> ARRAY['curated-jd']::text[])) THEN
      IF (array_length(string_to_array(NEW.description, ' '), 1) >= 200) THEN
        NEW.tags := COALESCE(NEW.tags, ARRAY[]::text[]) || ARRAY['curated-jd']::text[];
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_jobs_curated_tag ON jobs;
CREATE TRIGGER trg_jobs_curated_tag
  BEFORE INSERT OR UPDATE OF description ON jobs
  FOR EACH ROW EXECUTE FUNCTION jobs_auto_curated_tag();

-- Normalize known lowercased company names on insert/update
CREATE OR REPLACE FUNCTION jobs_normalize_company()
RETURNS trigger AS $$
BEGIN
  -- Case corrections for known offenders
  NEW.company := CASE LOWER(NEW.company)
    WHEN 'openai' THEN 'OpenAI'
    WHEN 'vercel' THEN 'Vercel'
    WHEN 'anthropic' THEN 'Anthropic'
    WHEN 'notion' THEN 'Notion'
    WHEN 'elevenlabs' THEN 'ElevenLabs'
    WHEN 'replit' THEN 'Replit'
    WHEN 'cursor' THEN 'Cursor'
    WHEN 'linear' THEN 'Linear'
    WHEN 'cohere' THEN 'Cohere'
    WHEN 'supabase' THEN 'Supabase'
    WHEN 'suno' THEN 'Suno'
    WHEN 'deepgram' THEN 'Deepgram'
    WHEN 'runway' THEN 'Runway'
    WHEN 'databricks' THEN 'Databricks'
    WHEN 'hugging face' THEN 'Hugging Face'
    WHEN 'stability ai' THEN 'Stability AI'
    WHEN 'scale ai' THEN 'Scale AI'
    WHEN 'together ai' THEN 'Together AI'
    WHEN 'perplexity' THEN 'Perplexity'
    ELSE NEW.company
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_jobs_company_case ON jobs;
CREATE TRIGGER trg_jobs_company_case
  BEFORE INSERT OR UPDATE OF company ON jobs
  FOR EACH ROW EXECUTE FUNCTION jobs_normalize_company();
