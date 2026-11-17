/**
 * CALION Tools — Regex Dedicated Web Worker
 * Executes regular expression evaluation isolated from the main thread.
 * Prohibits external network access and handles evaluation safely.
 */

import { handleWorkerMessage } from './regex-eval';
import { RegexWorkerRequest } from './regex-types';

// Handle browser Web Worker
if (typeof self !== 'undefined' && typeof (self as unknown as Worker).postMessage === 'function') {
  self.onmessage = (e: MessageEvent<RegexWorkerRequest>) => {
    const res = handleWorkerMessage(e.data);
    (self as unknown as Worker).postMessage(res);
  };
}

// Handle Node.js worker_threads if executed in Node environment
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  try {
    // Dynamic import to avoid bundling issues in browser
    import('node:worker_threads').then(({ parentPort }) => {
      if (parentPort) {
        parentPort.on('message', (data: RegexWorkerRequest) => {
          const res = handleWorkerMessage(data);
          parentPort.postMessage(res);
        });
      }
    }).catch(() => {
      // Ignore in browser
    });
  } catch {
    // Ignore in browser
  }
}
