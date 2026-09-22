const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "public", "index.html"), "utf8");

function section(id, nextId) {
  const start = html.indexOf(`id="${id}"`);
  assert.notEqual(start, -1, `missing section: ${id}`);
  const end = nextId ? html.indexOf(`id="${nextId}"`, start) : html.length;
  return html.slice(start, end === -1 ? html.length : end);
}

test("content-led structure replaces Ways of Exploring", () => {
  assert.ok(!html.includes('href="#ways"'));
  assert.ok(!html.includes('id="ways"'));
  assert.match(html, /href="#apps"/);
  assert.match(html, /href="#writing"/);
  assert.match(html, /href="#local"/);
});

test("Writing shows three representative note articles", () => {
  const writing = section("writing", "local");
  const urls = [
    "https://note.com/cecil_gourmet/n/nef8880acf529",
    "https://note.com/cecil_gourmet/n/n949bbc31f83b",
    "https://note.com/cecil_gourmet/n/nfbbde3a17f44",
  ];
  for (const url of urls) assert.ok(writing.includes(url), `missing writing URL: ${url}`);
  assert.ok(writing.includes("noteですべて見る"));
  assert.equal((writing.match(/class="content-row"/g) || []).length, 3);
});

test("Local shows three representative Instagram posts", () => {
  const local = section("local", "about");
  const urls = [
    "https://www.instagram.com/p/DDlzzEbzCBw/?img_index=2&stkn=YTJ3enVjb2tzMmJ5",
    "https://www.instagram.com/p/CP6ZgmTHejV/",
    "https://www.instagram.com/p/CQbFSPBniFD/",
  ];
  for (const url of urls) assert.ok(local.includes(url), `missing local URL: ${url}`);
  assert.ok(local.includes("Instagramでもっと見る"));
  assert.equal((local.match(/class="content-row"/g) || []).length, 3);
});

test("hero and brand statements use the current copy", () => {
  assert.ok(html.includes("EXPLORE / INQUIRE"));
  assert.ok(html.includes("気になったことを、"));
  assert.ok(html.includes("形にする。"));
  assert.ok(!html.includes("<span>探索する。</span><span>探求する。</span><span>形にする。</span>"));
});


test("Writing uses concise display titles without changing destination URLs", () => {
  for (const title of [
    "違和感が残る文章を読みたい",
    "AI時代、若手SEはどこで学ぶのか",
    "仕事のキャパは、根性ではなく設計する",
  ]) {
    assert.ok(html.includes(title), `missing concise display title: ${title}`);
  }
  assert.ok(!html.includes("うまい文章より、違和感が残る文章を読みたい"));
  assert.ok(!html.includes("AIがコードを書く時代、若手SEはどこでプログラミングを覚えるのか"));
  assert.ok(!html.includes("仕事のキャパは、根性ではなく設計するものなのかもしれない"));
});


test("Featured uses APP as the item type label while APPS remains the section name", () => {
  assert.ok(html.includes("<span>APP</span>"));
  assert.ok(!html.includes("<span>WEB APP</span>"));
  assert.ok(html.includes("<p class=\"eyebrow\">APPS</p>"));
});

test("index actions use consistent open wording", () => {
  assert.ok(html.includes("アプリを開く"));
  assert.ok(html.includes("noteを開く"));
  assert.ok(html.includes("Instagramを開く"));
  assert.ok(!html.includes("noteで読む"));
  assert.ok(!html.includes("Instagramで見る"));
});

test("Local descriptions are individually differentiated", () => {
  const local = section("local", "about");
  for (const fragment of [
    "店構えと一緒に残した記録",
    "普段使いできる一軒",
    "土地に根付いた食文化",
  ]) {
    assert.ok(local.includes(fragment), `missing differentiated local description: ${fragment}`);
  }
});


test("Hero exposes the three content category shortcuts", () => {
  const heroStart = html.indexOf('class="hero wrap"');
  const heroEnd = html.indexOf('id="featured"', heroStart);
  const hero = html.slice(heroStart, heroEnd);
  for (const [href, label] of [
    ['#apps', '作ったもの'],
    ['#writing', '書いたもの'],
    ['#local', '歩いて見つけたもの'],
  ]) {
    assert.ok(hero.includes(`href="${href}"`), `missing hero shortcut: ${href}`);
    assert.ok(hero.includes(label), `missing hero shortcut label: ${label}`);
  }
  assert.ok(!hero.includes('href="#featured"'));
});


test("Elsewhere is grouped into three semantic destination groups", () => {
  for (const label of ["CREATE / PUBLISH", "CONNECT", "PICKS"]) {
    assert.ok(html.includes(label), `missing Elsewhere group: ${label}`);
  }
  for (const service of ["note", "GitHub", "ProtoPedia", "Instagram", "X", "公式LINE", "マシュマロ", "楽天ROOM", "Amazon"]) {
    assert.ok(html.includes(`<span>${service}</span>`), `missing Elsewhere service: ${service}`);
  }
  assert.ok(!html.includes('class="links-grid"'));
});
