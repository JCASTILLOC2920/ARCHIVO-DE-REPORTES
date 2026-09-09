// pwa_init.js - Inicializador PWA de Grado Médico y Captura de Instalación Android/iOS
(function() {
    'use strict';

    // 1. Registro del Service Worker Médico con Bypass de Caché
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('sw.js?v=576.00', { scope: './', updateViaCache: 'none' })
                .then(function(registration) {
                    // Forzar comprobación inmediata de actualización
                    registration.update();
                    console.log('[PWA Medical] Service Worker registrado con éxito (v576). Scope:', registration.scope);
                    
                    // Escuchar actualizaciones en segundo plano
                    registration.addEventListener('updatefound', function() {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', function() {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    console.log('[PWA Medical] Nueva versión médica lista para actualizar.');
                                }
                            });
                        }
                    });
                })
                .catch(function(err) {
                    console.warn('[PWA Medical] Error registrando Service Worker:', err);
                });
        });
    }

    // 2. Detección de Modo Standalone / App Ya Instalada
    function isAppInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true ||
               document.referrer.includes('android-app://');
    }

    // 3. Captura del Evento beforeinstallprompt para Instalación Nativa en Android
    let deferredInstallPrompt = null;
    window.deferredInstallPrompt = null;

    function updateInstallUi(show) {
        const installBtns = document.querySelectorAll('#btnInstallApp, .pwa-install-header-btn, .btn-pwa-install');
        installBtns.forEach(function(btn) {
            if (show && !isAppInstalled()) {
                btn.style.display = 'inline-flex';
                btn.classList.add('pwa-visible');
            } else {
                btn.style.display = 'none';
                btn.classList.remove('pwa-visible');
            }
        });
    }

    window.addEventListener('beforeinstallprompt', function(e) {
        // Prevenir la barra de información genérica del navegador
        e.preventDefault();
        deferredInstallPrompt = e;
        window.deferredInstallPrompt = e;
        console.log('[PWA Medical] Evento beforeinstallprompt capturado. Listo para instalación.');
        
        updateInstallUi(true);
        window.dispatchEvent(new CustomEvent('pwa-install-ready', { detail: { promptEvent: e } }));
    });

    // 4. Función Global de Instalación Clínica en 1 Clic
    window.installPwaApp = async function() {
        if (!deferredInstallPrompt) {
            console.log('[PWA Medical] Prompt de instalación no disponible o ya utilizado.');
            return;
        }

        try {
            deferredInstallPrompt.prompt();
            const choiceResult = await deferredInstallPrompt.userChoice;
            console.log('[PWA Medical] Decisión del usuario:', choiceResult.outcome);
            if (choiceResult.outcome === 'accepted') {
                updateInstallUi(false);
            }
            deferredInstallPrompt = null;
            window.deferredInstallPrompt = null;
        } catch (err) {
            console.error('[PWA Medical] Error durante el proceso de instalación:', err);
        }
    };

    // 5. Escuchar cuando la App ha sido instalada exitosamente
    window.addEventListener('appinstalled', function() {
        console.log('[PWA Medical] Aplicación de Patología Digital instalada correctamente.');
        deferredInstallPrompt = null;
        window.deferredInstallPrompt = null;
        updateInstallUi(false);
        if (typeof window.showToast === 'function') {
            window.showToast('¡App Patología Digital instalada con éxito!', 'success');
        }
    });

    // 6. Vinculación ergonómica de botones de instalación en el DOM
    function bindInstallButtons() {
        if (isAppInstalled()) {
            updateInstallUi(false);
            return;
        }

        const installBtns = document.querySelectorAll('#btnInstallApp, .pwa-install-header-btn, .btn-pwa-install');
        installBtns.forEach(function(btn) {
            if (!btn._pwaBound) {
                btn._pwaBound = true;
                btn.addEventListener('click', function(ev) {
                    ev.preventDefault();
                    window.installPwaApp();
                });
            }
        });

        if (deferredInstallPrompt) {
            updateInstallUi(true);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindInstallButtons);
    } else {
        bindInstallButtons();
    }
    window.addEventListener('load', bindInstallButtons);
})();
