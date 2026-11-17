import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  testRegex,
  replaceRegex,
  testRegexAsync,
  replaceRegexAsync,
  terminateRegexWorker,
  MAX_PATTERN_LENGTH,
  MAX_INPUT_LENGTH
} from '../src/core/regex';

describe('Core: Regular Expression Engine & ReDoS Web Worker Protection', () => {
  after(() => {
    terminateRegexWorker();
  });

  describe('Synchronous Evaluation', () => {
    it('extracts multiple matches with start and end indices', () => {
      const text = 'User admin logged in at 10.0.0.1; user guest logged in at 192.168.1.1';
      const result = testRegex('\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b', 'g', text);

      assert.equal(result.valid, true);
      assert.equal(result.totalMatches, 2);
      assert.equal(result.matches[0]?.match, '10.0.0.1');
      assert.equal(result.matches[1]?.match, '192.168.1.1');
    });

    it('handles global and zero-width matches safely without infinite loops', () => {
      const text = 'abc';
      // Match boundaries
      const result = testRegex('\\b', 'g', text);
      assert.equal(result.valid, true);
      assert.ok(result.totalMatches >= 2);
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

  describe('Input Limit Guards', () => {
    it('rejects patterns exceeding MAX_PATTERN_LENGTH', () => {
      const hugePattern = 'a'.repeat(MAX_PATTERN_LENGTH + 1);
      const res = testRegex(hugePattern, 'g', 'test');
      assert.equal(res.valid, false);
      assert.ok(res.error?.includes('Pattern exceeds maximum allowed length'));
    });

    it('rejects input text exceeding MAX_INPUT_LENGTH', () => {
      const hugeText = 'a'.repeat(MAX_INPUT_LENGTH + 1);
      const res = testRegex('test', 'g', hugeText);
      assert.equal(res.valid, false);
      assert.ok(res.error?.includes('Input text exceeds maximum allowed length'));
    });
  });

  describe('Worker Execution & ReDoS Timeout Protection', () => {
    it('executes normal matching asynchronously in worker', async () => {
      const text = 'CALION Security Protocol version 2.0';
      const res = await testRegexAsync('version\\s+(?<ver>[\\d.]+)', 'i', text, { timeoutMs: 1000 });

      assert.equal(res.valid, true);
      assert.equal(res.totalMatches, 1);
      assert.equal(res.matches[0]?.match, 'version 2.0');
      assert.ok(res.matches[0]?.groups.some((g) => g.name === 'ver' && g.value === '2.0'));
    });

    it('executes asynchronous replacement in worker', async () => {
      const text = 'Contact: test@endlessus.in or admin@endlessus.in';
      const res = await replaceRegexAsync('\\b[\\w.]+@endlessus\\.in\\b', 'g', text, '[EMAIL]', { timeoutMs: 1000 });

      assert.equal(res.success, true);
      assert.equal(res.result, 'Contact: [EMAIL] or [EMAIL]');
    });

    it('terminates worker on catastrophic backtracking (ReDoS) and returns timeout error', async () => {
      // Classic ReDoS pattern: (a+)+$ on a string of 28 'a's ending with '!'
      // In a synchronous single-threaded model, this takes > 10,000ms
      const evilPattern = '(a+)+$';
      const evilInput = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaa!';

      const start = Date.now();
      const res = await testRegexAsync(evilPattern, '', evilInput, { timeoutMs: 300 });
      const elapsed = Date.now() - start;

      // The worker should be forcefully terminated around 300ms
      assert.equal(res.valid, false);
      assert.equal(res.timedOut, true);
      assert.ok(res.error?.includes('Regex execution timed out'));
      assert.ok(elapsed >= 280 && elapsed < 2000, `Elapsed time was ${elapsed}ms`);
    });

    it('recovers immediately after worker termination and processes new queries', async () => {
      // Step 1: Trigger ReDoS termination
      const timeoutRes = await testRegexAsync('(a+)+$', '', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaa!', { timeoutMs: 200 });
      assert.equal(timeoutRes.timedOut, true);

      // Step 2: Immediate follow-up query must work because a fresh worker was spawned
      const recoveryRes = await testRegexAsync('hello', 'i', 'Hello World', { timeoutMs: 1000 });
      assert.equal(recoveryRes.valid, true);
      assert.equal(recoveryRes.totalMatches, 1);
      assert.equal(recoveryRes.matches[0]?.match, 'Hello');
    });

    it('maintains responsiveness during expensive asynchronous execution', async () => {
      // Start expensive async task in worker
      const expensivePromise = testRegexAsync('(a+)+$', '', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaa!', { timeoutMs: 400 });

      // Main thread remains responsive and can immediately compute synchronous tasks
      const start = Date.now();
      let quickCount = 0;
      for (let i = 0; i < 10000; i++) {
        quickCount++;
      }
      const syncElapsed = Date.now() - start;

      // Main thread was not blocked by the worker running in the background
      assert.equal(quickCount, 10000);
      assert.ok(syncElapsed < 50, `Main thread was blocked for ${syncElapsed}ms`);

      // Await worker completion
      const res = await expensivePromise;
      assert.equal(res.timedOut, true);
    });
  });
});
