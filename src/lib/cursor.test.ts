import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodeCursor, decodeCursor } from './cursor';

test('encodeCursor round-trips an offset', () => {
  const cursor = encodeCursor(120);
  assert.equal(typeof cursor, 'string');
  assert.ok(!cursor.includes('='));
  assert.equal(decodeCursor(cursor), 120);
});

test('encodeCursor clamps negatives to zero', () => {
  assert.equal(decodeCursor(encodeCursor(-5)), 0);
});

test('decodeCursor rejects garbage, foreign JSON, and bad offsets', () => {
  assert.equal(decodeCursor('not-a-cursor'), null);
  assert.equal(decodeCursor(Buffer.from('{"n":1}').toString('base64url')), null);
  assert.equal(decodeCursor(Buffer.from('{"o":-10}').toString('base64url')), null);
  assert.equal(decodeCursor(Buffer.from('{"o":1.5}').toString('base64url')), null);
  assert.equal(decodeCursor(Buffer.from('"string"').toString('base64url')), null);
});

test('cursor is opaque across a realistic paging sequence', () => {
  let offset = 0;
  const seen = new Set<string>();
  for (let page = 0; page < 5; page++) {
    const cursor = encodeCursor(offset);
    assert.ok(!seen.has(cursor));
    seen.add(cursor);
    offset = decodeCursor(cursor)! + 50;
  }
  assert.equal(offset, 250);
});
