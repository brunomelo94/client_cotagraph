const CACHE_NAME = 'app-v' + new Date().getTime();

/* eslint-disable no-restricted-globals */
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll([
                '/index.html',
                '/static/js/main.js',
                '/static/js/2.chunk.js',
                '/static/js/main.chunk.js',
                '/manifest.json',
                '/favicon.ico',
                '/logo192.png'
            ]);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open('api-cache').then(cache => {
            return cache.match(event.request).then(response => {
                return response || fetch(event.request).then(networkResponse => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            });
        })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            )
        )
    );
});