(() => {
  const btn = document.getElementById('themeToggle');
  const pageLang = document.documentElement.lang || 'ja';
  const isEnglish = pageLang.toLowerCase().startsWith('en');
  const label = btn?.querySelector('.theme-label');
  const icon = btn?.querySelector('.theme-icon');
  const themeColor = document.getElementById('themeColor');
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const modes = ['auto', 'dark', 'light'];
  const labels = { auto: 'AUTO', dark: 'DARK', light: 'LIGHT' };
  const icons = { auto: '◐', dark: '●', light: '○' };
  let current = localStorage.getItem('theme-mode') || 'auto';

  if (!modes.includes(current)) current = 'auto';

  function syncMazumePortalCopy() {
    const featured = document.querySelector('[data-analytics-link-id="featured-asamazume"]');
    if (featured) {
      const image = featured.querySelector('.feature-media img');
      const meta = featured.querySelector('.feature-meta span');
      const description = featured.querySelector(':scope > p');

      if (image) {
        image.alt = isEnglish
          ? 'Morning and evening mazume tide navigation app'
          : '朝・夕マズメに対応した朝マズメ潮ナビ';
      }
      if (meta) {
        meta.textContent = isEnglish ? 'APP / MORNING + EVENING' : 'APP / 朝・夕対応';
      }
      if (description) {
        description.textContent = isEnglish
          ? 'A Japanese-language web app for comparing morning and evening mazume windows with tide movement, and scanning 30 or 60 days ahead for weekend and holiday candidates with larger tide-level changes.'
          : '週末の朝・夕、釣りに行く前に、マズメ時間帯と潮の動きをひと目で確認。30日・60日先の週末・祝日から、潮位変化が大きい候補を探せるWebアプリです。';
      }
    }

    const appRow = document.querySelector('[data-analytics-link-id="apps-asamazume"]');
    if (appRow) {
      const attribute = appRow.querySelector('.app-attribute');
      const description = appRow.querySelector(':scope > p');

      if (attribute) attribute.textContent = 'FISHING / TIDE / MAZUME';
      if (description) {
        description.textContent = isEnglish
          ? 'Switch between morning and evening mazume to check tide-level changes around sunrise and sunset, with 30- or 60-day weekend and holiday candidate searches. The interface is in Japanese.'
          : '朝マズメ・夕マズメを切り替え、日の出・日の入り前後の潮位変化を確認。30日・60日先の週末・祝日から候補を探せるWebアプリ。';
      }
    }
  }

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
    btn.setAttribute(
      'aria-label',
      isEnglish ? `Display theme: ${labels[mode]}. Change theme` : `表示テーマ: ${labels[mode]}。切り替える`
    );
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

  syncMazumePortalCopy();
  apply(current, false);
})();