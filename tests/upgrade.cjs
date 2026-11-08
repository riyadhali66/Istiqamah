'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),http=require('node:http'),{execFileSync}=require('node:child_process');
module.exports=async({browser,check})=>{
 for(const [label,commit,schema] of [['A','964ba52',0],['B','fd79768',0],['C','d142ca9',1],['D','4ff5851',2]])
 await check(`REAL UPGRADE ${label}: ${commit} app-created records, waiting banner, one tap, exact bytes, offline`,async()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'istiqamah-release-'));
  const tar=path.join(dir,'old.tar');execFileSync('git',['archive','--output='+tar,commit]);execFileSync('tar',['-xf',tar,'-C',dir]);
  let root=dir;
  const server=http.createServer((req,res)=>{
   let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
   if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
   if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
   try{res.setHeader('Content-Type',({'.js':'text/javascript','.json':'application/json','.html':'text/html','.css':'text/css','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.woff2':'font/woff2','.png':'image/png'})[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-cache');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
  const context=await browser.newContext({timezoneId:'Asia/Dubai',viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.clock.install({time:new Date('2027-02-09T08:00:00+04:00')});
   await page.goto(base);await page.waitForFunction(()=>!!window.Istiqamah);
   await page.locator('[data-draft="name"]').fill('Upgrade '+label);
   await page.locator('[data-draft="city"]').fill('Dubai');await page.locator('[data-draft="city"]').blur();
   await page.locator('[data-action="skip-wizard"]').click();await page.locator('[data-action="finish-wizard"]').click();
   if(await page.locator('[data-action="ramadan-setup-skip"]').isVisible())await page.locator('[data-action="ramadan-setup-skip"]').click();
   await page.evaluate(label=>{
    const a=Istiqamah,s=a.state,key=a.today(),d=a.getDay();
    d.values[s.habits[0].id]=1;d.journal.well='Family walk — preserve exact bytes '+label;
    d.mood=4;d.stress=2;
    s.debts.push({id:'upgrade-debt',name:'Family loan',total:1000,paid:125,payments:[{date:key,amount:125}]});
    s.words.push({id:'upgrade-word',word:'consistency',meaning:'Steady effort',example:'One step every day'});
    s.children.push({id:'upgrade-child',name:'Maryam',age:'7',reward:'A park visit'});
    d.kids['upgrade-child']={Prayer:true};
    a.getDay(a.offsetDay(key,-1)).journal.well='Yesterday stays unchanged';
    s.tasbih.count=27;s.profile.language=['C','D'].includes(label)?'ar':'en';s.settings.theme=['B','D'].includes(label)?'dark':'light';
    if(s.phase2){
      const e=a.adhkarLibrary.list('general')[0];s.tasbih.selected=e.id;s.phase2.adhkar.favorites=[e.id];
      a.adhkarLibrary.set(e,7,key);
      s.phase2.ramadan.startDate='2027-02-08';s.phase2.ramadan.quran={enabled:true,pages:100,deadline:'2027-03-01',setOn:key};
      a.ramadanService.setEnabled(true);a.ramadanService.ensure(key);d.ramadan.fasting='paused';d.ramadan.reason='Private';d.values['ramadan-quran']=6;
    }else{d.adhkar['morning-1']=2;s.tasbih.selected='morning-1';}
    if(s.schemaVersion===2){a.ramadanService.mode('on');a.ramadanService.update('pages',6);a.ramadanService.update('notFasting',true);}
    a.storage.save();
   },label);
   await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
   await page.reload();await page.waitForFunction(()=>!!navigator.serviceWorker.controller&&!!window.Istiqamah);
   const before=await page.evaluate(()=>localStorage.getItem('istiqamah.v1')),old=JSON.parse(before);
   assert.equal(old.schemaVersion||0,schema);
   root=path.resolve(__dirname,'..');
   // Legacy apps cannot learn new UI while already loaded. Their next online navigation loads the independent bridge.
   await page.reload();await page.locator('#app-update:not([hidden])').waitFor({timeout:30000});
   assert.equal(await page.evaluate(()=>localStorage.getItem('istiqamah.v1')),before);
   fs.mkdirSync(path.resolve(__dirname,'../docs/screenshots/release-2.1.0'),{recursive:true});
   await page.screenshot({path:path.resolve(__dirname,`../docs/screenshots/release-2.1.0/update-${['C','D'].includes(label)?'ar':'en'}-${['B','D'].includes(label)?'dark':'light'}.png`)});
   let navigations=0;page.on('framenavigated',frame=>{if(frame===page.mainFrame())navigations++;});
   await page.locator('#app-update button').click();await page.waitForFunction(()=>window.Istiqamah?.state.schemaVersion===3);
   assert.equal(navigations,1);
   const after=await page.evaluate(()=>Istiqamah.state);
   for(const k of Object.keys(old))if(k!=='schemaVersion'){if(k==='days'){for(const [date,d] of Object.entries(old.days))for(const field of Object.keys(d))assert.deepEqual(after.days[date][field],d[field],`archival day ${date}.${field}`);}else assert.deepEqual(after[k],old[k],`archival root ${k}`);}
   assert.equal(await page.evaluate(()=>localStorage.getItem('istiqamah.migration.v3')),before);
   assert.equal(await page.evaluate(()=>Istiqamah.validate(Istiqamah.state)),true);
   const id=after.adhkarPrefs.selected;
   if(label==='B'){assert(after.adhkarPrefs.favorites.includes(id));assert.equal(after.days[Object.keys(old.days).sort().at(-1)].adhkarCounts[id],7);assert.equal(after.ramadanConfig.completion.pages,100);assert(Object.values(after.days).some(d=>d.ramadanV3?.paused));}
   await page.waitForFunction(async()=>!(await caches.keys()).some(k=>k!=='istiqamah-v2-1-0-release'&&k.startsWith('istiqamah-')));
   await context.setOffline(true);await page.reload();await page.waitForFunction(()=>window.Istiqamah?.state.schemaVersion===3&&SOURCE_DATA.adhkar.length===50);
   assert.equal(await page.evaluate(()=>Istiqamah.state.profile.name),'Upgrade '+label);
   assert.deepEqual(errors,[]);
  }finally{await context.close();await new Promise(r=>server.close(r));fs.rmSync(dir,{recursive:true,force:true});}
 });
};
