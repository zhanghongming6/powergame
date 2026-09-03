// 冒烟总控 v4：SMOKE1-4 断言链（页内 ?smoke：序章/行走/采集/支线/招募/战斗/驯服/墙战/养成）
// + 完整战役 ×3 通关率（_shot.js a5 13 断言链：序章→招募→切图→战斗→第7章→终局），目标 ≥60%
const fs=require('fs'),path=require('path'),cp=require('child_process');
const TMP=path.join(process.env.TEMP||'C:/Temp','bfshot');
const CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe';
const shot=(...a)=>cp.spawnSync('node',['_shot.js',...a],{encoding:'utf8',timeout:560000}).stdout;

/* ---- 完整战役单跑（camp 子命令）---- */
if(process.argv[2]==='camp'){
  const out=shot('a5','dom');
  const lines=out.match(/\w[\w_]*:(OK|FAIL)/g)||[];
  const ok=lines.filter(l=>/:OK$/.test(l)).length;
  const bad=lines.filter(l=>/:FAIL$/.test(l)).length;
  console.log(lines.join('\n'));
  console.log('CAMPAIGN '+(ok>=13&&bad===0?'WIN':'LOSE')+' ('+ok+' OK, '+bad+' FAIL)');
  process.exit(0);
}

/* ---- 1) 标题/继续标题截图（顺带刷新 Temp 副本）---- */
process.stdout.write(shot('tcont'));

/* ---- 2) SMOKE1-4 断言链 ---- */
const dom=cp.execFileSync(CHROME,['--headless','--disable-gpu','--no-sandbox','--mute-audio',
  '--use-angle=swiftshader','--enable-unsafe-swiftshader',
  '--window-size=1280,720','--virtual-time-budget=120000','--dump-dom',
  'file:///'+path.join(TMP,'game.html').replace(/\\/g,'/')+'?smoke'],
  {encoding:'utf8',timeout:180000,maxBuffer:64*1024*1024});
const sm=((dom.match(/<pre id="smokeLog"[^>]*>([\s\S]*?)<\/pre>/)||[])[1]||'NO LOG')
  .replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
console.log(sm);
const smOK=['SMOKE1 PASS','SMOKE2 PASS','SMOKE3 PASS','SMOKE4 PASS'].every(s=>sm.indexOf(s)>=0);
console.log('SMOKE1-4:',smOK?'PASS':'FAIL');
console.log('（通关率另跑：node _smoke.js camp ×3）');
