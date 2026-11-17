import { ToolModule } from '../types';
import { parseTimestamp, dateToTimestamp } from '../../core';
import { attachCopyHandler } from '../components/copy';

export const timestampTool: ToolModule = {
  id: 'timestamp',
  title: 'Unix Timestamp Converter',
  category: 'Analysis & Inspection',
  description: 'Bidirectional converter between Unix timestamps (seconds & milliseconds) and ISO 8601 / UTC / local human-readable formats.',
  icon: '⏱',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Epoch Time Conversion</div>
          <div class="action-group">
            <button class="btn btn-primary btn-sm" id="now-btn">Current Time</button>
            <button class="btn btn-secondary btn-sm" id="load-sample-btn">Load Sample</button>
            <button class="btn btn-secondary btn-sm" id="clear-btn">Clear</button>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group" style="flex: 1;">
            <label class="form-label" for="epoch-input">Unix Epoch (Seconds / Milliseconds)</label>
            <input type="text" class="form-control" id="epoch-input" placeholder="e.g. 1767225600 or 1767225600000" spellcheck="false" />
          </div>

          <div class="form-group" style="flex: 1;">
            <label class="form-label" for="date-input">Date String (ISO 8601 / RFC 2822 / YYYY-MM-DD)</label>
            <input type="text" class="form-control" id="date-input" placeholder="e.g. 2026-01-01T00:00:00Z" spellcheck="false" />
          </div>
        </div>

        <div id="ts-error" class="alert alert-error" style="display: none;"></div>

        <div id="ts-results" style="margin-top: 1rem;">
          <div class="output-block" style="color: var(--text-muted);">(Enter timestamp or date string above)</div>
        </div>
      </div>
    `;

    const epochInput = container.querySelector('#epoch-input') as HTMLInputElement;
    const dateInput = container.querySelector('#date-input') as HTMLInputElement;
    const tsError = container.querySelector('#ts-error') as HTMLElement;
    const tsResults = container.querySelector('#ts-results') as HTMLElement;
    const nowBtn = container.querySelector('#now-btn') as HTMLButtonElement;
    const clearBtn = container.querySelector('#clear-btn') as HTMLButtonElement;
    const sampleBtn = container.querySelector('#load-sample-btn') as HTMLButtonElement;

    function renderDetails(res: ReturnType<typeof parseTimestamp>): void {
      tsError.style.display = 'none';

      tsResults.innerHTML = `
        <div class="metrics-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 1.25rem;">
          <div class="metric-card">
            <div class="metric-label">Epoch Seconds</div>
            <div class="metric-value" style="font-size: 1.2rem;">${res.epochSeconds}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Epoch Milliseconds</div>
            <div class="metric-value" style="font-size: 1.2rem;">${res.epochMilliseconds}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Relative Time</div>
            <div class="metric-value" style="font-size: 1.1rem; color: var(--accent-emerald);">${res.relativeTime}</div>
          </div>
        </div>

        <div class="table-container">
          <table class="data-table">
            <tbody>
              <tr>
                <td><strong>ISO 8601</strong></td>
                <td class="mono" id="ts-iso">${res.iso8601}</td>
                <td style="text-align: right;"><button class="btn btn-secondary btn-sm" id="copy-iso">Copy</button></td>
              </tr>
              <tr>
                <td><strong>UTC String</strong></td>
                <td class="mono" id="ts-utc">${res.utcString}</td>
                <td style="text-align: right;"><button class="btn btn-secondary btn-sm" id="copy-utc">Copy</button></td>
              </tr>
              <tr>
                <td><strong>Local Time</strong></td>
                <td class="mono" id="ts-local">${res.localString}</td>
                <td style="text-align: right;"><button class="btn btn-secondary btn-sm" id="copy-local">Copy</button></td>
              </tr>
              <tr>
                <td><strong>Detected Unit</strong></td>
                <td colspan="2"><span class="badge-tag">${res.unitDetected.toUpperCase()}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      `;

      attachCopyHandler(tsResults.querySelector('#copy-iso') as HTMLButtonElement, () => res.iso8601);
      attachCopyHandler(tsResults.querySelector('#copy-utc') as HTMLButtonElement, () => res.utcString);
      attachCopyHandler(tsResults.querySelector('#copy-local') as HTMLButtonElement, () => res.localString);
    }

    epochInput.addEventListener('input', () => {
      const val = epochInput.value.trim();
      if (!val) {
        tsResults.innerHTML = `<div class="output-block" style="color: var(--text-muted);">(Enter timestamp or date string above)</div>`;
        return;
      }
      try {
        const res = parseTimestamp(val);
        dateInput.value = res.iso8601;
        renderDetails(res);
      } catch (err) {
        tsError.textContent = err instanceof Error ? err.message : String(err);
        tsError.style.display = 'block';
      }
    });

    dateInput.addEventListener('input', () => {
      const val = dateInput.value.trim();
      if (!val) return;
      try {
        const res = dateToTimestamp(val);
        epochInput.value = String(res.epochSeconds);
        renderDetails(res);
      } catch (err) {
        tsError.textContent = err instanceof Error ? err.message : String(err);
        tsError.style.display = 'block';
      }
    });

    nowBtn.addEventListener('click', () => {
      const now = Math.floor(Date.now() / 1000);
      epochInput.value = String(now);
      const res = parseTimestamp(now);
      dateInput.value = res.iso8601;
      renderDetails(res);
    });

    clearBtn.addEventListener('click', () => {
      epochInput.value = '';
      dateInput.value = '';
      tsError.style.display = 'none';
      tsResults.innerHTML = `<div class="output-block" style="color: var(--text-muted);">(Enter timestamp or date string above)</div>`;
      epochInput.focus();
    });

    sampleBtn.addEventListener('click', () => {
      epochInput.value = '1767225600';
      const res = parseTimestamp(1767225600);
      dateInput.value = res.iso8601;
      renderDetails(res);
    });

    // Default trigger current time
    nowBtn.click();
  }
};
