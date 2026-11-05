"use strict";
const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const loadout = document.querySelector('#loadout');
const win = document.querySelector('#win');
const status = document.querySelector('#status');
const elements = {plant:{name:'Plant · 植物',color:'#a4ca74'},water:{name:'Water · 水',color:'#75c9e0'},fire:{name:'Fire · 火',color:'#eea174'},soil:{name:'Soil · 泥土',color:'#c69a70'}};
const keys = new Set();
let chosen = [], carried = [], active = null;
let playerX = 130, facing = 1, phase = 'empty', growth = 0, finished = false;
let bridgeType = null;
let bridgeSource = null, channeling = false, spellTimer = 0;
const BUILD_SECONDS = 4;
let playerY = 385, velocityY = 0, grounded = true, materials = [];
let lastTime = 0, time = 0, particles = [];
const ground = 385, leftEdge = 425, rightEdge = 735;
function say(text){if(status.textContent!==text)status.textContent = text;}
function paused(){return loadout.open || win.open;}
function openSelection(){keys.clear();chosen=[...carried];renderChoices();loadout.showModal();}
function renderChoices(){
 document.querySelector('#choices').replaceChildren(...Object.entries(elements).map(([id,item])=>{
  const b=document.createElement('button');b.textContent=item.name;b.style.color=item.color;b.setAttribute('aria-pressed',chosen.includes(id));
  b.onclick=()=>{if(chosen.includes(id))chosen=chosen.filter(x=>x!==id);else if(chosen.length<2)chosen.push(id);renderChoices();};return b;
 }));
 document.querySelector('#choice-status').textContent=`已选择 ${chosen.length} / 2 种元素`;
 document.querySelector('#start').disabled=chosen.length!==2;
}
function select(id){active=id;renderTools();canvas.focus();}
function renderTools(){document.querySelector('#tools').replaceChildren(...carried.map((id,i)=>{
 const b=document.createElement('button');b.textContent=`${i+1} · ${elements[id].name}`;b.setAttribute('aria-pressed',active===id);b.style.color=elements[id].color;b.onclick=()=>select(id);return b;
}));}
document.querySelector('#start').onclick=()=>{carried=[...chosen];active=carried[0];renderTools();loadout.close();canvas.focus();say('A/D 移动，空格跳跃，E 向面前施法。可以在任意位置放置元素。');};
document.querySelector('#reselect').onclick=openSelection;
loadout.addEventListener('cancel',e=>e.preventDefault());
win.addEventListener('cancel',e=>e.preventDefault());
function reset(){if(win.open)win.close();if(loadout.open)loadout.close();playerX=130;playerY=ground;velocityY=0;grounded=true;materials=[];facing=1;phase='empty';growth=0;bridgeType=null;bridgeSource=null;channeling=false;spellTimer=0;finished=false;particles=[];carried=[];active=null;renderTools();say('接受委托，准备出发。');openSelection();}
document.querySelector('#reset').onclick=reset;
document.querySelector('#replay').onclick=reset;
window.addEventListener('keydown',e=>{
 if(paused()||finished||e.target.closest('button,summary'))return;
 const key=e.key.toLowerCase();
 if(!['a','d','arrowleft','arrowright','1','2',' ','e'].includes(key))return;
 e.preventDefault();keys.add(key);
 if(e.repeat)return;
 if(key===' '&&grounded){velocityY=-390;grounded=false;}
 if(key==='e')cast();
 if(key==='1'||key==='2'){const id=carried[Number(key)-1];if(id)select(id);}
});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>keys.clear());
function burst(color,x,y){for(let i=0;i<20;i++)particles.push({x,y:y-12,vx:(Math.random()-.5)*85,vy:-30-Math.random()*80,life:.8,color});}
canvas.addEventListener('pointerdown',()=>canvas.focus());
function cast(){
 if(paused()||finished||!active)return;
 const x=Math.max(15,Math.min(1085,playerX+facing*42)),y=playerY;
 burst(elements[active].color,x,y);
 const nearby=materials.filter(m=>Math.abs(m.x-x)<32&&Math.abs(m.y-y)<40).sort((a,b)=>Math.abs(a.x-x)-Math.abs(b.x-x));
 if(active==='plant'||active==='soil'){
  if(nearby.includes(bridgeSource)){say('这份材料正在支撑桥梁。切换到对应元素并长按 E 继续建造。');return;}
  const old=nearby[0];if(old){old.type=active;}else{if(materials.length>=100){say('场景材料已达上限，请重新开始。');return;}materials.push({x,y,type:active});}
  say(active==='plant'?'幼苗出现在面前。切换 Water 并长按 E 浇灌。':'泥土出现在面前。切换 Fire 并长按 E 烧结。');return;
 }
 if(nearby.includes(bridgeSource)&&phase!=='empty')return;
 const target=nearby.find(m=>active==='water'?m.type==='plant':m.type==='soil'||m.type==='plant');
 if(!target){say('魔法已释放，但面前没有可反应的材料。调整位置或朝向再试。');return;}
 if(active==='fire'&&target.type==='plant'){materials.splice(materials.indexOf(target),1);say('火烧毁了幼苗，可以重新种植。');return;}
 target.type=active==='water'?'vine':'stone';
 const nearBridge=Math.min(Math.abs(target.x-leftEdge),Math.abs(target.x-rightEdge))<=65&&Math.abs(target.y-ground)<25;
 if(phase==='empty'&&nearBridge){bridgeType=target.type;bridgeSource=target;phase='growing';say('持续长按 E 建造桥梁；松开会暂停并保留进度。');}
 else say(target.type==='vine'?'植物长大了。峡谷附近的藤蔓可以连接旧支架。':'泥土变成了石头。峡谷附近的石头可以修复旧桥。');
}
function update(dt){
 if(paused()||finished)return;
 const axis=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));
 if(axis){facing=axis;const nextX=Math.max(36,Math.min(1060,playerX+axis*185*dt));if(playerY<=ground||nextX>leftEdge+12&&nextX<rightEdge-12)playerX=nextX;}
 const previousY=playerY;
 velocityY+=1000*dt;playerY+=velocityY*dt;grounded=false;
 const supported=playerX<=leftEdge-10||playerX>=rightEdge+10||phase==='ready';
 if(supported&&previousY<=ground&&playerY>=ground&&velocityY>=0){playerY=ground;velocityY=0;grounded=true;}
 if(playerY>650){playerX=130;playerY=ground;velocityY=0;grounded=true;keys.clear();say('掉进峡谷了，已返回左岸。材料与修桥进度保留。');}
 for(const m of materials){if(m.y<ground)m.y=Math.min(ground,m.y+220*dt);if(m.y>=ground&&m.x>leftEdge&&m.x<rightEdge&&phase!=='ready')m.y+=220*dt;}
 materials=materials.filter(m=>m.y<600);
 // Held magic is simulated by elapsed time, independent of keyboard repeat rate.
 spellTimer-=dt;
 if(keys.has('e')&&(active==='water'||active==='fire')&&spellTimer<=0){cast();spellTimer=0.12;}
 const spellX=Math.max(15,Math.min(1085,playerX+facing*42));
 channeling=phase==='growing'&&keys.has('e')&&active===(bridgeType==='vine'?'water':'fire')&&materials.includes(bridgeSource)&&Math.abs(bridgeSource.x-spellX)<32&&Math.abs(bridgeSource.y-playerY)<40;
 if(phase==='growing'){
  if(channeling){growth=Math.min(1,growth+dt/BUILD_SECONDS);say(`${bridgeType==='vine'?'正在浇灌藤蔓':'正在烧结石桥'} · 长按 E`);}
  else say(`建造暂停 · 面向原材料，使用 ${bridgeType==='vine'?'Water':'Fire'} 长按 E 继续。`);
  if(growth===1){phase='ready';channeling=false;say('道路修复完成！向右前进，到达对岸的旗帜。');}
 }
 for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=100*dt;}particles=particles.filter(p=>p.life>0);
 if(phase==='ready'&&playerX>1005&&grounded){finished=true;keys.clear();win.showModal();}
}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h);}
function text(s,x,y,size=14,color='#c7d7af'){ctx.fillStyle=color;ctx.font=`${size}px system-ui`;ctx.fillText(s,x,y);}
function draw(){
 const sky=ctx.createLinearGradient(0,0,0,560);sky.addColorStop(0,'#19392f');sky.addColorStop(1,'#081c20');ctx.fillStyle=sky;ctx.fillRect(0,0,1100,560);
 for(let i=0;i<17;i++){const x=i*78-30;rect(x,60+(i%3)*33,20,400,'#203d32');rect(x-34,80+(i%3)*30,92,45,'#254837');rect(x-18,55+(i%3)*30,65,40,'#254837');}
 for(let i=0;i<28;i++){const x=(i*137)%1100,y=100+(i*47)%240+Math.sin(time+i)*4;rect(x,y,2,2,'#b9c78466');}
 rect(0,ground,leftEdge,175,'#5b4e39');rect(rightEdge,ground,365,175,'#5b4e39');rect(0,ground,leftEdge,9,'#96b56a');rect(rightEdge,ground,365,9,'#96b56a');
 for(let i=0;i<70;i++){const x=(i*53)%1100,y=ground+24+(i*31)%140;if(x<leftEdge-8||x>rightEdge)rect(x,y,14,6,'#706043');}
 for(let i=0;i<60;i++){const x=i*21;if(x<leftEdge-9||x>rightEdge){rect(x,ground-7,3,8,'#7e9e5c');rect(x+4,ground-12,3,13,'#597c4e');}}
 ctx.strokeStyle='#a3936855';ctx.lineWidth=3;ctx.setLineDash([8,9]);ctx.beginPath();ctx.moveTo(leftEdge,ground-5);ctx.lineTo(rightEdge,ground-5);ctx.stroke();ctx.setLineDash([]);
 rect(leftEdge-13,ground-30,7,45,'#8f7755');rect(rightEdge+5,ground-30,7,45,'#8f7755');
 // Only completed segments are visible; incomplete bridges do not enable crossing.
 if(bridgeType==='stone'){
  for(let i=0;i<Math.floor(growth*20);i++){const x=leftEdge+i*(rightEdge-leftEdge)/20;rect(x,ground-7,15.5,16,'#8e9994');rect(x,ground-7,14.5,3,'#c4cec3');rect(x,ground+6,1,3,'#46524b');}
 }
 if(bridgeType==='vine'){const segments=Math.floor(growth*40);for(let i=0;i<segments;i++){const x=leftEdge+i*(rightEdge-leftEdge)/40;rect(x,ground-7,9,12,'#698f48');rect(x,ground-7,9,3,'#b0cc72');if(i%3===0){rect(x,ground-16,10,5,'#91b660');rect(x+3,ground+6,9,4,'#497940');}}}
 for(const m of materials){if(m.type==='plant'||m.type==='vine'){const h=m.type==='vine'?40:25;rect(m.x-2,m.y-h,5,h,'#84b65d');rect(m.x-14,m.y-h,14,7,'#b2d17a');rect(m.x+3,m.y-h+9,13,7,'#91bb64');}else{rect(m.x-15,m.y-12,30,12,m.type==='stone'?'#8e9994':'#b48a5c');rect(m.x-9,m.y-18,18,6,m.type==='stone'?'#c4cec3':'#c39b6a');}}
 if(phase!=='ready')text('旧支架 · 道路缺失',leftEdge+82,ground+65,13,'#a3b59f');
 if(channeling&&!paused()&&bridgeSource){ctx.strokeStyle=elements[active].color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(playerX+facing*20,playerY-36);ctx.lineTo(bridgeSource.x,bridgeSource.y-20);ctx.stroke();}
 rect(1024,ground-83,5,83,'#d3c497');ctx.fillStyle='#e5ce85';ctx.beginPath();ctx.moveTo(1029,ground-83);ctx.lineTo(1065,ground-70);ctx.lineTo(1029,ground-56);ctx.fill();text('前往圣地 →',965,ground+38,13,'#e6d29b');
 const walking=grounded&&(keys.has('a')||keys.has('d')||keys.has('arrowleft')||keys.has('arrowright'))&&!paused(),bob=walking?Math.sin(time*14)*2:0,px=playerX,py=playerY+bob;
 rect(px-11,py-29,22,23,'#91afa1');rect(px-8,py-44,16,15,'#e5c79c');rect(px-17,py-48,34,5,'#ccb881');rect(px-10,py-62,20,15,'#789f91');rect(px-5,py-70,10,9,'#789f91');rect(px+facing*4,py-40,3,3,'#233e33');rect(px-9,py-6,7,6,'#273c35');rect(px+3,py-6,7,6,'#273c35');rect(px+facing*17,py-35,3,35,'#b79b66');rect(px+facing*17-3,py-41,9,8,active?elements[active].color:'#d3d8aa');
 for(const p of particles){ctx.globalAlpha=Math.max(0,p.life);rect(p.x,p.y,4,4,p.color);}ctx.globalAlpha=1;
 text('村庄 ←',35,ground+38,13,'#d3c497');
}
function tick(now){const dt=Math.min((now-lastTime)/1000||0,0.04);lastTime=now;time+=dt;update(dt);draw();requestAnimationFrame(tick);}
reset();requestAnimationFrame(tick);
