/**
 * CALION Tools — Core Encoders & Decoders
 * Handles Base64 (Standard & URL-safe), URL, Hex, HTML Entities, and Binary.
 * Pure functions, UTF-8 compliant, zero runtime dependencies.
 */

// --- Base64 ---

export interface Base64Options {
  urlSafe?: boolean;
}

export function encodeBase64(input: string, options: Base64Options = {}): string {
  if (!input) return '';
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  let base64 = btoa(binary);
  if (options.urlSafe) {
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return base64;
}

export function decodeBase64(input: string): string {
  if (!input) return '';
  let cleaned = input.trim().replace(/-/g, '+').replace(/_/g, '/');
  // Pad with '=' if necessary
  while (cleaned.length % 4 !== 0) {
    cleaned += '=';
  }
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const decoder = new TextDecoder('utf-8', { fatal: true });
  return decoder.decode(bytes);
}

// --- URL Encoding ---

export interface UrlEncodeOptions {
  encodeAll?: boolean; // Encodes every non-alphanumeric character
}

export function encodeUrl(input: string, options: UrlEncodeOptions = {}): string {
  if (!input) return '';
  if (options.encodeAll) {
    return Array.from(new TextEncoder().encode(input))
      .map((b) => `%${b.toString(16).toUpperCase().padStart(2, '0')}`)
      .join('');
  }
  return encodeURIComponent(input);
}

export function decodeUrl(input: string): string {
  if (!input) return '';
  return decodeURIComponent(input.replace(/\+/g, '%20'));
}

// --- Hex Encoding ---

export type HexDelimiter = 'none' | 'space' | 'colon' | 'prefix-0x' | 'prefix-slash-x';

export interface HexOptions {
  delimiter?: HexDelimiter;
  uppercase?: boolean;
}

export function encodeHex(input: string, options: HexOptions = {}): string {
  if (!input) return '';
  const bytes = new TextEncoder().encode(input);
  const hexParts: string[] = [];

  for (let i = 0; i < bytes.length; i++) {
    let hex = bytes[i]!.toString(16).padStart(2, '0');
    if (options.uppercase) hex = hex.toUpperCase();

    if (options.delimiter === 'prefix-0x') {
      hexParts.push(`0x${hex}`);
    } else if (options.delimiter === 'prefix-slash-x') {
      hexParts.push(`\\x${hex}`);
    } else {
      hexParts.push(hex);
    }
  }

  if (options.delimiter === 'space') return hexParts.join(' ');
  if (options.delimiter === 'colon') return hexParts.join(':');
  if (options.delimiter === 'prefix-0x' || options.delimiter === 'prefix-slash-x') return hexParts.join('');
  return hexParts.join('');
}

export function decodeHex(input: string): string {
  if (!input) return '';
  // Clean delimiters: spaces, colons, 0x, \x, 0X, \X
  const cleaned = input
    .replace(/\\x/gi, '')
    .replace(/0x/gi, '')
    .replace(/[\s:]+/g, '')
    .trim();

  if (cleaned.length === 0) return '';
  if (cleaned.length % 2 !== 0) {
    throw new Error('Invalid hexadecimal string: length must be even');
  }
  if (!/^[0-9a-fA-F]+$/.test(cleaned)) {
    throw new Error('Invalid hexadecimal characters detected');
  }

  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes[i / 2] = parseInt(cleaned.slice(i, i + 2), 16);
  }

  const decoder = new TextDecoder('utf-8', { fatal: true });
  return decoder.decode(bytes);
}

// --- HTML Entities ---

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;'
};

const REVERSE_HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&#x2F;': '/',
  '&#47;': '/'
};

export function encodeHtmlEntities(input: string): string {
  if (!input) return '';
  return input.replace(/[&<>"'/]/g, (char) => HTML_ENTITIES[char] ?? char);
}

export function decodeHtmlEntities(input: string): string {
  if (!input) return '';
  // First replace named & standard entities
  let result = input.replace(
    /&(?:amp|lt|gt|quot|#39|apos|#x2F|#47);/gi,
    (entity) => REVERSE_HTML_ENTITIES[entity] ?? REVERSE_HTML_ENTITIES[entity.toLowerCase()] ?? entity
  );
  // Decimal numeric entities &#123;
  result = result.replace(/&#([0-9]{1,7});/g, (_, dec) => {
    const code = parseInt(dec, 10);
    return String.fromCodePoint(code);
  });
  // Hex numeric entities &#x7B;
  result = result.replace(/&#x([0-9a-fA-F]{1,6});/g, (_, hex) => {
    const code = parseInt(hex, 16);
    return String.fromCodePoint(code);
  });
  return result;
}

// --- Binary (8-bit) ---

export interface BinaryOptions {
  delimiter?: 'space' | 'none' | 'comma';
}

export function encodeBinary(input: string, options: BinaryOptions = { delimiter: 'space' }): string {
  if (!input) return '';
  const bytes = new TextEncoder().encode(input);
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i++) {
    parts.push(bytes[i]!.toString(2).padStart(8, '0'));
  }
  const sep = options.delimiter === 'none' ? '' : options.delimiter === 'comma' ? ',' : ' ';
  return parts.join(sep);
}

export function decodeBinary(input: string): string {
  if (!input) return '';
  const cleaned = input.replace(/[\s,]+/g, '').trim();
  if (cleaned.length === 0) return '';
  if (cleaned.length % 8 !== 0) {
    throw new Error('Invalid binary string: length must be a multiple of 8 bits');
  }
  if (!/^[01]+$/.test(cleaned)) {
    throw new Error('Invalid binary characters: string must contain only 0 and 1');
  }

  const bytes = new Uint8Array(cleaned.length / 8);
  for (let i = 0; i < cleaned.length; i += 8) {
    bytes[i / 8] = parseInt(cleaned.slice(i, i + 8), 2);
  }

  const decoder = new TextDecoder('utf-8', { fatal: true });
  return decoder.decode(bytes);
}
