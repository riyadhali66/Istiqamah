"use strict";
const CACHE = "istiqamah-v2-1-20261108-a";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./js/adhkar-data.js",
  "./js/adhkar-data.js?v=2.1.0",
  "./js/adhkar-library.js",
  "./js/adhkar-library.js?v=2.1.0",
  "./js/adhkar.js",
  "./js/adhkar.js?v=2.1.0",
  "./js/app.js",
  "./js/app.js?v=2.1.0",
  "./js/backup-crypto.js",
  "./js/backup-crypto.js?v=2.1.0",
  "./js/config.js",
  "./js/config.js?v=2.1.0",
  "./js/content.js",
  "./js/content.js?v=2.1.0",
  "./js/dates.js",
  "./js/dates.js?v=2.1.0",
  "./js/engine.js",
  "./js/engine.js?v=2.1.0",
  "./js/hadith.js",
  "./js/hadith.js?v=2.1.0",
  "./js/hijri.js",
  "./js/hijri.js?v=2.1.0",
  "./js/i18n/ar.json",
  "./js/i18n/ar.json?v=2.1.0",
  "./js/i18n/en.json",
  "./js/i18n/en.json?v=2.1.0",
  "./js/i18n/hi.json",
  "./js/i18n/hi.json?v=2.1.0",
  "./js/i18n/ml.json",
  "./js/i18n/ml.json?v=2.1.0",
  "./js/i18n/ur.json",
  "./js/i18n/ur.json?v=2.1.0",
  "./js/i18n.js",
  "./js/i18n.js?v=2.1.0",
  "./js/offline.js",
  "./js/offline.js?v=2.1.0",
  "./js/optional-content.js",
  "./js/optional-content.js?v=2.1.0",
  "./js/phase2-events.js",
  "./js/phase2-events.js?v=2.1.0",
  "./js/phase2-state.js",
  "./js/phase2-state.js?v=2.1.0",
  "./js/prayer.js",
  "./js/prayer.js?v=2.1.0",
  "./js/quran.js",
  "./js/quran.js?v=2.1.0",
  "./js/ramadan.js",
  "./js/ramadan.js?v=2.1.0",
  "./js/records.js",
  "./js/records.js?v=2.1.0",
  "./js/reminders.js",
  "./js/reminders.js?v=2.1.0",
  "./js/schedule.js",
  "./js/schedule.js?v=2.1.0",
  "./js/session.js",
  "./js/session.js?v=2.1.0",
  "./js/snapshots.js",
  "./js/snapshots.js?v=2.1.0",
  "./js/storage.js",
  "./js/storage.js?v=2.1.0",
  "./js/ui/adhkar-library.js",
  "./js/ui/adhkar-library.js?v=2.1.0",
  "./js/ui/backups.js",
  "./js/ui/backups.js?v=2.1.0",
  "./js/ui/charts.js",
  "./js/ui/charts.js?v=2.1.0",
  "./js/ui/core.js",
  "./js/ui/core.js?v=2.1.0",
  "./js/ui/downloads.js",
  "./js/ui/downloads.js?v=2.1.0",
  "./js/ui/fasting.js",
  "./js/ui/fasting.js?v=2.1.0",
  "./js/ui/footer.js",
  "./js/ui/footer.js?v=2.1.0",
  "./js/ui/heading.js",
  "./js/ui/heading.js?v=2.1.0",
  "./js/ui/kids.js",
  "./js/ui/kids.js?v=2.1.0",
  "./js/ui/onboarding.js",
  "./js/ui/onboarding.js?v=2.1.0",
  "./js/ui/progress.js",
  "./js/ui/progress.js?v=2.1.0",
  "./js/ui/ramadan.js",
  "./js/ui/ramadan.js?v=2.1.0",
  "./js/ui/reflections.js",
  "./js/ui/reflections.js?v=2.1.0",
  "./js/ui/review.js",
  "./js/ui/review.js?v=2.1.0",
  "./js/ui/settings.js",
  "./js/ui/settings.js?v=2.1.0",
  "./js/ui/shell.js",
  "./js/ui/shell.js?v=2.1.0",
  "./js/ui/tasbih.js",
  "./js/ui/tasbih.js?v=2.1.0",
  "./js/ui/today.js",
  "./js/ui/today.js?v=2.1.0",
  "./js/ui/tools.js",
  "./js/ui/tools.js?v=2.1.0",
  "./js/ui/top.js",
  "./js/ui/top.js?v=2.1.0",
  "./js/ui/views.js",
  "./js/ui/views.js?v=2.1.0",
  "./js/ui/wealth.js",
  "./js/ui/wealth.js?v=2.1.0",
  "./js/ui/words.js",
  "./js/ui/words.js?v=2.1.0",
  "./js/utils.js",
  "./js/utils.js?v=2.1.0",
  "./css/app.css",
  "./css/app.css?v=2.1.0",
  "./vendor/adhan.js",
  "./vendor/amiri.woff2",
  "./vendor/arabic-core.js",
  "./vendor/chart.js",
  "./vendor/inter.woff2",
  "./data/adhkar-library.js",
  "./data/adhkar-library.js?v=2.1.0",
  "./data/hadith.json",
  "./data/hadith.json?v=2.1.0",
  "./data/names.json",
  "./data/names.json?v=2.1.0",
  "./data/quran.json",
  "./data/quran.json?v=2.1.0"
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL.map(url=>new Request(url,{cache:"reload"}))))
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("istiqamah-") && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        // Prefer fresh HTML online; preserve the last working page for offline use.
        if (
          request.mode === "navigate" ||
          url.pathname.endsWith("/index.html")
        ) {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          try {
            const response = await fetch(request.url, {
              cache: "reload",
              signal: controller.signal,
            });
            if (!response.ok) throw new Error("Page unavailable");
            await cache.put("./index.html", response.clone());
            return response;
          } catch (error) {
            const cached = await cache.match("./index.html");
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
      }),
    );
  } else if (
    ["cdn.jsdelivr.net", "everyayah.com", "cdn.islamic.network"].includes(
      url.hostname,
    )
  ) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok || response.type === "opaque") {
          try {
            await cache.put(request, response.clone());
          } catch {}
        }
        return response;
      }),
    );
  }
});
