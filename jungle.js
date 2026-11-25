'use strict';
const $ = id => document.getElementById(id);
const canvas = $('game');
const ctx = canvas.getContext('2d');
const WIDTH = canvas.width;
const SPAN = 680;
const GROUND = 420;
const RADIUS = 9;
const SPEED = 215;
const GRAVITY = 1060;
const JUMP = 448;
const elements = {
  fire: { name: '火', key: '1', color: '#ff9c67' },
  water: { name: '水', key: '2', color: '#83def5' },
  earth: { name: '土', key: '3', color: '#efd098' },
  grass: { name: '草', key: '4', color: '#ade889' }
};

const room = (title, goal, layout, ...actions) => ({ title, goal, layout, actions });
const action = (x, y, asset, element, effect, clue, result) =>
  ({ x, y, asset, element, effect, clue, result });
const rooms = [
  room('荆棘小径', '清理枯藤，继续向右。', 'flat',
    action(230, 420, '枯藤', 'fire', 'burn', '干枯的纤维一碰就碎，试试火。', '枯藤烧尽，道路打开了。')),
  room('雨后的种槽', '让溪边湿润的种槽长出藤桥。', 'gap',
    action(206, 420, '湿种槽', 'grass', 'bridge', '种槽已经湿润，用草唤醒种子。', '种子借着雨水长成了桥。')),
  room('断根斜坡', '补上树根间缺失的台阶。', 'high',
    action(194, 420, '空土槽', 'earth', 'steps', '凹槽能托住泥土，用土补出两级台阶。', '土台成形，沿标记跳上树根。')),
  room('古树热泉', '利用热泉到达上层石台。', 'high',
    action(204, 420, '热石', 'water', 'steam', '热石还在发光，加水会产生蒸汽。', '水化作蒸汽，走进气流，升高后向右。')),
  room('悬崖花架', '让植物沿枯桥的支架伸展。', 'gap',
    action(211, 420, '空花槽', 'grass', 'bud', '这里有生根的位置，用草种下藤芽。', '藤芽已经生根，用水让它继续伸展。'),
    action(211, 420, '藤芽', 'water', 'bridge', '藤芽下的土还很干，需要水。', '藤蔓搭到了对岸，沿着桥走过去。')),
  room('石匠遗台', '烧结松土，做出稳固踏板。', 'high',
    action(197, 420, '空模具', 'earth', 'clay', '石板模具是空的，先用土填满。', '松土已填入模具，用火让它坚固。'),
    action(197, 420, '松土', 'fire', 'steps', '用火烧结模具里的土。', '石踏板就位，跳上高台。')),
  room('藤后溪口', '找出枯藤后还能生长的植物。', 'gap',
    action(146, 420, '枯藤', 'fire', 'burn', '烧掉这簇枯藤，看看它挡住了什么。', '枯藤退去，河边露出一株活藤。'),
    action(212, 420, '活藤', 'water', 'bridge', '活藤有绿叶，加水能让它蔓延。', '活藤长成了溪上的桥。')),
  room('积水石窟', '先垫高站位，再利用洞底蒸汽。', 'high',
    action(200, 420, '松土', 'fire', 'ledge', '火能把洞边已有的松土烧成石台。', '石台成形，跳上石台靠近积水。'),
    action(301, 365, '浅水盘', 'fire', 'steam', '浅水盘里已有水，用火加热。', '水化成持续上升的蒸汽。')),
  room('高枝渡口', '用石台接近高处的藤芽。', 'gap',
    action(204, 420, '空模具', 'earth', 'clay', '先用土填满岸边的模具。', '松土就位，等待烧结。'),
    action(204, 420, '松土', 'fire', 'perch', '烧结松土，做成岸边的石台。', '跳上石台，从高处给活藤浇水。'),
    action(247, 346, '高处活藤', 'water', 'bridge', '站在烧结的石台上，用水让活藤蔓延。', '藤桥与石台接上了，可以过河。')),
  room('古树山门', '修复上层水道，走过山门。', 'final',
    action(145, 420, '枯藤', 'fire', 'burn', '清除覆盖泉池的枯藤。', '枯藤下面是一泓浅水。'),
    action(210, 420, '泉池', 'fire', 'steam', '泉池已有水，用火产生蒸汽。', '乘上蒸汽，去上层寻找活藤。'),
    action(390, 270, '水道活藤', 'water', 'spring', '活藤横在水渠边，浇水让它连上另一端。', '泉水重新流动，山门已开启。'))
];

