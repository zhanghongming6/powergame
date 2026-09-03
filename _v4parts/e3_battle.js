function buildPartyBar(){
  const bar=$('#partyBar');bar.innerHTML='';
  G.players.forEach((p,i)=>{
    const d=document.createElement('div');d.className='ptile';d.dataset.i=i;
    d.innerHTML=`<span class="nm">${p.name}</span><span class="cl">${p.cls}</span>
      <div class="bar hp"><i></i><em class="tx"></em></div>
      <div class="bar sp"><i></i><em class="tx"></em></div>
      <div class="bp"><span class="lbl">BP</span>${'<span class="bpd"></span>'.repeat(5)}</div>`;
    d.addEventListener('click',()=>onTileClick(p));
    bar.appendChild(d);p.tile=d;
  });
}
function updateTiles(){
  G.players.forEach(p=>{
    const t=p.tile;if(!t)return;
    t.classList.toggle('dead',!p.alive);
    t.classList.toggle('active',G.cur===p&&G.phase!=='idle');
    t.classList.toggle('allyTarget',G.targetMode==='ally'&&p.alive);
    const hp=t.querySelector('.hp'),sp=t.querySelector('.sp');
    hp.classList.toggle('low',p.hp/p.maxhp<.3);
    hp.firstElementChild.style.width=clamp(p.hp/p.maxhp*100,0,100)+'%';
    hp.querySelector('.tx').textContent=`${Math.max(0,Math.ceil(p.hp))} / ${p.maxhp}`;
    sp.firstElementChild.style.width=clamp(p.sp/p.maxsp*100,0,100)+'%';
    sp.querySelector('.tx').textContent=`${p.sp} / ${p.maxsp}`;
    t.querySelectorAll('.bpd').forEach((d,i)=>d.classList.toggle('on',i<p.bp));
  });
}
function openCmd(p){
  G.phase='cmd';G.cur=p;G.boost=0;G.selIdx=0;
  $('#cmdName').innerHTML=`${p.name}<small>${p.cls}</small>`;
  renderCmdList();
  $('#cmdWrap').classList.remove('hidden');
  updateTiles();
}
function renderCmdList(){
  const p=G.cur,list=$('#cmdList');list.innerHTML='';
  const items=[
    {k:'atk',t:'攻 击'},{k:'skill',t:'技 能'},{k:'item',t:'道 具'},{k:'tame',t:'驯 服'},{k:'def',t:'防 御'}
  ];
  items.forEach((it,i)=>{
    const d=document.createElement('div');
    d.className='cmd'+(i===G.selIdx?' sel':'');d.dataset.i=i;d.dataset.k=it.k;
    d.innerHTML=it.t;
    d.addEventListener('mouseenter',()=>{if(G.phase!=='cmd')return;G.selIdx=i;renderCmdList();SFX.menu();});
    d.addEventListener('click',()=>{if(G.phase!=='cmd')return;G.selIdx=i;pickCmd(it.k);});
    list.appendChild(d);
  });
  renderBoost();
}
function renderBoost(){
  const p=G.cur,pips=$('#boostPips');pips.innerHTML='';
  for(let i=0;i<5;i++){const d=document.createElement('span');d.className='bpd'+(i<p.bp?' on':'');pips.appendChild(d);}
  $('#boostVal').textContent='×'+G.boost;
  $('#bpUp').style.opacity=p.bp-G.boost>0&&G.boost<3?1:.35;
  $('#bpDown').style.opacity=G.boost>0?1:.35;
}
$('#bpUp').addEventListener('click',e=>{e.stopPropagation();const p=G.cur;
  if(G.boost<3&&p.bp-G.boost>0){G.boost++;SFX.menu();renderBoost();}});
$('#bpDown').addEventListener('click',e=>{e.stopPropagation();if(G.boost>0){G.boost--;SFX.back();renderBoost();}});

