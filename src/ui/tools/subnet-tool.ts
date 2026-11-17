import { ToolModule } from '../types';
import { calculateSubnet } from '../../core';

export const subnetTool: ToolModule = {
  id: 'subnet',
  title: 'IPv4 Subnet & CIDR Calculator',
  category: 'Networking & Infrastructure',
  description: 'Calculate network boundaries, broadcast addresses, usable host ranges, binary masks, and RFC 1918 scopes.',
  icon: '🌐',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">IPv4 CIDR Calculation</div>
          <div class="action-group">
            <button class="btn btn-secondary btn-sm" id="load-sample-btn">Load Sample</button>
            <button class="btn btn-secondary btn-sm" id="clear-btn">Clear</button>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group" style="flex: 2;">
            <label class="form-label" for="ip-input">IP Address / CIDR</label>
            <input type="text" class="form-control" id="ip-input" placeholder="e.g. 192.168.1.150/24 or 10.0.0.1" spellcheck="false" />
          </div>

          <div class="form-group" style="flex: 1;">
            <label class="form-label" for="cidr-select">Prefix Length</label>
            <select class="form-select" id="cidr-select">
              ${Array.from({ length: 33 }, (_, i) => 32 - i)
                .map((p) => `<option value="${p}" ${p === 24 ? 'selected' : ''}>/${p}</option>`)
                .join('')}
            </select>
          </div>
        </div>

        <div id="subnet-error" class="alert alert-error" style="display: none;"></div>

        <div id="subnet-results" style="margin-top: 1rem;">
          <div class="output-block" style="color: var(--text-muted);">(Enter an IP address and prefix to calculate subnet)</div>
        </div>
      </div>
    `;

    const ipInput = container.querySelector('#ip-input') as HTMLInputElement;
    const cidrSelect = container.querySelector('#cidr-select') as HTMLSelectElement;
    const subnetError = container.querySelector('#subnet-error') as HTMLElement;
    const subnetResults = container.querySelector('#subnet-results') as HTMLElement;
    const clearBtn = container.querySelector('#clear-btn') as HTMLButtonElement;
    const sampleBtn = container.querySelector('#load-sample-btn') as HTMLButtonElement;

    function calc(): void {
      const val = ipInput.value.trim();
      subnetError.style.display = 'none';

      if (!val) {
        subnetResults.innerHTML = `<div class="output-block" style="color: var(--text-muted);">(Enter an IP address and prefix to calculate subnet)</div>`;
        return;
      }

      try {
        let prefix = parseInt(cidrSelect.value, 10);
        if (val.includes('/')) {
          const parts = val.split('/');
          const p = parseInt(parts[1] ?? '24', 10);
          if (!isNaN(p) && p >= 0 && p <= 32) {
            prefix = p;
            cidrSelect.value = String(p);
          }
        }

        const res = calculateSubnet(val, prefix);

        const scopeBadge =
          res.scope === 'RFC 1918 (Private)'
            ? `<span style="color: var(--accent-emerald); font-weight: 600;">${res.scope}</span>`
            : res.scope === 'Public'
            ? `<span style="color: var(--accent-cyan); font-weight: 600;">${res.scope}</span>`
            : `<span style="color: var(--accent-amber); font-weight: 600;">${res.scope}</span>`;

        subnetResults.innerHTML = `
          <div class="metrics-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 1.25rem;">
            <div class="metric-card">
              <div class="metric-label">Usable Hosts</div>
              <div class="metric-value">${res.usableHosts.toLocaleString()}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Total Addresses</div>
              <div class="metric-value">${res.totalHosts.toLocaleString()}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Scope</div>
              <div class="metric-value" style="font-size: 1rem;">${scopeBadge}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Class</div>
              <div class="metric-value">${res.ipClass}</div>
            </div>
          </div>

          <div class="table-container" style="margin-bottom: 1.25rem;">
            <table class="data-table">
              <tbody>
                <tr>
                  <td><strong>IP Address</strong></td>
                  <td class="mono" style="color: var(--accent-cyan);">${res.ip}</td>
                  <td><strong>CIDR</strong></td>
                  <td class="mono">/${res.cidrPrefix}</td>
                </tr>
                <tr>
                  <td><strong>Subnet Mask</strong></td>
                  <td class="mono">${res.netmask}</td>
                  <td><strong>Wildcard Mask</strong></td>
                  <td class="mono">${res.wildcardMask}</td>
                </tr>
                <tr>
                  <td><strong>Network Address</strong></td>
                  <td class="mono" style="color: var(--accent-emerald);">${res.networkAddress}</td>
                  <td><strong>Broadcast Address</strong></td>
                  <td class="mono" style="color: var(--accent-rose);">${res.broadcastAddress}</td>
                </tr>
                <tr>
                  <td><strong>Usable Host Range</strong></td>
                  <td colspan="3" class="mono">
                    <span style="color: var(--text-primary);">${res.firstUsableIp}</span>
                    <span style="color: var(--text-muted); margin: 0 0.5rem;">—</span>
                    <span style="color: var(--text-primary);">${res.lastUsableIp}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="card" style="padding: 1rem; margin-bottom: 0;">
            <div class="card-title" style="font-size: 0.875rem; margin-bottom: 0.5rem;">Binary Representation (32-bit)</div>
            <div style="font-family: var(--font-mono); font-size: 0.8125rem; display: flex; flex-direction: column; gap: 0.35rem;">
              <div><span style="color: var(--text-muted); display: inline-block; width: 120px;">IP Address:</span> <code>${res.binaryIp}</code></div>
              <div><span style="color: var(--text-muted); display: inline-block; width: 120px;">Subnet Mask:</span> <code>${res.binaryNetmask}</code></div>
              <div><span style="color: var(--text-muted); display: inline-block; width: 120px;">Network:</span> <code>${res.binaryNetwork}</code></div>
            </div>
          </div>
        `;
      } catch (err) {
        subnetError.textContent = err instanceof Error ? err.message : String(err);
        subnetError.style.display = 'block';
      }
    }

    ipInput.addEventListener('input', calc);
    cidrSelect.addEventListener('change', calc);

    clearBtn.addEventListener('click', () => {
      ipInput.value = '';
      calc();
      ipInput.focus();
    });

    sampleBtn.addEventListener('click', () => {
      ipInput.value = '172.16.20.45/20';
      calc();
    });
  }
};
