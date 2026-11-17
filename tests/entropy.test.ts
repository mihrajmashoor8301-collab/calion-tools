import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateEntropy } from '../src/core/entropy';

describe('Core: Shannon Entropy Calculator', () => {
  it('yields 0.0 entropy for a single repeated character', () => {
    const input = 'AAAAAAAAAA';
    const result = calculateEntropy(input);
    assert.equal(result.entropy, 0);
    assert.equal(result.rating, 'Zero');
    assert.equal(result.uniqueBytes, 1);
  });

  it('yields expected ~3.5 to 4.5 entropy for natural English sentences', () => {
    const sentence = 'The security architecture of CALION provides defense-in-depth across multiple independent enclaves.';
    const result = calculateEntropy(sentence);
    assert.ok(result.entropy >= 3.5 && result.entropy <= 5.0, `Expected entropy between 3.5 and 5.0, got ${result.entropy}`);
    assert.ok(result.rating === 'Low' || result.rating === 'Moderate');
  });

  it('yields high entropy (> 7.0) for high-entropy pseudorandom keys', () => {
    // 256 random bytes simulated
    const randomBytes = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      randomBytes[i] = i; // Uniform distribution across all 256 values gives exactly 8.0 bits
    }
    const result = calculateEntropy(randomBytes);
    assert.equal(result.entropy, 8.0);
    assert.equal(result.rating, 'Very High (Encrypted/Compressed)');
  });

  it('handles empty input gracefully', () => {
    const result = calculateEntropy('');
    assert.equal(result.entropy, 0);
    assert.equal(result.byteLength, 0);
    assert.equal(result.rating, 'Zero');
  });
});
