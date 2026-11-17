import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateSubnet, cidrToNetmaskLong, netmaskToCidr } from '../src/core/subnet';

describe('Core: IPv4 Subnet & CIDR Calculator', () => {
  it('calculates standard /24 subnet properties correctly', () => {
    const res = calculateSubnet('192.168.1.50/24');
    assert.equal(res.ip, '192.168.1.50');
    assert.equal(res.cidrPrefix, 24);
    assert.equal(res.netmask, '255.255.255.0');
    assert.equal(res.wildcardMask, '0.0.0.255');
    assert.equal(res.networkAddress, '192.168.1.0');
    assert.equal(res.broadcastAddress, '192.168.1.255');
    assert.equal(res.firstUsableIp, '192.168.1.1');
    assert.equal(res.lastUsableIp, '192.168.1.254');
    assert.equal(res.totalHosts, 256);
    assert.equal(res.usableHosts, 254);
    assert.equal(res.ipClass, 'C');
    assert.equal(res.scope, 'RFC 1918 (Private)');
  });

  it('correctly handles RFC 1918 Class A (10.0.0.0/8)', () => {
    const res = calculateSubnet('10.5.20.1/8');
    assert.equal(res.networkAddress, '10.0.0.0');
    assert.equal(res.broadcastAddress, '10.255.255.255');
    assert.equal(res.scope, 'RFC 1918 (Private)');
    assert.equal(res.ipClass, 'A');
    assert.equal(res.usableHosts, 16777214);
  });

  it('correctly handles point-to-point /31 subnets (RFC 3021)', () => {
    const res = calculateSubnet('10.0.0.0/31');
    assert.equal(res.totalHosts, 2);
    assert.equal(res.usableHosts, 2);
    assert.equal(res.firstUsableIp, '10.0.0.0');
    assert.equal(res.lastUsableIp, '10.0.0.1');
  });

  it('correctly handles single host /32 routes', () => {
    const res = calculateSubnet('172.16.5.10/32');
    assert.equal(res.totalHosts, 1);
    assert.equal(res.usableHosts, 1);
    assert.equal(res.firstUsableIp, '172.16.5.10');
    assert.equal(res.lastUsableIp, '172.16.5.10');
  });

  it('identifies Loopback and CGNAT addresses', () => {
    const loop = calculateSubnet('127.0.0.1/8');
    assert.equal(loop.scope, 'Loopback');

    const cgnat = calculateSubnet('100.64.0.1/10');
    assert.equal(cgnat.scope, 'CGNAT (RFC 6598)');
  });

  it('converts between netmask and CIDR prefix', () => {
    assert.equal(netmaskToCidr('255.255.255.0'), 24);
    assert.equal(netmaskToCidr('255.255.0.0'), 16);
    assert.equal(netmaskToCidr('255.0.0.0'), 8);
    assert.equal(netmaskToCidr('255.255.255.252'), 30);
    assert.equal(cidrToNetmaskLong(24), 0xffffff00 >>> 0);
  });

  it('rejects malformed IP addresses and invalid CIDRs', () => {
    assert.throws(() => calculateSubnet('999.1.1.1/24'), /Invalid IPv4 address/);
    assert.throws(() => calculateSubnet('192.168.1.1/35'), /Invalid prefix length/);
  });
});
