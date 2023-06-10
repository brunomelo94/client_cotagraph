/* eslint-disable no-restricted-globals */
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open('app-v1').then(function (cache) {
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

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            if (response) {
                return response;
            } else {
                return fetch(event.request)
                    .then(function (res) {
                        return caches.open('app-v1')
                            .then(function (cache) {
                                cache.put(event.request.url, res.clone());
                                return res;
                            })
                    })
            }
        })
    );
});
