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
 // ---- mobs (Quaternius CC0) ----
 ['wolf',PP+'f1d12388-e39b-4157-b32a-646a1d089fc4.glb'],
 ['giant',PP+'260aff73-1409-4a45-9746-b078229d8cf3.glb'],
 ['spider',PP+'4259fbdb-afb5-4d40-9108-363625dd6b6e.glb'],
 ['wight',PP+'af74108f-e770-4ed0-9d17-83576afece78.glb'],
 ['walker',PP+'a089d0ae-5a26-448b-b038-4884d64099e3.glb'],
 // ---- props: fantasy town (Kenney CC0)；v6.6 清 31 死 key，仅留被 adapter 引用的 ----
 ['p_wall',KN+FT+'wall.glb'],['p_wallDoor',KN+FT+'wallDoor.glb'],
 ['p_wallArch',KN+FT+'wallArch.glb'],['p_wallBlock',KN+FT+'wallBlock.glb'],
 ['p_wallWinShut',KN+FT+'wallWindowShutters.glb'],
 ['p_roofGable',KN+FT+'roofGable.glb'],
 ['p_chimney',KN+FT+'chimney.glb'],['p_cart',KN+FT+'cart.glb'],
 // ---- props: nature (Kenney CC0) ----
 ['p_pineTallA',KN+NK+'tree_pineTallA.glb'],['p_pineTallB',KN+NK+'tree_pineTallB.glb'],
 ['p_oak',KN+NK+'tree_oak.glb'],
 ['p_rockSmallA',KN+NK+'rock_smallA.glb'],['p_rockTallA',KN+NK+'rock_tallA.glb'],['p_stoneLargeA',KN+NK+'stone_largeA.glb'],
 ['p_campfire',KN+NK+'campfire_stones.glb'],
 ['p_logstack',KN+NK+'log_stack.glb'],['p_sign',KN+NK+'sign.glb'],
 ['p_bush',KN+NK+'plant_bush.glb'],['p_statue',KN+NK+'statue_column.glb'],
 // ---- E0 v6 新怪 18 种（Quaternius CC0 via poly.pizza CDN）----
 ['bat',PP+'4ae13ae9-c257-41ed-86b5-1b4760924ebc.glb'],
 ['snake',PP+'0f3a551e-743e-48f5-936f-804c6c3b88bd.glb'],
 ['slime',PP+'195565b4-842a-44e9-a59a-5ebb1d133255.glb'],
 ['goblin',PP+'54e0fd61-6898-4b17-b039-8fa656d02954.glb'],
 ['skeleton',PP+'b1ea7fcc-7d7f-4e93-aac5-507358399a7b.glb'],
 ['zombie',PP+'c4002f69-6979-42e8-ad6e-2f4e14fc3a9d.glb'],
 ['orc',PP+'52a479b3-a635-4a23-92cb-6697eaa5eed5.glb'],
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
 // ---- F-B v6.6 城建资产（Quaternius 中世纪幻想套 CC0 via poly.pizza CDN）----
 ['p_q_wallStone',PP+'b0cfd860-1324-4253-b718-659ffae2188e.glb'],   // Stone Wall
 ['p_q_wallTower',PP+'477a4219-6c5a-4228-b0a5-f0ab12fabf76.glb'],   // Stone Wall Towers
 ['p_q_wallMod',PP+'7da31d48-b414-4eae-a8d6-7a1c7c796078.glb'],     // Wall Modular（长城/城墙段备选）
 ['p_q_gateStone',PP+'7517b51c-f2cc-4b87-bf56-22355c7754cb.glb'],   // Castle Gate
 ['p_q_gateWood',PP+'77b9f0fc-39c3-49a0-a995-0994ab4fda85.glb'],    // Wooden Fortress Gate
 ['p_q_towerStone',PP+'9d0ad85b-a250-4197-a5d3-8bac9f463004.glb'],  // Stone Tower
 ['p_q_towerWatch',PP+'44e04449-9ea6-4daf-bfb9-2f2cc09aecd2.glb'],  // Watch Tower
 ['p_q_castle',PP+'22b576c3-24c2-45c4-a89c-b088901c3695.glb'],      // Castle
 ['p_q_fortress',PP+'89e11ad8-811d-4055-b041-12a959ac2973.glb'],    // Castle Fortress
 ['p_q_houseTower',PP+'f157b27f-208a-4c7b-8c68-18c93d610ab9.glb'],  // Tower House
 ['p_q_houseA',PP+'341c9305-c6dd-4427-ad00-620ad57eb14e.glb'],      // Fantasy House
 ['p_q_houseB',PP+'8467654d-d4e7-460e-9484-969bd122a40a.glb'],      // Town House
 ['p_q_inn',PP+'270a08b6-87e1-47eb-ad1c-5fd7be321bcd.glb'],         // Fantasy Inn
 ['p_q_smith',PP+'c664d338-cf21-4cda-b0f8-efe0f0826a10.glb'],       // Blacksmith
 ['p_q_market',PP+'336fbda1-a644-4deb-b980-7b27a368bdeb.glb'],      // Market Stalls
 ['p_q_bridge',PP+'7280b13a-75e9-49e9-93e5-2bd55c32e3fb.glb'],      // Bridge
 ['p_q_bridgeSm',PP+'e36966b4-e13e-46e8-aa2c-f9b643536d46.glb'],    // Small Bridge
 ['p_q_dock',PP+'fad3fcb3-d174-469b-9f1c-a3ab00d74fb9.glb'],        // Dock
 ['p_q_barracks',PP+'e4626d45-1c88-4a3f-9bc8-c7a077f108f0.glb'],    // Fantasy Barracks
 ['p_q_stable',PP+'210b9cdc-9b11-4ef5-a61b-5c31d0689090.glb'],      // Fantasy Stable
 // ---- F-B 第二轮候选：墙/门/塔（找同套系比例）----
 ['p_q_wall',PP+'296ca275-af1d-45a2-a97a-113dad47938e.glb'],        // Wall
 ['p_q_wallTowers',PP+'5a70ad27-93f3-42d7-95ff-4997bb274e8a.glb'],  // Wall Towers
 ['p_q_wallTowersDoor',PP+'e269a247-0b4b-4c67-b413-befa8d3f5b36.glb'], // Wall Towers Door Second Age
 ['p_q_woodWall',PP+'43bf4a38-5d5d-4704-860c-ea13a894ff09.glb'],    // Wooden Wall
 ['p_q_archDoor',PP+'3076f55a-92d2-4ba7-a286-3e062e3dcea8.glb'],    // Arch Door
 ['p_q_watchTowerB',PP+'af1eb6e4-a1b9-415f-bb4d-6098c4a70b40.glb'], // Watch Tower
 ['p_q_watchTowerC',PP+'af9ebe34-f519-48eb-9185-3e2c76405697.glb'], // Watch Tower
 ['p_q_smallWatchTower',PP+'8bec6466-329a-4f83-99d9-600a00e2c437.glb'], // Small Watch Tower
 ['p_q_guardTower',PP+'5d56ff95-db7a-43d6-997f-e9eea3f13f53.glb'],  // Guard Tower
 ['p_q_stoneTowerB',PP+'2ebc450e-0874-4b5a-bbfa-6e30e29fcc85.glb'], // Stone Tower
 ['p_q_tower',PP+'749bb696-9058-4290-a5d6-92fb97a9a641.glb'],       // Tower
 ['p_q_bellTower',PP+'fe8e639d-f07d-4512-a38d-3519b44a5fdc.glb'],   // Bell Tower
 ['p_q_bannerWall',PP+'0c1ba162-9d94-4fc7-9a35-23653aacc7ac.glb'],  // Banner Wall
 ['p_q_wallFlag',PP+'02708091-4dee-4da7-b965-dd20a82b5fdb.glb'],    // Wall Flag
 // ---- 城堡 / 主城 / 大型建筑 ----
 ['p_q_fortress',PP+'c3ccd51c-0343-4237-83f4-0bc0183911d6.glb'],    // Fortress
 ['p_q_castleB',PP+'dafe12fb-8ec0-4d2b-826a-4917d7ed78a3.glb'],     // Castle
 ['p_q_woodCastle',PP+'1e49a798-42f4-4ec5-827b-a29942f35620.glb'],  // Wooden Castle
 ['p_q_woodFortress',PP+'fc0c763a-3a76-4af3-b89e-8901dcb39abb.glb'],// Wooden Fortress
 ['p_q_castleKit',PP+'25b76a2f-efd4-4457-9af2-fd6d2bd1537e.glb'],   // Modular Castle Kit
 ['p_q_townCenter1',PP+'19ae7961-9bda-4fa7-a4e2-0ad16a1f19e0.glb'], // Town Center
 ['p_q_townCenter2',PP+'81e39d77-d2c8-4f53-8e44-13fb6a008e4f.glb'], // Town Center
 ['p_q_townCenter3',PP+'38935e97-98f3-4abf-8f7d-5324be45f3e3.glb'], // Town Center
 ['p_q_townCenter4',PP+'06cb1d0b-0db5-4ba5-82ee-d359e7b1714b.glb'], // Town Center
 ['p_q_townCenterSA',PP+'1889ded5-a147-4a3e-be44-40f4ca8cbe47.glb'],// Town Center Second Age
 ['p_q_bigBuilding',PP+'6c49f4dd-c032-4e50-b257-68bbe01bcf16.glb'], // Big Building
 ['p_q_barracks2',PP+'aa317363-cacd-48c5-8f9a-468133e73e24.glb'],   // Barracks
 ['p_q_temple',PP+'d3bd25be-30d5-4108-b725-78c0c84395d0.glb'],      // Temple
 // ---- 民居 / 市集 / 码头 / 风车 / 井 ----
 ['p_q_houses1',PP+'9d55f5eb-6398-4708-a623-f1e688a78bde.glb'],     // Houses
 ['p_q_houses2',PP+'6d9fc6c8-d736-4269-b4c1-845aaa8dbb36.glb'],     // Houses
 ['p_q_houses3',PP+'d150762b-2366-4acb-a841-5572a300648e.glb'],     // Houses
 ['p_q_townHouseB',PP+'58662a37-93d7-47c0-8c68-490bb7100a1a.glb'],  // Town House
 ['p_q_townHouseC',PP+'8919c62b-5754-45f8-8a08-4f337de61bbc.glb'],  // Town House
 ['p_q_largeTownHouse',PP+'cf011371-80fa-4e00-b96c-581dbb63215b.glb'], // Large Town House
 ['p_q_houseC',PP+'eba1a4e9-7203-4a79-b527-b6f5c65bb99e.glb'],      // House
 ['p_q_fantasyHouseB',PP+'b8a2c719-5a70-4d6c-8049-90af7e3f89ee.glb'], // Fantasy House
 ['p_q_marketStand',PP+'e2633001-4cf5-46fa-ac68-575c9954f4ba.glb'], // Market Stand
 ['p_q_villageMarket',PP+'d99b4be3-5157-4dda-b308-ad77acbe8801.glb'], // Village Market
 ['p_q_marketScene',PP+'25dcb1aa-d135-4d5a-b190-085cb5cb1e13.glb'], // Market Scene
 ['p_q_port',PP+'e0972cd9-7885-4bcd-92cb-9a5f0601d2ff.glb'],        // Port
 ['p_q_docks',PP+'a34d55ba-16d6-4951-9126-8c15315cb6e4.glb'],       // Docks
 ['p_q_dockWide',PP+'777893ba-e210-49ec-9d20-3e7e771ec450.glb'],    // Dock Wide
 ['p_q_well',PP+'0e044203-f62e-4dad-ad3e-c3cb6cb393ac.glb'],        // Well
 ['p_q_windmill',PP+'8e4bd22a-1ec9-4c27-b2d2-8620b646affa.glb'],    // Windmill
 ['p_q_towerWindmill',PP+'4807851f-46d4-4541-ae98-24ec0a525f0c.glb'], // Tower Windmill
];
const DIRC=path.join(__dirname,'_tmp3dc');fs.mkdirSync(DIRC,{recursive:true}); // F-B 候选目录（筛选后才进 _tmp3d）
const isCand=n=>n.indexOf('p_q_')===0;
const szOf=n=>{const f=path.join(isCand(n)?DIRC:DIR,n+'.glb');return fs.existsSync(f)?fs.statSync(f).size:0;};
let fail=0;
for(const [name,url] of list){
  const f=path.join(isCand(name)?DIRC:DIR,name+'.glb');
  if(fs.existsSync(f)&&fs.statSync(f).size>500)continue;
  const r=cp.spawnSync('curl',['-4','-sL','--connect-timeout','20','-o',f,url],{encoding:'utf8',timeout:90000});
  const sz=fs.existsSync(f)?fs.statSync(f).size:0;
  if(r.status!==0||sz<500){console.log('FAIL',name,sz);fail++;}
  else console.log('ok',name,Math.round(sz/1024)+'K');
}
console.log(fail?('FAILED '+fail):'ALL OK, total '+Math.round(list.reduce((a,[n])=>a+szOf(n),0)/1024/1024*100)/100+'MB');
// ---- 全 cast 升级候选（离线预置清单；网络恢复后运行本脚本即下载至 _tmp3dchar/）----
const DIRH=path.join(__dirname,'_tmp3dchar');fs.mkdirSync(DIRH,{recursive:true});
const CHARCAND=[
 ['c_heroB',PP+'69689495-028d-4b81-8678-792338a5693e.glb'],   // Adventurer B（男主备选）
 ['c_soldier',PP+'1083c1d3-d1d4-4682-adf6-bc516d06ac84.glb'], // Character Soldier（女骑/守卫备选）
 ['c_farmer',PP+'81f2f0cf-6f53-4b57-92ea-dba0928620f2.glb'],  // Farmer（男村民）
 ['c_womanB',PP+'ba7a1955-ea51-4cb9-a561-188bdef0a6c7.glb'],  // Animated Woman B（女贵/女村民）
 ['c_womanC',PP+'cf08b740-dd48-443e-9fde-6d3d54abf119.glb'],  // Animated Woman C
 ['c_human',PP+'170235d2-cdeb-4cb2-a82f-4828585138fe.glb'],   // Animated Human（男村民备选）
 ['c_king',PP+'9a5fae7e-25f1-4d24-8818-b2355c3764fb.glb'],    // King
 ['c_monk',PP+'eb331582-3a64-4a5a-8b46-75b9c1243830.glb'],    // Monk
 ['c_pirate',PP+'c814c745-1cf5-4d92-bd85-200c66eb7843.glb'],  // Pirate Captain
 ['c_thief',PP+'89ad1551-2d10-4896-95b9-25540b17b5c4.glb'],   // Thief（女刺备选）
];
for(const [name,url] of CHARCAND){
  const f=path.join(DIRH,name+'.glb');
  if(fs.existsSync(f)&&fs.statSync(f).size>500)continue;
  const r=cp.spawnSync('curl',['-4','-sL','--connect-timeout','20','-o',f,url],{encoding:'utf8',timeout:90000});
  const sz=fs.existsSync(f)?fs.statSync(f).size:0;
  console.log((r.status===0&&sz>500)?('ok '+name+Math.round(sz/1024)+'K'):('FAIL '+name+' '+sz));
}
