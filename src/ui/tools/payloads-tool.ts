import { ToolModule } from '../types';
import { escapeHtml } from '../utils';

interface InjectionDefense {
  title: string;
  category: string;
  description: string;
  vulnerableExample: string;
  remediatedExample: string;
  defensePrinciples: string[];
}

const DEFENSE_DATABASE: Record<string, InjectionDefense> = {
  sqli: {
    title: 'SQL Injection (SQLi) Defense',
    category: 'Database Security',
    description: 'Occurs when untrusted user input is directly concatenated into SQL query structures, allowing attackers to manipulate query logic.',
    vulnerableExample: `// VULNERABLE: Direct string concatenation
const query = "SELECT * FROM users WHERE username = '" + req.body.username + "' AND password = '" + req.body.password + "'";
db.query(query);`,
    remediatedExample: `// SECURE: Parameterized query (Prepared Statement)
const query = "SELECT * FROM users WHERE username = ? AND password = ?";
db.query(query, [req.body.username, req.body.password]);`,
    defensePrinciples: [
      'Always use parameterized queries (prepared statements) or safe ORM mappings.',
      'Enforce strict input type validation (e.g., ensure numeric IDs are cast to integers).',
      'Apply least-privilege permissions to database connection accounts.',
      'Deploy Web Application Firewall (WAF) inspection rules as secondary defense.'
    ]
  },
  xss: {
    title: 'Cross-Site Scripting (XSS) Defense',
    category: 'Client-Side Security',
    description: 'Occurs when an application includes untrusted data in a web page without proper validation or escaping, allowing browser script execution.',
    vulnerableExample: `<!-- VULNERABLE: Direct innerHTML injection -->
element.innerHTML = "Welcome back, " + userProvidedName + "!";`,
    remediatedExample: `<!-- SECURE: Context-aware textContent assignment -->
element.textContent = "Welcome back, " + userProvidedName + "!";

<!-- SECURE: Strict Content Security Policy (CSP) Header -->
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';`,
    defensePrinciples: [
      'Never insert untrusted data directly into innerHTML, document.write, or eval.',
      'Use textContent or trusted sanitization libraries (e.g. DOMPurify) before rendering.',
      'Implement strict Content Security Policy (CSP) blocking inline scripts and unauthorized hosts.',
      'Set HttpOnly flag on sensitive session cookies to prevent JavaScript access.'
    ]
  },
  cmdi: {
    title: 'Command Injection (CMDi) Defense',
    category: 'Operating System Security',
    description: 'Occurs when untrusted data is passed to a system shell execution function, allowing execution of arbitrary operating system commands.',
    vulnerableExample: `// VULNERABLE: Executing command inside a system subshell
const { exec } = require('child_process');
exec('ping -c 4 ' + req.query.host, (err, stdout) => { ... });`,
    remediatedExample: `// SECURE: Using execFile with arguments array (no subshell)
const { execFile } = require('child_process');
// Validate IP format with strict regex allowlist first
if (!/^[0-9a-zA-Z.-]+$/.test(req.query.host)) throw new Error('Invalid host format');
execFile('ping', ['-c', '4', req.query.host], (err, stdout) => { ... });`,
    defensePrinciples: [
      'Avoid calling operating system commands directly from web applications where native APIs exist.',
      'If process execution is required, use execFile/spawn with an array of arguments, never a shell string.',
      'Enforce strict character allowlists (e.g. reject pipes, semicolons, backticks, dollar signs).',
      'Run application processes under unprivileged, sandboxed service accounts.'
    ]
  },
  lfi: {
    title: 'Path Traversal & Local File Inclusion (LFI) Defense',
    category: 'Filesystem Security',
    description: 'Occurs when user-supplied file path inputs are not validated, allowing attackers to navigate outside the intended directory via dot-dot-slash (../).',
    vulnerableExample: `// VULNERABLE: Direct concatenation of user path
const filePath = '/var/www/uploads/' + req.query.filename;
res.sendFile(filePath);`,
    remediatedExample: `// SECURE: Strict basename extraction and path verification
const path = require('path');
const safeName = path.basename(req.query.filename);
const safePath = path.resolve('/var/www/uploads', safeName);

if (!safePath.startsWith('/var/www/uploads/')) {
  throw new Error('Access denied: directory traversal attempt');
}
res.sendFile(safePath);`,
    defensePrinciples: [
      'Strip path traversal characters using path.basename() before accessing the filesystem.',
      'Verify that resolved paths stay strictly within the target root directory using path.resolve.',
      'Store files referenced by random UUIDs or database IDs rather than user-supplied filenames.',
      'Run services in restricted containers or chroot environments.'
    ]
  }
};

