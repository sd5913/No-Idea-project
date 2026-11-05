# Elemental Journey / 元素旅途

> Group Project concept and development plan / 小组项目概念与开发计划
>
> Status: planning; this folder currently contains documentation only. The mage's village commission and journey through three regions form the current story direction. The title, detailed puzzles, and scope remain proposals for team and tutor review.
>
> 当前状态：规划阶段；本文件夹暂时只有文档。已明确元素魔法使接受村庄委托、穿越三个区域的故事方向；项目名、具体谜题与范围仍待团队及导师确认。

## 中文

### 项目简介

本项目计划在个人 Assignment 3 的 **Pixel Nature** 元素互动沙盒基础上，开发一款带故事线与 2D 地图的元素解谜小游戏。

玩家控制主角在地图上前进，在每个谜题开始前选择有限种类的元素，通过放置、组合和反应创造有用的物质，改变地形或启动机关，使角色能够继续前进。

目标用户是喜欢轻量解谜、像素艺术和组合探索的玩家。体验重点是观察环境、推理元素用途、尝试组合，并看见自己的操作如何改变道路。

### 已确定方向与待确认设计

**团队当前方向：** 从自由画板升级为通关游戏；具有故事、2D 地图、角色移动、多个小谜题，以及入关前选择元素的机制。

**建议的首版范围：** 一条包含火山、丛林、沙漠的线性路线，每区一个主谜题，并预留一个短小的环境修复谜题；包含简短村庄开场与圣地结局。优先完成三个主谜题，再根据进度加入最多三个环境谜题。目标体验时长暂定约 10–15 分钟，需通过试玩验证。每关最多携带三种元素，允许免费重选与重试。具体数量、消耗规则和地图视角需要团队与导师确认。

首版暂不安排战斗、开放世界、复杂 NPC、多人大型系统或完整物理模拟。先保证一条完整通关流程，再根据测试增加内容。

### 故事主线与地图路线

主角是一名元素魔法使，接受一个村庄的委托，前往圣地取回一件宝物。旅途中依次穿过火山、丛林与沙漠，在各地解决阻碍前进的谜题，同时用元素补全道路与环境中的缺失，最终抵达圣地。

路线：**村庄（接受委托） → 火山 → 丛林 → 沙漠 → 圣地（取得宝物） → 村庄结局画面**。

每个区域以简短文字或环境线索说明当地困境；修复后，通过道路变化、植物生长、流水和声音反馈展示成果。结尾建议用静态画面或短对话表现回村交付，避免重复走完整条地图。

**待确认的叙事细节：** 村庄为何需要宝物、宝物的名称与作用、沿途环境缺失的原因，以及主角与村庄的关系。一个可选提案是村庄需要“元素之种”恢复生机，但它尚未成为正式设定。

### 核心交互流程

1. 在 2D 地图探索，到达障碍或关卡入口。
2. 在入口准备点观察环境和目标，再选择本关携带的元素。
3. 在允许的位置放置元素，触发反应。
4. 用反应产生的物质修建路径或改变机关状态。
5. 控制角色通过障碍，解锁下一段地图与剧情。
6. 如果组合无效，可以重置关卡、重新选择元素并再次尝试。

元素选择需要有意义：环境应提供线索，材料数量或放置区域应有限制，错误选择应能恢复。通关必须由真实的地图或机关状态决定，不能仅凭选中正确按钮就自动成功。

### 三个区域与谜题提案

| 关卡 | 障碍与目标 | 元素与反应 | 通关状态 |
| --- | --- | --- | --- |
| 火山：冷却道路 | 岩浆隔断路线 | Water + Lava → Stone（新增游戏规则） | 指定区域形成连续、可行走的岩石道路 |
| 丛林：生长之桥 | 枯萎藤蔓无法连接峡谷 | Water + Plant → 沿支架生长的藤蔓 | 藤蔓连接两岸，形成可走的桥 |
| 沙漠：古老水门 | 圣地入口的水位机关缺少水源 | 放置 Stone 修补水渠，并引导 Water | 水进入目标容器，达到规定水位后开启入口 |

