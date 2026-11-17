/**
 * CALION Tools — Safe Regular Expression Engine with Web Worker & ReDoS Protection
 * Evaluates regular expressions in an isolated worker thread with configurable timeout
 * and automatic worker termination on catastrophic backtracking.
 */

import {
  MAX_PATTERN_LENGTH,
  MAX_INPUT_LENGTH,
  DEFAULT_REGEX_TIMEOUT_MS,
  RegexTestResult,
  RegexReplaceResult,
  RegexOptions,
  RegexWorkerRequest,
  RegexWorkerResponse
} from './regex-types';
import { executeRegexTest, executeRegexReplace } from './regex-eval';

export * from './regex-types';

interface InternalWorkerAdapter {
  postMessage(data: RegexWorkerRequest): void;
  terminate(): void | Promise<number>;
  onMessage(callback: (data: RegexWorkerResponse) => void): void;
  onError(callback: (err: unknown) => void): void;
}

// In-line evaluator code for Node.js worker_threads fallback during unit tests
const NODE_WORKER_CODE = `
const { parentPort } = require('node:worker_threads');

function executeRegexTest(pattern, flags, testText) {
  if (!pattern) return { valid: true, pattern: '', flags, totalMatches: 0, matches: [] };
  if (!/^[gimsuy]*$/.test(flags)) return { valid: false, pattern, flags, totalMatches: 0, matches: [], error: 'Invalid regular expression flags: "' + flags + '". Allowed: g, i, m, s, u, y' };

  let regex;
  try {
    regex = new RegExp(pattern, flags);
  } catch (err) {
    return { valid: false, pattern, flags, totalMatches: 0, matches: [], error: err instanceof Error ? err.message : String(err) };
  }

  const matches = [];
  const isGlobal = flags.includes('g') || flags.includes('y');
  let warning;

  try {
    if (!isGlobal) {
      const singleMatch = regex.exec(testText);
      if (singleMatch) {
        const groups = [];
        for (let i = 1; i < singleMatch.length; i++) {
          if (singleMatch[i] !== undefined) groups.push({ index: i, value: singleMatch[i] });
        }
        if (singleMatch.groups) {
          for (const [name, val] of Object.entries(singleMatch.groups)) {
            if (val !== undefined) {
              const existing = groups.find((g) => g.value === val);
              if (existing) existing.name = name;
              else groups.push({ index: -1, name, value: val });
            }
          }
        }
        matches.push({ index: singleMatch.index, endIndex: singleMatch.index + singleMatch[0].length, match: singleMatch[0], groups });
      }
    } else {
      let match;
      let count = 0;
      const MAX_MATCHES = 10000;
      while ((match = regex.exec(testText)) !== null) {
        count++;
        if (count > MAX_MATCHES) {
          warning = 'Truncated results: exceeded limit of ' + MAX_MATCHES + ' matches.';
          break;
        }
        const groups = [];
        for (let i = 1; i < match.length; i++) {
          if (match[i] !== undefined) groups.push({ index: i, value: match[i] });
        }
        if (match.groups) {
          for (const [name, val] of Object.entries(match.groups)) {
            if (val !== undefined) {
              const existing = groups.find((g) => g.value === val);
              if (existing) existing.name = name;
              else groups.push({ index: -1, name, value: val });
            }
          }
        }
        matches.push({ index: match.index, endIndex: match.index + match[0].length, match: match[0], groups });
        if (match[0].length === 0) regex.lastIndex++;
      }
    }
  } catch (execErr) {
    return { valid: false, pattern, flags, totalMatches: 0, matches: [], error: 'Execution error: ' + (execErr instanceof Error ? execErr.message : String(execErr)) };
  }
  return { valid: true, pattern, flags, totalMatches: matches.length, matches, warning };
}

function executeRegexReplace(pattern, flags, testText, replacement) {
  try {
    const regex = new RegExp(pattern, flags);
    const result = testText.replace(regex, replacement);
    return { success: true, result };
  } catch (err) {
    return { success: false, result: testText, error: err instanceof Error ? err.message : String(err) };
  }
}

parentPort.on('message', (req) => {
  try {
    if (req.action === 'test') {
      const res = executeRegexTest(req.pattern, req.flags, req.testText);
      parentPort.postMessage({ id: req.id, success: res.valid, testResult: res, error: res.error });
    } else {
      const res = executeRegexReplace(req.pattern, req.flags, req.testText, req.replacement ?? '');
      parentPort.postMessage({ id: req.id, success: res.success, replaceResult: res, error: res.error });
    }
  } catch (err) {
    parentPort.postMessage({ id: req.id, success: false, error: err instanceof Error ? err.message : String(err) });
  }
});
`;

