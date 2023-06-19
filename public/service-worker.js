const CACHE_NAME = 'app-v' + new Date().getTime();
const CACHE_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 7; // 7 dias

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
            fetch(event.request).then(networkResponse => {
                if (networkResponse.ok) {
                    // Apenas colocar coisas no cache se a solicitação foi bem sucedida
                    const clone = networkResponse.clone();
                    caches.open('api-cache').then(cache => {
                        cache.put(event.request, clone);
                    });
                }
                return networkResponse;
            }).catch(async error => {
                console.error('Erro ao realizar fetch:', error);
                // Se a solicitação de rede falhar, verifique o cache
                const cacheResponse = await caches.match(event.request);
                if (cacheResponse) {
                    const cachedData = await cacheResponse.json();
                    // Verifique se os dados estão atualizados
                    if (Date.now() - cachedData.timestamp < CACHE_EXPIRATION_TIME) {
                        // Se os dados estiverem atualizados, retorne a resposta do cache
                        return new Response(JSON.stringify(cachedData.data), {
                            status: 200,
                            statusText: "OK",
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                }
                throw error;  // Se chegamos até aqui, os dados não estão no cache ou eles expiraram, então falha
            })
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
