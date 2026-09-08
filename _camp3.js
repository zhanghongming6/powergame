const cp=require('child_process');
let wins=0;
for(let i=1;i<=3;i++){
  const r=cp.spawnSync('node',['--preserve-symlinks','--preserve-symlinks-main','_shot.js','a5','dom'],{encoding:'utf8',timeout:600000});
  const out=r.stdout||'';
  const lines=out.match(/\w[\w_]*:(OK|FAIL)/g)||[];
  const okc=lines.filter(l=>/:OK$/.test(l)).length,bad=lines.filter(l=>/:FAIL$/.test(l)).length;
  const win=(okc>=13&&bad===0);if(win)wins++;
  console.log('RUN'+i+(win?' WIN':' LOSE')+' '+okc+'OK/'+bad+'FAIL');
}
console.log('WINRATE '+wins+'/3 = '+Math.round(wins/3*100)+'%');
