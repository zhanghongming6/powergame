// E0 搜索器：poly.pizza /api/search → 候选模型清单（creator/license/uuid）
const https=require('https');
function get(u){return new Promise((res,rej)=>{https.get(u,{headers:{'User-Agent':'Mozilla/5.0'}},r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>{try{res(JSON.parse(d))}catch(e){rej(e)}});}).on('error',rej);});}
const KW=[
 ['bear2','grizzly'],['mammoth2','elephant'],['rhino','rhino'],['fire','flame creature'],['lava','lava monster'],['ogre','ogre'],['warthog','warthog'],['kayknight','Kay Lousberg knight'],['kayarcher','Kay Lousberg archer'],['kaymage','Kay Lousberg mage'],['mage','mage'],['demon','demon'],
 ['bat','bat'],['snake','snake'],['slime','slime'],['goblin','goblin'],
 ['skeleton','skeleton'],['bear','bear'],['boar','boar'],['mammoth','mammoth'],
 ['golem','golem'],['elemental','elemental'],['wraith','ghost'],['troll','troll'],
 ['knight','knight'],['archer','archer'],['shaman','shaman'],['direwolf','dire wolf'],
 ['dragon','baby dragon'],['zombie','zombie'],['orc','orc'],['wizard','wizard']
];
(async()=>{
 for(const [tag,kw] of KW){
  try{
   const j=await get('https://poly.pizza/api/search/'+encodeURIComponent(kw)+'?Limit=10&Type=models');
   console.log('\n=== '+tag+' ('+kw+') ===');
   (j.results||[]).forEach((r,i)=>{
    const uu=(r.previewUrl||'').match(/([a-f0-9-]{36})/);
    console.log(`${i} ${r.title} | ${r.creator&&r.creator.username} | ${r.licence} | ${r.publicID} | ${uu?uu[1]:''}`);
   });
  }catch(e){console.log(tag,'ERR',e.message)}
 }
})();
