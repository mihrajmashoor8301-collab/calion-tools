import { ToolModule } from '../types';
import { inspectJwt, encodeBase64 } from '../../core';
import { escapeHtml } from '../utils';

export const jwtTool: ToolModule = {
  id: 'jwt',
  title: 'JWT Inspector & Decoder',
  category: 'Analysis & Inspection',
  description: 'Inspect JSON Web Tokens (Header, Payload, Signature) and parse standard claims with client-side timestamp conversion.',
  icon: '🪪',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Token Inspection</div>
          <div class="action-group">
            <button class="btn btn-secondary btn-sm" id="load-sample-btn">Load Sample</button>
            <button class="btn btn-secondary btn-sm" id="clear-btn">Clear</button>
          </div>
        </div>

        <div class="alert alert-warning">
          <div>
            <strong>CRITICAL SECURITY NOTICE</strong>
            <div style="font-size: 0.8125rem; margin-top: 0.25rem;">
              Client-side decoding <strong>does NOT verify cryptographic signatures</strong>. Any user or attacker can craft or manipulate payload claims. Never trust unverified JWT claims for authentication or authorization decisions.
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="jwt-input">JWT Token</label>
          <textarea class="form-textarea" id="jwt-input" style="min-height: 110px;" placeholder="Paste raw token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." spellcheck="false"></textarea>
        </div>

        <div id="jwt-results" style="margin-top: 1rem;">
          <div class="output-block" style="color: var(--text-muted);">(Enter a JWT token above to inspect claims)</div>
        </div>
      </div>
    `;

    const jwtInput = container.querySelector('#jwt-input') as HTMLTextAreaElement;
    const resultsArea = container.querySelector('#jwt-results') as HTMLElement;
    const clearBtn = container.querySelector('#clear-btn') as HTMLButtonElement;
    const sampleBtn = container.querySelector('#load-sample-btn') as HTMLButtonElement;

    function parse(): void {
      const val = jwtInput.value.trim();
      if (!val) {
        resultsArea.innerHTML = `<div class="output-block" style="color: var(--text-muted);">(Enter a JWT token above to inspect claims)</div>`;
        return;
      }

      const res = inspectJwt(val);

      if (!res.validFormat) {
        resultsArea.innerHTML = `
          <div class="alert alert-error">
            <div>
              <strong>Invalid JWT Structure</strong>
              <div style="font-size: 0.8125rem; margin-top: 0.25rem;">${escapeHtml(res.error)}</div>
            </div>
          </div>
        `;
        return;
      }

      const statusBadge =
        res.status === 'active'
          ? `<span class="badge-tag" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border-color: rgba(16, 185, 129, 0.3);">ACTIVE</span>`
          : res.status === 'expired'
          ? `<span class="badge-tag" style="background: rgba(244, 63, 94, 0.15); color: #f43f5e; border-color: rgba(244, 63, 94, 0.3);">EXPIRED</span>`
          : `<span class="badge-tag" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; border-color: rgba(245, 158, 11, 0.3);">NOT YET VALID</span>`;

      resultsArea.innerHTML = `
        <div class="metrics-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 1.25rem;">
          <div class="metric-card">
            <div class="metric-label">Algorithm (alg)</div>
            <div class="metric-value">${escapeHtml(res.algorithm ?? 'none')}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Token Type (typ)</div>
            <div class="metric-value">${escapeHtml(res.tokenType ?? 'JWT')}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Status</div>
            <div class="metric-value" style="font-size: 1.1rem;">${statusBadge}</div>
          </div>
        </div>

        <!-- Claims Summary Table if dates exist -->
        ${
          res.claims.expiresAt || res.claims.issuedAt || res.claims.notBefore || res.claims.issuer || res.claims.subject
            ? `
          <div class="table-container" style="margin-bottom: 1.25rem;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Claim</th>
                  <th>Value</th>
                  <th>Formatted Date / Details</th>
                </tr>
              </thead>
              <tbody>
                ${res.claims.issuer ? `<tr><td><strong class="mono">iss</strong> (Issuer)</td><td class="mono">${escapeHtml(res.claims.issuer)}</td><td>—</td></tr>` : ''}
                ${res.claims.subject ? `<tr><td><strong class="mono">sub</strong> (Subject)</td><td class="mono">${escapeHtml(res.claims.subject)}</td><td>—</td></tr>` : ''}
                ${res.claims.jwtId ? `<tr><td><strong class="mono">jti</strong> (JWT ID)</td><td class="mono">${escapeHtml(res.claims.jwtId)}</td><td>—</td></tr>` : ''}
                ${
                  res.claims.issuedAt
                    ? `<tr><td><strong class="mono">iat</strong> (Issued At)</td><td class="mono">${escapeHtml(res.claims.issuedAt.raw)}</td><td>${escapeHtml(res.claims.issuedAt.iso)} (${escapeHtml(res.claims.issuedAt.relative)})</td></tr>`
                    : ''
                }
                ${
                  res.claims.notBefore
                    ? `<tr><td><strong class="mono">nbf</strong> (Not Before)</td><td class="mono">${escapeHtml(res.claims.notBefore.raw)}</td><td>${escapeHtml(res.claims.notBefore.iso)} (${escapeHtml(res.claims.notBefore.relative)})</td></tr>`
                    : ''
                }
                ${
                  res.claims.expiresAt
                    ? `<tr><td><strong class="mono">exp</strong> (Expires At)</td><td class="mono">${escapeHtml(res.claims.expiresAt.raw)}</td><td style="color: ${res.status === 'expired' ? 'var(--accent-rose)' : 'var(--accent-emerald)'}; font-weight: 500;">${escapeHtml(res.claims.expiresAt.iso)} (${escapeHtml(res.claims.expiresAt.relative)})</td></tr>`
                    : ''
                }
              </tbody>
            </table>
          </div>
        `
            : ''
        }

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div class="card" style="padding: 1rem; margin-bottom: 0;">
            <div class="card-title" style="font-size: 0.875rem; margin-bottom: 0.5rem; color: var(--accent-cyan);">Header</div>
            <pre class="output-block" style="max-height: 200px;">${escapeHtml(JSON.stringify(res.header, null, 2))}</pre>
          </div>
          <div class="card" style="padding: 1rem; margin-bottom: 0;">
            <div class="card-title" style="font-size: 0.875rem; margin-bottom: 0.5rem; color: var(--accent-emerald);">Payload Claims</div>
            <pre class="output-block" style="max-height: 200px;">${escapeHtml(JSON.stringify(res.payload, null, 2))}</pre>
          </div>
        </div>

        <div class="card" style="padding: 1rem; margin-bottom: 0;">
          <div class="card-title" style="font-size: 0.875rem; margin-bottom: 0.5rem; color: var(--text-muted);">Signature (Base64URL)</div>
          <div class="output-block" style="word-break: break-all; color: var(--text-secondary);">${escapeHtml(res.signature || '(Unsigned token)')}</div>
        </div>
      `;
    }

    jwtInput.addEventListener('input', parse);

    clearBtn.addEventListener('click', () => {
      jwtInput.value = '';
      parse();
      jwtInput.focus();
    });

    sampleBtn.addEventListener('click', () => {
      const now = Math.floor(Date.now() / 1000);
      const header = { alg: 'HS256', typ: 'JWT' };
      const payload = {
        iss: 'endlessus.in',
        sub: 'usr_calion_security_analyst',
        aud: 'https://tools.endlessus.in',
        roles: ['security_auditor', 'operator'],
        iat: now - 3600,
        exp: now + 7200
      };
      const hB64 = encodeBase64(JSON.stringify(header), { urlSafe: true });
      const pB64 = encodeBase64(JSON.stringify(payload), { urlSafe: true });
      jwtInput.value = `${hB64}.${pB64}.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`;
      parse();
    });
  }
};
