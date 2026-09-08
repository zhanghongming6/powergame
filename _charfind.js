const j=require('./_tmp_quat_models.json');
const cur={jon:'3186b8e9-afd5-4d48-846c-b2b530cd23e2',arya:'bbe369ee-a686-42c7-adad-14356f5f2f15',dany:'46d6db5a-3c9f-4238-8cdf-8eb7194498dc',npc1:'1a8a9d55-9aa9-43c4-a031-d926e251d80a',npc2:'1e87091b-7202-4906-bd14-22881d9b945c',bri:'06763472-0463-4335-8daa-58a2e541303d'};
const byU={};for(const m of j)byU[m.uuid]=m;
console.log('=== CURRENT ===');
for(const[k,u]of Object.entries(cur))console.log(k.padEnd(6),(byU[u]||{}).title||'??',(byU[u]||{}).lic||'');
const kw=/knight|warrior|hero|peasant|villag|citizen|medieval|man|woman|male|female|queen|princess|mage|wizard|rogue|thief|barbarian|guard|soldier|archer|priest|monk|bard|noble|lord|lady|child|boy|girl/i;
const hits=j.filter(m=>kw.test(m.title||'')&&(m.lic||'').indexOf('CC0')===0);
console.log('=== CC0 CHARACTER CANDIDATES ('+hits.length+') ===');
for(const m of hits)console.log((m.title||'').padEnd(34),m.uuid,m.lic);
