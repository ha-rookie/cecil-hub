(() => {
  const btn = document.getElementById('themeToggle');
  const label = btn.querySelector('.theme-label');
  const modes = ['auto', 'dark', 'light'];
  let current = localStorage.getItem('theme-mode') || 'auto';

  function apply(mode) {
    document.documentElement.removeAttribute('data-theme');
    if (mode !== 'auto') document.documentElement.setAttribute('data-theme', mode);
    label.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
    current = mode;
    localStorage.setItem('theme-mode', mode);
  }

  btn.addEventListener('click', () => {
    const next = modes[(modes.indexOf(current) + 1) % modes.length];
    apply(next);
  });

  apply(current);
})();
