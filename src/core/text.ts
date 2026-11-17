/**
 * CALION Tools — Text Metrics & Transformations
 * Calculates character, word, line, and byte metrics with string case transformations.
 */

export interface TextMetrics {
  charactersTotal: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  bytesUtf8: number;
  longestLineLength: number;
  averageWordLength: number;
}

export function analyzeText(input: string): TextMetrics {
  const charactersTotal = input.length;
  const charactersNoSpaces = input.replace(/\s/g, '').length;

  const trimmed = input.trim();
  const words = trimmed ? (trimmed.match(/\S+/g) ?? []).length : 0;

  const linesArr = input.split(/\r?\n/);
  const lines = input.length === 0 ? 0 : linesArr.length;

  const bytesUtf8 = new TextEncoder().encode(input).length;

  let longestLineLength = 0;
  for (const line of linesArr) {
    if (line.length > longestLineLength) {
      longestLineLength = line.length;
    }
  }

  const averageWordLength = words > 0 ? parseFloat((charactersNoSpaces / words).toFixed(2)) : 0;

  return {
    charactersTotal,
    charactersNoSpaces,
    words,
    lines,
    bytesUtf8,
    longestLineLength,
    averageWordLength
  };
}

export function toUpperCase(input: string): string {
  return input.toUpperCase();
}

export function toLowerCase(input: string): string {
  return input.toLowerCase();
}

export function toTitleCase(input: string): string {
  return input.replace(/\b\w+/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
  });
}

export function toCamelCase(input: string): string {
  return input
    .trim()
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toLowerCase());
}

export function toSnakeCase(input: string): string {
  return input
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();
}

export function toKebabCase(input: string): string {
  return input
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
}
