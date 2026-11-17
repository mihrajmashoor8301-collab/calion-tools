import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  encodeBase64,
  decodeBase64,
  encodeUrl,
  decodeUrl,
  encodeHex,
  decodeHex,
  encodeHtmlEntities,
  decodeHtmlEntities,
  encodeBinary,
  decodeBinary
} from '../src/core/encoders';

describe('Core: Encoders & Decoders', () => {
  describe('Base64', () => {
    it('encodes and decodes standard ASCII strings', () => {
      const original = 'Hello, World!';
      const encoded = encodeBase64(original);
      assert.equal(encoded, 'SGVsbG8sIFdvcmxkIQ==');
      assert.equal(decodeBase64(encoded), original);
    });

    it('handles UTF-8 multibyte characters and emojis', () => {
      const original = 'CALION 🔒 Cybersecurity 🛡️ Tools 2026';
      const encoded = encodeBase64(original);
      assert.equal(decodeBase64(encoded), original);
    });

    it('supports URL-safe Base64 without padding and safe chars', () => {
      const original = 'subjects?name=test&group=all>';
      const urlSafe = encodeBase64(original, { urlSafe: true });
      assert.ok(!urlSafe.includes('+'));
      assert.ok(!urlSafe.includes('/'));
      assert.ok(!urlSafe.includes('='));
      assert.equal(decodeBase64(urlSafe), original);
    });

    it('handles empty input gracefully', () => {
      assert.equal(encodeBase64(''), '');
      assert.equal(decodeBase64(''), '');
    });
  });

  describe('URL Encoding', () => {
    it('encodes standard URI components', () => {
      const input = 'https://tools.endlessus.in/path?query=val&flag=true';
      const encoded = encodeUrl(input);
      assert.equal(encoded, 'https%3A%2F%2Ftools.endlessus.in%2Fpath%3Fquery%3Dval%26flag%3Dtrue');
      assert.equal(decodeUrl(encoded), input);
    });

    it('supports encodeAll option for aggressive encoding', () => {
      const input = 'ABC 123';
      const encoded = encodeUrl(input, { encodeAll: true });
      assert.equal(encoded, '%41%42%43%20%31%32%33');
      assert.equal(decodeUrl(encoded), input);
    });

    it('decodes plus signs as spaces', () => {
      assert.equal(decodeUrl('hello+world'), 'hello world');
    });
  });

  describe('Hex Encoding', () => {
    it('encodes and decodes standard hex without delimiter', () => {
      const input = 'CALION';
      const encoded = encodeHex(input);
      assert.equal(encoded, '43414c494f4e');
      assert.equal(decodeHex(encoded), input);
    });

    it('supports space, colon, 0x and \\x delimiters', () => {
      const input = 'ABC';
      assert.equal(encodeHex(input, { delimiter: 'space' }), '41 42 43');
      assert.equal(encodeHex(input, { delimiter: 'colon' }), '41:42:43');
      assert.equal(encodeHex(input, { delimiter: 'prefix-0x' }), '0x410x420x43');
      assert.equal(encodeHex(input, { delimiter: 'prefix-slash-x' }), '\\x41\\x42\\x43');

      // Decoding should tolerate all of these delimiters
      assert.equal(decodeHex('41 42 43'), input);
      assert.equal(decodeHex('41:42:43'), input);
      assert.equal(decodeHex('0x410x420x43'), input);
      assert.equal(decodeHex('\\x41\\x42\\x43'), input);
    });

    it('throws descriptive error on malformed hex input', () => {
      assert.throws(() => decodeHex('414'), /Invalid hexadecimal string: length must be even/);
      assert.throws(() => decodeHex('41ZZ'), /Invalid hexadecimal characters detected/);
    });
  });

  describe('HTML Entities', () => {
    it('encodes critical XSS characters', () => {
      const raw = '<script>alert("XSS" & \'test\')</script>';
      const encoded = encodeHtmlEntities(raw);
      assert.ok(!encoded.includes('<'));
      assert.ok(!encoded.includes('>'));
      assert.ok(encoded.includes('&lt;'));
      assert.ok(encoded.includes('&gt;'));
      assert.ok(encoded.includes('&quot;'));
      assert.ok(encoded.includes('&#39;'));
      assert.ok(encoded.includes('&amp;'));
      assert.equal(decodeHtmlEntities(encoded), raw);
    });

    it('decodes decimal and hex numeric entities', () => {
      assert.equal(decodeHtmlEntities('&#65;&#66;&#67;'), 'ABC');
      assert.equal(decodeHtmlEntities('&#x41;&#x42;&#x43;'), 'ABC');
    });
  });

  describe('Binary (8-bit)', () => {
    it('encodes and decodes binary with space delimiter', () => {
      const input = 'Hi';
      const encoded = encodeBinary(input);
      assert.equal(encoded, '01001000 01101001');
      assert.equal(decodeBinary(encoded), input);
    });

    it('rejects invalid binary inputs', () => {
      assert.throws(() => decodeBinary('0101'), /Invalid binary string: length must be a multiple of 8 bits/);
      assert.throws(() => decodeBinary('01001002'), /Invalid binary characters/);
    });
  });
});
