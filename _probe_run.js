// E0 验证：headless Chrome 跑 probe3d.html，打印各模型 raw/baked 包围盒
const cp=require('child_process'),path=require('path');
const args=['--headless','--disable-gpu','--no-sandbox','--mute-audio','--hide-scrollbars',
 '--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files',
 '--window-size=1280,720','--virtual-time-budget=120000','--dump-dom',
 'file:///'+path.join(__dirname,'probe3d.html').replace(/\\/g,'/')];
const dom=cp.execFileSync('C:/Program Files/Google/Chrome/Application/chrome.exe',args,{stdio:'pipe',timeout:420000,encoding:'utf8',maxBuffer:64*1024*1024});
const m=dom.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
const txt=m?m[1].replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&'):'NO PRE';
console.log(txt);
console.log('TITLE:',(dom.match(/<title>([^<]*)<\/title>/)||[])[1]);
