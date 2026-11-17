import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ALL_TOOLS } from '../src/ui/layout';

describe('UI: Tool Modules Contract & Metadata', () => {
  it('contains exactly 13 registered tool modules', () => {
    assert.equal(ALL_TOOLS.length, 13);
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
      'nmap-builder'
    ];

    const actualIds = ALL_TOOLS.map((t) => t.id);
    for (const id of expectedIds) {
      assert.ok(actualIds.includes(id), `Expected tool id "${id}" not found in ALL_TOOLS`);
    }
  });
});
