/**
 * CALION Tools — Hash Identifier
 * Heuristic hash type identification with confidence scoring and ambiguity warnings.
 */

export interface HashMatch {
  name: string;
  category: 'Modern Cryptographic' | 'Legacy Cryptographic' | 'Password Hash' | 'Checksum';
  confidence: 'High' | 'Medium' | 'Low';
  description: string;
  hashcatMode?: number;
  johnFormat?: string;
}

export interface HashIdentificationResult {
  input: string;
  length: number;
  charset: string;
  matches: HashMatch[];
  isAmbiguous: boolean;
  notes: string;
}

export function identifyHash(rawInput: string): HashIdentificationResult {
  const input = rawInput.trim();
  const length = input.length;

  if (length === 0) {
    return {
      input,
      length: 0,
      charset: 'Empty',
      matches: [],
      isAmbiguous: false,
      notes: 'No hash provided'
    };
  }

  // Character set analysis
  let isHex = /^[0-9a-fA-F]+$/.test(input);
  let isBase64 = /^[0-9a-zA-Z+/=_-]+$/.test(input);
  let charset = isHex ? 'Hexadecimal' : isBase64 ? 'Base64/Alphanumeric' : 'Complex / String';

  const matches: HashMatch[] = [];

  // 1. Password hash signatures (high confidence due to unique prefixes)
  if (input.startsWith('$argon2id$') || input.startsWith('$argon2i$')) {
    matches.push({
      name: input.startsWith('$argon2id$') ? 'Argon2id' : 'Argon2i',
      category: 'Password Hash',
      confidence: 'High',
      description: 'Memory-hard password hashing standard (winner of Password Hashing Competition)',
      hashcatMode: input.startsWith('$argon2id$') ? 16900 : 16700,
      johnFormat: 'argon2'
    });
  } else if (/^\$2[aby]?\$\d{2}\$[./0-9A-Za-z]{53}$/.test(input)) {
    matches.push({
      name: 'bcrypt',
      category: 'Password Hash',
      confidence: 'High',
      description: 'Blowfish-based adaptive key derivation function with cost factor',
      hashcatMode: 3200,
      johnFormat: 'bcrypt'
    });
  } else if (/^\$6\$rounds=\d+\$[./0-9A-Za-z]+\$[./0-9A-Za-z]{86}$/.test(input) || /^\$6\$[./0-9A-Za-z]+\$[./0-9A-Za-z]{86}$/.test(input)) {
    matches.push({
      name: 'SHA-512 Crypt (Unix $6$)',
      category: 'Password Hash',
      confidence: 'High',
      description: 'Standard Linux /etc/shadow salted SHA-512 crypt hash',
      hashcatMode: 1800,
      johnFormat: 'sha512crypt'
    });
  } else if (/^\$5\$rounds=\d+\$[./0-9A-Za-z]+\$[./0-9A-Za-z]{43}$/.test(input) || /^\$5\$[./0-9A-Za-z]+\$[./0-9A-Za-z]{43}$/.test(input)) {
    matches.push({
      name: 'SHA-256 Crypt (Unix $5$)',
      category: 'Password Hash',
      confidence: 'High',
      description: 'Linux /etc/shadow salted SHA-256 crypt hash',
      hashcatMode: 7400,
      johnFormat: 'sha256crypt'
    });
  } else if (/^\$1\$[./0-9A-Za-z]{1,8}\$[./0-9A-Za-z]{22}$/.test(input)) {
    matches.push({
      name: 'MD5 Crypt (Unix $1$)',
      category: 'Password Hash',
      confidence: 'High',
      description: 'Legacy BSD/Linux MD5 crypt password hash',
      hashcatMode: 500,
      johnFormat: 'md5crypt'
    });
  } else if (/^\*[0-9a-fA-F]{40}$/.test(input)) {
    matches.push({
      name: 'MySQL 4.1+ (double SHA-1)',
      category: 'Password Hash',
      confidence: 'High',
      description: 'MySQL password hash formatted with asterisk prefix: SHA1(SHA1(password))',
      hashcatMode: 300,
      johnFormat: 'mysql-sha1'
    });
  }

  // 2. Fixed-length Hex Hashes
  if (isHex) {
    switch (length) {
      case 8:
        matches.push({
          name: 'CRC-32',
          category: 'Checksum',
          confidence: 'High',
          description: '32-bit cyclic redundancy check error-detecting code',
          hashcatMode: 11500
        });
        matches.push({
          name: 'Adler-32',
          category: 'Checksum',
          confidence: 'Medium',
          description: '32-bit Adler checksum algorithm used in zlib'
        });
        break;

      case 32:
        matches.push({
          name: 'MD5',
          category: 'Legacy Cryptographic',
          confidence: 'Medium',
          description: '128-bit legacy digest. Widely used for checksums; collision-vulnerable for security.',
          hashcatMode: 0,
          johnFormat: 'raw-md5'
        });
        matches.push({
          name: 'NTLM',
          category: 'Password Hash',
          confidence: 'Medium',
          description: 'Microsoft Windows NT LAN Manager hash: MD4(UTF-16LE(password))',
          hashcatMode: 1000,
          johnFormat: 'nt'
        });
        matches.push({
          name: 'MD4',
          category: 'Legacy Cryptographic',
          confidence: 'Low',
          description: '128-bit predecessor to MD5; cryptographically broken.',
          hashcatMode: 900
        });
        matches.push({
          name: 'MD2',
          category: 'Legacy Cryptographic',
          confidence: 'Low',
          description: '128-bit legacy digest optimized for 8-bit computers'
        });
        break;

      case 40:
        matches.push({
          name: 'SHA-1',
          category: 'Legacy Cryptographic',
          confidence: 'Medium',
          description: '160-bit digest. Deprecated for signatures due to collision attacks; common in Git and legacy systems.',
          hashcatMode: 100,
          johnFormat: 'raw-sha1'
        });
        matches.push({
          name: 'RIPEMD-160',
          category: 'Legacy Cryptographic',
          confidence: 'Low',
          description: '160-bit cryptographic hash function used in Bitcoin address generation',
          hashcatMode: 6000
        });
        matches.push({
          name: 'MySQL 4.1+ (unprefixed)',
          category: 'Password Hash',
          confidence: 'Low',
          description: 'Double SHA-1 without leading asterisk',
          hashcatMode: 300
        });
        break;

      case 56:
        matches.push({
          name: 'SHA-224',
          category: 'Modern Cryptographic',
          confidence: 'High',
          description: '224-bit truncated variant of SHA-256 (NIST FIPS 180-4)',
          hashcatMode: 1300
        });
        matches.push({
          name: 'SHA3-224',
          category: 'Modern Cryptographic',
          confidence: 'Low',
          description: '224-bit Keccak permutation based hash'
        });
        break;

      case 64:
        matches.push({
          name: 'SHA-256',
          category: 'Modern Cryptographic',
          confidence: 'High',
          description: '256-bit member of SHA-2 family. Current industry standard for integrity and signatures.',
          hashcatMode: 1400,
          johnFormat: 'raw-sha256'
        });
        matches.push({
          name: 'HMAC-SHA256 (Hex representation)',
          category: 'Modern Cryptographic',
          confidence: 'Medium',
          description: 'Keyed-hash message authentication code output'
        });
        matches.push({
          name: 'SHA3-256 / Keccak-256',
          category: 'Modern Cryptographic',
          confidence: 'Low',
          description: '256-bit sponge function standard; Ethereum transaction hashing.',
          hashcatMode: 5000
        });
        matches.push({
          name: 'BLAKE2s-256',
          category: 'Modern Cryptographic',
          confidence: 'Low',
          description: 'High-performance 256-bit cryptographic hash optimized for 8 to 32-bit platforms'
        });
        break;

      case 96:
        matches.push({
          name: 'SHA-384',
          category: 'Modern Cryptographic',
          confidence: 'High',
          description: '384-bit member of SHA-2 family. Used in high-security TLS suites and CNSA Suite.',
          hashcatMode: 10800,
          johnFormat: 'raw-sha384'
        });
        matches.push({
          name: 'SHA3-384',
          category: 'Modern Cryptographic',
          confidence: 'Low',
          description: '384-bit Keccak permutation sponge function'
        });
        break;

      case 128:
        matches.push({
          name: 'SHA-512',
          category: 'Modern Cryptographic',
          confidence: 'High',
          description: '512-bit member of SHA-2 family. High resistance to collision and preimage attacks.',
          hashcatMode: 1700,
          johnFormat: 'raw-sha512'
        });
        matches.push({
          name: 'SHA3-512',
          category: 'Modern Cryptographic',
          confidence: 'Low',
          description: '512-bit Keccak permutation sponge function'
        });
        matches.push({
          name: 'BLAKE2b-512',
          category: 'Modern Cryptographic',
          confidence: 'Low',
          description: 'High-performance 512-bit cryptographic hash optimized for 64-bit platforms',
          hashcatMode: 600
        });
        break;
    }
  }

  const isAmbiguous = matches.length > 1;
  let notes = '';
  if (matches.length === 0) {
    notes = 'No known standard hash signatures matched this string.';
  } else if (isAmbiguous) {
    notes = `Multiple potential hash algorithms share this ${length}-character signature. Context (such as OS source or application protocol) is required to determine the exact type.`;
  } else {
    notes = 'Strong match identified based on length and unique pattern signature.';
  }

  return {
    input,
    length,
    charset,
    matches,
    isAmbiguous,
    notes
  };
}
