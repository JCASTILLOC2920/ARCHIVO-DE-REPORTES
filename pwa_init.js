// pwa_init.js - Desactivador Total y Purga Permanente de Service Worker y Banners PWA
(function() {
    'use strict';

    // 1. Desregistrar inmediatamente todos los Service Workers registrados
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for (let registration of registrations) {
                registration.unregister();
            }
        }).catch(function(e) {});
    }

    // 2. Limpiar todas las cachés del navegador asociadas a PWA
    if ('caches' in window) {
        caches.keys().then(function(names) {
            for (let name of names) {
                caches.delete(name);
            }
        }).catch(function(e) {});
    }

    // 3. Bloquear y suprimir en el origen el evento de banner de instalación del navegador
    window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }, true);

    // 4. Destrucción en tiempo real de cualquier elemento de banner en el DOM
    function purgeAllInstallBanners() {
        const selectors = [
            '#pwa-install-banner',
            '.pwa-install-banner',
            '.pwa-banner',
            '.pwa-install-dialog',
            '[id*="pwa"]',
            '[class*="pwa-install"]',
            '[id*="install-banner"]'
        ];
        selectors.forEach(function(sel) {
            document.querySelectorAll(sel).forEach(function(el) {
                if (el.tagName === 'SCRIPT' || el.tagName === 'LINK') return;
                el.remove();
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', purgeAllInstallBanners);
    } else {
        purgeAllInstallBanners();
    }
    window.addEventListener('load', purgeAllInstallBanners);
    setInterval(purgeAllInstallBanners, 300);
})();

