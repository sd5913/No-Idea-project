# Elemental Journey

<<<<<<< HEAD
[中文](#中文) · [English](#english)

## 中文

《元素旅途》是一款浏览器横版元素解谜游戏。玩家扮演元素魔法使，用火、水、土、草改变地形，在丛林、冰雪和火山之间前进并取得各世界的宝物。整合版共有 30 个小关，依次是丛林 10 关、冰雪 11 关、火山 9 关。

### 开始试玩

在浏览器中直接打开 [Elemental_Journey_Integrated.html](Elemental_Journey_Integrated.html)。整合版将页面、样式和游戏代码放在同一个 HTML 文件中，可离线运行，无需安装依赖或构建。从「荆棘小径」开始向右探索，取得丛林和雪山宝物后可分别进入下一个世界。拾取火山宝物后会显示本次游玩的通关数和宝物数。

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
| 召唤土，或踩上关卡自带的松土 | 松土接触角色落脚点就会塌陷 |
| 用火烧松土 | 松土变成可站立的石头 |
| 用火烧草木或枯藤 | 草木燃烧，枯藤路障可以烧开 |
| 水遇热源，或用火加热特定积水 | 产生可托起角色的蒸汽 |
| 用水冷却指定位置的岩浆 | 形成可踩踏的凝固岩浆 |

有些小关靠元素创造落脚点，有些可以靠跳跃、攀爬或等待移动平台通过。施法会播放挥杖、直线光束和命中粒子。谜题的结果反映在场景中，例如藤桥长到的范围会逐步进入碰撞计算。

### 文件分工

| 文件 | 职责 |
| --- | --- |
| [Elemental_Journey_Integrated.html](Elemental_Journey_Integrated.html) | 当前三世界试玩入口。内嵌 HTML 界面、CSS 样式、JavaScript 游戏逻辑和 Canvas 2D 绘制 |
| [Elemental-Journey-Web/dist/index.html](Elemental-Journey-Web/dist/index.html) | 独立的早期「林间断桥」试玩入口，加载同目录的样式和脚本 |
| [Elemental-Journey-Web/dist/style.css](Elemental-Journey-Web/dist/style.css) | 早期单关原型的页面、元素栏和弹窗样式 |
| [Elemental-Journey-Web/dist/script.js](Elemental-Journey-Web/dist/script.js) | 早期单关原型的选元素、放置材料、累计造桥、移动和通关逻辑 |
| [jungle.js](jungle.js) | 丛林独立原型的旧脚本，包含十段地图、机关步骤、碰撞和绘制。它依赖原型页面中的 DOM 元素 |
| [JUNGLE_LEVEL_DESIGN.md](JUNGLE_LEVEL_DESIGN.md) | 丛林独立原型的设计记录，文中引用的 `Jungle_Demo.html` 在当前目录中缺失 |
| [.openai/hosting.json](.openai/hosting.json) | 托管配置记录，声明静态目录为 `dist`。仓库中现有的早期网页文件位于 `Elemental-Journey-Web/dist/` |

### 整合版的逻辑框架

| 层 | 代码入口和职责 |
| --- | --- |
| 页面和输入 | HTML 提供画布、元素栏、地图和弹窗。`buildControls()` 生成元素和选关按钮。键盘及指针事件更新移动、跳跃和施法输入，弹窗打开时暂停游戏模拟 |
| 关卡数据 | `jungleLevels`、`iceLevels`、`fireLevels` 定义房间宽度、地面、缺口、机关和转场。`levels` 为房间计算连续的世界坐标。`resetLevel()` 初始化房间计时、施法进度、植物、平台和气流 |
| 元素反应 | `startCast()` 根据角色朝向或指针位置寻找可反应目标，`updateCast()` 按长按时间推进反应。反应回调改变房间状态，例如 `waterPlant()` 生长藤桥，`hardenEarth()` 将松土替换为石头 |
| 物理和进度 | `frame()` 以每秒 120 步调用 `advance()`。移动平台和临时物件会更新，`collisionSurfaces()` 汇集可碰撞地形，物理更新据此判定移动、落脚和坠落。越过房间边界进入下一小关，`collectTreasure()` 处理宝物拾取 |
| 镜头和画面 | `followCamera()` 平滑追踪角色。`paint()` 用 Canvas 2D 绘制背景、地形、角色、挥杖和元素特效。`updateHud()` 更新房间名称、装备和通关状态 |

一次浇水施法的流程是：长按 E → 选中附近草点 → 施法进度完成 → 在房间状态里创建藤桥 → 每帧画出已生长的部分，并让角色踩在这部分上。

项目源于个人 Assignment 3 的 **Pixel Nature** 元素沙盒，随后扩展为带角色、地形和通关目标的小组游戏。开发中使用生成式 AI 辅助代码、调试和文档编写。

## English

**Elemental Journey** is a browser-based side-scrolling puzzle game. You play an elemental mage who uses fire, water, earth, and grass to reshape the path and collect a treasure from each world. The integrated demo has 30 rooms across the Jungle (10), Ice (11), and Volcano (9) worlds, played in that order.

### Play the demo

Open [Elemental_Journey_Integrated.html](Elemental_Journey_Integrated.html) in a browser. The integrated demo bundles its interface, styles, and JavaScript in a single file and runs offline without installation or a build. Start at the bramble path and head right. Collect the Jungle and Ice treasures to continue into the next worlds. Collecting the Volcano treasure opens the results screen.

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

### Files and responsibilities

| File | Role |
| --- | --- |
| [Elemental_Journey_Integrated.html](Elemental_Journey_Integrated.html) | Main three-world demo with inline HTML, CSS, JavaScript, and Canvas 2D rendering |
| [Elemental-Journey-Web/dist/index.html](Elemental-Journey-Web/dist/index.html) | Entry point for the earlier standalone broken-bridge prototype |
| [Elemental-Journey-Web/dist/style.css](Elemental-Journey-Web/dist/style.css) | Interface, element bar, and dialog styles for that prototype |
| [Elemental-Journey-Web/dist/script.js](Elemental-Journey-Web/dist/script.js) | Loadout, material placement, bridge construction, movement, and win logic for that prototype |
| [jungle.js](jungle.js) | Earlier standalone Jungle script with ten rooms, mechanism steps, collision, and rendering. It depends on the prototype page's DOM |
| [JUNGLE_LEVEL_DESIGN.md](JUNGLE_LEVEL_DESIGN.md) | Design notes for the standalone Jungle prototype. The `Jungle_Demo.html` entry it references is missing from the current checkout |
| [.openai/hosting.json](.openai/hosting.json) | Hosting configuration that declares `dist` as its static directory. The earlier web prototype files are in `Elemental-Journey-Web/dist/` |

### Integrated game architecture

| Layer | Entry points and responsibilities |
| --- | --- |
| UI and input | HTML provides the canvas, element bar, map, and dialogs. `buildControls()` creates controls from game data. Keyboard and pointer handlers update input, and dialogs pause the simulation |
| Room data | `jungleLevels`, `iceLevels`, and `fireLevels` define terrain, gaps, features, and transitions. `levels` assigns continuous world coordinates. `resetLevel()` restores the room timer, casting progress, plants, surfaces, and steam columns |
| Spell reactions | `startCast()` picks a target from the player's facing direction or pointer position. `updateCast()` advances the cast while held, then runs the reaction handler. For example, `waterPlant()` grows a bridge and `hardenEarth()` replaces loose earth with stone |
| Physics and progression | `frame()` runs `advance()` at 120 fixed simulation steps per second. `collisionSurfaces()` supplies the current terrain and physical surfaces. Crossing a room boundary advances the route, and `collectTreasure()` handles pickups |
| Camera and rendering | `followCamera()` tracks the player. `paint()` draws the world, character, wand animation, and effects with Canvas 2D. `updateHud()` updates the room, loadout, and progress display |

The project grew out of **Pixel Nature**, an elemental sandbox from an individual Assignment 3, and became a team game with a player character, traversable terrain, and room objectives. Generative AI assisted with code, debugging, and documentation.
=======
> 
> A mage, four elements, three regions. A pixel puzzle game that runs in the browser.


**Prototype build ·** (file:///D:/xwechat_files/wxid_4daxdamw8xbj12_12eb/msg/file/2026-11/Elemental_Journey_Demo.html) (playable forest level)

**Repository ·** [https://github.com/sd5913/No-Idea-project](https://github.com/sd5913/No-Idea-project)

## Website introduction

You play an elemental mage sent by a village to carry out a task at the sanctuary. Three stretches of road stand in the way: a broken cliff in the forest, a wall of ice pillars on the tundra, and a lava field in the volcano. The same four things stay with you the whole way — water, fire, plant, and sand.

The game does one thing. A gap blocks the road; the player reads what is missing, places an element, watches the ground change, and walks across. One exchange lasts about three seconds: pick an element, aim, trigger the reaction, see the road become something else. There is no inventory, no skill tree, no level-select screen, and no walking back. The path only goes right.

The four elements are not four equal buttons; each has its own temperament, and that is what makes a solution possible.

- **Water** is the one that changes shape. It has no form of its own and becomes whatever it lands on: vines in the forest, nothing at all on the tundra, a stone block in the volcano. A single charge can be a key, a waste, or a bridge depending on where it lands.
- **Fire** is the one that destroys. It builds nothing, and its damage is permanent: a burnt rope is gone, a burnt plant is gone, a melted ice pillar falls. What it buys is cleared space and changed structure, at the price of never being undoable.
- **Plant** is the one that is soft. It grows out of water and can become a road, and it is also the easiest structure to burn. In a place like the volcano it does not grow at all; it is only dry kindling.
- **Sand** is the only one that does not shape terrain. It builds nothing and only plugs things: plug one lava vent and that vent goes quiet while the remaining vents erupt higher.

In the forest, water makes vines grow until they join into a bridge. On the tundra, fire melts the ice pillars blocking the way, and the direction a pillar falls decides whether it becomes a bridge or cuts off the route. In the volcano, water on lava condenses into a stone block that can be stood on, water on ground with lava veins raises steam for about three seconds, and water on plain ground vaporizes and is lost. Sand plugs a vent; fire burns a rope away for good.

## How to play



| Action | Keys |
| --- | --- |
| Move | <kbd>A</kbd> <kbd>D</kbd> or <kbd>←</kbd> <kbd>→</kbd> |
| Jump | <kbd>Space</kbd> |
| Cast forward | <kbd>E</kbd> (some reactions need it held down) |
| Switch element | <kbd>1</kbd> <kbd>2</kbd> (two-element version in the current prototype) |
| Restart the section | the Restart button at the top left |



| Element | Target | Result |
| --- | --- | --- |
| Water | Lava | One stone block that can be stood on |
| Water | Ground with lava veins | Rising steam, roughly a three-second window |
| Water | Plain ground or ice | Vaporizes; the charge is wasted |
| Water + Plant | Vines that can grow | Vines extend along their support |
| Sand | Lava vent | That vent is plugged; the others erupt higher |
| Fire | Rope, dry plants, ice pillars | Destroyed permanently |

Every combination is one for one: one water gives one stone block, or one length of vine. There is no mixing ratio.

## What's playable



| Level | Its own mechanic | Status |
| --- | --- | --- |
| Forest | Vines grow and join into a bridge | **Playable** (current prototype) |
| Tundra | Fire melts ice pillars; the fall direction decides bridge or dead end | In design |
| Volcano | Water makes stone, steam lifts, sand plugs vents, fire burns ropes | In design |

## Team collaboration

In VS Code, choose `Git: Clone`, paste `https://github.com/sd5913/No-Idea-project.git`, pick a local folder, and switch to your own branch before editing. Commit in Source Control, then Push / Sync to your branch — do not push directly to `main`. Open a Pull Request against `main` on GitHub and merge it after review.

The three levels are built in parallel; state in the PR which level you touched. Changes to shared parts (character movement, collision, restart, completion checks, UI) affect every level, so ask someone else to run it locally before merging.

## Code map



| File | Used for |
| --- | --- |
| `Elemental-Journey-Web/dist/index.html` | Page structure, control hints, loadout and completion dialogs |
| `Elemental-Journey-Web/dist/script.js` | Level data, movement and collision, element placement and reactions, build progress, restart and completion checks |
| `Elemental-Journey-Web/dist/style.css` | Palette, typography and layout of the page and pixel look |
| `README.md` | This document |

All art is drawn in code from rectangles and flat colours; there are no external bitmaps. Restyling means changing the colour constants in `script.js` and the page colours in `style.css` — no image files are involved.

## Saving and sharing

There is no save. Reloading the page, or pressing Restart, returns to the start of the current section. Progress exists only for that run: nothing is uploaded and no public link is created.

## Credits

The starting point is an individual Assignment 3 project, Pixel Nature, which used generative AI for code drafts, debugging, and documentation. This README was also prepared with AI assistance from the team's current idea and the course brief. Art is drawn in code and is placeholder-quality.
>>>>>>> cd9d10397a6cb70b74db734fc294fd5e8f452bd9
