// sw.js - Service Worker de Grado Médico y Modo Quirófano Offline-First
// Versión Médico-Quirúrgica 565.00
const CACHE_NAME = 'jc-pathlab-medical-v565';

const STATIC_ASSETS = [
    './',
    './reportes.html',
    './login.html',
    './imprimir.html',
    './index.html',
    './manifest.json',
    './favicon.png',
    './icon-192.png',
    './icon-512.png',
    './icon-maskable.png',
    './logo-jcpathlab.png',
    './style.css',
    './reportes.css',
    './photo_editor.css',
    './photo_editor.js',
    './mobile_report_reader.css',
    './mobile_report_reader.js',
    './cropper.min.css',
    './cropper.min.js',
    './pwa_init.js',
    './responsive_scaler.js',
    './utils.js',
    './db_service.js',
    './main.js',
    './ui_tables.js',
    './ui_report_editor.js',
    './ui_admin.js',
    './ui_editor.js',
    './dictaphone_core.js',
    './plantillas_data.js',
    './pdf_engine.js',
    './users_db.js',
    './supabase_config.js',
    './real_supabase_backup.js',
    './help_guide.js'
];

// 1. INSTALACIÓN: Pre-cacheo tolerante a fallos
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW Medical] Pre-cacheando recursos vitales de la plataforma...');
            return Promise.allSettled(
                STATIC_ASSETS.map((asset) =>
                    cache.add(asset).catch((err) => {
                        console.warn(`[SW Precache] Recurso no crítico omitido (${asset}):`, err.message);
                    })
                )
            );
        }).then(() => self.skipWaiting())
    );
});

// 2. ACTIVACIÓN: Limpieza de cachés obsoletas y reclamo inmediato de clientes
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW Medical] Purgando caché anterior:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. ESTRATEGIAS DE RED Y CACHÉ
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const requestUrl = new URL(request.url);

    // Bypass estricto: Métodos no-GET, APIs de terceros y WebSockets en tiempo real
    if (
        request.method !== 'GET' ||
        requestUrl.protocol === 'ws:' ||
        requestUrl.protocol === 'wss:' ||
        requestUrl.hostname.includes('supabase.co') ||
        requestUrl.hostname.includes('groq.com') ||
        requestUrl.hostname.includes('resend.dev') ||
        requestUrl.protocol.startsWith('chrome-extension')
    ) {
        return;
    }

    const isNavigation = request.mode === 'navigate';
    const isCode = requestUrl.pathname.endsWith('.html') ||
                   requestUrl.pathname.endsWith('.js') ||
                   requestUrl.pathname.endsWith('.css') ||
                   requestUrl.pathname.endsWith('.json');

    // =========================================================================
    // ESTRATEGIA 1: NETWORK-FIRST (Código JS, HTML y Navegación Dinámica)
    // Garantiza que cualquier actualización clínica se refleje al instante,
    // con respaldo offline total en sótanos quirúrgicos sin señal.
    // =========================================================================
    if (isNavigation || isCode) {
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return networkResponse;
                })
                .catch(async () => {
                    // Fallback en Quirófano sin conexión
                    const matched = await caches.match(request, { ignoreSearch: true });
                    if (matched) return matched;

                    // Si es navegación a página HTML, servir la shell de reportes o login
                    if (isNavigation) {
                        const fallbackPage = await caches.match('./reportes.html') || await caches.match('./login.html');
                        if (fallbackPage) return fallbackPage;
                    }

                    return new Response('Modo Quirófano Offline: Registro no disponible en caché local.', {
                        status: 503,
                        statusText: 'Service Unavailable (Offline)',
                        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                    });
                })
        );
        return;
    }

    // =========================================================================
    // ESTRATEGIA 2: STALE-WHILE-REVALIDATE (Recursos Estáticos: CSS, Fotos, Fuentes)
    // Proporciona renderizado instantáneo a 0ms desde la caché mientras
    // revalida asíncronamente en segundo plano si hay red.
    // =========================================================================
    event.respondWith(
        caches.match(request, { ignoreSearch: true }).then((cachedResponse) => {
            const fetchPromise = fetch(request)
                .then((networkResponse) => {
                    if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => cachedResponse);

            return cachedResponse || fetchPromise;
        })
    );
});
