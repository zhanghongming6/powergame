/* adapter3d.js —— Three.js 渲染适配层（D2 探索层）
   唯一耦合模块：游戏通过 A3D.* 调用；全部数据经参数传入。
   模型：Quaternius / Kenney（CC0），base64 GLB 存于 models_*.js */
window.A3D=(function(){
'use strict';
const W=1280,H=720,TS=16;
const CAMH=11.25;                 // 45° 斜视角相机高度（≈2h=22.5 格可见纵深）
let renderer=null,scene=null,cam=null,ok=false,ready=false;
let exGroup=null,waterMesh=null;
const fires=[];
const exGeos=[],exMats=[];        // 本地图新建的几何/材质（清场时释放）
const TPL={};                     // key -> {root,clips,geos:[{g,mat}]}
const ents=new Map();             // 场上实体
const loader=(window.THREE&&THREE.GLTFLoader)?new THREE.GLTFLoader():null;
const DUM=window.THREE?new THREE.Object3D():null;
const _v=window.THREE?new THREE.Vector3():null;

/* ---------- 环境预设 ---------- */
const ENV={
 north:      {bg:0x16202e,amb:.34,sky:0xbdd3ff,gnd:0x39483a,hemi:.55,sun:0xfff2dd,sunI:.95,fogN:26,fogF:66},
 winterfell: {bg:0x181f2c,amb:.36,sky:0xc4d6f2,gnd:0x3c4a3c,hemi:.55,sun:0xffe8c4,sunI:.9, fogN:22,fogF:56},
 wolfswood:  {bg:0x0f1a15,amb:.30,sky:0x9fc4b0,gnd:0x24382a,hemi:.6, sun:0xd8f0d0,sunI:.7, fogN:16,fogF:46},
 kingslanding:{bg:0x241f14,amb:.4,sky:0xf2d8b0,gnd:0x4a4030,hemi:.5, sun:0xffd9a0,sunI:1.0,fogN:26,fogF:66},
 dragonstone:{bg:0x1a1520,amb:.32,sky:0xc0b0d8,gnd:0x3a2a30,hemi:.5, sun:0xffc890,sunI:.85,fogN:22,fogF:60}
};

/* ---------- 启动 ---------- */
function boot(canvas){
  if(!window.THREE||!canvas)return false;
  try{renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:true});}
  catch(e){return false;}
  renderer.setSize(W,H,false);
  renderer.setClearColor(0x000000,0);
  renderer.outputEncoding=THREE.sRGBEncoding;
  scene=new THREE.Scene();
  cam=new THREE.PerspectiveCamera(45,W/H,0.1,240);
  cam.position.set(0,CAMH,CAMH);cam.lookAt(0,0,0);
  ok=true;return true;
}

/* ---------- 模型加载 ---------- */
function b64buf(b64){
  const s=atob(b64),u=new Uint8Array(s.length);
  for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);
  return u.buffer;
}
function loadModels(){
  const src=window.MODELS3D||{};
  const keys=Object.keys(src);
  let pend=keys.length;
  if(!pend){ready=true;return;}
  const done=()=>{if(--pend<=0)ready=true;};
  for(const k of keys){
    let buf;try{buf=b64buf(src[k]);}catch(e){done();continue;}
    loader.parse(buf,'',(g)=>{
      try{
        const root=g.scene||g.scenes[0];
        const box=new THREE.Box3().setFromObject(root);
        const sz=box.getSize(new THREE.Vector3());
        const h=Math.max(sz.y,0.001);
        const s=1/h;
        root.scale.setScalar(s);
        // 归一：脚底 y=0，水平居中（记录偏移，克隆体按缩放倍率应用）
        root.position.set(-(box.min.x+box.max.x)/2*s,-box.min.y*s,-(box.min.z+box.max.z)/2*s);
        root.updateMatrixWorld(true);
        const geos=[];
        root.traverse(m=>{if(m.isMesh){
          const gg=m.geometry.clone();gg.applyMatrix4(m.matrixWorld);
          geos.push({g:gg,mat:m.material});
        }});
        TPL[k]={root,clips:g.animations||[],geos};
        if(k==='walker'){ // 异鬼/夜王：冰蓝幽光
          root.traverse(m=>{if(m.isMesh&&m.material){
            m.material.emissive=new THREE.Color(0x2a5a8a);m.material.emissiveIntensity=.5;}});
        }
      }catch(e){}
      done();
    },()=>done());
  }
}
function whenReady(){
  return new Promise(r=>{
    if(ready){r();return;}
    const t0=Date.now();
    const iv=setInterval(()=>{if(ready||Date.now()-t0>15000){clearInterval(iv);r();}},40);
  });
}

