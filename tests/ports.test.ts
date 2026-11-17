import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { searchPorts, getPortDetails, COMMON_PORTS } from '../src/core/ports';

describe('Core: Network Ports Reference', () => {
  it('contains critical cybersecurity well-known ports', () => {
    assert.ok(COMMON_PORTS.length >= 30);
    const ssh = getPortDetails(22);
    assert.equal(ssh?.service, 'ssh');
    assert.equal(ssh?.category, 'Remote Access');

    const smb = getPortDetails(445);
    assert.equal(smb?.service, 'microsoft-ds');
    assert.ok(smb?.securityNotes.includes('EternalBlue'));
  });

  it('searches ports by exact port number', () => {
    const results = searchPorts('3389');
    assert.equal(results.length, 1);
    assert.equal(results[0]?.name, 'Remote Desktop (RDP)');
  });

  it('searches ports by keyword across descriptions and notes', () => {
    const results = searchPorts('kerberos');
    assert.ok(results.length >= 1);
    assert.ok(results.some((p) => p.port === 88));
  });

  it('returns all ports when search query is empty', () => {
    const results = searchPorts('');
    assert.equal(results.length, COMMON_PORTS.length);
  });
});
