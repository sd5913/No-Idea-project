# 《元素旅途》工程规范

## 项目结构

| 路径 | 用途 |
| --- | --- |
| [Elemental_Journey_Integrated.html](Elemental_Journey_Integrated.html) | 当前三世界整合版。包含页面、样式、游戏逻辑和 Canvas 2D 绘制，可直接用浏览器打开 |
| [testfolder/](testfolder/) | 整合版的 Node.js 逻辑测试、Playwright 浏览器测试和运行说明 |
| [Elemental-Journey-Web/dist/](Elemental-Journey-Web/dist/) | 早期单关原型，有独立的 HTML、CSS 和 JavaScript |
| [jungle.js](jungle.js) 与 [JUNGLE_LEVEL_DESIGN.md](JUNGLE_LEVEL_DESIGN.md) | 早期丛林原型脚本和设计记录。设计文档引用的 `Jungle_Demo.html` 当前未收录 |

三世界玩法的改动从整合版入口验证。提交中应说明受影响的版本和关卡。

## 修改游戏

- **关卡与机关。** 在 `jungleLevels`、`iceLevels` 或 `fireLevels` 中定义地形、机关和转场，沿用现有的关卡 ID。房间内的位置使用局部坐标，角色的全局位置通过关卡的 `start` 偏移换算。新增临时机关状态时，让 `resetLevel()` 能恢复机关的初始行为。
- **输入与施法。** 键盘和指针操作沿用 `startCast()`、`updateCast()` 和 `stopCast()`。修改施法时同时验证命中、松开按键和重试，避免长按进度跨关残留。
- **物理与绘制。** 在 `advance()` 的固定步长更新中处理移动、物理和计时，通过 `collisionSurfaces()` 提供可碰撞地形。修改藤桥、移动平台等机关时，同时检查画面和实际落脚范围。
- **进度。** 区分关卡机关状态和本局通关、宝物记录。修改重试、出口或结局时，检查掉落和重试保留本局记录，以及结算页重玩清空记录。

## 测试与验收

整合版直接用浏览器打开。自动化测试需要 Node.js 20 或更高版本。在 `testfolder` 中首次运行以下命令，后续可直接运行 `npm test`。

```sh
npm ci
npx playwright install chromium
npm test
```

安装、分组运行及 Windows 命令见 [测试说明](testfolder/README.md)。

| 改动 | 验证 |
| --- | --- |
| 单关地形、机关或提示 | 从地图进入受影响关卡，走一遍预期解法，再检查重试和下一关入口 |
| 共享输入、碰撞、施法或进度 | 运行整套测试，在受影响的世界各复测一个代表关卡。涉及指针或触屏时，额外验证对应操作 |
| 界面、画布或样式 | 检查桌面和窄屏下的 HUD、地图及改动涉及的弹窗 |
| 测试依赖 | 提交依赖声明和锁文件，在重新安装依赖后运行测试 |

自动化用例以可观察的规则为断言。逻辑测试用固定步长推进状态，浏览器测试通过实际页面操作验证输入和界面。修复现有用例无法发现的回归时，为该行为补充用例。

## 分支、提交与评审

1. 从计划合入的分支创建个人分支。提交到 `main` 的改动通过个人分支和 Pull Request 评审。
2. 在 VS Code 源代码管理中检查并暂存本次改动。按实际修改编写提交说明，排除本地依赖、浏览器缓存、测试报告和个人配置。
3. 推送个人分支，在 Pull Request 中写明改动目的、影响范围和已执行的验证。有无法验证的项目时，说明原因。触及共享玩法时，请评审者复测对应的玩家操作。
4. 合并前检查可用的评审和测试结果，并确认 README 中没有合并冲突标记。

## 发布检查

发布前确认目标平台实际使用的分支、静态目录和游戏入口。`.openai/hosting.json` 中记录的目录是 `dist`，仓库中的早期原型位于 `Elemental-Journey-Web/dist/`。发布整合版时，核对平台入口是否指向三世界游戏。发布后在实际网址打开游戏，检查初始关卡和地图能否加载。
