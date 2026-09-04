// Service Worker - JC Path Lab PWA
// Versión 551.00
const CACHE_NAME = 'jc-pathlab-v551';
const STATIC_ASSETS = [
    './',
    './reportes.html',
    './login.html',
    './imprimir.html',
    './index.html',
    './style.css?v=551.00',
    './reportes.css?v=551.00',
    './photo_editor.css?v=551.00',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './favicon.png',
    './main.js?v=551.00',
    './db_service.js',
    './ui_tables.js',
    './ui_report_editor.js',
    './ui_admin.js',
    './ui_editor.js',
    './dictaphone_core.js',
    './plantillas_data.js?v=551.00',
    './pdf_engine.js',
    './responsive_scaler.js?v=551.00'
];

self.addEventListener('install', (event) => {
    console.log('[PWA ServiceWorker] Instalando nueva versión...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS).catch((err) => {
                console.warn('[PWA ServiceWorker] Aviso precaching:', err);
            });
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    console.log('[PWA ServiceWorker] Activado y listo.');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[PWA ServiceWorker] Limpiando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
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

    // 2. ESTRATEGIA STALE-WHILE-REVALIDATE PARA ASSETS ESTÁTICOS
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // Si no hay red, la caché salvará el renderizado
                    return cachedResponse;
                });

            return cachedResponse || fetchPromise;
        })
    );
});
