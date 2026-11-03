import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeMatchScore, extractRoleFamilies, MatchUserProfile } from './job-match';

describe('job match score evaluates domain experience over loose transferable skills', () => {
  it('identifies business and engineering role families correctly from titles', () => {
    assert.deepEqual(extractRoleFamilies('Senior Product Marketing Manager'), ['marketing']);
    assert.deepEqual(extractRoleFamilies('Full Stack Developer'), ['swe', 'fullstack']);
    assert.deepEqual(extractRoleFamilies('Account Executive - Enterprise Sales'), ['sales']);
    assert.deepEqual(extractRoleFamilies('Head of People & Talent Acquisition'), ['people']);
  });

  it('severely penalizes core software engineering roles for non-engineering candidates', () => {
    // Non-engineer: e.g. Marketing Manager with common transferable skills
    const nonEngineerUser: MatchUserProfile = {
      skills: ['Python', 'Data Analysis', 'Project Management', 'Agile', 'Automation'],
      experience: [
        { title: 'Senior Product Marketing Manager', company: 'Acme Corp' },
        { title: 'Growth Marketing Lead', company: 'Startup Inc' },
      ],
      location: 'Remote, US',
      about: 'Experienced marketing leader driving GTM strategy and growth.',
    };

    const sweJob = {
      title: 'Senior Software Engineer (Backend)',
      tags: ['Python', 'API', 'Agile', 'Automation'],
      location: 'Remote',
      company: 'Tech Co',
    };

    const marketingJob = {
      title: 'Senior Product Marketing Manager',
      tags: ['Marketing', 'GTM', 'Project Management'],
      location: 'Remote',
      company: 'Tech Co',
    };

    const sweScore = computeMatchScore(nonEngineerUser, sweJob);
    const marketingScore = computeMatchScore(nonEngineerUser, marketingJob);

    // Marketing job must score significantly higher than SWE job
    assert.ok(
      marketingScore.score > sweScore.score,
      `Expected marketing score (${marketingScore.score}) > swe score (${sweScore.score})`
    );
    assert.ok(
      sweScore.signals.includes('domain: outside engineering'),
      'Expected domain mismatch signal for engineering role'
    );
    assert.ok(
      sweScore.score <= 35,
      `Expected sweScore to be heavily penalized (was ${sweScore.score})`
    );
  });

  it('awards strong domain score when past job titles match job domain', () => {
    const engineerUser: MatchUserProfile = {
      skills: ['Python', 'PostgreSQL', 'Docker'],
      experience: [
        { title: 'Backend Software Engineer', company: 'Dev Studio' },
      ],
      location: 'San Francisco, CA',
      about: 'Backend systems engineer.',
    };

    const sweJob = {
      title: 'Senior Backend Engineer',
      tags: ['Python', 'PostgreSQL'],
      location: 'Remote',
      company: 'Tech Co',
    };

    const result = computeMatchScore(engineerUser, sweJob);
    assert.ok(result.score >= 60, `Expected strong engineer score >= 60, got ${result.score}`);
    assert.ok(result.signals.some(s => s.startsWith('role:')), 'Expected role match signal');
    assert.ok(!result.signals.includes('domain: outside engineering'), 'No domain penalty for actual engineer');
  });
});
