'use strict';
const assert=require('node:assert/strict'),{pathToFileURL}=require('node:url'),path=require('node:path');
(async()=>{
 const m=await import(pathToFileURL(path.resolve('js/native-model.js'))),platform=await import(pathToFileURL(path.resolve('js/native-platform.js')));
 assert(!platform.isNative());assert(!platform.isNative({isNativePlatform:()=>false}));assert(platform.isNative({isNativePlatform:()=>true}));
 const prefs=m.nativeDefaults();prefs.enabled=true;prefs.before=10;prefs.prayers.Isha=false;prefs.habits.morning=true;prefs.habits.suhoor=true;
 const offsetDay=(key,n)=>new Date(Date.parse(key+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
 const ctx={prefs,start:'2027-02-08',now:Date.parse('2027-02-08T00:00:00Z'),offsetDay,t:s=>s,
 calculate:key=>m.PRAYERS.map((name,i)=>({name,date:new Date(key+`T${String(5+i*3).padStart(2,'0')}:00:00Z`)})),timeOnDate:(key,time)=>new Date(key+'T'+time+':00Z'),
 preparation:key=>[{id:'ramadan-fajr-prep',label:'Suhoor preparation',instant:key+'T04:15:00Z'}]};
 const rows=m.buildNotifications(ctx);assert.equal(rows.length,42);assert.equal(new Set(rows.map(r=>r.id)).size,42);assert.equal(rows.find(n=>n.title==='Fajr').schedule.at.toISOString(),'2027-02-08T04:50:00.000Z');assert(!rows.some(r=>r.title==='Isha'));assert(rows.every(n=>!('sound' in n)));
 assert.equal(m.buildNotifications({...ctx,prefs:{...prefs,enabled:false}}).length,0);
 assert(!m.validNativePrefs({...prefs,before:999}));assert(!m.validNativePrefs({...prefs,times:{...prefs.times,bedtime:'25:90'}}));
 const later=Date.parse('2027-02-08T08:00Z');assert(m.buildNotifications({...ctx,now:later}).every(n=>+n.schedule.at>later));
 const calls=[];let permission='granted';
 const plugin={getPending:async()=>({notifications:[{id:100000001},{id:7}]}),checkPermissions:async()=>({display:permission}),checkExactNotificationSetting:async()=>({exact_alarm:'denied'}),createChannel:async o=>calls.push(['channel',o]),schedule:async o=>calls.push(['schedule',o]),cancel:async o=>calls.push(['cancel',o])};
 let r=await m.scheduleNative(plugin,ctx);assert.equal(r.count,42);assert.equal(r.exact,'denied');assert(calls.find(c=>c[0]==='schedule')[1].notifications.every(n=>n.isExactNotification===false));assert(calls.find(c=>c[0]==='cancel')[1].notifications.every(n=>n.id!==7));
 permission='denied';calls.length=0;r=await m.scheduleNative(plugin,ctx);assert.equal(r.count,0);assert(!calls.some(c=>c[0]==='schedule'));assert.equal(calls[0][0],'cancel');
 const future=m.buildNotifications({...ctx,providers:[key=>[{slot:30,title:'Future Friday reminder',date:new Date(key+'T10:00Z')}]]});assert.equal(future.length,49);
 globalThis.Capacitor={isNativePlatform:()=>true};globalThis.IstiqamahPlugins={Filesystem:{writeFile:async x=>calls.push(['write',x]),getUri:async()=>({uri:'file:///private/cache/backup.json'})},Share:{share:async x=>calls.push(['share',x])}};
 await platform.shareBackup('../backup.json','exact bytes\n');assert.equal(calls.find(c=>c[0]==='write')[1].data,'exact bytes\n');assert(!calls.find(c=>c[0]==='write')[1].path.includes('../'));assert.deepEqual(calls.find(c=>c[0]==='share')[1].files,['file:///private/cache/backup.json']);
 console.log('PASS native: detection, 7-day scheduling, offsets, toggles, stable IDs, no past alarms, permissions, exact fallback, owned cancellation, extension providers, private share bytes');
})().catch(e=>{console.error(e);process.exitCode=1;});
