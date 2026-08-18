import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  fingerprint,
  classifyPost,
  applyPostsToPerformance,
  emptyPerformance,
  isFlopItem,
  pickThreadsCandidate,
  uniqueWinnerItems,
} from './threads-queue.mjs';

const now = Date.parse('2026-08-18T12:00:00Z');

describe('threads-queue', () => {
  it('fingerprints ignore /th CTA rewrites', () => {
    const a = fingerprint('Pay me enough to live.\n\ncvin.bio/jobs');
    const b = fingerprint('Pay me enough to live.\n\nhttps://cvin.bio/jobs/th');
    assert.equal(a, b);
  });

  it('classifies winners, flops, and too-new posts', () => {
    assert.equal(classifyPost({ likes: 200, views: 100, timestamp: '2026-07-01T00:00:00Z' }, now), 'win');
    assert.equal(classifyPost({ likes: 10, views: 9000, timestamp: '2026-07-01T00:00:00Z' }, now), 'win');
    assert.equal(classifyPost({ likes: 3, views: 100, shares: 0, reposts: 0, timestamp: '2026-07-01T00:00:00Z' }, now), 'flop');
    assert.equal(classifyPost({ likes: 3, views: 100, timestamp: '2026-08-17T00:00:00Z' }, now), 'pending');
    assert.equal(classifyPost({ likes: 80, views: 2000, timestamp: '2026-07-01T00:00:00Z' }, now), 'mid');
  });

  it('never demotes a winner to a flop', () => {
    const items = [{ id: 'w1', text: 'I quit to a bad manager. cvin.bio/jobs', img: 'a.png' }];
    let perf = emptyPerformance();
    perf = applyPostsToPerformance(perf, [{
      text: 'I quit to a bad manager. cvin.bio/jobs/th',
      likes: 17000,
      views: 500000,
      timestamp: '2026-06-09T00:00:00Z',
    }], items, now);
    perf = applyPostsToPerformance(perf, [{
      text: 'I quit to a bad manager. cvin.bio/jobs',
      likes: 2,
      views: 50,
      timestamp: '2026-07-01T00:00:00Z',
    }], items, now);
    const fp = fingerprint(items[0].text);
    assert.ok(perf.winners[fp]);
    assert.equal(perf.flops[fp], undefined);
  });

  it('skips known flops and recycles winners when the queue is exhausted', () => {
    const items = [
      { text: 'this flopped hard on threads', img: 'flop.png' },
      { text: 'untested caption that should go out', img: 'new.png' },
      { text: 'I quit to a bad manager. cvin.bio/jobs', img: 'win.png' },
    ];
    let perf = emptyPerformance();
    perf = applyPostsToPerformance(perf, [
      { text: items[0].text, likes: 1, views: 40, timestamp: '2026-07-01T00:00:00Z' },
      { text: items[2].text, likes: 17591, views: 518261, timestamp: '2026-06-09T00:00:00Z' },
    ], items, now);

    const first = pickThreadsCandidate({ items, index: 0, performance: perf, recentPrefixes: [] });
    assert.equal(first.kind, 'forward');
    assert.equal(first.index, 1);
    assert.deepEqual(first.skippedFlops, [0]);

    const recycled = pickThreadsCandidate({
      items,
      index: items.length,
      recycleIndex: 0,
      performance: perf,
      recentPrefixes: [],
    });
    assert.equal(recycled.kind, 'recycle');
    assert.equal(recycled.index, 2);

    const blocked = pickThreadsCandidate({
      items,
      index: items.length,
      recycleIndex: 0,
      performance: perf,
      recentPrefixes: [items[2].text.slice(0, 120).toLowerCase()],
    });
    assert.equal(blocked.kind, 'none');
  });

  it('orders recycle pool by likes', () => {
    const items = [
      { text: 'mid winner caption one', img: 'a.png' },
      { text: 'top winner caption two', img: 'b.png' },
    ];
    let perf = emptyPerformance();
    perf = applyPostsToPerformance(perf, [
      { text: items[0].text, likes: 250, views: 1000, timestamp: '2026-07-01T00:00:00Z' },
      { text: items[1].text, likes: 12000, views: 50000, timestamp: '2026-07-01T00:00:00Z' },
    ], items, now);
    const winners = uniqueWinnerItems(items, perf);
    assert.equal(winners[0].index, 1);
    assert.equal(winners[1].index, 0);
  });

  it('does not treat a flop as recyclable', () => {
    const items = [{ text: 'nobody liked this one', img: 'x.png' }];
    const perf = applyPostsToPerformance(emptyPerformance(), [{
      text: items[0].text, likes: 0, views: 12, timestamp: '2026-07-01T00:00:00Z',
    }], items, now);
    assert.equal(isFlopItem(items[0], perf), true);
    const pick = pickThreadsCandidate({ items, index: 0, performance: perf });
    assert.equal(pick.kind, 'none');
  });
});
