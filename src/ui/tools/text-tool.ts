import { ToolModule } from '../types';
import {
  analyzeText,
  toUpperCase,
  toLowerCase,
  toTitleCase,
  toCamelCase,
  toSnakeCase,
  toKebabCase
} from '../../core';
import { attachCopyHandler } from '../components/copy';

export const textTool: ToolModule = {
  id: 'text',
  title: 'Text Analysis & Transformers',
  category: 'Encoding & Formats',
  description: 'Compute character, word, line, and UTF-8 byte statistics with case conversion utilities.',
  icon: 'Aa',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Text Metrics &amp; Transforms</div>
          <div class="action-group">
            <button class="btn btn-secondary btn-sm" id="load-sample-btn">Load Sample</button>
            <button class="btn btn-secondary btn-sm" id="clear-btn">Clear</button>
          </div>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">Characters (Total)</div>
            <div class="metric-value" id="m-chars">0</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Characters (No Spaces)</div>
            <div class="metric-value" id="m-chars-ns">0</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Words</div>
            <div class="metric-value" id="m-words">0</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Lines</div>
            <div class="metric-value" id="m-lines">0</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">UTF-8 Bytes</div>
            <div class="metric-value" id="m-bytes">0</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Avg Word Length</div>
            <div class="metric-value" id="m-avg-word">0.0</div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="text-input">Input Text</label>
          <textarea class="form-textarea" id="text-input" style="min-height: 160px;" placeholder="Type or paste text to analyze and transform..." spellcheck="false"></textarea>
        </div>

        <div class="tool-actions">
          <div class="action-group" style="flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" id="btn-upper">UPPERCASE</button>
            <button class="btn btn-secondary btn-sm" id="btn-lower">lowercase</button>
            <button class="btn btn-secondary btn-sm" id="btn-title">Title Case</button>
            <button class="btn btn-secondary btn-sm" id="btn-camel">camelCase</button>
            <button class="btn btn-secondary btn-sm" id="btn-snake">snake_case</button>
            <button class="btn btn-secondary btn-sm" id="btn-kebab">kebab-case</button>
          </div>
          <button class="btn btn-secondary btn-sm" id="copy-btn">Copy Text</button>
        </div>
      </div>
    `;

    const textInput = container.querySelector('#text-input') as HTMLTextAreaElement;
    const mChars = container.querySelector('#m-chars') as HTMLElement;
    const mCharsNs = container.querySelector('#m-chars-ns') as HTMLElement;
    const mWords = container.querySelector('#m-words') as HTMLElement;
    const mLines = container.querySelector('#m-lines') as HTMLElement;
    const mBytes = container.querySelector('#m-bytes') as HTMLElement;
    const mAvgWord = container.querySelector('#m-avg-word') as HTMLElement;

    const copyBtn = container.querySelector('#copy-btn') as HTMLButtonElement;
    const clearBtn = container.querySelector('#clear-btn') as HTMLButtonElement;
    const sampleBtn = container.querySelector('#load-sample-btn') as HTMLButtonElement;

    attachCopyHandler(copyBtn, () => textInput.value);

    function update(): void {
      const val = textInput.value;
      const metrics = analyzeText(val);

      mChars.textContent = metrics.charactersTotal.toLocaleString();
      mCharsNs.textContent = metrics.charactersNoSpaces.toLocaleString();
      mWords.textContent = metrics.words.toLocaleString();
      mLines.textContent = metrics.lines.toLocaleString();
      mBytes.textContent = metrics.bytesUtf8.toLocaleString();
      mAvgWord.textContent = metrics.averageWordLength.toFixed(1);
    }

    textInput.addEventListener('input', update);

    container.querySelector('#btn-upper')?.addEventListener('click', () => {
      textInput.value = toUpperCase(textInput.value);
      update();
    });
    container.querySelector('#btn-lower')?.addEventListener('click', () => {
      textInput.value = toLowerCase(textInput.value);
      update();
    });
    container.querySelector('#btn-title')?.addEventListener('click', () => {
      textInput.value = toTitleCase(textInput.value);
      update();
    });
    container.querySelector('#btn-camel')?.addEventListener('click', () => {
      textInput.value = toCamelCase(textInput.value);
      update();
    });
    container.querySelector('#btn-snake')?.addEventListener('click', () => {
      textInput.value = toSnakeCase(textInput.value);
      update();
    });
    container.querySelector('#btn-kebab')?.addEventListener('click', () => {
      textInput.value = toKebabCase(textInput.value);
      update();
    });

    clearBtn.addEventListener('click', () => {
      textInput.value = '';
      update();
      textInput.focus();
    });

    sampleBtn.addEventListener('click', () => {
      textInput.value = `The CALION Tools ecosystem provides 13 client-side cybersecurity utilities.\nAll operations execute locally using modern browser APIs (Web Crypto, Canvas, and ES2022).\nNo telemetry or server-side logging occurs.`;
      update();
    });
  }
};
