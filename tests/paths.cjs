'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
(async()=>{
 const root=path.resolve('.'),server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://local').pathname,relative=pathname.startsWith('/Istiqamah/')?pathname.slice(11):pathname.slice(1);
  let file=path.resolve(root,relative||'index.html');if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  try{res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.json':'application/json','.css':'text/css','.webmanifest':'application/manifest+json','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),headless:true,args:['--no-sandbox']});
 try{for(const prefix of ['/','/Istiqamah/']){
  const c=await browser.newContext(),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await c.addInitScript(()=>localStorage.setItem('istiqamah.releaseSeen.2.1.1','seen'));
  const base=`http://127.0.0.1:${server.address().port}${prefix}`;
  await p.goto(base);await p.waitForFunction(()=>!!window.Istiqamah);await p.evaluate(async()=>{await navigator.serviceWorker.ready;});await p.reload();await p.waitForFunction(()=>!!window.Istiqamah&&!!navigator.serviceWorker.controller&&SOURCE_DATA.adhkar.length===50);
  const scope=await p.evaluate(async()=>(await navigator.serviceWorker.getRegistration()).scope);assert.equal(scope,base);
  await c.setOffline(true);await p.reload();await p.waitForFunction(()=>!!window.Istiqamah&&SOURCE_DATA.adhkar.length===50);assert.deepEqual(errors,[]);await c.close();console.log('PASS static root/scope and offline reload: '+prefix);
 }}finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
