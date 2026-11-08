"use strict";
const CACHE = "istiqamah-v2-1-0-release";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./js/boot.js",
  "./js/release.js",
  "./js/migrations.js",
  "./js/adhkar-data.js",
  "./js/adhkar-library.js",
  "./js/adhkar.js",
  "./js/app.js",
  "./js/backup-crypto.js",
  "./js/config.js",
  "./js/content.js",
  "./js/dates.js",
  "./js/engine.js",
  "./js/hadith.js",
  "./js/hijri.js",
  "./js/i18n/ar.json",
  "./js/i18n/en.json",
  "./js/i18n/hi.json",
  "./js/i18n/ml.json",
  "./js/i18n/ur.json",
  "./js/i18n.js",
  "./js/offline.js",
  "./js/optional-content.js",
  "./js/prayer.js",
  "./js/quran.js",
  "./js/ramadan-model.js",
  "./js/ramadan.js",
  "./js/records.js",
  "./js/reminders.js",
  "./js/schedule.js",
  "./js/session.js",
  "./js/snapshots.js",
  "./js/storage.js",
  "./js/ui/backups.js",
  "./js/ui/charts.js",
  "./js/ui/core.js",
  "./js/ui/downloads.js",
  "./js/ui/fasting.js",
  "./js/ui/footer.js",
  "./js/ui/heading.js",
  "./js/ui/kids.js",
  "./js/ui/onboarding.js",
  "./js/ui/progress.js",
  "./js/ui/ramadan.js",
  "./js/ui/reflections.js",
  "./js/ui/review.js",
  "./js/ui/settings.js",
  "./js/ui/shell.js",
  "./js/ui/tasbih.js",
  "./js/ui/today.js",
  "./js/ui/tools.js",
  "./js/ui/top.js",
  "./js/ui/views.js",
  "./js/ui/wealth.js",
  "./js/ui/words.js",
  "./js/utils.js",
  "./css/app.css",
  "./data/adhkar.json",
  "./data/hadith.json",
  "./data/names.json",
  "./data/quran.json",
  "./data/ramadan-dua.json",
  "./vendor/adhan.js",
  "./vendor/amiri.woff2",
  "./vendor/arabic-core.js",
  "./vendor/chart.js",
  "./vendor/inter.woff2",
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll(
          SHELL.map((path) => new Request(path, { cache: "reload" })),
        ),
      ),
  );
});
self.addEventListener("message", event => { if(event.data?.type === "SKIP_WAITING") self.skipWaiting(); });
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
            const response = await fetch(request, {
              cache: "no-cache",
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
        const cached = await cache.match(request, { ignoreSearch: true });
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
        const cached = await cache.match(request, { ignoreSearch: true });
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
