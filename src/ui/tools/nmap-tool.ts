import { ToolModule } from '../types';
import {
  buildNmapCommand,
  NmapConfig,
  ScanType,
  TimingTemplate,
  PortSelectionMode
} from '../../core';
import { attachCopyHandler } from '../components/copy';

export const nmapTool: ToolModule = {
  id: 'nmap-builder',
  title: 'Nmap Command Generator',
  category: 'Networking & Infrastructure',
  description: 'Interactive CLI command builder synthesizing syntactically safe Nmap scanning commands with flag explanations and safety advisories.',
  icon: '⚡',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Command Builder</div>
          <div class="action-group">
            <button class="btn btn-secondary btn-sm" id="load-sample-btn">Load Preset</button>
            <button class="btn btn-secondary btn-sm" id="clear-btn">Reset</button>
          </div>
        </div>

        <div class="alert alert-warning">
          <div>
            <strong>Authorized Use Advisory</strong>
            <div style="font-size: 0.8125rem; margin-top: 0.25rem;">
              This tool only generates command-line syntax and <strong>never executes network scans</strong>. Port scanning without prior explicit authorization against networks you do not own or maintain is prohibited by computer misuse laws.
            </div>
          </div>
        </div>

        <!-- Target Input -->
        <div class="form-group">
          <label class="form-label" for="nmap-target">Target IP / CIDR / Hostname</label>
          <input type="text" class="form-control" id="nmap-target" placeholder="e.g. 192.168.1.0/24 or scanme.nmap.org" value="192.168.1.0/24" spellcheck="false" />
        </div>

        <div class="form-row">
          <!-- Scan Type -->
          <div class="form-group" style="flex: 1;">
            <label class="form-label" for="scan-type">Scan Technique</label>
            <select class="form-select" id="scan-type">
              <option value="syn">TCP SYN Stealth Scan (-sS)</option>
              <option value="connect">TCP Connect Scan (-sT)</option>
              <option value="udp">UDP Port Scan (-sU)</option>
              <option value="ping-sweep">Ping Sweep / Host Discovery Only (-sn)</option>
              <option value="null">TCP Null Scan (-sN)</option>
              <option value="fin">TCP FIN Scan (-sF)</option>
              <option value="xmas">TCP Xmas Scan (-sX)</option>
            </select>
          </div>

          <!-- Port Mode -->
          <div class="form-group" style="flex: 1;">
            <label class="form-label" for="port-mode">Port Selection</label>
            <select class="form-select" id="port-mode">
              <option value="default">Default Top 1,000 Ports</option>
              <option value="fast">Fast Top 100 Ports (-F)</option>
              <option value="all">All 65,535 Ports (-p-)</option>
              <option value="top-ports">Top N Ports (--top-ports)</option>
              <option value="custom">Custom Ports (-p)</option>
            </select>
          </div>

          <!-- Timing -->
          <div class="form-group" style="flex: 1;">
            <label class="form-label" for="timing-select">Timing Template</label>
            <select class="form-select" id="timing-select">
              <option value="normal">Normal / Default (-T3)</option>
              <option value="aggressive">Aggressive (-T4)</option>
              <option value="insane">Insane (-T5)</option>
              <option value="polite">Polite (-T2)</option>
              <option value="sneaky">Sneaky (-T1)</option>
              <option value="paranoid">Paranoid (-T0)</option>
            </select>
          </div>
        </div>

        <!-- Custom Port Input (Conditional) -->
        <div class="form-group" id="custom-port-group" style="display: none;">
          <label class="form-label" for="custom-port-input">Custom Port Specification</label>
          <input type="text" class="form-control" id="custom-port-input" placeholder="e.g. 21,22,80,443,8080 or 1-1024,3389" spellcheck="false" />
        </div>

        <!-- Checkbox Options -->
        <div class="form-group">
          <label class="form-label">Fingerprinting &amp; Scripts</label>
          <div style="display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.875rem; margin-top: 0.35rem;">
            <label style="cursor: pointer; display: flex; align-items: center; gap: 0.35rem;">
              <input type="checkbox" id="chk-service" checked /> Service / Version Detection (-sV)
            </label>
            <label style="cursor: pointer; display: flex; align-items: center; gap: 0.35rem;">
              <input type="checkbox" id="chk-os" /> OS Fingerprinting (-O)
            </label>
            <label style="cursor: pointer; display: flex; align-items: center; gap: 0.35rem;">
              <input type="checkbox" id="chk-scripts" checked /> Default NSE Scripts (-sC)
            </label>
            <label style="cursor: pointer; display: flex; align-items: center; gap: 0.35rem; color: #f59e0b;">
              <input type="checkbox" id="chk-vuln" /> Vulnerability Scripts (--script vuln)
            </label>
          </div>
        </div>

        <!-- Discovery & Evasion -->
        <div class="form-group">
          <label class="form-label">Discovery &amp; Performance</label>
          <div style="display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.875rem; margin-top: 0.35rem;">
            <label style="cursor: pointer; display: flex; align-items: center; gap: 0.35rem;">
              <input type="checkbox" id="chk-pn" checked /> Skip Host Discovery (-Pn)
            </label>
            <label style="cursor: pointer; display: flex; align-items: center; gap: 0.35rem;">
              <input type="checkbox" id="chk-n" checked /> No Reverse DNS (-n)
            </label>
            <label style="cursor: pointer; display: flex; align-items: center; gap: 0.35rem;">
              <input type="checkbox" id="chk-trace" /> Traceroute (--traceroute)
            </label>
            <label style="cursor: pointer; display: flex; align-items: center; gap: 0.35rem;">
              <input type="checkbox" id="chk-verbose" checked /> Verbose Output (-v)
            </label>
          </div>
        </div>

        <!-- Output Options -->
        <div class="form-row">
          <div class="form-group" style="flex: 1;">
            <label class="form-label" for="out-format">Save Output File</label>
            <select class="form-select" id="out-format">
              <option value="none">Console Only (No file saved)</option>
              <option value="all">All Formats (-oA)</option>
              <option value="normal">Normal Text (-oN)</option>
              <option value="xml">XML (-oX)</option>
              <option value="grepable">Grepable (-oG)</option>
            </select>
          </div>

          <div class="form-group" id="out-filename-group" style="flex: 1; display: none;">
            <label class="form-label" for="out-filename">Base Filename</label>
            <input type="text" class="form-control" id="out-filename" placeholder="e.g. audit_scan_results" value="nmap_assessment" spellcheck="false" />
          </div>
        </div>

        <!-- Generated Command Display -->
        <div class="form-group" style="margin-top: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
            <label class="form-label" style="margin-bottom: 0;">Generated Command</label>
            <button class="btn btn-primary btn-sm" id="copy-cmd-btn">Copy Command</button>
          </div>
          <div class="output-block" id="generated-command" style="font-size: 0.9375rem; color: var(--accent-cyan); font-weight: 600;">nmap</div>
        </div>

        <div id="safety-warning-box" class="alert alert-warning" style="display: none;"></div>

        <!-- Flags explanation table -->
        <div class="form-group" style="margin-top: 1.5rem;">
          <label class="form-label">Flag Explanations</label>
          <div id="flags-table-container"></div>
        </div>
      </div>
    `;

    const targetInput = container.querySelector('#nmap-target') as HTMLInputElement;
    const scanTypeSelect = container.querySelector('#scan-type') as HTMLSelectElement;
    const portModeSelect = container.querySelector('#port-mode') as HTMLSelectElement;
    const timingSelect = container.querySelector('#timing-select') as HTMLSelectElement;
    const customPortGroup = container.querySelector('#custom-port-group') as HTMLElement;
    const customPortInput = container.querySelector('#custom-port-input') as HTMLInputElement;

    const chkService = container.querySelector('#chk-service') as HTMLInputElement;
    const chkOs = container.querySelector('#chk-os') as HTMLInputElement;
    const chkScripts = container.querySelector('#chk-scripts') as HTMLInputElement;
    const chkVuln = container.querySelector('#chk-vuln') as HTMLInputElement;
    const chkPn = container.querySelector('#chk-pn') as HTMLInputElement;
    const chkN = container.querySelector('#chk-n') as HTMLInputElement;
    const chkTrace = container.querySelector('#chk-trace') as HTMLInputElement;
    const chkVerbose = container.querySelector('#chk-verbose') as HTMLInputElement;

    const outFormat = container.querySelector('#out-format') as HTMLSelectElement;
    const outFilenameGroup = container.querySelector('#out-filename-group') as HTMLElement;
    const outFilename = container.querySelector('#out-filename') as HTMLInputElement;

    const cmdDisplay = container.querySelector('#generated-command') as HTMLElement;
    const warningBox = container.querySelector('#safety-warning-box') as HTMLElement;
    const flagsTableContainer = container.querySelector('#flags-table-container') as HTMLElement;
    const copyCmdBtn = container.querySelector('#copy-cmd-btn') as HTMLButtonElement;
    const clearBtn = container.querySelector('#clear-btn') as HTMLButtonElement;
    const sampleBtn = container.querySelector('#load-sample-btn') as HTMLButtonElement;

    attachCopyHandler(copyCmdBtn, () => cmdDisplay.textContent ?? '');

    function generate(): void {
      const portMode = portModeSelect.value as PortSelectionMode;
      customPortGroup.style.display = portMode === 'custom' ? 'block' : 'none';

      const format = outFormat.value;
      outFilenameGroup.style.display = format !== 'none' ? 'block' : 'none';

      const config: NmapConfig = {
        target: targetInput.value || '<target>',
        scanType: scanTypeSelect.value as ScanType,
        portMode,
        customPorts: customPortInput.value,
        timing: timingSelect.value as TimingTemplate,
        serviceDetection: chkService.checked,
        osDetection: chkOs.checked,
        defaultScripts: chkScripts.checked,
        vulnScripts: chkVuln.checked,
        skipHostDiscovery: chkPn.checked,
        noDnsResolution: chkN.checked,
        traceroute: chkTrace.checked,
        verboseLevel: chkVerbose.checked ? 1 : 0,
        outputFormat: format === 'none' ? undefined : (format as NmapConfig['outputFormat']),
        outputFilename: format === 'none' ? undefined : outFilename.value
      };

      const res = buildNmapCommand(config);
      cmdDisplay.textContent = res.command;

      if (res.safetyWarnings.length > 0) {
        warningBox.innerHTML = `
          <div>
            <strong>Operational Cautions</strong>
            <ul style="margin-left: 1.25rem; font-size: 0.8125rem; margin-top: 0.25rem;">
              ${res.safetyWarnings.map((w) => `<li>${w}</li>`).join('')}
            </ul>
          </div>
        `;
        warningBox.style.display = 'block';
      } else {
        warningBox.style.display = 'none';
      }

      flagsTableContainer.innerHTML = `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 220px;">Flag / Parameter</th>
                <th>Purpose &amp; Operation</th>
              </tr>
            </thead>
            <tbody>
              ${res.flags
                .map(
                  (f) => `
                <tr>
                  <td><code class="mono" style="color: var(--accent-cyan); font-weight: 600;">${f.flag}</code></td>
                  <td style="font-size: 0.8125rem; color: var(--text-secondary);">${f.description}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    [
      targetInput,
      scanTypeSelect,
      portModeSelect,
      timingSelect,
      customPortInput,
      chkService,
      chkOs,
      chkScripts,
      chkVuln,
      chkPn,
      chkN,
      chkTrace,
      chkVerbose,
      outFormat,
      outFilename
    ].forEach((el) => {
      el.addEventListener('input', generate);
      el.addEventListener('change', generate);
    });

    clearBtn.addEventListener('click', () => {
      targetInput.value = '<target>';
      scanTypeSelect.value = 'syn';
      portModeSelect.value = 'default';
      timingSelect.value = 'normal';
      chkService.checked = true;
      chkOs.checked = false;
      chkScripts.checked = true;
      chkVuln.checked = false;
      chkPn.checked = true;
      chkN.checked = true;
      chkTrace.checked = false;
      chkVerbose.checked = true;
      outFormat.value = 'none';
      generate();
    });

    sampleBtn.addEventListener('click', () => {
      targetInput.value = '10.10.10.0/24';
      scanTypeSelect.value = 'syn';
      portModeSelect.value = 'all';
      timingSelect.value = 'aggressive';
      chkService.checked = true;
      chkOs.checked = true;
      chkScripts.checked = true;
      chkVuln.checked = false;
      chkPn.checked = true;
      chkN.checked = true;
      outFormat.value = 'all';
      outFilename.value = 'network_recon';
      generate();
    });

    // Initial run
    generate();
  }
};
