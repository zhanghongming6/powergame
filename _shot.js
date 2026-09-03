// 截图工具：生成带跳跃脚本的临时副本 → Chrome headless 截图到 Temp
const fs=require('fs'),path=require('path'),cp=require('child_process');
const TMP=path.join(process.env.TEMP||'C:/Temp','bfshot');
fs.mkdirSync(TMP,{recursive:true});
const html=fs.readFileSync('powergame.html','utf8');

const HARNESS=`
<script>
(function(){
const M=location.hash.slice(1);
if(!M)return;
window.__NORT=1; // 截图模式：WebGL 仅由 __T.tick 显式驱动，避免 swiftshader 饿死虚拟时间
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function waitExplore(){
  let g=0;
  while(G.scene!=='explore'&&g++<600)await sleep(30);
}
// 跳过序章直接干净探索态（序章含教学战，泵对话无法越过）
async function cleanStart(){
  if(!ASSET.ready)await loadAssets();
  document.getElementById('title').classList.add('hidden');
  newCampaign();enterExplore();MOBS.length=0;
  await sleep(200);
}
function dbg(extra){
  const d=document.createElement('div');
  d.style.cssText='position:fixed;right:0;top:0;z-index:99;background:#033;color:#7f7;font:14px monospace;padding:6px';
  d.textContent=(extra?extra+' | ':'')+'fc='+window.__fc+' scene='+G.scene+' DLG='+!!DLG+' DESC='+!!(typeof DESC!=='undefined'&&DESC)+' RAID='+!!(typeof RAID!=='undefined'&&RAID)+' ARMY='+!!(typeof ARMY!=='undefined'&&ARMY);
  document.body.appendChild(d);
}
const TP={explore:[60,34],explore2:[20,40],explore3:[87,72],explore4:[115,54],gt:[60,31]};
async function battle(waves,wave,tone,opts){
  begin();await sleep(800);window.skipStory();await waitExplore();await sleep(100);
  initBattle(waves,Object.assign({tone:tone},opts||{}));await startWave(wave);
  $('#turnBadge').innerHTML='ROUND 1<span class="cn">'+G.battleWaves[G.wave].banner+'</span>';
  window.skipStory();await sleep(2800);window.skipStory();await sleep(400);
  for(let i=0;i<25;i++){if(window.__T)window.__T.brender();await sleep(40);}
  dbg('GL='+(window.A3D?A3D.dbg():'x'));
}
async function zoom3x(){
  const cv=$('#cv'),c3=$('#cv3'),ov=document.createElement('canvas');ov.width=1280;ov.height=720;
  const x=ov.getContext('2d');x.imageSmoothingEnabled=false;
  if(c3&&c3.style.display!=='none'&&window.__T){ // 同任务内强制渲染一帧，保证 WebGL 缓冲未清
    if(G.scene==='battle')window.__T.brender();else window.__T.tick(16);
    x.drawImage(c3,427,240,426,240,0,0,1280,720);
  }
  x.drawImage(cv,427,240,426,240,0,0,1280,720);
  document.body.innerHTML='';document.body.appendChild(ov);
  await sleep(300);
}
async function run(){
  if(M==='dlg'){
    await cleanStart();await sleep(200);
    runDlg([{sp:'琼恩',face:'jon',txt:'凛冬将至。我是临冬城的琼恩·雪诺。'},
      {sp:'丹妮莉丝',face:'dany',txt:'我以火与血之名起誓。'},
      {sp:'艾莉亚',face:'arya',txt:'女孩没有名字。'},
      {sp:'布蕾妮',face:'bri',txt:'誓言，必须兑现。'}]);
    await sleep(1500);
  }else if(M==='faces'){
    begin();await sleep(800);window.skipStory();await waitExplore();await sleep(200);
    const strip=document.createElement('canvas');strip.width=256;strip.height=64;
    const sx=strip.getContext('2d');sx.imageSmoothingEnabled=false;
    ['jon','dany','arya','bri'].forEach((k,i)=>{drawFace(k);sx.drawImage($('#dlgFace'),i*64,0);});
    const ov=document.createElement('canvas');ov.width=1024;ov.height=256;
    const ox=ov.getContext('2d');ox.imageSmoothingEnabled=false;
    ox.drawImage(strip,0,0,256,64,0,0,1024,256);
    document.body.innerHTML='';document.body.appendChild(ov);
    await sleep(300);
  }else if(M==='zoom'){
    begin();await sleep(800);window.skipStory();await waitExplore();await sleep(200);
    window.__T.teleport(60,35);
    for(let i=0;i<40;i++)window.__T.tick(16);
    await zoom3x();
  }else if(M==='zwall'){
    await battle(WALL_WAVES,0,'snow');await zoom3x();
  }else if(M==='wall'){await battle(WALL_WAVES,0,'snow');}
  else if(M==='walker'){await battle(FINAL_WAVES,1,'night');}
  else if(M==='nk'){await battle(FINAL_WAVES,2,'night');}
  else if(M==='giant'){await battle(GIANT_WAVES,0,'forest');}
  else if(M==='dbg'){
    const out=[];
    for(const th of['wall','forest','city','sea','night']){
      try{drawBattleBg(th,1234);out.push(th+':ok');}catch(e){out.push(th+':ERR:'+e.message);}
    }
    document.body.innerHTML='<pre style="font:24px monospace;color:#7f7">'+out.join('\\n')+'</pre>';
    await sleep(200);
  }
  else if(M.indexOf('bg_')===0){
    const th=M.slice(3);
    if(th==='forest')await battle(GIANT_WAVES,0,'forest');
    else if(th==='night')await battle(FINAL_WAVES,2,'night');
    else if(th==='city')await battle(DESERTER_WAVES,0,'city');
    else if(th==='sea')await battle([{banner:'B1 · 龙石岛',sub:'sea',foes:[{k:'spider',x:SLOTS[1].x,y:SLOTS[1].y}]}],0,'sea');
    else await battle(WALL_WAVES,0,'wall');
  }
  else if(M==='b2_desc'){ // 龙临演出：落地瞬间定格
    await cleanStart();
    await loadMap('dragonstone',33,24);MOBS.length=0;await sleep(2600);
    while(DLG||G.scene!=='explore'){skipStory();await sleep(40);}
    dragonDescent();DESC.t0=performance.now()-3100;window.__holdCine=true;
    window.__T.tick(16);frame(performance.now());
    document.getElementById('flash').style.opacity=0; // 虚拟时间下 CSS 过渡不推进，手动熄闪
    await sleep(300);
    dbg('p='+(DESC?(DESC.holdP!=null?DESC.holdP:((performance.now()-DESC.t0)/DESC.dur)):'null'));
  }
  else if(M==='b2_raid'){ // 大地图飞龙掠袭：掠过头顶瞬间
    await cleanStart();
    window.__T.teleport(60,34);window.__T.tick(16);
    startRaid();RAID.t0=performance.now()-1300;
    window.__T.tick(16);frame(performance.now());await sleep(300);
    dbg();
  }
  else if(M==='b3_army'){ // 列阵全景：横移中段定格
    await cleanStart();
    armyPanorama();ARMY.t0=performance.now()-3300;window.__holdCine=true;
    window.__T.tick(16);frame(performance.now());await sleep(300);
    dbg();
  }
  else if(M==='b3_charge'){ // 终局第三波：两军冲锋背景
    await battle(FINAL_WAVES,2,'night',{final:true});
    window.__T.tick(16);frame(performance.now());
    const ov=document.createElement('canvas');ov.width=1280;ov.height=720;
    ov.getContext('2d').drawImage(cv,0,0);
    ov.style.cssText='position:fixed;left:0;top:0;z-index:98';
    document.body.appendChild(ov);
    await sleep(200);
    dbg('bf='+G.battleFinal+' w='+G.wave+' chg='+window.__chg);
  }
  else if(M==='b4_ui'){ // B4: Kenney UI —— 队伍卡/血条/命令窗
    await battle(WALL_WAVES,0,'wall');
    for(const k of ['arya','bri','dany']){
      if(G.flags[k+'_joined'])continue;
      const d=PLAYERS_DEF.find(p=>p.key===k);const u=makeUnit(d,'player');
      const target=RECRUIT_LV[k]||1;while(u.lv<target){u.lv++;u.maxhp+=u.g.hp;u.hp=u.maxhp;u.atk+=u.g.atk;u.maxsp+=u.g.sp;u.sp=u.maxsp;}
      G.players.push(u);G.flags[k+'_joined']=1;
    }
    buildPartyBar();updateTiles();
    $('#worldHud').classList.add('hidden');$('#objHud').classList.add('hidden');
    $('#partyBar').classList.remove('hidden');
    openCmd(G.players[0]);updateTiles();
    await sleep(400);
    for(let i=0;i<15;i++){window.__T.brender();await sleep(40);}
  }
  else if(M==='clix'){ // 战斗 UI 点击流验证：目标面板隐藏 / 指令行可点 / 选敌命中 / Enter 确认
    await battle(WALL_WAVES,0,'wall');
    const L=[];const ok=(n,c)=>L.push(n+':'+(c?'OK':'FAIL'));
    // 1) 目标面板：战斗中隐藏、探索恢复
    G.objective={txt:'CLIX-OBJ'};renderObj();
    ok('obj_hidden_battle',$('#objHud').classList.contains('hidden'));
    G.scene='explore';renderObj();
    ok('obj_shown_explore',!$('#objHud').classList.contains('hidden'));
    G.scene='battle';renderObj();
    // 2) 指令行：无遮挡 + 可点击
    openCmd(G.players[0]);
    ok('cmd_open',G.phase==='cmd'&&!$('#cmdWrap').classList.contains('hidden'));
    const row=$('#cmdList .cmd[data-k="atk"]');
    const rc=row.getBoundingClientRect();
    const el=document.elementFromPoint(rc.left+rc.width/2,rc.top+rc.height/2);
    ok('atk_row_topmost',el===row);
    row.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    ok('click_to_target',G.phase==='target'&&G.targetMode==='enemy');
    ok('default_hover',!!G.hover);
    ok('partybar_pass',$('#partyBar').style.pointerEvents==='none');
    // 3) 敌方点击：投影框在最上层 + mousemove 命中 + click 确认
    const en=alive(G.enemies)[0];
    for(let i=0;i<6;i++){window.__T.brender();await sleep(20);}
    const pr=A3D.projectUnit(en);
    ok('enemy_proj',!!pr);
    if(pr){
      const ex=pr.x,ey=(pr.top+pr.y)/2;
      const el2=document.elementFromPoint(ex,ey);
      ok('enemy_topmost_cv',el2===cv);
      cv.dispatchEvent(new MouseEvent('mousemove',{bubbles:true,clientX:ex,clientY:ey}));
      ok('hover_on_model',G.hover===en);
      cv.dispatchEvent(new MouseEvent('click',{bubbles:true}));
      ok('click_confirm',G.phase==='anim');
    }
    // 4) Enter 连续确认：cmd→target→anim
    openCmd(G.players[0]);
    window.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'}));
    ok('enter_to_target',G.phase==='target');
    window.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'}));
    ok('enter_confirm',G.phase==='anim');
    const pass=L.filter(l=>l.indexOf(':OK')>0).length;
    document.body.innerHTML='<pre style="font:19px monospace;color:#7fffd4;background:#0b1220;padding:16px 30px;line-height:1.4">'+L.join('\\n')+'\\n'+pass+'/'+L.length+' PASS</pre>';
    await sleep(300);
  }
  else if(M==='var'){ // E1：变种战斗截图——元素染色 + 阶级光环 + 体型倍率目检
    await battle([{banner:'E1 · 变种',sub:'元素染色 · 阶级光环',foes:[
      {k:'walker.frost.boss',x:SLOTS[1].x,y:SLOTS[1].y},
      {k:'wolf.fire.elite',x:SLOTS[0].x,y:SLOTS[0].y},
      {k:'spider.poison.champ',x:SLOTS[3].x,y:SLOTS[3].y}]}],0,'wall');
  }
  else if(M==='e1'){ // E1 数据断言：图鉴≥500 / 变种576 / 命名boss36 / vt 免章节档 / 驯服种级判定
    const L=[];const ok=(n,c)=>L.push(n+':'+(c?'OK':'FAIL'));
    const keys=Object.keys(FOES);
    ok('total500',keys.length>=500);
    const dots=keys.filter(k=>k.indexOf('.')>0);
    ok('variants576',dots.length>=576);
    ok('named36',BOSSNAMED.length>=36);
    ok('named_in',BOSSNAMED.every(b=>FOES[b.id]&&FOES[b.id].vt&&FOES[b.id].tier==='boss'&&FOES[b.id].named&&FOES[b.id].drop));
    const wb=FOES['walker.frost.boss'];
    ok('wb_fields',!!wb&&wb.hp>4000&&wb.weak.indexOf('fire')>=0&&wb.tint>0&&wb.tscale>1.3);
    ok('wight_unchanged',FOES.wight.hp===255&&!FOES.wight.vt);
    const u1=makeUnit(FOES['wolf.fire.elite'],'enemy');
    ok('vt_skip',u1.maxhp===FOES['wolf.fire.elite'].hp&&u1.tint>0);
    const u2=makeUnit(FOES.wight,'enemy');
    ok('base_tier',Math.abs(u2.maxhp-181)<=4);
    ok('tame',tameSp('spider.poison.elite')&&tameSp('direwolf')&&!tameSp('wight.frost.normal')&&!tameSp('nk'));
    let sprOK=true,sprErr='';
    try{for(const k of keys)unitSprite(FOES[k]);}catch(e){sprOK=false;sprErr=e.message;}
    ok('sprite_all',sprOK);if(!sprOK)L.push('  err:'+sprErr);
    const pass=L.filter(l=>l.indexOf(':OK')>0).length;
    document.body.innerHTML='<pre style="font:19px monospace;color:#7fffd4;background:#0b1220;padding:16px 30px;line-height:1.4">'+L.join('\\n')+'\\n'+pass+'/'+L.length+' PASS</pre>';
    await sleep(300);
  }
  else if(M==='varz'){ // E1 变种近景（中心3倍放大）
    await battle([{banner:'E1 · 变种',sub:'元素染色 · 阶级光环',foes:[
      {k:'walker.frost.boss',x:SLOTS[1].x,y:SLOTS[1].y},
      {k:'wolf.fire.elite',x:SLOTS[0].x,y:SLOTS[0].y},
      {k:'spider.poison.champ',x:SLOTS[3].x,y:SLOTS[3].y}]}],0,'wall');
    await zoom3x();
  }
  else if(M==='wolf'){
    begin();await sleep(800);window.skipStory();await waitExplore();await sleep(200);
    window.__T.teleport(44,66);
    for(let i=0;i<45;i++){window.__T.tick(16);await sleep(16);}
    G.busy=true;window.__T.tick(16);
  }else if(M==='panel'){
    begin();await sleep(800);window.skipStory();await waitExplore();await sleep(200);
    window.__T.teleport(60,36);
    G.beasts.push({key:'wolf',lv:3,exp:20,aff:6});
    G.seen=G.seen||{};G.seen.wolf=true;G.seen.spider=true;G.seen.wight=true;
    deployBeast(0);toggleBeastPanel();
    for(let i=0;i<10;i++)window.__T.tick(16);
  }else if(M==='follow'){
    begin();await sleep(800);window.skipStory();await waitExplore();await sleep(200);
    window.__T.teleport(58,60);
    G.beasts.push({key:'giant',lv:2,exp:0,aff:2});
    deployBeast(0);
    window.__T.press('d');
    for(let i=0;i<75;i++){window.__T.tick(16);await sleep(16);}
    window.__T.release('d');
    for(let i=0;i<5;i++)window.__T.tick(16);
  }else if(M==='a2'){
    begin();await sleep(800);window.skipStory();await waitExplore();await sleep(100);
    MOBS.length=0;
    // A5 会在开局约2.6s后弹章节对白 → 周期性自动跳过，避免 scene/DLG 卡住 tryInteract
    setInterval(()=>{if(DLG||G.scene==='story')skipStory();},50);
    const L=[];
    const nearGate=async(tx,ty)=>{window.__T.teleport(tx,ty);for(let i=0;i<8;i++)window.__T.tick(16);let w=0;while((DLG||G.scene!=='explore')&&w++<140)await sleep(20);await sleep(30);};
    const ribbonTxt=()=>document.getElementById('ribbon').textContent;
    // 1 君临门锁
    await nearGate(95,72);tryInteract();await sleep(500);
    L.push('lockKL:'+(ribbonTxt().includes('许可')?'OK':'FAIL['+ribbonTxt()+']'));
    // 2 开门进君临
    G.flags.kl_open=1;tryInteract();await sleep(1400);
    L.push('enterKL:'+(G.mapId==='kingslanding'?'OK':'FAIL:'+G.mapId));MOBS.length=0;
    // 3 出城回北境
    await nearGate(45,49);tryInteract();await sleep(1400);
    L.push('backNorth:'+(G.mapId==='north'?'OK':'FAIL:'+G.mapId));MOBS.length=0;
    // 4 临冬城往返
    await nearGate(60,30);tryInteract();await sleep(1400);
    L.push('WF:'+(G.mapId==='winterfell'?'OK':'FAIL:'+G.mapId));MOBS.length=0;
    await nearGate(24,27);tryInteract();await sleep(1400);
    L.push('WFback:'+(G.mapId==='north'?'OK':'FAIL:'+G.mapId));MOBS.length=0;
    // 5 狼林锁→开→进→出
    await nearGate(10,38);tryInteract();await sleep(500);
    L.push('lockWW:'+(ribbonTxt().includes('第1章')?'OK':'FAIL['+ribbonTxt()+']'));
    G.flags.wf_open=1;tryInteract();await sleep(1400);
    L.push('WW:'+(G.mapId==='wolfswood'?'OK':'FAIL:'+G.mapId));MOBS.length=0;
    await nearGate(12,35);tryInteract();await sleep(1400);
    L.push('WWback:'+(G.mapId==='north'?'OK':'FAIL:'+G.mapId));MOBS.length=0;
    // 6 龙石岛往返
    await nearGate(112,52);G.flags.ds_open=1;tryInteract();await sleep(1400);
    L.push('DS:'+(G.mapId==='dragonstone'?'OK':'FAIL:'+G.mapId));MOBS.length=0;
    await nearGate(35,31);tryInteract();await sleep(1400);
    L.push('DSback:'+(G.mapId==='north'?'OK':'FAIL:'+G.mapId));MOBS.length=0;
    // 7 战争迷雾
    const FC=G.fog&&G.fog['north'];let n=0;if(FC)for(let i=0;i<FC.length;i++)if(FC[i])n++;
    L.push('fog:'+(n>50?'OK('+n+'tiles)':'FAIL:'+n));
    document.body.innerHTML='<pre style="font:30px monospace;color:#7fffd4;background:#0b1220;padding:36px;line-height:1.5">'+L.join('\\n')+'</pre>';
    await sleep(200);
  }else if(M==='a4'){
    begin();await sleep(800);window.skipStory();await waitExplore();await sleep(100);
    MOBS.length=0;
    const L=[];
    // 1 仅琼恩开局
    L.push('solo:'+(G.players.length===1&&G.players[0].key==='jon'?'OK':'FAIL:'+G.players.length+'/'+(G.players[0]&&G.players[0].key)));
    // 2 章节0敌档：尸鬼≈181/38
    const w=makeUnit(FOES.wight,'enemy');
    L.push('tier0:'+(Math.abs(w.maxhp-181)<=4&&w.atk===38?'OK('+w.maxhp+'/'+w.atk+')':'FAIL:'+w.maxhp+'/'+w.atk));
    // 3 经验曲线
    L.push('curve:'+(expNeed(1)===300&&expNeed(2)===470?'OK':'FAIL:'+expNeed(1)+'/'+expNeed(2)));
    // 4 每人3技能 2技能Lv3 3技能Lv6
    const sk=PLAYERS_DEF.every(p=>p.skills.length===3&&p.skills[1].req===3&&p.skills[2].req===6);
    L.push('skill3:'+(sk?'OK':'FAIL'));
    // 5 依次招募
    await recruit('arya');await recruit('bri');await recruit('dany');
    const order=G.players.map(p=>p.key).join(',');
    L.push('party:'+(G.players.length===4&&order==='jon,arya,bri,dany'?'OK('+order+')':'FAIL:'+order));
    L.push('flags:'+(G.flags.arya_joined&&G.flags.bri_joined&&G.flags.dany_joined?'OK':'FAIL'));
    const dy=G.players.find(p=>p.key==='dany');
    L.push('danyLv:'+(dy&&dy.lv===7&&dy.maxhp===320+6*34?'OK':'FAIL:'+(dy&&dy.lv)+'/'+(dy&&dy.maxhp)));
    // 6 重复招募免疫
    await recruit('arya');
    L.push('dup:'+(G.players.length===4?'OK':'FAIL:'+G.players.length));
    document.body.innerHTML='<pre style="font:30px monospace;color:#7fffd4;background:#0b1220;padding:36px;line-height:1.5">'+L.join('\\n')+'</pre>';
    await sleep(200);
  }else if(M==='a4c'){
    begin();await sleep(800);window.skipStory();await waitExplore();await sleep(100);
    const st=window.setTimeout;window.setTimeout=(fn,ms)=>ms===2600?0:st(fn,ms);
    recruit('arya');
    await sleep(900);
  }else if(M==='a5'){
    // A5 无头全流程：章节状态机+目标系统 8章触发顺序（真实事件：墓窖战/墙战/巨人潜行/护送战/金袍战/王座谈判/龙临/终局战）
    begin();
    let gd=0;while(gd++<100){skipStory();await sleep(40);if(G.scene==='explore'&&!DLG&&G.objective)break;}
    MOBS.length=0;
    const L=[];
    const ok=(n,c)=>L.push(n+':'+(c?'OK':'FAIL'));
    const has=t=>G.objective&&String(G.objective.txt).indexOf(t)>=0;
    // 通用泵：对话→skipStory；战斗→压血+普攻驱动；探索→tick(350)推进目标轮询
    const pump=async(n)=>{for(let i=0;i<n;i++){
      if(MOBS.length)MOBS.length=0; // 无头全流程：排除野怪遭遇
      if(DLG){skipStory();await sleep(20);continue;}
      if(G.scene==='battle'){
        if(G.awaiting){const en=alive(G.enemies)[0];if(en){en.hp=1;confirmAction({type:'atk',target:en});}await sleep(15);}
        else await sleep(25);
        continue;
      }
      if(ARMY||DESC||RAID){frame(performance.now());await sleep(120);continue;} // 演出结算依赖 frame()；虚拟时间 rAF 饥饿需强制驱动
      window.__T.tick(350);await sleep(25);
    }};
    const waitf=async f=>{let g=0;while(g++<900){await pump(2);if(f())return true;}return !!f();};
    const runInteract=async()=>{
      let done=false;Promise.resolve(tryInteract()).then(()=>{done=true;});
      let g=0;while(!done&&g++<1500){await pump(1);}
    };
    const stand=id=>{const n2=NPCS.find(v=>v.id===id),e=G.exp;e.px=n2.x;e.py=n2.y+12;
      e.camX=clamp(e.px-VW/2,0,MW*TS-VW);e.camY=clamp(e.py-VH/2,0,MH*TS-VH);e.region=null;e.trail=null;window.__T.tick(16);};
    // ---- 序章：杀敌目标(快进) → 篝火扎营(真实) → 第1章 ----
    ok('ch0',G.chapter===0&&has('磨砺剑术'));
    G.stats.kills+=2;
    await waitf(()=>has('篝火'));
    ok('obj_fire',has('篝火'));
    window.__T.teleport(62,36);window.__T.tick(16);
    await runInteract();
    await waitf(()=>G.chapter===1&&!DLG&&G.objective&&G.objective.map==='winterfell');
    ok('ch1',G.chapter===1&&!!G.flags.ch0_fire);
    // ---- 第1章 · 墓窖异变（真实战斗 → 艾莉亚入队） ----
    await loadMap('winterfell',24,27);MOBS.length=0;
    window.__T.teleport(14,23);window.__T.tick(16);
    await runInteract();
    await waitf(()=>!!G.flags.ch1_crypt&&!DLG&&G.objective&&G.objective.map==='north');
    ok('crypt',!!G.flags.arya_joined&&!!G.flags.wf_open&&!!G.flags.ch1_crypt);
    // ---- 侦察狼林隘口（邻近目标） → 第2章 ----
    await loadMap('north',10,39);MOBS.length=0;
    await waitf(()=>G.chapter===2&&!DLG&&has('黑城堡'));
    ok('ch2',G.chapter===2&&has('黑城堡'));
    // ---- 守墙（hookOldbear 真实战斗 → 龙晶） → 第3章 ----
    stand('oldbear');
    await runInteract();
    await waitf(()=>G.chapter===3&&!DLG&&G.objective&&G.objective.map==='wolfswood');
    ok('wall',!!G.flags.ch2_wall&&G.chapter===3);
    // ---- 第3章 · 巨人潜行（抉择选项） → 护送战 → 布蕾妮入队 → 第4章 ----
    await loadMap('wolfswood',12,35);MOBS.length=0;
    window.__T.teleport(64,17);window.__T.tick(16);
    await waitf(()=>!!G.flags.wolf_sneak&&!DLG&&has('商队'));
    ok('giant',!!G.flags.wolf_sneak);
    window.__T.teleport(60,35);window.__T.tick(16);
    await waitf(()=>G.chapter===4&&!DLG&&has('金袍'));
    ok('escort',!!G.flags.bri_joined&&G.chapter===4);
    // ---- 第4章 · 金袍队长（hookCap 真实战斗 → 入城文书） → 第5章 ----
    await loadMap('north',89,72);MOBS.length=0;
    stand('cap');
    await runInteract();
    await waitf(()=>G.chapter===5&&!DLG&&has('王座'));
    ok('cap',!!G.flags.ch4_kl&&!!G.flags.kl_open&&G.chapter===5);
    // ---- 第5章 · 王座厅谈判（真实 evThrone → 出海许可） ----
    await loadMap('kingslanding',45,31);MOBS.length=0;
    window.__T.teleport(45,30);window.__T.tick(16);
    await runInteract();
    await waitf(()=>!!G.flags.ch5_ds&&!DLG&&has('船坞'));
    ok('throne',!!G.flags.ch5_ds&&!!G.flags.ds_open);
    // ---- 渡海 → 龙石岛抵达钩子 → 第6章（龙临演出+丹妮莉丝入队） ----
    // 不可 await：抵达钩子的对话需要 pump 驱动
    loadMap('dragonstone',35,31);
    await waitf(()=>G.chapter===6&&!!G.flags.dany_joined&&has('北境'));
    MOBS.length=0;
    ok('ch6',G.chapter===6&&!!G.flags.dany_joined&&has('北境'));
    // ---- 返回北境 → 第7章（列阵→迎战抉择→终局战） ----
    loadMap('north',60,35);
    await waitf(()=>G.scene==='battle');
    ok('ch7',G.chapter===7&&!!G.flags.ch7_go&&!!G.battleFinal);
    await waitf(()=>G.scene==='end');
    ok('ending',G.scene==='end'&&$('#end').className==='win');
    document.body.innerHTML='<pre style="font:26px monospace;color:#7fffd4;background:#0b1220;padding:36px;line-height:1.5">'+L.join('\\n')+'</pre>';
    await sleep(300);
  }else if(M==='c1'){
    // C1 无头验证：16 条支线全流程（接取→采集/寻物/讨伐/伏击→交付→结算），断言 st==='done'
    await cleanStart();
    MOBS.length=0;
    const L=[];
    const ok=(n,c)=>L.push(n+':'+(c?'OK':'FAIL'));
    let curAct=null;
    const pump=async()=>{
      if(DLG){
        if(DLG.typing)finishLine();
        else if(DLG.choices){const c=DLG.choices.find(z=>z.act===curAct)||DLG.choices[0];pickChoice(c);}
        else advanceDlg();
        await sleep(8);return;
      }
      if(G.scene==='battle'){
        if(G.awaiting){const en=alive(G.enemies)[0];if(en){en.hp=1;confirmAction({type:'atk',target:en});}await sleep(15);}
        else await sleep(25);
        return;
      }
      window.__T.tick(60);await sleep(15);
    };
    const stand=id=>{const n2=NPCS.find(v=>v.id===id);if(!n2)return;const e=G.exp;e.px=n2.x;e.py=n2.y+12;
      e.camX=clamp(e.px-VW/2,0,MW*TS-VW);e.camY=clamp(e.py-VH/2,0,MH*TS-VH);e.region=null;e.trail=null;window.__T.tick(16);};
    const drive=async()=>{ // 完整驱动一次互动（对话+战斗）直到 tryInteract 结束
      let done=false;Promise.resolve(tryInteract()).finally(()=>done=true);
      let g=0;while(!done&&g++<6000)await pump();
      while(DLG&&g++<600)await pump();
    };
    const talkTo=async(id,act)=>{curAct=act||null;stand(id);await drive();};
    const findProp=async(tx,ty,act)=>{curAct=act||null;
      for(const n2 of NPCS){const dx=n2.x-(tx*TS+8),dy=n2.y-(ty*TS+8);if(dx*dx+dy*dy<90*90){n2.hx-=160;n2.hy-=160;n2.x=n2.hx;n2.y=n2.hy;}}
      window.__T.teleport(tx,ty);window.__T.tick(16);await drive();};
    const done=id=>G.quests[id]&&G.quests[id].st==='done';

    // ---- 北境：既有4条 + q_ferry + q_letter(接) ----
    await talkTo('luwin','ok');G.bag.herb=2;await talkTo('luwin');ok('q_herb',done('q_herb'));
    await talkTo('mikken','ok');G.bag.ore=2;await talkTo('mikken');ok('q_ore',done('q_ore'));
    await talkTo('dorn','ok');G.bag.berry=2;await talkTo('dorn');ok('q_berry',done('q_berry'));
    await talkTo('cap','ok');G.stats.kills+=3;await talkTo('cap');ok('q_kill',done('q_kill'));
    await talkTo('oldbear','ok');G.stats.kills+=3;await talkTo('oldbear');ok('q_ferry',done('q_ferry'));
    await talkTo('cressen','ok');await findProp(63,20);
    ok('q_letter_found',G.quests.q_letter&&G.quests.q_letter.found&&G.bag.letter>=1);

    // ---- 临冬城 ----
    await loadMap('winterfell',24,26);MOBS.length=0;
    await talkTo('chayle','ok');G.bag.herb=2;await talkTo('chayle');ok('q_herbW',done('q_herbW'));
    await talkTo('porther','ok');G.bag.ore=2;await talkTo('porther');ok('q_oreW',done('q_oreW'));
    await talkTo('beth','ok');await findProp(16,22);await talkTo('beth');ok('q_candle',done('q_candle'));

    // ---- 狼林 ----
    await loadMap('wolfswood',12,35);MOBS.length=0;
    await talkTo('owen','ok');await findProp(43,30);ok('q_hunter',done('q_hunter'));

    // ---- 北境商队护送 ----
    await loadMap('north',60,35);MOBS.length=0;
    await talkTo('sass','ok');await findProp(98,60);ok('q_escort',done('q_escort'));

    // ---- 君临 ----
    await loadMap('kingslanding',45,46);MOBS.length=0;
    await talkTo('mer','ok');ok('q_secret_seal',(G.bag.seal||0)>=1);
    await talkTo('septon','r2');ok('q_secret',done('q_secret'));ok('q_secret_flag',!!G.flags.seal_read);
    await talkTo('septon','ok');await findProp(59,42);await talkTo('septon');ok('q_cat',done('q_cat'));
    await talkTo('tova');ok('q_letter',done('q_letter'));
    await talkTo('tova','ok');G.bag.bread=2;await talkTo('tova');ok('q_soup',done('q_soup'));

    // ---- 龙石岛 ----
    await loadMap('dragonstone',35,26);MOBS.length=0;
    await talkTo('salla','ok');G.bag.ore=3;await talkTo('salla');ok('q_dglass',done('q_dglass'));
    await talkTo('mard','ok');await findProp(33,26);await talkTo('mard');ok('q_table',done('q_table'));

    const pass=L.filter(l=>l.indexOf(':OK')>0).length;
    document.body.innerHTML='<pre style="font:17px monospace;color:#7fffd4;background:#0b1220;padding:16px 30px;line-height:1.35">'+L.join('\\n')+'\\n'+pass+'/'+L.length+' PASS</pre>';
    await sleep(300);
  }else if(M==='c2'){
    localStorage.removeItem('bhl_save_v1');
    await begin();
    const L=[];
    const ok=(n,c)=>L.push(n+':'+(c?'OK':'FAIL'));
    const pump=async()=>{
      if(DLG){
        if(DLG.typing)finishLine();
        else if(DLG.choices)pickChoice(DLG.choices[0]);
        else advanceDlg();
        await sleep(8);return;
      }
      if(G.scene==='battle'){
        if(G.awaiting){const en=alive(G.enemies)[0];if(en){en.hp=1;confirmAction({type:'atk',target:en});}await sleep(15);}
        else await sleep(25);
        return;
      }
      window.__T.tick(60);await sleep(15);
    };
    const waitf=async f=>{let g=0;while(g++<800){await pump();if(f())return true;}return !!f();};
    // 序章 → 篝火 → 第1章（先等击杀目标激活再注入，避免空转吃光虚拟时间预算）
    await waitf(()=>G.objective&&/击败/.test(G.objective.txt||''));
    ok('prologue',G.chapter===0&&!!G.objective);
    G.stats.kills+=2;
    await waitf(()=>/篝火/.test((G.objective&&G.objective.txt)||''));
    window.__T.teleport(62,36);window.__T.tick(16);
    {let done=false;Promise.resolve(tryInteract()).finally(()=>done=true);let g=0;while(!done&&g++<3000)await pump();while((DLG||G.scene!=='explore')&&g++<800)await pump();}
    await waitf(()=>G.chapter===1&&!DLG&&G.scene==='explore');
    ok('ch1',G.chapter===1&&!!G.flags.ch0_fire);
    // 注入进度并存档
    G.quests.q_herb={st:'active',base:0};G.bag.herb=1;G.players[0].hp=Math.max(1,G.players[0].hp-10);
    G.beasts.push({key:'wolf',lv:2,exp:0,aff:2});deployBeast(0);
    const snap={ch:G.chapter,map:G.mapId,hp:G.players[0].hp,lv:G.players[0].lv,px:Math.round(G.exp.px)};
    saveGame();
    ok('saved',!!localStorage.getItem('bhl_save_v1'));
    // 回标题 → 继续按钮可见 → 读档恢复
    resetGame();
    ok('contBtn',!$('#titleContinue').classList.contains('hidden'));
    const r=await loadGame();
    ok('loaded',r&&G.scene==='explore');
    ok('rest_ch',G.chapter===snap.ch&&G.mapId===snap.map);
    ok('rest_quest',G.quests.q_herb&&G.quests.q_herb.st==='active'&&(G.bag.herb||0)>=1);
    const jon=G.players.find(p=>p.key==='jon'&&!p.isBeast);
    ok('rest_party',!!jon&&jon.hp===snap.hp&&jon.lv===snap.lv&&G.players.some(p=>p.isBeast&&p.key==='wolf'));
    ok('rest_pos',Math.abs(Math.round(G.exp.px)-snap.px)<4);
    ok('rest_obj',!!G.objective&&/墓窖/.test(G.objective.txt||'')&&typeof G.objective.check==='function');
    ok('rest_fog',!!(G.fog.north&&G.fog.north.some&&G.fog.north.some(v=>v)));
    const pass=L.filter(l=>l.indexOf(':OK')>0).length;
    document.body.innerHTML='<pre style="font:17px monospace;color:#7fffd4;background:#0b1220;padding:16px 30px;line-height:1.35">'+L.join('\\n')+'\\n'+pass+'/'+L.length+' PASS</pre>';
    await sleep(300);
  }else if(M==='tcont'){
    if(!ASSET.ready)await loadAssets();
    newCampaign();enterExplore();saveGame();resetGame();
    await sleep(800);
  }else if(M==='swf'||M==='sww'||M==='skl'||M==='sds'){
    const TGT={swf:['winterfell',24,26],sww:['wolfswood',12,35],skl:['kingslanding',45,46],sds:['dragonstone',35,26]}[M];
    begin();await sleep(800);window.skipStory();await waitExplore();await sleep(100);
    await loadMap(TGT[0],TGT[1],TGT[2]);MOBS.length=0;
    window.__T.press('d');for(let i=0;i<30;i++)window.__T.tick(16);
    window.__T.release('d');window.__T.press('s');
    for(let i=0;i<20;i++)window.__T.tick(16);window.__T.release('s');
    for(let i=0;i<10;i++)window.__T.tick(16);
  }else if({swf2:1,sww2:1,skl2:1,sds2:1}[M]){
    const TGT={swf2:['winterfell',24,15],sww2:['wolfswood',64,16],skl2:['kingslanding',45,29],sds2:['dragonstone',33,24]}[M];
    begin();await sleep(800);window.skipStory();await waitExplore();await sleep(100);
    await loadMap(TGT[0],TGT[1],TGT[2]);MOBS.length=0;
    for(let i=0;i<10;i++)window.__T.tick(16);
    await sleep(2600);
  }else if(TP[M]){
    begin();await sleep(800);window.skipStory();await waitExplore();await sleep(200);
    window.__T.teleport(TP[M][0],TP[M][1]);
    for(let i=0;i<40;i++)window.__T.tick(16);
  }
}
run().then(()=>{window.__SHOTSTOP=1;}).catch(e=>{document.title='ZERR:'+e.message;const d=document.createElement('div');d.style.cssText='position:fixed;left:0;top:0;z-index:99;background:#600;color:#fff;font:16px monospace;padding:8px;max-width:100%';d.textContent='ZERR:'+e.message+' | '+(e.stack||'').split('\\n')[1];document.body.appendChild(d);window.__SHOTSTOP=1;});
})();
</scr`+`ipt>`;

