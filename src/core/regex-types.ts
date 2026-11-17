/**
 * CALION Tools — Regex Types & Limits
 */

export const MAX_PATTERN_LENGTH = 2000;
export const MAX_INPUT_LENGTH = 500000;
export const DEFAULT_REGEX_TIMEOUT_MS = 1500;

export interface RegexMatchGroup {
  index: number;
  name?: string;
  value: string;
}

export interface RegexMatchItem {
  index: number;
  endIndex: number;
  match: string;
  groups: RegexMatchGroup[];
}

export interface RegexTestResult {
  valid: boolean;
  pattern: string;
  flags: string;
  totalMatches: number;
  matches: RegexMatchItem[];
  error?: string;
  warning?: string;
  timedOut?: boolean;
}

export interface RegexReplaceResult {
  success: boolean;
  result: string;
  error?: string;
  timedOut?: boolean;
}

export interface RegexOptions {
  timeoutMs?: number;
}

export interface RegexWorkerRequest {
  id: number;
  action: 'test' | 'replace';
  pattern: string;
  flags: string;
  testText: string;
  replacement?: string;
}

export interface RegexWorkerResponse {
  id: number;
  success: boolean;
  testResult?: RegexTestResult;
  replaceResult?: RegexReplaceResult;
  error?: string;
}
