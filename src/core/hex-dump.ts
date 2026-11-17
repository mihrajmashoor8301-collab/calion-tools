/**
 * CALION Tools — Hex Dump Generator
 * Generates canonical 8-digit offset, 16-byte hex dump with printable ASCII column.
 */

export interface HexDumpOptions {
  bytesPerLine?: number; // default 16
  uppercase?: boolean;   // default false
  showAscii?: boolean;   // default true
  showOffset?: boolean;  // default true
}

export interface HexDumpLine {
  offset: string;
  hex: string;
  ascii: string;
  rawBytes: number[];
}

export function generateHexDump(
  input: string | Uint8Array,
  options: HexDumpOptions = {}
): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  const bytesPerLine = options.bytesPerLine ?? 16;
  const uppercase = options.uppercase ?? false;
  const showAscii = options.showAscii ?? true;
  const showOffset = options.showOffset ?? true;

  if (bytes.length === 0) {
    return '';
  }

  const lines: string[] = [];

  for (let offset = 0; offset < bytes.length; offset += bytesPerLine) {
    const chunk = bytes.slice(offset, offset + bytesPerLine);

    // 1. Offset
    let offsetStr = offset.toString(16).padStart(8, '0');
    if (uppercase) offsetStr = offsetStr.toUpperCase();

    // 2. Hex bytes formatted into two groups of 8
    const hexBytes: string[] = [];
    for (let i = 0; i < bytesPerLine; i++) {
      if (i < chunk.length) {
        let b = chunk[i]!.toString(16).padStart(2, '0');
        if (uppercase) b = b.toUpperCase();
        hexBytes.push(b);
      } else {
        hexBytes.push('  '); // padding for incomplete last line
      }
    }

    const firstGroup = hexBytes.slice(0, 8).join(' ');
    const secondGroup = hexBytes.slice(8).join(' ');
    const hexCol = `${firstGroup}  ${secondGroup}`;

    // 3. ASCII representation
    let asciiCol = '';
    if (showAscii) {
      for (let i = 0; i < chunk.length; i++) {
        const b = chunk[i]!;
        // Printable ASCII is 32 through 126
        asciiCol += b >= 32 && b <= 126 ? String.fromCharCode(b) : '.';
      }
    }

    // Assemble line
    let line = '';
    if (showOffset) {
      line += `${offsetStr}:  `;
    }
    line += `${hexCol}`;
    if (showAscii) {
      line += `  |${asciiCol}|`;
    }

    lines.push(line);
  }

  return lines.join('\n');
}

export function parseHexDumpToBytes(hexDump: string): Uint8Array {
  const lines = hexDump.trim().split('\n');
  const bytes: number[] = [];

  for (const line of lines) {
    // Strip offset if present (e.g., "00000000:  ")
    let body = line.replace(/^[0-9a-fA-F]{4,8}:\s*/, '');
    // Strip ASCII margin if present (e.g. "|....|")
    body = body.replace(/\|.*\|$/, '');

    // Extract hex byte pairs
    const hexMatches = body.match(/[0-9a-fA-F]{2}/g);
    if (hexMatches) {
      for (const hex of hexMatches) {
        bytes.push(parseInt(hex, 16));
      }
    }
  }

  return new Uint8Array(bytes);
}
