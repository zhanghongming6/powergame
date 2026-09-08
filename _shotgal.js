// _shotgal.js — screenshot a page into ./_tmp_shots/<out>.png (workspace-local, sandbox-safe)
const cp=require('child_process'),path=require('path'),fs=require('fs');
const OUTDIR=path.join(__dirname,'_tmp_shots');fs.mkdirSync(OUTDIR,{recursive:true});
const page=process.argv[2],out=process.argv[3],budget=process.argv[4]||'60000';
const w=process.argv[5]||'2400',h=process.argv[6]||'1500';
const url='file:///'+path.join(__dirname,page).replace(/\\/g,'/');
const dst=path.join(OUTDIR,out+'.png');
const prof=path.join(OUTDIR,'_chrome_prof');
const args=['--headless','--disable-gpu','--no-sandbox','--mute-audio','--hide-scrollbars',
  '--use-angle=swiftshader','--enable-unsafe-swiftshader','--force-device-scale-factor=1',
  '--window-size='+w+','+h,'--user-data-dir='+prof,'--virtual-time-budget='+budget,
  '--screenshot='+dst,url];
const r=cp.spawnSync('C:/Program Files/Google/Chrome/Application/chrome.exe',args,{encoding:'utf8',timeout:180000,maxBuffer:64*1024*1024});
const sz=fs.existsSync(dst)?fs.statSync(dst).size:0;
console.log('png bytes:',sz,'status:',r.status);
if(r.stderr){const e=r.stderr.split('\n').filter(l=>/ERROR|FATAL|Failed|error/i.test(l)).slice(0,6);if(e.length)console.log('stderr:',e.join(' | '));}
