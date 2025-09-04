const pwaCacheKey = 'cache-5';
const staticCaches = [
    '/',
    '/index.html',
    '/auth.html',
    '/manifest.json',
    '/src/output.css',
    '/src/logo.png',
    '/main.js',
    '/auth.js'
]
const API_ORIGIN = 'http://localhost:3000';

//cache static
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(pwaCacheKey).then((cache) => cache.addAll(staticCaches))
  );
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

//network first cahce buat fetch post dan comment
self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);

    const API = url.origin === API_ORIGIN &&
    (url.pathname.startsWith('/posts') || url.pathname.startsWith('/comments'));

    if(API){
        e.respondWith(
            (async () => {
                try{ //network first
                    const response = await fetch(e.request);
                    const cache = await caches.open(pwaCacheKey);
                    cache.put(e.request, response.clone());
                    return response;
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
            })()
        );
    } else { //cache first buat static asset
        e.respondWith(
            (async () => {
                const cached = await caches.match(e.request);
                if (cached) return cached;

                try {
                const response = await fetch(e.request);
                const cache = await caches.open(pwaCacheKey);
                cache.put(e.request, response.clone());
                return response;
                } catch {
                return new Response('Offline', { status: 503 });
                }
            })()
        );
    }
});