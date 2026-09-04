// Service Worker - JC Path Lab PWA
// Versión 553.00
const CACHE_NAME = 'jc-pathlab-v553';
const STATIC_ASSETS = [
    './',
    './reportes.html',
    './login.html',
    './imprimir.html',
    './index.html',
    './style.css?v=552.00',
    './reportes.css?v=552.00',
    './photo_editor.css?v=552.00',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './favicon.png',
    './main.js?v=552.00',
    './db_service.js',
    './ui_tables.js',
    './ui_report_editor.js',
    './ui_admin.js',
    './ui_editor.js',
    './dictaphone_core.js',
    './plantillas_data.js?v=552.00',
    './pdf_engine.js',
    './responsive_scaler.js?v=552.00'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => caches.delete(cacheName))
            );
        }).then(() => self.registration.unregister()).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);

    // 1. BYPASS TOTAL PARA SUPABASE, WEBSOCKETS Y APIS EXTERNAS
    // Garantiza que la sincronización en tiempo real NUNCA sea interceptada ni almacenada en caché
    if (
        requestUrl.hostname.includes('supabase.co') ||
        requestUrl.hostname.includes('resend.dev') ||
        requestUrl.hostname.includes('groq.com') ||
        requestUrl.protocol === 'ws:' ||
        requestUrl.protocol === 'wss:' ||
        event.request.method !== 'GET'
    ) {
        return; // Pasar directo a la red sin caché
    }

    // 2. ESTRATEGIA NETWORK-FIRST PARA HTML, CSS Y JS (Garantiza que cualquier arreglo se vea inmediatamente)
    if (
        event.request.mode === 'navigate' ||
        requestUrl.pathname.endsWith('.html') ||
        requestUrl.pathname.endsWith('.css') ||
        requestUrl.pathname.endsWith('.js')
    ) {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // 3. ESTRATEGIA STALE-WHILE-REVALIDATE PARA IMÁGENES Y FUENTES
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => cachedResponse);

            return cachedResponse || fetchPromise;
        })
    );
});
