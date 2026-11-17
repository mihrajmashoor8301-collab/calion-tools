/**
 * CALION Tools — Regex Internal Evaluator
 * Runs inside the Web Worker.
 */

import {
  RegexMatchGroup,
  RegexMatchItem,
  RegexTestResult,
  RegexReplaceResult,
  RegexWorkerRequest,
  RegexWorkerResponse
} from './regex-types';

export function executeRegexTest(pattern: string, flags: string, testText: string): RegexTestResult {
  if (!pattern) {
    return {
      valid: true,
      pattern: '',
      flags,
      totalMatches: 0,
      matches: []
    };
  }

  if (!/^[gimsuy]*$/.test(flags)) {
    return {
      valid: false,
      pattern,
      flags,
      totalMatches: 0,
      matches: [],
      error: `Invalid regular expression flags: "${flags}". Allowed: g, i, m, s, u, y`
    };
  }

  let regex: RegExp;
  try {
    regex = new RegExp(pattern, flags);
  } catch (err) {
    return {
      valid: false,
      pattern,
      flags,
      totalMatches: 0,
      matches: [],
      error: err instanceof Error ? err.message : String(err)
    };
  }

  const matches: RegexMatchItem[] = [];
  const isGlobal = flags.includes('g') || flags.includes('y');
  let warning: string | undefined;

  try {
    if (!isGlobal) {
      const singleMatch = regex.exec(testText);
      if (singleMatch) {
        const groups: RegexMatchGroup[] = [];
        for (let i = 1; i < singleMatch.length; i++) {
          const val = singleMatch[i];
          if (val !== undefined) {
            groups.push({ index: i, value: val });
          }
        }
        if (singleMatch.groups) {
          for (const [name, val] of Object.entries(singleMatch.groups)) {
            if (val !== undefined) {
              const existing = groups.find((g) => g.value === val);
              if (existing) {
                existing.name = name;
              } else {
                groups.push({ index: -1, name, value: val });
              }
            }
          }
        }
        matches.push({
          index: singleMatch.index,
          endIndex: singleMatch.index + singleMatch[0].length,
          match: singleMatch[0],
          groups
        });
      }
    } else {
      let match: RegExpExecArray | null;
      let count = 0;
      const MAX_MATCHES = 10000;

      while ((match = regex.exec(testText)) !== null) {
        count++;
        if (count > MAX_MATCHES) {
          warning = `Truncated results: exceeded limit of ${MAX_MATCHES} matches.`;
          break;
        }

        const groups: RegexMatchGroup[] = [];
        for (let i = 1; i < match.length; i++) {
          const val = match[i];
          if (val !== undefined) {
            groups.push({ index: i, value: val });
          }
        }
        if (match.groups) {
          for (const [name, val] of Object.entries(match.groups)) {
            if (val !== undefined) {
              const existing = groups.find((g) => g.value === val);
              if (existing) {
                existing.name = name;
              } else {
                groups.push({ index: -1, name, value: val });
              }
            }
          }
        }

        matches.push({
          index: match.index,
          endIndex: match.index + match[0].length,
          match: match[0],
          groups
        });

        if (match[0].length === 0) {
          regex.lastIndex++;
        }
      }
    }
  } catch (execErr) {
    return {
      valid: false,
      pattern,
      flags,
      totalMatches: 0,
      matches: [],
      error: `Execution error: ${execErr instanceof Error ? execErr.message : String(execErr)}`
    };
  }

  return {
    valid: true,
    pattern,
    flags,
    totalMatches: matches.length,
    matches,
    warning
  };
}

export function executeRegexReplace(
  pattern: string,
  flags: string,
  testText: string,
  replacement: string
): RegexReplaceResult {
  try {
    const regex = new RegExp(pattern, flags);
    const result = testText.replace(regex, replacement);
    return { success: true, result };
  } catch (err) {
    return {
      success: false,
      result: testText,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

export function handleWorkerMessage(req: RegexWorkerRequest): RegexWorkerResponse {
  try {
    if (req.action === 'test') {
      const res = executeRegexTest(req.pattern, req.flags, req.testText);
      return { id: req.id, success: res.valid, testResult: res, error: res.error };
    } else {
      const res = executeRegexReplace(req.pattern, req.flags, req.testText, req.replacement ?? '');
      return { id: req.id, success: res.success, replaceResult: res, error: res.error };
    }
  } catch (err) {
    return {
      id: req.id,
      success: false,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}
