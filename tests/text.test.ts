import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeText,
  toUpperCase,
  toLowerCase,
  toTitleCase,
  toCamelCase,
  toSnakeCase,
  toKebabCase
} from '../src/core/text';

describe('Core: Text Metrics & Transformations', () => {
  it('calculates metrics for multiline text', () => {
    const text = 'First line with four words\nSecond line';
    const metrics = analyzeText(text);

    assert.equal(metrics.lines, 2);
    assert.equal(metrics.words, 7);
    assert.equal(metrics.charactersTotal, text.length);
    assert.equal(metrics.charactersNoSpaces, text.replace(/\s/g, '').length);
    assert.ok(metrics.bytesUtf8 >= metrics.charactersTotal);
  });

  it('handles UTF-8 multibyte characters in byte calculations', () => {
    const text = '🔒 CALION';
    const metrics = analyzeText(text);
    // 🔒 is 4 bytes in UTF-8, plus space (1) + CALION (6) = 11 bytes
    assert.equal(metrics.bytesUtf8, 11);
    assert.equal(metrics.charactersTotal, 9); // 🔒 is 2 UTF-16 code units in JS string length (2 + 1 + 6 = 9)
  });

  it('handles empty string metrics safely', () => {
    const metrics = analyzeText('');
    assert.equal(metrics.charactersTotal, 0);
    assert.equal(metrics.words, 0);
    assert.equal(metrics.lines, 0);
    assert.equal(metrics.bytesUtf8, 0);
    assert.equal(metrics.averageWordLength, 0);
  });

  it('transforms string casing accurately', () => {
    const original = 'calion security toolkit';
    assert.equal(toUpperCase(original), 'CALION SECURITY TOOLKIT');
    assert.equal(toLowerCase('CALION SEC'), 'calion sec');
    assert.equal(toTitleCase(original), 'Calion Security Toolkit');
    assert.equal(toCamelCase(original), 'calionSecurityToolkit');
    assert.equal(toSnakeCase('calionSecurityToolkit'), 'calion_security_toolkit');
    assert.equal(toKebabCase('calionSecurityToolkit'), 'calion-security-toolkit');
  });
});