function pickCmd(k){
  const p=G.cur;SFX.ok();
  if(k==='atk'){enterTarget('enemy','one',{type:'atk'});}
  else if(k==='def'){confirmAction({type:'def'});}
  else if(k==='skill')openSubMenu('skill');
  else if(k==='item')openSubMenu('item');
  else if(k==='tame'){enterTarget('enemy','one',{type:'tame'});}
}
function openSubMenu(kind){
  const p=G.cur,list=$('#cmdList');list.innerHTML='';G.subKind=kind;G.phase='sub';G.selIdx=0;
  const rows=[];
  if(kind==='skill'){
    p.skills.forEach(s=>{
      const lock=s.req&&p.lv<s.req;
      rows.push({dis:lock||p.sp<s.sp,label:s.n,sub:lock?`Lv.${s.req} 解锁`:`SP ${s.sp}`,ref:s,desc:lock?`达到 Lv.${s.req} 解锁`:s.desc});
    });
  }else{
    G.items.forEach(it=>rows.push({dis:it.cnt<=0,label:it.n,sub:'×'+it.cnt,ref:it,desc:it.desc}));
  }
  rows.push({label:'返 回',back:true});
  rows.forEach((r,i)=>{
    const d=document.createElement('div');
    d.className='cmd'+(i===G.selIdx?' sel':'')+(r.dis?' dis':'');d.dataset.i=i;
    d.innerHTML=`${r.label}${r.sub?`<span class="cost ${kind==='item'?'cnt':''}">${r.sub}</span>`:''}`;
    d.title=r.desc||'';
    d.addEventListener('mouseenter',()=>{if(G.phase!=='sub')return;G.selIdx=i;refreshSubSel();SFX.menu();});
    d.addEventListener('click',()=>{if(G.phase!=='sub')return;G.selIdx=i;pickSub(rows);});
    list.appendChild(d);
  });
  function refreshSubSel(){list.querySelectorAll('.cmd').forEach((c,i)=>c.classList.toggle('sel',i===G.selIdx));}
  G.subRows=rows;G.refreshSubSel=refreshSubSel;
}
function pickSub(rows){
  const r=rows[G.selIdx];
  if(!r)return;
  if(r.back){SFX.back();G.phase='cmd';G.selIdx=0;renderCmdList();return;}
  if(r.dis){SFX.back();return;}
  SFX.ok();
  if(G.subKind==='skill'){
    const s=r.ref;
    if(s.t==='all')confirmAction({type:'skill',skill:s,boost:G.boost});
    else if(s.t==='self')confirmAction({type:'skill',skill:s,boost:G.boost});
    else enterTarget('enemy','one',{type:'skill',skill:s});
  }else{
    const it=r.ref;
    if(it.key==='glass')enterTarget('enemy','one',{type:'item',item:it});
    else enterTarget('ally','one',{type:'item',item:it});
  }
}
function enterTarget(mode,kind,act){
  G.phase='target';G.targetMode=mode;G.targetKind=kind;G.pending=Object.assign({},act,{boost:G.boost});
  $('#cmdWrap').classList.add('hidden');
  $('#targetHint').style.display='block';
  $('#targetHint').textContent=mode==='ally'?'选择友方目标 · 右键取消'
    :(act&&act.type==='tame'?'选择驯服目标 · 需可驯服且生命<30% · 右键取消'
    :'选择目标 · 右键取消');
  updateTiles();
}
function leaveTarget(){
  G.phase='cmd';G.targetMode=null;G.pending=null;G.hover=null;
  $('#targetHint').style.display='none';
  $('#cmdWrap').classList.remove('hidden');updateTiles();
}
function confirmAction(act){
  if(act.boost&&G.cur)G.cur.bp=Math.max(0,G.cur.bp-act.boost);
  $('#cmdWrap').classList.add('hidden');$('#targetHint').style.display='none';
  G.targetMode=null;G.phase='anim';G.cur=null;updateTiles();
  if(G.awaiting){const r=G.awaiting;G.awaiting=null;r(act);}
}
function onTileClick(p){
  if(G.targetMode==='ally'&&p.alive&&G.pending){
    const act=G.pending;SFX.ok();confirmAction(Object.assign({},act,{target:p}));
  }
}

