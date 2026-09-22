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
