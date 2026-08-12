-- curated-jd means indexable owned copy, not "has 200 words of anything".
CREATE OR REPLACE FUNCTION jobs_auto_curated_tag()
RETURNS trigger AS $$
DECLARE
  word_count integer;
  heading_hits integer;
BEGIN
  IF NEW.description IS NOT NULL AND NEW.description != '' THEN
    word_count := array_length(regexp_split_to_array(btrim(NEW.description), '\s+'), 1);
    heading_hits := 0;
    IF NEW.description ~* 'about the role' THEN heading_hits := heading_hits + 1; END IF;
    IF NEW.description ~* 'key facts' THEN heading_hits := heading_hits + 1; END IF;
    IF NEW.description ~* 'what you''?ll do' THEN heading_hits := heading_hits + 1; END IF;
    IF NEW.description ~* 'practical notes' THEN heading_hits := heading_hits + 1; END IF;

    IF (
      word_count >= 600
      AND heading_hits >= 3
      AND (NEW.tags IS NULL OR NOT (NEW.tags @> ARRAY['curated-jd']::text[]))
    ) THEN
      NEW.tags := COALESCE(NEW.tags, ARRAY[]::text[]) || ARRAY['curated-jd']::text[];
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
