import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function src(rel: string) {
  return readFileSync(join(root, rel), 'utf8');
}

describe('timeout must never become a public 404', () => {
  it('fetchProfileRow throws ProfileUnavailableError instead of returning null', () => {
    const file = src('src/lib/supabase-server.ts');
    assert.match(file, /throw new ProfileUnavailableError/);
    assert.match(file, /withRetryOnTimeout/);
    assert.match(file, /lookupPublicProfile/);
    assert.doesNotMatch(
      file,
      /return \{ data: null, error: null \}/,
      'swallowing DB failures as a missing row is what 404d live profiles'
    );
  });

  it('public page throws unavailable instead of notFound() on outage', () => {
    const page = src('src/app/[slug]/(hub)/page.tsx');
    assert.match(page, /lookupPublicProfile/);
    assert.match(page, /ProfileUnavailableError/);
    assert.match(page, /status === 'unavailable'/);
  });

  it('profile APIs return 503 on unavailable', () => {
    for (const rel of [
      'src/app/api/profile/[username]/route.ts',
      'src/app/api/autofill-ai/route.ts',
      'src/app/api/avatar/[slug]/route.ts',
    ]) {
      const file = src(rel);
      assert.match(file, /lookupPublicProfile/, rel);
      assert.match(file, /status: 503/, rel);
    }
  });

  it('selects a slim profile column list, not *', () => {
    const file = src('src/lib/supabase-server.ts');
    assert.match(file, /PROFILE_SELECT/);
    assert.doesNotMatch(file, /\.select\('\*'\)/);
    assert.match(file, /publicWorkExperience/);
    assert.match(file, /publicEducation/);
    assert.match(file, /publicCustomSections/);
  });
});

describe('every parse path heals before persist', () => {
  it('regex fallback calls repairParsedData', () => {
    const file = src('src/lib/parse-resume-fallback.ts');
    assert.match(file, /data = repairParsedData\(data/);
  });

  it('AI parse route calls repairParsedData', () => {
    const file = src('src/app/api/parse-resume/route.ts');
    assert.match(file, /repairParsedData\(aiStructuredData/);
  });

  it('repairParsedData runs cross-row public healers before persist', () => {
    const file = src('src/lib/parse-guard.ts');
    assert.match(file, /data\.workExperience = publicWorkExperience/);
    assert.match(file, /data\.education = publicEducation/);
    assert.match(file, /data\.skills = splitSkills/);
  });
});

describe('PDF soft-wrap and LinkedIn trailer healing stays wired', () => {
  it('formatWorkExperienceDescription rejoins soft-wraps before display', () => {
    const file = src('src/lib/parse-guard.ts');
    assert.match(file, /function joinSoftWrappedLines/);
    assert.match(file, /joinSoftWrappedLines\(preserveUploadedCvText/);
  });

  it('peels both Title\\nCompany and Company\\nTitle trailers onto prose/city next rows', () => {
    const file = src('src/lib/parse-guard.ts');
    assert.match(file, /Title then company/);
    assert.match(file, /looksLikeProseTitle/);
    assert.match(file, /looksLikeLocationField\(title\) \|\| looksLikeProseTitle\(title\)/);
  });

  it('public profile render heals experience, education, and skills', () => {
    const file = src('src/lib/supabase-server.ts');
    assert.match(file, /workExperience: publicWorkExperience/);
    assert.match(file, /education: publicEducation/);
    assert.match(file, /skills: splitSkills/);
  });

  it('profile template joins soft-wrapped lines with spaces, not bare breaks', () => {
    const file = src('src/app/[slug]/templates/modern-creative.tsx');
    assert.match(file, /block\.lines\.join\(' '\)/);
    assert.doesNotMatch(file, /block\.lines\.join\('<br>'\)/);
  });

  it('regression tests cover soft-wrap peel, glued skills, and city education', () => {
    const file = src('src/lib/parse-guard.test.ts');
    assert.match(file, /rejoins PDF soft-wraps and peels Title/);
    assert.match(file, /splits PDF-glued skill blobs/);
    assert.match(file, /merges city-as-institution rows/);
  });
});