这些是游戏化规则，不是严格的物理或化学模拟。Lava、冷却道路、定向藤蔓生长、水渠与水位机关都需要新增开发。沙漠关强调物质的放置与流动，也可复用既有反应作为辅助解法；不要求每个谜题都生成一种新物质。

### “补全世界”的环境谜题

场景中可辨认的缺失是玩家的线索：断掉的石阶、干涸的河床、枯萎的植物或破损的水渠。玩家需要判断缺少什么，再用元素改变局部环境。

| 区域 | 短谜题示例 | 完成后的反馈 |
| --- | --- | --- |
| 火山 | 用 Stone 补齐断裂石阶 | 台阶连通，角色能到达小平台 |
| 丛林 | 为枯萎植物补充 Water | 植物生长开花，出现自然音效 |
| 沙漠 | 修补支流水渠，让 Water 流向绿洲 | 干涸水池重新蓄水，周围恢复绿色 |

主谜题负责解锁前进路线；短谜题可选做，用场景变化或一小段故事奖励探索。环境谜题优先复用主谜题机制。圣地的综合谜题作为可选扩展，只有三个区域稳定完成后才考虑加入。

### 元素选择与反馈原则

- 准备点能看见关卡线索，并允许随时重选元素或重试。
- 可用元素与场景原有材料共同构成解法；先为每关设计一条可验证的解法，再测试合理的替代解法。
- Stone 等固体只允许在指定施工区域或数量限制内放置，避免无限搭桥绕过全部谜题。
- 有效反应通过颜色、形态、短动画或音效反馈；未产生反应时给出简短提示。
- 多媒体围绕区域设计：火山的熔岩与冷却声、丛林的生长动画与自然声、沙漠的风声与流水声；提供静音控制。

### 技术与复用计划

建议先采用浏览器版本，沿用 HTML、CSS、JavaScript 与 Canvas 2D，方便团队运行和最终部署。技术方案仍可随导师反馈调整。

Pixel Nature 可提供元素颜色、网格、绘制输入和基础反应逻辑作为参考。新游戏需要增加角色、地图碰撞、关卡状态、受限放置、元素选择、重试与胜利判定。现有像素模拟需要重新验证与游戏地图的衔接，不能直接视为完整游戏系统。


### 最小可玩原型

第一阶段建议先制作丛林区域的一个房间，以复用已有 Water + Plant 反应：主角能移动；峡谷阻挡前进；玩家选择 Water 与 Plant，在指定区域触发藤蔓生长；桥出现并改变碰撞状态；主角走到出口后显示完成提示。包含关卡重置，以便重复演示。原型制作顺序不等于最终故事顺序，最终仍按火山、丛林、沙漠前进。

### 工作模块与责任分配

| 模块 | 交付内容 | 负责人 |
| --- | --- | --- |
| 角色与地图 | 移动、碰撞、地图/房间切换 | 待团队分配 |
| 元素与反应 | 入关选择、放置限制、反应状态 | 待团队分配 |
| 谜题与剧情 | 关卡布局、机关条件、故事文本 | 待团队分配 |
| 视觉与声音 | 角色、地形、动画、音效、静音控制 | 待团队分配 |
| 集成与测试 | 整合版本、测试记录、部署、文档 | 待团队分配 |

每项任务应有明确负责人和验收条件。通过小步提交、相互 review 和交叉测试体现协作；所有成员都应对可运行成果作出贡献。

### 每周交付

| 日期（2026） | 课程交付重点 | 建议可展示成果 |
| --- | --- | --- |
| 11 月 5 日 | First working interaction | 单房间解谜原型；实际进度如实记录 |
| 11 月 12 日 | Integrated core experience | 移动、选元素、反应、通关、重试完整串联 |
| 11 月 19 日 | Playtest and feedback | 找他人测试，记录问题并完成针对性改进 |
| 11 月 26 日 | Delivery candidate | 三关可完成，部署与运行说明可用 |
| 12 月 3 日 | Final tutor delivery review | 最终演示、遗留问题与修复计划 |
| 12 月 6 日 23:59 HKT | 最终 Canvas 提交 | 提交可访问的 sd5913 组织仓库链接 |

每周记录：目标、负责人、完成内容、测试证据、导师反馈、阻碍及下一步。实际 tutorial 时间由导师确认。



