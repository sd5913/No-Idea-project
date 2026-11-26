# 《元素旅途》自动化测试

测试目标是仓库根目录的 `Elemental_Journey_Integrated.html`。测试直接运行其中的 JavaScript，浏览器通过本地文件地址打开实际页面。无需启动服务器或构建游戏。

## 运行

在 `testfolder` 内执行以下命令。需要 Node.js 20 或更高版本及 npm。Windows PowerShell 如限制脚本执行，可将 `npm` 和 `npx` 分别写成 `npm.cmd` 和 `npx.cmd`。

```sh
npm ci
npx playwright install chromium
npm test
```

当前工作区若已有 `.playwright-browsers` 缓存，可在 `testfolder` 内运行以下 PowerShell 命令，复用已下载的 Chromium。

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $PWD '.playwright-browsers'
npm.cmd test
```

- `npm run test:logic` 仅运行游戏逻辑测试，可在安装浏览器前运行。
- `npm run test:browser` 仅运行无头 Chromium 测试。
- `npm run test:browser -- --headed` 可在浏览器窗口中观察测试过程。

## 覆盖范围

| 分组 | 用例 |
| --- | --- |
| 启动与地图 | 检查页面启动、三个世界的关卡数量、30 关数据的编号和连接，以及选关后 HUD 显示 |
| 操作与弹窗 | 检查键盘移动、跳跃、选元素、`Q` 切换，以及地图打开时暂停、关闭后恢复 |
| 施法与碰撞 | 检查提前松开时冻结施法进度、火烧枯藤移除碰撞、藤桥逐步变为可踩踏地形、岩浆踏石可站立 |
| 重试与进度 | 检查落入岩浆和按 `R` 后恢复关卡起点与机关，并保留本局通关和宝物记录 |
| 转场与结局 | 检查丛林、冰雪出口的宝物门槛，火山宝物触发结算，以及重玩清空进度 |

逻辑测试每个用例重新载入游戏的模拟逻辑，并以游戏的固定步长推进。代表关卡的碰撞、转场和结局测试会设置角色位置或预置本局进度，再运行真实游戏逻辑。这批测试查验所有 30 关的地图数据，并在代表关卡验证玩法。
