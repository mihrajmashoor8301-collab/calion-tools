/**
 * CALION Tools — Cryptographic Hashes (Web Crypto API)
 * SHA-1, SHA-256, SHA-384, SHA-512.
 * Output in Hex and Base64 format.
 * Zero external cryptographic dependencies; runs directly in modern browsers & Node 18+.
 */

export type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

export interface HashResult {
  algorithm: HashAlgorithm;
  hex: string;
  base64: string;
  bitLength: number;
  byteLength: number;
}

function getSubtle(): SubtleCrypto {
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    return globalThis.crypto.subtle;
  }
  throw new Error('Web Crypto API (crypto.subtle) is not available in this environment');
}

export async function computeHash(input: string | Uint8Array, algorithm: HashAlgorithm): Promise<HashResult> {
  const subtle = getSubtle();
  const data = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  const hashBuffer = await subtle.digest(algorithm, data as BufferSource);
  const hashArray = new Uint8Array(hashBuffer);

  // Hex representation
  let hex = '';
  for (let i = 0; i < hashArray.length; i++) {
    hex += hashArray[i]!.toString(16).padStart(2, '0');
  }

  // Base64 representation
  let binary = '';
  for (let i = 0; i < hashArray.length; i++) {
    binary += String.fromCharCode(hashArray[i]!);
  }
  const base64 = btoa(binary);

  return {
    algorithm,
    hex,
    base64,
    bitLength: hashArray.length * 8,
    byteLength: hashArray.length
  };
}

export async function sha1(input: string | Uint8Array): Promise<HashResult> {
  return computeHash(input, 'SHA-1');
}

export async function sha256(input: string | Uint8Array): Promise<HashResult> {
  return computeHash(input, 'SHA-256');
}

export async function sha384(input: string | Uint8Array): Promise<HashResult> {
  return computeHash(input, 'SHA-384');
}

export async function sha512(input: string | Uint8Array): Promise<HashResult> {
  return computeHash(input, 'SHA-512');
}

export async function computeAllHashes(input: string | Uint8Array): Promise<Record<HashAlgorithm, HashResult>> {
  const [h1, h256, h384, h512] = await Promise.all([
    sha1(input),
    sha256(input),
    sha384(input),
    sha512(input)
  ]);
  return {
    'SHA-1': h1,
    'SHA-256': h256,
    'SHA-384': h384,
    'SHA-512': h512
  };
}
