const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const base = process.env.TEST_URL || "http://127.0.0.1:3000";
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  const checks = [];
  const ok = (s) => {
    checks.push(s);
    console.log("PASS", s);
  };
  const go = async (path) => {
    await page.goto(base + path);
    await page.locator(".loading").waitFor({ state: "detached" });
  };
  await go("/growth");
  await page.getByRole("button", { name: "写下成长目标" }).click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel("标题", { exact: true }).fill("一起阅读");
  await dialog.getByLabel("完成条件与我们的约定").fill("每天读十页");
  await dialog.getByLabel("目标次数").fill("2");
  await dialog.getByRole("button", { name: "好好收藏" }).click();
  await page
    .locator(".record-card")
    .filter({
      has: page.getByRole("heading", { name: "一起阅读", exact: true }),
    })
    .getByRole("button", { name: "记下今天的一步" })
    .click();
  assert.match(
    await page
      .locator(".record-card")
      .filter({
        has: page.getByRole("heading", { name: "一起阅读", exact: true }),
      })
      .locator(".progress-info")
      .innerText(),
    /1 \/ 2/,
  );
  await page.getByRole("button", { name: "今天已记录" }).click();
  assert.match(
    await page
      .locator(".record-card")
      .filter({
        has: page.getByRole("heading", { name: "一起阅读", exact: true }),
      })
      .locator(".progress-info")
      .innerText(),
    /1 \/ 2/,
  );
  ok("共同成长进度与同日防重复");
  await go("/map");
  await page.getByRole("button", { name: "写下地点" }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("标题", { exact: true }).fill("深圳的约定");
  await dialog.getByLabel("纬度（-90 至 90）").fill("22.5431");
  await dialog.getByLabel("经度（-180 至 180）").fill("114.0579");
  await dialog
    .locator("input[type=file]")
    .setInputFiles("tests/home-desktop.png");
  await dialog.getByRole("button", { name: "上传照片" }).waitFor();
  await dialog.locator(".photo-input img").waitFor();
  await dialog.getByRole("button", { name: "好好收藏" }).click();
  await page
    .getByRole("heading", { name: "深圳的约定", exact: true })
    .waitFor();
  await page.locator(".love-marker").first().waitFor();
  await page.locator(".love-marker").first().click();
  await page.getByRole("dialog").waitFor();
  assert.match(await page.getByRole("dialog").innerText(), /深圳的约定/);
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  ok("真实经纬度标记、详情与照片 IndexedDB 保存");
  await go("/settings");
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出完整备份", exact: true }).click();
  const download = await downloadEvent;
  await download.saveAs("tests/roundtrip.json");
  const backup = JSON.parse(fs.readFileSync("tests/roundtrip.json", "utf8"));
  assert.ok(Object.keys(backup.photos).length === 1);
  assert.equal(
    backup.data.map.find((e) => e.title === "深圳的约定").title,
    "深圳的约定",
  );
  ok("完整备份包含照片和全部数据");
  await page
    .locator('input[type=file][accept=".json,application/json"]')
    .setInputFiles({
      name: "invalid.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"version":99}'),
    });
  await page.getByRole("status").filter({ hasText: "导入失败" }).waitFor();
  assert.equal(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("love-universe:v1")).map.filter(
          (e) => e.source === "personal",
        ).length,
    ),
    1,
  );
  ok("无效备份被拒绝且原数据保留");
  page.once("dialog", (d) => d.accept());
  await page
    .locator('input[type=file][accept=".json,application/json"]')
    .setInputFiles("tests/roundtrip.json");
  await page.getByRole("status").filter({ hasText: "备份已恢复" }).waitFor();
  await go("/map");
  await page
    .locator(".record-card")
    .filter({
      has: page.getByRole("heading", { name: "深圳的约定", exact: true }),
    })
    .locator(".record-photo img")
    .waitFor();
  ok("照片完整备份往返导入");
  await go("/story");
  await page.getByRole("button", { name: "写下章节" }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("标题", { exact: true }).fill("秘密花园");
  await dialog.getByLabel("想记下的话").fill("隐藏正文");
  await dialog.getByLabel("设为隐藏章节（本机阅读锁）").check();
  await dialog.getByRole("button", { name: "好好收藏" }).click();
  assert.equal(await page.getByText("隐藏正文", { exact: true }).count(), 0);
  await page.getByRole("button", { name: "秘密花园", exact: true }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("章节密码").fill("wrong-password");
  await dialog.getByRole("button", { name: "打开隐藏章节" }).click();
  await dialog.getByRole("status").filter({ hasText: "密码不正确" }).waitFor();
  await dialog.getByLabel("章节密码").fill("love-demo");
  await dialog.getByRole("button", { name: "打开隐藏章节" }).click();
  await dialog.getByText("隐藏正文", { exact: true }).waitFor();
  ok("隐藏章节默认演示密码由服务端验证，错误密码拒绝解锁");
  const missing = await context.request.get(base + "/not-a-planet");
  assert.equal(missing.status(), 404);
  ok("无效路由正确返回404");
  fs.writeFileSync(
    "tests/extended-results.json",
    JSON.stringify({ checks }, null, 2),
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