/* ---------- 工具 ---------- */
function hash2(x,y){return ((x*73856093)^(y*19349663))>>>0;}
function pickClip(clips){
  return clips.find(c=>/Walk|Run|Fly/i.test(c.name))||clips.find(c=>/Idle/i.test(c.name))||clips[0]||null;
}

/* ---------- 实例化 ---------- */
function instCells(key,cells,opt){instTo(exGroup,exGeos,exMats,key,cells,opt);}
function instTo(group,geos,matsT,key,cells,opt){
  const T=TPL[key];
  if(!T||!cells||!cells.length)return;
  const o=opt||{};
  const mats=cells.map(c=>{
    const h=hash2(c.x|0,(c.z|0)+101);
    const s=(o.s0!=null?o.s0:1)+((h%1000)/1000)*(((o.s1!=null?o.s1:1))-(o.s0!=null?o.s0:1));
    const rot=(c.rot!=null)?c.rot:(o.noRot?0:((h>>3)%628)/100);
    DUM.position.set(c.x,(o.y||0)+(c.y||0),c.z);
    DUM.rotation.set(0,rot,0);
    DUM.scale.set(s,((o.sy||1))*s,s);
    DUM.updateMatrix();
    return DUM.matrix.clone();
  });
  for(const part of T.geos){
    let mat=part.mat;
    if(o.tint!=null){mat=mat.clone();mat.color=new THREE.Color(o.tint);matsT.push(mat);}
    const im=new THREE.InstancedMesh(part.g,mat,cells.length);
    for(let i=0;i<mats.length;i++)im.setMatrixAt(i,mats[i]);
    im.frustumCulled=false;
    group.add(im);
  }
}
function freeClone(key,x,z,tint,emissive,s){freeTo(exGroup,exGeos,exMats,key,x,z,tint,emissive,s);}
function freeTo(group,geos,matsT,key,x,z,tint,emissive,s){
  const T=TPL[key];if(!T)return;
  for(const part of T.geos){
    const mat=part.mat.clone();
    if(tint!=null)mat.color=new THREE.Color(tint);
    if(emissive!=null){mat.emissive=new THREE.Color(emissive);mat.emissiveIntensity=.5;}
    matsT.push(mat);
    const m=new THREE.Mesh(part.g,mat);
    m.position.set(x,0,z);
    if(s)m.scale.setScalar(s);
    group.add(m);
  }
}

/* ---------- 地形 ---------- */
const TILECOL=[ // 0雪 1草 2土 3路 4水 5冰 6松 7雪松 8阔叶 9长城 10桥 11建筑基
 0xe8eef6,0x5c8a4a,0x7a6a50,0x9a8f76,0x274b73,0xc4dfe8,
 0x3c5a34,0xdfe7ee,0x4c7a3c,0xd4e4ee,0x7a5c3a,0x6b5f4e];
function buildGround(cfg){
  const MW=cfg.MW,MH=cfg.MH,MAP=cfg.MAP;
  const geo=new THREE.PlaneGeometry(MW,MH,MW,MH);
  const n=(MW+1)*(MH+1);
  const col=new Float32Array(n*3);
  const c=new THREE.Color();
  for(let iy=0;iy<=MH;iy++)for(let ix=0;ix<=MW;ix++){
    const tx=Math.min(ix,MW-1),ty=Math.min(iy,MH-1);
    const v=MAP[ty*MW+tx];
    c.setHex(TILECOL[v]||0x666666);
    const j=1+(((tx*7+ty*13)%5)-2)*0.022; // 轻微抖动防色带
    const i3=(iy*(MW+1)+ix)*3;
    col[i3]=c.r*j;col[i3+1]=c.g*j;col[i3+2]=c.b*j;
  }
  geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  const mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,metalness:0});
  const mesh=new THREE.Mesh(geo,mat);
  mesh.rotation.x=-Math.PI/2;
  mesh.position.set(MW/2,0,MH/2);
  exGeos.push(geo);exMats.push(mat);
  exGroup.add(mesh);
}
function buildWater(cfg){
  const MAP=cfg.MW?cfg.MAP:null;
  const cells=[];
  for(const [wx,wy] of cfg.WATER){
    if(MAP[wy*cfg.MW+wx]===5)continue; // 冰面不叠水
    cells.push([wx,wy]);
  }
  if(!cells.length)return;
  const geo=new THREE.PlaneGeometry(1,1);
  const mat=new THREE.MeshStandardMaterial({color:0x3d7ab5,transparent:true,opacity:.72,roughness:.35,metalness:.08});
  const im=new THREE.InstancedMesh(geo,mat,cells.length);
  const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/2,0,0));
  const m4=new THREE.Matrix4();
  for(let i=0;i<cells.length;i++){
    m4.compose(new THREE.Vector3(cells[i][0]+.5,.12,cells[i][1]+.5),q,new THREE.Vector3(1,1,1));
    im.setMatrixAt(i,m4);
  }
  im.frustumCulled=false;
  exGeos.push(geo);exMats.push(mat);
  waterMesh=im;
  exGroup.add(im);
}

