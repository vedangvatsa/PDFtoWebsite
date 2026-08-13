import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseResumeText } from './resume-parser';
import { tryRegexResumeFallback } from './parse-resume-fallback';

describe('regex title/company', () => {
  it('does not split "Title at Company, Inc" on the comma', () => {
    const parsed = parseResumeText(`Jane Doe
jane@example.com

EXPERIENCE
Senior Engineer at Acme, Inc
January 2020 – Present
Built the payments API.
`);
    const job = parsed.workExperience[0];
    assert.ok(job, 'expected a work row');
    assert.match(String(job.title), /Engineer/i);
    assert.doesNotMatch(String(job.company), /^Inc\.?$/i);
  });

  it('does not swap when the current title already looks like a job title', () => {
    const parsed = parseResumeText(`Jane Doe
jane@example.com

EXPERIENCE
Senior Full Stack Engineer
DIFINES Remote
January 2023 – Present
Shipped product.
`);
    const job = parsed.workExperience[0];
    assert.ok(job, 'expected a work row');
    assert.match(String(job.title), /Full Stack Engineer/i);
    assert.match(String(job.company), /DIFINES/i);
  });
});

describe('regex fallback always repairs', () => {
  it('runs salvage through repairParsedData', () => {
    const data = tryRegexResumeFallback(`Muhammad Ibrahim Khan
khan@example.com

EXPERIENCE
Software Engineer at Acme
January 2021 – Present
Wrote TypeScript.
`, { fileName: 'cv.pdf', reason: 'test' });
    assert.ok(data);
    assert.equal(data._parseMethod, 'regex');
    assert.ok(data.personalInfo?.fullName);
    assert.doesNotMatch(String(data.personalInfo.fullName), /Biology|^Bio /i);
  });
});
