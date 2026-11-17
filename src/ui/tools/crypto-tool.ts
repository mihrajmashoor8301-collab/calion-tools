import { ToolModule } from '../types';
import { computeAllHashes } from '../../core';
import { attachCopyHandler } from '../components/copy';

export const cryptoTool: ToolModule = {
  id: 'crypto',
  title: 'Cryptographic Hash Generator',
  category: 'Cryptography & Security',
  description: 'Compute SHA-1, SHA-256, SHA-384, and SHA-512 cryptographic digests simultaneously via the native Web Crypto API.',
  icon: '🔒',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Digest Generation</div>
          <div class="action-group">
            <button class="btn btn-secondary btn-sm" id="load-sample-btn">Load Sample</button>
            <button class="btn btn-secondary btn-sm" id="clear-btn">Clear</button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="hash-input">Input String</label>
          <textarea class="form-textarea" id="hash-input" style="min-height: 110px;" placeholder="Type or paste payload to hash..." spellcheck="false"></textarea>
        </div>

        <div class="alert alert-info">
          <div>
            <strong>Client-Side Cryptography Notice</strong>
            <div style="font-size: 0.8125rem; margin-top: 0.25rem;">
              Hashes are calculated locally by your browser using <code>crypto.subtle.digest</code>. Input data is never sent to any server or logged.
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="format-select">Output Format</label>
          <select class="form-select" id="format-select" style="max-width: 200px;">
            <option value="hex">Hexadecimal (lowercase)</option>
            <option value="hex-upper">Hexadecimal (UPPERCASE)</option>
            <option value="base64">Base64</option>
          </select>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
          <!-- SHA-256 -->
          <div class="card" style="padding: 1rem; margin-bottom: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
              <div>
                <strong style="color: var(--accent-cyan); font-family: var(--font-mono);">SHA-256</strong>
                <span class="badge-tag" style="margin-left: 0.5rem;">256-bit / 32-byte</span>
              </div>
              <button class="btn btn-secondary btn-sm" id="copy-sha256">Copy</button>
            </div>
            <div class="output-block" id="out-sha256" style="word-break: break-all;">-</div>
          </div>

          <!-- SHA-512 -->
          <div class="card" style="padding: 1rem; margin-bottom: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
              <div>
                <strong style="color: var(--accent-emerald); font-family: var(--font-mono);">SHA-512</strong>
                <span class="badge-tag" style="margin-left: 0.5rem;">512-bit / 64-byte</span>
              </div>
              <button class="btn btn-secondary btn-sm" id="copy-sha512">Copy</button>
            </div>
            <div class="output-block" id="out-sha512" style="word-break: break-all;">-</div>
          </div>

          <!-- SHA-384 -->
          <div class="card" style="padding: 1rem; margin-bottom: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
              <div>
                <strong style="color: var(--text-primary); font-family: var(--font-mono);">SHA-384</strong>
                <span class="badge-tag" style="margin-left: 0.5rem;">384-bit / 48-byte</span>
              </div>
              <button class="btn btn-secondary btn-sm" id="copy-sha384">Copy</button>
            </div>
            <div class="output-block" id="out-sha384" style="word-break: break-all;">-</div>
          </div>

          <!-- SHA-1 -->
          <div class="card" style="padding: 1rem; margin-bottom: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
              <div>
                <strong style="color: var(--accent-amber); font-family: var(--font-mono);">SHA-1</strong>
                <span class="badge-tag" style="margin-left: 0.5rem;">160-bit (Collision Risk)</span>
              </div>
              <button class="btn btn-secondary btn-sm" id="copy-sha1">Copy</button>
            </div>
            <div class="output-block" id="out-sha1" style="word-break: break-all;">-</div>
          </div>
        </div>
      </div>
    `;

    const hashInput = container.querySelector('#hash-input') as HTMLTextAreaElement;
    const formatSelect = container.querySelector('#format-select') as HTMLSelectElement;
    const clearBtn = container.querySelector('#clear-btn') as HTMLButtonElement;
    const sampleBtn = container.querySelector('#load-sample-btn') as HTMLButtonElement;

    const outSha256 = container.querySelector('#out-sha256') as HTMLElement;
    const outSha512 = container.querySelector('#out-sha512') as HTMLElement;
    const outSha384 = container.querySelector('#out-sha384') as HTMLElement;
    const outSha1 = container.querySelector('#out-sha1') as HTMLElement;

    attachCopyHandler(container.querySelector('#copy-sha256') as HTMLButtonElement, () => outSha256.textContent ?? '');
    attachCopyHandler(container.querySelector('#copy-sha512') as HTMLButtonElement, () => outSha512.textContent ?? '');
    attachCopyHandler(container.querySelector('#copy-sha384') as HTMLButtonElement, () => outSha384.textContent ?? '');
    attachCopyHandler(container.querySelector('#copy-sha1') as HTMLButtonElement, () => outSha1.textContent ?? '');

    async function compute(): Promise<void> {
      const val = hashInput.value;
      const fmt = formatSelect.value;

      try {
        const hashes = await computeAllHashes(val);

        const formatHash = (res: { hex: string; base64: string }): string => {
          if (fmt === 'hex-upper') return res.hex.toUpperCase();
          if (fmt === 'base64') return res.base64;
          return res.hex;
        };

        outSha256.textContent = formatHash(hashes['SHA-256']);
        outSha512.textContent = formatHash(hashes['SHA-512']);
        outSha384.textContent = formatHash(hashes['SHA-384']);
        outSha1.textContent = formatHash(hashes['SHA-1']);
      } catch (err) {
        outSha256.textContent = 'Error computing hash';
      }
    }

    hashInput.addEventListener('input', compute);
    formatSelect.addEventListener('change', compute);

    clearBtn.addEventListener('click', () => {
      hashInput.value = '';
      compute();
      hashInput.focus();
    });

    sampleBtn.addEventListener('click', () => {
      hashInput.value = 'The quick brown fox jumps over the lazy dog';
      compute();
    });

    // Run initial empty string hash
    compute();
  }
};
