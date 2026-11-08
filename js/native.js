import { isNative,shareBackup } from './native-platform.js?v=2.1.1';
import { nativeDefaults,scheduleNative,validNativePrefs } from './native-model.js?v=2.1.1';
import { session } from './session.js?v=2.1.1';
import { prayerService } from './prayer.js?v=2.1.1';
import { ramadanService } from './ramadan.js?v=2.1.1';
import { today,offsetDay } from './dates.js?v=2.1.1';
import { zonedDate } from './schedule.js?v=2.1.1';
import { storage } from './storage.js?v=2.1.1';
import { t } from './i18n.js?v=2.1.1';
import { render } from './ui/core.js?v=2.1.1';
import { toast,esc } from './utils.js?v=2.1.1';
let initialized=false,signature='',queue=Promise.resolve();
const navigation=[];
const prefs=()=>session.state.settings.nativeNotifications || nativeDefaults();
export function rescheduleNative(force=false){
 if(!isNative()||session.storageError)return Promise.resolve();
 const next=JSON.stringify([session.state.profile,session.state.settings.nativeNotifications,session.state.ramadanConfig,today(),session.lang]);
 if(!force&&signature===next)return queue;
 signature=next;
 queue=queue.catch(()=>{}).then(async()=>{
  const result=await scheduleNative(window.IstiqamahPlugins.LocalNotifications,{prefs:prefs(),start:today(),now:Date.now(),offsetDay,calculate:key=>prayerService.calculate(key),timeOnDate:zonedDate,preparation:key=>ramadanService.preparation(key),t});
  const out=document.querySelector('#native-status');if(out)out.textContent=t(result.permission!=='granted'?'Notifications are off.':result.exact==='granted'?'Reminders scheduled for the next seven days.':'Reminders scheduled. Android may delay delivery without exact alarm permission.');
 }).catch(()=>{signature='';toast('Android reminders could not be scheduled. Check notification settings and reopen the app.');});
 return queue;
}
export async function initializeNative(){
 if(!isNative()||initialized)return;initialized=true;
 const p=window.IstiqamahPlugins;
 window.IstiqamahExportText=shareBackup;
 await p.StatusBar.setBackgroundColor({color:'#184f40'}).catch(()=>{});
 await p.StatusBar.setStyle({style:'DARK'}).catch(()=>{});
 await p.SplashScreen.hide().catch(()=>{});
 await p.App.addListener('appStateChange',({isActive})=>{if(isActive)rescheduleNative(true);});
 document.addEventListener('click',e=>{if(e.target.closest('[data-action="nav"],[data-action="tool"]'))navigation.push({page:session.page,tool:session.tool});},true);
 await p.App.addListener('backButton',()=>{
  const dialog=document.querySelector('dialog[open]');
  if(dialog){if(dialog.dispatchEvent(new Event('cancel',{cancelable:true})))dialog.close();return;}
  if(navigation.length){Object.assign(session,navigation.pop());render();return;}
  if(session.page!=='today'){session.page='today';render();return;}
  if(window.confirm(t('Exit Istiqamah?')))p.App.exitApp();
 });
 window.addEventListener('istiqamah:saved',()=>rescheduleNative());
 document.querySelector('#modal').addEventListener('close',()=>{if(!session.state.onboarded&&!session.storageError&&!document.querySelector('#modal').open&&!document.querySelector('#wizard').open&&!document.querySelector('#native-welcome'))import('./ui/onboarding.js?v=2.1.1').then(m=>m.showWizard());});
 document.addEventListener('click',async e=>{
  const a=e.target.closest('a[href]');
  if(a){const url=new URL(a.href,location.href);if(['https:','http:'].includes(url.protocol)&&url.origin!==location.origin){e.preventDefault();p.Browser.open({url:url.href}).catch(()=>toast('Could not open the browser.'));}}
  const action=e.target.closest('[data-native-action]')?.dataset.nativeAction;
  if(!action)return;
  try{
   if(action==='permission'){
    const result=await p.LocalNotifications.requestPermissions();
    if(result.display==='granted'){session.state.settings.nativeNotifications={...prefs(),enabled:true};if(storage.save()){render();await rescheduleNative(true);}}
    else toast('Notifications are off.');
   }
   if(action==='exact')await p.LocalNotifications.changeExactNotificationSetting();
   if(action==='import')document.querySelector('#native-import-file').click();
  }catch{toast('Android reminders could not be scheduled. Check notification settings and reopen the app.');}
 });
 document.addEventListener('change',async e=>{
  const el=e.target;
  if(el.id==='native-import-file'&&el.files?.[0]){await (await import('./ui/backups.js?v=2.1.1')).handleBackupFile(el.files[0]);el.value='';return;}
  if(!el.matches('[data-native-pref],[data-native-prayer],[data-native-habit],[data-native-time]'))return;
  const value=structuredClone(prefs());
  if(el.dataset.nativePref)value[el.dataset.nativePref]=el.type==='checkbox'?el.checked:Number(el.value);
  if(el.dataset.nativePrayer)value.prayers[el.dataset.nativePrayer]=el.checked;
  if(el.dataset.nativeHabit)value.habits[el.dataset.nativeHabit]=el.checked;
  if(el.dataset.nativeTime)value.times[el.dataset.nativeTime]=el.value;
  if(!validNativePrefs(value))return;
  session.state.settings.nativeNotifications=value;if(storage.save()){render();await rescheduleNative();}
 });
 await rescheduleNative(true);
 if(!session.state.onboarded&&!session.storageError)showWelcome();
}
function showWelcome(){
 document.querySelector('#wizard').close();
 const d=document.createElement('dialog');d.id='native-welcome';d.setAttribute('aria-labelledby','native-welcome-title');
 d.innerHTML=`<h2 id="native-welcome-title">${esc(t('Already using Istiqamah on the website? Import your backup'))}</h2><p>${esc(t('On the website, open Settings and export a backup. Save it to your phone, then select it here. Encrypted backups need your passphrase. Website records do not transfer automatically.'))}</p><button class="btn" id="native-welcome-import">${esc(t('Import backup'))}</button><input type="file" accept="application/json,.json" id="native-welcome-file" hidden><button class="btn secondary" id="native-welcome-new">${esc(t('Start a new plan'))}</button>`;
 document.body.append(d);d.showModal();
 const start=async()=>{d.close();d.remove();(await import('./ui/onboarding.js?v=2.1.1')).showWizard();};
 d.oncancel=e=>{e.preventDefault();start();};
 d.querySelector('#native-welcome-new').onclick=start;
 d.querySelector('#native-welcome-import').onclick=()=>d.querySelector('input').click();
 d.querySelector('input').onchange=async e=>{if(e.target.files?.[0]){d.close();await (await import('./ui/backups.js?v=2.1.1')).handleBackupFile(e.target.files[0]);d.remove();if(!document.querySelector('#modal').open&&!session.state.onboarded)(await import('./ui/onboarding.js?v=2.1.1')).showWizard();}};
}
