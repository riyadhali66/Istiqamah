'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const base='http://127.0.0.1:8767',server=spawn('python3',['-m','http.server','8767','--bind','127.0.0.1'],{stdio:'ignore'}),shots=path.resolve('docs/screenshots/android-2.1.1');fs.mkdirSync(shots,{recursive:true});let browser;
(async()=>{
 for(let i=0;i<50;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(require('fs').existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox'],headless:true});
 const c=await browser.newContext({viewport:{width:390,height:844},timezoneId:'Asia/Dubai',acceptDownloads:true}),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.clock.install({time:new Date('2027-02-28T08:00:00+04:00')});
 await c.addInitScript(()=>{if(!sessionStorage.getItem('started')){localStorage.setItem('istiqamah.releaseSeen.2.1.1','seen');sessionStorage.setItem('started','1');}});
 await p.goto(base);await p.waitForFunction(()=>!!window.Istiqamah);await p.locator('[data-draft="city"]').fill('Dubai');await p.locator('[data-draft="city"]').blur();await p.locator('[data-action="skip-wizard"]').click();await p.locator('[data-action="finish-wizard"]').click();
 if(await p.locator('[data-action="ramadan-setup-skip"]').isVisible())await p.locator('[data-action="ramadan-setup-skip"]').click();
 await p.evaluate(()=>{const a=Istiqamah;Object.assign(a.ramadanService.config(),{mode:'on',manualStart:'2027-02-08',setupYear:1448,nightGoals:'Quiet reflection'});a.storage.save();a.render();});
 for(const lang of ['en','ar','ur','ml','hi'])for(const theme of ['light','dark']){
  await p.evaluate(async({lang,theme})=>{const {session}=await import('./js/session.js?v=2.1.1'),{loadTranslations}=await import('./js/i18n.js?v=2.1.1');session.lang=lang;session.state.profile.language=lang;session.state.settings.theme=theme;await loadTranslations(lang);session.page='today';Istiqamah.render();},{lang,theme});
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.equal(await p.locator('html').getAttribute('dir'),['ar','ur'].includes(lang)?'rtl':'ltr');
  if(['en','ar'].includes(lang))await p.screenshot({path:path.join(shots,`today-${lang}-${theme}.png`),fullPage:true});
  await p.locator('[data-action="nav"][data-id="tools"]').first().click();await p.locator('[data-action="tool"][data-id="tasbih"]').click();
  const id=await p.evaluate(()=>Istiqamah.adhkarLibrary.list('sleep')[0].id);await p.locator('#tasbih-adhkar').selectOption(id);
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const quote=p.locator('.adhkar-selected .quote');assert.equal(await quote.evaluate(e=>e.scrollHeight>e.clientHeight+1),false);
  if(['en','ar'].includes(lang))await p.screenshot({path:path.join(shots,`tasbih-${lang}-${theme}.png`),fullPage:true});
  await p.locator('[data-action="tool"][data-id="ramadan"]').click();assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  if(['en','ar'].includes(lang))await p.screenshot({path:path.join(shots,`ramadan-${lang}-${theme}.png`),fullPage:true});
  await p.evaluate(async()=>{localStorage.removeItem('istiqamah.releaseSeen.2.1.1');(await import('./js/release.js?v=2.1.1&preview='+Date.now())).releaseNotes();});
  await p.locator('#release-notes').waitFor();assert.equal(await p.locator('#release-notes').evaluate(e=>e.scrollWidth>e.clientWidth+1),false);
  if(['en','ar'].includes(lang))await p.screenshot({path:path.join(shots,`whats-new-${lang}-${theme}.png`)});
  await p.locator('#release-dismiss').click();assert.equal(await p.evaluate(()=>localStorage.getItem('istiqamah.releaseSeen.2.1.1')),'seen');
  await p.evaluate(async()=>{(await import('./js/release.js?v=2.1.1')).releaseNotes();});assert.equal(await p.locator('#release-notes').isVisible(),false);
 }
 console.log('PASS: 5 languages × 2 themes at 390px, full readable text, once-only localized release sheet; 16 screenshots');
 // A release sheet must never take focus from an unsaved journal.
 await p.locator('[data-action="nav"][data-id="today"]').first().click();
 const journal=p.locator('textarea[data-journal]').first();await journal.fill('Unsaved text must remain');
 await p.evaluate(async()=>{localStorage.removeItem('istiqamah.releaseSeen.2.1.1');(await import('./js/release.js?v=2.1.1&focus-check=1')).releaseNotes();});assert.equal(await p.locator('#release-notes').isVisible(),false);assert.equal(await journal.inputValue(),'Unsaved text must remain');await journal.blur();
 await p.evaluate(()=>localStorage.setItem('istiqamah.releaseSeen.2.1.1','seen'));
 // Corrupt only the app bundle; independent recovery still exports exact raw values.
 await p.evaluate(async()=>{const a=Istiqamah,m=await import('./js/snapshots.js?v=2.1.1'),s=structuredClone(a.state);s.profile.name='Yesterday recovery';await m.snapshots.put(a.offsetDay(a.today(),-1),JSON.stringify(s));for(const r of await navigator.serviceWorker.getRegistrations())await r.unregister();for(const k of await caches.keys())await caches.delete(k);});
 await p.route('**/js/app.js*',r=>r.fulfill({status:200,contentType:'text/javascript',body:'throw new Error("Deliberately corrupt app fixture")'}));
 await p.reload();await p.locator('#boot-recovery:not([hidden])').waitFor();
 const raw=await p.evaluate(()=>localStorage.getItem('istiqamah.v1'));
 const d=p.waitForEvent('download');await p.locator('#boot-export').click();const file=await d;const exported=JSON.parse(fs.readFileSync(await file.path(),'utf8'));assert.equal(exported['istiqamah.v1'],raw);
 await p.locator('#boot-restore').click();await p.waitForFunction(()=>JSON.parse(localStorage.getItem('istiqamah.v1')).profile.name==='Yesterday recovery');assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('istiqamah.v1')).profile.name),'Yesterday recovery');
 assert(await p.evaluate(raw=>Object.keys(localStorage).filter(k=>k.startsWith('istiqamah.recovery.')).some(k=>localStorage.getItem(k)===raw),raw));
 assert.deepEqual(errors,[]);console.log('PASS: no typing interruption; corrupt app recovery exports raw records and restores yesterday only after verified undo backup');
 await c.close();
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server.kill();});
