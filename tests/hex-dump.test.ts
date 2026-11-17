import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateHexDump, parseHexDumpToBytes } from '../src/core/hex-dump';

describe('Core: Hex Dump Generator', () => {
  it('generates canonical 16-byte hex dump with offset and ASCII margin', () => {
    const input = 'CALION Security Toolkit 2026';
    const dump = generateHexDump(input);

    const lines = dump.split('\n');
    assert.ok(lines.length >= 2);
    // Line 1 offset starts with 00000000:
    assert.ok(lines[0]!.startsWith('00000000:  '));
    // Line 1 contains ASCII margin with pipes
    assert.ok(lines[0]!.endsWith('|CALION Security |'));
  });

  it('handles non-printable binary bytes with dots in ASCII column', () => {
    const bytes = new Uint8Array([0x00, 0x01, 0x02, 0x41, 0x42, 0xff]);
    const dump = generateHexDump(bytes);
    assert.ok(dump.includes('|...AB.|'));
  });

  it('can reconstruct original bytes from a generated hex dump', () => {
    const original = 'Endlessus Network Protocol';
    const dump = generateHexDump(original);
    const parsedBytes = parseHexDumpToBytes(dump);
    const decoded = new TextDecoder().decode(parsedBytes);
    assert.equal(decoded, original);
  });

  it('handles empty input gracefully', () => {
    const dump = generateHexDump('');
    assert.equal(dump, '');
  });
});
