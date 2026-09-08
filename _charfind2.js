const j=require('./_tmp_quat_models.json');
const cc0=j.filter(m=>(m.lic||'').indexOf('CC0')===0);
const kw=/adventur|hooded|knight|paladin|cleric|druid|ranger|bard|peasant|farmer|smith|merchant|guard|captain|king|queen|prince|princess|lord|lady|servant|maiden|warrior|viking|dwarf|elf|human|person|villager|blacksmith|hunter|fisher|cook|bard|noble|royal|soldier|archer|monk|wizard|mage|thief|rogue|assassin|executioner|jester|priest|nun|child|elder/i;
const hits=cc0.filter(m=>kw.test(m.title||''));
console.log('CC0 humanoid-ish candidates:',hits.length);
for(const m of hits)console.log((m.title||'').padEnd(30),m.uuid);
