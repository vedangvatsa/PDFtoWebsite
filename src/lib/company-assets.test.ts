import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isUnpublishableCompanyBlurb } from './company-about';
import { listCompanyMeta } from './company-data';
import { getCompanyLinks } from './company-links';

const here = path.dirname(fileURLToPath(import.meta.url));

function duplicateJsonKeys(raw: string): string[] {
  const counts = new Map<string, number>();
  const re = /^\s*"([^"]+)":/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    counts.set(m[1], (counts.get(m[1]) || 0) + 1);
  }
  return [...counts.entries()].filter(([, n]) => n > 1).map(([k]) => k);
}

function hostOf(url: string): string {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

describe('company-domains.json', () => {
  const raw = fs.readFileSync(path.join(here, 'company-domains.json'), 'utf8');
  const domains = JSON.parse(raw) as Record<string, string>;

  it('has no duplicate keys (last-key-wins would hide bad mappings)', () => {
    assert.deepEqual(duplicateJsonKeys(raw), []);
  });

  it('never maps known companies to the wrong sites', () => {
    const forbidden: Array<[string, string]> = [
      ['glas', 'glassdoor.com'],
      ['teleskope', 'teleskop-express.de'],
      ['bookkeeper360', 'bookkeepers.com'],
    ];
    for (const [key, badHost] of forbidden) {
      const host = hostOf(domains[key] || '');
      assert.notEqual(host, badHost, `${key} must not resolve to ${badHost}`);
    }
    assert.equal(domains.kraken123, undefined, 'kraken123 is blocklisted junk');
  });

  it('keeps the corrected official sites', () => {
    assert.equal(hostOf(domains.glas), 'glas.agency');
    assert.equal(hostOf(domains.teleskope), 'teleskope.ai');
    assert.equal(hostOf(domains.bookkeeper360), 'bookkeeper360.com');
  });
});

describe('company socials and overlay', () => {
  it('rejects corrupted handles (aboright residue)', () => {
    const overlay = JSON.parse(
      fs.readFileSync(path.join(here, 'company-links.json'), 'utf8')
    ) as Record<string, Record<string, string>>;
    const urls: string[] = [];
    for (const meta of listCompanyMeta()) {
      urls.push(meta.website, ...Object.values(meta.socials || {}));
    }
    for (const extra of Object.values(overlay)) {
      urls.push(...Object.values(extra));
    }
    for (const url of urls.filter(Boolean)) {
      assert.match(url, /^https:\/\//, url);
      assert.doesNotMatch(url, /aboright/i, url);
    }
  });

  it('keeps high-profile overlay websites', () => {
    for (const slug of ['openai', 'databricks', 'anduril', 'spacex', 'teleskope', 'era', 'nasa', 'iisc']) {
      const links = getCompanyLinks(slug);
      assert.ok(links.website, `${slug} needs a website`);
    }
    assert.equal(getCompanyLinks('era').website, 'https://erafellowship.org');
    assert.equal(getCompanyLinks('nasa').website, 'https://www.nasa.gov');
    assert.ok(getCompanyLinks('nasa').linkedin?.includes('linkedin.com/company/nasa'));
    assert.ok(getCompanyLinks('nasa').github?.includes('github.com/nasa'));
    assert.equal(getCompanyLinks('iisc').website, 'https://www.iisc.ac.in');
    assert.ok(getCompanyLinks('iisc').linkedin?.includes('indian-institute-of-science'));
    assert.equal(getCompanyLinks('iisc').x, 'https://x.com/iiscbangalore');
  });
});

describe('company-descriptions.json', () => {
  it('contains no We Work Remotely aggregator dumps', () => {
    const desc = JSON.parse(
      fs.readFileSync(path.join(here, 'company-descriptions.json'), 'utf8')
    ) as Record<string, string>;
    const bad = Object.entries(desc).filter(([, text]) => isUnpublishableCompanyBlurb(text) && /we work remotely/i.test(text));
    assert.deepEqual(
      bad.map(([k]) => k),
      [],
      'WWR dumps must not stay in the cache'
    );
  });
});
