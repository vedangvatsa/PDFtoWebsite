import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeName,
  publicWorkExperience,
  publicEducation,
  publicCustomSections,
  repairParsedData,
  repairWorkExperienceRow,
} from './parse-guard';

describe('normalizeName — production junk from Aug 2026 signups', () => {
  it('does not eat Biology / Cvetkova via bio/cv lookahead', () => {
    assert.equal(normalizeName('Biology'), 'Biology');
    assert.equal(normalizeName('Cvetkova'), 'Cvetkova');
  });

  it('strips trailing Portfolio / Professional / job titles', () => {
    assert.equal(normalizeName('Ankush Raj Portfolio'), 'Ankush Raj');
    assert.equal(normalizeName('Abhishek Gupta Professional'), 'Abhishek Gupta');
    assert.equal(normalizeName('Kasarla Sateesh Data Analyst'), 'Kasarla Sateesh');
    assert.equal(
      normalizeName('Shailja Cybersecurity Project Manager'),
      'Shailja'
    );
  });

  it('strips IB Feb and trailing cities', () => {
    assert.match(normalizeName('Guguloth IB Feb'), /Guguloth/i);
    assert.doesNotMatch(normalizeName('Guguloth IB Feb'), /IB|Feb/i);
    assert.equal(normalizeName('Ankush Raj Vadodara'), 'Ankush Raj');
  });

  it('collapses duplicated names', () => {
    assert.equal(
      normalizeName('Muhammad Ibrahim Khanmuhammad Ibrahim Khan'),
      'Muhammad Ibrahim Khan'
    );
  });

  it('leaves a clean name alone', () => {
    assert.equal(normalizeName('John Doe'), 'John Doe');
  });
});

describe('repairWorkExperienceRow', () => {
  it('swaps company that is actually a job title', () => {
    const row = repairWorkExperienceRow({
      title: 'DIFINES Remote',
      company: 'Senior Full Stack Engineer',
      description: '',
    });
    assert.equal(row.title, 'Senior Full Stack Engineer');
    assert.equal(row.company, 'DIFINES Remote');
  });

  it('splits title – company on an em dash', () => {
    const row = repairWorkExperienceRow({
      title: 'Product Designer – Figma',
      company: '',
      description: '',
    });
    assert.equal(row.title, 'Product Designer');
    assert.equal(row.company, 'Figma');
  });

  it('clears duration-only and section-header companies', () => {
    assert.equal(
      repairWorkExperienceRow({ title: 'Engineer', company: '7 Months' }).company,
      ''
    );
    assert.equal(
      repairWorkExperienceRow({
        title: 'Engineer',
        company: 'PERSONAL INFORMATION',
      }).company,
      ''
    );
  });

  it('folds sentence-length company into description', () => {
    const row = repairWorkExperienceRow({
      title: 'Software Engineer',
      company: 'Responsible for building the payments platform used by merchants worldwide.',
      description: 'Shipped v2.',
    });
    assert.equal(row.company, '');
    assert.match(row.description, /Responsible for building/);
  });
});

describe('public render healers', () => {
  it('drops empty job and education rows', () => {
    assert.deepEqual(
      publicWorkExperience([
        { title: 'Engineer', company: 'Acme' },
        { title: '', company: '' },
      ]),
      [{ title: 'Engineer', company: 'Acme', description: '' }]
    );
    assert.deepEqual(
      publicEducation([
        { institution: 'MIT', degree: 'BS' },
        { institution: '', degree: '' },
      ]),
      [{ institution: 'MIT', degree: 'BS' }]
    );
  });

  it('hides imported CV text on the public site', () => {
    const kept = publicCustomSections([
      { sectionTitle: 'Projects' },
      { sectionTitle: 'Imported CV text' },
    ]);
    assert.equal(kept.length, 1);
    assert.equal(kept[0].sectionTitle, 'Projects');
  });
});

describe('repairParsedData always heals jobs', () => {
  it('repairs swap and drops empty rows in one pass', () => {
    const out = repairParsedData({
      personalInfo: { fullName: 'Jane Doe' },
      workExperience: [
        { title: 'DIFINES Remote', company: 'Senior Full Stack Engineer' },
        { title: '', company: '' },
      ],
    });
    assert.equal(out.workExperience.length, 1);
    assert.equal(out.workExperience[0].title, 'Senior Full Stack Engineer');
    assert.equal(out.workExperience[0].company, 'DIFINES Remote');
  });
});