/* ---------- 地图实体（树/长城/桥） ---------- */
function buildTiles(cfg){
  const MAP=cfg.MAP,MW=cfg.MW,MH=cfg.MH;
  const pine=[],pineS=[],oak=[],ice=[],bridge=[];
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
    const v=MAP[y*MW+x];
    if(v===6)pine.push({x:x+.5,z:y+.5});
    else if(v===7)pineS.push({x:x+.5,z:y+.5});
    else if(v===8)oak.push({x:x+.5,z:y+.5});
    else if(v===9)ice.push({x:x+.5,z:y+.5});
    else if(v===10)bridge.push([x,y]);
  }
  instCells('p_pineTallA',pine,{s0:3.0,s1:4.2});
  instCells('p_pineTallB',pineS,{s0:3.0,s1:4.2});
  instCells('p_oak',oak,{s0:2.4,s1:3.2});
  instCells('p_wall',ice,{s0:1.05,s1:1.05,sy:3.4,noRot:true,tint:0xd8e8f4});
  if(bridge.length){
    const g=new THREE.BoxGeometry(1,.12,1);
    const m=new THREE.MeshStandardMaterial({color:0x7a5c3a,roughness:.9});
    const im=new THREE.InstancedMesh(g,m,bridge.length);
    for(let i=0;i<bridge.length;i++){
      DUM.position.set(bridge[i][0]+.5,.06,bridge[i][1]+.5);
      DUM.rotation.set(0,0,0);DUM.scale.set(1,1,1);DUM.updateMatrix();
      im.setMatrixAt(i,DUM.matrix);
    }
    im.frustumCulled=false;
    exGeos.push(g);exMats.push(m);
    exGroup.add(im);
  }
}

