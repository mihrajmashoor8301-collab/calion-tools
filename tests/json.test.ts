import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateJson, formatJson, minifyJson } from '../src/core/json';

describe('Core: JSON Validator & Formatter', () => {
  it('validates correct JSON and returns statistics', () => {
    const input = '{"name": "CALION", "tools": 13, "active": true}';
    const result = validateJson(input);
    assert.equal(result.valid, true);
    assert.equal(result.stats?.type, 'object');
    assert.equal(result.stats?.keysCount, 3);
    assert.ok((result.stats?.byteSize ?? 0) > 0);
  });

  it('validates array JSON type', () => {
    const input = '[1, 2, 3, 4, 5]';
    const result = validateJson(input);
    assert.equal(result.valid, true);
    assert.equal(result.stats?.type, 'array');
    assert.equal(result.stats?.itemsCount, 5);
  });

  it('detects syntax errors with line and column information', () => {
    const badJson = '{\n  "name": "CALION",\n  "broken": \n}';
    const result = validateJson(badJson);
    assert.equal(result.valid, false);
    assert.ok(result.error);
    assert.ok(result.error?.message);
    assert.ok(result.error?.line !== undefined);
  });

  it('formats JSON with custom indent and sorts keys', () => {
    const raw = '{"z": 1, "a": 2}';
    const formatted = formatJson(raw, { indent: 2, sortKeys: true });
    assert.equal(formatted, '{\n  "a": 2,\n  "z": 1\n}');
  });

  it('minifies JSON removing unnecessary whitespace', () => {
    const raw = '{\n  "test": 123,\n  "arr": [1, 2]\n}';
    const minified = minifyJson(raw);
    assert.equal(minified, '{"test":123,"arr":[1,2]}');
  });

  it('rejects empty input', () => {
    const result = validateJson('   ');
    assert.equal(result.valid, false);
    assert.equal(result.error?.message, 'Input is empty');
  });
});
