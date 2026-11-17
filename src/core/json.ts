/**
 * CALION Tools — JSON Validator & Formatter
 * Validates, formats, minifies JSON, with precise syntax error location detection.
 */

export interface JsonValidationResult {
  valid: boolean;
  error?: {
    message: string;
    line?: number;
    column?: number;
    snippet?: string;
  };
  stats?: {
    type: 'object' | 'array' | 'primitive';
    keysCount?: number;
    itemsCount?: number;
    byteSize: number;
  };
}

export interface JsonFormatOptions {
  indent?: 2 | 4 | '\t';
  sortKeys?: boolean;
}

function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys);
  }
  if (value !== null && typeof value === 'object') {
    const sorted: Record<string, unknown> = {};
    const keys = Object.keys(value as Record<string, unknown>).sort();
    for (const key of keys) {
      sorted[key] = sortObjectKeys((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

export function validateJson(input: string): JsonValidationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      valid: false,
      error: { message: 'Input is empty' }
    };
  }

  try {
    const parsed = JSON.parse(trimmed);
    const byteSize = new TextEncoder().encode(trimmed).length;
    let type: 'object' | 'array' | 'primitive' = 'primitive';
    let keysCount: number | undefined;
    let itemsCount: number | undefined;

    if (Array.isArray(parsed)) {
      type = 'array';
      itemsCount = parsed.length;
    } else if (parsed !== null && typeof parsed === 'object') {
      type = 'object';
      keysCount = Object.keys(parsed).length;
    }

    return {
      valid: true,
      stats: {
        type,
        keysCount,
        itemsCount,
        byteSize
      }
    };
  } catch (err) {
    const rawMsg = err instanceof Error ? err.message : String(err);
    // Parse line and column from Node / V8 message if available: "at position X" or "line Y column Z"
    let line: number | undefined;
    let column: number | undefined;
    let snippet: string | undefined;

    // Pattern 1: "... at line X column Y"
    const lineColMatch = rawMsg.match(/line (\d+) column (\d+)/i);
    if (lineColMatch && lineColMatch[1] && lineColMatch[2]) {
      line = parseInt(lineColMatch[1], 10);
      column = parseInt(lineColMatch[2], 10);
    } else {
      // Pattern 2: "... at position X"
      const posMatch = rawMsg.match(/position (\d+)/i);
      if (posMatch && posMatch[1]) {
        const pos = parseInt(posMatch[1], 10);
        const upToPos = trimmed.slice(0, pos);
        const lines = upToPos.split('\n');
        line = lines.length;
        column = (lines[lines.length - 1] ?? '').length + 1;
      } else {
        // Pattern 3: V8 snippet "...<context>" is not valid JSON
        const snippetMatch = rawMsg.match(/\.\.\.(.+)" is not valid JSON/s);
        if (snippetMatch && snippetMatch[1]) {
          const rawSnippet = snippetMatch[1];
          const pos = trimmed.indexOf(rawSnippet);
          if (pos !== -1) {
            const upToPos = trimmed.slice(0, pos);
            const lines = upToPos.split('\n');
            line = lines.length;
            column = (lines[lines.length - 1] ?? '').length + 1;
          }
        }
      }
    }

    if (line !== undefined) {
      const allLines = trimmed.split('\n');
      const errLine = allLines[line - 1] ?? '';
      snippet = `${errLine}\n${' '.repeat(Math.max(0, (column ?? 1) - 1))}^`;
    }

    return {
      valid: false,
      error: {
        message: rawMsg,
        line,
        column,
        snippet
      }
    };
  }
}

export function formatJson(input: string, options: JsonFormatOptions = {}): string {
  const parsed = JSON.parse(input);
  const data = options.sortKeys ? sortObjectKeys(parsed) : parsed;
  const indent = options.indent === '\t' ? '\t' : (options.indent ?? 2);
  return JSON.stringify(data, null, indent);
}

export function minifyJson(input: string): string {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed);
}