export const payloadsTool: ToolModule = {
  id: 'payloads',
  title: 'Payload Analysis & Defense Guide',
  category: 'Cryptography & Security',
  description: 'Educational reference and defensive remediation guide for common web injection vulnerabilities (SQLi, XSS, Command Injection, LFI), input sanitization, and TTY stabilization.',
  icon: '🛡️',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Injection Mechanics &amp; Defensive Countermeasures</div>
          <div class="action-group">
            <span class="badge-tag">Educational Defense Reference</span>
          </div>
        </div>

        <!-- Safety Notice Banner -->
        <div style="background-color: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: var(--radius-md); padding: 14px 18px; margin-bottom: 20px;">
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <span style="font-size: 1.25rem;">ℹ️</span>
            <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
              <strong style="color: var(--text-primary);">Defensive Remediation Scope:</strong> This module details the root causes, detection vectors, and secure code remediations for standard injection weaknesses. In compliance with safety policies, dynamic generation of weaponized exploit chains and automated reverse shells is omitted in favor of defensive engineering guidance.
            </div>
          </div>
        </div>

        <!-- Vulnerability Selector -->
        <div class="form-row">
          <div class="form-group" style="flex: 1;">
            <label class="form-label" for="vuln-select">Select Vulnerability Domain</label>
            <select class="form-select" id="vuln-select">
              <option value="sqli">SQL Injection (SQLi) — Prepared Statements &amp; ORM</option>
              <option value="xss">Cross-Site Scripting (XSS) — Sanitization &amp; CSP</option>
              <option value="cmdi">Command Injection (CMDi) — Safe Process Execution</option>
              <option value="lfi">Path Traversal (LFI) — Canonicalization &amp; Basename</option>
            </select>
          </div>
        </div>

        <div id="vuln-details-area" style="margin-top: 1.5rem;"></div>

        <!-- Interactive Input Sanitization Tester -->
        <div style="margin-top: 2rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem;">
          <h4 style="font-size: 1.05rem; margin-bottom: 8px;">Interactive Defensive Input Sanitizer</h4>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 14px;">
            Test how defensive filtering neutralizes hazardous injection characters in real time.
          </p>

          <div class="form-group">
            <label class="form-label" for="test-input">Test String / Untrusted Input</label>
            <input type="text" class="form-control" id="test-input" value="<script>alert('test')</script> & 1; rm -rf /" spellcheck="false" />
          </div>

          <div class="form-row" style="margin-top: 14px;">
            <div class="form-group" style="flex: 1;">
              <label class="form-label">HTML Entity Neutralized (XSS Defense)</label>
              <div class="output-block" id="sanitized-html" style="font-family: var(--font-mono); font-size: 0.85rem;"></div>
            </div>
            <div class="form-group" style="flex: 1;">
              <label class="form-label">Strict Alphanumeric Allowlist (CMDi Defense)</label>
              <div class="output-block" id="sanitized-alpha" style="font-family: var(--font-mono); font-size: 0.85rem;"></div>
            </div>
          </div>
        </div>

        <!-- Authorized Lab TTY Stabilization Reference -->
        <div style="margin-top: 2rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem;">
          <h4 style="font-size: 1.05rem; margin-bottom: 8px;">Authorized Lab TTY Stabilization Reference</h4>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">
            Standard POSIX commands used in controlled lab environments to upgrade raw terminal sessions to full interactive PTY:
          </p>
          <div class="output-block" style="font-family: var(--font-mono); font-size: 0.825rem; line-height: 1.6;">
# 1. Spawn pseudo-terminal via Python<br>
python3 -c 'import pty; pty.spawn("/bin/bash")'<br><br>
# 2. Background session and configure local terminal raw mode<br>
Ctrl+Z<br>
stty raw -echo; fg<br><br>
# 3. Export terminal capability variables<br>
export TERM=xterm-256color<br>
export SHELL=/bin/bash<br>
stty rows 38 cols 116
          </div>
        </div>
      </div>
    `;

    const select = container.querySelector('#vuln-select') as HTMLSelectElement;
    const detailsArea = container.querySelector('#vuln-details-area') as HTMLElement;
    const testInput = container.querySelector('#test-input') as HTMLInputElement;
    const sanitizedHtml = container.querySelector('#sanitized-html') as HTMLElement;
    const sanitizedAlpha = container.querySelector('#sanitized-alpha') as HTMLElement;

    function renderVuln(key: string): void {
      const item = DEFENSE_DATABASE[key];
      if (!item) return;

      detailsArea.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <h3 style="font-size: 1.2rem; color: var(--accent-cyan); margin-bottom: 6px;">${escapeHtml(item.title)}</h3>
            <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5;">${escapeHtml(item.description)}</p>
          </div>

          <div class="form-row">
            <div class="form-group" style="flex: 1;">
              <label class="form-label" style="color: var(--accent-rose);">❌ Vulnerable Implementation</label>
              <pre class="output-block" style="font-family: var(--font-mono); font-size: 0.8rem; color: #fca5a5; overflow-x: auto;"><code>${escapeHtml(item.vulnerableExample)}</code></pre>
            </div>
            <div class="form-group" style="flex: 1;">
              <label class="form-label" style="color: var(--accent-emerald);">✅ Secure Remediation</label>
              <pre class="output-block" style="font-family: var(--font-mono); font-size: 0.8rem; color: #86efac; overflow-x: auto;"><code>${escapeHtml(item.remediatedExample)}</code></pre>
            </div>
          </div>

          <div style="background-color: var(--bg-surface-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px;">
            <h4 style="font-size: 0.9rem; color: var(--text-primary); margin-bottom: 10px; font-family: var(--font-mono);">Key Defensive Principles</h4>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem; color: var(--text-secondary);">
              ${item.defensePrinciples.map(p => `<li style="display: flex; gap: 8px;"><span style="color: var(--accent-cyan);">▸</span><span>${escapeHtml(p)}</span></li>`).join('')}
            </ul>
          </div>
        </div>
      `;
    }

    function updateSanitizer(): void {
      const raw = testInput.value;
      sanitizedHtml.textContent = raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
      sanitizedAlpha.textContent = raw.replace(/[^a-zA-Z0-9_\-.]/g, '');
    }

    select.addEventListener('change', () => renderVuln(select.value));
    testInput.addEventListener('input', updateSanitizer);

    renderVuln('sqli');
    updateSanitizer();
  }
};
