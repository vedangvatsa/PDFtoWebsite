import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyCanonicalCompany,
  companyNameFromApply,
  isRegistryCompanyLabel,
  registrableHostLabel,
} from './company-host.mjs';

const iisc = 'https://www.iisc.ac.in/careers/post-doctoral-fellowship/';

describe('registrableHostLabel', () => {
  it('uses the org label on compound public suffixes, not ac/co/edu', () => {
    assert.equal(registrableHostLabel('iisc.ac.in'), 'iisc');
    assert.equal(registrableHostLabel('www.iisc.ac.in'), 'iisc');
    assert.equal(registrableHostLabel('ox.ac.uk'), 'ox');
    assert.equal(registrableHostLabel('careers.ox.ac.uk'), 'ox');
    assert.equal(registrableHostLabel('bbc.co.uk'), 'bbc');
    assert.equal(registrableHostLabel('sydney.edu.au'), 'sydney');
    assert.equal(registrableHostLabel('example.gov.uk'), 'example');
    assert.equal(registrableHostLabel('jobs.ashbyhq.com'), 'ashbyhq');
  });
});

describe('companyNameFromApply', () => {
  it('repairs IISc and never emits AC/CO/EDU', () => {
    assert.equal(companyNameFromApply('iisc', iisc), 'IISc');
    assert.equal(companyNameFromApply('AC', iisc), 'IISc');
    assert.equal(companyNameFromApply('ac', iisc), 'IISc');
    assert.equal(companyNameFromApply('co', 'https://www.bbc.co.uk/careers'), 'BBC');
    assert.equal(companyNameFromApply('edu', 'https://www.sydney.edu.au/jobs'), 'Sydney');
  });

  it('stamps ingest rows so AC cannot be stored', () => {
    const row = applyCanonicalCompany({ company: 'AC', apply_url: iisc });
    assert.equal(row.company, 'IISc');
  });

  it('does not treat real brands as registry labels', () => {
    assert.equal(isRegistryCompanyLabel('AC'), true);
    assert.equal(isRegistryCompanyLabel('IISc'), false);
    assert.equal(isRegistryCompanyLabel('iisc'), false);
  });

  it('maps nasa.gov to NASA', () => {
    assert.equal(companyNameFromApply('Nasa', 'https://www.nasa.gov/learning-resources/internship-programs/nasa-fellowships/'), 'NASA');
    assert.equal(companyNameFromApply('nasa', 'https://www.nasa.gov/careers'), 'NASA');
  });

  it('maps erafellowship.org to ERA', () => {
    assert.equal(
      companyNameFromApply('erafellowship', 'https://erafellowship.org/fellowship'),
      'ERA'
    );
    assert.equal(
      companyNameFromApply('ERA', 'https://airtable.com/appaZQNjlqYOCy4lV/pag0VHHxQWTBRmHHS/form'),
      'ERA'
    );
  });
});
