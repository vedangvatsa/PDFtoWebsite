import { it } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { encodeCacheValue, decodeCacheValue, CACHE_SLOT_BYTES } from './cache-value';

it('reads existing uncompressed entries and round-trips small values', () => {
  const value = { html: '<h1>Profile</h1>', revalidate: 300 };
  assert.deepEqual(decodeCacheValue(JSON.stringify(value)), value);
  assert.deepEqual(decodeCacheValue(encodeCacheValue(value)!), value);
});
it('stores an oversized HTML refresh within the same bounded slot', () => {
  const value = { html: '<article>Company — Montréal 東京</article>'.repeat(10_000) };
  assert.ok(Buffer.byteLength(JSON.stringify(value)) > CACHE_SLOT_BYTES);
  const encoded = encodeCacheValue(value);
  assert.ok(encoded?.startsWith('gzip:'));
  assert.ok(Buffer.byteLength(encoded!) <= CACHE_SLOT_BYTES);
  assert.deepEqual(decodeCacheValue(encoded!), value);
});
it('bounds incompressible and excessively large entries', () => {
  assert.equal(encodeCacheValue(randomBytes(200_000).toString('base64')), null);
  assert.equal(encodeCacheValue('x'.repeat(2_000_001)), null);
});
it('rejects corrupt compressed entries', () => {
  assert.throws(() => decodeCacheValue('gzip:not-gzip'));
});
