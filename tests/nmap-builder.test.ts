import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildNmapCommand } from '../src/core/nmap-builder';

describe('Core: Nmap Command Generator', () => {
  it('generates a standard TCP SYN stealth scan with timing', () => {
    const res = buildNmapCommand({
      target: '192.168.1.0/24',
      scanType: 'syn',
      portMode: 'default',
      serviceDetection: true,
      osDetection: false,
      defaultScripts: true,
      vulnScripts: false,
      timing: 'aggressive',
      skipHostDiscovery: true,
      noDnsResolution: true,
      traceroute: false,
      verboseLevel: 1
    });

    assert.equal(res.target, '192.168.1.0/24');
    assert.ok(res.command.includes('-sS'));
    assert.ok(res.command.includes('-sV'));
    assert.ok(res.command.includes('-sC'));
    assert.ok(res.command.includes('-T4'));
    assert.ok(res.command.includes('-Pn'));
    assert.ok(res.command.includes('-n'));
    assert.ok(res.command.includes('-v'));
    assert.ok(res.command.endsWith('192.168.1.0/24'));
    assert.ok(res.flags.some((f) => f.flag === '-sS'));
  });

  it('supports custom ports and fast scan mode', () => {
    const customRes = buildNmapCommand({
      target: '10.10.10.10',
      scanType: 'connect',
      portMode: 'custom',
      customPorts: '80,443,8080,8443',
      serviceDetection: false,
      osDetection: false,
      defaultScripts: false,
      vulnScripts: false,
      timing: 'normal',
      skipHostDiscovery: false,
      noDnsResolution: false,
      traceroute: false,
      verboseLevel: 0
    });

    assert.ok(customRes.command.includes('-sT'));
    assert.ok(customRes.command.includes('-p 80,443,8080,8443'));
    assert.ok(!customRes.command.includes('-T3')); // Default normal timing omitted for brevity
  });

  it('issues safety warnings for aggressive vuln scripts and extreme min-rate', () => {
    const aggRes = buildNmapCommand({
      target: 'scanme.nmap.org',
      scanType: 'syn',
      portMode: 'all',
      serviceDetection: true,
      osDetection: true,
      defaultScripts: true,
      vulnScripts: true,
      timing: 'insane',
      skipHostDiscovery: true,
      noDnsResolution: true,
      traceroute: true,
      verboseLevel: 2,
      minRate: 10000,
      outputFormat: 'all',
      outputFilename: 'audit_scanme'
    });

    assert.ok(aggRes.command.includes('-p-'));
    assert.ok(aggRes.command.includes('-O'));
    assert.ok(aggRes.command.includes('--script vuln'));
    assert.ok(aggRes.command.includes('-oA audit_scanme'));
    assert.ok(aggRes.safetyWarnings.length >= 2);
    assert.ok(aggRes.safetyWarnings.some((w) => w.includes('Vulnerability scanning generates significant traffic')));
    assert.ok(aggRes.safetyWarnings.some((w) => w.includes('High min-rate')));
  });
});
