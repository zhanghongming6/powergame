/* ================= 音效 ================= */
let AC=null,master=null,muted=false,bgmOn=false;
function initAudio(){
  if(AC)return;
  AC=new (window.AudioContext||window.webkitAudioContext)();
  master=AC.createGain();master.gain.value=.55;master.connect(AC.destination);
  const drone=AC.createOscillator(),dg=AC.createGain(),df=AC.createBiquadFilter();
  drone.type='sawtooth';drone.frequency.value=73.42;df.type='lowpass';df.frequency.value=220;
  dg.gain.value=.045;drone.connect(df);df.connect(dg);dg.connect(master);drone.start();
  const B={step:0,next:AC.currentTime+.1};
  const ARP=[293.66,349.23,440,523.25,440,349.23];let ai=0;
  function tick(){
    if(!AC)return;
    while(B.next<AC.currentTime+.18){
      const t=B.next,s=B.step;
      if(!muted){
        if(s%4===0){ // 低音
          const o=AC.createOscillator(),g=AC.createGain(),f=AC.createBiquadFilter();
          o.type='sawtooth';o.frequency.value=s%8===0?73.42:55;f.type='lowpass';f.frequency.value=300;
          g.gain.setValueAtTime(.16,t);g.gain.exponentialRampToValueAtTime(.001,t+.5);
          o.connect(f);f.connect(g);g.connect(master);o.start(t);o.stop(t+.55);}
        if(s%2===0){ // 琶音
          const o=AC.createOscillator(),g=AC.createGain();
          o.type='triangle';o.frequency.value=ARP[ai++%ARP.length];
          g.gain.setValueAtTime(.05,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);
          o.connect(g);g.connect(master);o.start(t);o.stop(t+.32);}
        if(s===0||s===8){ // 鼓
          const o=AC.createOscillator(),g=AC.createGain();
          o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(38,t+.16);
          g.gain.setValueAtTime(.4,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);
          o.connect(g);g.connect(master);o.start(t);o.stop(t+.22);}
      }
      B.step=(s+1)%16;B.next+=.3125;
    }
  }
  setInterval(tick,80);bgmOn=true;
}
function tone(freq,dur,type='square',vol=.15,slide=0,delay=0){
  if(!AC||muted)return;const t=AC.currentTime+delay;
  const o=AC.createOscillator(),g=AC.createGain();
  o.type=type;o.frequency.setValueAtTime(freq,t);
  if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,freq+slide),t+dur);
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.02);
}
function noiseBurst(dur=.15,vol=.2,fq=1800,delay=0){
  if(!AC||muted)return;const t=AC.currentTime+delay;
  const n=AC.createBufferSource(),b=AC.createBuffer(1,AC.sampleRate*dur,AC.sampleRate);
  const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  n.buffer=b;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=fq;
  const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);
  n.connect(f);f.connect(g);g.connect(master);n.start(t);
}
const SFX={
  menu(){tone(660,.06,'square',.06)},
  ok(){tone(520,.08,'square',.1);tone(780,.1,'square',.08,0,.06)},
  back(){tone(360,.08,'square',.08)},
  slash(){noiseBurst(.12,.25,2400);tone(220,.1,'sawtooth',.1,-120)},
  fire(){noiseBurst(.4,.22,900);tone(160,.45,'sawtooth',.14,240)},
  ice(){tone(1240,.3,'triangle',.1,-700);tone(1860,.22,'sine',.07,-900,.05)},
  hit(){noiseBurst(.1,.3,700);tone(90,.14,'sine',.3,-40)},
  heal(){[523,659,784].forEach((f,i)=>tone(f,.16,'triangle',.09,0,i*.09))},
  buff(){[392,523,659].forEach((f,i)=>tone(f,.2,'sine',.09,0,i*.1))},
  brk(){tone(196,.5,'sawtooth',.2,-60);noiseBurst(.4,.3,500);[784,988,1175].forEach((f,i)=>tone(f,.3,'square',.07,0,.1+i*.07))},
  die(){tone(300,.5,'sawtooth',.12,-260)},
  hurt(){noiseBurst(.12,.22,500);tone(70,.16,'sine',.25,-30)},
  summon(){tone(110,.8,'sawtooth',.12,60);noiseBurst(.6,.1,400,.1)},
  roar(){tone(160,1.4,'sawtooth',.22,-120);tone(80,1.6,'sawtooth',.18,-50,.05);noiseBurst(1.1,.2,600,.1)},
  wings(){for(let i=0;i<4;i++)noiseBurst(.16,.13,300,i*.19)},
  rumble(){tone(48,1.8,'sine',.4,-18);noiseBurst(1.5,.25,200)},
  stomp(){tone(70,.25,'sine',.45,-30);noiseBurst(.2,.3,350)},
  win(){[294,370,440,587].forEach((f,i)=>tone(f,.35,'triangle',.14,0,i*.16));tone(587,.9,'triangle',.12,0,.7)},
  lose(){[220,196,165,110].forEach((f,i)=>tone(f,.5,'sawtooth',.1,-20,i*.3))}
};

