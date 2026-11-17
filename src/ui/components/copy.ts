/**
 * CALION Tools — Copy Button & Feedback Helper
 */

export function attachCopyHandler(
  btn: HTMLButtonElement,
  getText: () => string
): void {
  btn.addEventListener('click', async () => {
    const text = getText();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      const originalText = btn.innerHTML;
      btn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>Copied!</span>
      `;
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }, 1800);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        btn.textContent = 'Copied!';
        setTimeout(() => {
          btn.textContent = 'Copy';
        }, 1800);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  });
}
