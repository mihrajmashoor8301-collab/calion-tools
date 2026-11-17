/**
 * CALION Tools — Unix Timestamp & Date Converter
 * Bidirectional conversion between Unix timestamps (seconds & milliseconds) and ISO/UTC dates.
 */

export interface TimestampDetails {
  epochSeconds: number;
  epochMilliseconds: number;
  iso8601: string;
  utcString: string;
  localString: string;
  relativeTime: string;
  unitDetected: 'seconds' | 'milliseconds' | 'microseconds' | 'nanoseconds';
}

function computeRelativeTime(epochMs: number): string {
  const now = Date.now();
  const diffMs = epochMs - now;
  const absDiff = Math.abs(diffMs);

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 10) {
    return 'just now';
  }
  if (seconds < 60) {
    return diffMs > 0 ? `in ${seconds} seconds` : `${seconds} seconds ago`;
  }
  if (minutes < 60) {
    return diffMs > 0 ? `in ${minutes} minute${minutes === 1 ? '' : 's'}` : `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }
  if (hours < 24) {
    return diffMs > 0 ? `in ${hours} hour${hours === 1 ? '' : 's'}` : `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  return diffMs > 0 ? `in ${days} day${days === 1 ? '' : 's'}` : `${days} day${days === 1 ? '' : 's'} ago`;
}

export function parseTimestamp(input: string | number): TimestampDetails {
  let val: number;
  if (typeof input === 'number') {
    val = input;
  } else {
    const trimmed = input.trim();
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      val = parseFloat(trimmed);
    } else {
      // Try parsing as ISO / date string
      const parsedDate = new Date(trimmed);
      if (isNaN(parsedDate.getTime())) {
        throw new Error(`Unable to parse date or timestamp: "${input}"`);
      }
      val = parsedDate.getTime();
      return parseTimestamp(val);
    }
  }

  // Detect unit based on magnitude
  let epochMs: number;
  let epochSec: number;
  let unitDetected: TimestampDetails['unitDetected'];

  // > 10^16: Nanoseconds
  if (val > 1e16 || val < -1e16) {
    unitDetected = 'nanoseconds';
    epochMs = Math.floor(val / 1e6);
    epochSec = Math.floor(val / 1e9);
  }
  // > 10^13: Microseconds
  else if (val > 1e13 || val < -1e13) {
    unitDetected = 'microseconds';
    epochMs = Math.floor(val / 1e3);
    epochSec = Math.floor(val / 1e6);
  }
  // > 10^10: Milliseconds
  else if (val > 1e10 || val < -1e10) {
    unitDetected = 'milliseconds';
    epochMs = Math.floor(val);
    epochSec = Math.floor(val / 1000);
  }
  // Standard Seconds
  else {
    unitDetected = 'seconds';
    epochSec = Math.floor(val);
    epochMs = Math.floor(val * 1000);
  }

  const d = new Date(epochMs);
  if (isNaN(d.getTime())) {
    throw new Error(`Timestamp out of range: ${val}`);
  }

  return {
    epochSeconds: epochSec,
    epochMilliseconds: epochMs,
    iso8601: d.toISOString(),
    utcString: d.toUTCString(),
    localString: d.toLocaleString(),
    relativeTime: computeRelativeTime(epochMs),
    unitDetected
  };
}

export function dateToTimestamp(dateInput: string): TimestampDetails {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date string: "${dateInput}"`);
  }
  return parseTimestamp(d.getTime());
}

export function getCurrentTimestamp(): TimestampDetails {
  return parseTimestamp(Date.now());
}
