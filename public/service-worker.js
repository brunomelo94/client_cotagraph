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
            ])
                .catch(error => console.error('Erro ao adicionar arquivos ao cache:', error));
        })
            .catch(error => console.error('Erro ao abrir o cache:', error))
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method === 'GET') {
        event.respondWith(
            caches.open('api-cache').then(cache => {
                return cache.match(event.request).then(response => {
                    // Always clone the response from fetch before it's used because
                    // it's a stream that can only be consumed once.
                    const fetchPromise = fetch(event.request).then(networkResponse => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    })
                        .catch(error => console.error('Erro ao realizar fetch:', error));
                    // If there's a cached response, use that, otherwise wait for the network.
                    return response || fetchPromise;
                })
                    .catch(error => console.error('Erro ao verificar o cache:', error));
            })
                .catch(error => console.error('Erro ao abrir o cache da API:', error))
        );
    } else {
        event.respondWith(fetch(event.request));
    }
});


self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName)
                            .catch(error => console.error('Erro ao deletar o cache:', error));
                    }
                })
            )
        )
            .catch(error => console.error('Erro ao obter chaves do cache:', error))
    );
});