/* ---------- PROPS（建筑/采集/门/篝火） ---------- */
const ROOFRE=/^t(48|49|50|52|53|54)$/,HWRE=/^t(72|73|74|76|77|78)$/;
function buildProps(cfg){
  const WSET=new Set();
  for(const p of cfg.props){
    if(p.cls==='t96'||p.cls==='t97'||p.cls==='t98'||p.cls==='t108')WSET.add(p.tx+','+p.ty);
  }
  const B={};
  const add=(k,x,z,extra)=>{(B[k]=B[k]||[]).push(Object.assign({x,z},extra||{}));};
  for(const p of cfg.props){
    const x=p.tx+.5,z=p.ty+.5,c=p.cls;
    if(c==='t96'||c==='t97'||c==='t98'||c==='t108'){
      const horiz=WSET.has((p.tx+1)+','+p.ty)||WSET.has((p.tx-1)+','+p.ty);
      add('cwall',x,z,{rot:horiz?0:Math.PI/2});
    }else if(c==='t92')add('tower',x,z);
    else if(c==='t105'||c==='t106')add('keep',x,z);
    else if(ROOFRE.test(c))add('roof',x,z,{rot:(hash2(p.tx,p.ty)&1)?0:Math.PI});
    else if(HWRE.test(c))add('hwall',x,z,{rot:(hash2(p.tx,p.ty)&1)?0:Math.PI});
    else if(c==='d63'||c==='d64'||c==='d65'||c==='d95')add('stone',x,z);
    else if(c==='t93'||c==='t112')add('tall',x,z);
    else if(c==='t104')add('chimney',x,z);
    else if(c==='t90')add('door',x,z);
    else if(c==='t83')add('sign',x,z);
    else if(c==='d18'||c==='d28')add('bigstone',x,z);
    else if(c==='d72'||c==='d74')add('dock',x,z);
    else if(p.kind==='fire')addFire(x,z);
    else if(p.kind==='gather'){
      if(p.art==='ore')add('rock',x,z);else add('bush',x,z);
    }
    else if(p.kind==='gate')add('arch',x,z);
    else if(p.kind==='quest'&&p.art==='cart')add('cart',x,z);
    else if(p.kind==='weirwood')freeClone('p_oak',x,z,0xb8503f,null,3.2);
    else if(p.kind==='volcano'){freeClone('p_rockTallA',x,z,0x2a2e36,0xff5a1a,6);
      const L=new THREE.PointLight(0xff7a2a,.8,8);L.position.set(x,1.6,z);exGroup.add(L);}
  }
  instCells('p_wall',B.cwall,{s0:1.08,s1:1.08,sy:2.1,noRot:false});
  instCells('p_wallBlock',B.tower,{s0:1.05,s1:1.05,sy:3.2,noRot:true});
  instCells('p_wallBlock',B.keep,{s0:1.1,s1:1.1,sy:2.2,noRot:true});
  instCells('p_roofGable',B.roof,{s0:1.2,s1:1.2,y:1.5});
  instCells('p_wallWinShut',B.hwall,{s0:1,s1:1,sy:1.6});
  instCells('p_statue',B.stone,{s0:1.2,s1:1.6});
  instCells('p_bush',B.bush,{s0:.35,s1:.5});
  instCells('p_rockSmallA',B.rock,{s0:.5,s1:.8});
  instCells('p_wallArch',B.arch,{s0:1.1,s1:1.1,sy:2.2,noRot:true});
  instCells('p_cart',B.cart,{s0:.8,s1:.8});
  instCells('p_wallBlock',B.tall,{s0:1,s1:1,sy:2.6,noRot:true});
  instCells('p_chimney',B.chimney,{s0:1,s1:1,sy:1.6});
  instCells('p_wallDoor',B.door,{s0:1,s1:1,sy:2.0,noRot:true});
  instCells('p_sign',B.sign,{s0:.8,s1:.95});
  instCells('p_stoneLargeA',B.bigstone,{s0:.6,s1:.8});
  instCells('p_logstack',B.dock,{s0:.6,s1:.75});
}
function addFire(x,z){
  const T=TPL['p_campfire'];
  if(T)for(const part of T.geos){
    const m=new THREE.Mesh(part.g,part.mat);m.scale.setScalar(.18);m.position.set(x,0,z);exGroup.add(m);
  }
  const L=new THREE.PointLight(0xff9a3a,.9,7);
  L.position.set(x,.8,z);exGroup.add(L);
  fires.push({L,ph:Math.random()*6});
}

/* ---------- 进场 ---------- */
function enterExplore(cfg){
  if(!ok)return;
  clearExplore();
  clearBattle();
  exGroup=new THREE.Group();
  scene.add(exGroup);
  const env=ENV[cfg.mapId]||ENV.north;
  scene.background=new THREE.Color(env.bg);
  scene.fog=new THREE.Fog(env.bg,env.fogN,env.fogF);
  exGroup.add(new THREE.AmbientLight(0xffffff,env.amb));
  const hemi=new THREE.HemisphereLight(env.sky,env.gnd,env.hemi);exGroup.add(hemi);
  const dl=new THREE.DirectionalLight(env.sun,env.sunI);dl.position.set(8,14,6);exGroup.add(dl);
  buildGround(cfg);
  buildWater(cfg);
  buildTiles(cfg);
  buildProps(cfg);
}
function clearExplore(){
  if(exGroup){
    scene.remove(exGroup);
    for(const g of exGeos)g.dispose&&g.dispose();
    for(const m of exMats)m.dispose&&m.dispose();
  }
  exGeos.length=0;exMats.length=0;
  ents.clear();fires.length=0;waterMesh=null;exGroup=null;
}

