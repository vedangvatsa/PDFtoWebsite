import { it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeLocation } from './normalize-location';

it('removes source separators from remote labels without dropping eligible regions', () => {
  assert.equal(normalizeLocation('Remote — Singapore'), 'Remote (Singapore)');
  assert.equal(normalizeLocation('Remote – Singapore'), 'Remote (Singapore)');
  assert.equal(normalizeLocation('US, CA, Remote'), 'Remote (US, CA)');
  assert.equal(normalizeLocation('US, NV, Remote; US, OR, Remote; US, AZ, Remote; US, CA, Remote'), 'Remote (US, NV; US, OR; US, AZ; US, CA)');
  assert.equal(normalizeLocation('Remote - Canada; Remote - United Kingdom'), 'Remote (Canada; United Kingdom)');
  assert.equal(normalizeLocation('Remote (Europe)'), 'Remote (Europe)');
  assert.equal(normalizeLocation('Canada (Remote)'), 'Remote (Canada)');
  assert.equal(normalizeLocation('New York, NY (Remote)'), 'Remote (New York, NY)');
});
