const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const base = (
  process.env.TEST_URL || "http://127.0.0.1:3010/love-universe"
).replace(/\/$/, "");
const prefix = new URL(base).pathname;
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
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const errors = [],
      apiRequests = [],
      badAssets = [],
      checks = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (r) => {
      const u = new URL(r.url());
      if (u.pathname.startsWith(prefix + "/api/")) apiRequests.push(u.pathname);
    });
    page.on("response", (r) => {
      const u = new URL(r.url());
      if (
        r.status() >= 400 &&
        u.origin === new URL(base).origin &&
        /\.(js|css|svg|woff2)$/.test(u.pathname)
      )
        badAssets.push(u.pathname);
    });
    const ok = (s) => {
      checks.push(s);
      console.log("PASS", s);
    };
    const go = async (route) => {
      const response = await page.goto(base + route);
      assert.equal(response.status(), 200, route);
      await page.locator(".loading").waitFor({ state: "detached" });
    };
    await go("/");
    await page.getByRole("heading", { name: /世界很大/ }).waitFor();
    assert.equal(await page.locator(".module-card").count(), 11);
    await page.locator(".avatars img").first().waitFor();
    assert.ok((await page.locator("script[src]").allTextContents()).length > 0);
    const assets = await page
      .locator("script[src],link[rel=stylesheet],.avatars img")
      .evaluateAll((nodes) =>
        nodes.map((n) => n.getAttribute("src") || n.getAttribute("href")),
      );
    for (const asset of assets)
      assert.ok(asset.startsWith(prefix + "/"), asset);
    await page.screenshot({ path: "tests/pages-desktop.png", fullPage: true });
    ok("项目子路径下首页、11 入口、CSS/JS 和头像正确加载");
    const hrefs = await page
      .locator(".module-card")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href")));
    for (const href of hrefs) assert.ok(href.startsWith(prefix + "/"));
    await page.locator(".module-card").first().click();
    await page.waitForURL(base + "/memories/");
    await page.goBack();
    await page.waitForURL(base + "/");
    await page.goForward();
    await page.waitForURL(base + "/memories/");
    ok("首页真实点击与浏览器前进后退保留项目子路径");
    for (const moduleId of modules) {
      await go("/" + moduleId + "/");
      await page.reload();
      await page.locator(".loading").waitFor({ state: "detached" });
      await page
        .getByRole("link", { name: "返回我们的小宇宙", exact: true })
        .waitFor();
    }
    ok("全部 12 个子页独立访问、刷新及返回首页入口正常");
    await go("/memories/");
    await page.getByRole("button", { name: "写下回忆", exact: true }).click();
    let dialog = page.getByRole("dialog");
    await dialog.getByLabel("标题", { exact: true }).fill("Pages 创建的回忆");
    await dialog
      .getByLabel("想记下的话")
      .fill("在静态站点写下的内容，刷新后也要保留。");
    await dialog
      .locator("input[type=file]")
      .setInputFiles("tests/pages-desktop.png");
    await dialog.locator(".photo-input img").waitFor();
    await dialog.getByRole("button", { name: "好好收藏" }).click();
    await page
      .locator(".record-title")
      .filter({ hasText: "Pages 创建的回忆" })
      .click();
    await page.waitForURL(
      (u) =>
        u.pathname === prefix + "/memories/read/" && u.searchParams.has("id"),
    );
    const detail = page.url();
    const id = new URL(detail).searchParams.get("id");
    await page.reload();
    await page
      .getByRole("dialog")
      .getByText("在静态站点写下的内容，刷新后也要保留。", { exact: true })
      .waitFor();
    await page.getByRole("dialog").locator("img").waitFor();
    assert.equal((await context.request.get(detail)).status(), 200);
    ok("新建含照片的个人回忆使用静态 read/?id 详情，直接请求与刷新返回200");
    await page.getByRole("button", { name: "关闭", exact: true }).click();
    await page.waitForURL(base + "/memories/");
    await page
      .getByRole("button", { name: "编辑 Pages 创建的回忆", exact: true })
      .click();
    dialog = page.getByRole("dialog");
    await dialog.getByLabel("标题", { exact: true }).fill("Pages 修改后的回忆");
    await dialog.getByRole("button", { name: "好好收藏" }).click();
    await page.reload();
    await page
      .getByRole("heading", { name: "Pages 修改后的回忆", exact: true })
      .waitFor();
    ok("静态页面仍支持编辑与 localStorage 持久化");
    const legacy = base + "/memories/" + encodeURIComponent(id) + "/";
    assert.equal((await context.request.get(legacy)).status(), 404);
    await page.goto(legacy);
    await page.waitForURL(
      (u) =>
        u.pathname === prefix + "/memories/read/" &&
        u.searchParams.get("id") === id,
    );
    await page
      .getByRole("dialog", { name: "Pages 修改后的回忆", exact: true })
      .waitFor();
    ok("旧个人详情地址经真实404页面兼容跳转，内容未丢失");
    await page.getByRole("button", { name: "关闭", exact: true }).click();
    await go("/diary/");
    await page.getByRole("button", { name: "写下日记" }).click();
    dialog = page.getByRole("dialog");
    await dialog.getByLabel("标题", { exact: true }).fill("静态日记");
    await dialog.getByLabel("想记下的话").fill("今天一起去散步。晚风很温柔。");
    await dialog.getByRole("button", { name: "摘要", exact: true }).click();
    await dialog.locator(".ai-draft").waitFor();
    await dialog.getByText("公共演示模式", { exact: false }).waitFor();
    await dialog.getByRole("button", { name: "采用这份摘要" }).click();
    await dialog.getByRole("button", { name: "好好收藏" }).click();
    ok("日记摘要在浏览器本地运行，无后端也有真实结果");
    await go("/assistant/");
    await page.getByRole("button", { name: "有什么零预算的小惊喜？" }).click();
    await page.getByText("灵感搭子 · 演示模式", { exact: true }).waitFor();
    assert.match(
      await page.locator(".chat-message.assistant").last().innerText(),
      /未调用 AI/,
    );
    await page.reload();
    await page.getByText("灵感搭子 · 演示模式", { exact: true }).waitFor();
    ok("AI 聊天本地规则演示可用且刷新保留");
    await go("/story/");
    await page
      .getByRole("button", { name: "第三章 · 未完待续的日常", exact: true })
      .click();
    dialog = page.getByRole("dialog");
    await dialog.getByLabel("章节密码").fill("wrong");
    await dialog.getByRole("button", { name: "打开隐藏章节" }).click();
    await dialog
      .getByRole("status")
      .filter({ hasText: "密码不正确" })
      .waitFor();
    await dialog.getByLabel("章节密码").fill("love-demo");
    await dialog.getByRole("button", { name: "打开隐藏章节" }).click();
    await dialog
      .getByText("我们仍在学习怎样一起生活：", { exact: false })
      .waitFor();
    ok("静态阅读锁错误/正确演示流程都有反馈");
    await page.getByRole("button", { name: "关闭", exact: true }).click();
    await go("/garden/");
    const garden = page.getByRole("button", { name: /初见的小心愿/ });
    await garden.click();
    dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: /浇水/ }).click();
    assert.match(await dialog.innerText(), /成长值 30/);
    assert.equal(
      await dialog.getByRole("button", { name: /浇水/ }).isDisabled(),
      true,
    );
    ok("花园浇水与每日去重保持可用");
    await page.getByRole("button", { name: "关闭", exact: true }).click();
    await go("/blindbox/");
    await page.getByRole("button", { name: "拆开今天的小惊喜" }).click();
    dialog = page.getByRole("dialog");
    await dialog.waitFor();
    await dialog.getByRole("button", { name: "收藏这份心动" }).click();
    ok("恋爱盲盒真实抽取与收藏保持可用");
    await page.getByRole("button", { name: "关闭", exact: true }).click();
    await go("/future-mailbox/");
    await page
      .getByRole("button", { name: "寄给两周后的我们", exact: true })
      .click();
    dialog = page.getByRole("dialog");
    assert.match(await dialog.innerText(), /还需等待/);
    ok("未来信箱封存状态保持可用");
    await page.getByRole("button", { name: "关闭", exact: true }).click();
    await go("/settings/");
    const downloadEvent = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "导出完整备份", exact: true })
      .click();
    const download = await downloadEvent;
    await download.saveAs("tests/pages-backup.json");
    const backup = JSON.parse(
      fs.readFileSync("tests/pages-backup.json", "utf8"),
    );
    assert.ok(Object.keys(backup.photos).length > 0);
    page.once("dialog", (d) => d.accept());
    await page
      .locator('input[accept=".json,application/json"]')
      .setInputFiles("tests/pages-backup.json");
    await page.getByRole("status").filter({ hasText: "备份已恢复" }).waitFor();
    ok("照片 IndexedDB 及完整 JSON 备份往返保留");
    await page.route("**/*.tile.openstreetmap.org/**", (r) => r.abort());
    await go("/map/");
    await page
      .getByRole("button", { name: "切换地点列表", exact: true })
      .waitFor();
    await page
      .getByRole("button", { name: "切换地点列表", exact: true })
      .click();
    assert.ok(await page.locator(".record-card").count());
    ok("在线地图失败可切换列表，静态记录不受影响");
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const moduleId of ["", ...modules]) {
        await go(moduleId ? "/" + moduleId + "/" : "/");
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          width + " " + moduleId,
        );
      }
    }
    ok("手机、平板、桌面的13个入口无横向溢出");
    await page.setViewportSize({ width: 390, height: 844 });
    await go("/");
    await page.screenshot({ path: "tests/pages-mobile.png", fullPage: true });
    await go("/settings/");
    page.once("dialog", (d) => d.dismiss());
    await page
      .getByRole("button", { name: "恢复演示数据", exact: true })
      .click();
    assert.ok(
      await page.evaluate(() =>
        JSON.parse(localStorage.getItem("love-universe:v1")).memories.some(
          (e) => e.title === "Pages 修改后的回忆",
        ),
      ),
    );
    page.once("dialog", (d) => d.accept());
    await page
      .getByRole("button", { name: "恢复演示数据", exact: true })
      .click();
    await page
      .getByRole("status")
      .filter({ hasText: "演示数据已恢复" })
      .waitFor();
    ok("恢复演示仍需确认且可取消");
    assert.equal(
      (await context.request.get(base + "/not-a-planet/")).status(),
      404,
    );
    assert.deepEqual(apiRequests, []);
    assert.deepEqual(badAssets, []);
    assert.deepEqual(errors, []);
    ok("无后端请求、无资源404、无浏览器脚本错误，未知页面仍为404");
    fs.writeFileSync(
      "tests/pages-results.json",
      JSON.stringify(
        {
          date: new Date().toISOString(),
          base,
          checks,
          errors,
          apiRequests,
          badAssets,
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
