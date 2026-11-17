import { ToolModule } from '../types';
import { validateJson, formatJson, minifyJson } from '../../core';
import { attachCopyHandler } from '../components/copy';
import { escapeHtml } from '../utils';

export const jsonTool: ToolModule = {
  id: 'json',
  title: 'JSON Formatter & Validator',
  category: 'Encoding & Formats',
  description: 'Validate, pretty-print, sort keys, and minify JSON payloads with detailed syntax error location diagnostics.',
  icon: '{ }',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">JSON Actions</div>
          <div class="action-group">
            <button class="btn btn-secondary btn-sm" id="load-sample-btn">Load Sample</button>
            <button class="btn btn-secondary btn-sm" id="clear-btn">Clear</button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="json-input">JSON Input</label>
          <textarea class="form-textarea" id="json-input" style="min-height: 180px;" placeholder="Paste JSON object, array, or raw string..." spellcheck="false"></textarea>
        </div>

        <div class="tool-actions">
          <div class="action-group">
            <button class="btn btn-primary btn-sm" id="format-2-btn">Format (2 Spaces)</button>
            <button class="btn btn-secondary btn-sm" id="format-4-btn">Format (4 Spaces)</button>
            <button class="btn btn-secondary btn-sm" id="sort-keys-btn">Sort Keys</button>
            <button class="btn btn-secondary btn-sm" id="minify-btn">Minify</button>
          </div>
          <button class="btn btn-secondary btn-sm" id="copy-btn">Copy Formatted</button>
        </div>

        <div id="status-card" style="margin-top: 1rem;"></div>

        <div class="form-group" style="margin-top: 1rem;">
          <label class="form-label">Formatted Result</label>
          <div class="output-block" id="json-output" style="max-height: 380px; overflow-y: auto;">(Formatted output will appear here)</div>
        </div>
      </div>
    `;

    const jsonInput = container.querySelector('#json-input') as HTMLTextAreaElement;
    const jsonOutput = container.querySelector('#json-output') as HTMLElement;
    const statusCard = container.querySelector('#status-card') as HTMLElement;
    const format2Btn = container.querySelector('#format-2-btn') as HTMLButtonElement;
    const format4Btn = container.querySelector('#format-4-btn') as HTMLButtonElement;
    const sortKeysBtn = container.querySelector('#sort-keys-btn') as HTMLButtonElement;
    const minifyBtn = container.querySelector('#minify-btn') as HTMLButtonElement;
    const copyBtn = container.querySelector('#copy-btn') as HTMLButtonElement;
    const clearBtn = container.querySelector('#clear-btn') as HTMLButtonElement;
    const sampleBtn = container.querySelector('#load-sample-btn') as HTMLButtonElement;

    attachCopyHandler(copyBtn, () => jsonOutput.textContent === '(Formatted output will appear here)' ? '' : (jsonOutput.textContent ?? ''));

    function runValidation(autoFormatIndent?: 2 | 4 | false, sortKeys = false): void {
      const raw = jsonInput.value;
      if (!raw.trim()) {
        statusCard.innerHTML = '';
        jsonOutput.textContent = '(Formatted output will appear here)';
        return;
      }

      const res = validateJson(raw);
      if (res.valid) {
        statusCard.innerHTML = `
          <div class="alert alert-success">
            <div>
              <strong>✓ Valid JSON</strong>
              <div style="font-family: var(--font-mono); font-size: 0.75rem; margin-top: 0.25rem;">
                Root: <code>${res.stats?.type}</code> | Size: <code>${res.stats?.byteSize} bytes</code>
                ${res.stats?.keysCount !== undefined ? `| Keys: <code>${res.stats.keysCount}</code>` : ''}
                ${res.stats?.itemsCount !== undefined ? `| Items: <code>${res.stats.itemsCount}</code>` : ''}
              </div>
            </div>
          </div>
        `;

        if (autoFormatIndent !== false) {
          try {
            const formatted = formatJson(raw, { indent: autoFormatIndent ?? 2, sortKeys });
            jsonOutput.textContent = formatted;
          } catch {
            jsonOutput.textContent = raw;
          }
        }
      } else {
        const err = res.error;
        statusCard.innerHTML = `
          <div class="alert alert-error">
            <div>
              <strong>✕ Invalid JSON Syntax</strong>
              <div style="font-size: 0.8125rem; margin-top: 0.25rem;">${escapeHtml(err?.message)}</div>
              ${
                err?.line !== undefined
                  ? `<div style="font-family: var(--font-mono); font-size: 0.75rem; margin-top: 0.35rem; color: #fecdd3;">Line ${escapeHtml(err.line)}, Column ${escapeHtml(err.column ?? '?')}</div>`
                  : ''
              }
              ${
                err?.snippet
                  ? `<pre style="background: rgba(0,0,0,0.4); padding: 0.5rem; border-radius: 4px; margin-top: 0.4rem; font-family: var(--font-mono); font-size: 0.75rem;">${escapeHtml(err.snippet)}</pre>`
                  : ''
              }
            </div>
          </div>
        `;
        jsonOutput.textContent = '(Cannot format invalid JSON)';
      }
    }

    jsonInput.addEventListener('input', () => runValidation(false));

    format2Btn.addEventListener('click', () => runValidation(2));
    format4Btn.addEventListener('click', () => runValidation(4));
    sortKeysBtn.addEventListener('click', () => runValidation(2, true));

    minifyBtn.addEventListener('click', () => {
      const raw = jsonInput.value;
      if (!raw.trim()) return;
      try {
        const mini = minifyJson(raw);
        jsonOutput.textContent = mini;
        statusCard.innerHTML = `<div class="alert alert-success"><strong>✓ Minified JSON (${new TextEncoder().encode(mini).length} bytes)</strong></div>`;
      } catch (err) {
        runValidation(false);
      }
    });

    clearBtn.addEventListener('click', () => {
      jsonInput.value = '';
      statusCard.innerHTML = '';
      jsonOutput.textContent = '(Formatted output will appear here)';
      jsonInput.focus();
    });

    sampleBtn.addEventListener('click', () => {
      jsonInput.value = JSON.stringify({
        project: "CALION Tools",
        domain: "tools.endlessus.in",
        status: "production-ready",
        modules: 13,
        privacy: {
          clientSideOnly: true,
          telemetry: false
        },
        algorithms: ["WebCrypto", "Shannon Entropy", "CIDR Subnet", "Nmap Builder"]
      });
      runValidation(2);
    });
  }
};
