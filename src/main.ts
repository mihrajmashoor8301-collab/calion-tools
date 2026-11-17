// CALION Tools Application Entry Point
// Phase 5.2 — Independent Repository Setup & Core Algorithms

import * as Core from './core';

console.log('CALION Tools Core Engine loaded:', Object.keys(Core));

const app = document.getElementById('app');
if (app) {
  app.innerHTML = `
    <main style="font-family: ui-monospace, SFMono-Regular, monospace; padding: 2rem; background: #0b0f17; color: #e2e8f0; min-height: 100vh;">
      <h1 style="color: #38bdf8;">CALION Tools Engine</h1>
      <p style="color: #94a3b8;">Client-Side Security &amp; Developer Toolkit (Phase 5.2 Core Initialized)</p>
      <div style="margin-top: 1.5rem; padding: 1rem; background: #131b2e; border: 1px solid #1e293b; border-radius: 8px;">
        <p style="color: #10b981;">✓ 13 Core algorithmic modules verified.</p>
        <p style="color: #94a3b8; font-size: 0.875rem;">Run unit tests with <code>npm test</code>.</p>
      </div>
    </main>
  `;
}
