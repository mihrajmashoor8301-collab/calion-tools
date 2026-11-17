import { ToolModule } from '../types';
import { testRegexAsync, replaceRegexAsync, MAX_PATTERN_LENGTH, MAX_INPUT_LENGTH } from '../../core';
import { escapeHtml } from '../utils';

export const regexTool: ToolModule = {
  id: 'regex',
  title: 'Regular Expression Tester',
  category: 'Analysis & Inspection',
  description: 'Test patterns, capture groups, and replacements with dedicated Web Worker isolation, configurable timeout, and ReDoS termination protection.',
  icon: '/.*/',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Regex Configuration (Worker-Isolated)</div>
          <div class="action-group">
            <button class="btn btn-secondary btn-sm" id="load-sample-btn">Load Sample</button>
            <button class="btn btn-secondary btn-sm" id="clear-btn">Clear</button>
          </div>
        </div>

        <div class="alert alert-info">
          <div>
            <strong>ReDoS &amp; Worker Protection Active</strong>
            <div style="font-size: 0.8125rem; margin-top: 0.25rem;">
              Regex evaluation executes in a dedicated Web Worker outside the main UI thread. Catastrophic backtracking patterns will be terminated after the timeout, preventing UI lockup. Maximum pattern length: ${MAX_PATTERN_LENGTH.toLocaleString()} chars; maximum text: ${MAX_INPUT_LENGTH.toLocaleString()} chars.
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group" style="flex: 2;">
            <label class="form-label" for="regex-pattern">Pattern</label>
            <div style="display: flex; align-items: center; gap: 0.25rem;">
              <span style="font-family: var(--font-mono); color: var(--text-muted); font-size: 1.1rem;">/</span>
              <input type="text" class="form-control" id="regex-pattern" placeholder="e.g. \\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b" spellcheck="false" />
              <span style="font-family: var(--font-mono); color: var(--text-muted); font-size: 1.1rem;">/</span>
            </div>
          </div>

          <div class="form-group" style="flex: 1;">
            <label class="form-label">Flags</label>
            <div style="display: flex; gap: 0.75rem; align-items: center; padding-top: 0.5rem; font-family: var(--font-mono); font-size: 0.8125rem;">
              <label style="cursor: pointer; display: flex; align-items: center; gap: 0.25rem;">
                <input type="checkbox" id="flag-g" checked /> g (global)
              </label>
              <label style="cursor: pointer; display: flex; align-items: center; gap: 0.25rem;">
                <input type="checkbox" id="flag-i" checked /> i (case-insensitive)
              </label>
              <label style="cursor: pointer; display: flex; align-items: center; gap: 0.25rem;">
                <input type="checkbox" id="flag-m" /> m (multiline)
              </label>
              <label style="cursor: pointer; display: flex; align-items: center; gap: 0.25rem;">
                <input type="checkbox" id="flag-s" /> s (dotAll)
              </label>
            </div>
          </div>

          <div class="form-group" style="flex: 1;">
            <label class="form-label" for="timeout-select">Timeout</label>
            <select class="form-select" id="timeout-select">
              <option value="1500" selected>1.5 seconds</option>
              <option value="1000">1.0 second</option>
              <option value="3000">3.0 seconds</option>
              <option value="5000">5.0 seconds</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="regex-text">Test String</label>
          <textarea class="form-textarea" id="regex-text" style="min-height: 120px;" placeholder="Enter text to match against..." spellcheck="false"></textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="regex-replace">Replacement String (Optional Preview)</label>
          <input type="text" class="form-control" id="regex-replace" placeholder="e.g. [REDACTED] or $$1" spellcheck="false" />
        </div>

        <div id="regex-error" class="alert alert-error" style="display: none;"></div>

        <div id="regex-results" style="margin-top: 1rem;">
          <div class="output-block" style="color: var(--text-muted);">(Enter pattern and test text to evaluate matches)</div>
        </div>
      </div>
    `;

    const patternInput = container.querySelector('#regex-pattern') as HTMLInputElement;
    const textInput = container.querySelector('#regex-text') as HTMLTextAreaElement;
    const replaceInput = container.querySelector('#regex-replace') as HTMLInputElement;
    const timeoutSelect = container.querySelector('#timeout-select') as HTMLSelectElement;
    const errorBox = container.querySelector('#regex-error') as HTMLElement;
    const resultsArea = container.querySelector('#regex-results') as HTMLElement;

    const flagG = container.querySelector('#flag-g') as HTMLInputElement;
    const flagI = container.querySelector('#flag-i') as HTMLInputElement;
    const flagM = container.querySelector('#flag-m') as HTMLInputElement;
    const flagS = container.querySelector('#flag-s') as HTMLInputElement;

    const clearBtn = container.querySelector('#clear-btn') as HTMLButtonElement;
    const sampleBtn = container.querySelector('#load-sample-btn') as HTMLButtonElement;

    function getFlags(): string {
      let f = '';
      if (flagG.checked) f += 'g';
      if (flagI.checked) f += 'i';
      if (flagM.checked) f += 'm';
      if (flagS.checked) f += 's';
      return f;
    }

    let evalSeq = 0;

    async function evaluate(): Promise<void> {
      const currentSeq = ++evalSeq;
      const pattern = patternInput.value;
      const flags = getFlags();
      const testText = textInput.value;
      const replacement = replaceInput.value;
      const timeoutMs = parseInt(timeoutSelect.value, 10) || 1500;

      errorBox.style.display = 'none';

      if (!pattern || !testText) {
        resultsArea.innerHTML = `<div class="output-block" style="color: var(--text-muted);">(Enter pattern and test text to evaluate matches)</div>`;
        return;
      }

      const res = await testRegexAsync(pattern, flags, testText, { timeoutMs });

      // Guard against out-of-order async responses
      if (currentSeq !== evalSeq) return;

      if (!res.valid) {
        if (res.timedOut) {
          errorBox.innerHTML = `
            <div>
              <strong>✕ Catastrophic Backtracking Terminated (Timeout)</strong>
              <div style="font-size: 0.8125rem; margin-top: 0.25rem;">
                ${escapeHtml(res.error)}
              </div>
              <div style="font-size: 0.75rem; margin-top: 0.35rem; color: #fecdd3;">
                The worker thread was forcefully terminated to keep your browser responsive. The engine has recovered and is ready for a revised pattern.
              </div>
            </div>
          `;
        } else {
          errorBox.textContent = `Regex Error: ${res.error}`;
        }
        errorBox.style.display = 'block';
        resultsArea.innerHTML = `<div class="output-block" style="color: var(--accent-rose);">(Evaluation halted due to pattern error)</div>`;
        return;
      }

      let replacePreviewHtml = '';
      if (replacement) {
        const repRes = await replaceRegexAsync(pattern, flags, testText, replacement, { timeoutMs });
        if (repRes.success) {
          replacePreviewHtml = `
            <div class="card" style="padding: 1rem; margin-bottom: 1.25rem;">
              <div class="card-title" style="font-size: 0.875rem; margin-bottom: 0.5rem; color: var(--accent-cyan);">Replacement Result</div>
              <pre class="output-block" style="max-height: 140px;">${escapeHtml(repRes.result)}</pre>
            </div>
          `;
        }
      }

      resultsArea.innerHTML = `
        <div class="metrics-grid" style="grid-template-columns: repeat(2, 1fr); margin-bottom: 1.25rem;">
          <div class="metric-card">
            <div class="metric-label">Total Matches</div>
            <div class="metric-value">${res.totalMatches}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Active Flags</div>
            <div class="metric-value" style="font-size: 1.1rem; color: var(--accent-cyan);">/${escapeHtml(flags || '-')}</div>
          </div>
        </div>

        ${replacePreviewHtml}

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 70px;">#</th>
                <th style="width: 120px;">Span [Start-End]</th>
                <th>Match Value</th>
                <th>Capturing Groups</th>
              </tr>
            </thead>
            <tbody>
              ${
                res.matches.length === 0
                  ? `<tr><td colspan="4" style="color: var(--text-muted); text-align: center;">No matches found for this pattern and text.</td></tr>`
                  : res.matches
                      .map(
                        (m, idx) => `
                    <tr>
                      <td class="mono" style="color: var(--accent-cyan);">${idx + 1}</td>
                      <td class="mono">[${m.index} - ${m.endIndex}]</td>
                      <td class="mono" style="color: var(--accent-emerald); font-weight: 600;">${escapeHtml(m.match)}</td>
                      <td class="mono" style="font-size: 0.75rem;">
                        ${
                          m.groups.length > 0
                            ? m.groups.map((g) => `<span class="badge-tag">${g.name ? `${escapeHtml(g.name)}: ` : `$${g.index}: `}${escapeHtml(g.value)}</span>`).join(' ')
                            : '<span style="color: var(--text-muted);">(none)</span>'
                        }
                      </td>
                    </tr>
                  `
                      )
                      .join('')
              }
            </tbody>
          </table>
        </div>
      `;
    }

    patternInput.addEventListener('input', () => evaluate());
    textInput.addEventListener('input', () => evaluate());
    replaceInput.addEventListener('input', () => evaluate());
    timeoutSelect.addEventListener('change', () => evaluate());
    flagG.addEventListener('change', () => evaluate());
    flagI.addEventListener('change', () => evaluate());
    flagM.addEventListener('change', () => evaluate());
    flagS.addEventListener('change', () => evaluate());

    clearBtn.addEventListener('click', () => {
      patternInput.value = '';
      textInput.value = '';
      replaceInput.value = '';
      errorBox.style.display = 'none';
      resultsArea.innerHTML = `<div class="output-block" style="color: var(--text-muted);">(Enter pattern and test text to evaluate matches)</div>`;
      patternInput.focus();
    });

    sampleBtn.addEventListener('click', () => {
      patternInput.value = '(?<protocol>https?)://(?<domain>[a-zA-Z0-9.-]+)(?<path>/[\\w.-]*)?';
      textInput.value = 'Visit https://endlessus.in or review tools at https://tools.endlessus.in/api or https://notes.endlessus.in/guide';
      flagG.checked = true;
      flagI.checked = true;
      replaceInput.value = '$<protocol>://[REDACTED]$<path>';
      evaluate();
    });
  }
};
