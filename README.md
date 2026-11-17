# CALION Tools

Independent, client-side cybersecurity and developer utilities.

## Overview

CALION Tools provides fast, zero-dependency, privacy-focused security and developer tools that run entirely in the user's browser. No data, strings, tokens, or hashes are ever sent to a remote server.

## Architecture

- **Engine:** Pure TypeScript 5.7+ (strict mode enabled)
- **Bundler:** Vite 6
- **Test Framework:** Node.js native test runner (`node:test`, `node:assert/strict`) via `tsx`
- **Security:** 100% in-browser processing, zero external runtime dependencies, 0 npm vulnerabilities.

## Core Modules

1. **Encoders & Decoders (`src/core/encoders.ts`):** Base64 (Standard UTF-8 & URL-safe), URL, Hex (multiple delimiters), HTML entities, 8-bit Binary.
2. **JSON Validator & Formatter (`src/core/json.ts`):** Syntax validation, error localization (line/col), pretty-printing, key sorting, minification.
3. **Text Metrics & Case Converters (`src/core/text.ts`):** Character, word, line, and UTF-8 byte calculations, casing transforms.
4. **Cryptographic Hashes (`src/core/crypto.ts`):** Native Web Crypto API implementations of SHA-1, SHA-256, SHA-384, SHA-512 in Hex and Base64.
5. **Hash Identifier (`src/core/hash-id.ts`):** Heuristic analysis identifying MD5, NTLM, SHA families, bcrypt, Argon2, Unix crypt, with ambiguity scoring.
6. **Shannon Entropy Calculator (`src/core/entropy.ts`):** Information density measurement (0.0 to 8.0 bits/byte) with classification ratings.
7. **Hex Dump Generator (`src/core/hex-dump.ts`):** Canonical 8-digit offset, 16-byte hex dump with ASCII column and bidirectional byte parsing.
8. **IPv4 CIDR Subnet Calculator (`src/core/subnet.ts`):** Netmask, wildcard, network, broadcast, usable ranges, RFC 1918 scope, and binary visualization.
9. **JWT Inspector (`src/core/jwt.ts`):** Client-side segment decoding, standard claims analysis (`exp`, `iat`, `nbf`), and prominent unverified signature security warnings.
10. **Unix Timestamp Converter (`src/core/timestamp.ts`):** Bidirectional epoch (seconds, milliseconds) to UTC / ISO 8601 and relative time.
11. **Regex Tester (`src/core/regex.ts`):** In-browser regular expression evaluation, flag toggles, match indexing, and capture group extraction.
12. **Common Ports Reference (`src/core/ports.ts`):** Curated database of standard networking ports, services, and operational security context.
13. **Nmap Command Generator (`src/core/nmap-builder.ts`):** Interactive CLI command synthesizer with scan types, timing, NSE scripts, and safety warnings.

## Development

```bash
# Install dependencies
npm install

# Run unit test suite
npm test

# Build production bundle
npm run build
```
