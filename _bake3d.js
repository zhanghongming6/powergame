// D1 bake：GLB 裁剪（保留必需动画clip + 重打包BIN）→ base64 → assets3d/models_*.js
const fs=require('fs'),path=require('path');
const DIR=path.join(__dirname,'_tmp3d'),OUT=path.join(__dirname,'assets3d');
fs.mkdirSync(OUT,{recursive:true});
const KEEP_ANIM=/Walk$|Idle$|Death|Slash|Attack|Flying/i;

function pruneGLB(buf,keepAnim){
  if(buf.readUInt32LE(0)!==0x46546C67)return buf; // non-GLB passthrough
  const jsonLen=buf.readUInt32LE(12);
  const json=JSON.parse(buf.slice(20,20+jsonLen).toString('utf8'));
  const binOff=20+jsonLen+ ( (buf.readUInt32LE(20+jsonLen)===0x004E4942)?0:0 );
  // chunk2 header at 20+jsonLen
  let BIN=Buffer.alloc(0);
  const c2=20+jsonLen;
  if(buf.length>c2+8){const len=buf.readUInt32LE(c2);BIN=buf.slice(c2+8,c2+8+len);}
  if(!json.buffers||json.buffers.length===0)return buf;
  const anims=(json.animations||[]);
  const keepAnims=keepAnim?anims.filter(a=>keepAnim.test(a.name||'')):anims;
  // ---- referenced accessor set ----
  const acc=new Set();
  for(const m of (json.meshes||[]))for(const p of m.primitives){
    Object.values(p.attributes||{}).forEach(i=>acc.add(i));
    if(p.indices!=null)acc.add(p.indices);
    (p.targets||[]).forEach(t=>Object.values(t).forEach(i=>acc.add(i)));
  }
  for(const s of (json.skins||[])){if(s.inverseBindMatrices!=null)acc.add(s.inverseBindMatrices);}
  for(const a of keepAnims)for(const c of a.channels)for(const s of a.samplers){acc.add(s.input);acc.add(s.output);}
  // ---- referenced bufferViews ----
  const bv=new Set();
  for(const i of acc){const a=json.accessors[i];if(!a)continue;bv.add(a.bufferView);
    if(a.sparse){if(a.sparse.indices)bv.add(a.sparse.indices.bufferView);if(a.sparse.values)bv.add(a.sparse.values.bufferView);}}
  for(const im of (json.images||[]))if(im.bufferView!=null)bv.add(im.bufferView);
  // ---- repack BIN ----
  const newBV=[];const map={};
  let off=0;const parts=[];
  for(let i=0;i<(json.bufferViews||[]).length;i++){
    if(!bv.has(i)){continue;}
    const v=json.bufferViews[i];
    const src=BIN.slice(v.byteOffset||0,(v.byteOffset||0)+v.byteLength);
    map[i]=newBV.length;
    newBV.push({buffer:0,byteOffset:off,byteLength:v.byteLength,
      ...(v.byteStride?{byteStride:v.byteStride}:{}),...(v.target?{target:v.target}:{})});
    parts.push(src);off+=v.byteLength;
    const pad=(4-(off%4))%4;if(pad){parts.push(Buffer.alloc(pad));off+=pad;}
  }
  const newBIN=Buffer.concat(parts);
  // ---- rewrite json ----
  if(json.accessors)json.accessors.forEach(a=>{if(a.bufferView!=null&&map[a.bufferView]!=null)a.bufferView=map[a.bufferView];else if(a.bufferView!=null)a.bufferView=0;
    if(a.sparse){if(a.sparse.indices&&map[a.sparse.indices.bufferView]!=null)a.sparse.indices.bufferView=map[a.sparse.indices.bufferView];
      if(a.sparse.values&&map[a.sparse.values.bufferView]!=null)a.sparse.values.bufferView=map[a.sparse.values.bufferView];}});
  json.bufferViews=newBV;
  json.buffers=[{byteLength:newBIN.length}];
  if(anims.length)json.animations=keepAnims;
  (json.images||[]).forEach(im=>{if(im.bufferView!=null&&map[im.bufferView]!=null)im.bufferView=map[im.bufferView];});
  // ---- emit ----
  let js=Buffer.from(JSON.stringify(json),'utf8');
  const jpad=(4-(js.length%4))%4;if(jpad)js=Buffer.concat([js,Buffer.alloc(jpad,0x20)]);
  const bpad=(4-(newBIN.length%4))%4;
  const NB=newBIN.length?Buffer.concat([newBIN,Buffer.alloc(bpad)]):Buffer.alloc(0);
  const total=12+8+js.length+(NB.length?8+NB.length:0);
  const out=Buffer.alloc(total);
  out.write('glTF',0);out.writeUInt32LE(2,4);out.writeUInt32LE(total,8);
  out.writeUInt32LE(js.length,12);out.writeUInt32LE(0x4E4F534A,16);js.copy(out,20);
  if(NB.length){out.writeUInt32LE(NB.length,20+js.length);out.writeUInt32LE(0x004E4942,24+js.length);NB.copy(out,28+js.length);}
  return out;
}

const GROUPS={
  models_chars:['jon','arya','dany','bri','npc1','npc2','king'],
  models_mobs:['wolf','giant','spider','wight','walker','dragon','dragonEvo',
    // E0 v6 新怪 18 种
    'bat','snake','slime','goblin','skeleton','zombie','orc','orcEnemy','demon','blueDemon',
    'golemIce','golemEvo','shaman','dragonWhelp','direwolf','wraith','knightBlack','rogue'],
};
const props=fs.readdirSync(DIR).filter(f=>f.startsWith('p_')&&f.endsWith('.glb')).map(f=>f.slice(0,-4));
GROUPS.models_props=props;

for(const [file,keys] of Object.entries(GROUPS)){
  const lines=['// 自动生成（_bake3d.js）：CC0 GLB base64（裁剪后）。署名：Quaternius/Kenney/KayKit(Lousberg) CC0'];
  lines.push('window.MODELS3D=window.MODELS3D||{};');
  let bytes=0;
  for(const k of keys){
    const raw=fs.readFileSync(path.join(DIR,k+'.glb'));
    const isProp=k.startsWith('p_');
    const out=pruneGLB(raw,isProp?null:KEEP_ANIM);
    bytes+=out.length;
    lines.push(`MODELS3D.${k}='${out.toString('base64')}';`);
    console.log(k,Math.round(raw.length/1024)+'K ->',Math.round(out.length/1024)+'K');
  }
  fs.writeFileSync(path.join(OUT,file+'.js'),lines.join('\n'),'utf8');
  console.log(file+'.js',Math.round(bytes/1024/1024*100)/100,'MB raw');
}
