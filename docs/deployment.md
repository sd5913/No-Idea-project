# 发布与试玩统计

## GitHub Pages

1. 在仓库 **Settings → Pages → Build and deployment** 中将 Source 设为 **GitHub Actions**。
2. 通过 PR 将代码合入 `main`。工作流先运行测试，再把整合版发布成 `index.html`，并检查线上游戏与 `stats.html` 可以下载。也可从 Actions 手动运行 `Game tests and Pages`，分支选 `main`。
3. 首次部署成功后，打开 [GitHub Pages 试玩入口](https://sd5913.github.io/No-Idea-project/) 并检查地图。也可以从本次工作流的 `github-pages` 环境打开站点。

本地打包使用 `node scripts/build-pages.mjs`，产物位于 `_site/`。发布回滚通过新的 PR 恢复上一稳定版本的相关改动，再从 `main` 运行工作流。

## 启用试玩统计

游戏在缺少统计配置时仍可离线和在线正常游玩。启用统计前，先与小组和导师确认确实需要采集这些试玩事件。

1. 在团队可管理的 Cloudflare 账户中创建 D1 数据库。复制 `analytics/wrangler.example.toml` 为 `analytics/wrangler.toml`，填入 D1 数据库名称、ID 和实际 Pages 的 origin，例如 `https://sd5913.github.io`。GitHub 项目页的仓库路径不属于 origin。
2. 使用 Wrangler 4.36 或更新的 4.x 版本，从 `analytics/` 执行以下命令。

   ```sh
   npx wrangler@4 login
   npx wrangler@4 d1 migrations apply elemental-journey-playtest --remote
   npx wrangler@4 deploy
   ```

3. 在 GitHub **Settings → Secrets and variables → Actions → Variables** 中创建 `PLAYTEST_API_URL`，值是部署后的 Worker origin。重新运行 Pages 工作流。该值会写入公开 HTML，可直接查看。Cloudflare 登录凭据和 API token 留在账户或 CI Secrets 内，仓库中仅提交示例配置。当前手动部署 Worker，Pages 工作流不需要 Cloudflare token。
4. 用两个独立浏览器打开游戏，在「试玩统计」中各自选择参与。打开看板并验证在线会话数上升。关闭其中一页后，等待 90 秒再刷新。使用地图选关后，查看对应事件是否归入「使用选关」。退出同意后，此页面的心跳和事件停止发送。

## 数据的含义和保留时间

- **在线会话**取最近 90 秒内有心跳的随机会话 ID。参与统计且页面可见时每 30 秒发送一次心跳。它表示选择参与的活跃浏览器会话。
- **参与统计会话**按最近七天的随机会话 ID 去重。每次重新打开整页会开始一个新会话。
- **路线通关率与耗时**只使用有起点记录、且没有选关事件的正常路线局。取得三件宝物并完成全部关卡后记录通关。耗时来自游戏时钟，弹窗打开或切到后台时暂停。关卡事件表按操作发生时的路线类型分组。
- **保留与访问**由 Worker 的计划任务清理。心跳记录最多保留约一天加上等到下次清理的时间，游戏事件约保留 14 天加上等到下次清理的时间。看板只返回汇总数据。数据库保存随机 ID、事件、关卡和时间，不保存姓名、邮箱、设备指纹或 IP。Cloudflare 的限流使用请求 IP 保护写入。
- **试玩样本**来自选择参与的玩家。课堂演示前可用独立环境测试，真实试玩写到正式环境。描述结果时注明参与样本和统计窗口。

## API 与测试产物

- **Release API snapshot** 在 GitHub Release 发布时或手动运行。它读取仓库的最新正式 Release，将状态码、耗时、版本号、发布时间和链接保存为 `release-api` Artifact。无正式 Release 时保留 404 记录。工作流使用 GitHub 内置的只读令牌。
- **Game tests and Pages** 的 `browser-test-evidence` Artifact 保存测试 HTML 报告与失败证据。发布互相独立于试玩统计，Worker 故障时游戏可继续运行。

参考 [GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[GitHub Releases REST API](https://docs.github.com/en/rest/releases/releases#get-the-latest-release) 和 [Cloudflare D1 迁移](https://developers.cloudflare.com/d1/reference/migrations/)。
