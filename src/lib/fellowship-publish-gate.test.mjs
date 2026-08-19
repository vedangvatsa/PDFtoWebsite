import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fellowshipPublishBlockReason } from './fellowship-publish-gate.mjs';

const now = new Date('2026-08-14T00:00:00.000Z');

describe('fellowshipPublishBlockReason', () => {
  it('blocks past-year cycles without a current year', () => {
    assert.equal(
      fellowshipPublishBlockReason(
        {
          title: 'Policy Summer Institute 2023',
          apply_url: 'https://buildyourfuture.withgoogle.com/internships/policy-2023',
          source: 'fellowship-discover',
        },
        now
      ),
      'closed_cycle'
    );
  });

  it('blocks news posts and careers landings', () => {
    assert.equal(
      fellowshipPublishBlockReason(
        {
          title: 'Fellowships',
          apply_url: 'https://apartresearch.com/news/explaining-the-apart-research-fellowships',
          source: 'fellowship-discover',
        },
        now
      ),
      'not_a_posting'
    );
    assert.equal(
      fellowshipPublishBlockReason(
        {
          title: 'IBM Research intern / fellow',
          apply_url: 'https://www.ibm.com/careers/research',
          source: 'fellowship-discover',
        },
        now
      ),
      'not_a_posting'
    );
  });

  it('blocks yearless fellowship-discover program directories', () => {
    assert.equal(
      fellowshipPublishBlockReason(
        {
          title: 'Hoover Fellows',
          apply_url: 'https://www.hoover.org/fellows',
          source: 'fellowship-discover',
        },
        now
      ),
      'not_a_posting'
    );
  });

  it('allows current-year calls, apply forms, and ATS rows', () => {
    assert.equal(
      fellowshipPublishBlockReason(
        {
          title: 'DC Fellowship',
          apply_url: 'https://www.governance.ai/post/dc-winter-fellowship-2027',
          source: 'fellowship-discover',
        },
        now
      ),
      null
    );
    assert.equal(
      fellowshipPublishBlockReason(
        {
          title: 'ERA:AI Fellowship Winter 2027',
          apply_url: 'https://airtable.com/appaZQNjlqYOCy4lV/pag0VHHxQWTBRmHHS/form',
          company: 'ERA',
          company_key: 'era',
          source: 'manual',
        },
        now
      ),
      null
    );
    assert.equal(
      fellowshipPublishBlockReason(
        {
          title: 'Fellows Project Program Coordinator',
          apply_url: 'https://asgi.bamboohr.com/careers/151',
          source: 'bamboohr',
        },
        now
      ),
      null
    );
  });

  it('blocks landing-page titles that are not a posting', () => {
    assert.equal(
      fellowshipPublishBlockReason(
        {
          title: 'Become a Fellow',
          apply_url: 'https://horizonpublicservice.org/programs/become-a-fellow/',
          source: 'fellowship-discover',
        },
        now
      ),
      'not_a_posting'
    );
  });

  it('allows Sequoia Capital OSS fellowship pages', () => {
    assert.equal(
      fellowshipPublishBlockReason(
        {
          title: 'Sequoia Open Source Fellowship',
          apply_url: 'https://www.sequoiacap.com/oss/',
          company: 'Sequoia Capital',
          company_key: 'sequoia-capital',
          source: 'fellowship-discover',
        },
        now
      ),
      null
    );
  });

  it('allows NASA and IISc institute pages the hub already curates', () => {
    assert.equal(
      fellowshipPublishBlockReason(
        {
          title: 'NASA Fellowships',
          apply_url: 'https://www.nasa.gov/learning-resources/internship-programs/nasa-fellowships/',
          company: 'NASA',
          company_key: 'nasa',
          source: 'fellowship-discover',
        },
        now
      ),
      null
    );
    assert.equal(
      fellowshipPublishBlockReason(
        {
          title: 'IISc AI Postdoc / Fellow',
          apply_url: 'https://www.iisc.ac.in/careers/post-doctoral-fellowship/',
          company: 'IISc',
          company_key: 'iisc',
          source: 'fellowship-discover',
        },
        now
      ),
      null
    );
  });

  it('keeps the Polymarket Science Fellowship page publishable', () => {
    assert.equal(
      fellowshipPublishBlockReason(
        {
          title: 'Polymarket Science Fellowship',
          company: 'Polymarket',
          company_key: 'polymarket',
          apply_url: 'https://polymarket.com/science-fellowship',
          source: 'fellowship-discover',
        },
        now
      ),
      null
    );
  });

});
