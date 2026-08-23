import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MARKDOWN_PAGES,
  isAgentInfraPath,
  negotiatesMarkdown,
} from './agent-negotiation';

describe('negotiatesMarkdown (acceptmarkdown.com)', () => {
  it('accepts a bare text/markdown preference', () => {
    assert.equal(negotiatesMarkdown('text/markdown'), true);
  });

  it('accepts text/markdown alongside wildcards', () => {
    assert.equal(negotiatesMarkdown('text/markdown, text/html;q=0.9, */*;q=0.8'), true);
    assert.equal(negotiatesMarkdown('*/*'), false);
    assert.equal(negotiatesMarkdown('text/markdown;q=0.5, */*;q=0.4'), true);
  });

  it('rejects when html outranks markdown', () => {
    assert.equal(negotiatesMarkdown('text/html;q=1.0, text/markdown;q=0.5'), false);
  });

  it('rejects q=0 markdown', () => {
    assert.equal(negotiatesMarkdown('text/markdown;q=0'), false);
    assert.equal(negotiatesMarkdown('text/markdown;q=0.000, */*'), false);
  });

  it('rejects browsers that never ask for markdown', () => {
    assert.equal(negotiatesMarkdown(null), false);
    assert.equal(negotiatesMarkdown(''), false);
    assert.equal(
      negotiatesMarkdown(
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
      ),
      false
    );
  });

  it('is case-insensitive and whitespace tolerant', () => {
    assert.equal(negotiatesMarkdown(' Text/Markdown ;q=0.9 '), true);
  });
});

describe('isAgentInfraPath', () => {
  it('protects machine-facing surfaces from anti-scraper blocking', () => {
    assert.equal(isAgentInfraPath('/mcp'), true);
    assert.equal(isAgentInfraPath('/md/home'), true);
    assert.equal(isAgentInfraPath('/openapi.json'), true);
    assert.equal(isAgentInfraPath('/agent.txt'), true);
    assert.equal(isAgentInfraPath('/llms.txt'), true);
    assert.equal(isAgentInfraPath('/llms-full.txt'), true);
    assert.equal(isAgentInfraPath('/sitemap.xml'), true);
    assert.equal(isAgentInfraPath('/robots.txt'), true);
    assert.equal(isAgentInfraPath('/rss.xml'), true);
    assert.equal(isAgentInfraPath('/.well-known/mcp.json'), true);
  });

  it('does not protect regular pages', () => {
    assert.equal(isAgentInfraPath('/jobs'), false);
    assert.equal(isAgentInfraPath('/signup'), false);
    assert.equal(isAgentInfraPath('/some-profile-slug'), false);
  });
});

describe('MARKDOWN_PAGES', () => {
  it('covers the homepage and key trust/docs surfaces', () => {
    for (const path of ['/', '/jobs', '/about', '/contact', '/docs', '/terms', '/privacy']) {
      assert.ok(MARKDOWN_PAGES[path], `missing markdown variant for ${path}`);
    }
  });
});
