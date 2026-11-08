import { entries, byId, aliases, archive } from './adhkar-data.js?v=2.1.0';
import { session } from './session.js?v=2.1.0';
import { getDay } from './records.js?v=2.1.0';
import { storage } from './storage.js?v=2.1.0';
import { today } from './dates.js?v=2.1.0';
const normalize = s => String(s).normalize('NFKD').replace(/[\u064B-\u065F\u0670\u0640]/g,'').toLocaleLowerCase();
export const adhkarLibrary = {
  entries, archive,
  resolve(id) { return entries.find(e=>e.id === (aliases[id] || id)) || null; },
  selected() { return this.resolve(session.state.adhkarPrefs.selected); },
  list(category) { return entries.filter(e=>e.category===category); },
  count(entry,key=today()) { return getDay(key).adhkarCounts[entry.id] || 0; },
  target(entry) { return entry.count || session.state.adhkarPrefs.personalTargets[entry.id] || null; },
  set(entry,n,key=today()) {
    const d=getDay(key); d.adhkarCounts[entry.id]=Math.min(1e4,Math.max(0,Number(n)||0));
    if (['morning','evening'].includes(entry.category))
      d.values[entry.category==='morning'?'adhkar-am':'adhkar-pm']=this.list(entry.category).every(e=>e.count && this.count(e,key)>=e.count)?1:0;
    return storage.save();
  },
  increment(entry,key=today()) { const n=this.count(entry,key), goal=this.target(entry); if (!goal || n<goal) this.set(entry,n+1,key); },
  filtered() {
    const p=session.state.adhkarPrefs, q=normalize(p.search.trim());
    return entries.filter(e=>(p.category==='all'||e.category===p.category||p.category==='favorites'&&p.favorites.includes(e.id)) && (!q||normalize([e.text,e.en||'',e.reference,e.categoryLabel,e.sourceCategory].join(' ')).includes(q)));
  },
  favorite(id) {const f=session.state.adhkarPrefs.favorites,i=f.indexOf(id); if(i<0) f.push(id);else f.splice(i,1);storage.save();},
  move(delta) {const list=this.filtered();if(!list.length)return;const i=list.findIndex(e=>e.id===session.state.adhkarPrefs.selected);session.state.adhkarPrefs.selected=list[(Math.max(0,i)+delta+list.length)%list.length].id;storage.save();}
};