const game=html.replace('</body>',HARNESS+'\n</body>');
fs.writeFileSync(path.join(TMP,'game.html'),game,'utf8');
fs.cpSync('assets',path.join(TMP,'assets'),{recursive:true});
if(fs.existsSync('assets3d'))fs.cpSync('assets3d',path.join(TMP,'assets3d'),{recursive:true});

const CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe';
const modes=process.argv[2]?process.argv[2].split(','):['explore','explore2','wolf','wall','walker','nk','giant'];
const DOMMODE=process.argv[3]==='dom';
// title 用原始文件（无脚本）
fs.writeFileSync(path.join(TMP,'title.html'),html,'utf8');
function shoot(mode,file,budget){
  const args=['--headless','--disable-gpu','--no-sandbox','--mute-audio',
    '--autoplay-policy=no-user-gesture-required','--hide-scrollbars',
    '--use-angle=swiftshader','--enable-unsafe-swiftshader',
    '--window-size=1280,720','--virtual-time-budget='+budget];
  if(DOMMODE)args.push('--dump-dom');
  else{const out=path.join(TMP,'shot_'+mode+'.png');try{fs.unlinkSync(out);}catch(e){}args.push('--screenshot='+out);}
  args.push('file:///'+file.replace(/\\/g,'/')+(mode==='title'?'':'#'+mode));
  if(DOMMODE){
    const dom=cp.execFileSync(CHROME,args,{stdio:'pipe',timeout:420000,encoding:'utf8',maxBuffer:64*1024*1024});
    const m=dom.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
    console.log(mode,'DOMREPORT:\n'+(m?m[1].replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&'):'NO PRE'));
  }else{
    const out=path.join(TMP,'shot_'+mode+'.png');
    cp.execFileSync(CHROME,args,{stdio:'pipe',timeout:420000});
    console.log(mode,'->',out,fs.existsSync(out)?fs.statSync(out).size+'B':'MISSING');
  }
}
shoot('title',path.join(TMP,'title.html'),12000);
for(const m of modes)shoot(m,path.join(TMP,'game.html'),(m==='a2'||m==='a4')?45000:(m==='a5')?600000:(m==='c1')?240000:(m==='c2'||m==='clix')?60000:(m==='title'||m==='tcont'||m==='e1')?12000:16000);
console.log('DONE');
