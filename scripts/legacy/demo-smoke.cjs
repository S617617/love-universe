const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const base = process.env.TEST_URL || "http://127.0.0.1:3000";
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const checks = [],
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const ok = (s) => {
    checks.push(s);
    console.log("PASS", s);
  };
  const go = async (url) => {
    const res = await page.goto(base + url);
    assert.equal(res.status(), 200);
    await page.locator(".loading").waitFor({ state: "detached" });
  };
  const read = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("love-universe:v1")));
  await go("/");
  await page.locator(".demo-banner").waitFor();
  let data = await read();
  assert.equal(data.settings.name1, "林间");
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
  ])
    assert.ok(data[key].length, key);
  assert.equal(await page.locator(".module-card").count(), 11);
  await page.reload();
  assert.equal((await read()).memories[0].id, data.memories[0].id);
  ok("首次访问有完整虚构样例，刷新保留且无重复灌入");
  await page.locator(".avatars img").first().waitFor();
  for (const path of [
    "/demo/seaside.svg",
    "/demo/bookshop.svg",
    "/demo/picnic.svg",
    "/demo/avatar-lin.svg",
    "/demo/avatar-xing.svg",
  ])
    assert.equal((await context.request.get(base + path)).status(), 200);
  ok("示例插画和头像均为可访问的本地资源");
  await page.screenshot({ path: "tests/demo-desktop.png", fullPage: true });
  await go("/memories");
  assert.ok(await page.getByText("示例记录", { exact: true }).count());
  await page
    .getByRole("button", { name: "编辑 那家书店，刚好遇见你", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("标题", { exact: true })
    .fill("朋友亲手改写的回忆");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "好好收藏" })
    .click();
  assert.equal(
    (await read()).memories.find((e) => e.title === "朋友亲手改写的回忆")
      .source,
    "personal",
  );
  await page.getByText("我的记录", { exact: true }).waitFor();
  await page.reload();
  await page
    .getByRole("heading", { name: "朋友亲手改写的回忆", exact: true })
    .waitFor();
  ok("修改样例后成为我的记录且刷新持久化");
  await go("/settings");
  page.once("dialog", (d) => d.dismiss());
  await page.getByRole("button", { name: "恢复演示数据", exact: true }).click();
  assert.ok(
    (await read()).memories.some((e) => e.title === "朋友亲手改写的回忆"),
  );
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "恢复演示数据", exact: true }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "演示数据已恢复" })
    .waitFor();
  data = await read();
  assert.equal(
    data.memories.some((e) => e.title === "朋友亲手改写的回忆"),
    false,
  );
  assert.equal(data.settings.demoProfile, true);
  ok("恢复演示可取消，确认后恢复完整样例");
  await go("/story");
  await page
    .getByRole("button", { name: "第三章 · 未完待续的日常", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("章节密码").fill("love-demo");
  await dialog.getByRole("button", { name: "打开隐藏章节" }).click();
  await dialog
    .getByText("我们仍在学习怎样一起生活：", { exact: false })
    .waitFor();
  ok("无密钥可用公开密码体验服务端章节验证");
  await page.route("**/*.tile.openstreetmap.org/**", (r) => r.abort());
  await go("/map");
  await page.getByText("在线底图暂时无法加载", { exact: false }).waitFor();
  await page.getByRole("button", { name: "切换地点列表", exact: true }).click();
  assert.equal(await page.locator(".map-canvas").count(), 0);
  assert.ok(await page.locator(".record-card").count());
  ok("地图资源失败时可切换列表继续体验");
  await page.route("**/demo/bookshop.svg", (r) => r.abort());
  await go("/memories");
  await page.locator(".record-photo .photo-fallback").first().waitFor();
  ok("图片加载失败呈现占位且记录仍可阅读");
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/memories",
      "/story",
      "/diary",
      "/garden",
      "/map",
      "/assistant",
      "/blindbox",
      "/letters",
      "/universe",
      "/growth",
      "/future-mailbox",
      "/settings",
    ]) {
      await go(route);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        width + route,
      );
    }
  }
  ok("13 个入口在手机、平板和桌面均可直接访问且无横向溢出");
  await page.setViewportSize({ width: 390, height: 844 });
  await go("/");
  await page.screenshot({ path: "tests/demo-mobile.png", fullPage: true });
  const rawBefore = await page.evaluate(() =>
    localStorage.getItem("love-universe:v1"),
  );
  await go("/settings");
  await page.evaluate(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException("quota", "QuotaExceededError");
    };
  });
  await page.getByLabel("你的名字", { exact: true }).fill("不会保存的名字");
  await page.getByRole("button", { name: "保存这份专属" }).click();
  await page.getByRole("alert").filter({ hasText: "保存失败" }).waitFor();
  assert.equal(
    await page.evaluate(() => localStorage.getItem("love-universe:v1")),
    rawBefore,
  );
  ok("存储失败明确提示且不谎称保存成功");
  const invalid = await browser.newContext();
  const broken = await invalid.newPage();
  await broken.addInitScript(() =>
    localStorage.setItem("love-universe:v1", "invalid-json"),
  );
  await broken.goto(base);
  await broken
    .getByRole("alert")
    .filter({ hasText: "本地数据无法读取" })
    .waitFor();
  assert.equal(
    await broken.evaluate(() => localStorage.getItem("love-universe:v1")),
    "invalid-json",
  );
  ok("坏 JSON 保留原始数据，不自动覆盖为样例");
  await invalid.close();
  const legacy = await browser.newContext();
  const old = await legacy.newPage();
  await old.addInitScript((seed) => {
    seed.settings.name1 = "既有用户";
    delete seed.settings.demoProfile;
    for (const e of seed.memories) delete e.source;
    localStorage.setItem("love-universe:v1", JSON.stringify(seed));
  }, data);
  await old.goto(base);
  await old
    .locator(".couple")
    .getByText("既有用户", { exact: false })
    .waitFor();
  const loaded = await old.evaluate(() =>
    JSON.parse(localStorage.getItem("love-universe:v1")),
  );
  assert.equal(loaded.settings.name1, "既有用户");
  ok("既有数据安全保留，旧版字段可兼容读取");
  await legacy.close();
  const other = await browser.newContext();
  const isolated = await other.newPage();
  await isolated.goto(base);
  await isolated
    .locator(".couple")
    .getByText("林间", { exact: false })
    .waitFor();
  ok("不同浏览器会话互不共享个人记录");
  await other.close();
  const api = await context.request.post(base + "/api/ai", {
    data: { action: "标题", text: "今天一起去散步。" },
  });
  assert.equal((await api.json()).demo, true);
  const bad = await context.request.post(base + "/api/ai", {
    headers: { "content-type": "application/json" },
    data: "{bad",
  });
  assert.equal(bad.status(), 400);
  ok("匿名 AI 明确返回演示标识并拒绝无效 JSON");
  assert.deepEqual(errors, []);
  ok("全程无未捕获浏览器异常");
  fs.writeFileSync(
    "tests/demo-results.json",
    JSON.stringify({ date: new Date().toISOString(), checks, errors }, null, 2),
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
