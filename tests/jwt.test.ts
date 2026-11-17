import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { inspectJwt } from '../src/core/jwt';
import { encodeBase64 } from '../src/core/encoders';

describe('Core: JWT Inspector & Decoder', () => {
  function makeJwt(header: object, payload: object, signature = 'mock_signature'): string {
    const hB64 = encodeBase64(JSON.stringify(header), { urlSafe: true });
    const pB64 = encodeBase64(JSON.stringify(payload), { urlSafe: true });
    return `${hB64}.${pB64}.${signature}`;
  }

  it('decodes standard JWT segments and extracts claims', () => {
    const now = Math.floor(Date.now() / 1000);
    const token = makeJwt(
      { alg: 'HS256', typ: 'JWT' },
      {
        iss: 'endlessus.in',
        sub: 'usr_123',
        iat: now - 300,
        exp: now + 3600
      }
    );

    const result = inspectJwt(token);
    assert.equal(result.validFormat, true);
    assert.equal(result.algorithm, 'HS256');
    assert.equal(result.tokenType, 'JWT');
    assert.equal(result.claims.issuer, 'endlessus.in');
    assert.equal(result.claims.subject, 'usr_123');
    assert.equal(result.status, 'active');
    assert.ok(result.claims.expiresAt);
    assert.ok(result.securityWarning.includes('Client-side decoding does NOT verify cryptographic signatures'));
  });

  it('detects expired tokens accurately', () => {
    const now = Math.floor(Date.now() / 1000);
    const expiredToken = makeJwt(
      { alg: 'RS256' },
      {
        sub: 'usr_expired',
        iat: now - 7200,
        exp: now - 3600 // Expired 1 hour ago
      }
    );

    const result = inspectJwt(expiredToken);
    assert.equal(result.validFormat, true);
    assert.equal(result.status, 'expired');
    assert.ok(result.claims.expiresAt?.relative.includes('ago'));
  });

  it('rejects malformed non-JWT tokens', () => {
    const badToken = 'not.a.valid.jwt.token';
    const result = inspectJwt(badToken);
    assert.equal(result.validFormat, false);
    assert.ok(result.error?.includes('expected 3 dot-separated segments'));
  });

  it('rejects tokens with non-JSON base64 content', () => {
    const corruptToken = `${encodeBase64('bad_header')}.${encodeBase64('bad_payload')}.sig`;
    const result = inspectJwt(corruptToken);
    assert.equal(result.validFormat, false);
    assert.ok(result.error?.includes('Failed to decode'));
  });
});