let states, index, player, camera, active, finished, jumpBuffer, coyote, flash, clock = 0;
const keys = new Set();
const heldPointers = new Map();
const localX = () => player.x - index * SPAN;
const current = () => rooms[index].actions[states[index].step];
const say = message => { $('status').textContent = message; };

function platformList(i) {
  const { layout } = rooms[i];
  const { effects } = states[i];
  if (layout === 'flat') return [[0, GROUND, SPAN, 'land']];
  const gap = layout === 'gap';
  const final = layout === 'final';
  const surfaces = [[0, GROUND, 240, 'land'], [final ? 570 : 500, GROUND, final ? 110 : 180, 'land']];
  if (!gap) surfaces.push([337, 270, final ? 110 : 181, 'stone']);
  if (effects.has('steps')) surfaces.push([230, 362, 102, i === 2 ? 'soil' : 'stone'], [301, 313, 92, i === 2 ? 'soil' : 'stone']);
  if (effects.has('ledge')) surfaces.push([225, 365, 105, 'stone']);
  if (effects.has('perch')) surfaces.push([194, 346, 101, 'stone']);
  if (effects.has('bridge')) surfaces.push(i === 8 ? [252, 346, 270, 'vine'] : [236, GROUND, 268, 'vine']);
  if (effects.has('spring')) surfaces.push([442, 270, 141, 'vine']);
  return surfaces;
}

function barriers(i) {
  const stage = rooms[i];
  const { step, effects } = states[i];
  const walls = [];
  const first = stage.actions[0];
  if (first.effect === 'burn' && !effects.has('burn')) walls.push(first.x + 14);
  if (step < stage.actions.length) walls.push(632);
  return walls;
}

function inRange(target) {
  return target && Math.abs(localX() - target.x) <= 68
    && Math.abs(player.y - target.y) <= 42 && player.grounded;
}

function select(id, refocus = true) {
  active = id;
  for (const button of $('elements').children) button.setAttribute('aria-pressed', button.dataset.element === id);
  if (refocus) canvas.focus();
}

function updateHUD() {
  const stage = rooms[index];
  const target = current();
  $('title').textContent = stage.title;
  $('count').textContent = (index + 1) + ' / ' + rooms.length;
  $('goal').textContent = target ? stage.goal + ' 当前机关：' + target.asset + '。' : '机关已解开，沿路向右。';
  $('progress').value = states.filter(({ step }, i) => step === rooms[i].actions.length).length;
}

function cast() {
  if (finished) return;
  const target = current();
  if (!target) return say('这段机关已完成，沿路向右。');
  if (!inRange(target)) return say('靠近「' + target.asset + '」，在同一层站稳后施法。');
  if (target.element !== active) return say('「' + target.asset + '」没有反应。' + target.clue);
  states[index].effects.add(target.effect);
  states[index].step++;
  flash = { x: target.x + index * SPAN, y: target.y - 20, color: elements[active].color, time: .65 };
  updateHUD();
  say(target.result);
}

