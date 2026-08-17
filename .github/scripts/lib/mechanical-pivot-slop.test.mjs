import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hasMechanicalPivotCorruption,
  stripMechanicalPivotSlop,
} from './mechanical-pivot-slop.mjs';

test('detects broken pivot-corrupted tags and entities', () => {
  assert.equal(hasMechanicalPivotCorruption('< specifically p>Hello</ specifically p>'), true);
  assert.equal(hasMechanicalPivotCorruption('selection & meanwhile amp; mentor'), true);
  assert.equal(hasMechanicalPivotCorruption('We specifically need Python experience.'), false);
});

test('scrubs dense pivot filler and repairs markup', () => {
  const pivot = ' specifically notably meanwhile';
  const raw =
    '< specifically p>Intro' +
    pivot.repeat(50) +
    '</ specifically p>' +
    'selection & meanwhile amp; mentor' +
    pivot.repeat(50);
  const cleaned = stripMechanicalPivotSlop(raw);
  assert.equal(hasMechanicalPivotCorruption(cleaned), false);
  assert.match(cleaned, /<p>Intro/);
  assert.match(cleaned, /selection &amp; mentor/);
});