/* ================= 舞台与渲染 ================= */
const stage=$('#stage'),world=$('#world'),cv=$('#cv'),ctx=cv.getContext('2d');
function fit(){const s=Math.min(innerWidth/1280,innerHeight/720);stage.style.transform=`translate(-50%,-50%) scale(${s})`;}
addEventListener('resize',fit);fit();
(function stars(){const box=$('#stars');for(let i=0;i<46;i++){const d=document.createElement('div');d.className='star';
  const sz=Math.random()<.7?1:2;d.style.cssText=`left:${rand(0,1280)}px;top:${rand(6,300)}px;width:${sz}px;height:${sz}px;animation-delay:${rand(0,3)}s;animation-duration:${rand(2,5)}s`;box.appendChild(d);}})();

const SNOW=[],FXP=[],SLASH=[];
for(let i=0;i<95;i++)SNOW.push({x:rand(0,1280),y:rand(0,720),v:rand(.4,2.6),s:rand(1,3.4),ph:rand(0,6)});
function burst(x,y,o={}){const n=o.n||18;
  for(let i=0;i<n;i++){const a=rand(0,Math.PI*2),sp=rand(.4,o.spd||3);
    FXP.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-(o.up?1.4:0),g:o.g!==undefined?o.g:.05,
      t0:performance.now(),life:o.life||650,size:o.size||3.2,col:o.col||'#ffd28f',glow:o.glow!==false});}}
function slashFX(x,y,col='#e8f0ff',w=1){SLASH.push({x,y,t0:performance.now(),col,w,ang:rand(-.5,.2)});}
function shake(m){world.shakeM=Math.max(world.shakeM||0,m);world.shakeT=performance.now();}
function screenFlash(col,op=.5){const f=$('#flash');f.style.background=col;f.style.transition='none';f.style.opacity=op;
  requestAnimationFrame(()=>{f.style.transition='opacity .5s';f.style.opacity=0;});}
function floaty(x,y,txt,cls){const d=document.createElement('div');d.className='flt '+cls;d.textContent=txt;
  d.style.left=x+'px';d.style.top=y+'px';stage.appendChild(d);setTimeout(()=>d.remove(),1100);}