/* ================= 战斗流程 ================= */
function initBattle(waves,opts={}){
  G.scene='battle';G.wave=0;G.round=0;G.guardRounds=0;
  $('#world').classList.remove('expmode');
  G.battleWaves=waves;G.battleFinal=!!opts.final;G.battleResult=null;G.dragonDone=false;
  G.battleExp=0;G.tameKey=null;
  for(const p of G.players){p.lunge=null;p.flashT=0;p.shakeT=0;p.dissolve=0;p.guardSelf=false;p._act=null;}
  setTone(opts.tone||null);
  buildPartyBar();
  $('#turnBadge').classList.remove('hidden');
}
async function startWave(i){
  G.wave=i;G.waveRound0=G.round;const w=G.battleWaves[i];
  G.seen=G.seen||{};
  for(const f of w.foes)G.seen[f.k]=true;
  G.enemies=w.foes.map(f=>{const u=makeUnit(FOES[f.k],'enemy');u.x=f.x;u.y=f.y;return u;});
  await showBanner(w.banner,w.sub);
}
function showBanner(t,s){return new Promise(res=>{
  $('#bnTitle').textContent=t;$('#bnSub').textContent=s;
  const b=$('#banner');b.classList.add('show');
  setTimeout(()=>{b.classList.remove('show');setTimeout(res,500);},2100);
});}
async function battleLoop(){
  while(G.scene==='battle'){await playRound();}
}
async function playRound(){
  G.round++;
  $('#turnBadge').innerHTML=`ROUND ${G.round}<span class="cn">${G.battleWaves[G.wave].banner}</span>`;
  for(const p of alive(G.players)){p.bp=Math.min(5,p.bp+1);p.sp=Math.min(p.maxsp,p.sp+4);p.guardSelf=false;}
  updateTiles();
  // 玩家依次下达指令（魔兽伙伴自动行动）
  for(const p of alive(G.players)){
    if(G.scene!=='battle')return;
    const act=p.isBeast?beastAutoAct(p):await playerTurn(p);
    if(!act)return;
    p._act=act;
    if(checkDead())return;
  }
  // 组队列
  const acts=[];
  for(const p of alive(G.players))if(p._act)acts.push({actor:p,act:p._act});
  for(const e of alive(G.enemies)){
    if(e.broken){acts.push({actor:e,act:{type:'broken'}});}
    else acts.push({actor:e,act:chooseEnemyMove(e)});
  }
  G.players.forEach(p=>delete p._act);
  acts.sort((a,b)=>(b.actor.speed+rand(-6,6))-(a.actor.speed+rand(-6,6)));
  for(const a of acts){
    if(G.scene!=='battle')return;
    if(!a.actor.alive)continue;
    await doAction(a.actor,a.act);
    if(await checkEnd())return;
    await sleep(230);
  }
  // 卓耿助战（终局第三波第二轮）
  if(G.battleFinal&&G.wave===2&&G.round-G.waveRound0===2&&!G.dragonDone){
    await dragonAssist();
    if(await checkEnd())return;
  }
  // 破防恢复
  for(const e of alive(G.enemies)){
    if(e.broken){e.broken=false;e.shield=e.maxshield;
      ribbon(`<b>${e.name}</b> 重新凝聚了护盾`);await sleep(500);}
  }
  for(const e of G.enemies)if(e.fear>0)e.fear--;
  if(G.guardRounds>0)G.guardRounds--;
}
function playerTurn(p){
  return new Promise(res=>{G.awaiting=res;openCmd(p);});
}
function chooseEnemyMove(e){
  if(e.boss){
    if(e.hp<e.maxhp*.4&&Math.random()<.45)return {kind:'atk',n:'寒神凝视',mult:2.1,t:'one',ele:'ice',cast:true};
    e.pat++;
    const m=e.pat%3;
    if(m===0)return {kind:'atk',n:'冰之长枪',mult:1.25,t:'one',ele:'ice',cast:true};
    if(m===1)return {kind:'atk',n:'死亡风暴',mult:.85,t:'all',ele:'ice',cast:true};
    if(alive(G.enemies).length<3&&Math.random()<.55)return {kind:'summon',n:'亡者复苏'};
    return {kind:'atk',n:'冰之长枪',mult:1.25,t:'one',ele:'ice',cast:true};
  }
  if(e.key==='walker'){
    return Math.random()<.68
      ?{kind:'atk',n:'冰枪术',mult:1.2,t:'one',ele:'ice',cast:true}
      :{kind:'atk',n:'寒冰波动',mult:.8,t:'all',ele:'ice',cast:true};
  }
  if(e.key==='spider'){
    return Math.random()<.5
      ?{kind:'atk',n:'寒毒撕咬',mult:1.15,t:'one',spDrain:8}
      :{kind:'atk',n:'撕咬',mult:1,t:'one'};
  }
  if(e.key==='giant'){
    e.pat++;
    return e.pat%2===0
      ?{kind:'atk',n:'木棒横扫',mult:.9,t:'all'}
      :{kind:'atk',n:'震地猛击',mult:1.7,t:'one'};
  }
  return {kind:'atk',n:'撕咬',mult:1,t:'one'};
}

