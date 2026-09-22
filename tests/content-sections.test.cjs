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


test("Hero exposes the three content category shortcuts", () => {
  const heroStart = html.indexOf('class="hero wrap"');
  const heroEnd = html.indexOf('id="featured"', heroStart);
  const hero = html.slice(heroStart, heroEnd);
  for (const [href, label] of [
    ['#apps', 'APPS'],
    ['#writing', 'WRITING'],
    ['#local', 'LOCAL'],
  ]) {
    assert.ok(hero.includes(`href="${href}"`), `missing hero shortcut: ${href}`);
    assert.ok(hero.includes(`>${label}</a>`), `missing hero shortcut label: ${label}`);
  }
  assert.ok(!hero.includes('作ったもの'));
  assert.ok(!hero.includes('書いたもの'));
  assert.ok(!hero.includes('歩いて見つけたもの'));
  assert.ok(!hero.includes('icon-arrow-down'));
  assert.ok(!hero.includes('href="#featured"'));
});


test("Elsewhere is grouped into three semantic destination groups", () => {
  for (const label of ["CREATE / PUBLISH", "CONTACT", "PICKS"]) {
    assert.ok(html.includes(label), `missing Elsewhere group: ${label}`);
  }
  for (const service of ["note", "GitHub", "ProtoPedia", "Instagram", "X", "公式LINE", "マシュマロ", "楽天ROOM", "Amazon"]) {
    assert.ok(html.includes(`<span>${service}</span>`), `missing Elsewhere service: ${service}`);
  }
  assert.ok(!html.includes('class="links-grid"'));
});


test("Local descriptions avoid repetitive closing phrasing", () => {
  const local = section("local", "about");
  assert.ok(!local.includes("残しています"));
  for (const fragment of [
    "名古屋らしさが印象に残ります",
    "日常使いの一軒です",
    "食文化として見てみたくなる店です",
  ]) {
    assert.ok(local.includes(fragment), `missing revised Local description: ${fragment}`);
  }
});


test("Hero category shortcuts render as one inline index", () => {
  const heroStart = html.indexOf('class="hero wrap"');
  const heroEnd = html.indexOf('id="featured"', heroStart);
  const hero = html.slice(heroStart, heroEnd);
  assert.equal((hero.match(/hero-category-separator/g) || []).length, 2);
  assert.ok(hero.includes('>APPS</a>'));
  assert.ok(hero.includes('>WRITING</a>'));
  assert.ok(hero.includes('>LOCAL</a>'));
});


test("About copy stays conversational", () => {
  const about = section("about", null);
  assert.ok(about.includes("仕事だけでは、"));
  assert.ok(about.includes("たぶん収まらない。"));
  assert.ok(about.includes("ふだんはSEとして働いています"));
  assert.ok(!about.includes("途中の軌跡"));
  assert.ok(!about.includes("会社員SE"));
});

test("Apps descriptions avoid formal planning jargon", () => {
  const apps = section("apps", "writing");
  assert.ok(apps.includes("週末の朝、釣りに行くなら何時ごろがよさそうか。"));
  assert.ok(!apps.includes("釣行計画ツール"));
});


test("Visible copy avoids repeated archival wording", () => {
  const visibleStart = html.indexOf("<body>");
  const visible = html.slice(visibleStart);
  assert.ok(!visible.includes("釣行計画ツール"));
  assert.ok(!visible.includes("気になった店を記録"));
  assert.ok(!visible.includes("考え直した記録"));
  assert.ok(!visible.includes("キャパを考えた記録"));
  assert.ok(visible.includes("その途中でできたものを集めています"));
  assert.ok(visible.includes("ここから見られます"));
});


test("Writing descriptions use varied endings", () => {
  const writing = section("writing", "local");
  assert.ok(!writing.includes("書いた記事。"));
  assert.ok(!writing.includes("考えた記事。"));
  assert.ok(writing.includes("自分で書きながら考えたもの。"));
  assert.ok(writing.includes("育成する側の目線も交えて考えています。"));
  assert.ok(writing.includes("無理なく走り続けられる速度から見直しました。"));
});


test("Elsewhere separates publishing from contact", () => {
  const start = html.indexOf('class="links-section wrap"');
  const end = html.indexOf("</main>", start);
  const elsewhere = html.slice(start, end);
  const publishStart = elsewhere.indexOf("CREATE / PUBLISH");
  const contactStart = elsewhere.indexOf("CONTACT");
  const picksStart = elsewhere.indexOf("PICKS");
  const publish = elsewhere.slice(publishStart, contactStart);
  const contact = elsewhere.slice(contactStart, picksStart);
  assert.ok(publish.includes(">X</span>"));
  assert.ok(contact.includes(">公式LINE</span>"));
  assert.ok(contact.includes(">マシュマロ</span>"));
  assert.ok(!contact.includes(">X</span>"));
  assert.ok(!elsewhere.includes(">CONNECT<"));
});
