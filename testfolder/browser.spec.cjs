const { join } = require('node:path');
const { readFileSync } = require('node:fs');
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
  await expect(page.locator('#playtest-settings')).toBeHidden();

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

test('从新游戏起点通过枯藤关并进入下一关', async ({ page }) => {
  await page.keyboard.down('d');
  await expect.poll(() => page.evaluate(() => player.x)).toBeGreaterThan(190);
  await page.keyboard.up('d');
  await page.keyboard.press('1');
  await page.keyboard.down('e');
  await expect.poll(() => page.evaluate(() => stage().state.burned.has('thicket'))).toBe(true);
  await page.keyboard.up('e');

  await page.keyboard.down('d');
  await expect(page.locator('#scene-title')).toHaveText('雨后的种槽');
  await page.keyboard.up('d');
  await page.keyboard.press('m');
  await expect(page.locator('#map [data-level="j01"] .map-check')).toBeVisible();
});

test.describe('窄屏触控', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('触控按钮可跳跃和长按施法，地图可选关', async ({ page }) => {
    const initialY = await page.evaluate(() => player.y);
    await page.getByRole('button', { name: '跳跃 / 攀爬' }).tap();
    await expect.poll(() => page.evaluate(() => player.y)).toBeLessThan(initialY - 15);

    await page.waitForFunction(() => player.grounded);
    await page.evaluate(() => { player.x = stage().start + 193; });
    await page.locator('[data-element="fire"]').tap();
    const button = await page.locator('#touch-cast').boundingBox();
    const input = await page.context().newCDPSession(page);
    try {
      await input.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: button.x + button.width / 2, y: button.y + button.height / 2 }],
      });
      await expect.poll(() => page.evaluate(() => stage().state.burned.has('thicket'))).toBe(true);
    } finally {
      await input.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await input.detach();
    }
    await page.locator('#map-open').tap();
    await expect(page.locator('#map .map-card')).toHaveCount(30);
    await page.locator('#map [data-level="v01"]').tap();
    await expect(page.locator('#scene-title')).toHaveText('岩浆踏石');
  });
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

test('玩家主动参与后上报，两个会话出现在看板上，退出同意后停止发送', async ({ page, browser }) => {
  const origin = 'https://game.test';
  const api = 'https://api.test';
  const { default: worker } = await import('../analytics/worker.mjs');
  const { createPlaytestDatabase } = await import('./fixtures/playtest-db.mjs');
  const { sqlite, db } = createPlaytestDatabase();
  const second = await browser.newPage();
  let eventRequests = 0;
  async function openGame(client) {
    await client.route(origin + '/**', async route => {
      const dashboard = new URL(route.request().url()).pathname === '/stats.html';
      const file = dashboard ? '../analytics/stats.html' : '../Elemental_Journey_Integrated.html';
      const html = readFileSync(join(__dirname, file), 'utf8')
        .replace('<meta name="playtest-api" content="">', `<meta name="playtest-api" content="${api}">`);
      await route.fulfill({ contentType: 'text/html', body: html });
    });
    await client.route(api + '/**', async route => {
      const request = route.request();
      if (request.method() === 'POST') eventRequests++;
      const response = await worker.fetch(new Request(request.url(), {
        method: request.method(),
        headers: await request.allHeaders(),
        body: request.postData() ?? undefined,
      }), { DB: db, SITE_ORIGIN: origin });
      await route.fulfill({
        status: response.status,
        headers: Object.fromEntries(response.headers),
        body: await response.text(),
      });
    });
    await client.goto(origin + '/');
    await client.locator('#playtest-settings summary').click();
  }

  try {
    await openGame(page);
    await openGame(second);
    await page.keyboard.press('r');
    expect(eventRequests).toBe(0);
    await page.locator('#playtest-consent').check();
    await second.locator('#playtest-consent').check();
    await expect.poll(() => sqlite.prepare('SELECT COUNT(*) AS total FROM presence').get().total).toBe(2);
    await expect.poll(() => sqlite.prepare("SELECT COUNT(*) AS total FROM events WHERE kind = 'visit'").get().total).toBe(2);
    await page.keyboard.press('m');
    await page.locator('#map [data-level="v01"]').click();
    await expect.poll(() => sqlite.prepare("SELECT COUNT(*) AS total FROM events WHERE level_id = 'v01' AND mode = 'map'").get().total).toBe(1);
    await page.locator('#playtest-consent').uncheck();
    const before = eventRequests;
    await page.keyboard.press('r');
    await expect(page.locator('#toast')).toContainText('已回到本关起点');
    expect(eventRequests).toBe(before);
    await second.goto(origin + '/stats.html');
    await expect(second.locator('#online')).toHaveText('2');
    await expect(second.locator('#visits')).toHaveText('2');
    await expect(second.locator('#levels')).toContainText('使用选关');
  } finally {
    await second.close();
    await page.unrouteAll({ behavior: 'wait' });
    sqlite.close();
  }
});
