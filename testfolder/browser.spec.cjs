const { join } = require('node:path');
const { pathToFileURL } = require('node:url');
const { test, expect } = require('@playwright/test');

const gameUrl = pathToFileURL(join(__dirname, '../Elemental_Journey_Integrated.html')).href;

test.beforeEach(async ({ page }) => {
  await page.goto(gameUrl);
  await expect(page.locator('#scene-title')).toHaveText('荆棘小径');
});

test('启动无脚本异常，地图显示 30 关并能从三个世界选关', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.reload();
  await expect(page.locator('#game')).toBeVisible();
  await expect(page.locator('#scene-title')).toHaveText('荆棘小径');

  for (const [id, region, number] of [
    ['j05', '丛林世界', '05'],
    ['i01', '冰雪世界 · 雪原', '01'],
    ['v01', '火山世界', '01'],
  ]) {
    await page.keyboard.press('m');
    const map = page.locator('#map');
    await expect(map).toBeVisible();
    await expect(map.locator('.map-card')).toHaveCount(30);
    await expect(map.locator('.jungle .map-card')).toHaveCount(10);
    await expect(map.locator('.ice .map-card')).toHaveCount(11);
    await expect(map.locator('.fire .map-card')).toHaveCount(9);
    const card = map.locator(`[data-level="${id}"]`);
    const title = await card.locator('span').nth(1).innerText();
    await card.click();
    await expect(map).toBeHidden();
    await expect(page.locator('#scene-number')).toHaveText(number);
    await expect(page.locator('#scene-region')).toHaveText(region);
    await expect(page.locator('#scene-title')).toHaveText(title);
  }
  expect(errors).toEqual([]);
});

test('真实键盘输入可移动、跳跃和切换元素，地图弹窗暂停模拟', async ({ page }) => {
  const initialX = await page.evaluate(() => player.x);
  await page.keyboard.down('d');
  await expect.poll(() => page.evaluate(() => player.x)).toBeGreaterThan(initialX + 20);
  await page.keyboard.up('d');

  const groundY = await page.evaluate(() => player.y);
  await page.keyboard.press('Space');
  await expect.poll(() => page.evaluate(() => player.y)).toBeLessThan(groundY - 20);

  const fire = page.locator('[data-element="fire"]');
  const water = page.locator('[data-element="water"]');
  await page.keyboard.press('1');
  await expect(fire).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('2');
  await expect(water).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('q');
  await expect(fire).toHaveAttribute('aria-pressed', 'true');
  await expect(water).toHaveAttribute('aria-pressed', 'false');

  await page.keyboard.press('m');
  const map = page.locator('#map');
  await expect(map).toBeVisible();
  const readTimeAndPosition = () => page.evaluate(() => ({ gameTime, x: player.x, y: player.y }));
  const before = await readTimeAndPosition();
  await page.keyboard.down('d');
  await page.evaluate(async () => {
    for (let frame = 0; frame < 8; frame++) {
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
  });
  await page.keyboard.up('d');
  expect(await readTimeAndPosition()).toEqual(before);
  await page.keyboard.press('Escape');
  await expect(map).toBeHidden();
  await expect.poll(() => page.evaluate(() => gameTime)).toBeGreaterThan(before.gameTime);
});

test('实际长按 E 烧掉枯藤，R 重试恢复机关和起点并保留本局记录', async ({ page }) => {
  const start = await page.evaluate(() => {
    const initial = player.x;
    player.x = stage().start + 193;
    cleared.add(1);
    treasures.add('jungle');
    return initial;
  });
  const thicketBurned = () => page.evaluate(() => stage().state.burned.has('thicket'));
  expect(await thicketBurned()).toBe(false);
  await page.keyboard.press('1');
  await page.keyboard.down('e');
  await expect.poll(thicketBurned).toBe(true);
  await page.keyboard.up('e');
  await page.keyboard.press('r');

  await expect(page.locator('#scene-title')).toHaveText('荆棘小径');
  expect(await thicketBurned()).toBe(false);
  expect(await page.evaluate(() => ({ x: player.x, cleared: [...cleared], treasures: [...treasures] })))
    .toEqual({ x: start, cleared: [1], treasures: ['jungle'] });
  await page.keyboard.press('m');
  await expect(page.locator('#map [data-level="j02"] .map-check')).toBeVisible();
});

test('拾取火山宝物显示结算，从丛林重玩会清空进度', async ({ page }) => {
  await page.keyboard.press('m');
  await page.locator('#map [data-level="v09"]').click();
  await page.evaluate(() => {
    const s = stage();
    const gem = s.features.find(feature => feature.kind === 'gem');
    cleared.add(0);
    treasures.add('jungle');
    treasures.add('ice');
    Object.assign(player, { x: s.start + gem.x, y: gem.y + 22, grounded: false });
  });

  await expect(page.locator('#win')).toBeVisible();
  await expect(page.locator('#win-count')).toHaveText('已获得 3 / 3 件宝物，已通过 2 / 30 关。');
  await page.locator('#win-replay').click();
  await expect(page.locator('#win')).toBeHidden();
  await expect(page.locator('#scene-title')).toHaveText('荆棘小径');
  expect(await page.evaluate(() => ({ cleared: cleared.size, treasures: treasures.size })))
    .toEqual({ cleared: 0, treasures: 0 });
  await page.keyboard.press('m');
  await expect(page.locator('#map .map-check')).toHaveCount(0);
});
