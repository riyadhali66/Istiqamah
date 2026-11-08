'use strict';
const assert=require('node:assert/strict');
module.exports=async({browser,base,check,seed})=>{
 async function open(raw,setup){const context=await browser.newContext();await context.addInitScript(({raw,setup})=>{localStorage.setItem('istiqamah.v1',raw);if(setup==='no-op'){const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='istiqamah.migration.v1')return;return original.call(this,key,value)}}if(setup==='indexeddb-fails'){localStorage.setItem('istiqamah.migration.v1','earlier exact original');indexedDB.open=()=>{throw new Error('Backup unavailable')}}},{raw,setup});const page=await context.newPage();await page.goto(base);await page.waitForFunction(()=>!!window.Istiqamah);return{context,page}}
 await check('one original-bytes-first migration chain accepts legacy, Phase 1, and Phase 2 states',async()=>{
  for(const kind of ['legacy','phase1','phase2']){
   const input=structuredClone(seed);if(kind!=='phase1')delete input.schemaVersion;if(kind!=='phase2')delete input.phase2;
   input.days={};const today='2026-11-08';input.days[today]={values:{'prayer-Fajr':1},snapshot:input.habits,journal:{well:'Original history'},adhkar:{'morning-1':2}};input.tasbih.selected='morning-1';
   const raw=JSON.stringify(input,null,2)+'\n';const {context,page}=await open(raw);
   const result=await page.evaluate(async()=>{const a=Istiqamah,{migrate}=await import('./js/storage.js?v=2.1.0');const before=localStorage.getItem(a.storage.key);await a.storage.load();return{before,after:localStorage.getItem(a.storage.key),original:localStorage.getItem(a.storage.migrationKey),state:a.state,id:a.adhkarLibrary.aliases.get('morning-1'),pure:JSON.stringify(migrate(a.state))===JSON.stringify(migrate(migrate(a.state)))}});
   assert.equal(result.original,raw);assert.equal(result.state.schemaVersion,1);assert.equal(result.state.phase2.schemaVersion,2);assert.equal(result.state.days[today].adhkar[result.id],2);assert.equal(result.state.days[today].journal.well,'Original history');assert.equal(result.pure,true);assert.equal(result.before,result.after);await context.close();
  }
 });
 await check('migration rejects a silently failed original backup and a failed existing-copy checkpoint',async()=>{
  const input=structuredClone(seed);delete input.schemaVersion;const raw=JSON.stringify(input,null,2);
  for(const setup of ['no-op','indexeddb-fails']){const{context,page}=await open(raw,setup);assert.equal(await page.evaluate(()=>localStorage.getItem('istiqamah.v1')),raw);assert.equal(await page.evaluate(()=>Istiqamah.storage.save()),false);assert.equal(await page.locator('#wizard').isVisible(),false);await context.close()}
 });
 await check('a Phase 1 upgrade retains its earlier original and checkpoints current bytes before adding Phase 2',async()=>{
  const input=structuredClone(seed);delete input.phase2;const raw=JSON.stringify(input,null,2)+'\n';const context=await browser.newContext();await context.addInitScript(raw=>{localStorage.setItem('istiqamah.v1',raw);localStorage.setItem('istiqamah.migration.v1','earlier exact original')},raw);const page=await context.newPage();await page.goto(base);await page.waitForFunction(()=>!!window.Istiqamah);const result=await page.evaluate(async()=>({original:localStorage.getItem('istiqamah.migration.v1'),copies:await Istiqamah.storage.snapshots.checkpoints(),schema:Istiqamah.state.phase2.schemaVersion}));assert.equal(result.original,'earlier exact original');assert(result.copies.some(row=>row.data===raw));assert.equal(result.schema,2);await context.close();
 });
 await check('retired assets and old root feature files are absent; all new UI remains in the module graph',async()=>{
  const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');for(const file of ['phase2.js','phase2.css','data/adhan-makkah.mp3','data/adhan-mishary.mp3','vendor/uthmani.woff2'])assert.equal(fs.existsSync(path.join(root,file)),false,file);
  for(const file of ['js/ramadan.js','js/adhkar-library.js','js/ui/ramadan.js','js/ui/adhkar-library.js','css/app.css'])assert(fs.existsSync(path.join(root,file)),file);
 });
};
