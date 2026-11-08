// This module has no DOM or storage dependencies so recovery can use it too.
export function isNative(capacitor=globalThis.Capacitor) {
  return !!capacitor?.isNativePlatform?.();
}
export async function shareBackup(name,text) {
  const plugins=globalThis.IstiqamahPlugins;
  if(!isNative() || !plugins)throw Error('Native sharing unavailable');
  const safe=name.replace(/[^A-Za-z0-9._-]/g,'_');
  const path='exports/'+Date.now()+'-'+safe;
  await plugins.Filesystem.writeFile({path,data:text,directory:'CACHE',encoding:'utf8',recursive:true});
  const {uri}=await plugins.Filesystem.getUri({path,directory:'CACHE'});
  await plugins.Share.share({title:'Istiqamah backup',files:[uri],dialogTitle:'Save or share your backup'});
}
