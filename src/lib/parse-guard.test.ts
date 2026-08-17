import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeName,
  publicWorkExperience,
  publicEducation,
  publicCustomSections,
  repairParsedData,
  repairWorkExperienceRow,
  enrichNameFromContact,
  preserveUploadedCvText,
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

  it('rejects PDF section headings used as a name', () => {
    assert.equal(normalizeName('Top Skills'), '');
    assert.equal(normalizeName('Technical Skills'), '');
    assert.equal(
      enrichNameFromContact('Top Skills', { email: 'kamlesh.nagware@gmail.com' }),
      'Kamlesh Nagware'
    );
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

  it('clears parenthetical duration titles and city-as-company', () => {
    const row = repairWorkExperienceRow({
      title: '(8 months)',
      company: 'Pune, Maharashtra, India',
      description: 'Built the payments platform.',
    });
    assert.equal(row.title, '');
    assert.equal(row.company, '');
    assert.match(String(row.location), /Pune/i);
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

  it('peels the next LinkedIn role off a PDF-wrapped description', () => {
    const rows = publicWorkExperience([
      {
        title: 'Founder',
        company: 'FSV Labs',
        startDate: 'May 2024',
        endDate: 'Present',
        description:
          'FSV Labs is a digital transformation company.\nXPI- The Extended Payment Interface\nCo-Founder',
      },
      {
        title: '(8 months)',
        company: 'Pune, Maharashtra, India',
        startDate: 'December 2025',
        endDate: 'Present',
        description: 'XPI is a modular payments platform.',
      },
    ]);
    assert.equal(rows.length, 2);
    assert.equal(rows[0].title, 'Founder');
    assert.doesNotMatch(String(rows[0].description), /Co-Founder/);
    assert.equal(rows[1].title, 'Co-Founder');
    assert.match(String(rows[1].company), /XPI/i);
  });

  it('decodes PDF HTML entities and drops page footers', () => {
    const text = preserveUploadedCvText(
      'IT Consulting & amp; Blockchain. Page 1 of 18 IndiaFSV Labs'
    );
    assert.match(text, /IT Consulting & Blockchain/);
    assert.doesNotMatch(text, /Page 1 of 18/);
    assert.match(text, /India FSV/);
  });

  it('merges PDF metric cards and split bullets into real jobs', () => {
    const rows = publicWorkExperience([
      {
        title: '19 Years',
        company: 'Annual Billings Supported',
        description:
          'Business Growth Delivered\n500%\nDirect Commercial Team Led\n35 Professionals\nSHETHINK PRIVATE LIMITED (SOURCEBAE)',
      },
      {
        title: 'Head of Sales',
        company: 'to-Market engine serving customers across India, USA and UK.',
        startDate: 'June 2023',
        endDate: 'Present',
        description: 'Lead the commercial organization with a predictable Go-\nKey Contributions & Business Impact',
      },
      {
        title: 'advisor beyond day-to-day sales leadership.',
        company: '',
        description: 'Established a structured commercial operating cadence.\nSUPERSOURCING',
      },
      {
        title: 'Sales Growth Manager',
        company: 'serving global customers.',
        startDate: 'August 2022',
        endDate: 'May 2023',
        description: 'Led enterprise business development.\nV & RANE BROS.',
      },
      {
        title: 'Manager',
        company: 'Sales & Marketing',
        startDate: 'June 2015',
        endDate: 'June 2020',
        description: 'Led commercial operations.\nLG ELECTRONICS INDIA PVT. LTD.',
      },
      {
        title: 'Regional Marketing Manager',
        company: '',
        startDate: 'May 2013',
        endDate: 'April 2015',
        description: 'Led regional marketing.\nLIFESTYLE INTERNATIONAL PVT. LTD.',
      },
      {
        title: 'Manager',
        company: 'Operations',
        startDate: 'March 2011',
        endDate: 'May 2013',
        description: 'Led a 40-member operations team.',
      },
    ]);
    assert.equal(rows.length, 5);
    assert.equal(rows[0].title, 'Head of Sales');
    assert.match(String(rows[0].company), /SOURCEBAE|SHETHINK/i);
    assert.match(String(rows[0].description), /Go-to-Market engine serving/i);
    assert.match(String(rows[0].description), /operating cadence/i);
    assert.doesNotMatch(String(rows[0].title), /advisor beyond/i);
    assert.equal(rows[1].title, 'Sales Growth Manager');
    assert.match(String(rows[1].company), /SUPERSOURCING/i);
    assert.equal(rows[2].title, 'Manager, Sales & Marketing');
    assert.match(String(rows[2].company), /V & RANE BROS/i);
    assert.equal(rows[3].title, 'Regional Marketing Manager');
    assert.match(String(rows[3].company), /LG ELECTRONICS/i);
    assert.equal(rows[4].title, 'Manager, Operations');
    assert.match(String(rows[4].company), /LIFESTYLE INTERNATIONAL/i);
  });

  it('merges a field-of-study institution into the following school row', () => {
    const rows = publicEducation([
      {
        institution: 'Marketing',
        degree: 'Master of Business Administration (Marketing)',
      },
      {
        institution: 'Prestige Institute of Management & Research (PIMR)',
        degree: 'Affiliated to Devi Ahilya Vishwavidyalaya (DAVV), Indore',
      },
    ]);
    assert.equal(rows.length, 1);
    assert.match(String(rows[0].institution), /PIMR|Prestige Institute/i);
    assert.match(String(rows[0].degree), /Master of Business Administration/i);
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

  it('persists merged PDF wrap jobs so future uploads are not saved as fake headings', () => {
    const out = repairParsedData({
      personalInfo: { fullName: 'Achint Rane' },
      workExperience: [
        {
          title: '19 Years',
          company: 'Annual Billings Supported',
          description: 'Business Growth Delivered\n500%\nSHETHINK PRIVATE LIMITED (SOURCEBAE)',
        },
        {
          title: 'Head of Sales',
          company: 'to-Market engine serving customers across India, USA and UK.',
          startDate: 'June 2023',
          endDate: 'Present',
          description: 'Lead the commercial organization with a predictable Go-\nKey Contributions',
        },
        {
          title: 'advisor beyond day-to-day sales leadership.',
          company: '',
          description: 'Established a structured commercial operating cadence.\nSUPERSOURCING',
        },
        {
          title: 'Sales Growth Manager',
          company: 'serving global customers.',
          startDate: 'August 2022',
          endDate: 'May 2023',
          description: 'Led enterprise business development.',
        },
      ],
      education: [
        { institution: 'Marketing', degree: 'Master of Business Administration (Marketing)' },
        {
          institution: 'Prestige Institute of Management & Research (PIMR)',
          degree: 'Affiliated to DAVV, Indore',
        },
      ],
    });
    assert.equal(out.workExperience.length, 2);
    assert.equal(out.workExperience[0].title, 'Head of Sales');
    assert.match(String(out.workExperience[0].company), /SOURCEBAE|SHETHINK/i);
    assert.doesNotMatch(String(out.workExperience[0].title), /19 Years|advisor beyond/i);
    assert.equal(out.workExperience[1].title, 'Sales Growth Manager');
    assert.match(String(out.workExperience[1].company), /SUPERSOURCING/i);
    assert.equal(out.education.length, 1);
    assert.match(String(out.education[0].institution), /PIMR|Prestige/i);
  });
});
