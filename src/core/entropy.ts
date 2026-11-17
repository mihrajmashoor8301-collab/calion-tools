/**
 * CALION Tools — Shannon Entropy Calculator
 * Measures information density and randomness on a 0.0 to 8.0 scale.
 * Used for malware analysis, password strength evaluation, and packed binary detection.
 */

export interface EntropyResult {
  entropy: number; // 0.0 - 8.0 bits per byte
  maxEntropy: number; // 8.0
  percentage: number; // 0 - 100%
  rating: 'Zero' | 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High (Encrypted/Compressed)';
  byteLength: number;
  uniqueBytes: number;
  frequencies: Record<string, number>;
  interpretation: string;
}

export function calculateEntropy(input: string | Uint8Array): EntropyResult {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  const length = bytes.length;

  if (length === 0) {
    return {
      entropy: 0,
      maxEntropy: 8.0,
      percentage: 0,
      rating: 'Zero',
      byteLength: 0,
      uniqueBytes: 0,
      frequencies: {},
      interpretation: 'Empty input contains 0 bits of information.'
    };
  }

  // Count byte occurrences
  const counts: Record<number, number> = {};
  for (let i = 0; i < length; i++) {
    const b = bytes[i]!;
    counts[b] = (counts[b] ?? 0) + 1;
  }

  const uniqueBytes = Object.keys(counts).length;

  // Calculate Shannon entropy: -Sum(p * log2(p))
  let entropySum = 0;
  const frequencies: Record<string, number> = {};

  for (const [byteStr, count] of Object.entries(counts)) {
    const p = count / length;
    entropySum -= p * (Math.log(p) / Math.LN2);
    const byteNum = parseInt(byteStr, 10);
    // Display ASCII if printable, else hex
    const label = byteNum >= 32 && byteNum <= 126 ? `'${String.fromCharCode(byteNum)}'` : `0x${byteNum.toString(16).padStart(2, '0').toUpperCase()}`;
    frequencies[label] = count;
  }

  // Round to 4 decimal places
  const entropy = Math.min(8.0, Math.max(0.0, parseFloat(entropySum.toFixed(4))));
  const percentage = parseFloat(((entropy / 8.0) * 100).toFixed(1));

  let rating: EntropyResult['rating'];
  let interpretation: string;

  if (entropy === 0) {
    rating = 'Zero';
    interpretation = 'Completely uniform data (single repeating byte). Predictable with 100% certainty.';
  } else if (entropy < 3.0) {
    rating = 'Very Low';
    interpretation = 'Highly repetitive patterns, low-complexity sparse data, or simple structured sequences.';
  } else if (entropy < 4.5) {
    rating = 'Low';
    interpretation = 'Typical of natural human language (English text averages ~3.5 to 4.5 bits/byte) or unminified code.';
  } else if (entropy < 6.0) {
    rating = 'Moderate';
    interpretation = 'Dense structured data, compiled byte-code, obfuscated code, or mixed alphabets.';
  } else if (entropy < 7.2) {
    rating = 'High';
    interpretation = 'High randomness, compressed data streams (GZIP/ZIP), base64 encoded data, or strong passwords.';
  } else {
    rating = 'Very High (Encrypted/Compressed)';
    interpretation = 'Near-maximum information density. Consistent with strong cryptographic ciphertext, random seeds, or compressed binaries.';
  }

  return {
    entropy,
    maxEntropy: 8.0,
    percentage,
    rating,
    byteLength: length,
    uniqueBytes,
    frequencies,
    interpretation
  };
}
