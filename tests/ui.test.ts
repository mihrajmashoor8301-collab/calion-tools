import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ALL_TOOLS } from '../src/ui/layout';

const layoutSource = readFileSync(new URL('../src/ui/layout.ts', import.meta.url), 'utf8');
const stylesSource = readFileSync(new URL('../src/styles/main.css', import.meta.url), 'utf8');

describe('UI: Tool Modules Contract & Metadata', () => {
  it('contains exactly 14 registered tool modules', () => {
    assert.equal(ALL_TOOLS.length, 14);
  });

  it('ensures each tool module has unique id, title, description, and valid category', () => {
    const ids = new Set<string>();
    const validCategories = new Set([
      'Encoding & Formats',
      'Cryptography & Security',
      'Networking & Infrastructure',
      'Analysis & Inspection'
    ]);

    for (const tool of ALL_TOOLS) {
      assert.ok(tool.id && typeof tool.id === 'string', 'Tool id must be a non-empty string');
      assert.ok(!ids.has(tool.id), `Duplicate tool id detected: ${tool.id}`);
      ids.add(tool.id);

      assert.ok(tool.title && tool.title.length > 2, `Tool title too short for ${tool.id}`);
      assert.ok(tool.description && tool.description.length > 10, `Tool description missing for ${tool.id}`);
      assert.ok(validCategories.has(tool.category), `Invalid category "${tool.category}" on tool ${tool.id}`);
      assert.ok(typeof tool.render === 'function', `Tool ${tool.id} missing render function`);
      assert.ok(tool.icon && tool.icon.length > 0, `Tool ${tool.id} missing icon`);
    }
  });

  it('verifies all expected tool IDs are present', () => {
    const expectedIds = [
      'encoders',
      'json',
      'text',
      'crypto',
      'hash-id',
      'entropy',
      'hex-dump',
      'subnet',
      'jwt',
      'timestamp',
      'regex',
      'ports',
      'nmap-builder',
      'payloads'
    ];

    const actualIds = ALL_TOOLS.map((t) => t.id);
    for (const id of expectedIds) {
      assert.ok(actualIds.includes(id), `Expected tool id "${id}" not found in ALL_TOOLS`);
    }
  });

  it('uses the CALION Academy logo, navigation, and theme preference', () => {
    assert.match(layoutSource, /brand-logo-word/);
    assert.match(layoutSource, /https:\/\/learning\.endlessus\.in\/learning/);
    assert.match(layoutSource, /https:\/\/learning\.endlessus\.in\/terminal-lab\.html/);
    assert.match(layoutSource, /id="theme-toggle"/);
    assert.match(layoutSource, /localStorage\.setItem\('calion_theme'/);
    assert.match(layoutSource, /endlessus_learning_theme/);
  });

  it('defaults to Academy light colors and supports the matching dark theme', () => {
    assert.match(layoutSource, /:\s*'light';\s*\n\s*applyTheme\(initialTheme, false\)/);
    assert.doesNotMatch(layoutSource, /prefers-color-scheme/);
    assert.match(stylesSource, /--bg-primary:\s*#f8faff/i);
    assert.match(stylesSource, /--accent-cyan:\s*#0284c7/i);
    assert.match(stylesSource, /html\.dark\s*\{/);
    assert.match(stylesSource, /font-family:\s*var\(--font-display\)/);
    assert.match(stylesSource, /url\('\/fonts\/inter-latin\.woff2'\)/);
    assert.match(stylesSource, /url\('\/fonts\/space-grotesk-latin\.woff2'\)/);
    assert.match(stylesSource, /url\('\/fonts\/jetbrains-mono-latin\.woff2'\)/);
    assert.doesNotMatch(stylesSource, /fonts\.googleapis\.com|fonts\.gstatic\.com/);
  });
});
