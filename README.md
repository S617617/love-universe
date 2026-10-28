# Love Universe · GitHub Pages 静态体验版 v1.2

无需注册，保留原有首页、11 个恋爱模块、动画、原创示例插画、本地记录、照片及 JSON 备份。当前默认目标为公开仓库 **love-universe** 的 GitHub Pages 项目站点。

## 先在本机预览

需要 Node.js 24.x。在 PowerShell 中执行：

```powershell
cd D:\qjt\codexproject\love-universe
npm ci --legacy-peer-deps
npm run dev
```

开发地址现在是 **http://127.0.0.1:3000/love-universe/**，不再是根路径。若端口已占用，以终端显示的端口为准，路径仍需带 `/love-universe/`。

要模拟真实 GitHub Pages（推荐上传前使用）：

```powershell
npm run lint
npm run typecheck
npm run test:data
npm run build
npm run check:export
npm start
```

`npm run build` 使用 Next.js 16.4.3 App Router 静态导出，生成 `out/`，再写入 `.nojekyll` 与旧详情链接兼容脚本。`npm start` 使用项目自带的纯静态目录服务器，不是 `next start`，访问同样的 `/love-universe/` 地址；可用 `npm start -- --port 3010` 更换端口。

## 这次为什么要改路由和服务

`next.config.ts` 已配置：

```ts
output: "export";
basePath: "/love-universe";
trailingSlash: true;
images: {
  unoptimized: true;
}
```

- Next Link、router 自动处理 basePath；原始图片 URL 通过 `src/lib/paths.ts` 统一补前缀，防止 `/demo/` 图片指向 GitHub 用户站点根目录。
- 每个模块都导出 `模块/index.html`，所以 `/love-universe/diary/`、`/love-universe/garden/` 等可直接访问和刷新。
- 浏览器中新建的记录 ID 无法在构建时枚举，因此详情改成固定静态页加查询参数，例如 `/love-universe/memories/read/?id=记录ID`。这保留新增、阅读、编辑和详情刷新能力，不依赖服务器动态路由。
- 旧的 `/love-universe/memories/记录ID/` 等地址，由导出的 404 页面识别并跳转到相应的 `read/?id=...` 地址。GitHub 会先返回一次 404 后跳转，这是旧地址的兼容措施；**新地址直接返回实际的静态 HTML，不依赖 404 回退**。
- 不存在的模块仍显示友好 404，不会被统一重写成首页。
- `next/image` 已关闭服务器图片优化。当前 Photo 组件使用普通图片、压缩后的 IndexedDB 照片及本地原创 SVG，不依赖 `/_next/image` 服务。
- 原先的 POST API 和服务端详情源代码保存在 `src/server/`，没有删除，但不再位于 `src/app`，不会成为静态站点接口，也不会被导出到 `out/`。
- 原来的动态响应头不能由 GitHub Pages 执行，已从 Next.js 静态配置移除。GitHub Pages 的服务器行为由托管平台决定。