### 测试与验收

每关都应可从开始走到出口；错误组合可重试；角色不会穿墙或永久卡住；反应反馈明确；元素选择限制有效；重置可恢复地形、材料和角色位置。邀请团队外的人测试，记录是否理解目标、选材与操作，是否发现替代解法，并据此调整关卡。

### 来源与 AI 使用

项目起点为个人 Assignment 3：Pixel Nature。该原型曾使用生成式 AI 协助代码草拟、调试与文档。本 README 由 AI 根据团队当前想法及课程要求协助整理；故事、关卡与范围中的建议尚待确认。后续应分别记录实际复用代码、团队新增工作、素材许可及 AI 使用方式。

---

## English

### Overview

Elemental Journey is a proposed 2D puzzle adventure developed from the individual Assignment 3 project, **Pixel Nature**. Players travel through a map, choose a limited set of elements before each puzzle, and combine them to create materials that change terrain or activate mechanisms.

The intended audience is players who enjoy short puzzles, pixel art, and experimentation. The experience centres on reading the environment, choosing materials, trying reactions, and seeing how those actions create a route forward.

### Agreed direction and proposed scope

The current team idea includes a story, a 2D map, character movement, several small puzzles, and element selection before entering each challenge.

The proposed first release follows a linear route through a volcano, a jungle, and a desert, with one main puzzle per region, a short village introduction, and a sanctuary ending. Complete these three puzzles first, then add up to one short environmental restoration puzzle per region if time permits. The provisional playtime target is 10–15 minutes, subject to playtesting. Players could carry up to three element types and freely retry or change their selection. These limits, material consumption, and the camera perspective remain subject to team and tutor review.

Combat, an open world, complex NPCs, multiplayer systems, and full physics simulation are outside the initial scope. Additional content should follow a complete, tested playthrough.

### Story and map route

The protagonist is an elemental mage commissioned by a village to retrieve a treasure from a sanctuary. The journey passes through a volcano, a jungle, and a desert. In each region, the mage solves obstacles and uses elements to restore missing parts of the environment before continuing towards the sanctuary.

Route: **Village (accept the commission) → Volcano → Jungle → Desert → Sanctuary (retrieve the treasure) → Village ending scene**.

Brief text and environmental clues introduce each area's problem. Changes to paths, vegetation, water, and sound communicate restoration. A still image or short dialogue can show the return to the village without requiring a full return journey.

**Narrative details to agree:** why the village needs the treasure, its name and purpose, why parts of the environment are missing, and the mage's relationship with the village. A possible “Elemental Seed” that restores the village's vitality is an optional suggestion, not an established story detail.

### Core interaction

1. Explore the 2D map and reach an obstacle.
2. Inspect the environment and goal from an entrance preparation point, then choose elements for the puzzle.
3. Place materials in permitted locations and trigger reactions.
4. Use the resulting materials to build a route or change a mechanism.
5. Move the character through the obstacle to unlock the next area and story beat.
6. Reset and change the selection when an attempt does not work.

Environmental clues should support meaningful choices. Placement areas or quantities should be limited, and mistakes should be recoverable. Success must depend on the resulting terrain or mechanism state, rather than simply choosing the correct button.

### Proposed regions and puzzles

| Puzzle | Obstacle | Reaction | Completion condition |
| --- | --- | --- | --- |
| Volcano: Cooling the Path | Lava blocks the route | Water + Lava → Stone (new game rule) | A continuous walkable stone path forms in the designated area |
| Jungle: Growing a Bridge | Withered vines cannot cross a ravine | Water + Plant → vines growing along supports | Vines connect both sides and become walkable |
| Desert: Ancient Water Gate | A water-level mechanism lacks a supply | Place Stone to repair a channel and direct Water | Water reaches the target container and opens the entrance at the required level |

These are game rules rather than accurate physical or chemical simulations. Lava, cooling paths, directed vine growth, channels, and water-level mechanisms require new implementation. The desert puzzle emphasises placement and flow; existing reactions may support alternative solutions. Not every puzzle needs to create a new substance.

### Restoring missing parts of the world

Visible gaps provide clues: broken steps, dry riverbeds, withered plants, or damaged channels. Players identify what is missing and use elements to change the local environment.

