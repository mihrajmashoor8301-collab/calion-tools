import { ToolModule } from '../types';
import { identifyHash } from '../../core';

export const hashIdTool: ToolModule = {
  id: 'hash-id',
  title: 'Hash Identifier',
  category: 'Cryptography & Security',
  description: 'Identify potential hash algorithms from digest signatures, length, character set, and common prefixes.',
  icon: '#?',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Hash Signature Identification</div>
          <div class="action-group">
            <button class="btn btn-secondary btn-sm" id="load-sample-btn">Load Sample</button>
            <button class="btn btn-secondary btn-sm" id="clear-btn">Clear</button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="hash-input">Hash String</label>
          <input type="text" class="form-control" id="hash-input" placeholder="Paste hash string (e.g. 5d41402abc4b2a76b9719d911017c592 or $2y$12$...)" spellcheck="false" />
        </div>

        <div id="results-area" style="margin-top: 1.25rem;">
          <div class="output-block" style="color: var(--text-muted);">(Enter a hash string above to analyze)</div>
        </div>
      </div>
    `;

    const hashInput = container.querySelector('#hash-input') as HTMLInputElement;
    const resultsArea = container.querySelector('#results-area') as HTMLElement;
    const clearBtn = container.querySelector('#clear-btn') as HTMLButtonElement;
    const sampleBtn = container.querySelector('#load-sample-btn') as HTMLButtonElement;

    function analyze(): void {
      const val = hashInput.value.trim();
      if (!val) {
        resultsArea.innerHTML = `<div class="output-block" style="color: var(--text-muted);">(Enter a hash string above to analyze)</div>`;
        return;
      }

      const res = identifyHash(val);

      let html = `
        <div class="metrics-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 1rem;">
          <div class="metric-card">
            <div class="metric-label">Length</div>
            <div class="metric-value">${res.length} chars</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Character Set</div>
            <div class="metric-value" style="font-size: 1.1rem;">${res.charset}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Matches</div>
            <div class="metric-value">${res.matches.length}</div>
          </div>
        </div>
      `;

      if (res.isAmbiguous) {
        html += `
          <div class="alert alert-warning">
            <div>
              <strong>Ambiguity Notice</strong>
              <div style="font-size: 0.8125rem; margin-top: 0.25rem;">${res.notes}</div>
            </div>
          </div>
        `;
      }

      if (res.matches.length === 0) {
        html += `
          <div class="alert alert-info">
            <div>
              <strong>No Direct Pattern Match</strong>
              <div style="font-size: 0.8125rem; margin-top: 0.25rem;">${res.notes}</div>
            </div>
          </div>
        `;
      } else {
        html += `
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Category</th>
                  <th>Confidence</th>
                  <th>Hashcat Mode</th>
                  <th>John Format</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
        `;

        for (const m of res.matches) {
          const confBadge =
            m.confidence === 'High'
              ? `<span style="color: var(--accent-emerald); font-weight: 600;">High</span>`
              : m.confidence === 'Medium'
              ? `<span style="color: var(--accent-cyan); font-weight: 600;">Medium</span>`
              : `<span style="color: var(--text-muted);">Low</span>`;

          html += `
            <tr>
              <td><strong class="mono" style="color: var(--text-primary);">${m.name}</strong></td>
              <td><span class="badge-tag">${m.category}</span></td>
              <td>${confBadge}</td>
              <td class="mono">${m.hashcatMode !== undefined ? `-m ${m.hashcatMode}` : '-'}</td>
              <td class="mono">${m.johnFormat ? `--format=${m.johnFormat}` : '-'}</td>
              <td style="color: var(--text-secondary); font-size: 0.8125rem;">${m.description}</td>
            </tr>
          `;
        }

        html += `
              </tbody>
            </table>
          </div>
        `;
      }

      resultsArea.innerHTML = html;
    }

    hashInput.addEventListener('input', analyze);

    clearBtn.addEventListener('click', () => {
      hashInput.value = '';
      analyze();
      hashInput.focus();
    });

    sampleBtn.addEventListener('click', () => {
      hashInput.value = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
      analyze();
    });
  }
};
