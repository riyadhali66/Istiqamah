import { session } from './session.js?v=2.1.1';
import { t } from './i18n.js?v=2.1.1';
import { esc } from './utils.js?v=2.1.1';
let dismissed=false;
export function releaseNotes(){
 if(dismissed || !session.state.onboarded || session.storageError || localStorage.getItem('istiqamah.releaseSeen.2.1.1'))return;
 if(document.querySelector('dialog[open]') || document.activeElement?.matches('input,textarea,select,[contenteditable=true]'))return;
 let sheet=document.querySelector('#release-notes');
 if(!sheet){sheet=document.createElement('dialog');sheet.id='release-notes';sheet.setAttribute('aria-labelledby','release-title');document.body.append(sheet);}
 sheet.innerHTML=`<h2 id="release-title">${esc(t("What's new in 2.1.1"))}</h2><p>${esc(t('Android app: optional native reminders and private backup sharing. The web app keeps its offline updates. Your records stay on this device.'))}</p><button class="btn" id="release-dismiss">${esc(t('Continue'))}</button>`;
 const dismiss=()=>{dismissed=true;try{localStorage.setItem('istiqamah.releaseSeen.2.1.1','seen');sheet.close();}catch{sheet.close();}};
 sheet.querySelector('button').onclick=dismiss;sheet.oncancel=e=>{e.preventDefault();dismiss();};sheet.showModal();
}
