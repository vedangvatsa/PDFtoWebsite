import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatJobDescription } from './job-description';

describe('formatJobDescription meta facts', () => {
  it('drops Visa when the value is a placeholder like None stated', () => {
    const html = formatJobDescription(
      `<h3>Key facts</h3>
<p><strong>Location:</strong> Indonesia</p>
<p><strong>Engagement:</strong> Full-Time</p>
<p><strong>Visa:</strong> None stated</p>`
    );
    assert.match(html, /Location/i);
    assert.doesNotMatch(html, /\bVisa\b/i, html);
    assert.doesNotMatch(html, /None stated/i, html);
  });

  it('drops plain-text Visa: None stated in Key facts blocks', () => {
    const html = formatJobDescription(`Key facts
Location: Indonesia
Visa: None stated
Engagement: Full-time`);
    assert.match(html, /Location/i);
    assert.doesNotMatch(html, /\bVisa\b/i, html);
  });
});
