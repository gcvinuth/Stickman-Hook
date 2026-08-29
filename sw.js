const CACHE_NAME = 'stickman-hook-v1';
const ASSETS_TO_CACHE = [
'./',
'./index.html',
'https://cdn.tailwindcss.com',
'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Montserrat:wght@700;800;900&display=swap'
];

// Install Event - Pre-cache essential game assets and external dependencies
self.addEventListener('install', (event) => {
event.waitUntil(
caches.open(CACHE_NAME).then((cache) => {
return cache.addAll(ASSETS_TO_CACHE);
}).then(() => self.skipWaiting())
);
});

// Activate Event - Clean up stale cache versions
self.addEventListener('activate', (event) => {
event.waitUntil(
caches.keys().then((cacheNames) => {
return Promise.all(
cacheNames.map((cache) => {
if (cache !== CACHE_NAME) {
return caches.delete(cache);
}
})
);
}).then(() => self.clients.claim())
);
});

// Fetch Event - Stale-While-Revalidate strategy for smooth offline gameplay
self.addEventListener('fetch', (event) => {
event.respondWith(
caches.match(event.request).then((cachedResponse) => {
if (cachedResponse) {
// Fetch updated resources in background when online
fetch(event.request).then((networkResponse) => {
if (networkResponse && networkResponse.status === 200) {
caches.open(CACHE_NAME).then((cache) => {
cache.put(event.request, networkResponse);
});
}
}).catch(() => {
/* Ignore background fetch failures when offline */
});

    return cachedResponse;
  }

  return fetch(event.request).then((networkResponse) => {
    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
      return networkResponse;
    }

    const responseToCache = networkResponse.clone();
    caches.open(CACHE_NAME).then((cache) => {
      cache.put(event.request, responseToCache);
    });

    return networkResponse;
  });
})


);
});
