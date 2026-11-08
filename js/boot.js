/* Independent recovery and update bridge: deliberately has no app-module imports. */
(() => {
  const version='2.1.0',key='istiqamah.v1';
  const recovery=document.querySelector('#boot-recovery'),banner=document.querySelector('#app-update');
  const messages={en:['A new version of Istiqamah is ready — Update now','Update now'],ar:['إصدار جديد من استقامة جاهز — حدّث الآن','حدّث الآن'],ur:['استقامہ کا نیا ورژن تیار ہے — ابھی اپ ڈیٹ کریں','ابھی اپ ڈیٹ کریں'],ml:['ഇസ്തിഖാമയുടെ പുതിയ പതിപ്പ് തയ്യാറാണ് — ഇപ്പോൾ പുതുക്കുക','ഇപ്പോൾ പുതുക്കുക'],hi:['इस्तिक़ामह का नया संस्करण तैयार है — अभी अपडेट करें','अभी अपडेट करें']};
  let lang='en';try{const saved=JSON.parse(localStorage.getItem(key));lang=saved?.profile?.language||'en';document.documentElement.dataset.theme=saved?.settings?.theme==='dark'?'dark':'light';}catch{}
  document.documentElement.lang=lang;document.documentElement.dir=['ar','ur'].includes(lang)?'rtl':'ltr';
  const wait={en:'Keep this page open while the update is cached. Your saved records are unchanged.',ar:'أبقِ هذه الصفحة مفتوحة أثناء حفظ التحديث. سجلاتك المحفوظة لم تتغير.',ur:'اپ ڈیٹ محفوظ ہونے تک صفحہ کھلا رکھیں۔ آپ کے ریکارڈ تبدیل نہیں ہوئے۔',ml:'പുതുക്കൽ സൂക്ഷിക്കുന്നതുവരെ ഈ പേജ് തുറന്നുവയ്ക്കുക. നിങ്ങളുടെ രേഖകൾ മാറിയിട്ടില്ല.',hi:'अपडेट सहेजने तक यह पेज खुला रखें। आपके रिकॉर्ड बदले नहीं हैं।'};
  document.querySelector('#boot-wait-text').textContent=wait[lang]||wait.en;
  const words=messages[lang]||messages.en;banner.querySelector('span').textContent=words[0];banner.querySelector('button').textContent=words[1];banner.dir=['ar','ur'].includes(lang)?'rtl':'ltr';
  const exportRaw=()=>{const raw={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);raw[k]=localStorage.getItem(k);}const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(raw,null,2)],{type:'application/json'}));a.download='istiqamah-raw-localStorage.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
  document.querySelector('#boot-export').onclick=exportRaw;
  document.querySelector('#boot-restore').onclick=async()=>{
    try {
      const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('istiqamah-safety',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
      const copies=await new Promise((resolve,reject)=>{const t=db.transaction('daily','readonly'),r=t.objectStore('daily').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
      const localDate=new Date().toLocaleDateString('en-CA'),copy=copies.filter(c=>c.date<localDate).sort((a,b)=>b.date.localeCompare(a.date))[0];
      if(!copy)throw Error('No earlier daily copy is available. Export the raw data before troubleshooting.');
      const raw=localStorage.getItem(key),backup='istiqamah.recovery.'+Date.now();
      if(raw!==null){localStorage.setItem(backup,raw);if(localStorage.getItem(backup)!==raw)throw Error('Safety backup failed.');}
      JSON.parse(copy.data);
      if(localStorage.getItem(key)!==raw)throw Error('Another tab changed your records.');
      localStorage.setItem(key,copy.data);location.reload();
    }catch(e){document.querySelector('#boot-error').textContent=e.message;}
  };
  let requested=false,reloaded=false,reg;
  const showUpdate=registration=>{
    if(!registration.waiting || !registration.active || !navigator.serviceWorker.controller)return;
    banner.hidden=false;
    banner.querySelector('button').onclick=async()=>{
      // Updating is always an explicit choice. Commit a focused journal field first.
      const field=document.activeElement;
      if(field?.matches('input,textarea,select'))field.dispatchEvent(new Event('change',{bubbles:true}));
      if(window.Istiqamah && !window.Istiqamah.storage.save())return;
      requested=true;sessionStorage.setItem('istiqamah.updateRequested',version);
      registration.waiting?.postMessage({type:'SKIP_WAITING'});
    };
  };
  navigator.serviceWorker?.addEventListener('controllerchange',()=>{
    if(!reg?.waiting)banner.hidden=true;
    if((requested||sessionStorage.getItem('istiqamah.updateRequested')===version)&&!reloaded){reloaded=true;sessionStorage.removeItem('istiqamah.updateRequested');location.reload();}
  });
  window.IstiqamahCheckUpdate=async()=>{if(reg){await reg.update();showUpdate(reg);}};
  async function start(){
    let old=false;
    if('serviceWorker' in navigator && location.protocol!=='file:'){
      old=!!navigator.serviceWorker.controller&&!navigator.serviceWorker.controller.scriptURL.includes('v='+version);
      try{
        reg=await navigator.serviceWorker.register('./sw.js?v='+version,{updateViaCache:'none'});
        reg.addEventListener('updatefound',()=>{const w=reg.installing;w?.addEventListener('statechange',()=>{if(w.state==='installed')showUpdate(reg);if(w.state==='redundant' && old){recovery.hidden=false;document.querySelector('#boot-error').textContent='The update could not be cached. Reconnect and reload. Your records remain exportable.';}});});
        showUpdate(reg);reg.update().catch(()=>{});
      }catch(e){if(old){recovery.hidden=false;document.querySelector('#boot-error').textContent='Update could not be cached. Reconnect and reload; your data is unchanged.';return;}}
    }
    if(old){document.documentElement.dataset.bootWait='true';document.querySelector('#boot-wait').hidden=false;return;}
    try{await import('./app.js?v=2.1.0');recovery.hidden=true;}
    catch(e){recovery.hidden=false;document.querySelector('#boot-error').textContent='The app could not start. Your saved records remain on this device. '+e.message;}
  }
  start();
})();