function drawSprite(u,t){
  const bob=u.alive?Math.sin(t/520+u.phase)*2.6:0;
  let x=u.x,y=u.y+bob,alpha=1;
  if(u.lunge){const p=clamp((t-u.lunge.t0)/340,0,1);const s=Math.sin(p*Math.PI);
    x+=u.lunge.dx*s;y+=u.lunge.dy*s;if(p>=1)u.lunge=null;}
  if(u.dissolve){const p=clamp((t-u.dissolve)/750,0,1);alpha=1-p;y-=p*8;if(p>=1)return;}
  if(u.entryT){const p=clamp((t-u.entryT)/600,0,1);alpha=Math.min(alpha,p);if(p>=1)u.entryT=0;}
  let sx=0;if(u.shakeT){const p=(t-u.shakeT)/260;if(p<1)sx=Math.sin(p*40)*4*(1-p);else u.shakeT=0;}
  const w=u.sw*u.scale,h=u.sh*u.scale;
  ctx.save();ctx.translate(x+sx,y);
  // 影子
  ctx.globalAlpha=alpha*.35;ctx.fillStyle='#020409';
  ctx.beginPath();ctx.ellipse(0,4,w*.30,7,0,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=alpha;
  const flip=u.side==='player';
  if(flip)ctx.scale(-1,1);
  ctx.drawImage(u.img,-w/2,-h,w,h);
  if(u.flashT){const p=clamp((t-u.flashT)/200,0,1);
    if(p<1){ctx.globalAlpha=alpha*(1-p);ctx.drawImage(u.fimg,-w/2,-h,w,h);}else u.flashT=0;}
  ctx.restore();
  return {x,y,top:y-h};
}
function drawEnemyOverlay(u,pos,t){
  if(!pos)return;
  const {x,top}=pos;let oy=top-16;
  if(u.entryT)return;
  // 护盾值
  const n=u.maxshield;const gap=13,total=(n-1)*gap;
  for(let i=0;i<n;i++){
    const px=x-total/2+i*gap;
    ctx.save();ctx.translate(px,oy);ctx.rotate(Math.PI/4);
    if(u.broken){ctx.strokeStyle='rgba(255,90,70,.85)';ctx.lineWidth=1;ctx.strokeRect(-4,-4,8,8);}
    else if(i<u.shield){ctx.fillStyle='#8fd8ff';ctx.shadowColor='#8fd8ff';ctx.shadowBlur=6;ctx.fillRect(-4,-4,8,8);}
    else {ctx.strokeStyle='rgba(143,216,255,.4)';ctx.lineWidth=1;ctx.strokeRect(-4,-4,8,8);}
    ctx.restore();
  }
  if(u.broken){
    const a=.6+Math.sin(t/120)*.4;
    ctx.fillStyle=`rgba(255,120,90,${a})`;ctx.font='700 15px Cinzel,serif';ctx.textAlign='center';
    ctx.fillText('BREAK',x,oy-14);
  }
  // 弱点
  oy-=u.broken?30:22;
  const ws=u.weak,m=(ws.length-1)*16;
  ws.forEach((el,i)=>{
    const px=x-m/2+i*16;
    ctx.save();ctx.translate(px,oy);ctx.rotate(Math.PI/4);
    if(u.found.has(el)){ctx.fillStyle=ELE[el].c;ctx.shadowColor=ELE[el].c;ctx.shadowBlur=5;ctx.fillRect(-5,-5,10,10);
      ctx.shadowBlur=0;ctx.fillStyle='#0a0f1c';ctx.font='700 8px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.save();ctx.rotate(-Math.PI/4);ctx.fillText(ELE[el].n[0],0,1);ctx.restore();}
    else{ctx.strokeStyle='rgba(160,175,200,.45)';ctx.lineWidth=1;ctx.strokeRect(-5,-5,10,10);
      ctx.rotate(-Math.PI/4);ctx.fillStyle='rgba(160,175,200,.6)';ctx.font='8px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('?',0,1);}
    ctx.restore();
  });
  // 龙威
  if(u.fear>0){
    const a=.55+Math.sin(t/160)*.3;
    ctx.fillStyle=`rgba(255,150,60,${a})`;ctx.font='700 12px "Noto Serif SC",serif';ctx.textAlign='center';
    ctx.fillText('🐉龙威',x,oy-16);
  }
  // 目标箭头
  if(G.targetMode==='enemy'&&G.hover===u){
    const by=oy-24+Math.sin(t/150)*5;
    ctx.fillStyle='#f0d491';ctx.shadowColor='#f0d491';ctx.shadowBlur=8;
    ctx.beginPath();ctx.moveTo(x,by+12);ctx.lineTo(x-9,by);ctx.lineTo(x+9,by);ctx.closePath();ctx.fill();ctx.shadowBlur=0;
  }
}
function drawGuardIcon(u,pos,t){
  if(!pos||G.guardRounds<=0||!u.alive)return;
  const a=.45+Math.sin(t/260)*.25;
  ctx.strokeStyle=`rgba(240,212,145,${a})`;ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(pos.x,pos.y-u.sh*u.scale*.55,u.sw*u.scale*.62,-Math.PI*.85,-Math.PI*.15);ctx.stroke();
}

/* ================= 消息 ================= */
let ribbonTimer=null;
function ribbon(html,ms=1600){const r=$('#ribbon');r.innerHTML=html;r.classList.add('show');
  clearTimeout(ribbonTimer);ribbonTimer=setTimeout(()=>r.classList.remove('show'),ms);}

/* ================= 角色栏 & 菜单 UI ================= */