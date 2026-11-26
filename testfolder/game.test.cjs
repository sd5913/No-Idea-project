const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const { createContext, Script, runInContext } = require('node:vm');

const html = readFileSync(join(__dirname, '../Elemental_Journey_Integrated.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, '整合版应包含内嵌游戏脚本');
const canvasSetup = script.indexOf("const canvas = document.querySelector('#game');");
assert.ok(canvasSetup > 0, '整合版应在模拟逻辑后初始化画布');
const simulation = new Script(script.slice(0, canvasSetup), {
  filename: 'Elemental_Journey_Integrated.html (simulation)',
});

function newGame() {
  const context = createContext({ assert });
  simulation.runInContext(context);
  runInContext(`
    function enter(id) {
      const index = levels.findIndex(level => level.id === id);
      assert.ok(index >= 0, '找不到测试关卡 ' + id);
      placePlayer(index);
      return stage();
    }

    function ticks(count) {
      for (let tick = 0; tick < count; tick++) advance(STEP);
    }

    function cast(element, count, point = null) {
      arm(element);
      assert.ok(startCast(point), '应开始施法');
      ticks(count);
      stopCast();
    }
  `, context);
  return code => runInContext(code, context);
}

test('地图数据包含三世界共 30 关，编号、ID 和世界坐标一致', () => {
  newGame()(`
    assert.equal(levels.length, 30);
    assert.equal(new Set(levels.map(s => s.id)).size, 30);
    assert.equal(levels[0].start, 0);
    for (const [world, count] of [['jungle', 10], ['ice', 11], ['fire', 9]]) {
      const rooms = levels.filter(s => s.world === world);
      assert.equal(rooms.length, count);
      rooms.forEach((s, i) => assert.equal(s.number, i + 1));
    }
    levels.forEach((s, i) => {
      assert.equal(s.index, i);
      assert.ok(s.title && s.width > 0, s.id);
      assert.equal(s.end - s.start, s.width, s.id);
      if (i > 0) assert.equal(s.start, levels[i - 1].end, s.id);
    });
  `);
});

test('提前松开施法键会停止燃烧进度，完成后解除枯藤碰撞', () => {
  newGame()(`
    const s = enter('j01');
    player.x = s.start + 193;
    const hasBramble = () => collisionSurfaces(s).some(item => item.thorns);
    assert.ok(hasBramble());
    cast('fire', 36);
    const progress = reaction(s, 'thicket', 'fire');
    assert.ok(progress > 0 && progress < 1);
    ticks(150);
    assert.equal(reaction(s, 'thicket', 'fire'), progress);
    assert.ok(hasBramble());
    assert.equal(s.state.burned.has('thicket'), false);
    cast('fire', 140);
    assert.ok(s.state.burned.has('thicket'));
    assert.equal(hasBramble(), false);
    keys.add('d');
    ticks(100);
    assert.ok(player.x - s.start > 370);
  `);
});

test('草加水生成逐渐延伸的藤桥，玩家能落到桥面', () => {
  newGame()(`
    const s = enter('j05');
    player.x = s.start + 150;
    cast('grass', 90, { x: s.start + 222, y: FLOOR });
    assert.equal(s.state.plants.size, 1);
    cast('water', 96);
    const bridge = () => collisionSurfaces(s).find(item => item.kind === 'vineBridge');
    const growing = bridge();
    assert.ok(growing && growing.w > 0);
    const [left, right] = s.vineBank;
    assert.ok(growing.x + growing.w < right);
    ticks(180);
    const grown = bridge();
    assert.ok(grown.w > growing.w);
    assert.ok(grown.x <= left && grown.x + grown.w >= right);
    Object.assign(player, { x: s.start + (left + right) / 2, y: FLOOR - 28, grounded: false });
    ticks(50);
    assert.equal(player.support, grown.id);
    assert.ok(player.grounded);
  `);
});

test('水冷却岩浆形成可站立的踏石', () => {
  newGame()(`
    const s = enter('v01');
    player.x = s.start + 225;
    const stone = () => collisionSurfaces(s).find(item => item.kind === 'magmaStone');
    assert.equal(stone(), undefined);
    cast('water', 85);
    const formed = stone();
    assert.ok(formed);
    assert.ok(formed.x > s.pit[0] && formed.x + formed.w < s.pit[1]);
    Object.assign(player, { x: s.start + formed.x + formed.w / 2,
      y: formed.y - 25, grounded: false });
    ticks(50);
    assert.equal(player.support, formed.id);
    assert.ok(player.grounded);
  `);
});

test('落入岩浆会重置当前位置和踏石，并保留本局记录', () => {
  newGame()(`
    const s = enter('v01');
    const checkpoint = player.x;
    cleared.add(0);
    treasures.add('jungle');
    player.x = s.start + 225;
    cast('water', 85);
    assert.ok(s.state.surfaces.has('first-stone'));
    Object.assign(player, { x: s.start + 500, y: FLOOR, grounded: false });
    ticks(60);
    assert.ok(checkpointDelay > 0, '落入岩浆后应进入重生等待');
    ticks(120);
    assert.equal(stage(), s);
    assert.equal(player.x, checkpoint);
    assert.equal(player.y, FLOOR);
    assert.equal(s.state.surfaces.has('first-stone'), false);
    assert.equal([...cleared].join(','), '0');
    assert.equal([...treasures].join(','), 'jungle');
  `);
});

for (const [room, world, nextRoom, transition] of [
  ['j10', 'jungle', 'i01', 'snow'],
  ['i15', 'ice', 'v01', 'volcano'],
]) {
  test(`${room} 需要获得宝物才能进入下一世界`, () => {
    newGame()(`
      const s = enter(${JSON.stringify(room)});
      keys.add('d');
      player.x = s.end - 25;
      ticks(40);
      assert.equal(stage(), s);
      assert.equal(cleared.has(s.index), false);
      assert.ok(player.x <= s.end - 13);
      const gem = s.features.find(f => f.kind === 'gem');
      Object.assign(player, { x: s.start + gem.x, y: gem.y + 22, vy: 0, grounded: false });
      keys.clear();
      ticks(1);
      assert.ok(treasures.has(${JSON.stringify(world)}));
      player.x = s.end - 25;
      keys.add('d');
      ticks(40);
      assert.equal(stage().id, ${JSON.stringify(nextRoom)});
      assert.ok(cleared.has(s.index));
      assert.equal(travel?.kind, ${JSON.stringify(transition)});
    `);
  });
}