/* ---------- 角色实体 ---------- */
const FACES={left:-Math.PI/2,right:Math.PI/2,up:Math.PI,down:0};
let FWD=0; // 模型原生朝向修正；若截图发现背向，改为 Math.PI（±x 向则 ±Math.PI/2）
const MOB3D={wolf:['wolf',.6],spider:['spider',.65],giant:['giant',2.2],
  wight:['wight',1.1],walker:['walker',1.45],nk:['walker',1.6],bandit:['npc2',1.15]};
const BS=2.4; // 战斗单位全局倍率：归一模型(高1单位≈43px)→ 人形约125px，贴近2D比例并露出队伍栏上方可点
function entFor(slot,model){ // slot=场上占位键（唯一），model=模板键（可复用）
  let e=ents.get(slot);
  if(e)return e;
  const T=TPL[model];
  if(!T)return null;
  const root=(THREE.SkeletonUtils&&THREE.SkeletonUtils.clone)?THREE.SkeletonUtils.clone(T.root):T.root.clone();
  const g=new THREE.Group();g.add(root);
  exGroup.add(g);
  let mixer=null;
  const clip=pickClip(T.clips);
  if(clip){mixer=new THREE.AnimationMixer(root);mixer.clipAction(clip).play();}
  e={slot,model,g,mixer,yaw:Math.random()*6.28,bob:!clip,ph:Math.random()*6.283};
  ents.set(slot,e);
  return e;
}
function place(e,x,y,capH,tgtYaw,dt,t){
  e.g.scale.setScalar(capH);
  e.g.position.x=x/TS;e.g.position.z=y/TS;
  e.g.position.y=e.bob?Math.abs(Math.sin(t/170+e.ph))*.05:0;
  if(tgtYaw!=null){
    let d=((tgtYaw+FWD)-e.yaw)%(Math.PI*2);
    if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;
    e.yaw+=d*Math.min(1,dt/120);
  }
  e.g.rotation.y=e.yaw;
  if(e.mixer)e.mixer.update(dt/1000);
}
function npcYaw(n){
  if(!n.dx&&!n.dy)return null;
  if(Math.abs(n.dx)>=Math.abs(n.dy))return n.dx<0?-Math.PI/2:Math.PI/2;
  return n.dy<0?Math.PI:0;
}

/* ---------- 每帧 ---------- */
function renderExplore(dt,t,view){
  if(!ok||!exGroup||!view)return;
  exGroup.visible=true;
  // 相机：沿用 2D camX/camY（左上角，世界像素）
  const tx=(view.camX+W/2/2)/TS,tz=(view.camY+H/2/2)/TS; // VW=640,VH=360 → 半视口 320/180
  cam.position.set(tx,CAMH,tz+CAMH);
  cam.lookAt(tx,0,tz);
  // 水面微动
  if(waterMesh){waterMesh.position.y=.12+Math.sin(t/900)*.03;}
  // 篝火摇曳
  for(const f of fires)f.L.intensity=.75+.3*Math.sin(t/90+f.ph);
  // 实体
  const used=new Set();
  if(view.hero){
    const e=entFor('hero','jon');
    if(e){place(e,view.hero.x,view.hero.y,1.2,FACES[view.hero.face]!=null?FACES[view.hero.face]:null,dt,t);used.add('hero');}
  }
  if(view.npcs)for(const n of view.npcs){
    const slot='n'+n.id;
    const e=entFor(slot,n.model||'npc1');
    if(e){place(e,n.x,n.y,1.12,npcYaw(n),dt,t);used.add(slot);}
  }
  if(view.mobs)for(const m of view.mobs){
    const md=MOB3D[m.k]||['npc2',1.0];
    const slot='m'+m.id;
    const e=entFor(slot,md[0]);
    if(!e)continue;
    let yaw=null;
    if(m.chase)yaw=m.face>0?Math.PI/2:-Math.PI/2;
    else if(m.dx)yaw=m.dx<0?-Math.PI/2:Math.PI/2;
    place(e,m.x,m.y,md[1],yaw,dt,t);
    used.add(slot);
  }
  if(view.follower){
    const md=MOB3D[view.follower.k]||['wolf',.85];
    const slot='fol';
    const e=entFor(slot,md[0]);
    if(e){place(e,view.follower.x,view.follower.y,md[1]*.92,
        view.follower.face==='right'?Math.PI/2:-Math.PI/2,dt,t);
      used.add(slot);}
  }
  // 清理离场实体
  for(const k of Array.from(ents.keys())){
    if(!used.has(k)&&k!=='hero'){
      const e=ents.get(k);
      if(e&&e.g.parent)e.g.parent.remove(e.g);
      ents.delete(k);
    }
  }
  renderer.render(scene,cam);
}

