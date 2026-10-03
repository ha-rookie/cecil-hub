const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'public', 'script.js'), 'utf8');

test('CECIL portal syncs 朝マズメ潮ナビ copy with morning and evening support', () => {
  assert.match(script, /featured-asamazume/);
  assert.match(script, /apps-asamazume/);
  assert.match(script, /APP \/ 朝・夕対応/);
  assert.match(script, /30日・60日先の週末・祝日/);
  assert.match(script, /朝マズメ・夕マズメを切り替え/);
  assert.match(script, /日の出・日の入り前後の潮位変化/);
});

test('English portal copy also describes morning and evening mazume', () => {
  assert.match(script, /APP \/ MORNING \+ EVENING/);
  assert.match(script, /morning and evening mazume/);
  assert.match(script, /30 or 60 days ahead/);
  assert.match(script, /around sunrise and sunset/);
});