async function doAction(u,act){
  if(act.type==='broken'||(u.side==='enemy'&&u.broken)){
    ribbon(`<b>${u.name}</b> 陷入破防，无法行动！`);
    u.flashT=performance.now();await sleep(560);return;
  }
  if(u.side==='player')await doPlayerAction(u,act);
  else await doEnemyAction(u,act);
}

/* ---- 玩家行动 ---- */
async function doPlayerAction(p,act){
  const boost=act.boost||0;
  if(act.type==='tame'){
    const tgt=act.target;
    if(!tgt||!tgt.alive)return;
    ribbon(`<b>${p.name}</b> 试图驯服 <b>${tgt.name}</b>！`);
    SFX.buff();
    burst(tgt.x,tgt.y-tgt.sh*tgt.scale*.6,{n:14,col:'#9fe89f',spd:1.6,life:650,up:true,g:-.02});
    await sleep(600);
    if(!TAMEABLE.includes(tgt.key)||tgt.hp/tgt.maxhp>=.3||Math.random()>=tameChance(tgt)){
      tgt.anger=true;
      ribbon(`<b>${tgt.name}</b> 挣脱了！它被激怒了`,1800);
      floaty(tgt.x,tgt.y-tgt.sh*tgt.scale-20,'挣脱','pdmg');
      SFX.back();await sleep(450);return;
    }
    G.tameKey=tgt.key;
    ribbon(`<b>${tgt.name}</b> 放下敌意，愿意追随你！`,2200);
    SFX.win();
    for(const q of G.enemies){
      burst(q.x,q.y-q.sh*q.scale*.5,{n:24,col:'#9fe89f',spd:2.2,life:800,g:-.02});
      q.alive=false;q.dissolve=performance.now();
    }
    await sleep(700);return;
  }
  if(act.type==='def'){
    p.guardSelf=true;p.sp=Math.min(p.maxsp,p.sp+8);
    ribbon(`<b>${p.name}</b> 摆出防御姿态`);
    burst(p.x,p.y-p.sh*p.scale*.6,{n:10,col:'#9fc6ff',spd:1.4,life:500,up:true,g:-.01});
    SFX.buff();await sleep(520);return;
  }
  if(act.type==='item'){
    const it=act.item;it.cnt--;
    if(it.key==='potion'){
      const tgt=act.target,hp=Math.round(it.heal+130*boost);
      tgt.hp=Math.min(tgt.maxhp,tgt.hp+hp);
      ribbon(`<b>${p.name}</b> 使用了 ${it.n}`);
      floaty(tgt.x,tgt.y-tgt.sh*tgt.scale-8,'+'+hp,'heal');
      burst(tgt.x,tgt.y-tgt.sh*tgt.scale*.6,{n:16,col:'#8fe89a',spd:1.6,life:700,up:true,g:-.02});
      SFX.heal();await sleep(650);return;
    }
    if(it.key==='wine'){
      const tgt=act.target,sp=it.sp+20*boost;
      tgt.sp=Math.min(tgt.maxsp,tgt.sp+sp);
      ribbon(`<b>${p.name}</b> 使用了 ${it.n}`);
      floaty(tgt.x,tgt.y-tgt.sh*tgt.scale-8,'+'+sp+' SP','sp');
      burst(tgt.x,tgt.y-tgt.sh*tgt.scale*.6,{n:14,col:'#7fc8f0',spd:1.6,life:700,up:true,g:-.02});
      SFX.heal();await sleep(650);return;
    }
    if(it.key==='glass'){
      const tgt=act.target;
      ribbon(`<b>${p.name}</b> 掷出了 龙晶匕首！`);
      p.lunge={t0:performance.now(),dx:(tgt.x-p.x)*.22,dy:(tgt.y-p.y)*.22};
      SFX.slash();await sleep(260);
      const dmg=Math.round((it.dmg+80*boost)*rand(.92,1.08));
      await hitEnemy(p,tgt,dmg,'dragonglass',{});
      await sleep(420);return;
    }
  }
  if(act.type==='atk'){
    const tgt=act.target||pickEnemyTarget();if(!tgt)return;
    await physicalAttack(p,[tgt],{mult:1,hits:1,boostHits:true,ele:p.weap,n:'攻击'},boost);
    return;
  }
  if(act.type==='skill'){
    const s=act.skill;p.sp-=s.sp;
    if(s.buff==='guard'){
      G.guardRounds=1+boost;
      ribbon(`<b>${p.name}</b> 施展了 ${s.n}！全队获得庇护`);
      SFX.buff();
      for(const q of alive(G.players))burst(q.x,q.y-q.sh*q.scale*.6,{n:10,col:'#f0d491',spd:1.4,life:650,up:true,g:-.015});
      await sleep(700);return;
    }
    const list=s.t==='all'?alive(G.enemies):[act.target||pickEnemyTarget()];
    if(s.t!=='all'&&!list[0])return;
    if(s.ele==='fire'){
      ribbon(`<b>${p.name}</b> 释放了 <b>${s.n}</b>！`);
      SFX.fire();screenFlash('rgba(255,120,40,.35)');shake(6);
      if(p.key==='dany'&&G.flags.dragonstone)await dragonFlyby(300,s.t==='all');
      p.lunge={t0:performance.now(),dx:-26,dy:-10};
      const fmult=s.mult*(1+.55*boost);
      for(const t of list){
        await sleep(s.t==='all'?160:0);
        burst(t.x,t.y-t.sh*t.scale*.55,{n:26,col:'#ff9a4d',spd:3.4,life:750,g:-.01});
        burst(t.x,t.y-t.sh*t.scale*.55,{n:14,col:'#ffd28f',spd:2,life:550,g:-.03});
        await hitEnemy(p,t,Math.round(p.atk*fmult*rand(.9,1.1)),'fire',{});
      }
      await sleep(400);return;
    }
    await physicalAttack(p,list,s,boost);
    return;
  }
}
function pickEnemyTarget(){const l=alive(G.enemies);return l.length?l[irand(0,l.length-1)]:null;}

