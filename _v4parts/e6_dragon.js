async function dragonFlyby(y,fire){
  SFX.roar();shake(7);
  FLYBY={t0:performance.now(),y:y||300,fire:!!fire,dur:1200};
  await sleep(1200);
  FLYBY=null;
}
function drawFlyby(t){
  if(!FLYBY)return;
  const f=FLYBY,p=clamp((t-f.t0)/f.dur,0,1);
  const x=1420-p*1740;
  const spr=Math.floor((t-f.t0)/130)%2?DRA.b:DRA.a;
  const sc=9,w=spr.w*sc,h=spr.h*sc;
  ctx.drawImage(spr.img,x-w/2,f.y-h/2,w,h);
  if(f.fire&&Math.random()<.7)burst(x-w/2+rand(-10,20),f.y+rand(-14,18),{n:4,col:'#ff9a4d',spd:2.6,life:520,g:.012});
}
async function dragonAssist(){
  G.dragonDone=true;
  ribbon('<b>卓耿掠过战场——Dracarys！</b>',2000);
  await dragonFlyby(250,true);
  screenFlash('rgba(255,120,40,.4)');shake(10);
  const dany=G.players.find(p=>p.key==='dany')||G.players[0];
  for(const e of alive(G.enemies)){
    burst(e.x,e.y-e.sh*e.scale*.5,{n:22,col:'#ff9a4d',spd:3,life:700,g:-.01});
    await hitEnemy(dany,e,170,'fire',{});
    await sleep(120);
  }
  for(const e of alive(G.enemies)){e.fear=2;floaty(e.x,e.y-e.sh*e.scale-34,'龙威','fear');}
  ribbon('<b>龙威</b> 笼罩了残存的敌人！',2000);
  await sleep(600);
}

/* ---- 战斗封装 ---- */
async function runBattle(waves,opts={}){
  $('#worldHud').classList.add('hidden');
  $('#partyBar').classList.remove('hidden');
  initBattle(waves,opts);
  await startWave(0);
  await battleLoop();
  $('#turnBadge').classList.add('hidden');
  if(G.battleResult==='win'&&!G.battleFinal){
    setTone(null);
    $('#partyBar').classList.add('hidden');
    $('#worldHud').classList.remove('hidden');
    G.scene='explore';
    ribbon('<b>战斗胜利</b> · 全员经验 +'+(G.lastExp||0),2200);
  }
  return G.battleResult;
}

