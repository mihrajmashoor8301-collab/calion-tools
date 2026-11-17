/**
 * CALION Tools — JWT Inspector & Decoder
 * Decodes JSON Web Tokens (Header, Payload, Signature) and inspects standard claims.
 * CRITICAL: Client-side decoding does NOT verify cryptographic signatures.
 */

import { decodeBase64 } from './encoders';

export interface JwtClaimDate {
  raw: number;
  iso: string;
  utc: string;
  relative: string;
}

export interface JwtInspectionResult {
  validFormat: boolean;
  algorithm?: string;
  tokenType?: string;
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  claims: {
    issuer?: string;
    subject?: string;
    audience?: string | string[];
    jwtId?: string;
    issuedAt?: JwtClaimDate;
    notBefore?: JwtClaimDate;
    expiresAt?: JwtClaimDate;
  };
  status: 'active' | 'expired' | 'not_yet_valid' | 'unknown';
  securityWarning: string;
  error?: string;
}

function formatEpochDate(epochSec: number, nowSec: number): JwtClaimDate {
  const ms = epochSec * 1000;
  const d = new Date(ms);
  const iso = isNaN(d.getTime()) ? 'Invalid Date' : d.toISOString();
  const utc = isNaN(d.getTime()) ? 'Invalid Date' : d.toUTCString();

  const diffSec = epochSec - nowSec;
  let relative: string;
  if (Math.abs(diffSec) < 60) {
    relative = diffSec >= 0 ? 'in a few seconds' : 'a few seconds ago';
  } else if (Math.abs(diffSec) < 3600) {
    const mins = Math.round(Math.abs(diffSec) / 60);
    relative = diffSec >= 0 ? `in ${mins} minute${mins === 1 ? '' : 's'}` : `${mins} minute${mins === 1 ? '' : 's'} ago`;
  } else if (Math.abs(diffSec) < 86400) {
    const hours = Math.round(Math.abs(diffSec) / 3600);
    relative = diffSec >= 0 ? `in ${hours} hour${hours === 1 ? '' : 's'}` : `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else {
    const days = Math.round(Math.abs(diffSec) / 86400);
    relative = diffSec >= 0 ? `in ${days} day${days === 1 ? '' : 's'}` : `${days} day${days === 1 ? '' : 's'} ago`;
  }

  return { raw: epochSec, iso, utc, relative };
}

export function inspectJwt(token: string): JwtInspectionResult {
  const securityWarning =
    'SECURITY NOTICE: Client-side decoding does NOT verify cryptographic signatures. Any user can alter claims in an unverified token. Never trust unverified claims for authorization.';

  const cleaned = token.trim();
  const parts = cleaned.split('.');

  if (parts.length !== 3) {
    return {
      validFormat: false,
      header: {},
      payload: {},
      signature: '',
      claims: {},
      status: 'unknown',
      securityWarning,
      error: `Invalid JWT format: expected 3 dot-separated segments, received ${parts.length}.`
    };
  }

  const [headerB64, payloadB64, signature] = parts as [string, string, string];

  let header: Record<string, unknown> = {};
  let payload: Record<string, unknown> = {};

  try {
    const headerJson = decodeBase64(headerB64);
    header = JSON.parse(headerJson);
  } catch (err) {
    return {
      validFormat: false,
      header: {},
      payload: {},
      signature,
      claims: {},
      status: 'unknown',
      securityWarning,
      error: `Failed to decode JWT header: ${err instanceof Error ? err.message : String(err)}`
    };
  }

  try {
    const payloadJson = decodeBase64(payloadB64);
    payload = JSON.parse(payloadJson);
  } catch (err) {
    return {
      validFormat: false,
      header,
      payload: {},
      signature,
      claims: {},
      status: 'unknown',
      securityWarning,
      error: `Failed to decode JWT payload: ${err instanceof Error ? err.message : String(err)}`
    };
  }

  const algorithm = typeof header['alg'] === 'string' ? header['alg'] : undefined;
  const tokenType = typeof header['typ'] === 'string' ? header['typ'] : undefined;

  const nowSec = Math.floor(Date.now() / 1000);
  const claims: JwtInspectionResult['claims'] = {};

  if (typeof payload['iss'] === 'string') claims.issuer = payload['iss'];
  if (typeof payload['sub'] === 'string') claims.subject = payload['sub'];
  if (typeof payload['aud'] === 'string' || Array.isArray(payload['aud'])) {
    claims.audience = payload['aud'] as string | string[];
  }
  if (typeof payload['jti'] === 'string') claims.jwtId = payload['jti'];

  if (typeof payload['iat'] === 'number') {
    claims.issuedAt = formatEpochDate(payload['iat'], nowSec);
  }
  if (typeof payload['nbf'] === 'number') {
    claims.notBefore = formatEpochDate(payload['nbf'], nowSec);
  }
  if (typeof payload['exp'] === 'number') {
    claims.expiresAt = formatEpochDate(payload['exp'], nowSec);
  }

  // Determine token status based on timestamps
  let status: JwtInspectionResult['status'] = 'active';

  if (typeof payload['exp'] === 'number' && nowSec > payload['exp']) {
    status = 'expired';
  } else if (typeof payload['nbf'] === 'number' && nowSec < payload['nbf']) {
    status = 'not_yet_valid';
  }

  return {
    validFormat: true,
    algorithm,
    tokenType,
    header,
    payload,
    signature,
    claims,
    status,
    securityWarning
  };
}