async function physicalAttack(p,targets,s,boost=0){
  const hitsBase=s.hits||1;
  const multi=!!s.boostHits||hitsBase>1;
  const hits=multi?hitsBase+boost:hitsBase;
  const perHit=multi?s.mult:s.mult*(1+.55*boost);
  ribbon(`<b>${p.name}</b> ${s.n==='攻击'?'发起攻击':'施展了 '+s.n+'！'}`);
  const t0=targets[0];
  p.lunge={t0:performance.now(),dx:(t0.x-p.x)*.3,dy:(t0.y-p.y)*.3};
  SFX.slash();
  await sleep(240);
  for(const t of targets){
    for(let h=0;h<hits;h++){
      const col=s.ele==='valyrian'?'#ff6b6b':(s.ele==='dagger'?'#c8f7a0':'#e8f0ff');
      slashFX(t.x+rand(-14,14),t.y-t.sh*t.scale*rand(.35,.7),col,s.mult>1.8?1.5:1);
      await hitEnemy(p,t,Math.round(p.atk*perHit*rand(.9,1.1)),s.ele,{crit:s.crit});
      await sleep(hits>1?150:0);
    }
  }
  await sleep(380);
}
async function hitEnemy(p,e,dmg,ele,o={}){
  if(!e.alive)return;
  let weak=false;
  if(e.weak.includes(ele)){
    weak=true;e.found.add(ele);
    if(!e.broken){
      e.shield--;
      if(e.shield<=0){e.broken=true;
        $('#breakFlash').style.display='block';
        setTimeout(()=>$('#breakFlash').style.display='none',1000);
        SFX.brk();shake(10);screenFlash('rgba(240,212,145,.4)');
        burst(e.x,e.y-e.sh*e.scale*.5,{n:34,col:'#f0d491',spd:4,life:800});
      }
    }
  }
  let final=Math.round(dmg*(e.broken?1.4:1));
  final=Math.max(1,final-(e.broken?0:e.def));
  let crit=Math.random()<(o.crit||.08);
  if(crit)final=Math.round(final*1.5);
  e.hp-=final;G.stats.dmg+=final;
  e.flashT=performance.now();e.shakeT=performance.now();
  SFX.hit();shake(crit?6:3);
  burst(e.x,e.y-e.sh*e.scale*.5,{n:8,col:weak?'#f0d491':'#dfe8f5',spd:2.4,life:450});
  const ty=e.y-e.sh*e.scale-20+rand(-10,10);
  floaty(e.x+rand(-16,16),ty,final,crit?'crit':(weak?'weak':'dmg'));
  updateTiles();
  if(e.hp<=0){
    e.alive=false;e.dissolve=performance.now();G.stats.kills++;
    G.battleExp=(G.battleExp||0)+(e.exp||0);
    SFX.die();
    burst(e.x,e.y-e.sh*e.scale*.5,{n:30,col:'#b8d4ea',spd:2.6,life:900,g:-.02});
    ribbon(`<b>${e.name}</b> 化作了飞雪`);
  }
}