/* ---- 大地图（v2节点式，已被 explore 取代） ---- */
function updateWorldHud(){
  const box=$('#whParty');box.innerHTML='';
  for(const p of G.players){
    const row=document.createElement('div');row.className='whp';
    const pct=clamp(p.hp/p.maxhp*100,0,100).toFixed(0);
    row.innerHTML=`<span class="nm">${p.name.split('·')[0]}</span><div class="bar hp${p.hp/p.maxhp<.3?' low':''}"><i style="width:${pct}%"></i></div><span class="hpn">${Math.max(0,Math.ceil(p.hp))}</span>`;
    box.appendChild(row);
  }
  const items=G.items.map(i=>`${i.n}×${i.cnt}`).join(' · ');
  const BAGN={herb:'药草',berry:'浆果',ore:'矿石'};
  const bag=Object.keys(G.bag||{}).filter(k=>G.bag[k]>0).map(k=>BAGN[k]+'×'+G.bag[k]).join(' · ');
  $('#whProg').innerHTML=`道具：${items}<br>材料：${bag||'（空）'}`;
}
function adjacent(a,b){return ROADS.some(r=>(r[0]===a&&r[1]===b)||(r[0]===b&&r[1]===a));}
function partyPos(t){
  const w=G.world;
  if(!w.moving)return {x:w.x,y:w.y};
  const p=clamp((t-w.t0)/650,0,1);
  const e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
  return {x:w.fx+(w.tx-w.fx)*e,y:w.fy+(w.ty-w.fy)*e};
}
async function tryTravel(key){
  if(G.busy||G.scene!=='world')return;
  const w=G.world;
  if(key===w.at){G.busy=true;await enterLoc();G.busy=false;return;}
  if(!adjacent(w.at,key)){ribbon('道路尚未连通——需经临冬城中转。',2000);return;}
  G.busy=true;SFX.menu();
  w.moving=true;w.t0=performance.now();w.fx=w.x;w.fy=w.y;w.tx=LOCS[key].x;w.ty=LOCS[key].y;
  await sleep(700);
  w.moving=false;w.x=w.tx;w.y=w.ty;w.at=key;
  await enterLoc();
  G.busy=false;
}
async function enterLoc(){
  if(G.scene!=='world')return;
  await LOC_EVENTS[G.world.at]();
  if(G.scene==='world')updateWorldHud();
}
function drawWorldMap(t){
  const w=G.world;
  ctx.fillStyle='#081527';ctx.fillRect(0,0,1280,720);
  ctx.lineWidth=1;
  for(let i=0;i<7;i++){
    ctx.strokeStyle=`rgba(120,170,220,${.05+.02*(i%3)})`;
    ctx.beginPath();
    for(let x=0;x<=1280;x+=32){
      const y=80+i*96+Math.sin(x/90+t/1400+i*2)*5;
      if(x)ctx.lineTo(x,y);else ctx.moveTo(x,y);
    }
    ctx.stroke();
  }
  ctx.beginPath();
  LAND.forEach((p,i)=>{if(i)ctx.lineTo(p[0],p[1]);else ctx.moveTo(p[0],p[1]);});
  ctx.closePath();
  ctx.fillStyle='#16251c';ctx.fill();
  ctx.strokeStyle='rgba(201,165,90,.4)';ctx.lineWidth=2;ctx.stroke();
  ctx.beginPath();
  SNOWCAP.forEach((p,i)=>{if(i)ctx.lineTo(p[0],p[1]);else ctx.moveTo(p[0],p[1]);});
  ctx.closePath();ctx.fillStyle='rgba(223,233,244,.8)';ctx.fill();
  ctx.fillStyle='rgba(90,140,100,.5)';
  for(const d of TOWNS_DOTS){ctx.beginPath();ctx.arc(d[0],d[1],3,0,7);ctx.fill();}
  ctx.strokeStyle='rgba(201,165,90,.35)';ctx.lineWidth=2;ctx.setLineDash([7,7]);
  for(const r of ROADS){ctx.beginPath();ctx.moveTo(LOCS[r[0]].x,LOCS[r[0]].y);ctx.lineTo(LOCS[r[1]].x,LOCS[r[1]].y);ctx.stroke();}
  ctx.setLineDash([]);
  // 龙影（氛围演出）
  if(!w.sky){if(Math.random()<.0009)w.sky={t0:t,y:rand(70,160)};}
  else{
    const p=(t-w.sky.t0)/6500;
    if(p>=1)w.sky=null;
    else{
      const spr=Math.floor(t/260)%2?DRA.b:DRA.a;
      const sc=2.1,dw=spr.w*sc,dh=spr.h*sc;
      ctx.save();ctx.globalAlpha=.3;
      ctx.drawImage(spr.img,1350-p*1700-dw/2,w.sky.y-dh/2,dw,dh);
      ctx.restore();
    }
  }
  const selKey=LOCS_KEYS[G.worldSel];
  for(const k of LOCS_KEYS){
    const L=LOCS[k],done=G.locs[k]==='done',at=w.at===k;
    if(at){
      const pr=14+Math.sin(t/300)*3;
      ctx.strokeStyle='rgba(240,212,145,.8)';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(L.x,L.y,pr,0,7);ctx.stroke();
    }
    if(k===selKey){
      ctx.strokeStyle='rgba(240,212,145,.5)';ctx.lineWidth=1;ctx.setLineDash([4,4]);
      ctx.beginPath();ctx.arc(L.x,L.y,19,t/600,t/600+6.28);ctx.stroke();ctx.setLineDash([]);
    }
    ctx.beginPath();ctx.arc(L.x,L.y,done?7:8,0,7);
    ctx.fillStyle=done?'#7dc88c':'#c9a55a';ctx.fill();
    ctx.strokeStyle='#0a1020';ctx.lineWidth=1.5;ctx.stroke();
    ctx.font='700 15px "Noto Serif SC","Microsoft YaHei",serif';ctx.textAlign='center';
    const tw=ctx.measureText(L.n).width;
    ctx.fillStyle='rgba(5,8,16,.78)';
    ctx.fillRect(L.x-tw/2-9,L.y+14,tw+18,24);
    ctx.strokeStyle='rgba(201,165,90,.35)';ctx.lineWidth=1;
    ctx.strokeRect(L.x-tw/2-9,L.y+14,tw+18,24);
    ctx.fillStyle=at?'#f0d491':'#cfd9ea';
    ctx.fillText(L.n,L.x,L.y+31);
    ctx.font='12px sans-serif';
    ctx.fillText(done?'✔':(k==='winterfell'&&allLocsDone()?'⚔':'❗'),L.x+tw/2+18,L.y+31);
    if(G.worldHover===k){
      ctx.font='13px "Noto Serif SC","Microsoft YaHei",serif';
      const dw2=ctx.measureText(L.desc).width;
      ctx.fillStyle='rgba(5,8,16,.78)';
      ctx.fillRect(L.x-dw2/2-8,L.y-42,dw2+16,20);
      ctx.fillStyle='#f0d491';
      ctx.fillText(L.desc,L.x,L.y-27);
    }
  }
  const pp=partyPos(t);
  ctx.strokeStyle='#dfe6f2';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(pp.x,pp.y);ctx.lineTo(pp.x,pp.y-26);ctx.stroke();
  ctx.fillStyle='#c9a55a';
  ctx.beginPath();ctx.moveTo(pp.x,pp.y-26);ctx.lineTo(pp.x+14,pp.y-21);ctx.lineTo(pp.x,pp.y-16);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(230,240,255,.5)';
  for(const s of SNOW){
    s.y+=s.v*.5;s.x+=Math.sin(t/1400+s.ph)*.3;
    if(s.y>724){s.y=-6;s.x=rand(0,1280);}
    if(s.s<2){ctx.globalAlpha=.25;ctx.fillRect(s.x,s.y,s.s,s.s);}
  }
  ctx.globalAlpha=1;
}

