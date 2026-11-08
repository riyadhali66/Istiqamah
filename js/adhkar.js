import { session } from './session.js?v=2.1.0';
import { adhkarLibrary as library } from './adhkar-library.js?v=2.1.0';
const adhkarService = {
 list(period) { return library.list(period); },
 key(period,i) {return this.list(period)[i]?.id || '';},
 count(period,i,dayKey=session.selectedDate) {const e=this.list(period)[i];return e?library.count(e,dayKey):0;},
 increment(period,i,dayKey=session.selectedDate) {const e=this.list(period)[i];if(e)library.increment(e,dayKey);}
};
function tasbihSelection(){const e=library.selected();return e?{entry:e,key:e.id,period:e.category,index:library.list(e.category).findIndex(a=>a.id===e.id)}:null;}
export {adhkarService,tasbihSelection};