async function createWorkerAdapter(): Promise<InternalWorkerAdapter> {
  // 1. Browser Web Worker
  if (typeof globalThis !== 'undefined' && typeof (globalThis as unknown as { Worker?: unknown }).Worker === 'function') {
    const WorkerCtor = (globalThis as unknown as { Worker: new (url: URL, opts: { type: string }) => Worker }).Worker;
    const worker = new WorkerCtor(new URL('./regex-worker.ts', import.meta.url), { type: 'module' });

    return {
      postMessage(data: RegexWorkerRequest) {
        worker.postMessage(data);
      },
      terminate() {
        worker.terminate();
      },
      onMessage(callback: (data: RegexWorkerResponse) => void) {
        worker.onmessage = (e: MessageEvent<RegexWorkerResponse>) => callback(e.data);
      },
      onError(callback: (err: unknown) => void) {
        worker.onerror = (e) => callback(e);
      }
    };
  }

  // 2. Node.js worker_threads
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    const { Worker } = await import('node:worker_threads');
    const worker = new Worker(NODE_WORKER_CODE, { eval: true });

    return {
      postMessage(data: RegexWorkerRequest) {
        worker.postMessage(data);
      },
      terminate() {
        return worker.terminate();
      },
      onMessage(callback: (data: RegexWorkerResponse) => void) {
        worker.on('message', callback);
      },
      onError(callback: (err: unknown) => void) {
        worker.on('error', callback);
      }
    };
  }

  throw new Error('Worker environment not available');
}

class RegexEngine {
  private worker: InternalWorkerAdapter | null = null;
  private messageSeq = 0;
  private pendingResolvers = new Map<number, (res: RegexWorkerResponse) => void>();

  private async getWorker(): Promise<InternalWorkerAdapter> {
    if (!this.worker) {
      this.worker = await createWorkerAdapter();
      this.worker.onMessage((res) => {
        const resolve = this.pendingResolvers.get(res.id);
        if (resolve) {
          this.pendingResolvers.delete(res.id);
          resolve(res);
        }
      });
      this.worker.onError((err) => {
        console.error('Regex Worker encountered error:', err);
        this.terminate();
      });
    }
    return this.worker;
  }

  public terminate(): void {
    if (this.worker) {
      try {
        this.worker.terminate();
      } catch {
        // Ignore termination errors
      }
      this.worker = null;
    }
    this.pendingResolvers.clear();
  }

  public async execute(
    request: Omit<RegexWorkerRequest, 'id'>,
    timeoutMs = DEFAULT_REGEX_TIMEOUT_MS
  ): Promise<RegexWorkerResponse> {
    const id = ++this.messageSeq;
    const worker = await this.getWorker();

    return new Promise<RegexWorkerResponse>((resolve) => {
      let timer: NodeJS.Timeout | number | null = null;

      const cleanup = () => {
        if (timer !== null) {
          clearTimeout(timer as NodeJS.Timeout);
          timer = null;
        }
        this.pendingResolvers.delete(id);
      };

      timer = setTimeout(() => {
        cleanup();
        // Forcefully kill the hung worker to stop ReDoS backtracking
        this.terminate();

        const timeoutMsg = `Regex execution timed out after ${timeoutMs}ms (possible catastrophic backtracking / ReDoS). Worker safely terminated.`;
        if (request.action === 'test') {
          resolve({
            id,
            success: false,
            error: timeoutMsg,
            testResult: {
              valid: false,
              pattern: request.pattern,
              flags: request.flags,
              totalMatches: 0,
              matches: [],
              timedOut: true,
              error: timeoutMsg
            }
          });
        } else {
          resolve({
            id,
            success: false,
            error: timeoutMsg,
            replaceResult: {
              success: false,
              result: request.testText,
              timedOut: true,
              error: timeoutMsg
            }
          });
        }
      }, timeoutMs);

      this.pendingResolvers.set(id, (res) => {
        cleanup();
        resolve(res);
      });

      worker.postMessage({ id, ...request });
    });
  }
}

