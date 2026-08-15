import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatJobDescription } from '@/lib/job-description';

describe('formatJobDescription section headings', () => {
  it('renders common PayJoy-style section titles as bold h3, not plain paragraphs', () => {
    const raw = `About the role
Intro paragraph.

Core Principles
Values paragraph.

Key Responsibilities
- Task one
- Task two

Compensation and Benefits
Package details.

Application Details
Apply on the portal.`;

    const html = formatJobDescription(raw);
    assert.match(html, /<h3>Core Principles<\/h3>/);
    assert.match(html, /<h3>Key Responsibilities<\/h3>/);
    assert.match(html, /<h3>Compensation and Benefits<\/h3>/);
    assert.match(html, /<h3>Application Details<\/h3>/);
    assert.doesNotMatch(html, /<p>Key Responsibilities<\/p>/);
    assert.doesNotMatch(html, /<p>Core Principles<\/p>/);
  });

  it('promotes bare HTML paragraph section titles to h3', () => {
    const raw =
      '<p>Key Responsibilities</p><ul><li>One</li></ul><p>Compensation and Benefits</p><p>Details</p>';
    const html = formatJobDescription(raw);
    assert.match(html, /<h3>Key Responsibilities<\/h3>/);
    assert.match(html, /<h3>Compensation and Benefits<\/h3>/);
  });

  it('keeps numbered Requirements criteria in an ordered list with bold labels', () => {
    const raw = `Requirements
1. Professional experience in science, technology, engineering, or mathematics (STEM): Applicants should have STEM experience.
2. Potential to apply technical expertise to policy and social change
- Applicants must demonstrate passion.
3. Limited prior policy experience
- Applicants should not have explored policy.`;

    const html = formatJobDescription(raw);
    assert.match(html, /<h3>Requirements<\/h3>/);
    assert.match(html, /<ol>/);
    assert.match(html, /<strong>Professional experience in science, technology, engineering, or mathematics \(STEM\):<\/strong>/);
    assert.match(html, /<strong>Potential to apply technical expertise to policy and social change:<\/strong>/);
    assert.doesNotMatch(html, /<h3>2\. Potential/i);
    assert.doesNotMatch(html, /<h4>2\. Potential/i);
  });

  it('renders ITS-style numbered program areas as h4 sub-headings', () => {
    const raw = `Requirements
Intro line.

1. Rights and Technology, covering topics such as privacy.
2. GovTech, including distributed technologies.
3. Democracy and Technology, addressing disinformation.`;

    const html = formatJobDescription(raw);
    assert.match(html, /<h4>1\. Rights and Technology, covering topics such as privacy\.<\/h4>/);
    assert.match(html, /<h4>2\. GovTech, including distributed technologies\.<\/h4>/);
    assert.doesNotMatch(html, /<p>1\. Rights and Technology/i);
  });
});
