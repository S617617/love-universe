const fs = require("node:fs"),
  path = require("node:path"),
  assert = require("node:assert/strict");
const root = path.resolve("out");
const modules = [
  "memories",
  "story",
  "diary",
  "garden",
  "map",
  "assistant",
  "blindbox",
  "letters",
  "universe",
  "growth",
  "future-mailbox",
  "settings",
];
for (const route of [
  "",
  ...modules,
  ...[
    "memories",
    "story",
    "diary",
    "letters",
    "universe",
    "growth",
    "future-mailbox",
    "map",
  ].map((m) => m + "/read"),
])
  assert.ok(
    fs.existsSync(path.join(root, route, "index.html")),
    route + " static HTML",
  );
assert.ok(fs.existsSync(path.join(root, "404.html")));
assert.ok(fs.existsSync(path.join(root, ".nojekyll")));
assert.ok(fs.existsSync(path.join(root, "legacy-redirect.js")));
assert.ok(!fs.existsSync(path.join(root, "api")), "No server/API artifact");
let count = 0;
function visit(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    assert.ok(
      !e.name.startsWith(".env") &&
        ![".git", "node_modules", "uploads", "private"].includes(e.name),
      "No private/build source files",
    );
    const file = path.join(dir, e.name);
    if (e.isDirectory()) visit(file);
    else {
      count++;
      if (e.name.endsWith(".html")) {
        const html = fs.readFileSync(file, "utf8");
        assert.ok(
          !/(?:src|href)=["']\/_next\//.test(html),
          "Next asset missing project basePath",
        );
      }
      if (/\.(?:html|js|txt|json)$/.test(e.name)) {
        const text = fs.readFileSync(file, "utf8");
        assert.ok(
          !text.includes("PRIVATE_KEY_MUST_NOT_BE_EXPORTED"),
          "Private build env leaked",
        );
      }
    }
  }
}
visit(root);
console.log(
  "PASS 13 个入口、8 个静态详情页、资源前缀、.nojekyll、旧链接兼容和纯静态产物检查；文件数",
  count,
);
