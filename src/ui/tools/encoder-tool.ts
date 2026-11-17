import { ToolModule } from '../types';
import {
  encodeBase64,
  decodeBase64,
  encodeUrl,
  decodeUrl,
  encodeHex,
  decodeHex,
  encodeHtmlEntities,
  decodeHtmlEntities,
  encodeBinary,
  decodeBinary,
  HexDelimiter
} from '../../core';
import { attachCopyHandler } from '../components/copy';

export const encoderTool: ToolModule = {
  id: 'encoders',
  title: 'Encoders & Decoders',
  category: 'Encoding & Formats',
  description: 'Transform strings across Base64, URL encoding, Hexadecimal, HTML entities, and 8-bit Binary representations.',
  icon: '⇄',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Transform Settings</div>
          <div class="action-group">
            <button class="btn btn-secondary btn-sm" id="load-sample-btn">Load Sample</button>
            <button class="btn btn-secondary btn-sm" id="clear-btn">Clear</button>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group" style="flex: 1;">
            <label class="form-label" for="codec-select">Format</label>
            <select class="form-select" id="codec-select">
              <option value="base64">Base64 (Standard UTF-8)</option>
              <option value="base64-url">Base64 (URL-Safe)</option>
              <option value="url">URL Encoding</option>
              <option value="url-all">URL Encoding (All Characters)</option>
              <option value="hex">Hexadecimal</option>
              <option value="html">HTML Entities</option>
              <option value="binary">8-bit Binary</option>
            </select>
          </div>

          <div class="form-group" style="flex: 1;">
            <label class="form-label" for="direction-select">Operation</label>
            <select class="form-select" id="direction-select">
              <option value="encode">Encode (Text → Format)</option>
              <option value="decode">Decode (Format → Text)</option>
            </select>
          </div>

          <div class="form-group" id="hex-delim-group" style="flex: 1; display: none;">
            <label class="form-label" for="hex-delim-select">Hex Delimiter</label>
            <select class="form-select" id="hex-delim-select">
              <option value="none">None (43414c494f4e)</option>
              <option value="space">Space (43 41 4c)</option>
              <option value="colon">Colon (43:41:4c)</option>
              <option value="prefix-0x">0x prefix (0x410x42)</option>
              <option value="prefix-slash-x">\\x prefix (\\x41\\x42)</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="input-text">Input</label>
          <textarea class="form-textarea" id="input-text" placeholder="Enter text or encoded payload to transform..." spellcheck="false"></textarea>
        </div>

        <div class="tool-actions">
          <span class="badge-privacy">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Processed 100% in-browser
          </span>
          <button class="btn btn-secondary btn-sm" id="swap-btn" title="Swap input and output">⇅ Swap Input/Output</button>
        </div>

        <div class="form-group">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
            <label class="form-label" style="margin-bottom: 0;">Output</label>
            <button class="btn btn-secondary btn-sm" id="copy-btn">Copy Output</button>
          </div>
          <div class="output-block" id="output-text">(Result will appear here)</div>
        </div>

        <div id="error-box" style="display: none;" class="alert alert-error"></div>
      </div>
    `;

    const codecSelect = container.querySelector('#codec-select') as HTMLSelectElement;
    const directionSelect = container.querySelector('#direction-select') as HTMLSelectElement;
    const hexDelimGroup = container.querySelector('#hex-delim-group') as HTMLElement;
    const hexDelimSelect = container.querySelector('#hex-delim-select') as HTMLSelectElement;
    const inputText = container.querySelector('#input-text') as HTMLTextAreaElement;
    const outputText = container.querySelector('#output-text') as HTMLElement;
    const errorBox = container.querySelector('#error-box') as HTMLElement;
    const copyBtn = container.querySelector('#copy-btn') as HTMLButtonElement;
    const clearBtn = container.querySelector('#clear-btn') as HTMLButtonElement;
    const sampleBtn = container.querySelector('#load-sample-btn') as HTMLButtonElement;
    const swapBtn = container.querySelector('#swap-btn') as HTMLButtonElement;

    attachCopyHandler(copyBtn, () => outputText.textContent === '(Result will appear here)' ? '' : (outputText.textContent ?? ''));

    function process(): void {
      const input = inputText.value;
      const codec = codecSelect.value;
      const isEncode = directionSelect.value === 'encode';
      const hexDelim = hexDelimSelect.value as HexDelimiter;

      hexDelimGroup.style.display = codec === 'hex' ? 'block' : 'none';
      errorBox.style.display = 'none';
      errorBox.textContent = '';

      if (!input) {
        outputText.textContent = '(Result will appear here)';
        outputText.style.color = 'var(--text-muted)';
        return;
      }

      outputText.style.color = 'var(--text-primary)';

      try {
        let result = '';
        if (isEncode) {
          switch (codec) {
            case 'base64':
              result = encodeBase64(input);
              break;
            case 'base64-url':
              result = encodeBase64(input, { urlSafe: true });
              break;
            case 'url':
              result = encodeUrl(input);
              break;
            case 'url-all':
              result = encodeUrl(input, { encodeAll: true });
              break;
            case 'hex':
              result = encodeHex(input, { delimiter: hexDelim });
              break;
            case 'html':
              result = encodeHtmlEntities(input);
              break;
            case 'binary':
              result = encodeBinary(input);
              break;
          }
        } else {
          switch (codec) {
            case 'base64':
            case 'base64-url':
              result = decodeBase64(input);
              break;
            case 'url':
            case 'url-all':
              result = decodeUrl(input);
              break;
            case 'hex':
              result = decodeHex(input);
              break;
            case 'html':
              result = decodeHtmlEntities(input);
              break;
            case 'binary':
              result = decodeBinary(input);
              break;
          }
        }
        outputText.textContent = result;
      } catch (err) {
        errorBox.textContent = err instanceof Error ? err.message : String(err);
        errorBox.style.display = 'block';
        outputText.textContent = '(Decode error: check input format)';
        outputText.style.color = 'var(--accent-rose)';
      }
    }

    inputText.addEventListener('input', process);
    codecSelect.addEventListener('change', process);
    directionSelect.addEventListener('change', process);
    hexDelimSelect.addEventListener('change', process);

    clearBtn.addEventListener('click', () => {
      inputText.value = '';
      process();
      inputText.focus();
    });

    sampleBtn.addEventListener('click', () => {
      inputText.value = 'CALION Security Protocol // UTF-8 Token 🔒 2026';
      directionSelect.value = 'encode';
      codecSelect.value = 'base64';
      process();
    });

    swapBtn.addEventListener('click', () => {
      const curOutput = outputText.textContent;
      if (curOutput && curOutput !== '(Result will appear here)' && !curOutput.startsWith('(Decode error')) {
        inputText.value = curOutput;
        directionSelect.value = directionSelect.value === 'encode' ? 'decode' : 'encode';
        process();
      }
    });
  }
};
