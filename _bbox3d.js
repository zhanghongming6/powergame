// _bbox3d.js — compute baked bbox (height-normalized) for GLBs, no browser.
// Replicates probe3d.html: world AABB via scene-graph TRS, then normalize h=1, ground y=0, center x/z.
const fs=require('fs'),path=require('path');
function readGLB(buf){
  if(buf.readUInt32LE(0)!==0x46546C67) throw new Error('not GLB');
  const jsonLen=buf.readUInt32LE(12);
  const json=JSON.parse(buf.slice(20,20+jsonLen).toString('utf8'));
  const c2=20+jsonLen; let BIN=Buffer.alloc(0);
  if(buf.length>c2+8){const len=buf.readUInt32LE(c2);BIN=buf.slice(c2+8,c2+8+len);}
  return {json,BIN};
}
// accessor min/max for POSITION
function accMinMax(json,aIdx){
  const a=json.accessors[aIdx];
  if(a&&a.min&&a.max) return {min:a.min,max:a.max};
  return null;
}
// node local matrix (column-major 16) from matrix or TRS
function nodeMat(n){
  if(n.matrix) return n.matrix.slice();
  const t=n.translation||[0,0,0], r=n.rotation||[0,0,0,1], s=n.scale||[1,1,1];
  const [x,y,z,w]=r;
  const x2=x+x,y2=y+y,z2=z+z, xx=x*x2,xy=x*y2,xz=x*z2,yy=y*y2,yz=y*z2,zz=z*z2,wx=w*x2,wy=w*y2,wz=w*z2;
  const m=new Array(16);
  m[0]=(1-(yy+zz))*s[0]; m[1]=(xy+wz)*s[0];     m[2]=(xz-wy)*s[0];     m[3]=0;
  m[4]=(xy-wz)*s[1];     m[5]=(1-(xx+zz))*s[1]; m[6]=(yz+wx)*s[1];     m[7]=0;
  m[8]=(xz+wy)*s[2];     m[9]=(yz-wx)*s[2];     m[10]=(1-(xx+yy))*s[2];m[11]=0;
  m[12]=t[0];m[13]=t[1];m[14]=t[2];m[15]=1;
  return m;
}
function mulMat(a,b){ // a*b column-major
  const o=new Array(16);
  for(let c=0;c<4;c++)for(let r=0;r<4;r++){
    o[c*4+r]=a[0*4+r]*b[c*4+0]+a[1*4+r]*b[c*4+1]+a[2*4+r]*b[c*4+2]+a[3*4+r]*b[c*4+3];
  }
  return o;
}
function xformP(m,p){
  const [x,y,z]=p;
  return [m[0]*x+m[4]*y+m[8]*z+m[12], m[1]*x+m[5]*y+m[9]*z+m[13], m[2]*x+m[6]*y+m[10]*z+m[14]];
}
function sceneAABB(json){
  let min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  const nodes=json.nodes||[];
  const scene=(json.scenes&&json.scenes[json.scene||0])||{nodes:nodes.map((_,i)=>i)};
  function walk(nIdx,parent){
    const n=nodes[nIdx]; if(!n)return;
    const world=mulMat(parent,nodeMat(n));
    if(n.mesh!=null&&json.meshes[n.mesh]){
      for(const prim of json.meshes[n.mesh].primitives){
        const pIdx=prim.attributes&&prim.attributes.POSITION;
        if(pIdx==null)continue;
        const mm=accMinMax(json,pIdx); if(!mm)continue;
        const mn=mm.min,mx=mm.max;
        // 8 corners
        for(let i=0;i<8;i++){
          const lp=[i&1?mx[0]:mn[0], i&2?mx[1]:mn[1], i&4?mx[2]:mn[2]];
          const wp=xformP(world,lp);
          for(let k=0;k<3;k++){if(wp[k]<min[k])min[k]=wp[k];if(wp[k]>max[k])max[k]=wp[k];}
        }
      }
    }
    for(const c of (n.children||[]))walk(c,world);
  }
  const ident=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
  for(const r of (scene.nodes||[]))walk(r,ident);
  return {min,max};
}
function measure(file){
  const buf=fs.readFileSync(file);
  const {json}=readGLB(buf);
  const bb=json&&json.accessors?sceneAABB(json):null;
  if(!bb||!isFinite(bb.min[0]))return null;
  const sx=bb.max[0]-bb.min[0],sy=Math.max(bb.max[1]-bb.min[1],1e-6),sz=bb.max[2]-bb.min[2];
  const s=1/sy; // normalize height=1
  return {sx,sy,sz,minY:bb.min[1],fx:sx*s,fz:sz*s};
}
const r2=v=>Math.round(v*1000)/1000;
const groups=[['PROPS(19)+REF','_tmp3d',f=>f.startsWith('p_')||f==='jon.glb'],['CAND(64)','_tmp3dc',()=>true]];
const out=[];
for(const [label,dir,filt] of groups){
  out.push('\n=== '+label+' ===');
  const files=fs.readdirSync(dir).filter(f=>f.endsWith('.glb')&&filt(f)).sort();
  for(const f of files){
    const k=f.slice(0,-4);
    try{const m=measure(path.join(dir,f));
      if(!m){out.push(k.padEnd(22)+' MEASURE_FAIL');continue;}
      out.push(k.padEnd(22)+' raw[x'+r2(m.sx)+' y'+r2(m.sy)+' z'+r2(m.sz)+' minY'+r2(m.minY)+']  baked[fx'+r2(m.fx)+' fz'+r2(m.fz)+']');
    }catch(e){out.push(k.padEnd(22)+' ERR '+e.message);}
  }
}
fs.writeFileSync('_tmp_bbox.txt',out.join('\n'),'utf8');
console.log(out.join('\n'));

