'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawn,execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');let browser;
(async()=>{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 for(const [index,commit] of ['964ba5214e45776bb0c55cd23676ec57e2363fb8','fd79768b91fe950ca10b1fa0e40a1e200808bf92'].entries()){
  // Historical files, including retired assets, exist only in this temporary test deployment.
  const folder=fs.mkdtempSync(path.join(os.tmpdir(),'istiqamah-real-upgrade-'));
  const archive=execFileSync('git',['archive',commit],{cwd:root,maxBuffer:20*1024*1024});execFileSync('tar',['-x','-C',folder],{input:archive});
  const port=Number(process.env.UPGRADE_TEST_PORT||8870)+index,url=`http://127.0.0.1:${port}`;
  const server=spawn(process.env.PYTHON||'python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:folder,stdio:'ignore'});
  const context=await browser.newContext({timezoneId:'Asia/Dubai'}),page=await context.newPage();
  try{
   for(let i=0;i<50;i++){try{if((await fetch(url)).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
   await page.goto(url);await page.locator('[data-draft="name"]').fill('Upgrade '+commit.slice(0,7));await page.locator('[data-action="skip-wizard"]').click();await page.locator('[data-action="finish-wizard"]').click();
   await page.evaluate(()=>{
    const a=Istiqamah;a.state.tasbih.count=19;a.state.tasbih.selected='morning-1';a.getDay().adhkar['morning-1']=2;a.getDay().journal.well='Original journal';
    if(a.ramadanService){const c=a.state.phase2.ramadan;c.enabled=true;c.startDate=a.today();a.ramadanService.ensure(a.today());a.ramadanService.setFasting(a.today(),'not-fasting');a.getDay().ramadan.reason='Private Ramadan reason';a.getDay().values['ramadan-quran']=7;const id=a.adhkarLibrary.aliases.get('morning-1');a.getDay().adhkar[id]=2;a.state.tasbih.selected=id;a.state.phase2.adhkar.favorites=[id]}
    a.storage.save();
   });
   await page.evaluate(async()=>await navigator.serviceWorker.ready);await page.reload();await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
   await context.setOffline(true);await page.reload();assert.equal(await page.evaluate(()=>Istiqamah.state.tasbih.count),19);await context.setOffline(false);
   const originalBytes=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('istiqamah.v1'));const raw=JSON.stringify(s,null,2)+'\n';localStorage.setItem('istiqamah.v1',raw);return raw});
   for(const name of fs.readdirSync(folder))fs.rmSync(path.join(folder,name),{recursive:true,force:true});
   for(const name of fs.readdirSync(root)){if(['.git','node_modules','test-results'].includes(name))continue;fs.cpSync(path.join(root,name),path.join(folder,name),{recursive:true})}
   await page.evaluate(async()=>{window.oldController=navigator.serviceWorker.controller;await(await navigator.serviceWorker.getRegistration()).update()});
   await page.waitForFunction(()=>navigator.serviceWorker.controller!==window.oldController);
   await page.reload();await page.waitForFunction(()=>window.Istiqamah?.version==='2.1.0');
   const result=await page.evaluate(async()=>({state:Istiqamah.state,original:localStorage.getItem('istiqamah.migration.v1'),daily:await Istiqamah.storage.snapshots.list(),saved:Istiqamah.storage.save()}));
   assert.equal(result.original,originalBytes);assert.equal(result.state.schemaVersion,1);assert.equal(result.state.phase2.schemaVersion,2);assert.equal(result.state.tasbih.count,19);assert.equal(result.saved,true);assert(result.daily.length>0);
   const preserved=await page.evaluate(()=>{const a=Istiqamah,id=a.adhkarLibrary.aliases.get('morning-1');return {selected:a.state.tasbih.selected,count:a.getDay().adhkar[id],journal:a.getDay().journal.well,ramadan:a.getDay().ramadan,favorites:a.state.phase2.adhkar.favorites,id}});
   assert.equal(preserved.count,2);assert.equal(preserved.selected,preserved.id);assert.equal(preserved.journal,'Original journal');
   if(index){assert.equal(preserved.ramadan.reason,'Private Ramadan reason');assert.equal(preserved.ramadan.fasting,'not-fasting');assert(preserved.favorites.includes(preserved.id));assert.equal(await page.evaluate(()=>Istiqamah.getDay().values['ramadan-quran']),7)}
   await context.setOffline(true);await page.reload();await page.waitForFunction(()=>window.Istiqamah?.version==='2.1.0');
   await page.locator('[data-action="nav"][data-id="tools"]').first().click();await page.locator('#tasbih-adhkar').waitFor();assert.equal(await page.locator('.tasbih-button').innerText(),'2');assert.equal(await page.locator('#tasbih-adhkar option').count(),114);
   const cacheURLs=await page.evaluate(async()=>{const result=[];for(const name of await caches.keys()){const cache=await caches.open(name);result.push(...(await cache.keys()).map(r=>r.url))}return result});assert(!cacheURLs.some(u=>/adhan-(makkah|mishary)\.mp3|uthmani\.woff2/.test(u)));
   console.log(`PASS real upgrade ${commit.slice(0,7)} → 2.1.0: exact bytes backed up, counters and Ramadan preserved, daily copy retained, offline restart, retired assets absent`);
  }finally{await context.close();server.kill();fs.rmSync(folder,{recursive:true,force:true})}
 }
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>browser?.close());
