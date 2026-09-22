(() => {
  const btn = document.getElementById('themeToggle');
  const label = btn?.querySelector('.theme-label');
  const icon = btn?.querySelector('.theme-icon');
  const themeColor = document.getElementById('themeColor');
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const modes = ['auto', 'dark', 'light'];
  const labels = { auto: 'AUTO', dark: 'DARK', light: 'LIGHT' };
  const icons = { auto: '◐', dark: '●', light: '○' };
  let current = localStorage.getItem('theme-mode') || 'auto';

  if (!modes.includes(current)) current = 'auto';

  function resolvedTheme(mode) {
    return mode === 'auto' ? (media.matches ? 'dark' : 'light') : mode;
  }

  function syncThemeColor(mode) {
    if (!themeColor) return;
    themeColor.setAttribute('content', resolvedTheme(mode) === 'dark' ? '#0F1821' : '#F2EFE8');
  }

  function syncToggle(mode) {
    if (!btn) return;
    if (label) label.textContent = labels[mode];
    if (icon) icon.textContent = icons[mode];
    btn.setAttribute('aria-label', `表示テーマ: ${labels[mode]}。切り替える`);
    btn.setAttribute('title', `Theme: ${labels[mode]}`);
  }

  function apply(mode, persist = true) {
    document.documentElement.removeAttribute('data-theme');
    if (mode !== 'auto') document.documentElement.setAttribute('data-theme', mode);

    current = mode;
    syncToggle(mode);
    syncThemeColor(mode);
    if (persist) localStorage.setItem('theme-mode', mode);
  }

  if (btn) {
    btn.addEventListener('click', () => {
      const next = modes[(modes.indexOf(current) + 1) % modes.length];
      apply(next);
    });
  }

  media.addEventListener('change', () => {
    if (current === 'auto') syncThemeColor('auto');
  });

  apply(current, false);
})();
