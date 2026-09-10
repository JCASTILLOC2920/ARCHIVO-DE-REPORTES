// sw.js - Service Worker de Grado Médico y Modo Quirófano Resiliente Mobile-First
// Versión Médico-Quirúrgica 587.00
const CACHE_NAME = 'jc-pathlab-medical-v587';

// Lista exhaustiva de activos vitales precacheados (50 recursos indispensables)
const STATIC_ASSETS = [
    './',
    './reportes.html',
    './login.html',
    './imprimir.html',
    './index.html',
    './mobile_camera_drop.html',
    './morfologia_antes_despues.jpg',
    './qrcode.min.js',
    './medical_order_cropper.js',
    './manifest.json',
    './favicon.png',
    './icon-192.png',
    './icon-512.png',
    './icon-maskable.png',
    './logo-jcpathlab.png',
    './header_reporte.png',
    './firma_sello.png',
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
    './help_guide.js',
    './boletas_manager.js',
    './synoptic_schemas.js',
    './cap_schemas_digestivo.js',
    './cap_schemas_gyn_endocrine.js',
    './cap_schemas_liver.js',
    './cap_schemas_urology.js',
    './macro_viewer_360.js',
    './script.js',
    './doctores.json',
    './client_simulator.js',
    './client_simulator.css',
    './groq_copilot.js',
    './groq_copilot.css'
];

// 1. INSTALACIÓN: Pre-cacheo tolerante a fallos individuales
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW Medical v567] Pre-cacheando los 46 recursos vitales de la plataforma...');
            return Promise.allSettled(
                STATIC_ASSETS.map((asset) =>
                    cache.add(asset).catch((err) => {
                        console.warn(`[SW Precache] Recurso omitido o diferido (${asset}):`, err.message);
                    })
                )
            );
        }).then(() => self.skipWaiting())
    );
});

// 2. ACTIVACIÓN: Purga de cachés obsoletas y reclamo inmediato de clientes activos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW Medical v567] Purgando caché obsoleta:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. ESTRATEGIAS DE INTERCEPCIÓN DE RED Y CACHÉ (OPTIMIZADO PARA iOS SAFARI Y ANDROID CHROME)
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const requestUrl = new URL(request.url);

    // Bypass estricto: Métodos no-GET, WebSockets, streaming en vivo y microservicios locales
    if (
        request.method !== 'GET' ||
        requestUrl.protocol === 'ws:' ||
        requestUrl.protocol === 'wss:' ||
        requestUrl.port === '8085' ||
        requestUrl.pathname.includes('/stream') ||
        requestUrl.pathname.includes('/video_feed') ||
        requestUrl.pathname.includes('/api/camera') ||
        requestUrl.hostname.includes('supabase.co') ||
        requestUrl.hostname.includes('groq.com') ||
        requestUrl.hostname.includes('resend.com') ||
        requestUrl.hostname.includes('resend.dev') ||
        requestUrl.protocol.startsWith('chrome-extension')
    ) {
        return;
    }

    const isNavigation = request.mode === 'navigate';

    // =========================================================================
    // ESTRATEGIA 1: FAST-NETWORK-FIRST CON TIMEOUT (Para Navegación HTML)
    // Evita la pantalla en blanco en celulares: Si la red móvil tarda > 2.5s,
    // sirve inmediatamente la shell desde la caché local sin congelar la pantalla.
    // =========================================================================
    if (isNavigation) {
        event.respondWith(
            (async () => {
                const timeoutDuration = 2500; // 2.5 segundos de tolerancia máxima en móvil
                let timeoutId;

                const timeoutPromise = new Promise((_, reject) => {
                    timeoutId = setTimeout(() => reject(new Error('NetworkTimeout')), timeoutDuration);
                });

                try {
                    const networkResponse = await Promise.race([
                        fetch(request),
                        timeoutPromise
                    ]);
                    clearTimeout(timeoutId);

                    if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
                    }
                    return networkResponse;
                } catch (err) {
                    clearTimeout(timeoutId);
                    // Respaldo inmediato en caché local
                    const cachedResponse = await caches.match(request, { ignoreSearch: true });
                    if (cachedResponse) return cachedResponse;

                    // Shell de rescate
                    const fallbackShell = (await caches.match('./reportes.html', { ignoreSearch: true })) ||
                                          (await caches.match('./login.html', { ignoreSearch: true })) ||
                                          (await caches.match('./index.html', { ignoreSearch: true }));
                    if (fallbackShell) return fallbackShell;

                    // Fallback estético offline
                    return new Response(
                        `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Modo Offline - JC Path Lab</title><style>body{background:#0f172a;color:#f8fafc;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;padding:20px;text-align:center;}h2{color:#38bdf8;}button{background:#0284c7;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-size:16px;cursor:pointer;margin-top:16px;}</style></head><body><h2>🔬 Modo Quirófano Offline</h2><p>El dispositivo se encuentra sin cobertura de datos y la vista solicitada no está precacheada.</p><button onclick="window.location.reload()">Reintentar Conexión</button></body></html>`,
                        {
                            status: 200,
                            headers: { 'Content-Type': 'text/html; charset=utf-8' }
                        }
                    );
                }
            })()
        );
        return;
    }

    // =========================================================================
    // ESTRATEGIA 2: STALE-WHILE-REVALIDATE (Para JS, CSS, JSON, Fuentes e Imágenes)
    // Entrega instantánea a 0ms desde la caché para que el celular pinte la UI de
    // inmediato sin parpadeos ni bloqueos, mientras revalida asíncronamente en segundo plano.
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
