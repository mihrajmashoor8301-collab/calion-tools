/**
 * CALION Tools — Nmap Command Generator
 * Generates safe, syntactically correct Nmap command lines with flag explanations.
 */

export type ScanType = 'syn' | 'connect' | 'udp' | 'ping-sweep' | 'null' | 'fin' | 'xmas';
export type TimingTemplate = 'paranoid' | 'sneaky' | 'polite' | 'normal' | 'aggressive' | 'insane';
export type PortSelectionMode = 'default' | 'fast' | 'all' | 'top-ports' | 'custom';

export interface NmapConfig {
  target: string;
  scanType: ScanType;
  portMode: PortSelectionMode;
  customPorts?: string;
  topPortsCount?: number;
  serviceDetection: boolean;
  versionIntensity?: number; // 0-9
  osDetection: boolean;
  defaultScripts: boolean;
  vulnScripts: boolean;
  customScript?: string;
  timing: TimingTemplate;
  skipHostDiscovery: boolean; // -Pn
  noDnsResolution: boolean;   // -n
  traceroute: boolean;        // --traceroute
  verboseLevel: 0 | 1 | 2;    // -v / -vv
  outputFormat?: 'normal' | 'xml' | 'grepable' | 'all';
  outputFilename?: string;
  minRate?: number;
}

export interface NmapCommandResult {
  command: string;
  target: string;
  flags: { flag: string; description: string }[];
  safetyWarnings: string[];
}

