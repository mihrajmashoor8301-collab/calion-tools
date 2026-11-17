import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { testRegex, replaceRegex } from '../src/core/regex';

describe('Core: Regular Expression Tester', () => {
  it('extracts multiple matches with start and end indices', () => {
    const text = 'User admin logged in at 10.0.0.1; user guest logged in at 192.168.1.1';
    const result = testRegex('\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b', 'g', text);

    assert.equal(result.valid, true);
    assert.equal(result.totalMatches, 2);
    assert.equal(result.matches[0]?.match, '10.0.0.1');
    assert.equal(result.matches[1]?.match, '192.168.1.1');
  });

  it('captures numbered and named capturing groups', () => {
    const text = 'port: 8080 (http)';
    const result = testRegex('port:\\s*(?<portNum>\\d+)\\s*\\((?<service>\\w+)\\)', '', text);

    assert.equal(result.valid, true);
    assert.equal(result.totalMatches, 1);
    const groups = result.matches[0]?.groups ?? [];
    assert.ok(groups.some((g) => g.name === 'portNum' && g.value === '8080'));
    assert.ok(groups.some((g) => g.name === 'service' && g.value === 'http'));
  });

  it('handles regex syntax errors gracefully without crashing', () => {
    const result = testRegex('(?<unclosed', 'g', 'some text');
    assert.equal(result.valid, false);
    assert.ok(result.error);
  });

  it('handles invalid flag characters cleanly', () => {
    const result = testRegex('test', 'gz', 'some text');
    assert.equal(result.valid, false);
    assert.ok(result.error?.includes('Invalid regular expression flags'));
  });

  it('replaces regex matches with substitution pattern', () => {
    const text = 'Secret key: 12345';
    const result = replaceRegex('\\d+', 'g', text, '[REDACTED]');
    assert.equal(result.success, true);
    assert.equal(result.result, 'Secret key: [REDACTED]');
  });
});
