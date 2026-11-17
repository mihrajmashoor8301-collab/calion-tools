import { ToolModule } from './types';
import { encoderTool } from './tools/encoder-tool';
import { jsonTool } from './tools/json-tool';
import { textTool } from './tools/text-tool';
import { cryptoTool } from './tools/crypto-tool';
import { hashIdTool } from './tools/hash-id-tool';
import { entropyTool } from './tools/entropy-tool';
import { hexDumpTool } from './tools/hex-dump-tool';
import { subnetTool } from './tools/subnet-tool';
import { jwtTool } from './tools/jwt-tool';
import { timestampTool } from './tools/timestamp-tool';
import { regexTool } from './tools/regex-tool';
import { portsTool } from './tools/ports-tool';
import { nmapTool } from './tools/nmap-tool';

export const ALL_TOOLS: ToolModule[] = [
  encoderTool,
  jsonTool,
  textTool,
  cryptoTool,
  hashIdTool,
  entropyTool,
  hexDumpTool,
  subnetTool,
  jwtTool,
  timestampTool,
  regexTool,
  portsTool,
  nmapTool
];

export function initApp(root: HTMLElement): void {
  root.innerHTML = `
    <!-- Top Header -->
    <header class="app-header">
      <div class="brand-section">
        <button class="mobile-nav-toggle" id="mobile-toggle" aria-label="Toggle Navigation">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <div class="brand-logo">
          <svg viewBox="0 0 32 32" width="24" height="24">
            <rect width="32" height="32" rx="6" fill="#131b2e" stroke="#1e293b" stroke-width="1.5"/>
            <path d="M8 11 L13 16 L8 21" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <line x1="16" y1="21" x2="24" y2="21" stroke="#10b981" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="brand-title">CALION <span>Tools</span></div>
        <span class="badge-tag">v1.0</span>
      </div>

      <div class="header-actions">
        <div class="badge-privacy">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Zero Server Tracking
        </div>
      </div>
    </header>

    <div class="app-container">
      <!-- Backdrop for mobile drawer -->
      <div class="sidebar-backdrop" id="sidebar-backdrop"></div>

      <!-- Sidebar -->
      <aside class="app-sidebar" id="app-sidebar">
        <div class="sidebar-search">
          <div class="search-input-wrapper">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" class="search-input" id="tool-search" placeholder="Quick find tool... (13 total)" spellcheck="false" />
          </div>
        </div>

        <nav class="sidebar-nav" id="sidebar-nav" aria-label="Tools Navigation">
          <!-- Populated by renderSidebar -->
        </nav>
      </aside>

      <!-- Main Workspace -->
      <main class="app-workspace" id="app-workspace" role="main">
        <div id="workspace-header" class="tool-header"></div>
        <div id="workspace-content"></div>
      </main>
    </div>
  `;

  const sidebarNav = root.querySelector('#sidebar-nav') as HTMLElement;
  const toolSearch = root.querySelector('#tool-search') as HTMLInputElement;
  const workspaceHeader = root.querySelector('#workspace-header') as HTMLElement;
  const workspaceContent = root.querySelector('#workspace-content') as HTMLElement;
  const mobileToggle = root.querySelector('#mobile-toggle') as HTMLButtonElement;
  const sidebar = root.querySelector('#app-sidebar') as HTMLElement;
  const backdrop = root.querySelector('#sidebar-backdrop') as HTMLElement;

  let currentToolId = window.location.hash.replace('#', '') || 'encoders';

  function closeMobileNav(): void {
    sidebar.classList.remove('open');
    backdrop.classList.remove('open');
  }

  mobileToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    backdrop.classList.toggle('open');
  });

  backdrop.addEventListener('click', closeMobileNav);

  function renderSidebar(searchQuery = ''): void {
    const q = searchQuery.toLowerCase().trim();
    const categories: Record<string, ToolModule[]> = {};

    for (const tool of ALL_TOOLS) {
      if (
        !q ||
        tool.title.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.id.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q)
      ) {
        if (!categories[tool.category]) {
          categories[tool.category] = [];
        }
        categories[tool.category]!.push(tool);
      }
    }

    if (Object.keys(categories).length === 0) {
      sidebarNav.innerHTML = `<div style="padding: 1rem; color: var(--text-muted); font-size: 0.8125rem; text-align: center;">No matching tools found.</div>`;
      return;
    }

    let navHtml = '';
    for (const [cat, tools] of Object.entries(categories)) {
      navHtml += `
        <div class="nav-category">
          <div class="nav-category-title">${cat}</div>
          ${tools
            .map(
              (t) => `
            <button class="nav-item ${t.id === currentToolId ? 'active' : ''}" data-tool-id="${t.id}">
              <span class="nav-item-icon">${t.icon}</span>
              <span style="flex: 1; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${t.title}</span>
            </button>
          `
            )
            .join('')}
        </div>
      `;
    }

    sidebarNav.innerHTML = navHtml;

    // Attach click handlers
    sidebarNav.querySelectorAll('.nav-item').forEach((item) => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-tool-id');
        if (id) {
          switchTool(id);
          closeMobileNav();
        }
      });
    });
  }

  function switchTool(toolId: string): void {
    const tool = ALL_TOOLS.find((t) => t.id === toolId) ?? ALL_TOOLS[0]!;
    currentToolId = tool.id;
    window.location.hash = tool.id;

    // Update active class in sidebar
    sidebarNav.querySelectorAll('.nav-item').forEach((btn) => {
      if (btn.getAttribute('data-tool-id') === tool.id) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Render workspace header
    workspaceHeader.innerHTML = `
      <div class="tool-header-meta">
        <span class="badge-tag">${tool.category}</span>
        <span style="color: var(--text-muted); font-size: 0.75rem;">•</span>
        <span style="color: var(--accent-emerald); font-size: 0.75rem; font-family: var(--font-mono);">In-Memory Pure Execution</span>
      </div>
      <h1 class="tool-title">${tool.title}</h1>
      <p class="tool-description">${tool.description}</p>
    `;

    // Clear and render tool panel
    workspaceContent.innerHTML = '';
    tool.render(workspaceContent);

    // Scroll main window to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toolSearch.addEventListener('input', () => {
    renderSidebar(toolSearch.value);
  });

  // Handle browser back/forward buttons
  window.addEventListener('hashchange', () => {
    const hashId = window.location.hash.replace('#', '');
    if (hashId && hashId !== currentToolId) {
      switchTool(hashId);
    }
  });

  // Initial load
  renderSidebar();
  switchTool(currentToolId);
}
