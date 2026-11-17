import { ToolModule } from '../types';
import { generateHexDump, parseHexDumpToBytes } from '../../core';
import { attachCopyHandler } from '../components/copy';

export const hexDumpTool: ToolModule = {
  id: 'hex-dump',
  title: 'Hex Dump Generator',
  category: 'Analysis & Inspection',
  description: 'Generate canonical 8-digit offset, 16-byte hex dumps with printable ASCII margins and reverse byte extraction.',
  icon: '0x..',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Hex Dump View</div>
          <div class="action-group">
            <button class="btn btn-secondary btn-sm" id="load-sample-btn">Load Sample</button>
            <button class="btn btn-secondary btn-sm" id="clear-btn">Clear</button>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group" style="flex: 1;">
            <label class="form-label" for="dump-mode">Mode</label>
            <select class="form-select" id="dump-mode">
              <option value="generate">Text → Canonical Hex Dump</option>
              <option value="reverse">Hex Dump → Reconstructed Text</option>
            </select>
          </div>

          <div class="form-group" style="flex: 1;">
            <label class="form-label" for="bytes-per-line">Bytes Per Line</label>
            <select class="form-select" id="bytes-per-line">
              <option value="16">16 Bytes (Canonical)</option>
              <option value="8">8 Bytes (Compact)</option>
              <option value="32">32 Bytes (Wide)</option>
            </select>
          </div>

          <div class="form-group" style="flex: 1;">
            <label class="form-label" for="hex-case">Hex Case</label>
            <select class="form-select" id="hex-case">
              <option value="lower">Lowercase (0a, 4f)</option>
              <option value="upper">UPPERCASE (0A, 4F)</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="hex-input">Input Data</label>
          <textarea class="form-textarea" id="hex-input" style="min-height: 140px;" placeholder="Enter string to generate hex dump or paste existing hex dump to reverse..." spellcheck="false"></textarea>
        </div>

        <div class="form-group">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
            <label class="form-label" style="margin-bottom: 0;">Output</label>
            <button class="btn btn-secondary btn-sm" id="copy-btn">Copy Output</button>
          </div>
          <pre class="output-block" id="hex-output" style="max-height: 360px; overflow-y: auto; font-size: 0.8125rem;">(Output will appear here)</pre>
        </div>
      </div>
    `;

    const hexInput = container.querySelector('#hex-input') as HTMLTextAreaElement;
    const hexOutput = container.querySelector('#hex-output') as HTMLElement;
    const dumpMode = container.querySelector('#dump-mode') as HTMLSelectElement;
    const bytesPerLine = container.querySelector('#bytes-per-line') as HTMLSelectElement;
    const hexCase = container.querySelector('#hex-case') as HTMLSelectElement;
    const clearBtn = container.querySelector('#clear-btn') as HTMLButtonElement;
    const sampleBtn = container.querySelector('#load-sample-btn') as HTMLButtonElement;
    const copyBtn = container.querySelector('#copy-btn') as HTMLButtonElement;

    attachCopyHandler(copyBtn, () => hexOutput.textContent === '(Output will appear here)' ? '' : (hexOutput.textContent ?? ''));

    function run(): void {
      const val = hexInput.value;
      if (!val) {
        hexOutput.textContent = '(Output will appear here)';
        return;
      }

      const mode = dumpMode.value;
      const bpl = parseInt(bytesPerLine.value, 10);
      const uppercase = hexCase.value === 'upper';

      if (mode === 'generate') {
        const dump = generateHexDump(val, {
          bytesPerLine: bpl,
          uppercase
        });
        hexOutput.textContent = dump;
      } else {
        try {
          const bytes = parseHexDumpToBytes(val);
          const decoded = new TextDecoder('utf-8').decode(bytes);
          hexOutput.textContent = decoded || `(Parsed ${bytes.length} binary bytes)`;
        } catch (err) {
          hexOutput.textContent = `Error parsing hex dump: ${err instanceof Error ? err.message : String(err)}`;
        }
      }
    }

    hexInput.addEventListener('input', run);
    dumpMode.addEventListener('change', run);
    bytesPerLine.addEventListener('change', run);
    hexCase.addEventListener('change', run);

    clearBtn.addEventListener('click', () => {
      hexInput.value = '';
      run();
      hexInput.focus();
    });

    sampleBtn.addEventListener('click', () => {
      hexInput.value = 'CALION Cybersecurity Platform 2026\nProtocol: HTTPS/TLS 1.3\nEnclave: isolated';
      dumpMode.value = 'generate';
      run();
    });
  }
};