| Region | Short puzzle example | Completion feedback |
| --- | --- | --- |
| Volcano | Use Stone to repair broken steps | The connected steps allow access to a small platform |
| Jungle | Supply Water to a withered plant | The plant grows and flowers, accompanied by natural sounds |
| Desert | Repair a branch channel and direct Water to an oasis | A dry pool fills and nearby vegetation becomes green |

Main puzzles unlock the route. Short environmental puzzles can be optional, rewarding exploration with scenery changes or a small story detail. They should reuse the main puzzle mechanics. A combined sanctuary puzzle is an optional extension to consider only after all three regions work reliably.

### Element selection and feedback principles

- Preparation points reveal environmental clues and allow reselection or retry.
- Available elements and existing scene materials form the solution together. Establish one verifiable solution per puzzle before testing plausible alternatives.
- Restrict solid placement to construction zones or limited quantities so players cannot bypass every puzzle by building unlimited bridges.
- Communicate reactions through colour, shape, short animations, or sound; provide brief feedback when a combination has no effect.
- Match multimedia to each region: lava and cooling sounds in the volcano, growth animations and natural sounds in the jungle, and wind and flowing water in the desert. Include mute controls.

### Technology and reuse

A browser-based game using HTML, CSS, JavaScript, and Canvas 2D is the proposed starting point for accessible development and deployment. The team may adapt this after tutor feedback.

Pixel Nature provides reference material for colours, grids, drawing input, and basic reactions. The game needs new character control, map collision, puzzle states, restricted placement, element selection, reset, and victory checks. Integrating the pixel simulation with game terrain requires further validation.

### First playable prototype

Start with one jungle room to reuse the existing Water + Plant reaction. Include character movement and a blocking ravine. The player selects Water and Plant, triggers vine growth in a designated area, and creates a bridge that changes collision behaviour. Reaching the exit displays completion feedback. Include reset for repeatable demonstrations. Prototype development order differs from the final story order, which remains volcano, jungle, then desert.

### Work allocation

| Module | Deliverables | Owner |
| --- | --- | --- |
| Character and map | Movement, collision, room transitions | To be assigned |
| Elements and reactions | Selection, placement limits, reaction states | To be assigned |
| Puzzles and narrative | Layouts, mechanism conditions, story text | To be assigned |
| Visuals and audio | Character, terrain, animation, effects, mute control | To be assigned |
| Integration and testing | Integrated builds, test records, deployment, documentation | To be assigned |

Each task needs an owner and acceptance criteria. Use small commits, peer review, and cross-testing to show collaboration. Every member should contribute to the usable result.

### Weekly deliveries

| Date in 2026 | Course focus | Proposed demonstrable result |
| --- | --- | --- |
| 5 November | First working interaction | One-room prototype; record actual progress honestly |
| 12 November | Integrated core experience | Movement, selection, reactions, completion, and reset connected |
| 19 November | Playtest and feedback | External playtest evidence and resulting improvements |
| 26 November | Delivery candidate | Three completable puzzles, deployment, and running instructions |
| 3 December | Final tutor delivery review | Final demonstration, remaining issues, and fixes |
| 6 December, 23:59 HKT | Final Canvas submission | Accessible sd5913-owned repository URL |

Record goals, owners, completed work, test evidence, tutor feedback, blockers, and next steps each week. The tutor confirms the exact tutorial meeting time.
https://github.com/sd5913/No-Idea-project.git

### Testing and acceptance

Every puzzle should be completable from entry to exit. Invalid combinations must allow retry; the character must not pass through walls or become permanently trapped. Reactions need clear feedback, selection limits must work, and reset must restore terrain, materials, and character position. Test with someone outside the team and record their understanding of the goal, material selection, controls, and any alternative solutions. Use these observations to revise the puzzles.

### Credits and AI use

The starting point is the individual Assignment 3 project, Pixel Nature, which used generative AI assistance for code drafts, debugging, and documentation. This README was prepared with AI assistance from the team's current idea and supplied course brief. Story, puzzle, and scope suggestions remain proposals. Future records should identify reused code, new team work, asset licences, and actual AI use separately.