export function buildNmapCommand(config: NmapConfig): NmapCommandResult {
  const flags: { flag: string; description: string }[] = [];
  const parts: string[] = ['nmap'];
  const warnings: string[] = [];

  const rawTarget = config.target.trim();
  const target = rawTarget || '<target>';

  // 1. Scan Type
  switch (config.scanType) {
    case 'syn':
      parts.push('-sS');
      flags.push({ flag: '-sS', description: 'TCP SYN Stealth Scan (requires root / sudo)' });
      break;
    case 'connect':
      parts.push('-sT');
      flags.push({ flag: '-sT', description: 'TCP Connect Scan (uses OS socket, unprivileged)' });
      break;
    case 'udp':
      parts.push('-sU');
      flags.push({ flag: '-sU', description: 'UDP Port Scan (slower due to ICMP rate-limiting)' });
      break;
    case 'ping-sweep':
      parts.push('-sn');
      flags.push({ flag: '-sn', description: 'Ping Scan: disable port scan, host discovery only' });
      break;
    case 'null':
      parts.push('-sN');
      flags.push({ flag: '-sN', description: 'TCP Null Scan (no flags set)' });
      break;
    case 'fin':
      parts.push('-sF');
      flags.push({ flag: '-sF', description: 'TCP FIN Scan (FIN flag only)' });
      break;
    case 'xmas':
      parts.push('-sX');
      flags.push({ flag: '-sX', description: 'TCP Xmas Scan (FIN, PSH, and URG flags set)' });
      break;
  }

  // 2. Port Selection
  if (config.scanType !== 'ping-sweep') {
    switch (config.portMode) {
      case 'fast':
        parts.push('-F');
        flags.push({ flag: '-F', description: 'Fast scan: scan the top 100 most common ports' });
        break;
      case 'all':
        parts.push('-p-');
        flags.push({ flag: '-p-', description: 'Scan all 65,535 TCP/UDP ports' });
        break;
      case 'top-ports': {
        const count = config.topPortsCount ?? 1000;
        parts.push(`--top-ports ${count}`);
        flags.push({ flag: `--top-ports ${count}`, description: `Scan top ${count} most frequent ports` });
        break;
      }
      case 'custom':
        if (config.customPorts && config.customPorts.trim()) {
          const sanitizedPorts = config.customPorts.replace(/\s+/g, '');
          parts.push(`-p ${sanitizedPorts}`);
          flags.push({ flag: `-p ${sanitizedPorts}`, description: `Scan specified ports: ${sanitizedPorts}` });
        }
        break;
      case 'default':
      default:
        // Default scans top 1000 ports implicitly
        break;
    }
  }

  // 3. Service & OS Detection
  if (config.serviceDetection) {
    if (config.versionIntensity !== undefined && config.versionIntensity >= 0 && config.versionIntensity <= 9) {
      parts.push(`-sV --version-intensity ${config.versionIntensity}`);
      flags.push({ flag: `-sV --version-intensity ${config.versionIntensity}`, description: `Service version detection with probe intensity ${config.versionIntensity}` });
    } else {
      parts.push('-sV');
      flags.push({ flag: '-sV', description: 'Probe open ports to determine service/version info' });
    }
  }

  if (config.osDetection) {
    parts.push('-O');
    flags.push({ flag: '-O', description: 'Enable OS detection (fingerprints TCP/IP stack)' });
  }

  // 4. Scripts (NSE)
  if (config.defaultScripts) {
    parts.push('-sC');
    flags.push({ flag: '-sC', description: 'Run default safe NSE scripts for discovered services' });
  }
  if (config.vulnScripts) {
    parts.push('--script vuln');
    flags.push({ flag: '--script vuln', description: 'Run NSE vulnerability detection scripts against discovered services' });
    warnings.push('Vulnerability scanning generates significant traffic and can trigger IDS/IPS or crash unstable services.');
  }
  if (config.customScript && config.customScript.trim()) {
    const s = config.customScript.trim();
    parts.push(`--script "${s}"`);
    flags.push({ flag: `--script "${s}"`, description: `Run custom NSE script(s): ${s}` });
  }

  // 5. Timing
  const timingMap: Record<TimingTemplate, { flag: string; desc: string }> = {
    paranoid: { flag: '-T0', desc: 'Paranoid timing: extremely slow, IDS evasion' },
    sneaky: { flag: '-T1', desc: 'Sneaky timing: slow, IDS evasion' },
    polite: { flag: '-T2', desc: 'Polite timing: slows down to consume less bandwidth' },
    normal: { flag: '-T3', desc: 'Normal timing: default dynamic timing' },
    aggressive: { flag: '-T4', desc: 'Aggressive timing: faster execution on reliable networks' },
    insane: { flag: '-T5', desc: 'Insane timing: very aggressive, may miss ports on slow networks' }
  };
  const t = timingMap[config.timing] ?? timingMap.normal;
  if (config.timing !== 'normal') {
    parts.push(t.flag);
    flags.push({ flag: t.flag, description: t.desc });
  }

  // 6. Host Discovery & DNS
  if (config.skipHostDiscovery) {
    parts.push('-Pn');
    flags.push({ flag: '-Pn', description: 'Treat all hosts as online (skip ICMP/ping host discovery)' });
  }
  if (config.noDnsResolution) {
    parts.push('-n');
    flags.push({ flag: '-n', description: 'Never do reverse DNS resolution (improves scan speed)' });
  }
  if (config.traceroute) {
    parts.push('--traceroute');
    flags.push({ flag: '--traceroute', description: 'Trace hop path to target host' });
  }

  // 7. Performance
  if (config.minRate && config.minRate > 0) {
    parts.push(`--min-rate ${config.minRate}`);
    flags.push({ flag: `--min-rate ${config.minRate}`, description: `Send packets no slower than ${config.minRate} packets/second` });
    if (config.minRate > 5000) {
      warnings.push(`High min-rate (${config.minRate} pkt/s) can overwhelm target network links and cause dropped packets.`);
    }
  }

  // 8. Verbosity
  if (config.verboseLevel === 1) {
    parts.push('-v');
    flags.push({ flag: '-v', description: 'Increase verbosity (prints open ports as found)' });
  } else if (config.verboseLevel === 2) {
    parts.push('-vv');
    flags.push({ flag: '-vv', description: 'High verbosity' });
  }

  // 9. Output Format
  if (config.outputFormat && config.outputFilename) {
    const file = config.outputFilename.trim();
    switch (config.outputFormat) {
      case 'normal':
        parts.push(`-oN ${file}`);
        flags.push({ flag: `-oN ${file}`, description: `Save output in human-readable normal format to ${file}` });
        break;
      case 'xml':
        parts.push(`-oX ${file}`);
        flags.push({ flag: `-oX ${file}`, description: `Save output in XML format to ${file}` });
        break;
      case 'grepable':
        parts.push(`-oG ${file}`);
        flags.push({ flag: `-oG ${file}`, description: `Save output in grepable format to ${file}` });
        break;
      case 'all':
        parts.push(`-oA ${file}`);
        flags.push({ flag: `-oA ${file}`, description: `Save output in all formats (.nmap, .xml, .gnmap) using base name ${file}` });
        break;
    }
  }

  // 10. Append Target
  parts.push(target);

  return {
    command: parts.join(' '),
    target,
    flags,
    safetyWarnings: warnings
  };
}
