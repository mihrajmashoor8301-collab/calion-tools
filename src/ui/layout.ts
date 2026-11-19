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
import { payloadsTool } from './tools/payloads-tool';

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
  nmapTool,
  payloadsTool
];

export function initApp(root: HTMLElement): void {
  root.innerHTML = `
    <!-- CALION Academy Ecosystem Header -->
    <header class="app-header">
      <div class="brand-section">
        <button class="mobile-nav-toggle" id="mobile-toggle" aria-label="Toggle Tools Navigation" aria-expanded="false">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <a class="brand-home" href="https://learning.endlessus.in/learning" aria-label="CALION Academy">
          <svg viewBox="0 0 400 100" role="img" aria-label="CALION">
            <defs><linearGradient id="calion-tools-gradient" x1="0%" x2="100%" y1="0%" y2="100%"><stop offset="0%" stop-color="#00F0FF"></stop><stop offset="50%" stop-color="#0284C7"></stop><stop offset="100%" stop-color="#6366F1"></stop></linearGradient></defs>
            <g transform="translate(10, 10)">
              <path d="M 55 10 L 25 10 L 10 25 L 10 55 L 25 70 L 55 70" stroke="url(#calion-tools-gradient)" stroke-linecap="round" stroke-linejoin="round" stroke-width="6" fill="none"></path>
              <path d="M 42 70 L 42 22 L 58 22 L 68 70" stroke="var(--text-primary)" stroke-linecap="round" stroke-linejoin="round" stroke-width="5" fill="none"></path>
              <path d="M 33 46 L 56 46" stroke="url(#calion-tools-gradient)" stroke-linecap="round" stroke-width="4.5" fill="none"></path>
              <circle cx="55" cy="10" fill="#00F0FF" r="3.5"></circle><circle cx="25" cy="70" fill="#6366F1" r="3"></circle><circle cx="42" cy="22" fill="var(--text-primary)" r="2.5"></circle>
            </g>
            <text class="brand-logo-word" x="100" y="58">CALION</text>
            <rect fill="#00F0FF" height="6" rx="1.5" width="6" x="362" y="38"></rect><rect fill="#6366F1" height="6" rx="1.5" width="6" x="362" y="48"></rect>
          </svg>
        </a>
        <span class="brand-tag">Tools</span>
      </div>

      <nav class="ecosystem-links" aria-label="CALION Platforms">
        <a href="https://learning.endlessus.in/learning">Academy</a>
        <a href="https://learning.endlessus.in/terminal-lab.html" class="terminal-link">Terminal</a>
      </nav>

      <div class="header-actions">
        <div class="badge-privacy">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 4 10 8 10z"></path></svg>
          Runs locally
        </div>
        <button class="theme-toggle" id="theme-toggle" type="button" aria-label="Toggle color theme" title="Toggle color theme">
          <svg class="theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"></path></svg>
          <svg class="theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20.5 14.2A8.7 8.7 0 0 1 9.8 3.5 8.8 8.8 0 1 0 20.5 14.2Z"></path></svg>
        </button>
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
    <footer class="app-footer">
      <span>CALION Tools · Private, browser-based utilities</span>
      <nav class="app-footer-links" aria-label="CALION Platforms">
        <a href="https://learning.endlessus.in/learning">Academy</a>
        <a href="https://learning.endlessus.in/terminal-lab.html">Terminal</a>
        <a href="https://payloads.endlessus.in">Payload Hub</a>
      </nav>
    </footer>
  `;

  const sidebarNav = root.querySelector('#sidebar-nav') as HTMLElement;
  const toolSearch = root.querySelector('#tool-search') as HTMLInputElement;
  const workspaceHeader = root.querySelector('#workspace-header') as HTMLElement;
  const workspaceContent = root.querySelector('#workspace-content') as HTMLElement;
  const mobileToggle = root.querySelector('#mobile-toggle') as HTMLButtonElement;
  const sidebar = root.querySelector('#app-sidebar') as HTMLElement;
  const backdrop = root.querySelector('#sidebar-backdrop') as HTMLElement;
  const themeToggle = root.querySelector('#theme-toggle') as HTMLButtonElement;

  function applyTheme(theme: 'light' | 'dark', persist: boolean): void {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    themeToggle.setAttribute('title', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    themeToggle.setAttribute('aria-pressed', String(isDark));
    if (persist) {
      localStorage.setItem('calion_theme', theme);
      localStorage.setItem('endlessus_learning_theme', isDark ? 'hacker' : 'normal');
    }
  }

  const storedTheme = localStorage.getItem('calion_theme') || localStorage.getItem('endlessus_learning_theme');
  const initialTheme = storedTheme === 'dark' || storedTheme === 'hacker'
    ? 'dark'
    : storedTheme === 'light' || storedTheme === 'normal' || storedTheme === 'soft'
      ? 'light'
      : (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(initialTheme, false);
  themeToggle.addEventListener('click', () => applyTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark', true));
  window.addEventListener('storage', (event) => {
    if (event.key === 'calion_theme' || event.key === 'endlessus_learning_theme') {
      applyTheme(event.newValue === 'dark' || event.newValue === 'hacker' ? 'dark' : 'light', false);
    }
  });

  let currentToolId = window.location.hash.replace('#', '') || 'encoders';

  function closeMobileNav(): void {
    sidebar.classList.remove('open');
    backdrop.classList.remove('open');
    mobileToggle.setAttribute('aria-expanded', 'false');
  }

  mobileToggle.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('open');
    backdrop.classList.toggle('open');
    mobileToggle.setAttribute('aria-expanded', String(isOpen));
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
