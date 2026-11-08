'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const {spawn}=require('node:child_process');
const path=require('node:path');
const port=Number(process.env.PHASE2_TEST_PORT||8766),base=`http://127.0.0.1:${port}`;
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:path.resolve(__dirname,'..'),stdio:'ignore'});
let browser,count=0;
const check=async(name,run)=>{await run();console.log(`PASS Phase 2 ${++count}: ${name}`)};
const nav=async(page,id)=>{await page.locator(`[data-action="nav"][data-id="${id}"]`).first().click();await page.waitForFunction(id=>document.querySelector('.navbtn.active')?.dataset.id===id,id)};
const tool=async(page,id)=>{await nav(page,'tools');await page.locator(`[data-action="tool"][data-id="${id}"]`).click()};
(async()=>{
  for(let i=0;i<50;i++){try{if((await fetch(base)).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Dubai',acceptDownloads:true});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.install({time:new Date('2027-03-01T08:00:00Z')});
  await page.goto(base);await page.waitForFunction(()=>!!window.Istiqamah);await page.locator('[data-draft="name"]').fill('Amina');await page.locator('[data-draft="gender"]').selectOption('Female');await page.locator('[data-draft="city"]').fill('Dubai');await page.locator('[data-draft="city"]').blur();await page.locator('[data-action="skip-wizard"]').click();await page.locator('[data-action="finish-wizard"]').click();
  await check('stable IDs and original-source checksums for 113 entries in 10 categories',async()=>{
    const entries=await page.evaluate(()=>Istiqamah.adhkarData.entries);
    assert.equal(entries.length,113);assert.equal(new Set(entries.map(e=>e.id)).size,113);assert.equal(new Set(entries.map(e=>e.category)).size,10);
    assert.equal(entries.filter(e=>e.count===null).length,52);
    for(const e of entries){const hash=crypto.createHash('sha256').update(e.sourceCategory+'\0'+e.text+'\0'+e.reference).digest('hex');assert.equal(e.id,'azkar-'+hash.slice(0,20));assert.equal(e.provenance.rowSha256,hash);assert.deepEqual(e.translations,{})}
  });
  await check('legacy backups migrate positional counters and selected dhikr without losing history',async()=>{
    const old=await page.evaluate(()=>{const a=Istiqamah,s=JSON.parse(JSON.stringify(a.state));delete s.phase2;s.tasbih={count:27,goal:33,selected:'morning-1'};const d=s.days[a.today()];d.adhkar={'morning-1':2,'evening-0':1};d.values['prayer-Fajr']=1;d.journal.well='Keep my old journal';return s});
    assert(await page.evaluate(s=>Istiqamah.validate(s),old));
    await page.evaluate(s=>localStorage.setItem('istiqamah.v1',JSON.stringify(s)),old);await page.reload();await page.waitForFunction(()=>!!window.Istiqamah);
    const result=await page.evaluate(()=>{const a=Istiqamah,id=a.adhkarLibrary.aliases.get('morning-1');return {id,selected:a.state.tasbih.selected,count:a.getDay().adhkar[id],free:a.state.tasbih.count,journal:a.getDay().journal.well,prayer:a.getDay().values['prayer-Fajr'],schema:a.state.phase2.schemaVersion}});
    assert.equal(result.selected,result.id);assert.equal(result.count,2);assert.equal(result.free,27);assert.equal(result.journal,'Keep my old journal');assert.equal(result.prayer,1);assert.equal(result.schema,2);
  });
  await check('search, category filtering, favorites, and source counts in Tasbih',async()=>{
    await tool(page,'tasbih');await page.locator('#adhkar-category').selectOption('general');assert.equal(await page.locator('#tasbih-adhkar optgroup').count(),2); // selected morning entry remains accessible
    const id=await page.evaluate(()=>Istiqamah.adhkarLibrary.list('general')[0].id);await page.locator('#tasbih-adhkar').selectOption(id);
    await page.locator('[data-phase-action="favorite"]').click();await page.locator('#adhkar-category').selectOption('favorites');assert.equal(await page.locator('#tasbih-adhkar option').count(),2);
    const search=await page.evaluate(id=>Istiqamah.adhkarLibrary.resolve(id).text.split(' ').slice(0,2).join(' '),id);
    await page.locator('#adhkar-search').fill(search);assert.equal(await page.locator('#tasbih-adhkar option').count(),2);
    await page.locator('#adhkar-search').fill('a-query-that-does-not-exist');assert((await page.locator('.dhikr-chooser').innerText()).includes('No matching adhkar'));
    await page.locator('#adhkar-search').fill('');await page.locator('#adhkar-category').selectOption('all');
  });
  await check('missing source counts remain unset and personal goals are explicitly labeled',async()=>{
    assert(await page.locator('#dhikr-personal-target').isVisible());assert((await page.locator('body').innerText()).includes('not a religious prescription'));
    await page.locator('#dhikr-personal-target').fill('5');await page.locator('#dhikr-personal-target').blur();
    await page.locator('[data-action="tasbih"]').click();await page.locator('[data-action="tasbih"]').click();assert.equal(await page.locator('.tasbih-button').innerText(),'2');
    const selected=await page.locator('#tasbih-adhkar').inputValue();await page.locator('[data-action="tasbih-next"]').click();assert.equal(await page.locator('.tasbih-button').innerText(),'0');await page.locator('#tasbih-adhkar').selectOption(selected);assert.equal(await page.locator('.tasbih-button').innerText(),'2');
    await page.locator('[data-action="tasbih-reset"]').click();await page.evaluate(()=>Istiqamah.phase2.migrate(Istiqamah.state));assert.equal(await page.locator('.tasbih-button').innerText(),'0');
  });
  await check('Ramadan calendar uses Umm al-Qura, supports local adjustments and both month lengths',async()=>{
    const r=await page.evaluate(()=>{const a=Istiqamah,c=a.state.phase2.ramadan;c.startDate='';const first=a.ramadanService.season('2024-03-11'),last=a.ramadanService.season('2024-04-09'),outside=a.ramadanService.season('2024-04-10');c.startDate='2024-03-12';c.length=29;return {first,last,outside,adjusted:a.ramadanService.season('2024-03-12'),before:a.ramadanService.season('2024-03-11'),end:a.ramadanService.season('2024-04-09'),after:a.ramadanService.season('2024-04-10'),invalid:Istiqamah.phase2.validDate('2027-02-31')}});
    assert.equal(r.first.day,1);assert.equal(r.last.day,30);assert.equal(r.outside.inRamadan,false);assert.equal(r.adjusted.adjustment,1);assert.equal(r.before.inRamadan,false);assert.equal(r.end.day,29);assert.equal(r.after.inRamadan,false);assert.equal(r.invalid,false);
  });
  await check('Ramadan settings enable a separate overlay without changing the ordinary habit plan',async()=>{
    const before=await page.evaluate(()=>JSON.stringify(Istiqamah.state.habits));await nav(page,'settings');
    const form=page.locator('#ramadan-settings');await form.locator('[name="startDate"]').fill('2027-03-01');await form.locator('[name="length"]').selectOption('30');await form.locator('[name="enabled"]').check();await form.locator('button').click();await nav(page,'today');
    assert(await page.locator('.ramadan-dashboard').isVisible());assert((await page.locator('.ramadan-dashboard h2').innerText()).includes('1 / 30'));
    assert.equal(await page.evaluate(()=>JSON.stringify(Istiqamah.state.habits)),before);
    await page.locator('#ramadan-fasting').selectOption('fasted');await page.locator('#ramadan-reason').fill('Private note only');
    assert.equal(await page.evaluate(()=>Istiqamah.getDay().values['ramadan-fasting']),1);assert.equal(await page.evaluate(()=>Istiqamah.getDay().fasted),true);
    await page.locator('#ramadan-today-toggle').uncheck();assert.equal(await page.locator('.ramadan-dashboard').count(),0);
    const after=await page.evaluate(()=>({habits:JSON.stringify(Istiqamah.state.habits),r:Istiqamah.getDay().ramadan}));assert.equal(after.habits,before);assert.equal(after.r.fasting,'fasted');assert.equal(after.r.reason,'Private note only');
    await page.locator('#ramadan-today-toggle').check();assert.equal(await page.locator('#ramadan-fasting').inputValue(),'fasted');
  });
  await check('not-fasting and paused days do not penalize scores or break fasting streaks',async()=>{
    await page.evaluate(()=>{const a=Istiqamah,d=a.getDay();for(const h of [...d.snapshot,...d.ramadan.snapshot])d.values[h.id]=h.target;const yesterday=a.getDay(a.offsetDay(a.today(),-1));yesterday.ramadan=JSON.parse(JSON.stringify(d.ramadan));yesterday.ramadan.day=1;yesterday.values['ramadan-fasting']=1;a.storage.save();a.render()});
    await page.locator('#ramadan-fasting').selectOption('not-fasting');assert.equal(await page.evaluate(()=>Istiqamah.score(Istiqamah.today())),100);
    const streak=await page.evaluate(()=>Istiqamah.habitStreak(Istiqamah.getDay().ramadan.snapshot.find(h=>h.id==='ramadan-fasting')));assert.equal(streak,1);
    await page.locator('#ramadan-fasting').selectOption('paused');assert.equal(await page.evaluate(()=>Istiqamah.score(Istiqamah.today())),100);assert(await page.locator('.ramadan-dashboard [data-habit="ramadan-quran"]').isDisabled());
    await page.locator('#ramadan-fasting').selectOption('untracked');
  });
  await check('Fajr/Maghrib countdown selection and preparation reminders use actual local prayer instants',async()=>{
    const r=await page.evaluate(()=>{const a=Istiqamah,key=a.today(),p=a.prayerService.calculate(key),f=p.find(p=>p.name==='Fajr'),m=p.find(p=>p.name==='Maghrib');const result={before:a.ramadanService.next(key,new Date(+f.date-60000)).name,daytime:a.ramadanService.next(key,new Date(+f.date+60000)).name,night:a.ramadanService.next(key,new Date(+m.date+60000)).name,prep:a.ramadanService.schedule(key).map(b=>b.instant),f:+f.date,m:+m.date};a.state.phase2.ramadan.startDate=a.offsetDay(key,-29);result.afterLast=a.ramadanService.next(key,new Date(+m.date+60000));a.state.phase2.ramadan.startDate=key;return result});
    assert.equal(r.before,'Fajr');assert.equal(r.daytime,'Maghrib');assert.equal(r.night,'Fajr');assert.equal(r.afterLast,null);assert.equal(Date.parse(r.prep[0]),r.f-45*60000);assert.equal(Date.parse(r.prep[1]),r.m-30*60000);
  });
  await check('Ramadan calendar export retains a preparation reminder crossing midnight',async()=>{
    const event=page.waitForEvent('download');
    await page.evaluate(()=>{const a=Istiqamah,original=a.prayerService.calculate;a.prayerService.calculate=key=>original(key).map(p=>p.name==='Fajr'?{...p,date:a.zonedDate(key,'00:30')}:p);try{a.exportCalendar(1)}finally{a.prayerService.calculate=original}});
    const file=await event,text=fs.readFileSync(await file.path(),'utf8');
    const prep=text.split('BEGIN:VEVENT').find(event=>event.includes('SUMMARY:Suhoor preparation'));
    assert(prep);assert(prep.includes('DTSTART:20270228T194500Z'));assert(prep.includes('ACTION:DISPLAY'));
  });
  await check('Quran planning uses inclusive days, actual pages and immutable past target snapshots',async()=>{
    const r=await page.evaluate(()=>{const a=Istiqamah,c=a.state.phase2.ramadan,key=a.today();c.quran={enabled:true,pages:60,deadline:a.offsetDay(key,4),setOn:key};a.ramadanService.ensure(key,true);const target=a.getDay(key).ramadan.snapshot.find(h=>h.id==='ramadan-quran').target;a.getDay(key).values['ramadan-quran']=20;const tomorrow=a.offsetDay(key,1),next=a.ramadanService.target(tomorrow);a.ramadanService.ensure(tomorrow);const oldSnapshot=JSON.stringify(a.getDay(tomorrow).ramadan.snapshot);c.quran={enabled:true,pages:100,deadline:a.offsetDay(key,9),setOn:key};a.ramadanService.ensure(key,true);return {target,next,today:a.getDay().ramadan.snapshot.find(h=>h.id==='ramadan-quran').target,preserved:JSON.stringify(a.getDay(tomorrow).ramadan.snapshot)===oldSnapshot,expired:a.ramadanService.target(a.offsetDay(key,10))}});
    assert.equal(r.target,12);assert.equal(r.next,10);assert.equal(r.today,10);assert.equal(r.preserved,true);assert.equal(r.expired,0);
  });
  await check('last ten nights show optional goals and preserve them privately',async()=>{
    await page.evaluate(()=>{const a=Istiqamah;a.state.phase2.ramadan.length=29;a.state.phase2.ramadan.startDate=a.offsetDay(a.today(),-19);a.ramadanService.ensure(a.today(),true);a.render()});assert.equal(await page.locator('.last-ten').count(),0);
    await page.evaluate(()=>{const a=Istiqamah;a.state.phase2.ramadan.startDate=a.offsetDay(a.today(),-20);a.ramadanService.ensure(a.today(),true);a.render()});
    assert(await page.locator('.last-ten').isVisible());await page.locator('#ramadan-night-goals').fill('A quiet reading session');await page.reload();await page.waitForFunction(()=>!!window.Istiqamah);assert.equal(await page.locator('#ramadan-night-goals').inputValue(),'A quiet reading session');
  });
  await check('backups include new records, reject malformed Ramadan data, and support confirmed restore',async()=>{
    await nav(page,'settings');const event=page.waitForEvent('download');await page.locator('[data-action="backup"]').click();const file=await event,data=JSON.parse(fs.readFileSync(await file.path(),'utf8'));assert.equal(data.phase2.schemaVersion,2);assert(data.days['2027-03-01'].ramadan);assert(await page.evaluate(s=>Istiqamah.validate(s),data));const broken=structuredClone(data);broken.phase2.ramadan.startDate='2027-02-31';assert.equal(await page.evaluate(s=>Istiqamah.validate(s),broken),false);
    await page.locator('#import-file').setInputFiles({name:'phase2.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});await page.locator('#confirm-import').click();await page.locator('#modal').waitFor({state:'hidden'});assert.equal(await page.evaluate(()=>Istiqamah.getDay().ramadan.reason),'Private note only');
    const unsafe=structuredClone(data);unsafe.days['2027-03-01'].ramadan.snapshot.find(h=>!h.fasting).label='<img src=x onerror=alert(1)>';
    await page.locator('#import-file').setInputFiles({name:'escaped-label.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(unsafe))});await page.locator('#confirm-import').click();await page.locator('#modal').waitFor({state:'hidden'});await nav(page,'today');assert.equal(await page.locator('.ramadan-dashboard img').count(),0);assert((await page.locator('.ramadan-dashboard').innerText()).includes('<img src=x'));
    await nav(page,'settings');await page.locator('#import-file').setInputFiles({name:'restore.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});await page.locator('#confirm-import').click();await page.locator('#modal').waitFor({state:'hidden'});
  });
  await check('all five languages, dark mode, full source text and mobile layouts',async()=>{
    for(const language of ['en','ar','ur','ml','hi']){await nav(page,'settings');await page.locator('[data-profile="language"]').selectOption(language);await page.setViewportSize({width:390,height:844});await nav(page,'today');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);if(['ml','hi'].includes(language)){const q=await page.locator('.inspiration .quran').innerText();assert(q.length>0)}await tool(page,'tasbih');const longest=await page.evaluate(()=>Istiqamah.adhkarData.entries.reduce((a,b)=>a.text.length>b.text.length?a:b).id);await page.locator('#adhkar-category').selectOption('all');await page.locator('#tasbih-adhkar').selectOption(longest);const r=await page.locator('.selected-dhikr .quote').evaluate(el=>({height:el.clientHeight,scroll:el.scrollHeight,style:getComputedStyle(el).maxHeight}));assert.equal(r.style,'none');assert(r.height+1>=r.scroll);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)}
    await nav(page,'settings');await page.locator('#theme-select').selectOption('dark');await nav(page,'today');assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');await page.screenshot({path:path.join(__dirname,'../test-results/ramadan-mobile.png')});
    await nav(page,'settings');await page.locator('[data-profile="language"]').selectOption('en');await page.locator('#theme-select').selectOption('light');await page.setViewportSize({width:1440,height:1000});await nav(page,'today');await page.screenshot({path:path.join(__dirname,'../test-results/ramadan-desktop.png')});
  });
  await check('new library and Ramadan dashboard work offline with persisted data',async()=>{
    await page.evaluate(async()=>{await navigator.serviceWorker.ready});await page.reload();await page.waitForFunction(()=>!!window.Istiqamah);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);await context.setOffline(true);await page.reload();await page.waitForFunction(()=>!!window.Istiqamah);assert(await page.locator('.ramadan-dashboard').isVisible());await tool(page,'tasbih');assert.equal(await page.evaluate(()=>Istiqamah.adhkarData.entries.length),113);const before=await page.evaluate(()=>Istiqamah.state.tasbih.count);await page.locator('#tasbih-adhkar').selectOption('');await page.locator('[data-action="tasbih"]').click();await page.reload();await page.waitForFunction(()=>!!window.Istiqamah);assert.equal(await page.evaluate(()=>Istiqamah.state.tasbih.count),before+1);await context.setOffline(false);
  });
  await check('no runtime exceptions in Phase 2 workflows',async()=>assert.deepEqual(errors,[]));
  console.log(`\n${count} Phase 2 browser checks passed.`);
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.kill()});
