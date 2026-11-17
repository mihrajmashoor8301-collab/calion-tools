/**
 * CALION Tools — IPv4 Subnet & CIDR Calculator
 * Network calculations, mask conversions, usable ranges, RFC 1918 scope identification.
 */

export interface SubnetResult {
  ip: string;
  cidrPrefix: number;
  netmask: string;
  wildcardMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableIp: string;
  lastUsableIp: string;
  totalHosts: number;
  usableHosts: number;
  ipClass: 'A' | 'B' | 'C' | 'D (Multicast)' | 'E (Experimental)';
  scope: 'RFC 1918 (Private)' | 'Public' | 'Loopback' | 'Link-Local' | 'CGNAT (RFC 6598)' | 'Multicast' | 'Broadcast';
  binaryIp: string;
  binaryNetmask: string;
  binaryNetwork: string;
}

function ipToLong(ip: string): number {
  const octets = ip.split('.').map((x) => parseInt(x, 10));
  if (octets.length !== 4 || octets.some((n) => isNaN(n) || n < 0 || n > 255)) {
    throw new Error(`Invalid IPv4 address: "${ip}"`);
  }
  return (((octets[0]! << 24) >>> 0) + ((octets[1]! << 16) >>> 0) + ((octets[2]! << 8) >>> 0) + (octets[3]! >>> 0)) >>> 0;
}

function longToIp(long: number): string {
  return [
    (long >>> 24) & 255,
    (long >>> 16) & 255,
    (long >>> 8) & 255,
    long & 255
  ].join('.');
}

function longToBinaryString(long: number): string {
  return [
    ((long >>> 24) & 255).toString(2).padStart(8, '0'),
    ((long >>> 16) & 255).toString(2).padStart(8, '0'),
    ((long >>> 8) & 255).toString(2).padStart(8, '0'),
    (long & 255).toString(2).padStart(8, '0')
  ].join('.');
}

export function cidrToNetmaskLong(prefix: number): number {
  if (prefix < 0 || prefix > 32 || !Number.isInteger(prefix)) {
    throw new Error(`Invalid CIDR prefix /${prefix}: must be an integer between 0 and 32`);
  }
  if (prefix === 0) return 0;
  return ((0xffffffff << (32 - prefix)) >>> 0);
}

export function netmaskToCidr(netmask: string): number {
  const long = ipToLong(netmask);
  // Count consecutive leading ones
  let count = 0;
  let started = false;
  for (let i = 31; i >= 0; i--) {
    const bit = (long >>> i) & 1;
    if (bit === 1) {
      if (started && count !== 31 - i) {
        throw new Error(`Invalid non-contiguous netmask: ${netmask}`);
      }
      started = true;
      count++;
    } else {
      started = true;
    }
  }
  return count;
}

export function calculateSubnet(input: string, customPrefix?: number): SubnetResult {
  let ipStr = input.trim();
  let prefix = customPrefix;

  if (ipStr.includes('/')) {
    const parts = ipStr.split('/');
    ipStr = parts[0]!.trim();
    const parsedPrefix = parseInt(parts[1]!.trim(), 10);
    if (isNaN(parsedPrefix)) {
      throw new Error(`Invalid CIDR format in "${input}"`);
    }
    prefix = parsedPrefix;
  }

  if (prefix === undefined) {
    prefix = 24; // Default to /24 if not specified
  }

  if (prefix < 0 || prefix > 32) {
    throw new Error(`Invalid prefix length /${prefix}. Allowed range: 0-32.`);
  }

  const ipLong = ipToLong(ipStr);
  const maskLong = cidrToNetmaskLong(prefix);
  const wildcardLong = (~maskLong >>> 0);

  const networkLong = (ipLong & maskLong) >>> 0;
  const broadcastLong = (networkLong | wildcardLong) >>> 0;

  const totalHosts = prefix === 0 ? 4294967296 : Math.pow(2, 32 - prefix);

  let usableHosts: number;
  let firstUsableLong: number;
  let lastUsableLong: number;

  if (prefix === 32) {
    usableHosts = 1;
    firstUsableLong = networkLong;
    lastUsableLong = networkLong;
  } else if (prefix === 31) {
    // RFC 3021 point-to-point links
    usableHosts = 2;
    firstUsableLong = networkLong;
    lastUsableLong = broadcastLong;
  } else {
    usableHosts = Math.max(0, totalHosts - 2);
    firstUsableLong = (networkLong + 1) >>> 0;
    lastUsableLong = (broadcastLong - 1) >>> 0;
  }

  // Class determination
  const firstOctet = (ipLong >>> 24) & 255;
  let ipClass: SubnetResult['ipClass'];
  if (firstOctet <= 127) ipClass = 'A';
  else if (firstOctet <= 191) ipClass = 'B';
  else if (firstOctet <= 223) ipClass = 'C';
  else if (firstOctet <= 239) ipClass = 'D (Multicast)';
  else ipClass = 'E (Experimental)';

  // Scope determination
  let scope: SubnetResult['scope'] = 'Public';
  if (firstOctet === 127) {
    scope = 'Loopback';
  } else if (firstOctet === 10) {
    scope = 'RFC 1918 (Private)'; // 10.0.0.0/8
  } else if (firstOctet === 172 && ((ipLong >>> 16) & 255) >= 16 && ((ipLong >>> 16) & 255) <= 31) {
    scope = 'RFC 1918 (Private)'; // 172.16.0.0/12
  } else if (firstOctet === 192 && ((ipLong >>> 16) & 255) === 168) {
    scope = 'RFC 1918 (Private)'; // 192.168.0.0/16
  } else if (firstOctet === 169 && ((ipLong >>> 16) & 255) === 254) {
    scope = 'Link-Local'; // 169.254.0.0/16
  } else if (firstOctet === 100 && ((ipLong >>> 16) & 255) >= 64 && ((ipLong >>> 16) & 255) <= 127) {
    scope = 'CGNAT (RFC 6598)'; // 100.64.0.0/10
  } else if (firstOctet >= 224 && firstOctet <= 239) {
    scope = 'Multicast';
  } else if (ipLong === 0xffffffff) {
    scope = 'Broadcast';
  }

  return {
    ip: longToIp(ipLong),
    cidrPrefix: prefix,
    netmask: longToIp(maskLong),
    wildcardMask: longToIp(wildcardLong),
    networkAddress: longToIp(networkLong),
    broadcastAddress: longToIp(broadcastLong),
    firstUsableIp: longToIp(firstUsableLong),
    lastUsableIp: longToIp(lastUsableLong),
    totalHosts,
    usableHosts,
    ipClass,
    scope,
    binaryIp: longToBinaryString(ipLong),
    binaryNetmask: longToBinaryString(maskLong),
    binaryNetwork: longToBinaryString(networkLong)
  };
}
