/**
 * CALION Tools — Network Ports Reference
 * Curated reference database of standard networking ports, services, protocols, and security context.
 */

export interface PortEntry {
  port: number;
  protocol: 'TCP' | 'UDP' | 'TCP/UDP';
  service: string;
  name: string;
  category: 'Web' | 'File Transfer' | 'Mail' | 'Database' | 'Remote Access' | 'Network Infrastructure' | 'Directory / Authentication' | 'Other';
  description: string;
  securityNotes: string;
}

export const COMMON_PORTS: PortEntry[] = [
  {
    port: 20,
    protocol: 'TCP',
    service: 'ftp-data',
    name: 'FTP Data Transfer',
    category: 'File Transfer',
    description: 'File Transfer Protocol default data channel in active mode.',
    securityNotes: 'Transmits data in plaintext. Active mode causes firewall traversal issues.'
  },
  {
    port: 21,
    protocol: 'TCP',
    service: 'ftp',
    name: 'FTP Control',
    category: 'File Transfer',
    description: 'File Transfer Protocol command channel for authentication and directory navigation.',
    securityNotes: 'Plaintext credentials. Prone to brute-force attacks and anonymous login misconfigurations.'
  },
  {
    port: 22,
    protocol: 'TCP',
    service: 'ssh',
    name: 'SSH / SFTP',
    category: 'Remote Access',
    description: 'Secure Shell for encrypted remote command-line access and SFTP.',
    securityNotes: 'High-value target. Best practices: disable root login, require public keys, implement fail2ban.'
  },
  {
    port: 23,
    protocol: 'TCP',
    service: 'telnet',
    name: 'Telnet',
    category: 'Remote Access',
    description: 'Legacy unencrypted terminal communication protocol.',
    securityNotes: 'CRITICAL: Insecure. Transmits all keystrokes and passwords in cleartext. Replace with SSH.'
  },
  {
    port: 25,
    protocol: 'TCP',
    service: 'smtp',
    name: 'SMTP',
    category: 'Mail',
    description: 'Simple Mail Transfer Protocol for MTA-to-MTA email routing.',
    securityNotes: 'Subject to open-relay abuse, email spoofing without SPF/DKIM/DMARC, and user enumeration (VRFY/EXPN).'
  },
  {
    port: 53,
    protocol: 'TCP/UDP',
    service: 'dns',
    name: 'DNS',
    category: 'Network Infrastructure',
    description: 'Domain Name System. UDP for standard queries, TCP for zone transfers and large responses.',
    securityNotes: 'Vulnerable to DNS amplification DDoS, cache poisoning, and unauthorized AXFR zone transfers.'
  },
  {
    port: 67,
    protocol: 'UDP',
    service: 'dhcp-server',
    name: 'DHCP Server (BOOTP)',
    category: 'Network Infrastructure',
    description: 'Dynamic Host Configuration Protocol server broadcast listener.',
    securityNotes: 'Vulnerable to rogue DHCP servers and starvation attacks.'
  },
  {
    port: 68,
    protocol: 'UDP',
    service: 'dhcp-client',
    name: 'DHCP Client (BOOTP)',
    category: 'Network Infrastructure',
    description: 'Dynamic Host Configuration Protocol client port.',
    securityNotes: 'Target for DHCP reply spoofing.'
  },
  {
    port: 69,
    protocol: 'UDP',
    service: 'tftp',
    name: 'TFTP',
    category: 'File Transfer',
    description: 'Trivial File Transfer Protocol used for PXE network booting and router firmware recovery.',
    securityNotes: 'Zero authentication or encryption. Any client can read/write files if network access is gained.'
  },
  {
    port: 80,
    protocol: 'TCP',
    service: 'http',
    name: 'HTTP',
    category: 'Web',
    description: 'Hypertext Transfer Protocol for unencrypted web communication.',
    securityNotes: 'Cleartext traffic. Should redirect to HTTPS (port 443) with HSTS headers.'
  },
  {
    port: 88,
    protocol: 'TCP/UDP',
    service: 'kerberos',
    name: 'Kerberos KDC',
    category: 'Directory / Authentication',
    description: 'Kerberos authentication service for Active Directory domain controllers.',
    securityNotes: 'Target for AS-REP Roasting, Kerberoasting (SPN ticket harvesting), and Golden/Silver ticket attacks.'
  },
  {
    port: 110,
    protocol: 'TCP',
    service: 'pop3',
    name: 'POP3',
    category: 'Mail',
    description: 'Post Office Protocol version 3 for email client retrieval.',
    securityNotes: 'Cleartext authentication. Use POP3S (port 995) or IMAPS instead.'
  },
  {
    port: 123,
    protocol: 'UDP',
    service: 'ntp',
    name: 'NTP',
    category: 'Network Infrastructure',
    description: 'Network Time Protocol for clock synchronization.',
    securityNotes: 'High amplification factor in DDoS attacks (monlist query abuse). Desynchronization can break Kerberos.'
  },
  {
    port: 135,
    protocol: 'TCP',
    service: 'msrpc',
    name: 'Microsoft RPC Endpoint Mapper',
    category: 'Remote Access',
    description: 'Microsoft Remote Procedure Call endpoint mapper.',
    securityNotes: 'Crucial for Windows lateral movement, DCOM exploitation, and PetitPotam NTLM relaying.'
  },
  {
    port: 139,
    protocol: 'TCP',
    service: 'netbios-ssn',
    name: 'NetBIOS Session Service',
    category: 'File Transfer',
    description: 'Legacy NetBIOS over TCP/IP for Windows file and printer sharing.',
    securityNotes: 'Allows anonymous null sessions to enumerate users, shares, and domains on older systems.'
  },
  {
    port: 143,
    protocol: 'TCP',
    service: 'imap',
    name: 'IMAP',
    category: 'Mail',
    description: 'Internet Message Access Protocol for email retrieval.',
    securityNotes: 'Cleartext authentication. Use IMAPS (port 993) instead.'
  },
  {
    port: 161,
    protocol: 'UDP',
    service: 'snmp',
    name: 'SNMP',
    category: 'Network Infrastructure',
    description: 'Simple Network Management Protocol for monitoring network devices.',
    securityNotes: 'SNMPv1/v2c use cleartext community strings ("public", "private"). Leaks interfaces, routing tables, and credentials.'
  },
  {
    port: 389,
    protocol: 'TCP/UDP',
    service: 'ldap',
    name: 'LDAP',
    category: 'Directory / Authentication',
    description: 'Lightweight Directory Access Protocol for querying Active Directory / directory servers.',
    securityNotes: 'Allows anonymous or unauthenticated binding if misconfigured. Use LDAPS (port 636).'
  },
  {
    port: 443,
    protocol: 'TCP',
    service: 'https',
    name: 'HTTPS / TLS',
    category: 'Web',
    description: 'HTTP over TLS/SSL for encrypted web communications.',
    securityNotes: 'Industry standard for web traffic. Verify certificate validity, TLS 1.2/1.3, and robust cipher suites.'
  },
  {
    port: 445,
    protocol: 'TCP',
    service: 'microsoft-ds',
    name: 'SMB over IP',
    category: 'File Transfer',
    description: 'Server Message Block for file sharing, named pipes, and RPC on modern Windows systems.',
    securityNotes: 'Extremely high risk if exposed. Subject of EternalBlue (MS17-010), PsExec execution, and relay attacks.'
  },
  {
    port: 465,
    protocol: 'TCP',
    service: 'smtps',
    name: 'SMTPS',
    category: 'Mail',
    description: 'SMTP over implicit SSL/TLS for secure mail submission.',
    securityNotes: 'Deprecated in favor of port 587 with STARTTLS, but still widely deployed.'
  },
  {
    port: 514,
    protocol: 'UDP',
    service: 'syslog',
    name: 'Syslog',
    category: 'Network Infrastructure',
    description: 'Standard system logging protocol across Unix/Linux devices.',
    securityNotes: 'UDP syslog has no authentication or encryption. Subject to message spoofing and tampering.'
  },
  {
    port: 587,
    protocol: 'TCP',
    service: 'submission',
    name: 'SMTP Submission',
    category: 'Mail',
    description: 'Modern standard port for authenticated email client submission with STARTTLS.',
    securityNotes: 'Requires authentication before relaying mail.'
  },
  {
    port: 636,
    protocol: 'TCP',
    service: 'ldaps',
    name: 'LDAPS',
    category: 'Directory / Authentication',
    description: 'LDAP over SSL/TLS for secure directory access.',
    securityNotes: 'Protects directory search queries and credentials from eavesdropping.'
  },
  {
    port: 993,
    protocol: 'TCP',
    service: 'imaps',
    name: 'IMAPS',
    category: 'Mail',
    description: 'IMAP over TLS/SSL.',
    securityNotes: 'Secure email retrieval standard.'
  },
  {
    port: 995,
    protocol: 'TCP',
    service: 'pop3s',
    name: 'POP3S',
    category: 'Mail',
    description: 'POP3 over TLS/SSL.',
    securityNotes: 'Secure POP3 email retrieval.'
  },
  {
    port: 1433,
    protocol: 'TCP',
    service: 'ms-sql-s',
    name: 'Microsoft SQL Server',
    category: 'Database',
    description: 'Microsoft SQL Server database listening port.',
    securityNotes: 'Target for sa brute forcing, xp_cmdshell command execution, and SQL injection.'
  },
  {
    port: 1521,
    protocol: 'TCP',
    service: 'oracle',
    name: 'Oracle TNS Listener',
    category: 'Database',
    description: 'Oracle Database listener service.',
    securityNotes: 'TNS listener poisoning, SID enumeration, default schema credentials (SYS, SYSTEM, SCOTT).'
  },
  {
    port: 2049,
    protocol: 'TCP/UDP',
    service: 'nfs',
    name: 'NFS',
    category: 'File Transfer',
    description: 'Network File System for sharing directories across Unix/Linux machines.',
    securityNotes: 'No_root_squash misconfigurations allow immediate local privilege escalation.'
  },
  {
    port: 3306,
    protocol: 'TCP',
    service: 'mysql',
    name: 'MySQL / MariaDB',
    category: 'Database',
    description: 'Standard MySQL and MariaDB relational database service port.',
    securityNotes: 'Should never be exposed to public Internet. Prone to brute-force and remote code execution via UDF.'
  },
  {
    port: 3389,
    protocol: 'TCP',
    service: 'rdp',
    name: 'Remote Desktop (RDP)',
    category: 'Remote Access',
    description: 'Microsoft Remote Desktop Protocol for graphical Windows sessions.',
    securityNotes: 'Prime ransomware entry vector. Vulnerable to BlueKeep (CVE-2019-0708) and brute-force attacks.'
  },
  {
    port: 5432,
    protocol: 'TCP',
    service: 'postgresql',
    name: 'PostgreSQL',
    category: 'Database',
    description: 'PostgreSQL object-relational database listener.',
    securityNotes: 'Audit pg_hba.conf for trust authentication vulnerabilities; RCE possible via COPY FROM PROGRAM.'
  },
  {
    port: 5900,
    protocol: 'TCP',
    service: 'vnc',
    name: 'VNC Server',
    category: 'Remote Access',
    description: 'Virtual Network Computing screen sharing service.',
    securityNotes: 'Often configured without passwords or with weak DES-based 8-character passwords.'
  },
  {
    port: 5985,
    protocol: 'TCP',
    service: 'winrm-http',
    name: 'WinRM HTTP',
    category: 'Remote Access',
    description: 'Windows Remote Management protocol using HTTP/SOAP.',
    securityNotes: 'Primary vector for PowerShell Remoting and Evil-WinRM credential exploitation.'
  },
  {
    port: 5986,
    protocol: 'TCP',
    service: 'winrm-https',
    name: 'WinRM HTTPS',
    category: 'Remote Access',
    description: 'Windows Remote Management protocol encrypted over HTTPS.',
    securityNotes: 'Encrypted PowerShell remoting endpoint.'
  },
  {
    port: 6379,
    protocol: 'TCP',
    service: 'redis',
    name: 'Redis Key-Value Store',
    category: 'Database',
    description: 'In-memory data structure store used as database, cache, and message broker.',
    securityNotes: 'Defaults to no authentication. Trivial remote code execution via cron or SSH authorized_keys write.'
  },
  {
    port: 8080,
    protocol: 'TCP',
    service: 'http-proxy / alt',
    name: 'HTTP Alternate / Proxy / Tomcat',
    category: 'Web',
    description: 'Common alternate HTTP port used by Apache Tomcat, Spring Boot, Jenkins, and development proxies.',
    securityNotes: 'Frequently hosts administrative consoles (Tomcat Manager, Jenkins) with default credentials.'
  },
  {
    port: 8443,
    protocol: 'TCP',
    service: 'https-alt',
    name: 'HTTPS Alternate',
    category: 'Web',
    description: 'Common alternate port for HTTPS web administration interfaces.',
    securityNotes: 'Commonly hosts router, firewall, or hypervisor web UIs.'
  },
  {
    port: 9200,
    protocol: 'TCP',
    service: 'elasticsearch',
    name: 'Elasticsearch REST API',
    category: 'Database',
    description: 'Search and analytics engine REST API port.',
    securityNotes: 'Historically shipped with security disabled by default; leading cause of exposed database data breaches.'
  },
  {
    port: 27017,
    protocol: 'TCP',
    service: 'mongodb',
    name: 'MongoDB',
    category: 'Database',
    description: 'MongoDB NoSQL document database default listener.',
    securityNotes: 'Legacy versions bound to all interfaces with no authentication; prime ransomware target.'
  }
];

export function searchPorts(query: string): PortEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return COMMON_PORTS;

  const portNum = parseInt(q, 10);
  if (!isNaN(portNum)) {
    return COMMON_PORTS.filter((p) => p.port === portNum);
  }

  return COMMON_PORTS.filter(
    (p) =>
      p.service.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.securityNotes.toLowerCase().includes(q)
  );
}

export function getPortDetails(port: number): PortEntry | undefined {
  return COMMON_PORTS.find((p) => p.port === port);
}
