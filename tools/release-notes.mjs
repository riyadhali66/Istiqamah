import {readFileSync} from 'node:fs';
const {version}=JSON.parse(readFileSync('package.json','utf8'));
const text=readFileSync('CHANGELOG.md','utf8');
const section=text.split(/^## /m).find(s=>s.startsWith(version+' '));
if(!section)throw Error('Missing version changelog');
console.log('## '+section.trim());
