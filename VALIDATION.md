# Love Universe GitHub Pages v1.2 · 本地验收

验证日期：2026-10-29（Asia/Shanghai）。本次仅完成项目修改、本地构建与测试，未创建/推送 GitHub 仓库，也未执行 GitHub Pages 发布。

## 配置与保留内容

- 沿用 Next.js 16.4.3、App Router、现有依赖、UI、动画、11 个模块及 v1 本地数据格式；未重新创建项目。
- 配置 output: export、basePath: /love-universe、trailingSlash: true、images.unoptimized: true。
- 导出 13 个主入口（首页、11 模块和设置）、8 个固定详情页及 404 页面。
- 新详情使用 /模块/read/?id=...，直接静态请求返回 200。原动态地址通过 404 兼容脚本跳转，旧地址首次 HTTP 404 属于该兼容流程，不能当作服务器 rewrite。
- 浏览器中本地运行聊天、标题/摘要/润色规则演示和公开阅读锁；无前端 Key、无 /api 请求。后端/旧路由源码保留于 src/server，不导出为 API。
- 图片显示统一加子路径，上传照片仍限制 5MB、压缩后存 IndexedDB；localStorage 数据键不变。public 仅含 5 个原创示例 SVG。

## 命令检查

- npm run lint：通过。
- npm run typecheck：通过（next typegen + tsc --noEmit）。
- npm run test:data：通过，保持旧数据、示例、日期边界兼容。
- npm run build：通过，全部为 Static / SSG，输出 out/；无运行时函数路由。
- npm run check:export：通过，155 个产物文件；检查静态入口、详情、子路径资源、.nojekyll、兼容脚本、禁止环境/私密/服务端目录进入产物。
- npm run test:api：通过，仅对保留的后端参考代码执行 mock 测试，不能解释为 Pages 提供真实 API。
- .github/workflows/deploy.yml：Python YAML 解析和权限/产物依赖检查通过；Action 版本与支持输入依据官方 action.yml 核验。GitHub 远端运行尚未验证。

## 纯静态浏览器验收

使用 npm start -- --port 3010 提供真实 out/ 目录，地址为 http://127.0.0.1:3010/love-universe/。服务器没有 SPA catch-all，没有 Next 运行时或 API 模拟。

Microsoft Edge / Playwright 隔离会话共 **17 项检查通过**，原始结果为本机 tests/pages-results.json（已忽略，不上传公共仓库）：

1. 首页 11 入口、子路径下 CSS/JS、头像加载。
2. 实际点击导航及前进后退。
3. 12 个子页直接访问、刷新与返回首页。
4. 新建含照片记录、固定详情 URL、直接请求和刷新返回 200。
5. 编辑与 localStorage 持久化。
6. 旧个人详情地址经 404 恢复，内容保留。
7. 本地日记摘要及采用结果。
8. 本地聊天规则演示与聊天记录刷新保留。
9. 阅读锁错误/正确密码反馈。
10. 花园浇水与每日去重。
11. 盲盒实际抽取和收藏。
12. 未来信封封存状态。
13. IndexedDB 照片与完整 JSON 备份往返恢复。
14. 地图瓦片失败切换列表。
15. 390 / 768 / 1440px 的 13 个入口无横向溢出。
16. 恢复演示确认与取消。
17. 无后端请求、无 CSS/JS/SVG 资源 404、无未捕获浏览器异常；未知路由保持 404。

已查看 tests/pages-desktop.png 与 tests/pages-mobile.png，确认现有视觉风格得到保留。

## 发布边界

GitHub Actions 工作流已配置 main/手动触发、Node 24、锁文件安装、lint、类型和数据检查、静态构建/产物检查、上传 out、依赖 build 的 deploy、pages:write / id-token:write、github-pages environment 和发布 URL 输出。

只有用户实际推送仓库、在 Settings → Pages 选择 GitHub Actions 并成功执行 deploy 后，才能确认公网发布成功。默认目标格式为 https://YOUR_NAME.github.io/love-universe/，目前没有真实发布 URL。

AI、密码阅读锁、未来开启为明确的本地演示；不提供安全保密、真实模型调用或云同步。私密数据不应写入源码/public。更换域名后需手动导出/导入备份迁移浏览器数据。
