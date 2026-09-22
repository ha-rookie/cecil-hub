const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

const jaHome = read('public/index.html');
const enHome = read('public/en/index.html');
const jaPrivacy = read('public/privacy.html');
const enPrivacy = read('public/en/privacy.html');
const sitemap = read('public/sitemap.xml');

function outboundDestinations(html) {
  return [...html.matchAll(/data-analytics-destination="([^"]+)"/g)]
    .map((m) => m[1])
    .sort();
}

test('Japanese and English homes declare the correct page language', () => {
  assert.match(jaHome, /<html lang="ja">/);
  assert.match(enHome, /<html lang="en">/);
});

test('home pages use self canonical and reciprocal hreflang', () => {
  assert.match(jaHome, /rel="canonical" href="https:\/\/cecil-hub\.ha-rookie\.workers\.dev\/"/);
  assert.match(enHome, /rel="canonical" href="https:\/\/cecil-hub\.ha-rookie\.workers\.dev\/en\/"/);

  for (const html of [jaHome, enHome]) {
    assert.match(html, /hreflang="ja" href="https:\/\/cecil-hub\.ha-rookie\.workers\.dev\/"/);
    assert.match(html, /hreflang="en" href="https:\/\/cecil-hub\.ha-rookie\.workers\.dev\/en\/"/);
    assert.match(html, /hreflang="x-default" href="https:\/\/cecil-hub\.ha-rookie\.workers\.dev\/"/);
  }
});

test('language switch maps corresponding home pages', () => {
  assert.match(jaHome, /class="language-current" aria-current="page">JA<\/span>/);
  assert.match(jaHome, /href="\/en\/" lang="en" hreflang="en">EN<\/a>/);
  assert.match(enHome, /href="\/" lang="ja" hreflang="ja">JA<\/a>/);
  assert.match(enHome, /class="language-current" aria-current="page">EN<\/span>/);
});

test('privacy pages use canonical extensionless URLs and reciprocal switches', () => {
  assert.match(jaPrivacy, /rel="canonical" href="https:\/\/cecil-hub\.ha-rookie\.workers\.dev\/privacy"/);
  assert.match(enPrivacy, /rel="canonical" href="https:\/\/cecil-hub\.ha-rookie\.workers\.dev\/en\/privacy"/);
  assert.doesNotMatch(jaPrivacy, /canonical" href="[^"]*privacy\.html/);
  assert.doesNotMatch(enPrivacy, /canonical" href="[^"]*privacy\.html/);
  assert.match(jaPrivacy, /href="\/en\/privacy" lang="en" hreflang="en">EN<\/a>/);
  assert.match(enPrivacy, /href="\/privacy" lang="ja" hreflang="ja">JA<\/a>/);
});

test('English nested pages use root-absolute shared assets', () => {
  assert.match(enHome, /href="\/styles\.css"/);
  assert.match(enHome, /src="\/script\.js"/);
  assert.match(enHome, /src="\/analytics\.js"/);
  assert.match(enPrivacy, /href="\/styles\.css"/);
  assert.match(enPrivacy, /src="\/script\.js"/);
  assert.doesNotMatch(enHome, /(?:src|href)="\.\/(?:images|styles|script|analytics)/);
});

test('English home keeps the same analytics destinations as Japanese home', () => {
  assert.deepEqual(outboundDestinations(enHome), outboundDestinations(jaHome));
});

test('sitemap contains only indexable Japanese and English home URLs', () => {
  assert.match(sitemap, /<loc>https:\/\/cecil-hub\.ha-rookie\.workers\.dev\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/cecil-hub\.ha-rookie\.workers\.dev\/en\/<\/loc>/);
  assert.doesNotMatch(sitemap, /privacy/);
  assert.doesNotMatch(sitemap, /pr-\d+/);
});


test('English headings do not carry Japanese forced line breaks', () => {
  assert.doesNotMatch(enHome, /Work isn’t<br>/);
  assert.doesNotMatch(enPrivacy, /Analytics &amp;<br/);
});


test('Japanese and English homes group language and theme controls for readable key-visual utilities', () => {
  assert.match(jaHome, /class="header-utilities"/);
  assert.match(enHome, /class="header-utilities"/);
});
