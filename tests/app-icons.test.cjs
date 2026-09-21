"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..");
const generator = path.join(repoRoot, "scripts", "generate_app_icons.cjs");
const faviconMaster = path.join(
  repoRoot,
  "docs",
  "design",
  "assets",
  "issue-41-icons",
  "cecil-favicon-master.png"
);
const appleMaster = path.join(
  repoRoot,
  "docs",
  "design",
  "assets",
  "issue-41-icons",
  "cecil-apple-touch-icon-master.png"
);

function pngSize(filePath) {
  const data = fs.readFileSync(filePath);
  assert.deepEqual(
    [...data.subarray(0, 8)],
    [137, 80, 78, 71, 13, 10, 26, 10],
    `${filePath} must be a PNG`
  );
  return {
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20)
  };
}

test("approved Cecil icon masters are square PNGs large enough for their outputs", () => {
  const favicon = pngSize(faviconMaster);
  const apple = pngSize(appleMaster);

  assert.equal(favicon.width, favicon.height, "favicon master must be square");
  assert.ok(favicon.width >= 32, "favicon master must be at least 32px");
  assert.equal(apple.width, apple.height, "Apple Touch Icon master must be square");
  assert.ok(apple.width >= 180, "Apple Touch Icon master must be at least 180px");
});

test("Cecil icon generator creates the expected deterministic asset set", () => {
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), "cecil-icons-"));

  try {
    const result = spawnSync(process.execPath, [generator, "--root", outputRoot], {
      cwd: repoRoot,
      encoding: "utf8"
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);

    const expected = new Map([
      ["icons/favicon-16x16.png", 16],
      ["icons/favicon-32x32.png", 32],
      ["icons/apple-touch-icon.png", 180]
    ]);

    for (const [relativePath, size] of expected) {
      assert.deepEqual(
        pngSize(path.join(outputRoot, relativePath)),
        { width: size, height: size },
        relativePath
      );
    }
  } finally {
    fs.rmSync(outputRoot, { recursive: true, force: true });
  }
});

test("landing page references the generated Cecil icons", () => {
  const html = fs.readFileSync(path.join(repoRoot, "public", "index.html"), "utf8");

  assert.match(
    html,
    /<link rel="icon" type="image\/png" sizes="32x32" href="\/icons\/favicon-32x32\.png">/
  );
  assert.match(
    html,
    /<link rel="icon" type="image\/png" sizes="16x16" href="\/icons\/favicon-16x16\.png">/
  );
  assert.match(
    html,
    /<link rel="apple-touch-icon" sizes="180x180" href="\/icons\/apple-touch-icon\.png">/
  );
});
