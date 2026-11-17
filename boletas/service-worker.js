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
});

// Estrategia Network-First con fallback a caché local soberano
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
