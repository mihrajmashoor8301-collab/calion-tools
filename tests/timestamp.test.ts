import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseTimestamp, dateToTimestamp } from '../src/core/timestamp';

describe('Core: Unix Timestamp & Date Converter', () => {
  it('correctly parses 10-digit epoch seconds', () => {
    // 1700000000 = 2023-11-14T22:13:20.000Z
    const res = parseTimestamp(1700000000);
    assert.equal(res.epochSeconds, 1700000000);
    assert.equal(res.epochMilliseconds, 1700000000000);
    assert.equal(res.unitDetected, 'seconds');
    assert.equal(res.iso8601, '2023-11-14T22:13:20.000Z');
  });

  it('correctly parses 13-digit epoch milliseconds', () => {
    const res = parseTimestamp(1700000000123);
    assert.equal(res.epochSeconds, 1700000000);
    assert.equal(res.epochMilliseconds, 1700000000123);
    assert.equal(res.unitDetected, 'milliseconds');
    assert.equal(res.iso8601, '2023-11-14T22:13:20.123Z');
  });

  it('converts ISO date strings back to epoch timestamps', () => {
    const iso = '2026-01-01T00:00:00.000Z';
    const res = dateToTimestamp(iso);
    assert.equal(res.epochSeconds, 1767225600);
    assert.equal(res.iso8601, iso);
  });

  it('throws descriptive error on invalid date string', () => {
    assert.throws(() => dateToTimestamp('not-a-date'), /Invalid date string/);
  });
});
