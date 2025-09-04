const pwaCacheKey = 'cache-3';
const staticCaches = [
    '/',
    '/index.html',
    '/auth.html',
    '/manifest.json',
    '/main.js',
    '/auth.js'
]
const API_ORIGIN = 'http://localhost:3000';

//cache static
self.addEventListener('install', (e) => {
    let cacheReady = caches.open(pwaCacheKey).then((cache) => {
        return cache.addAll(staticCaches);
    });
    e.waitUntil(cacheReady);
});

//activate -> delete old cache
self.addEventListener('activate', (e) => {
    let cacheCleaned = caches.keys().then((keys) => {
        keys.forEach((key) => {
            if (key !== pwaCacheKey) return caches.delete(key);
        });
    });
    e.waitUntil(cacheCleaned);
});

//network first cahce buat fetch post 
self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);

    const API = url.origin === API_ORIGIN &&
    (url.pathname.startsWith('/posts') || url.pathname.startsWith('/comments'));

    if(!API) return;

    e.respondWith(
        (async () => {
            try{ //network first
                const fetch = await fetch(e.request);
                const cache = await caches.open(pwaCacheKey);
                cache.put(e.request, fetch.clone());
                return fetch;
            } catch (error){ //offline
                const offlineCache = await caches.match(e.request);
                if (offlineCache) {
                    return offlineCache;
                } else {
                    return new Response('[]', {
                        headers: {'Content-Type' : 'application/json'},
                    });
                }
            }
        })
    );
});