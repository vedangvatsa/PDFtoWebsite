import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatJobDescription, JOB_DESCRIPTION_FORMAT_VERSION } from '@/lib/job-description';
import { normalizeLocation } from '@/lib/normalize-location';

const ASPEN_REQUIREMENTS = `Requirements

1. Professional experience in science, technology, engineering, or mathematics (STEM): Applicants should have significant professional experience in a STEM field. Acceptable backgrounds include, but are not limited to, working as an engineer or computer scientist at a public interest organization.

2. Potential to apply technical expertise to policy and social change
- Applicants must demonstrate passion for solving societal challenges related to science and technology.

3. Limited prior policy experience
- Applicants should not have significantly explored policy engagement previously.

4. Basic eligibility requirements
- Be at least 21 years of age by the start of the program.
- Be fluent in English.`;

const ITS_REQUIREMENTS = `Requirements

The official call for applications specifies the following eligibility and participation requirements:

- Applicants must identify as researchers, students, or professionals with a clear interest in technology and public policy.
- Applicants must select and focus their research or engagement within one of the three main program areas:

1. Rights and Technology, covering topics such as content moderation, personal data protection, artificial intelligence, privacy, intellectual property, digital identity, and connectivity.

2. GovTech, including new development models, distributed technologies, economic and social processes, and Digital Public Infrastructures (DPIs).

3. Democracy and Technology, addressing themes such as disinformation, civic engagement, AI and climate, online participation, future of work, and technodiversity.

- Applicants must demonstrate engagement with relevant topics, such as those listed above, in their academic or professional background.
- Proficiency in English is a mandatory requirement to ensure full participation in program activities and the production of analytical outputs.`;

function requirementsSection(html: string): string {
  const after = html.split('<h3>Requirements</h3>')[1] || '';
  const next = after.search(/<h3>/);
  return next === -1 ? after : after.slice(0, next);
}

describe('formatJobDescription section headings', () => {
  it('removes dangling Anthropic cross-references and links the apply sentence', () => {
    const html = formatJobDescription(
      `This page is specific to one of the Anthropic Fellows Workstreams, see also the main Anthropic Fellows posting.

Apply using this link.

Role details.`,
      null,
      { applyUrl: 'https://example.com/apply' }
    );
    assert.doesNotMatch(html, /see also the main Anthropic Fellows posting/i);
    assert.match(html, /href="https:\/\/example\.com\/apply"/);
    assert.match(html, /Apply using <a /i);
  });

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
});

describe('formatJobDescription numbered requirements', () => {
  it('bumps format version for cache invalidation', () => {
    assert.equal(JOB_DESCRIPTION_FORMAT_VERSION, 32);
  });

  it('renders Aspen STEM criteria as a single ordered list without h3/h4 headings', () => {
    const html = formatJobDescription(ASPEN_REQUIREMENTS);
    const section = requirementsSection(html);

    assert.match(section, /<ol>/);
    assert.equal((section.match(/<h3>/g) || []).length, 0);
    assert.equal((section.match(/<h4>/g) || []).length, 0);
    assert.match(
      section,
      /<strong>Professional experience in science, technology, engineering, or mathematics \(STEM\):<\/strong>/
    );
    assert.doesNotMatch(section, /<h4>[^<]*STEM[^<]*<\/h4>/);
    assert.match(section, /<strong>Basic eligibility requirements<\/strong><ul>/);
  });

  it('renders ITS Rio program areas as ordered list items, not headings', () => {
    const html = formatJobDescription(ITS_REQUIREMENTS);
    const section = requirementsSection(html);

    assert.match(section, /<ol>/);
    assert.equal((section.match(/<h4>/g) || []).length, 0);
    assert.match(section, /<li>Rights and Technology, covering topics such as/);
    assert.match(section, /<li>GovTech, including new development models/);
    assert.match(section, /<li>Democracy and Technology, addressing themes such as/);
    assert.match(section, /Proficiency in English is a mandatory requirement/);
  });

  it('keeps non-requirements numbered sub-sections as h4', () => {
    const html = formatJobDescription(`What you'll do

5. SOC Platform
- Monitor alerts.`);

    assert.match(html, /<h4>5\. SOC Platform/);
    assert.doesNotMatch(html, /<ol>/);
  });

  it('turns fellowship subsection labels into headings', () => {
    const html = formatJobDescription(
      '<p>Anthropic Fellows Program overview</p><p>Research details.</p>' +
      '<p>AI Safety Fellows</p><ul><li>Mentorship</li></ul>' +
      '<p>Unique candidate criteria</p><ul><li>Research experience</li></ul>'
    );
    assert.match(html, /<h3>Anthropic Fellows Program overview<\/h3>/);
    assert.match(html, /<h3>AI Safety Fellows<\/h3>/);
    assert.match(html, /<h3>Unique candidate criteria<\/h3>/);
  });
});

describe('formatJobDescription mechanical pivot slop', () => {
  it('repairs broken tags and strips copy-gate pivot words from dense bodies', () => {
    const pivot = ' specifically notably meanwhile';
    const body =
      '< specifically p>Anthropic mission is to create reliable AI.' +
      pivot.repeat(40) +
      '</ specifically p>' +
      '< notably li>4 months of full-time research' +
      pivot.repeat(40) +
      '</ notably li>' +
      '< meanwhile strong>Interview process</ meanwhile strong>' +
      pivot.repeat(40) +
      'selection & meanwhile amp; mentor matching' +
      pivot.repeat(40);

    const html = formatJobDescription(body);
    assert.doesNotMatch(html, /<\s*(specifically|notably|meanwhile)/i);
    assert.doesNotMatch(html, /\b(specifically|notably|meanwhile)\b/i);
    assert.match(html, /<p>Anthropic mission is to create reliable AI\./);
    assert.match(html, /4 months of full-time research/);
    assert.match(html, /<strong>Interview process<\/strong>/);
    assert.match(html, /selection &amp; mentor matching/);
  });

  it('keeps occasional legitimate uses of pivot words in short copy', () => {
    const raw = 'We specifically need someone with Python. Notably, the team works remotely.';
    const html = formatJobDescription(raw);
    assert.match(html, /specifically need someone/);
    assert.match(html, /Notably/);
  });
});

describe('normalizeLocation remote slash cleanup', () => {
  it('strips trailing slash noise from remote locations', () => {
    assert.equal(normalizeLocation('Remote (Rio /)'), 'Remote (Rio)');
  });
});
