// D1 下载器：poly.pizza GLB + Kenney mirror GLB → _tmp3d/
const cp=require('child_process'),fs=require('fs'),path=require('path');
const DIR=path.join(__dirname,'_tmp3d');fs.mkdirSync(DIR,{recursive:true});
const PP='https://static.poly.pizza/';
const KN='https://raw.githubusercontent.com/ETdoFresh/kenney.nl/master/';
const FT='fantasy-town-kit-1.0/Models/GLTF%20format/';
const NK='kenney_natureKit_2.1/Models/GLTF%20format/';
const list=[
 // ---- chars (Quaternius CC0) ----
 ['jon',PP+'3186b8e9-afd5-4d48-846c-b2b530cd23e2.glb'],
 ['arya',PP+'bbe369ee-a686-42c7-adad-14356f5f2f15.glb'],
 ['dany',PP+'46d6db5a-3c9f-4238-8cdf-8eb7194498dc.glb'],
 ['npc1',PP+'1a8a9d55-9aa9-43c4-a031-d926e251d80a.glb'],
 ['npc2',PP+'1e87091b-7202-4906-bd14-22881d9b945c.glb'],
 ['bri',PP+'06763472-0463-4335-8daa-58a2e541303d.glb'],
 ['king',PP+'29a3436b-3b06-4dbf-a236-bcec18f3351a.glb'],
 // ---- mobs (Quaternius CC0) ----
 ['wolf',PP+'f1d12388-e39b-4157-b32a-646a1d089fc4.glb'],
 ['giant',PP+'260aff73-1409-4a45-9746-b078229d8cf3.glb'],
 ['spider',PP+'4259fbdb-afb5-4d40-9108-363625dd6b6e.glb'],
 ['wight',PP+'af74108f-e770-4ed0-9d17-83576afece78.glb'],
 ['walker',PP+'a089d0ae-5a26-448b-b038-4884d64099e3.glb'],
 ['dragon',PP+'9714f533-5d2d-4cfd-b8f1-c8dfff64a672.glb'],
 ['dragonEvo',PP+'90ed3740-d8c4-4910-88ce-ac2ed426022d.glb'],
 // ---- props: fantasy town (Kenney CC0) ----
 ['p_tree',KN+FT+'tree.glb'],['p_treeHigh',KN+FT+'treeHigh.glb'],['p_treeHighRound',KN+FT+'treeHighRound.glb'],
 ['p_stall',KN+FT+'stall.glb'],['p_stallRed',KN+FT+'stallRed.glb'],['p_lantern',KN+FT+'lantern.glb'],
 ['p_windmill',KN+FT+'windmill.glb'],['p_watermill',KN+FT+'watermill.glb'],
 ['p_wall',KN+FT+'wall.glb'],['p_wallCorner',KN+FT+'wallCorner.glb'],['p_wallDoor',KN+FT+'wallDoor.glb'],
 ['p_wallArch',KN+FT+'wallArch.glb'],['p_wallBlock',KN+FT+'wallBlock.glb'],
 ['p_wallWinShut',KN+FT+'wallWindowShutters.glb'],['p_wallWood',KN+FT+'wallWood.glb'],
 ['p_roof',KN+FT+'roof.glb'],['p_roofGable',KN+FT+'roofGable.glb'],['p_roofHigh',KN+FT+'roofHigh.glb'],['p_roofHighGable',KN+FT+'roofHighGable.glb'],
 ['p_fence',KN+FT+'fence.glb'],['p_fenceGate',KN+FT+'fenceGate.glb'],
 ['p_rockL',KN+FT+'rockLarge.glb'],['p_rockS',KN+FT+'rockSmall.glb'],
 ['p_stairsStone',KN+FT+'stairsStone.glb'],['p_chimney',KN+FT+'chimney.glb'],['p_cart',KN+FT+'cart.glb'],
 ['p_pillarStone',KN+FT+'pillarStone.glb'],['p_fountain',KN+FT+'fountainSquare.glb'],
 ['p_bannerRed',KN+FT+'bannerRed.glb'],['p_bannerGreen',KN+FT+'bannerGreen.glb'],
 // ---- props: nature (Kenney CC0) ----
 ['p_pineTallA',KN+NK+'tree_pineTallA.glb'],['p_pineTallB',KN+NK+'tree_pineTallB.glb'],
 ['p_pineRoundA',KN+NK+'tree_pineRoundA.glb'],['p_cone',KN+NK+'tree_cone.glb'],
 ['p_oak',KN+NK+'tree_oak.glb'],['p_detailed',KN+NK+'tree_detailed.glb'],
 ['p_rockSmallA',KN+NK+'rock_smallA.glb'],['p_rockTallA',KN+NK+'rock_tallA.glb'],['p_stoneLargeA',KN+NK+'stone_largeA.glb'],
 ['p_campfire',KN+NK+'campfire_stones.glb'],['p_tentOpen',KN+NK+'tent_smallOpen.glb'],['p_tentClosed',KN+NK+'tent_detailedClosed.glb'],
 ['p_log',KN+NK+'log.glb'],['p_logstack',KN+NK+'log_stack.glb'],['p_sign',KN+NK+'sign.glb'],
 ['p_bridgeWood',KN+NK+'bridge_wood.glb'],['p_bridgeStone',KN+NK+'bridge_stone.glb'],
 ['p_bush',KN+NK+'plant_bush.glb'],['p_stump',KN+NK+'stump_old.glb'],['p_statue',KN+NK+'statue_column.glb'],
 // ---- E0 v6 新怪 18 种（Quaternius CC0 via poly.pizza CDN）----
 ['bat',PP+'4ae13ae9-c257-41ed-86b5-1b4760924ebc.glb'],
 ['snake',PP+'0f3a551e-743e-48f5-936f-804c6c3b88bd.glb'],
 ['slime',PP+'195565b4-842a-44e9-a59a-5ebb1d133255.glb'],
 ['goblin',PP+'54e0fd61-6898-4b17-b039-8fa656d02954.glb'],
 ['skeleton',PP+'b1ea7fcc-7d7f-4e93-aac5-507358399a7b.glb'],
 ['zombie',PP+'c4002f69-6979-42e8-ad6e-2f4e14fc3a9d.glb'],
 ['orc',PP+'52a479b3-a635-4a23-92cb-6697eaa5eed5.glb'],
 ['orcEnemy',PP+'3076c5f7-9bdf-4c27-8083-f280ee6cd64b.glb'],
 ['demon',PP+'c2e39eb4-4b8e-4d31-b014-d637bf4e15c6.glb'],
 ['blueDemon',PP+'6fbb8914-bd11-45e1-a906-51ace2ca5d2d.glb'],
 ['golemIce',PP+'51bf31d7-1aee-4a51-acb1-d667843af205.glb'],
 ['golemEvo',PP+'d6308fbf-fa2e-4cfe-b235-def7ede1ab90.glb'],
 ['shaman',PP+'3df4bc4f-54a7-43e4-a35d-35d05610d0eb.glb'],
 ['dragonWhelp',PP+'ae5b8510-1fa5-4d53-b943-a4f3b88fb629.glb'],
 ['direwolf',PP+'611d25c7-430f-4bb5-ab2c-d8f5f3cb9712.glb'],
 ['wraith',PP+'810f60a2-6e45-4c4e-a0d5-da91cd7288bd.glb'],
 // ---- E0 v6 人形怪（KayKit Adventurers CC0，CharacterArmature）----
 ['knightBlack','https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/main/addons/kaykit_character_pack_adventures/Characters/gltf/Knight.glb'],
 ['rogue','https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/main/addons/kaykit_character_pack_adventures/Characters/gltf/Rogue_Hooded.glb'],
];
let fail=0;
for(const [name,url] of list){
  const f=path.join(DIR,name+'.glb');
  if(fs.existsSync(f)&&fs.statSync(f).size>500)continue;
  const r=cp.spawnSync('curl',['-sL','--connect-timeout','20','-o',f,url],{encoding:'utf8',timeout:60000});
  const sz=fs.existsSync(f)?fs.statSync(f).size:0;
  if(r.status!==0||sz<500){console.log('FAIL',name,sz);fail++;}
  else console.log('ok',name,Math.round(sz/1024)+'K');
}
console.log(fail?('FAILED '+fail):'ALL OK, total '+Math.round(list.reduce((a,[n])=>a+((fs.existsSync(path.join(DIR,n+'.glb'))?fs.statSync(path.join(DIR,n+'.glb')).size:0)),0)/1024/1024*100)/100+'MB');