function clearInput() {
  keys.clear();
  heldPointers.clear();
  jumpBuffer = 0;
}
function respawn() {
  player = { x: index * SPAN + 48, y: GROUND, vy: 0, grounded: true, facing: 1 };
  camera = cameraTarget();
  flash = null;
  clearInput();
  coyote = 0;
}
function restart() {
  if ($('win').open) $('win').close();
  states = rooms.map(() => ({ step: 0, effects: new Set() }));
  index = 0;
  finished = false;
  respawn();
  select('fire');
  updateHUD();
  say('沿路向右，到高亮机关旁按 E。');
}
function retry() {
  if (finished) return restart();
  states[index] = { step: 0, effects: new Set() };
  respawn();
  updateHUD();
  say('已重试本关。' + current().clue);
  canvas.focus();
}

function cameraTarget() {
  return Math.max(0, Math.min(rooms.length * SPAN - WIDTH, player.x - 302));
}

function update(dt) {
  if (finished) return;
  const oldX = player.x, oldY = player.y;
  const start = index * SPAN;
  const axis = Number(keys.has('right') || [...heldPointers.values()].includes('right'))
    - Number(keys.has('left') || [...heldPointers.values()].includes('left'));
  if (axis) player.facing = axis;
  let next = Math.max(start + RADIUS, Math.min(rooms.length * SPAN - RADIUS, oldX + axis * SPEED * dt));
  for (const offset of barriers(index)) {
    const wall = start + offset;
    if (oldX <= wall - RADIUS && next > wall - RADIUS) next = wall - RADIUS;
  }
  player.x = next;
  jumpBuffer -= dt;
  coyote = player.grounded ? .1 : coyote - dt;
  if (jumpBuffer > 0 && coyote > 0) {
    player.vy = -JUMP;
    player.grounded = false;
    jumpBuffer = coyote = 0;
  }

  const effects = states[index].effects;
  const ventLeft = index === 7 ? 274 : 218;
  const lift = effects.has('steam') && localX() >= ventLeft && localX() <= 353 && oldY > 246 && oldY < 470;
  player.vy = lift ? Math.min(player.vy, -255) : player.vy + GRAVITY * dt;
  player.y += player.vy * dt;
  player.grounded = false;
  if (player.vy >= 0) {
    let landing = Infinity;
    for (let i = index; i <= Math.min(index + 1, rooms.length - 1); i++) {
      for (const [x, y, width] of platformList(i)) {
        const relativeX = player.x - i * SPAN;
        if (relativeX >= x - 5 && relativeX <= x + width + 5 && oldY <= y && player.y >= y) landing = Math.min(y, landing);
      }
    }
    if (landing < Infinity) {
      player.y = landing;
      player.vy = 0;
      player.grounded = true;
    }
  }
  if (player.y > 565) {
    respawn();
    return say('回到本关入口，已完成的反应保留。');
  }
  if (!current() && localX() >= SPAN && index < rooms.length - 1) {
    index++;
    updateHUD();
    say(current().clue);
  }
  if (index === rooms.length - 1 && !current() && localX() >= 647 && player.grounded) {
    finished = true;
    clearInput();
    $('win').showModal();
  }
  if (flash) flash.time -= dt;
  camera += (cameraTarget() - camera) * Math.min(1, dt * 7);
}

function box(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}
function label(text, x, y, color = '#e1eac7', size = 14) {
  ctx.font = size + 'px system-ui, Microsoft YaHei, sans-serif';
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}
function drawForest() {
  const sky = ctx.createLinearGradient(0, 0, 0, 510);
  sky.addColorStop(0, '#284d3e');
  sky.addColorStop(.67, '#143129');
  sky.addColorStop(1, '#10241f');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, 510);
  for (const [depth, spacing, color] of [[.20, 115, '#345744'], [.44, 175, '#284637']]) {
    const origin = Math.floor(camera * depth / spacing);
    for (let i = origin - 1; i <= origin + WIDTH / spacing + 2; i++) {
      const x = i * spacing - camera * depth, y = 38 + ((i * i * 17) % 90);
      box(x, y, 24 + i % 3 * 8, 350, color);
      box(x - 47, y, 138, 32, color);
      box(x - 24, y - 15, 94, 18, color);
      box(x + 10, y + 115, 42, 8, color);
    }
  }
  box(0, 470, WIDTH, 40, '#193c38');
  for (let x = -(camera % 67); x < WIDTH; x += 67) box(x, 479, 24, 2, '#477870');
}

