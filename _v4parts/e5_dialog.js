function runDlg(nodes){
  return new Promise(res=>{
    DLG={nodes,i:-1,onEnd:res,typing:false,full:'',shown:0,timer:null,choices:null,selIdx:0,sayEnd:false};
    G.prevScene=G.scene;G.scene='story';
    $('#dlg').classList.remove('hidden');
    nextNode();
  });
}
function closeDlg(){
  $('#dlg').classList.add('hidden');
  if(DLG&&DLG.timer)clearInterval(DLG.timer);
  if(G.scene==='story')G.scene=G.prevScene||'explore';
  DLG=null;
}
function nextNode(){
  DLG.i++;
  if(DLG.i>=DLG.nodes.length){const res=DLG.onEnd;closeDlg();res(G._lastAct);return;}
  renderLine(DLG.nodes[DLG.i]);
}
function renderLine(nd){
  if(nd.fx)runFx(nd.fx);
  $('#dlgName').textContent=nd.sp||'';
  if(nd.face){drawFace(nd.face);$('#dlg').classList.remove('noface');}
  else $('#dlg').classList.add('noface');
  DLG.choices=nd.choices||null;DLG.sayEnd=false;
  $('#dlgChoices').classList.remove('show');$('#dlgChoices').innerHTML='';
  $('#dlgNext').style.visibility='hidden';
  typeText(nd.txt||'');
}
function typeText(txt){
  DLG.full=txt;DLG.shown=0;DLG.typing=true;
  $('#dlgText').textContent='';
  clearInterval(DLG.timer);
  if(!txt){finishLine();return;}
  DLG.timer=setInterval(()=>{
    DLG.shown++;
    $('#dlgText').textContent=DLG.full.slice(0,DLG.shown);
    if(DLG.shown>=DLG.full.length)finishLine();
  },22);
}
function finishLine(){
  clearInterval(DLG.timer);DLG.timer=null;DLG.typing=false;
  $('#dlgText').textContent=DLG.full;
  if(DLG.choices)renderChoices();
  else $('#dlgNext').style.visibility='visible';
}
function advanceDlg(){
  if(!DLG)return;
  if(DLG.typing){finishLine();return;}
  if(DLG.choices)return;
  SFX.menu();
  if(DLG.sayEnd){const res=DLG.onEnd;closeDlg();res(G._lastAct);return;}
  nextNode();
}
function renderChoices(){
  const box=$('#dlgChoices');box.innerHTML='';DLG.selIdx=0;
  DLG.choices.forEach((c,i)=>{
    const b=document.createElement('button');
    b.className='dlgc'+(i===0?' selk':'');b.textContent=c.t;
    b.addEventListener('mouseenter',()=>{if(DLG){DLG.selIdx=i;markChoice();}});
    b.addEventListener('click',ev=>{ev.stopPropagation();pickChoice(c);});
    box.appendChild(b);
  });
  box.classList.add('show');
}
function markChoice(){
  $('#dlgChoices').querySelectorAll('.dlgc').forEach((b,i)=>b.classList.toggle('selk',i===DLG.selIdx));
}
function pickChoice(c){
  SFX.ok();
  if(c.eff)applyEff(c.eff);
  G._lastAct=c.act||null;
  $('#dlgChoices').classList.remove('show');
  if(c.say){
    DLG.choices=null;DLG.sayEnd=!!c.end;
    $('#dlgName').textContent='旁白';
    $('#dlg').classList.add('noface');
    typeText(c.say);
  }else if(c.end){
    const res=DLG.onEnd;closeDlg();res(c.act||null);
  }else nextNode();
}
function applyEff(ef){
  if(ef.atkAll){for(const p of G.players)p.atk+=ef.atkAll;ribbon(`全队攻击 +${ef.atkAll}`,2000);}
  if(ef.spAll){for(const p of G.players)p.sp=Math.min(p.maxsp,p.sp+ef.spAll);ribbon(`全队精力 +${ef.spAll}`,2000);}
  if(ef.healAll){for(const p of G.players)p.hp=Math.min(p.maxhp,p.hp+ef.healAll);}
  if(ef.item)addItem(ef.item,1);
  if(ef.flag)G.flags[ef.flag]=true;
}
function runFx(fx){
  if(fx==='rumble'){SFX.rumble();shake(6);}
  else if(fx==='dragon'){SFX.roar();shake(9);screenFlash('rgba(16,10,28,.4)');dragonFlyby(230,false);}
}
const FACES={};
function drawFace(key){
  const cnv=$('#dlgFace');
  if(!FACES[key]){
    const d={jon:[SPR.jon,PAL.jon],dany:[SPR.dany,PAL.dany],arya:[SPR.arya,PAL.arya],bri:[SPR.bri,PAL.bri]}[key];
    const spr=makeSprite(d[0],d[1]);
    const c=document.createElement('canvas');c.width=64;c.height=64;
    const x=c.getContext('2d');x.imageSmoothingEnabled=false;
    const crop=Math.min(d[0].length,9),sc=64/crop,dw=spr.w*sc;
    x.drawImage(spr.img,0,0,spr.w,crop,(64-dw)/2,0,dw,64);
    FACES[key]=c;
  }
  const x=cnv.getContext('2d');x.imageSmoothingEnabled=false;
  x.clearRect(0,0,64,64);x.drawImage(FACES[key],0,0);
}

/* ---- 龙演出 ---- */
let FLYBY=null;