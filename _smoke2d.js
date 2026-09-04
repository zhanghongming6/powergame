// 2D 回退冒烟：把 Temp 副本里的 A3D.boot 强制为 false → RENDER_MODE 保持 '2d'，跑 ?smoke 断言
// 用法：先跑过任意 _shot.js（tcont 会刷新 Temp 副本），再 `node _smoke2d.js`
const fs=require('fs'),path=require('path'),cp=require('child_process');
const TMP=path.join(process.env.TEMP||'C:/Temp','bfshot');
const CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe';
const f=path.join(TMP,'game.html');
let html=fs.readFileSync(f,'utf8');
if(html.indexOf('if(A3D.boot(c3)){')<0){console.log('PATCH_TARGET_MISSING');process.exit(1);}
html=html.replace('if(A3D.boot(c3)){','if(false){');
const f2=path.join(TMP,'game2d.html');
fs.writeFileSync(f2,html);
const dom=cp.execFileSync(CHROME,['--headless','--disable-gpu','--no-sandbox','--mute-audio',
  '--use-angle=swiftshader','--enable-unsafe-swiftshader',
  '--window-size=1280,720','--virtual-time-budget=120000','--dump-dom',
  'file:///'+f2.replace(/\\/g,'/')+'?smoke'],
  {encoding:'utf8',timeout:180000,maxBuffer:64*1024*1024});
const sm=((dom.match(/<pre id="smokeLog"[^>]*>([\s\S]*?)<\/pre>/)||[])[1]||'NO LOG')
  .replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
console.log(sm);
const smOK=['SMOKE1 PASS','SMOKE2 PASS','SMOKE3 PASS','SMOKE4 PASS'].every(s=>sm.indexOf(s)>=0);
console.log('SMOKE1-4(2D):',smOK?'PASS':'FAIL');