/* ---- 地点事件 ---- */
const LOC_EVENTS={
  winterfell:evWinterfell,wall:evWall,wolfswood:evWolfswood,
  kingslanding:evKingslanding,dragonstone:evDragonstone
};
async function evWinterfell(){
  for(;;){
    if(G.scene!=='world')return;
    if(allLocsDone()){
      const a=await playStory('finale_pre');
      if(a==='finale_go'){await runBattle(FINAL_WAVES,{final:true,tone:'night'});return;}
      return;
    }
    const a=await playStory('wf_menu');
    if(a==='wf_rest'){
      for(const p of G.players){p.alive=true;p.dissolve=0;p.hp=p.maxhp;p.sp=p.maxsp;}
      SFX.heal();ribbon('<b>全队休整完毕</b> · 生命/精力回满',2000);
      updateWorldHud();
    }else if(a==='wf_visit'){
      await playStory('wf_visit');
    }else return;
  }
}
async function evWall(){
  if(G.locs.wall==='done'){ribbon('长城已肃清。守夜人残部向远征队致意。',2200);return;}
  await playStory('wall_pre');
  const r=await runBattle(WALL_WAVES,{tone:'wall'});
  if(r!=='win')return;
  G.locs.wall='done';
  addItem('glass',1);
  await playStory('wall_post');
}
async function evWolfswood(){
  if(G.locs.wolfswood==='done'){ribbon('狼林恢复了宁静。幼狼在雪地里嬉戏。',2200);return;}
  const a=await playStory('wolf_pre');
  if(a==='wolf_sneak'){G.locs.wolfswood='done';return;}
  const r=await runBattle(GIANT_WAVES,{tone:'forest'});
  if(r!=='win')return;
  G.locs.wolfswood='done';
  addItem('potion',2);
  await playStory('wolf_win');
}
async function evKingslanding(){
  if(G.locs.kingslanding==='done'){ribbon('红堡的大门紧闭。这里没有更多可争取的了。',2200);return;}
  await playStory('kl_pre');
  G.locs.kingslanding='done';
}
async function evDragonstone(){
  if(G.locs.dragonstone==='done'){ribbon('卓耿盘旋在龙石岛上空。',2200);return;}
  await playStory('ds_event');
  G.locs.dragonstone='done';
  G.flags.dragonstone=true;
}

/* ================= 开放世界探索引擎（v3 · Phase1：地图/行走/相机） ================= */