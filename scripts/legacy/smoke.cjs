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
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const checks = [];
  const check = (msg) => {
    checks.push(msg);
    console.log("PASS", msg);
  };
  const go = async (route) => {
    const res = await page.goto(base + route);
    assert.equal(res.status(), 200);
    await page.locator(".loading").waitFor({ state: "detached" });
  };
  await go("/");
  await page.getByRole("heading", { name: /世界很大/ }).waitFor();
  assert.equal(await page.locator(".module-card").count(), 11);
  check("首页有十一处可导航入口");
  await page.screenshot({ path: "tests/home-desktop.png", fullPage: true });
  await go("/settings");
  await page.getByLabel("你的名字", { exact: true }).fill("小宇");
  await page.getByLabel("TA 的名字").fill("小星");
  await page.getByLabel("开始相恋").fill("2025-01-01");
  await page.getByRole("button", { name: "保存这份专属" }).click();
  await page.getByRole("status").filter({ hasText: "设置已保存" }).waitFor();
  await go("/");
  assert.match(await page.locator(".couple").innerText(), /小宇/);
  check("设置保存并同步首页");
  async function add(route, title, body) {
    await go(route);
    await page.getByRole("button", { name: /写下/ }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("标题", { exact: true }).fill(title);
    await dialog.getByLabel("想记下的话").fill(body);
    await dialog.getByRole("button", { name: "好好收藏" }).click();
    await dialog.waitFor({ state: "detached" });
    await page.getByRole("heading", { name: title, exact: true }).waitFor();
  }
  await add("/memories", "第一次看海", "那天天气很好，海风很轻。");
  await page.reload();
  await page
    .getByRole("heading", { name: "第一次看海", exact: true })
    .waitFor();
  check("回忆新增并刷新保留");
  await page
    .getByRole("button", { name: "编辑 第一次看海", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("标题", { exact: true })
    .fill("一起看海");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "好好收藏" })
    .click();
  await page.getByRole("heading", { name: "一起看海", exact: true }).waitFor();
  await page.getByRole("button", { name: "一起看海", exact: true }).click();
  await page.getByRole("dialog").waitFor();
  assert.match(page.url(), /\/memories\//);
  assert.match(await page.getByRole("dialog").innerText(), /海风很轻/);
  await page.reload();
  await page.getByRole("dialog").waitFor();
  check("回忆编辑、详情独立路由与刷新");
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await page.waitForURL(base + "/memories");
  await add("/diary", "今天的小事", "一起做了一顿晚餐。");
  await page.getByRole("button", { name: "生成时光回顾" }).click();
  await page.getByRole("dialog").waitFor();
  assert.match(await page.getByRole("dialog").innerText(), /一起做了一顿晚餐/);
  check("日记本地周期回顾");
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await add("/story", "初次遇见", "在人群里一眼看见了你。");
  await add("/letters", "给你的第一封信", "很开心能和你一起生活。");
  await add("/future-mailbox", "给未来的我们", "愿我们依然一起看日落。");
  await go("/future-mailbox");
  await page.getByRole("button", { name: "写下未来信件" }).click();
  await page
    .getByRole("dialog")
    .getByLabel("标题", { exact: true })
    .fill("封存的信");
  await page.getByRole("dialog").getByLabel("开启日期").fill("2099-01-01");
  await page
    .getByRole("dialog")
    .getByLabel("想记下的话")
    .fill("未到日期不显示正文");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "好好收藏" })
    .click();
  assert.equal(
    await page.getByText("未到日期不显示正文", { exact: true }).count(),
    0,
  );
  await page.getByRole("button", { name: "封存的信", exact: true }).click();
  await page.getByRole("dialog").waitFor();
  assert.match(await page.getByRole("dialog").innerText(), /2099-01-01/);
  assert.doesNotMatch(
    await page.getByRole("dialog").innerText(),
    /未到日期不显示正文/,
  );
  check("未来信件封存状态与正文显示限制");
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await go("/garden");
  await page.getByRole("button", { name: /种下一朵玫瑰/ }).click();
  await page.getByRole("dialog").getByLabel("玫瑰的名字").fill("第一朵温柔");
  await page
    .getByRole("dialog")
    .getByLabel("藏在花里的回忆或祝福")
    .fill("愿你每天开心");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "把爱种下" })
    .click();
  await page.getByRole("button", { name: /第一朵温柔/ }).click();
  await page.getByRole("dialog").getByRole("button", { name: /浇水/ }).click();
  assert.match(await page.getByRole("dialog").innerText(), /成长值 10/);
  assert.equal(
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /浇水/ })
      .isDisabled(),
    true,
  );
  check("种植、浇水和每日去重");
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await go("/blindbox");
  await page.getByRole("button", { name: "拆开今天的小惊喜" }).click();
  await page.getByRole("dialog").waitFor();
  assert.ok((await page.getByRole("dialog").getByRole("heading").count()) > 1);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "收藏这份心动" })
    .click();
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await page.getByRole("button", { name: "只看收藏" }).click();
  assert.equal(await page.locator(".record-card").count(), 1);
  check("盲盒真实抽取与收藏");
  await go("/assistant");
  if (await page.getByRole("button", { name: "清空聊天记录" }).isEnabled()) {
    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: "清空聊天记录" }).click();
  }

  await page.getByRole("button", { name: "有什么零预算的小惊喜？" }).click();
  await page.getByText("灵感搭子 · 演示模式", { exact: true }).waitFor();
  assert.match(
    await page.locator(".chat-message.assistant").innerText(),
    /未调用 AI/,
  );
  check("AI 无密钥演示明确标注并保存聊天");
  const ai = await context.request.post(base + "/api/ai", {
    data: { action: "摘要", text: "一起散步。" },
  });
  assert.equal(ai.status(), 200);
  assert.equal((await ai.json()).demo, true);
  const invalid = await context.request.post(base + "/api/ai", {
    data: { action: "wrong" },
  });
  assert.equal(invalid.status(), 400);
  check("AI API 正常与无效请求处理");
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
  }
  check("首页、十一模块和设置直接访问均返回 200");
  await go("/");
  await page
    .locator(".nav-links")
    .getByRole("link", { name: "我们的故事", exact: true })
    .click();
  await page.waitForURL(base + "/story");
  await page.goBack();
  await page.waitForURL(base + "/");
  await page.goForward();
  await page.waitForURL(base + "/story");
  check("浏览器前进后退导航正常");

  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    "/",
    "/settings",
    "/diary",
    "/assistant",
    "/garden",
    "/map",
  ]) {
    await go(route);
    const size = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      width: innerWidth,
    }));
    assert.ok(size.scroll <= size.width, route + " 无横向溢出");
  }
  await go("/");
  await page.screenshot({ path: "tests/home-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "切换导航" }).click();
  await page.locator(".nav-links.open").waitFor();
  check("390px 手机端布局与折叠菜单");
  await go("/memories");
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: "删除 一起看海", exact: true })
    .click();
  await page.reload();
  assert.equal(
    await page.getByRole("heading", { name: "一起看海", exact: true }).count(),
    0,
  );
  check("确认删除与刷新后仍删除");
  assert.deepEqual(errors, []);
  check("浏览器无未捕获脚本异常");
  fs.writeFileSync(
    "tests/results.json",
    JSON.stringify({ date: new Date().toISOString(), checks, errors }, null, 2),
  );
  await browser.close();
  console.log("ALL CHECKS PASSED");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