const surfaceColors = {
  land: ['#4a3d2e', '#93ac63'], stone: ['#646460', '#bdb79c'],
  soil: ['#78583c', '#cfab76'], vine: ['#467048', '#a5d879']
};

function drawMaterial(target, x, y, color) {
  const name = target.asset;
  if (name === '枯藤') return;
  if (name.includes('活藤') || name === '藤芽') {
    box(x - 2, y - 27, 4, 27, '#76ac57');
    box(x - 13, y - 22, 13, 6, '#aadd86');
    box(x + 2, y - 29, 14, 6, '#aadd86');
    return;
  }
  if (name === '热石' || name === '松土') {
    box(x - 16, y - 10, 32, 10, '#846547');
    box(x - 10, y - 18, 21, 9, name === '热石' ? '#df8754' : '#b48a56');
    return;
  }
  box(x - 17, y - 12, 34, 12, '#7e725b');
  box(x - 13, y - 12, 26, 4, '#443f33');
  if (name.includes('水') || name === '泉池' || name === '湿种槽') {
    box(x - 12, y - 10, 24, 4, '#69b9c7');
  } else {
    box(x - 15, y - 13, 4, 3, color);
    box(x + 11, y - 13, 4, 3, color);
  }
}

function drawSection(i) {
  const offset = i * SPAN - camera;
  const stage = rooms[i];
  const state = states[i];
  const target = stage.actions[state.step];
  label(String(i + 1).padStart(2, '0') + ' · ' + stage.title, offset + 28, 64, '#d8e5ae', 18);
  for (const [x, y, width, kind] of platformList(i)) {
    const [body, edge] = surfaceColors[kind];
    box(offset + x, y, width, kind === 'land' ? 90 : 14, body);
    box(offset + x, y, width, 5, edge);
    for (let j = 12; j < width - 6; j += 22) {
      box(offset + x + j, y - (kind === 'vine' ? 6 : 0), 5, 8, edge);
    }
  }

  if (state.effects.has('steam')) {
    const left = i === 7 ? 274 : 218;
    for (let j = 0; j < 15; j++) {
      const dx = (j * 27) % (350 - left);
      const y = 416 - ((clock * .13 + j * 31) % 169);
      ctx.globalAlpha = .25 + (j % 3) * .13;
      box(offset + left + dx, y, 6, 10, '#d9f0df');
    }
    ctx.globalAlpha = 1;
    label('↑ 蒸汽上升', offset + left + 9, 227, '#ddf7ee');
  }
  if (state.effects.has('spring')) {
    for (let j = 0; j < 12; j++) {
      const dx = (clock * .07 + j * 14) % 146;
      box(offset + 432 + dx, 262, 9, 3, '#9beaec');
    }
  }

  for (const wall of barriers(i)) {
    if (wall === 632) {
      box(offset + wall - 6, 338, 12, 82, '#777664');
      box(offset + wall - 9, 340, 18, 8, '#b5a985');
      label('机关未完成', offset + wall - 44, 325, '#f4d59b', 12);
      continue;
    }
    for (let j = -2; j <= 2; j++) {
      box(offset + wall + j * 7, 353 + Math.abs(j) * 9, 6, 67 - Math.abs(j) * 9, '#876647');
      box(offset + wall + j * 7 - 5, 364 + Math.abs(j) * 9, 15, 4, '#c39864');
    }
  }

  if (target) {
    const x = offset + target.x, y = target.y;
    const color = elements[target.element].color;
    drawMaterial(target, x, y, color);
  }
  if (target && i === index) {
    const x = offset + target.x, y = target.y;
    const color = elements[target.element].color;
    const ready = inRange(target);
    box(x - 2, y - 38 - Math.sin(clock / 180) * 3, 4, 8, color);
    const caption = target.asset + (ready ? ' · ' + elements[target.element].key + ' ' + elements[target.element].name + ' · E 施法' : ' · 靠近');
    ctx.font = '14px system-ui, Microsoft YaHei, sans-serif';
    const w = ctx.measureText(caption).width + 20;
    box(x - w / 2, y - 80, w, 26, '#182b22');
    label(caption, x - w / 2 + 10, y - 62, color);
  }
  if (!target) label(i === rooms.length - 1 ? '山门出口 →' : '继续向右 →', offset + 555, 385, '#f4db94');
}

