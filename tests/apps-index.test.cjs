const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "public", "index.html"), "utf8");
const worker = fs.readFileSync(path.join(root, "src", "index.js"), "utf8");

test("CECIL has an Apps index with every current app", () => {
  assert.match(html, /id="apps"/);

  for (const name of [
    "朝マズメ潮ナビ",
    "あと一杯ナビ",
    "よう拝",
    "くるくるソムリエ",
    "想いの方角",
  ]) {
    assert.ok(html.includes(name), `missing app: ${name}`);
  }
});

test("all public apps link directly to their production URL", () => {
  for (const url of [
    "https://weekend-morning-high-tide.pages.dev/",
    "https://ato-ippai.pages.dev/",
    "https://yohai-compass.pages.dev/",
    "https://kurukuru-sommelier-game.pages.dev/",
  ]) {
    assert.ok(html.includes(`href="${url}"`), `missing production link: ${url}`);
  }
});

test("developing app is visible without pretending a production URL exists", () => {
  const start = html.indexOf('id="apps"');
  const end = html.indexOf('id="ways"', start);
  const apps = html.slice(start, end);
  assert.ok(apps.includes("想いの方角"));
  assert.ok(apps.includes("開発中"));
  assert.ok(!apps.includes('href="https://omoi-no-hougaku.pages.dev/'));
});

test("analytics backend accepts the future omoi destination", () => {
  assert.ok(worker.includes('"omoi_no_hougaku"'));
});


test("CECIL exposes a text attribute for each app", () => {
  for (const attribute of [
    "FISHING / TIDE",
    "NIGHT / TRANSIT",
    "DIRECTION / SHRINE",
    "WINE / SENSOR",
    "MEMORY / PLACE",
  ]) {
    assert.ok(html.includes(attribute), `missing app attribute: ${attribute}`);
  }

  assert.ok(html.includes('class="app-attribute"'));
});