/* ---------- 战斗层（正交相机：地面 1 单位 = 横70px/纵55px，与 2D 舞台坐标对齐） ---------- */
const BENV={
 wall:  {bg:0x16202e,amb:.34,sky:0xbdd3ff,gnd:0x39483a,hemi:.55,sun:0xfff2dd,sunI:.95,fogN:46,fogF:90,gndC:0xcfd8e2},
 forest:{bg:0x0c1a10,amb:.30,sky:0x9fc4b0,gnd:0x24382a,hemi:.6, sun:0xd8f0d0,sunI:.7, fogN:42,fogF:78,gndC:0x2c4a28},
 city:  {bg:0x2a1a10,amb:.40,sky:0xf2d8b0,gnd:0x4a4030,hemi:.5, sun:0xffd9a0,sunI:1.0,fogN:46,fogF:90,gndC:0x6a5a40},
 sea:   {bg:0x101820,amb:.36,sky:0x9fc4d8,gnd:0x2a3a4a,hemi:.55,sun:0xdfe8f0,sunI:.85,fogN:46,fogF:95,gndC:0x3a4a58},
 night: {bg:0x070b18,amb:.22,sky:0x3a4a7a,gnd:0x10182a,hemi:.35,sun:0x8aa4d8,sunI:.5, fogN:42,fogF:80,gndC:0x232c3c}
};
let btGroup=null,btTheme=null,bCam=null;
const btUnits=new Map();            // 单位对象 -> {g,mats,baseEm,mixer,bob,ph,h}
const btGeos=[],btMats=[];
const BLOBGEO=new THREE.CircleGeometry(1,20);
const clampB=(v,a,b)=>v<a?a:v>b?b:v;
const BHW=640/70,BHH=360/70;        // 正交半宽/半高（相机单位）
const BPHI=Math.asin(55/70);        // 俯仰：地面纵深 1 单位 = 55px
function bLine(x0,x1,step,z,jit,rot){
  const out=[];let i=0;
  for(let x=x0;x<=x1;x+=step,i++)out.push({x:x+((hash2(i,z*10)|0)%100)/100*(jit||0),z:z+((hash2(i+7,z*10)|0)%100)/100*(jit||0),rot:rot});
  return out;
}
function buildBattle(theme){
  if(btGroup)scene.remove(btGroup);
  for(const g of btGeos)g.dispose&&g.dispose();
  for(const m of btMats)m.dispose&&m.dispose();
  btGeos.length=0;btMats.length=0;btUnits.clear();
  btGroup=new THREE.Group();scene.add(btGroup);
  const env=BENV[theme]||BENV.wall;
  scene.background=new THREE.Color(env.bg);
  scene.fog=new THREE.Fog(env.bg,env.fogN,env.fogF);
  btGroup.add(new THREE.AmbientLight(0xffffff,env.amb));
  btGroup.add(new THREE.HemisphereLight(env.sky,env.gnd,env.hemi));
  const dl=new THREE.DirectionalLight(env.sun,env.sunI);dl.position.set(6,12,8);btGroup.add(dl);
  const gg=new THREE.PlaneGeometry(46,32);
  const gm=new THREE.MeshStandardMaterial({color:env.gndC,roughness:.95});
  const gmesh=new THREE.Mesh(gg,gm);gmesh.rotation.x=-Math.PI/2;gmesh.position.set(0,0,-2);
  btGeos.push(gg);btMats.push(gm);btGroup.add(gmesh);
  if(theme==='forest'){
    instTo(btGroup,btGeos,btMats,'p_pineTallA',bLine(-14,14,2.6,-4.6,1.2),{s0:2.7,s1:3.6});
    instTo(btGroup,btGeos,btMats,'p_pineTallB',bLine(-12,12,3.4,-3.2,1.4),{s0:2.2,s1:3.0});
    instTo(btGroup,btGeos,btMats,'p_bush',bLine(-10,10,4,-2.2,1),{s0:.4,s1:.6});
  }else if(theme==='city'){
    for(let x=-11;x<=9;x+=4){
      instTo(btGroup,btGeos,btMats,'p_wallBlock',[{x:x,z:-2.6}],{s0:1.7,s1:1.7,sy:1.3,noRot:true});
      instTo(btGroup,btGeos,btMats,'p_roofGable',[{x:x,z:-2.6,y:2.2}],{s0:1.25,s1:1.25});
    }
    instTo(btGroup,btGeos,btMats,'p_wallBlock',[{x:-13.5,z:-2.8},{x:13.5,z:-2.8}],{s0:1.4,s1:1.4,sy:2.6,noRot:true});
    instTo(btGroup,btGeos,btMats,'p_wall',bLine(-14,14,1,-2,0,Math.PI/2),{s0:1.05,s1:1.05,sy:1.6,noRot:true});
  }else if(theme==='sea'){
    const wg=new THREE.PlaneGeometry(46,32);
    const wm=new THREE.MeshStandardMaterial({color:0x3d7ab5,transparent:true,opacity:.7,roughness:.35});
    const wmesh=new THREE.Mesh(wg,wm);wmesh.rotation.x=-Math.PI/2;wmesh.position.set(0,.1,-2);
    btGeos.push(wg);btMats.push(wm);btGroup.add(wmesh);
    instTo(btGroup,btGeos,btMats,'p_rockTallA',[{x:-10,z:-3.2},{x:9,z:-3.5},{x:0,z:-3.8}],{s0:2.2,s1:3.4});
    instTo(btGroup,btGeos,btMats,'p_rockSmallA',bLine(-12,12,5,-2.2,1),{s0:.5,s1:.9});
  }else if(theme==='night'){
    instTo(btGroup,btGeos,btMats,'p_pineTallA',bLine(-14,14,4,-3.6,1.4),{s0:2.3,s1:3.1,tint:0x1a2a22});
    for(const fx of[-9,9]){
      freeTo(btGroup,btGeos,btMats,'p_campfire',fx,-4,null,null,.18);
      const L=new THREE.PointLight(0xff9a3a,.9,10);L.position.set(fx,.8,-4);btGroup.add(L);
    }
  }else{ // wall：背景墙排落位于地平线上方（z=-2.2 → 屏幕底部落在 y≈310）
    instTo(btGroup,btGeos,btMats,'p_wall',bLine(-14,14,1,-2.2,0,Math.PI/2),{s0:1.12,s1:1.12,sy:2.9,noRot:true,tint:0x46566a});
    instTo(btGroup,btGeos,btMats,'p_wallBlock',[{x:-13,z:-2.5},{x:13,z:-2.5}],{s0:1.5,s1:1.5,sy:2.8,noRot:true,tint:0x3a4a5e});
    instTo(btGroup,btGeos,btMats,'p_rockSmallA',bLine(-12,12,6,-0.9,1),{s0:.4,s1:.7});
  }
}
function bModel(u){
  const md=MOB3D[u.key];
  if(md)return md;
  if(TPL[u.key])return [u.key,1.2];
  return ['npc2',1.1];
}
function bEnsure(u){
  let e=btUnits.get(u);if(e)return e;
  const md=bModel(u),T=TPL[md[0]];if(!T)return null;
  const root=(THREE.SkeletonUtils&&THREE.SkeletonUtils.clone)?THREE.SkeletonUtils.clone(T.root):T.root.clone();
  const mats=[],baseEm=[];
  root.traverse(m=>{if(m.isMesh&&m.material){
    const nm=m.material.clone();nm.transparent=true;m.material=nm;mats.push(nm);
    baseEm.push({m:nm,e:nm.emissive?nm.emissive.getHex():0,i:nm.emissiveIntensity||1});
  }});
  const g=new THREE.Group();g.add(root);g.scale.setScalar(md[1]*BS);btGroup.add(g);
  const shm=new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.22,depthWrite:false});
  const sh=new THREE.Mesh(BLOBGEO,shm);sh.rotation.x=-Math.PI/2;sh.position.y=.02;sh.scale.setScalar(.36);
  g.add(sh);mats.push(shm);for(const m of mats)btMats.push(m);
  let mixer=null;const clip=pickClip(T.clips);
  if(clip){mixer=new THREE.AnimationMixer(root);mixer.clipAction(clip).play();}
  e={g,mats,baseEm,mixer,bob:!clip,ph:Math.random()*6.283,h:md[1]*BS};
  btUnits.set(u,e);return e;
}
function renderBattle(dt,t,view){
  if(!ok||!view)return;
  if(exGroup)exGroup.visible=false;
  const theme=view.theme||'wall';
  if(theme!==btTheme||!btGroup){btTheme=theme;buildBattle(theme);}
  if(!bCam)bCam=new THREE.OrthographicCamera(-BHW,BHW,BHH,-BHH,0.1,160);
  const sp=Math.sin(BPHI),cp=Math.cos(BPHI);
  bCam.position.set(0,40*sp,40*cp-70/55);bCam.lookAt(0,0,-70/55);bCam.updateMatrixWorld();
  const seen=new Set();
  for(const u of view.units||[]){
    if(!u.alive&&!u.dissolve){const e0=btUnits.get(u);if(e0){btGroup.remove(e0.g);btUnits.delete(u);}continue;}
    const e=bEnsure(u);if(!e)continue;seen.add(u);
    let x=u.x,y=u.y;
    if(u.lunge){const p=clampB((t-u.lunge.t0)/340,0,1),s=Math.sin(p*Math.PI);
      x+=u.lunge.dx*s;y+=u.lunge.dy*s;if(p>=1)u.lunge=null;}
    let sx=0;if(u.shakeT){const p=(t-u.shakeT)/260;if(p<1)sx=Math.sin(p*40)*4*(1-p);else u.shakeT=0;}
    e.g.position.set((x-640)/70+sx/70,0,(y-430)/55);
    e.g.rotation.y=u.side==='player'?Math.PI:0;
    let op=1;
    if(u.dissolve){const p=clampB((t-u.dissolve)/750,0,1);op=1-p;e.g.position.y=-p*.4;
      if(p>=1){btGroup.remove(e.g);btUnits.delete(u);continue;}}
    if(u.entryT){const p=clampB((t-u.entryT)/600,0,1);op=Math.min(op,p);if(p>=1)u.entryT=0;}
    let flash=0;
    if(u.flashT){const p=clampB((t-u.flashT)/200,0,1);if(p<1)flash=1-p;else u.flashT=0;}
    for(const m of e.mats)m.opacity=op;
    if(flash>0)for(const m of e.mats){m.emissive.setHex(0xffffff);m.emissiveIntensity=flash*1.2;}
    else for(const b of e.baseEm){b.m.emissive.setHex(b.e);b.m.emissiveIntensity=b.i;}
    e.g.visible=op>0.02;
    if(e.mixer)e.mixer.update(dt/1000);
    else e.g.position.y+=Math.abs(Math.sin(t/170+e.ph))*.03;
  }
  for(const u of Array.from(btUnits.keys()))if(!seen.has(u)){
    const e=btUnits.get(u);btGroup.remove(e.g);btUnits.delete(u);}
  renderer.render(scene,bCam);
}
function projectUnit(u){
  const e=btUnits.get(u);if(!e||!ok||!bCam)return null;
  const p=e.g.position;
  _v.set(p.x,p.y+e.h,p.z).project(bCam);
  if(_v.z>1||_v.z<-1)return null;
  const top=(1-_v.y)/2*H;
  _v.set(p.x,p.y,p.z).project(bCam);
  return {x:(_v.x+1)/2*W,y:(1-_v.y)/2*H,top};
}
function clearBattle(){
  if(btGroup){scene.remove(btGroup);btGroup=null;btTheme=null;btUnits.clear();}
}

/* ---------- 投影：世界格坐标 → 屏幕像素 ---------- */
function project3D(xTile,yUp,zTile){
  if(!ok)return null;
  _v.set(xTile,yUp,zTile).project(cam);
  if(_v.z>1||_v.z<-1)return null;
  const px=(_v.x+1)/2*W,py=(1-_v.y)/2*H;
  if(px<-90||px>W+90||py<-90||py>H+90)return null;
  return {x:px,y:py};
}

return {boot,loadModels,whenReady,enterExplore,renderExplore,renderBattle,projectUnit,project3D,MOB3D,
  dbg:()=>JSON.stringify({ok,bt:btGroup?btGroup.children.length:-1,un:btUnits.size,th:btTheme,tpl:Object.keys(TPL).length}),
  isReady:()=>ready,isOk:()=>ok,
  info:()=>renderer?renderer.info.render.calls:0};
})();
