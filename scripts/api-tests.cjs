const ts = require("typescript"),
  fs = require("node:fs"),
  path = require("node:path"),
  Module = require("node:module"),
  assert = require("node:assert/strict");
const filename = path.resolve("src/server/ai-route.ts");
const mod = new Module(filename, module);
mod.filename = filename;
mod.paths = Module._nodeModulePaths(path.dirname(filename));
mod._compile(
  ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText,
  filename,
);
(async () => {
  const original = {
    fetch: global.fetch,
    key: process.env.AI_API_KEY,
    enabled: process.env.ENABLE_LIVE_AI,
    base: process.env.AI_BASE_URL,
  };
  let calls = 0;
  try {
    process.env.AI_API_KEY = "test-key-not-a-real-secret";
    process.env.AI_BASE_URL = "https://model.test/v1";
    delete process.env.ENABLE_LIVE_AI;
    global.fetch = async (url, init) => {
      calls++;
      assert.equal(url, "https://model.test/v1/chat/completions");
      assert.equal(
        init.headers.Authorization,
        "Bearer test-key-not-a-real-secret",
      );
      return Response.json({
        choices: [{ message: { content: "TEST STUB RESPONSE" } }],
      });
    };
    const request = () =>
      new Request("http://localhost/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "标题", text: "一起散步的日子。" }),
      });
    let response = await mod.exports.POST(request());
    assert.equal((await response.json()).demo, true);
    assert.equal(calls, 0);
    process.env.ENABLE_LIVE_AI = "false";
    response = await mod.exports.POST(request());
    assert.equal((await response.json()).demo, true);
    assert.equal(calls, 0);
    process.env.ENABLE_LIVE_AI = "true";
    response = await mod.exports.POST(request());
    const result = await response.json();
    assert.equal(result.demo, false);
    assert.equal(result.text, "TEST STUB RESPONSE");
    assert.equal(calls, 1);
    response = await mod.exports.POST(
      new Request("http://localhost/api/ai", {
        method: "POST",
        body: "{broken",
      }),
    );
    assert.equal(response.status, 400);
    console.log(
      "PASS 公共模式即使存在密钥也不调用模型；显式启用后的服务端请求使用 mock 验证，无付费网络请求",
    );
  } finally {
    global.fetch = original.fetch;
    for (const [k, v] of Object.entries({
      AI_API_KEY: original.key,
      ENABLE_LIVE_AI: original.enabled,
      AI_BASE_URL: original.base,
    })) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
