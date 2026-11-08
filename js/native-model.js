export const PRAYERS=['Fajr','Dhuhr','Asr','Maghrib','Isha'];
export const HABITS=['morning','evening','quran','bedtime','suhoor','iftar'];
export const nativeDefaults=()=>({enabled:false,before:0,prayers:Object.fromEntries(PRAYERS.map(p=>[p,true])),habits:Object.fromEntries(HABITS.map(p=>[p,false])),times:{morning:'06:30',evening:'18:30',quran:'07:00',bedtime:'22:00'}});
export function validNativePrefs(p){
 const obj=v=>v&&typeof v==='object'&&!Array.isArray(v);
 return obj(p)&&typeof p.enabled==='boolean'&&Number.isInteger(p.before)&&p.before>=0&&p.before<=120&&obj(p.prayers)&&PRAYERS.every(k=>typeof p.prayers[k]==='boolean')&&obj(p.habits)&&HABITS.every(k=>typeof p.habits[k]==='boolean')&&obj(p.times)&&['morning','evening','quran','bedtime'].every(k=>typeof p.times[k]==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(p.times[k]));
}
export const ownsNotification=n=>Number.isInteger(n.id)&&n.id>=100000000&&n.id<110000000;
export function notificationId(key,slot){return 100000000+(Math.floor(Date.parse(key+'T12:00:00Z')/86400000)%100000)*100+slot;}
// Future Friday/Dhul-Hijjah providers can register their own slots 30..99.
// All calculations are injected: one prayer/calendar/timezone implementation.
export function buildNotifications({prefs,start,now,offsetDay,calculate,timeOnDate,preparation,t,providers=[]}) {
 if(!validNativePrefs(prefs))throw Error('Invalid reminder settings');
 if(!prefs.enabled)return [];
 const out=[],add=(key,slot,title,date)=>{
  if(!date||!Number.isFinite(+date)||+date<=now)return;
  out.push({id:notificationId(key,slot),title:t(title),body:t('Your private reminder'),channelId:'istiqamah-reminders-v1',schedule:{at:new Date(+date),allowWhileIdle:true},extra:{owner:'istiqamah',day:key}});
 };
 for(let day=0;day<7;day++){
  const key=offsetDay(start,day),prayers=calculate(key);
  for(const [i,name] of PRAYERS.entries())if(prefs.prayers[name]){const p=prayers.find(p=>p.name===name);if(p)add(key,i,name,new Date(+p.date-prefs.before*60000));}
  for(const [i,name] of ['morning','evening','quran','bedtime'].entries())if(prefs.habits[name])add(key,10+i,{morning:'Morning adhkar',evening:'Evening adhkar',quran:'Read Quran',bedtime:'Sleep'}[name],timeOnDate(key,prefs.times[name]));
  for(const b of preparation(key)){
   const kind=b.id.includes('fajr')?'suhoor':'iftar';if(prefs.habits[kind])add(key,kind==='suhoor'?20:21,b.label,new Date(b.instant));
  }
  for(const provider of providers)for(const item of provider(key))add(key,item.slot,item.title,item.date);
 }
 return out.sort((a,b)=>+a.schedule.at-+b.schedule.at);
}
export async function scheduleNative(plugin,context){
 const pending=(await plugin.getPending()).notifications.filter(ownsNotification);
 const permission=await plugin.checkPermissions();
 if(permission.display!=='granted'||!context.prefs.enabled){if(pending.length)await plugin.cancel({notifications:pending.map(({id})=>({id}))});return {permission:permission.display,count:0};}
 const exact=await plugin.checkExactNotificationSetting();
 const notifications=buildNotifications(context).map(n=>({...n,isExactNotification:exact.exact_alarm==='granted',isExactMandatory:false})),ids=new Set(notifications.map(n=>n.id));
 await plugin.createChannel({id:'istiqamah-reminders-v1',name:context.t('Prayer and habit reminders'),importance:4,visibility:0});
 // System-default sound only: no recording with unresolved rights is used.
 if(notifications.length)await plugin.schedule({notifications});
 const stale=pending.filter(n=>!ids.has(n.id));if(stale.length)await plugin.cancel({notifications:stale.map(({id})=>({id}))});
 return {permission:'granted',exact:exact.exact_alarm,count:notifications.length};
}
