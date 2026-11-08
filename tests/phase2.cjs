'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
const base='http://127.0.0.1:8766',server=spawn('python3',['-m','http.server','8766','--bind','127.0.0.1'],{stdio:'ignore'});
let browser,n=0;const check=async(name,fn)=>{await fn();console.log(`PASS Phase 2 ${++n}: ${name}`);};
(async()=>{
 for(let i=0;i<50;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:390,height:844},timezoneId:'Asia/Dubai'});
 await context.addInitScript(()=>localStorage.setItem('istiqamah.releaseSeen.2.1.0','seen'));
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2027-02-09T08:00:00+04:00')});await page.goto(base);await page.waitForFunction(()=>!!window.Istiqamah);
 await page.locator('[data-draft="city"]').fill('Dubai');await page.locator('[data-draft="city"]').blur();await page.locator('[data-action="skip-wizard"]').click();await page.locator('[data-action="finish-wizard"]').click();
 if(await page.locator('[data-action="ramadan-setup-skip"]').isVisible())await page.locator('[data-action="ramadan-setup-skip"]').click();
 const nav=async id=>{if(await page.locator('[data-action="ramadan-setup-skip"]').isVisible())await page.locator('[data-action="ramadan-setup-skip"]').click();await page.locator(`[data-action="nav"][data-id="${id}"]`).first().click();};
 const tool=async id=>{await nav('tools');await page.locator(`[data-action="tool"][data-id="${id}"]`).click();};
 await check('113 original stable IDs retained, 10 selectable categories, isolated provenance',async()=>{
  const d=await page.evaluate(async()=>{const m=await import('./js/adhkar-data.js?v=2.1.0');return{entries:m.entries,archive:m.archive};});
  assert.equal(Object.keys(d.archive).length,113);assert.equal(new Set(d.entries.map(e=>e.category)).size,10);assert.equal(new Set(d.entries.map(e=>e.id)).size,d.entries.length);
  for(const e of Object.values(d.archive)){const hash=crypto.createHash('sha256').update(e.sourceCategory+'\0'+e.text+'\0'+e.reference).digest('hex');assert.equal(e.id,'azkar-'+hash.slice(0,20));assert.equal(e.provenance.rowSha256,hash);}
  for(const e of d.entries)if(e.id.startsWith('azkar-')){assert.deepEqual(e.translations,{});assert.equal(e.text,d.archive[e.id].text);}
 });
 await check('search, category filter, favorites and independent counters persist',async()=>{
  await tool('tasbih');await page.locator('#adhkar-category').selectOption('general');
  const id=await page.evaluate(()=>Istiqamah.adhkarLibrary.list('general')[0].id);
  await page.locator('#tasbih-adhkar').selectOption(id);await page.locator('[data-action="dhikr-favorite"]').click();
  await page.locator('#adhkar-category').selectOption('favorites');assert.equal(await page.locator('#tasbih-adhkar option').count(),2);
  await page.locator('#adhkar-category').selectOption('all');
  await page.locator('[data-action="tasbih"]').click();await page.locator('[data-action="tasbih"]').click();assert.equal(await page.locator('.tasbih-button').innerText(),'2');
  await page.locator('[data-action="tasbih-next"]').click();assert.equal(await page.locator('.tasbih-button').innerText(),'0');
  await page.locator('[data-action="tasbih-previous"]').click();assert.equal(await page.locator('.tasbih-button').innerText(),'2');
  await page.locator('#adhkar-search').fill('zz-nothing');await page.locator('#adhkar-search').blur();assert.equal(await page.evaluate(()=>Istiqamah.adhkarLibrary.filtered().length),0);
  await page.locator('#adhkar-search').fill('');await page.locator('#adhkar-search').blur();
  await page.reload();await page.waitForFunction(()=>!!window.Istiqamah);assert(await page.evaluate(id=>Istiqamah.state.adhkarPrefs.favorites.includes(id),id));
 });
 await check('missing counts stay unprescribed; personal goal, selected-only reset, daily independence',async()=>{
  await tool('tasbih');const id=await page.evaluate(()=>Istiqamah.adhkarLibrary.entries.find(e=>!e.count).id);
  await page.locator('#tasbih-adhkar').selectOption(id);assert((await page.locator('body').innerText()).includes('No prescribed repetition count'));
  await page.locator('#dhikr-personal-target').fill('5');await page.locator('#dhikr-personal-target').blur();
  await page.locator('[data-action="tasbih"]').click();await page.locator('[data-action="tasbih-reset"]').click();
  assert.equal(await page.evaluate(id=>Istiqamah.getDay().adhkarCounts[id],id),0);
  const independent=await page.evaluate(id=>{const a=Istiqamah,e=a.adhkarLibrary.resolve(id),y=a.offsetDay(a.today(),-1);a.adhkarLibrary.set(e,4,y);return [a.adhkarLibrary.count(e,y),a.adhkarLibrary.count(e)];},id);assert.deepEqual(independent,[4,0]);
 });
 await check('legacy positional migration is explicit, idempotent, unmatched counts remain visible',async()=>{
  const r=await page.evaluate(async()=>{const {migrate}=await import('./js/storage.js?v=2.1.0');const s=structuredClone(Istiqamah.state);delete s.schemaVersion;delete s.adhkarPrefs;for(const d of Object.values(s.days)){delete d.adhkarCounts;delete d.earlierAdhkar;}s.tasbih.selected='morning-1';s.days[Istiqamah.today()].adhkar={'morning-1':2,'morning-14':9};const m=migrate(s);return{m,s,twice:JSON.stringify(m)===JSON.stringify(migrate(m)),key:Istiqamah.today()};});
  assert(r.twice);assert.equal(r.m.adhkarPrefs.selected,'seen-morning-4');assert.equal(r.m.days[r.key].adhkarCounts['seen-morning-4'],2);assert.equal(r.m.days[r.key].earlierAdhkar['morning-14'],9);assert.deepEqual(r.m.days[r.key].adhkar,r.s.days[r.key].adhkar);
 });
 await check('manual Ramadan boundaries, paused fasting and regular-plan restoration',async()=>{
  const r=await page.evaluate(()=>{const a=Istiqamah,c=a.ramadanService.config(),ordinary=JSON.stringify(a.state.habits);c.mode='on';c.manualStart='2027-02-09';c.manualLength=29;const start=a.ramadanService.context(),end=a.ramadanService.context('2027-03-10');a.ramadanService.update('paused',true);const h={fasting:true};const paused=a.score(a.today()),protectedHabit=a.habitStreak(h);c.mode='off';return{ordinary,after:JSON.stringify(a.state.habits),start,end,record:a.getDay().ramadanV3,active:a.ramadanService.context().active,paused,protectedHabit};});
  assert.equal(r.start.day,1);assert.equal(r.end.active,false);assert(r.record.paused);assert.equal(r.ordinary,r.after);assert.equal(r.active,false);
 });
 await check('local prayer countdown instants, configurable preparation and inclusive Quran plan',async()=>{
  const r=await page.evaluate(()=>{const a=Istiqamah,s=a.ramadanService,c=s.config();c.mode='on';c.manualStart=a.today();c.completion={enabled:true,pages:100,deadline:a.offsetDay(a.today(),4),setOn:a.today()};s.update('pages',10);const first=s.planner(),snap=JSON.stringify(a.getDay().ramadanV3.planSnapshot);c.completion.pages=50;const next=s.planner();return{first,next,snap,after:JSON.stringify(a.getDay().ramadanV3.planSnapshot),countdowns:s.countdowns().map(x=>({name:x.name,seconds:x.seconds})),prayers:a.prayerService.calculate(a.today()).length};});
  assert.equal(r.first.perDay,18);assert.equal(r.next.perDay,8);assert.equal(r.snap,r.after);assert(r.prayers>=5);assert.deepEqual(r.countdowns.map(x=>x.name),['Fajr','Maghrib']);assert(r.countdowns.every(x=>x.seconds>0));
 });
 await check('fixed daily targets remain available and historical planner uses the recorded decision',async()=>{
  const r=await page.evaluate(()=>{const a=Istiqamah,c=a.ramadanService.config();c.completion.enabled=false;c.dailyTargetEnabled=true;c.dailyPages=2;const fixed=a.ramadanService.planner();const yesterday=a.offsetDay(a.today(),-1);a.getDay(yesterday).ramadanV3={season:1448,day:1,planSnapshot:{dailyTargetEnabled:true,dailyPages:7,completion:{enabled:false},goal:1}};c.dailyPages=4;const history=a.ramadanService.planner(a.ramadanService.context(yesterday));c.dailyTargetEnabled=false;return{fixed,history};});assert.equal(r.fixed.perDay,2);assert.equal(r.history.perDay,7);
 });
 await check('preparation calendar export retains instants crossing midnight',async()=>{
  const instant='2027-02-08T23:20:00.000Z';
  await page.evaluate(instant=>{const a=Istiqamah;window.realPreparation=a.ramadanService.preparation;a.ramadanService.preparation=()=>[{id:'ramadan-fajr-prep',label:'Suhoor preparation',time:'03:20',instant,ramadanPrep:true,note:'Personal preparation reminder'}];},instant);
  const download=page.waitForEvent('download');await page.evaluate(()=>Istiqamah.exportCalendar(1));const file=await download;const bytes=fs.readFileSync(await file.path(),'utf8');assert(bytes.includes('DTSTART:20270208T232000Z'));
  await page.evaluate(()=>Istiqamah.ramadanService.preparation=window.realPreparation);
 });
 await check('last-ten-night goals, backups and strict canonical validation',async()=>{
  const r=await page.evaluate(()=>{const a=Istiqamah,c=a.ramadanService.config();c.manualStart=a.offsetDay(a.today(),-20);c.nightGoals='Quiet reflection';a.ramadanService.update('family',true);a.storage.save();const valid=a.validate(a.state),bad=structuredClone(a.state);bad.days[a.today()].ramadanV3.day=31;return{night:a.ramadanService.night(),valid,invalid:a.validate(bad),goals:c.nightGoals};});assert(r.night.lastTen);assert(r.valid);assert(!r.invalid);assert.equal(r.goals,'Quiet reflection');
 });
 await check('expanded library offline reload and no runtime exceptions',async()=>{
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.reload();await page.waitForFunction(()=>!!navigator.serviceWorker.controller&&!!window.Istiqamah);await context.setOffline(true);await page.reload();await page.waitForFunction(()=>!!window.Istiqamah&&SOURCE_DATA.adhkar.length===50);await tool('tasbih');assert((await page.locator('#tasbih-adhkar option').count())>50);assert.deepEqual(errors,[]);
 });
 await context.close();console.log(`${n} Phase 2 checks passed; real upgrades and 5-language layouts are also exercised by npm test.`);
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server.kill();});
