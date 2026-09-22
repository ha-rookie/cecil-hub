const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const script = fs.readFileSync(path.join(__dirname, '..', 'public', 'script.js'), 'utf8');

function runThemeScript({ savedMode, prefersDark }) {
  const attributes = new Map();
  const themeColorAttributes = new Map();

  const context = {
    document: {
      documentElement: {
        setAttribute(name, value) { attributes.set(name, value); },
        removeAttribute(name) { attributes.delete(name); },
      },
      getElementById(id) {
        if (id === 'themeToggle') return null;
        if (id === 'themeColor') {
          return {
            setAttribute(name, value) { themeColorAttributes.set(name, value); },
          };
        }
        return null;
      },
    },
    window: {
      matchMedia() {
        return {
          matches: prefersDark,
          addEventListener() {},
        };
      },
    },
    localStorage: {
      getItem(key) {
        return key === 'theme-mode' ? savedMode : null;
      },
      setItem() {},
    },
  };

  vm.runInNewContext(script, context);

  return {
    theme: attributes.get('data-theme') ?? null,
    themeColor: themeColorAttributes.get('content') ?? null,
  };
}

test('saved LIGHT theme is applied even when the page has no theme toggle', () => {
  const result = runThemeScript({ savedMode: 'light', prefersDark: true });
  assert.equal(result.theme, 'light');
  assert.equal(result.themeColor, '#F2EFE8');
});

test('saved DARK theme is applied even when the page has no theme toggle', () => {
  const result = runThemeScript({ savedMode: 'dark', prefersDark: false });
  assert.equal(result.theme, 'dark');
  assert.equal(result.themeColor, '#0F1821');
});

test('AUTO leaves data-theme unset and follows the device for theme-color', () => {
  const result = runThemeScript({ savedMode: 'auto', prefersDark: true });
  assert.equal(result.theme, null);
  assert.equal(result.themeColor, '#0F1821');
});
