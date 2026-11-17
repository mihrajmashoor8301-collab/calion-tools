import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sha1, sha256, sha384, sha512, computeAllHashes } from '../src/core/crypto';

describe('Core: Web Crypto API Hashes', () => {
  const fox = 'The quick brown fox jumps over the lazy dog';

  describe('Empty String Test Vectors (NIST)', () => {
    it('computes correct SHA-1 for empty string', async () => {
      const res = await sha1('');
      assert.equal(res.hex, 'da39a3ee5e6b4b0d3255bfef95601890afd80709');
      assert.equal(res.bitLength, 160);
      assert.equal(res.byteLength, 20);
    });

    it('computes correct SHA-256 for empty string', async () => {
      const res = await sha256('');
      assert.equal(res.hex, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
      assert.equal(res.bitLength, 256);
      assert.equal(res.byteLength, 32);
    });

    it('computes correct SHA-384 for empty string', async () => {
      const res = await sha384('');
      assert.equal(
        res.hex,
        '38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b'
      );
      assert.equal(res.bitLength, 384);
      assert.equal(res.byteLength, 48);
    });

    it('computes correct SHA-512 for empty string', async () => {
      const res = await sha512('');
      assert.equal(
        res.hex,
        'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e'
      );
      assert.equal(res.bitLength, 512);
      assert.equal(res.byteLength, 64);
    });
  });

  describe('NIST Standard Fox Test Vectors', () => {
    it('computes SHA-1 for fox', async () => {
      const res = await sha1(fox);
      assert.equal(res.hex, '2fd4e1c67a2d28fced849ee1bb76e7391b93eb12');
    });

    it('computes SHA-256 for fox', async () => {
      const res = await sha256(fox);
      assert.equal(res.hex, 'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592');
      assert.ok(res.base64.length > 0);
    });

    it('computes SHA-384 for fox', async () => {
      const res = await sha384(fox);
      assert.equal(
        res.hex,
        'ca737f1014a48f4c0b6dd43cb177b0afd9e5169367544c494011e3317dbf9a509cb1e5dc1e85a941bbee3d7f2afbc9b1'
      );
    });

    it('computes SHA-512 for fox', async () => {
      const res = await sha512(fox);
      assert.equal(
        res.hex,
        '07e547d9586f6a73f73fbac0435ed76951218fb7d0c8d788a309d785436bbb642e93a252a954f23912547d1e8a3b5ed6e1bfd7097821233fa0538f3db854fee6'
      );
    });
  });

  it('computes all hashes in parallel with computeAllHashes', async () => {
    const all = await computeAllHashes('CALION 2026');
    assert.ok(all['SHA-1']);
    assert.ok(all['SHA-256']);
    assert.ok(all['SHA-384']);
    assert.ok(all['SHA-512']);
    assert.equal(all['SHA-256'].bitLength, 256);
  });
});
