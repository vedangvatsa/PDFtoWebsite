import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isLowQualityApplySource } from './job-apply-hosts.mjs';
import { looksLikeRawAts, looksLikeOwnedJobCopy } from './job-assemble.ts';

describe('unofficial apply boards are low quality', () => {
  it('rejects The Guardian Jobs', () => {
    assert.equal(
      isLowQualityApplySource(
        'https://jobs.theguardian.com/job/10171527/early-careers-software-development-engineer-sales-engineering/'
      ),
      true
    );
  });

  it('keeps Apple careers', () => {
    assert.equal(
      isLowQualityApplySource(
        'https://jobs.apple.com/en-gb/details/200675003/early-careers-software-development-engineer-sales-engineering'
      ),
      false
    );
  });

  it('keeps Greenhouse', () => {
    assert.equal(
      isLowQualityApplySource('https://boards.greenhouse.io/anthropic/jobs/1'),
      false
    );
  });

  it('rejects RiseIn aggregator apply URLs', () => {
    assert.equal(
      isLowQualityApplySource(
        'https://www.risein.com/other/staff-software-engineer-ai-reliability-engineering-london'
      ),
      true
    );
  });

  it('rejects We Work Remotely and RemoteOK apply URLs', () => {
    assert.equal(
      isLowQualityApplySource(
        'https://weworkremotely.com/remote-jobs/stripe-risk-strategist-card-network-compliance'
      ),
      true
    );
    assert.equal(
      isLowQualityApplySource('https://remoteok.com/remote-jobs/remote-open-roles-cleandims-1136121'),
      true
    );
  });
});

describe('raw ATS detector does not hide owned paraphrases', () => {
  const owned = `About the role
Join the sales engineering team.

What you'll do
- Build backend services.
- Ship frontend features.

Practical notes
Reasonable accommodations are available for qualified candidates. Apply on the official careers page.`;

  it('treats owned copy with one accommodation sentence as owned, not raw ATS', () => {
    assert.equal(looksLikeOwnedJobCopy(owned), true);
    assert.equal(looksLikeRawAts(owned), false);
  });

  it('flags a real ATS dump', () => {
    const ats =
      'All qualified applicants will receive consideration without regard to race. We are an equal opportunity employer. EEO is the law. Greenhouse.io posting.';
    assert.equal(looksLikeRawAts(ats), true);
  });
});
