const ts = require("typescript");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const assert = require("node:assert/strict");
const filename = path.resolve("src/lib/store.tsx");
const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ES2020,
  },
});
const mod = new Module(filename, module);
mod.filename = filename;
mod.paths = Module._nodeModulePaths(path.dirname(filename));
const demoFilename = path.resolve("src/lib/demo-data.ts");
const demoModule = new Module(demoFilename, module);
demoModule.filename = demoFilename;
demoModule.paths = Module._nodeModulePaths(path.dirname(demoFilename));
demoModule._compile(
  ts.transpileModule(fs.readFileSync(demoFilename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText,
  demoFilename,
);
const originalRequire = mod.require.bind(mod);
mod.require = (id) =>
  id === "./demo-data" ? demoModule.exports : originalRequire(id);
mod._compile(compiled.outputText, filename);
const { emptyData, parseBackup, daysBetween, nextAnniversary, recordSchema } =
  mod.exports;
const demo = mod.exports.demoData();
for (const key of [
  "memories",
  "story",
  "diary",
  "letters",
  "universe",
  "growth",
  "future-mailbox",
  "map",
  "blindbox",
]) {
  assert.ok(demo[key].length > 0, key + " has fixtures");
  assert.ok(
    demo[key].every((e) => e.source === "demo"),
    key + " explicitly labeled",
  );
}
assert.deepEqual(mod.exports.demoData(), demo);
assert.ok(demo.settings.demoProfile);
assert.ok(demo.garden.flowers.length > 0);
assert.ok(demo["future-mailbox"].some((e) => e.openDate > mod.exports.today()));
assert.ok(
  demo["future-mailbox"].some((e) => e.openDate <= mod.exports.today()),
);
const old = JSON.parse(JSON.stringify(demo));
delete old.settings.demoProfile;
delete old.memories[0].source;
assert.equal(parseBackup(JSON.stringify(old)).settings.demoProfile, false);
assert.equal(parseBackup(JSON.stringify(old)).memories[0].source, "personal");
const data = emptyData();
assert.deepEqual(parseBackup(JSON.stringify(data)), data);
assert.throws(() => parseBackup("{broken"));
assert.throws(() => parseBackup(JSON.stringify({ ...data, version: 99 })));
assert.throws(() =>
  recordSchema.parse({
    id: "test",
    title: "test",
    date: "2025-02-30",
    body: "",
  }),
);
assert.equal(daysBetween("2024-02-28", "2024-03-01"), 2);
assert.equal(daysBetween("2025-02-28", "2025-03-01"), 1);
assert.equal(daysBetween("2026-10-26", "2026-10-26"), 0);
const RealDate = Date;
function freeze(day) {
  global.Date = class extends RealDate {
    constructor(...args) {
      super(...(args.length ? args : [day + "T12:00:00"]));
    }
    static now() {
      return new RealDate(day + "T12:00:00").getTime();
    }
  };
}
try {
  freeze("2025-02-28");
  assert.equal(nextAnniversary("2024-02-29"), "2025-02-28");
  freeze("2025-03-01");
  assert.equal(nextAnniversary("2024-02-29"), "2026-02-28");
  freeze("2028-02-28");
  assert.equal(nextAnniversary("2024-02-29"), "2028-02-29");
  freeze("2026-10-26");
  assert.equal(nextAnniversary("2026-12-01"), "2026-12-01");
  assert.equal(nextAnniversary("2027-01-01"), "2027-01-01");
} finally {
  global.Date = RealDate;
}
console.log(
  "PASS 数据备份校验、非法版本/日期保护、跨闰日天数、闰日纪念日和未来纪念日计算",
);
