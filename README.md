# Elemental Journey · 元素旅途

[在线试玩 / Play online via GitHub Pages](https://sd5913.github.io/No-Idea-project/) · 首次部署成功后可访问 / Available after the first successful deployment.

[中文](#中文) · [English](#english)

## 中文

《元素旅途》是一款浏览器横版元素解谜游戏。玩家扮演元素魔法使，用火、水、土、草改变地形，在丛林、冰雪和火山之间前进并取得各世界的宝物。整合版共有 30 个小关，依次是丛林 10 关、冰雪 11 关、火山 9 关。

### 开始试玩

在浏览器中直接打开 [Elemental_Journey_Integrated.html](Elemental_Journey_Integrated.html)。也可以离线试玩。从「荆棘小径」开始向右探索，取得丛林和雪山宝物后可分别进入下一个世界。拾取火山宝物后会显示本次游玩的通关数和宝物数。

| 操作 | 按键 |
| --- | --- |
| 左右移动 | <kbd>A</kbd> / <kbd>D</kbd> 或 <kbd>←</kbd> / <kbd>→</kbd> |
| 跳跃 | <kbd>Space</kbd>、<kbd>W</kbd> 或 <kbd>↑</kbd> |
| 攀爬 | 靠近攀爬藤蔓时按住 <kbd>W</kbd> 或 <kbd>↑</kbd> |
| 选元素 | <kbd>1</kbd> 火、<kbd>2</kbd> 水、<kbd>3</kbd> 土、<kbd>4</kbd> 草，或点击元素栏 |
| 快速切换 | <kbd>Q</kbd> 在最近装备的两种元素之间切换 |
| 施法 | 长按 <kbd>E</kbd> 朝角色面前施法，或在画面中按住目标位置 |
| 地图和重试 | <kbd>M</kbd> 打开关卡地图，<kbd>R</kbd> 重试本关，<kbd>H</kbd> 查看可用的关卡提示 |

触屏可使用画面下方的移动、跳跃／攀爬和施法按钮。丛林主要用地形和材料提供线索。掉落或重试会恢复当前小关的地形、机关和起点。本次游玩的通关记录和已拾取的宝物仍会保留，结局中的「从丛林重玩」会清空这些记录。关卡地图也可以直接选关，方便单独试玩。

### 元素怎么玩

| 元素组合或操作 | 可观察到的结果 |
| --- | --- |
| 种草，再对草浇水 | 从草点向前逐段长出可走的藤桥。适合架桥的岸边可长出跨河藤桥 |
| 召唤土墙，或踩上关卡自带的松土 | 松土接触角色落脚点就会塌陷 |
| 用火烧松土 | 松土变成可站立的石头 |
| 用火烧草木或枯藤 | 草木燃烧，枯藤路障可以烧开 |
| 水遇热源，或用火加热特定积水 | 产生可托起角色的蒸汽 |
| 用水冷却指定位置的岩浆 | 形成可踩踏的凝固岩浆 |

有些小关靠元素创造落脚点，有些可以靠跳跃、攀爬或等待移动平台通过。施法会播放挥杖、直线光束和命中粒子。藤桥会逐段生长，已经长出的部分可以踩踏。

## English

**Elemental Journey** is a browser-based side-scrolling puzzle game. You play an elemental mage who uses fire, water, earth, and grass to reshape the path and collect a treasure from each world. The integrated demo has 30 rooms across the Jungle (10), Ice (11), and Volcano (9) worlds, played in that order.

### Play the demo

Open [Elemental_Journey_Integrated.html](Elemental_Journey_Integrated.html) in a browser. The demo can also be played offline. Start at the bramble path and head right. Collect the Jungle and Ice treasures to continue into the next worlds. Collecting the Volcano treasure opens the results screen.

| Action | Input |
| --- | --- |
| Move left or right | <kbd>A</kbd> / <kbd>D</kbd> or <kbd>←</kbd> / <kbd>→</kbd> |
| Jump | <kbd>Space</kbd>, <kbd>W</kbd>, or <kbd>↑</kbd> |
| Climb a vine | Hold <kbd>W</kbd> or <kbd>↑</kbd> beside it |
| Select an element | <kbd>1</kbd> fire, <kbd>2</kbd> water, <kbd>3</kbd> earth, <kbd>4</kbd> grass, or click the element bar |
| Swap elements | <kbd>Q</kbd> switches between the two equipped elements |
| Cast | Hold <kbd>E</kbd> to cast ahead, or press and hold a point on the canvas |
| Map, retry, and hints | <kbd>M</kbd> opens the map, <kbd>R</kbd> retries the room, and <kbd>H</kbd> opens hints where available |

Touch controls provide movement, jumping, climbing, and casting. The Jungle uses terrain and materials as clues. Falling or retrying restores the current room and its checkpoint. Cleared-room and treasure records are kept for the current run. The replay button on the results screen clears those records. The map also lets you jump directly to a room.

### Element reactions

| Action | Result |
| --- | --- |
| Plant grass and water it | A walkable vine bridge grows forward from the plant. Suitable banks support a bridge across the gap |
| Step onto loose earth | The earth collapses on contact |
| Cast fire on loose earth | The earth hardens into stone that supports the player |
| Burn vegetation | Fire can clear dry brambles from the path |
| Apply water to a heat source, or heat a designated pool with fire | Steam lifts the player |
| Cool lava at a designated location | The lava forms a stepping stone |

Rooms combine these reactions with jumping, climbing, and moving platforms. Casting animates a wand swing, a straight beam, and a burst at the target. As a vine bridge grows, its walkable surface expands with the visible bridge.

## 项目与交付 · Project and delivery

- **适合谁 / Audience.** 面向喜欢观察场景、尝试元素组合的休闲解谜玩家。玩家可以从第一关开始学习，也可以用地图直接体验不同机关。 A short browser puzzle game for players who enjoy experimenting with their environment.
- **运行 / Setup.** 使用支持 Canvas 2D 的现代桌面或移动浏览器。下载整合版 HTML 后可直接打开。核心玩法可离线运行，进度只保留在当前页面。移动端提供触控按钮，自动化当前使用 Chromium。
- **协作与验证 / Team and verification.** [每周进度与协作记录 / Weekly progress and planning](docs/progress.md) · [工程规范 / Contributing](CONTRIBUTING.md) · [测试说明 / Tests](testfolder/README.md) · [致谢与来源 / Credits](docs/credits.md)。
- **发布与统计 / Deployment and analytics.** [GitHub Actions](https://github.com/sd5913/No-Idea-project/actions) · [发布、试玩统计和配置 / Deployment and analytics setup](docs/deployment.md)。
