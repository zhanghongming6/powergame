function expNeed(lv){return 70+(lv-1)*45;}
function gainExp(p,amt){
  if(p.isBeast)return;
  p.exp=(p.exp||0)+amt;
  while(p.exp>=expNeed(p.lv)){
    p.exp-=expNeed(p.lv);p.lv++;
    p.maxhp+=p.g.hp;p.hp=Math.min(p.maxhp,p.hp+p.g.hp);
    p.atk+=p.g.atk;p.maxsp+=p.g.sp;p.sp=Math.min(p.maxsp,p.sp+p.g.sp);
    ribbon(`<b>${p.name}</b> 升至 Lv.${p.lv}！生命/攻击/精力成长`,2000);
    SFX.win();
    updateTiles();
  }
}
function beastStats(b){
  const f=FOES[b.key];
  return {hp:Math.round(f.hp*(1+.12*(b.lv-1))),
    atk:Math.round(f.atk*(1+.10*(b.lv-1))*(1+Math.min(b.aff,50)*.006)),speed:f.speed};
}
function beastUnit(b){
  const f=FOES[b.key],st=beastStats(b);
  const u=makeUnit({key:b.key,name:f.name,cls:'魔兽伙伴',hp:st.hp,sp:0,atk:st.atk,speed:st.speed,
    spr:f.spr,pal:f.pal,scale:f.scale*.9,weap:b.key==='spider'?'dagger':'sword',lv:b.lv},'player');
  u.isBeast=true;u.x=845;u.y=470;
  return u;
}
function deployBeast(i){
  if(i<0||i>=G.beasts.length)return;
  G.players=G.players.filter(p=>!p.isBeast);
  G.deploy=i;
  const b=G.beasts[i];
  G.players.push(beastUnit(b));
  const e=G.exp;
  G.follow={x:e?e.px:0,y:e?e.py:0,face:'right'};
  if(e)e.trail=null;
  ribbon(`<b>${FOES[b.key].name}</b> 上阵 · 它将跟随你探索`,2000);
  renderBeastPanel();
}
function recallBeast(){
  if(G.deploy==null)return;
  G.players=G.players.filter(p=>!p.isBeast);
  G.deploy=null;G.follow=null;
  ribbon('魔兽伙伴归队休整',1600);
  renderBeastPanel();
}
function beastGainExp(b,amt){
  b.exp+=amt;let up=false;
  while(b.exp>=expNeed(b.lv)){b.exp-=expNeed(b.lv);b.lv++;up=true;}
  if(up){
    ribbon(`<b>${FOES[b.key].name}</b> 成长至 Lv.${b.lv}！`,2000);SFX.win();
    if(G.deploy!=null&&G.beasts[G.deploy]===b){
      const u=G.players.find(p=>p.isBeast);
      if(u){const st=beastStats(b);u.maxhp=st.hp;u.hp=st.hp;u.atk=st.atk;u.lv=b.lv;}
    }
    updateTiles();
  }
}
function feedBeast(i,food){
  const b=G.beasts[i];if(!b)return;
  if(food==='meat'){
    const it=G.items.find(v=>v.key==='meat');
    if(!it||it.cnt<=0){ribbon('背包里没有鲜肉',1500);return;}
    it.cnt--;
  }else{
    if(!(G.bag&&G.bag.berry>0)){ribbon('背包里没有浆果',1500);return;}
    G.bag.berry--;
  }
  const d=food==='meat'?2:1;
  b.aff+=d;
  ribbon(`<b>${FOES[b.key].name}</b> 开心地进食 · 好感 +${d}`,1800);
  SFX.heal();
  beastGainExp(b,food==='meat'?12:7);
  updateWorldHud();renderBeastPanel();
}
function toggleBeastPanel(){
  const p=$('#beastPanel');
  if(p.classList.contains('show')){p.classList.remove('show');return;}
  renderBeastPanel();p.classList.add('show');
}
function renderBeastPanel(){
  const box=$('#bpList');if(!box)return;
  let h='';
  if(!G.beasts.length)h+='<div class="bempty">还没有魔物伙伴 · 在战斗中把野兽打残后使用【驯服】</div>';
  G.beasts.forEach((b,i)=>{
    const f=FOES[b.key],st=beastStats(b),dep=G.deploy===i;
    h+=`<div class="brow"><b>${f.name}</b> Lv.${b.lv} <span class="st">HP ${st.hp} · 攻 ${st.atk} · 好感 ${b.aff} · 经验 ${b.exp}/${expNeed(b.lv)}</span>
      <div class="bbtns">
        ${dep?'<span class="bbtn" data-act="recall">归队休整中</span>'
             :`<span class="bbtn" data-act="deploy" data-i="${i}">上 阵</span>`}
        <span class="bbtn" data-act="meat" data-i="${i}">喂鲜肉</span>
        <span class="bbtn" data-act="berry" data-i="${i}">喂浆果</span>
      </div></div>`;
  });
  h+='<h4>图 鉴</h4>';
  for(const k of TAMEABLE){
    const met=G.seen&&G.seen[k],own=G.beasts.some(b=>b.key===k);
    h+=`<div class="bdex${met?'':' un'}">${met?FOES[k].name:'？？？'}${own?' ✓ 已驯服':(met?' · 可驯服':' · 未见')}</div>`;
  }
  box.innerHTML=h;
  box.querySelectorAll('.bbtn').forEach(el=>el.addEventListener('click',()=>{
    const a=el.dataset.act,i=+el.dataset.i;
    if(a==='deploy')deployBeast(i);
    else if(a==='recall')recallBeast();
    else if(a==='meat')feedBeast(i,'meat');
    else if(a==='berry')feedBeast(i,'berry');
  }));
}
function beastAutoAct(p){return {type:'atk',target:pickEnemyTarget()};}
function allLocsDone(){return ['wall','wolfswood','kingslanding','dragonstone'].every(k=>G.locs[k]==='done');}
const TONES={wall:'rgba(120,180,230,.16)',forest:'rgba(40,90,60,.22)',city:'rgba(200,140,60,.14)',night:'rgba(10,18,60,.32)'};
function setTone(theme){$('#tone').style.background=(theme&&TONES[theme])||'transparent';}

/* ---- 对话系统 ---- */
let DLG=null;
function playStory(key){return runDlg(STORY[key]);}