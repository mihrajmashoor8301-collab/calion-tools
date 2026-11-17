// CALION Tools — Main Application Bootstrap
// Phase 5.3 UI & Interactive Tool Components

import '../src/styles/main.css';
import { initApp } from './ui/layout';

const root = document.getElementById('app');
if (root) {
  initApp(root);
} else {
  console.error('CALION Tools: #app container not found in DOM.');
}
