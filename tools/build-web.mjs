import {cp,mkdir,rm,readFile,readdir} from 'node:fs/promises';
import {build} from 'esbuild';
const root=new URL('../',import.meta.url),dest=new URL('www/',root);
await rm(dest,{recursive:true,force:true});await mkdir(dest,{recursive:true});
const files=['index.html','sw.js','manifest.webmanifest','privacy.html','js','css','data','vendor'];
for(const f of await readdir(root))if(/^icon.*\.(svg|png|webp)$/.test(f))files.push(f);
for(const f of files)await cp(new URL(f,root),new URL(f,dest),{recursive:true});
await build({entryPoints:[new URL('tools/native-plugin-entry.js',root).pathname],bundle:true,format:'iife',target:'es2022',outfile:new URL('js/native-plugins.js',dest).pathname,legalComments:'inline'});
console.log('App-only www ready; native plugins bundled locally.');
