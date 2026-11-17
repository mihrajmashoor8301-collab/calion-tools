import { ToolModule } from '../types';
import { searchPorts, COMMON_PORTS } from '../../core';
import { escapeHtml } from '../utils';

export const portsTool: ToolModule = {
  id: 'ports',
  title: 'Network Ports Reference',
  category: 'Networking & Infrastructure',
  description: 'Search standard cybersecurity ports, service protocols, attack surface exposures, and operational security notes.',
  icon: '🔌',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Port Database</div>
          <div class="action-group">
            <span class="badge-tag">${COMMON_PORTS.length} Curated Ports</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group" style="flex: 2;">
            <label class="form-label" for="port-search">Search by Port, Service, or Keyword</label>
            <input type="text" class="form-control" id="port-search" placeholder="e.g. 22, ssh, smb, kerberos, database, rdp..." spellcheck="false" />
          </div>

          <div class="form-group" style="flex: 1;">
            <label class="form-label" for="category-filter">Category Filter</label>
            <select class="form-select" id="category-filter">
              <option value="all">All Categories</option>
              <option value="Web">Web (80, 443, 8080...)</option>
              <option value="Remote Access">Remote Access (22, 23, 3389, 5900...)</option>
              <option value="Database">Database (1433, 1521, 3306, 5432, 6379...)</option>
              <option value="File Transfer">File Transfer (20, 21, 69, 139, 445, 2049)</option>
              <option value="Mail">Mail (25, 110, 143, 465, 587, 993, 995)</option>
              <option value="Directory / Authentication">Directory / Auth (88, 389, 636)</option>
              <option value="Network Infrastructure">Network Infra (53, 67, 123, 161, 514)</option>
            </select>
          </div>
        </div>

        <div id="ports-table-area" style="margin-top: 1rem;"></div>
      </div>
    `;

    const searchInput = container.querySelector('#port-search') as HTMLInputElement;
    const categoryFilter = container.querySelector('#category-filter') as HTMLSelectElement;
    const tableArea = container.querySelector('#ports-table-area') as HTMLElement;

    function renderList(): void {
      const q = searchInput.value.trim();
      const cat = categoryFilter.value;

      let results = searchPorts(q);
      if (cat !== 'all') {
        results = results.filter((p) => p.category === cat);
      }

      if (results.length === 0) {
        tableArea.innerHTML = `<div class="output-block" style="text-align: center; color: var(--text-muted);">No ports found matching "${escapeHtml(q)}" in this category.</div>`;
        return;
      }

      tableArea.innerHTML = `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 80px;">Port</th>
                <th style="width: 70px;">Proto</th>
                <th style="width: 140px;">Service</th>
                <th style="width: 130px;">Category</th>
                <th>Description</th>
                <th>Security Context</th>
              </tr>
            </thead>
            <tbody>
              ${results
                .map(
                  (p) => `
                <tr>
                  <td><strong class="mono" style="color: var(--accent-cyan); font-size: 0.9375rem;">${p.port}</strong></td>
                  <td><span class="badge-tag">${p.protocol}</span></td>
                  <td><strong style="color: var(--text-primary); font-family: var(--font-mono); font-size: 0.8125rem;">${p.service}</strong></td>
                  <td><span style="font-size: 0.75rem; color: var(--text-secondary);">${p.category}</span></td>
                  <td style="font-size: 0.8125rem; color: var(--text-secondary);">${p.description}</td>
                  <td style="font-size: 0.8125rem; color: #fbcfe8;">${p.securityNotes}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    searchInput.addEventListener('input', renderList);
    categoryFilter.addEventListener('change', renderList);

    // Initial render
    renderList();
  }
};
