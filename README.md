# Elemental Journey

> 
> A mage, four elements, three regions. A pixel puzzle game that runs in the browser.

**Demo ·** shturl.cc/gwdZ5HMS6OTOacaF6azgDpB63Mn5MdorgEc8KAepB95yf4BEAWjNmh
**Prototype build ·** `Elemental-Journey-Web/dist` (playable forest level)
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

表格

| Action | Keys |
| --- | --- |
| Move | <kbd>A</kbd> <kbd>D</kbd> or <kbd>←</kbd> <kbd>→</kbd> |
| Jump | <kbd>Space</kbd> |
| Cast forward | <kbd>E</kbd> (some reactions need it held down) |
| Switch element | <kbd>1</kbd> <kbd>2</kbd> (two-element version in the current prototype) |
| Restart the section | the Restart button at the top left |

表格

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

表格

| Level | Its own mechanic | Status |
| --- | --- | --- |
| Forest | Vines grow and join into a bridge | **Playable** (current prototype) |
| Tundra | Fire melts ice pillars; the fall direction decides bridge or dead end | In design |
| Volcano | Water makes stone, steam lifts, sand plugs vents, fire burns ropes | In design |

## Team collaboration

In VS Code, choose `Git: Clone`, paste `https://github.com/sd5913/No-Idea-project.git`, pick a local folder, and switch to your own branch before editing. Commit in Source Control, then Push / Sync to your branch — do not push directly to `main`. Open a Pull Request against `main` on GitHub and merge it after review.

The three levels are built in parallel; state in the PR which level you touched. Changes to shared parts (character movement, collision, restart, completion checks, UI) affect every level, so ask someone else to run it locally before merging.

## Code map

表格

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