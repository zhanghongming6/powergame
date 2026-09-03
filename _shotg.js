// 通用 headless 截图：node _shotg.js <页名> <out名> [budgetMs]
const cp=require('child_process'),path=require('path');
const TMP=process.env.TEMP||'C:/Temp';
const page=process.argv[2],out=process.argv[3],budget=process.argv[4]||'90000';
const url='file:///'+path.join(__dirname,page).replace(/\\/g,'/');
const args=['--headless','--disable-gpu','--no-sandbox','--mute-audio','--use-angle=swiftshader','--enable-unsafe-swiftshader',
  '--window-size=1600,900','--virtual-time-budget='+budget];
if(out==='dom')args.push('--dump-dom');
else args.push('--screenshot='+TMP.replace(/\\/g,'/')+'/bfshot/'+out+'.png');
args.push(url);
const r=cp.spawnSync('C:/Program Files/Google/Chrome/Application/chrome.exe',args,
 {encoding:'utf8',timeout:240000,maxBuffer:64*1024*1024});
if(out==='dom'){
  const m=r.stdout.match(/<pre id="log"[^>]*>([\s\S]*?)<\/pre>/);
  console.log(m?m[1].replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&'):'NO LOG');
}else{
  console.log(r.stderr.split('\n').filter(l=>/bytes|ERROR|FATAL/.test(l)).join('\n')||'done');
}