/* ---- 敌人行动 ---- */
async function doEnemyAction(e,act){
  if(e.fear>0&&Math.random()<.18){
    ribbon(`<b>${e.name}</b> 被龙威慑，行动迟疑了！`);
    e.flashT=performance.now();await sleep(420);return;
  }
  if(act.kind==='summon'){
    ribbon(`<b>${e.name}</b> 唤醒了亡者……`);
    SFX.summon();screenFlash('rgba(90,180,255,.25)');
    e.lunge={t0:performance.now(),dx:0,dy:-16};
    const used=G.enemies.map(x=>`${x.x},${x.y}`);
    const slot=SLOTS.find(s=>!used.includes(`${s.x},${s.y}`))||SLOTS[0];
    await sleep(500);
    const u=makeUnit(FOES.wight,'enemy');u.x=slot.x;u.y=slot.y;u.entryT=performance.now();
    G.enemies.push(u);
    burst(u.x,u.y-u.sh*u.scale*.5,{n:24,col:'#7de8ff',spd:2.2,life:800,g:-.02});
    await sleep(500);return;
  }
  if(act.kind==='atk'){
    const tgts=act.t==='all'?alive(G.players):[pickPlayerTarget()];
    if(!tgts.length)return;
    if(act.cast){
      ribbon(`<b>${e.name}</b> 释放了 ${act.n}！`);
      SFX.ice();
      e.lunge={t0:performance.now(),dx:14,dy:-8};
      if(act.t==='all'){screenFlash('rgba(120,200,255,.3)');shake(7);}
      await sleep(300);
      for(const t of tgts){
        burst(t.x+rand(-20,0),t.y-t.sh*t.scale*.55,{n:16,col:'#8fe8ff',spd:2.8,life:600});
        await hitPlayer(t,rollEnemyDmg(e,act.mult));
        await sleep(act.t==='all'?180:0);
      }
      await sleep(400);return;
    }else{
      const t=tgts[0];
      ribbon(`<b>${e.name}</b> 的 ${act.n}！`);
      if(e.key==='giant'){SFX.stomp();shake(7);}
      e.lunge={t0:performance.now(),dx:(t.x-e.x)*.32,dy:(t.y-e.y)*.32};
      await sleep(260);
      slashFX(t.x,t.y-t.sh*t.scale*.5,'#9fd0ff',1);
      SFX.slash();
      for(const tt of tgts){
        await hitPlayer(tt,rollEnemyDmg(e,act.mult),{spDrain:act.spDrain});
        if(act.t==='all')await sleep(150);
      }
      await sleep(380);return;
    }
  }
}
function rollEnemyDmg(e,mult){return Math.round(e.atk*mult*rand(.88,1.12)*(e.fear>0?.72:1));}
function pickPlayerTarget(){const l=alive(G.players);return l[irand(0,l.length-1)];}
async function hitPlayer(p,dmg,o={}){
  if(!p.alive)return;
  let reduced=false;
  if(G.guardRounds>0){dmg*=.5;reduced=true;}
  if(p.guardSelf){dmg*=.5;reduced=true;}
  dmg=Math.max(1,Math.round(dmg));
  p.hp-=dmg;
  p.flashT=performance.now();p.shakeT=performance.now();
  SFX.hurt();shake(4);
  floaty(p.x+rand(-12,12),p.y-p.sh*p.scale-14,(reduced?'🛡':'')+dmg,'pdmg');
  burst(p.x,p.y-p.sh*p.scale*.5,{n:8,col:'#f0b9a8',spd:2,life:420});
  if(o.spDrain&&p.alive){
    p.sp=Math.max(0,p.sp-o.spDrain);
    floaty(p.x+rand(-12,12),p.y-p.sh*p.scale-34,'-'+o.spDrain+' SP','sp');
  }
  updateTiles();
  if(p.hp<=0){
    p.hp=0;p.alive=false;p.dissolve=performance.now();
    SFX.die();
    ribbon(`<b>${p.name}</b> 倒在了雪原上……`);
    updateTiles();
  }
}

