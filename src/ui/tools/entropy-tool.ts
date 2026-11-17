import { ToolModule } from '../types';
import { calculateEntropy } from '../../core';

export const entropyTool: ToolModule = {
  id: 'entropy',
  title: 'Shannon Entropy Calculator',
  category: 'Cryptography & Security',
  description: 'Evaluate information density, byte distribution, and randomness on a 0.0 to 8.0 scale.',
  icon: 'H(x)',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Entropy Calculation</div>
          <div class="action-group">
            <button class="btn btn-secondary btn-sm" id="load-sample-btn">Load Sample</button>
            <button class="btn btn-secondary btn-sm" id="clear-btn">Clear</button>
          </div>
        </div>

        <div class="alert alert-warning">
          <div>
            <strong>Password Strength &amp; Cryptanalysis Warning</strong>
            <div style="font-size: 0.8125rem; margin-top: 0.25rem;">
              Shannon entropy measures statistical randomness and information density, <strong>not</strong> definitive password security. A publicly leaked dictionary phrase or known token may register high entropy while still being vulnerable to credential stuffing and rainbow tables.
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="entropy-input">Input Data</label>
          <textarea class="form-textarea" id="entropy-input" style="min-height: 120px;" placeholder="Paste text, hex bytes, or token..." spellcheck="false"></textarea>
        </div>

        <div id="entropy-output-area" style="margin-top: 1.25rem;">
          <div class="output-block" style="color: var(--text-muted);">(Enter text above to compute entropy)</div>
        </div>
      </div>
    `;

    const entropyInput = container.querySelector('#entropy-input') as HTMLTextAreaElement;
    const outputArea = container.querySelector('#entropy-output-area') as HTMLElement;
    const clearBtn = container.querySelector('#clear-btn') as HTMLButtonElement;
    const sampleBtn = container.querySelector('#load-sample-btn') as HTMLButtonElement;

    function renderResult(): void {
      const val = entropyInput.value;
      if (!val) {
        outputArea.innerHTML = `<div class="output-block" style="color: var(--text-muted);">(Enter text above to compute entropy)</div>`;
        return;
      }

      const res = calculateEntropy(val);

      const ratingColors: Record<string, string> = {
        'Zero': '#64748b',
        'Very Low': '#f43f5e',
        'Low': '#f59e0b',
        'Moderate': '#38bdf8',
        'High': '#10b981',
        'Very High (Encrypted/Compressed)': '#a855f7'
      };

      const barColor = ratingColors[res.rating] ?? '#38bdf8';

      // Top 8 byte frequencies
      const freqEntries = Object.entries(res.frequencies)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      outputArea.innerHTML = `
        <div class="metrics-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 1.25rem;">
          <div class="metric-card">
            <div class="metric-label">Shannon Entropy</div>
            <div class="metric-value" style="color: ${barColor};">${res.entropy.toFixed(4)} <span style="font-size: 0.75rem; color: var(--text-muted);">/ 8.0</span></div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Density</div>
            <div class="metric-value">${res.percentage}%</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Byte Length</div>
            <div class="metric-value">${res.byteLength}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Unique Bytes</div>
            <div class="metric-value">${res.uniqueBytes}</div>
          </div>
        </div>

        <!-- Meter bar -->
        <div style="margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 0.75rem; margin-bottom: 0.35rem;">
            <span>Category: <strong style="color: ${barColor};">${res.rating}</strong></span>
            <span style="color: var(--text-muted);">${res.percentage}% of max theoretical entropy</span>
          </div>
          <div style="background-color: var(--bg-code); border: 1px solid var(--border-color); border-radius: 4px; height: 10px; overflow: hidden;">
            <div style="background-color: ${barColor}; width: ${res.percentage}%; height: 100%; transition: width 0.2s ease;"></div>
          </div>
        </div>

        <div class="alert alert-info" style="margin-bottom: 1.25rem;">
          <div>
            <strong>Interpretation</strong>
            <div style="font-size: 0.8125rem; margin-top: 0.25rem;">${res.interpretation}</div>
          </div>
        </div>

        <div class="card" style="padding: 1rem; margin-bottom: 0;">
          <div class="card-title" style="font-size: 0.875rem; margin-bottom: 0.75rem;">Top Byte Frequencies</div>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            ${freqEntries
              .map(
                ([byte, count]) => `
                <div style="background: var(--bg-primary); border: 1px solid var(--border-color); padding: 0.35rem 0.65rem; border-radius: 4px; font-family: var(--font-mono); font-size: 0.75rem;">
                  <span style="color: var(--accent-cyan);">${byte}</span>: <span style="color: var(--text-secondary);">${count}x</span>
                </div>
              `
              )
              .join('')}
          </div>
        </div>
      `;
    }

    entropyInput.addEventListener('input', renderResult);

    clearBtn.addEventListener('click', () => {
      entropyInput.value = '';
      renderResult();
      entropyInput.focus();
    });

    sampleBtn.addEventListener('click', () => {
      entropyInput.value = `CALION_SECURE_TOKEN_e4f8b9a13c9e782d02a5f36e4b8c91a0`;
      renderResult();
    });
  }
};
