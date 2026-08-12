-- Company about blurbs (generated, Wikipedia-derived, originality-gated).
-- Populated from .github/scripts/build-company-abouts.mjs via
-- src/lib/company-descriptions.json (canonical for site + enrich pipeline).
-- Mirrored here so company pages can read from the DB instead of the JSON.
alter table companies add column if not exists about text;
alter table companies add column if not exists about_source text;
