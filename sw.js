'use strict';
const CACHE = 'istiqamah-v1-20261105-e';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', './vendor/adhan.js', './vendor/arabic-core.js', './vendor/chart.js', './vendor/inter.woff2', './vendor/amiri.woff2', './vendor/uthmani.woff2', './data/content.js', './data/adhan-makkah.mp3', './data/adhan-mishary.mp3'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('istiqamah-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    event.respondWith(caches.open(CACHE).then(async cache => {
      // Prefer fresh HTML online; preserve the last working page for offline use.
      if (request.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        try {
          const response = await fetch(request, { cache: 'no-cache', signal: controller.signal });
          if (!response.ok) throw new Error('Page unavailable');
          await cache.put('./index.html', response.clone());
          return response;
        } catch (error) {
          const cached = await cache.match('./index.html');
          if (cached) return cached;
          throw error;
        } finally {
          clearTimeout(timeout);
        }
      }
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    }));
  } else if (['cdn.jsdelivr.net', 'everyayah.com', 'cdn.islamic.network'].includes(url.hostname)) {
    event.respondWith(caches.open(CACHE).then(async cache => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok || response.type === 'opaque') {
        try { await cache.put(request, response.clone()); } catch {}
      }
      return response;
    }));
  }
});
