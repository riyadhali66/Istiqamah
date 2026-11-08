#!/usr/bin/env python3
"""Build the selectable catalog and explicit migration map from frozen source rows.
Run without arguments. data/adhkar-legacy.json is the exact 113-row fd79768
manifest, retained only for provenance and rendering unmatched historical counts.
No text, translation, reference or prescribed count is authored by this builder.
"""
import json,re,unicodedata
from pathlib import Path
root=Path(__file__).resolve().parents[1]
old=json.loads((root/'data/adhkar-legacy.json').read_text())
seen=json.loads((root/'data/adhkar.json').read_text())
def norm(s):
    return re.sub(r'[\W\u064b-\u065f\u0670\u0640]+','',unicodedata.normalize('NFKC',s))
entries=[];aliases={};archive={e['id']:e for e in old}
for e in seen:
    entries.append({**e,'category':e['period'],'categoryLabel':e['period'].title()+' adhkar','sourceCategory':e['category'],
      'provenance':{'dataset':'Seen Arabic','license':'MIT','url':'https://github.com/Seen-Arabic/Morning-And-Evening-Adhkar-DB','revision':'29d7623fede52eca835a789025dfda866e8cfe44','sourceOrder':e['sourceOrder']},
      'translations':{'en':e['en']} if e.get('en') else {},'legacyKeys':[]})
    if e.get('legacyKey'):aliases[e['legacyKey']]=e['id']
for e in old:
    # Exact letters after removing marks/punctuation only. Context selects the
    # corresponding morning/evening Seen row where both periods exist.
    candidates=[s for s in entries if s['id'].startswith('seen-') and norm(s['text'])==norm(e['text'])]
    match=next((s for s in candidates if s['category']==e['category']),next(iter(candidates),None))
    if match:aliases[e['id']]=match['id']
    elif e['category'] not in ['morning','evening']:
        entries.append(e);aliases[e['id']]=e['id']
for e in entries:aliases[e['id']]=e['id']
(root/'js/adhkar-data.js').write_text('export const entries = '+json.dumps(entries,ensure_ascii=False)+';\nexport const aliases = '+json.dumps(aliases)+';\nexport const archive = '+json.dumps(archive,ensure_ascii=False)+';\nexport const byId = new Map(entries.map(e => [e.id,e]));\n')
print(len(entries),'selectable rows;',len(set(e['category'] for e in entries)),'categories;',len(archive),'archival source IDs')
