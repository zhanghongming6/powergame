function frame(t){
  requestAnimationFrame(frame);
  window.__fc=(window.__fc||0)+1;
  ctx.clearRect(0,0,1280,720);
  const overExplore=G.scene==='explore'||(G.scene==='story'&&G.prevScene==='explore');
  if(overExplore){
    updateExplore(Math.min(50,t-lastT),t);
    drawExplore(t);
  }else{
    // 后层雪
    ctx.fillStyle='rgba(230,240,255,.55)';
    for(const s of SNOW){
      s.y+=s.v*.7;s.x+=Math.sin(t/1400+s.ph)*.4+.2;
      if(s.y>724){s.y=-6;s.x=rand(0,1280);}
      if(s.s<2){ctx.globalAlpha=.4;ctx.fillRect(s.x,s.y,s.s,s.s);}
    }
    ctx.globalAlpha=1;
    if(G.scene==='battle'||G.scene==='battleend'||G.scene==='end'){
      // 单位（按 y 排序）
      const units=[...G.enemies,...G.players].filter(u=>u.alive||u.dissolve);
      units.sort((a,b)=>a.y-b.y);
      for(const u of units){
        const pos=drawSprite(u,t);
        if(u.side==='enemy'&&u.alive)drawEnemyOverlay(u,pos,t);
        if(u.side==='player')drawGuardIcon(u,pos,t);
      }
      // 斩击
      for(let i=SLASH.length-1;i>=0;i--){
        const s=SLASH[i],p=(t-s.t0)/240;
        if(p>=1){SLASH.splice(i,1);continue;}
        ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.ang);
        ctx.strokeStyle=s.col;ctx.globalAlpha=1-p;ctx.lineWidth=3*s.w*(1-p*.5);
        ctx.shadowColor=s.col;ctx.shadowBlur=10;
        ctx.beginPath();ctx.moveTo(-46+p*20,8-p*16);ctx.lineTo(46-p*20,-8+p*16);ctx.stroke();
        ctx.restore();
      }
      // 粒子
      for(let i=FXP.length-1;i>=0;i--){
        const f=FXP[i],p=(t-f.t0)/f.life;
        if(p>=1){FXP.splice(i,1);continue;}
        f.x+=f.vx;f.y+=f.vy;f.vy+=f.g;
        ctx.globalAlpha=1-p;ctx.fillStyle=f.col;
        if(f.glow){ctx.shadowColor=f.col;ctx.shadowBlur=6;}
        ctx.fillRect(f.x,f.y,f.size,f.size);ctx.shadowBlur=0;
      }
      ctx.globalAlpha=1;
    }
    // 前层雪
    for(const s of SNOW){
      if(s.s>=2){ctx.globalAlpha=.8;ctx.fillStyle='#eef4ff';ctx.fillRect(s.x,s.y,s.s,s.s);}
    }
    ctx.globalAlpha=1;
  }
  drawFlyby(t);
  // 震屏
  if(world.shakeT){
    const p=(t-world.shakeT)/300;
    if(p<1){const m=world.shakeM*(1-p);world.style.transform=`translate(${rand(-m,m)}px,${rand(-m,m)}px)`;}
    else{world.style.transform='';world.shakeT=0;world.shakeM=0;}
  }
  lastT=t;
}
requestAnimationFrame(frame);
updateTiles();
loadAssets();
if(location.search.indexOf('smoke')>=0)smokeRun();