import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { identifyHash } from '../src/core/hash-id';

describe('Core: Hash Identifier', () => {
  it('identifies 32-character hex hashes (MD5 / NTLM) with ambiguity notice', () => {
    const md5Example = '5d41402abc4b2a76b9719d911017c592';
    const result = identifyHash(md5Example);

    assert.equal(result.length, 32);
    assert.equal(result.charset, 'Hexadecimal');
    assert.equal(result.isAmbiguous, true);
    assert.ok(result.matches.some((m) => m.name === 'MD5'));
    assert.ok(result.matches.some((m) => m.name === 'NTLM'));
  });

  it('identifies 64-character hex as SHA-256', () => {
    const sha256Example = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const result = identifyHash(sha256Example);

    assert.equal(result.length, 64);
    assert.ok(result.matches.some((m) => m.name === 'SHA-256' && m.confidence === 'High'));
  });

  it('identifies 128-character hex as SHA-512', () => {
    const sha512Example = 'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e';
    const result = identifyHash(sha512Example);

    assert.equal(result.length, 128);
    assert.ok(result.matches.some((m) => m.name === 'SHA-512' && m.confidence === 'High'));
  });

  it('identifies bcrypt password hashes by prefix', () => {
    const bcryptExample = '$2y$12$D.vD3XqYp8Z0u0u1YyN7eet6H5yY1F6oE/WkHqGg7V7rE8.zRzMtu';
    const result = identifyHash(bcryptExample);

    assert.ok(result.matches.some((m) => m.name === 'bcrypt' && m.confidence === 'High'));
    assert.equal(result.isAmbiguous, false);
  });

  it('identifies Argon2id password hashes', () => {
    const argonExample = '$argon2id$v=19$m=65536,t=3,p=4$someSalt$someHashOutputBytes';
    const result = identifyHash(argonExample);

    assert.ok(result.matches.some((m) => m.name === 'Argon2id' && m.confidence === 'High'));
  });

  it('identifies Linux /etc/shadow $6$ SHA-512 crypt', () => {
    const validSha512Crypt = '$6$saltsalt$' + 'a'.repeat(86);
    const result = identifyHash(validSha512Crypt);
    assert.ok(result.matches.some((m) => m.name.includes('SHA-512 Crypt')));
  });

  it('handles empty input gracefully', () => {
    const result = identifyHash('');
    assert.equal(result.length, 0);
    assert.equal(result.matches.length, 0);
  });
});