/* ---- 回合/波次结算 ---- */
function checkDead(){return alive(G.players).length===0;}
async function checkEnd(){
  if(alive(G.players).length===0){await defeat();return true;}
  if(alive(G.enemies).length===0){await waveClear();return true;}
  return false;
}
async function waveClear(){
  G.phase='idle';updateTiles();
  if(G.wave>=G.battleWaves.length-1){await victory();return;}
  ribbon('<b>残敌已清</b> · 众人稍作休整',2000);
  SFX.heal();
  await sleep(1100);
  for(const p of alive(G.players)){
    p.hp=Math.min(p.maxhp,Math.round(p.hp+p.maxhp*.4));
    p.sp=Math.min(p.maxsp,p.sp+Math.round(p.maxsp*.35));
    floaty(p.x,p.y-p.sh*p.scale-10,'恢复','heal');
  }
  updateTiles();
  await sleep(700);
  await startWave(G.wave+1);
}
async function victory(){
  SFX.win();
  await sleep(600);
  G.battleResult='win';
  if(G.battleFinal){
    setTone(null);
    await playStory('ending');
    G.scene='end';
    showEnd(true);
    return;
  }
  for(const p of G.players){
    if(!p.alive){p.alive=true;p.dissolve=0;p.hp=Math.round(p.maxhp*.25);p.sp=Math.round(p.maxsp*.3);}
  }
  const exp=(G.battleExp||0)+(G.tameKey?(FOES[G.tameKey].exp||0):0);
  G.lastExp=exp;
  if(exp){
    for(const p of alive(G.players))if(!p.isBeast)gainExp(p,exp);
    if(G.deploy!=null&&G.beasts[G.deploy])beastGainExp(G.beasts[G.deploy],exp);
  }
  addItem('meat',1);
  updateTiles();
  G.scene='battleend';
}
async function defeat(){
  G.battleResult='lose';
  G.scene='end';SFX.lose();
  setTone(null);
  await sleep(900);
  showEnd(false);
}
function showEnd(win){
  const e=$('#end');
  e.className=win?'win':'lose';
  $('#endTitle').textContent=win?'长夜终尽 · 黎明将至':'凛冬已至 · 长夜无尽';
  $('#endSub').textContent=win?'夜王化作碎冰消散，临冬城的晨曦洒满雪原。':'英雄们倒在了风雪之中……';
  $('#endStats').innerHTML=`
    <div><b>${G.round}</b><span>回合数</span></div>
    <div><b>${G.stats.dmg}</b><span>总伤害</span></div>
    <div><b>${G.stats.kills}</b><span>消灭敌人</span></div>`;
  e.classList.remove('hidden');
}

/* ================= 远征 · 对话 · 大地图（v2） ================= */

/* ---- 通用工具 ---- */
function addItem(key,n){
  const it=G.items.find(i=>i.key===key);
  if(it){it.cnt+=n;ribbon(`获得 <b>${it.n}×${n}</b>`,2000);}
}
/* ================= Phase5：养成（成长/驯兽/喂食/图鉴） ================= */