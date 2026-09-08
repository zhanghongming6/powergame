// _charanim.js — 检查目录内 GLB 的动画 clip（Walk/Idle/Attack），用于筛选可动角色
const fs=require('fs'),p=require('path');
const dir=process.argv[2]||'_tmp3dchar';
if(!fs.existsSync(dir)){console.log('no dir',dir);process.exit(0);}
for(const f of fs.readdirSync(dir).filter(x=>x.endsWith('.glb')).sort()){
  const buf=fs.readFileSync(p.join(dir,f));
  if(buf.readUInt32LE(0)!==0x46546C67){console.log(f.slice(0,-4).padEnd(12),'notGLB');continue;}
  const jl=buf.readUInt32LE(12);const j=JSON.parse(buf.slice(20,20+jl).toString('utf8'));
  const an=(j.animations||[]).map(a=>a.name||'?');
  const W=an.some(n=>/Walk|Run/i.test(n)),I=an.some(n=>/Idle/i.test(n)),A=an.some(n=>/Attack|Slash|Melee|Punch|2H/i.test(n));
  console.log(f.slice(0,-4).padEnd(12),'clips:'+String(an.length).padEnd(3),'Walk:'+W,'Idle:'+I,'Atk:'+A,'|',an.slice(0,5).join(','));
}
