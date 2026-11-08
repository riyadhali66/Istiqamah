#!/usr/bin/env python3
"""Build a deterministic offline library from the original Azkar DB JSON.
Usage: python3 tools/build-adhkar.py /path/to/azkar.json [upstream-commit]
No religious text, translation, reference, or repetition count is generated.
"""
import hashlib,json,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
source=Path(sys.argv[1]); raw=source.read_bytes(); rows=json.loads(raw)['rows']
previous=json.loads((root/'data/adhkar-library.js').read_text().removeprefix('export default ').rstrip(';\n'))['entries']
categories={
 'أذكار الصباح':('morning','Morning adhkar'), 'أذكار المساء':('evening','Evening adhkar'),
 'التسبيح، التحميد، التهليل، التكبير':('general','General remembrance'),
 'الأذكار بعد السلام من الصلاة':('after-prayer','After prayer'),
 'أذكار النوم':('sleep','Before sleep'), 'أذكار الاستيقاظ من النوم':('waking','Upon waking'),
 'الذكر عند دخول المنزل':('home','Entering / leaving home'), 'الذكر عند الخروج من المنزل':('home','Entering / leaving home'),
 'الدعاء قبل الطعام':('food','Eating and drinking'), 'الدعاء عند الفراغ من الطعام':('food','Eating and drinking'),
 'دعاء السفر':('travel','Travel'), 'دعاء الركوب':('travel','Travel'),
 'الاستغفار و التوبة':('forgiveness','Forgiveness and supplication')}
legacy_map={(entry['sourceCategory'],entry['text']):entry['legacyKeys'] for entry in previous if entry['legacyKeys']}
entries=[];seen=set()
for r in rows:
 if r[0] not in categories:continue
 category,label=categories[r[0]]
 digest=hashlib.sha256((r[0]+'\0'+r[1]+'\0'+str(r[4] or '')).encode()).hexdigest()
 ident='azkar-'+digest[:20]
 if ident in seen:continue
 seen.add(ident)
 count=int(r[3]) if str(r[3] or '').isdigit() and int(r[3])>0 else None
 entries.append(dict(id=ident,category=category,categoryLabel=label,sourceCategory=r[0],text=r[1],translations={},reference=r[4] or '',count=count,description=r[2] or '',legacyKeys=legacy_map.get((r[0],r[1]),[]),provenance=dict(dataset='Azkar DB',url='https://github.com/osamayy/azkar-db',file='azkar.json',rowSha256=digest)))
output=dict(schemaVersion=1,source=dict(name='Azkar DB',url='https://github.com/osamayy/azkar-db',revision=sys.argv[2] if len(sys.argv)>2 else 'master',sha256=hashlib.sha256(raw).hexdigest(),permission='README explicitly grants free use and redistribution; see data/AZKAR-REUSE.txt'),entries=entries)
(root/'data/adhkar-library.js').write_text('export default '+json.dumps(output,ensure_ascii=False,separators=(',',':'))+';\n')
print(len(entries),'entries;',len(set(e['category'] for e in entries)),'categories;',sum(e['count'] is None for e in entries),'entries without a prescribed count')
assert sum(len(e['legacyKeys']) for e in entries)==61,'Legacy mapping must retain every existing counter'
