const CACHE_NAME = 'greece-itinerary-v1';
const ASSETS = ['./','./index.html','./manifest.json','./apple-touch-icon.png','./favicon-32.png','./greece-icon-192.png','./greece-icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : Promise.resolve()))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(event.request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response && response.status === 200) cache.put(event.request, response.clone()).catch(() => {});
      return response;
    } catch (e) {
      return cached || caches.match('./') || Response.error();
    }
  })());
});
