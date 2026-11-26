const CACHE_NAME = 'jc-path-lab-v6.1.0';
const ASSETS = [
  './',
  './index.html',
  './antigravity.css',
  './antigravity.js',
  './dexie.min.js',
  './qrcode.min.js',
  './jspdf.umd.min.js',
  './css/all.min.css',
  './clinicas.json',
  './manifest.json'
];

// Instalación: Cachear archivos críticos para soberanía 100% offline
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Activación: Limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Estrategia Network-First con fallback a caché local soberano
self.addEventListener('fetch', (event) => {
  // Solo interceptar peticiones GET
  if (event.request.method !== 'GET') {
    return;
  }

  // No interceptar peticiones a otros orígenes (APIs externas, etc.)
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clonar la respuesta para poder guardarla en caché
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback final: servir la página principal si es una navegación
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          // Si no hay nada en caché, devolver una respuesta vacía o error
          return new Response('Offline', { status: 503, statusText: 'Service Worker Offline' });
        });
      })
  );
});