静态导出不能运行 Next.js POST API、按请求读取秘密环境变量、服务器密码验证或无限动态详情页。这些限制及替代方式参考 [Next.js 静态导出文档](https://nextjs.org/docs/app/guides/static-exports)。

## 可用功能与演示边界

| 功能                      | GitHub Pages 体验                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| 首页与 11 个入口          | 保留，统一返回首页，独立页面与响应式导航                                                     |
| 时光机、故事、日记、情书  | 增删改查、搜索/排序、照片、独立静态阅读页                                                    |
| 日记回顾                  | 浏览器内按七天/月度汇总，不调用 AI                                                           |
| AI 聊天、润色、摘要、标题 | **浏览器本地规则演示**，明确标识，显示加载反馈；不调用模型，不请求 `/api/ai`，不读取 API Key |
| 章节阅读锁                | 公开演示密码 `love-demo`，仅浏览器验证；不提供安全保密                                       |
| 花园                      | 种植、浇水、施肥、任务与阶段成长                                                             |
| 地图                      | Leaflet + 真实 OSM 瓦片，无 Key；瓦片失败可重试或切换地点列表                                |
| 盲盒                      | 本地内容随机抽取、筛选、收藏和自定义                                                         |
| 纪念日与成长              | 日期、倒计时、星球、目标及进度                                                               |
| 未来信箱                  | 本机日期控制展示，不是服务端强制保密                                                         |
| 音乐                      | 可选外部音频地址、手动播放；失败友好提示                                                     |
| 设置与数据                | 名字、头像、日期、主题、确认恢复演示、JSON 备份、二次确认清空                                |

偏好输入在静态 AI 界面仅作为本机备忘；规则演示不会声称根据偏好或私密回忆进行了模型分析。

将来需要真实 AI，应另建保管密钥的服务端，并加配额、鉴权/限流及跨域策略，再接入前端。**不要把 Key 放进前端，不要为 Pages 添加 NEXT_PUBLIC_AI_API_KEY 或把服务端代码直接搬进浏览器。** `src/server` 仅保留未来迁移参考，其环境变量在静态 Pages 部署中不起作用。

## 示例与个人数据

首次访问自动加载虚构角色「林间与星禾」及原创 SVG 插画，没有真实用户照片、日记或情书。示例带标识，自己新建/编辑保存的记录标为「我的记录」。设置中的“恢复演示数据”需要确认，不会自动覆盖已有旧数据。

文字保存于 localStorage，上传照片经 5MB 限制、缩放和压缩后进入 IndexedDB，localStorage 只存资产 ID。图片失败显示占位，存储失败显示错误，坏 JSON 不自动覆盖。保留 v1 数据格式和旧字段兼容。

**数据仅在当前浏览器，不云同步，也不跨设备共享。** 更换 localhost 端口、部署域名或浏览器后不会自动出现旧记录；先从旧站设置导出完整备份，再到新站导入。新页面路径不会改变同一域名下已有的存储键。

GitHub 用户域名下不同项目站点共享同一浏览器 origin，因此本项目适用于个人 Demo，不能把本地存储/阅读锁当成安全隔离或加密方案。私密内容请妥善备份，不要写入源码或 public 文件夹。

## 第一步：创建 GitHub 仓库

1. 登录 GitHub，点击右上角 `+` → **New repository**。
2. Repository name 填 **love-universe**，选择 **Public**，可使用 GitHub Free 的公开仓库 Pages。
3. 创建空仓库，首次上传时先不要勾选自动创建 README、.gitignore 或 License，避免与现有代码产生初始提交冲突。
4. 记下仓库地址：`https://github.com/你的用户名/love-universe.git`。

## 第二步：上传当前项目

只上传 **D:\qjt\codexproject\love-universe**，不要上传包含其他个人文件的上层 `codexproject` 工作区。

在本项目目录执行：

```powershell
cd D:\qjt\codexproject\love-universe
git init
git add .
git status
```

检查暂存列表：应包含 src、public/demo、scripts、.github/workflows/deploy.yml、package.json、package-lock.json、next.config.ts 等；**不应包含 `.env`、`.env.local`、node_modules、.next、out、真实照片、备份 JSON 或个人日记**。

确认后执行（替换 YOUR_NAME）：

```powershell
git commit -m "Configure Love Universe for GitHub Pages"
git branch -M main
git remote add origin https://github.com/YOUR_NAME/love-universe.git
git push -u origin main
```

已有 Git 仓库或 origin 时，先用 `git remote -v` 查看，沿用现有配置，不要重复添加或强制覆盖。若需要更换仓库，明确确认目标后再使用 `git remote set-url origin ...`。

`.gitignore` 已排除环境文件（仅允许无密钥的 .env.example）、构建目录、依赖、工具缓存、测试截图/备份、public/uploads 和 private 文件夹。**gitignore 不会让已被追踪的文件自动退出仓库**：若误追踪了敏感文件，先停止推送，用 `git rm --cached 路径` 撤销追踪并确认；若真实密钥已经公开，立即在对应服务撤销并重新生成。

## 第三步：开启 Pages 并自动发布

1. 仓库 → **Settings → Pages**。
2. 在 **Build and deployment → Source** 中选择 **GitHub Actions**，不要选“Deploy from a branch”。
3. 打开 **Actions**。首次推送 main 会触发 `Deploy Love Universe to GitHub Pages`。如果推送时还没开启 Pages 导致失败，开启后点击 **Re-run all jobs**；也可选择工作流 → **Run workflow** 手动触发。
4. 等待 `build` 和 `deploy` 两个任务变绿。
5. 在 Settings → Pages 的 **Visit site** 或 deploy 任务 Environment 链接中获取真实网址。

仓库名按当前配置为 love-universe，正常网址格式是：

```text
https://YOUR_NAME.github.io/love-universe/
```

这是格式示例，不表示已经发布。把 YOUR_NAME 换成用户名；以 GitHub 实际显示的网址为准。打开网址后，可以直接访问 `/love-universe/diary/` 并刷新，确认正常后再分享给朋友。

官方说明：[自定义 GitHub Pages 工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 工作流做了什么

`.github/workflows/deploy.yml` 在 main 推送或手动触发时执行：

- checkout、Node 24、npm 缓存、锁文件安装；
- lint、TypeScript、数据模型测试；
- 静态构建和产物检查；
- 只上传 **out/** 为 Pages artifact，不上传整个仓库、环境文件或服务端目录；
- deploy 依赖 build，声明 `pages: write`、`id-token: write`，发布到 `github-pages` environment，并输出真实页面 URL；
- 相同 Pages 站点部署串行运行，不会随便打断正在进行的发布。

不需要配置 API Key、Actions Secrets、Vercel 账号或付费服务器。当前仓库名和 basePath 必须保持对应；若以后换仓库名或自定义域名，需要同步修改 next.config.ts、路径助手、静态预览/导出脚本及兼容测试后重新构建。

## 本地复验和目录

`npm run test:pages`（以及 test:e2e / test:demo）使用 Playwright 与本机 Edge，在隔离浏览器中测试真实 **out/** 站点。先 `npm run build`，再另开终端 `npm start -- --port 3010`，然后：

```powershell
$env:TEST_URL='http://127.0.0.1:3010/love-universe'
npm run test:pages
```

若没有测试工具，可单独安装 `npm install --no-save --legacy-peer-deps playwright@1.62.1`；页面正常运行不依赖 Playwright。`npm run test:api` 仅验证保留的后端参考代码，不代表 Pages 上有 API。旧服务端验收脚本保存在 scripts/legacy，不用于当前静态部署。

- `src/app/[module]`：静态模块入口，generateStaticParams 枚举已知模块。
- `src/app/[module]/read`：可刷新的固定详情页面，query 中只传本机记录 ID。
- `src/lib/paths.ts`：basePath、资源 URL、详情 URL。
- `src/lib/demo-services.ts`：无网络、无密钥的浏览器规则演示。
- `src/lib/store.tsx` / media.ts：保持本地数据访问和照片策略。
- `src/server`：保留的后端/旧路由参考代码，不部署为 Pages API。
- `scripts/prepare-export.cjs`：.nojekyll 与旧详情兼容。
- `scripts/serve-export.cjs`：模拟项目子路径的纯静态目录服务器，无 SPA catch-all。
- `scripts/check-export.cjs`：静态页面、资源前缀与敏感文件检查。

本次只修改代码和本地验证；只有在 GitHub 的实际 deploy 任务成功后，才算完成线上发布。