// Global engine instance
const engine = new RegexEngine();

/**
 * Validate input constraints against pattern and text lengths
 */
export function validateRegexInputLimits(pattern: string, testText: string): { valid: boolean; error?: string } {
  if (pattern.length > MAX_PATTERN_LENGTH) {
    return {
      valid: false,
      error: `Pattern exceeds maximum allowed length of ${MAX_PATTERN_LENGTH.toLocaleString()} characters (received ${pattern.length}).`
    };
  }
  if (testText.length > MAX_INPUT_LENGTH) {
    return {
      valid: false,
      error: `Input text exceeds maximum allowed length of ${MAX_INPUT_LENGTH.toLocaleString()} characters (received ${testText.length}).`
    };
  }
  return { valid: true };
}

/**
 * Asynchronously test regular expression in a dedicated Web Worker with timeout & ReDoS protection
 */
export async function testRegexAsync(
  pattern: string,
  flags: string,
  testText: string,
  options: RegexOptions = {}
): Promise<RegexTestResult> {
  // 1. Length validation
  const limitCheck = validateRegexInputLimits(pattern, testText);
  if (!limitCheck.valid) {
    return {
      valid: false,
      pattern,
      flags,
      totalMatches: 0,
      matches: [],
      error: limitCheck.error
    };
  }

  // 2. Execute in worker with timeout
  const timeoutMs = options.timeoutMs ?? DEFAULT_REGEX_TIMEOUT_MS;
  const res = await engine.execute(
    {
      action: 'test',
      pattern,
      flags,
      testText
    },
    timeoutMs
  );

  if (res.testResult) {
    return res.testResult;
  }

  return {
    valid: false,
    pattern,
    flags,
    totalMatches: 0,
    matches: [],
    error: res.error ?? 'Unknown worker execution failure'
  };
}

/**
 * Asynchronously replace regular expression in a dedicated Web Worker with timeout & ReDoS protection
 */
export async function replaceRegexAsync(
  pattern: string,
  flags: string,
  testText: string,
  replacement: string,
  options: RegexOptions = {}
): Promise<RegexReplaceResult> {
  const limitCheck = validateRegexInputLimits(pattern, testText);
  if (!limitCheck.valid) {
    return {
      success: false,
      result: testText,
      error: limitCheck.error
    };
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_REGEX_TIMEOUT_MS;
  const res = await engine.execute(
    {
      action: 'replace',
      pattern,
      flags,
      testText,
      replacement
    },
    timeoutMs
  );

  if (res.replaceResult) {
    return res.replaceResult;
  }

  return {
    success: false,
    result: testText,
    error: res.error ?? 'Unknown worker execution failure'
  };
}

/**
 * Synchronous test (with length and safety checks)
 */
export function testRegex(pattern: string, flags: string, testText: string): RegexTestResult {
  const limitCheck = validateRegexInputLimits(pattern, testText);
  if (!limitCheck.valid) {
    return {
      valid: false,
      pattern,
      flags,
      totalMatches: 0,
      matches: [],
      error: limitCheck.error
    };
  }
  return executeRegexTest(pattern, flags, testText);
}

/**
 * Synchronous replace (with length and safety checks)
 */
export function replaceRegex(
  pattern: string,
  flags: string,
  testText: string,
  replacement: string
): RegexReplaceResult {
  const limitCheck = validateRegexInputLimits(pattern, testText);
  if (!limitCheck.valid) {
    return {
      success: false,
      result: testText,
      error: limitCheck.error
    };
  }
  return executeRegexReplace(pattern, flags, testText, replacement);
}

/**
 * Cleanup helper for test tear-down or application unmount
 */
export function terminateRegexWorker(): void {
  engine.terminate();
}