function draw() {
  drawForest();
  const first = Math.floor(camera / SPAN);
  const last = Math.min(rooms.length - 1, Math.floor((camera + WIDTH) / SPAN));
  for (let i = first; i <= last; i++) drawSection(i);
  if (flash && flash.time > 0) {
    ctx.globalAlpha = flash.time / .65;
    ctx.strokeStyle = flash.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(flash.x - camera, flash.y, 12 + (.65 - flash.time) * 43, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  const x = player.x - camera, y = player.y;
  box(x - 9, y - 26, 18, 20, '#a6bca4');
  box(x - 7, y - 39, 14, 13, '#edc799');
  box(x - 13, y - 42, 26, 5, '#d6bd88');
  box(x - 7, y - 49, 15, 8, '#7d9e90');
  box(x - 8, y - 6, 6, 6, '#25342c');
  box(x + 2, y - 6, 6, 6, '#25342c');
  box(x + player.facing * 15 - 1, y - 28, 3, 26, '#c2a070');
  box(x + player.facing * 15 - 4, y - 33, 9, 7, elements[active].color);
}

for (const [id, element] of Object.entries(elements)) {
  const button = document.createElement('button');
  button.dataset.element = id;
  button.textContent = element.key + ' · ' + element.name;
  button.style.color = element.color;
  button.onclick = () => select(id);
  $('elements').append(button);
}
$('hint').onclick = () => say(current()?.clue ?? '沿路向右，走到出口。');
$('retry').onclick = retry;
$('restart').onclick = restart;
$('again').onclick = restart;
$('jump').onclick = () => { jumpBuffer = .13; };
$('cast').onclick = cast;
canvas.onclick = () => canvas.focus();

const directions = { a: 'left', ArrowLeft: 'left', d: 'right', ArrowRight: 'right' };
window.addEventListener('keydown', event => {
  if ($('win').open || event.ctrlKey || event.metaKey || event.altKey) return;
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const element = Object.entries(elements).find(([, value]) => value.key === key);
  if (directions[key]) {
    event.preventDefault();
    keys.add(key);
    keys.add(directions[key]);
    return;
  }
  if (!element && ![' ', 'e', 'r', 'h'].includes(key)) return;
  if (key === ' ' && event.target instanceof HTMLButtonElement) return;
  event.preventDefault();
  if (event.repeat) return;
  if (element) select(element[0]);
  if (key === ' ') jumpBuffer = .13;
  if (key === 'e') cast();
  if (key === 'r') retry();
  if (key === 'h') $('hint').click();
});
window.addEventListener('keyup', event => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keys.delete(key);
  const direction = directions[key];
  if (direction && !Object.entries(directions).some(([input, value]) => value === direction && keys.has(input))) keys.delete(direction);
});
window.addEventListener('blur', clearInput);
for (const button of document.querySelectorAll('[data-hold]')) {
  button.onpointerdown = event => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    heldPointers.set(event.pointerId, button.dataset.hold);
  };
  button.onpointerup = button.onpointercancel = button.onlostpointercapture = event => heldPointers.delete(event.pointerId);
}

function frame(now) {
  const dt = Math.min(.033, (now - (clock || now)) / 1000);
  clock = now;
  update(dt);
  draw();
  requestAnimationFrame(frame);
}
restart();
requestAnimationFrame(frame);
