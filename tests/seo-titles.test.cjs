"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const base = "https://cecil-hub.ha-rookie.workers.dev/";
const pages = [
  {
    file: "public/index.html",
    title: "CECIL｜Webアプリ・文章・名古屋の記録",
    canonical: base,
    locale: "ja",
  },
  {
    file: "public/en/index.html",
    title: "CECIL | Web Apps, Writing &amp; Local Discoveries",
    canonical: base + "en/",
    locale: "en",
  },
];

for (const page of pages) {
  test(page.file + " has language-specific SEO title and matching OGP title", () => {
    const html = fs.readFileSync(path.join(__dirname, "..", page.file), "utf8");
    assert.ok(html.includes("<title>" + page.title + "</title>"));
    assert.ok(html.includes('<meta property="og:title" content="' + page.title + '">'));
    assert.equal((html.match(/<title>/g) || []).length, 1);
    assert.match(html, /<meta name="description" content="[^"]+">/);
    assert.ok(html.includes('<link rel="canonical" href="' + page.canonical + '">'));
    assert.ok(html.includes('lang="' + page.locale + '"'));
    assert.equal((html.match(/<h1\\b/g) || []).length, 1);
    for (const lang of ["ja", "en", "x-default"]) {
      assert.ok(html.includes('hreflang="' + lang + '"'));
    }
  });
}
