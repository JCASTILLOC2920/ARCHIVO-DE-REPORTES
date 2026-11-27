// pwa_init.js - Inicializador PWA de Grado Médico y Captura de Instalación Android/iOS
(function () {
    'use strict';

    // -------------------------------------------------------------------------
    // 0. Utilidades comunes
    // -------------------------------------------------------------------------
    const APP_BUILD_VERSION = '20261105_v674';
    const CACHE_PREFIXES = ['jcpathlab-informes-', 'jcpathlab-soberano-', 'reportes-cache-'];
    const CURRENT_CACHE_NAME = 'jcpathlab-informes-v20261126_1269';

    /** Elimina cachés que coinciden con los prefijos indicados y que no son la actual. */
    async function purgeObsoleteCaches() {
        if (!('caches' in window)) return;
        const names = await caches.keys();
        const toDelete = names.filter(n => n !== CURRENT_CACHE_NAME && CACHE_PREFIXES.some(p => n.startsWith(p)));
        await Promise.all(toDelete.map(n => caches.delete(n)));
    }

    /** Muestra u oculta los botones de instalación según el estado. */
    // Purgar cachés obsoletas del navegador cliente de inmediato
    if (typeof window !== 'undefined' && 'caches' in window) {
        caches.keys().then(function(cacheNames) {
            cacheNames.forEach(function(name) {
                if (name !== 'jcpathlab-informes-v20261126_1269' && (name.startsWith('jcpathlab-informes-') || name.startsWith('jcpathlab-soberano-') || name.startsWith('reportes-cache-'))) {
                    console.log('[PWA Medical] Purgando caché obsoleta cliente:', name);
                    caches.delete(name);
                }
            });
        });
    }

    ['patientDatabaseLocal', 'patientDatabase', 'pacientesDB', 'patientDatabaseLocal_bak1', 'patientDatabaseLocal_bak2', 'patientDatabaseLocal_bak3', 'activePatientDb'].forEach(function(k){  var val = localStorage.getItem(k);  if (val && (val.indexOf('SIN NOMBRE') !== -1 || val.indexOf('26Q-18974') !== -1)) {    localStorage.removeItem(k);  }});

    // 1. Registro del Service Worker Médico con Bypass de Caché y Autocontrol
    if ('serviceWorker' in navigator) {
        let refreshing = false;
        const hadController = !!navigator.serviceWorker.controller;
        navigator.serviceWorker.addEventListener('controllerchange', function() {
            if (hadController && !refreshing) {
                refreshing = true;
                console.log(`[PWA Medical] Nuevo Service Worker activo (${APP_BUILD_VERSION}). Actualizando interfaz automáticamente...`);
                localStorage.setItem('app_version_informes', APP_BUILD_VERSION);
                window.location.reload();
            }
        });

        window.addEventListener('load', function() {
            navigator.serviceWorker.register('sw.js?v=20261105_v674', { scope: './', updateViaCache: 'none' })
                .then(function(registration) {
                    registration.update().catch(function() {});
                    console.log('[PWA Medical] Service Worker registrado con éxito (v655). Scope:', registration.scope);
                    
                    registration.addEventListener('updatefound', function() {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', function() {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    console.log('[PWA Medical] Nueva versión médica lista. Activando inmediatamente...');
                                    newWorker.postMessage({ action: 'skipWaiting' });
                                }
                            });
                        }
                    });
                })
                .catch(function(err) {
                    console.warn('[PWA Medical] Aviso: Service Worker no disponible o error menor en registro (continuando carga normal):', err);
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
    window.deferredInstallPrompt = null;

    function updateInstallUi(show) {
        const installBtns = document.querySelectorAll('#btnInstallApp, .pwa-install-header-btn, .btn-pwa-install');
        installBtns.forEach(btn => {
            if (show && !isAppInstalled()) {
                btn.style.display = 'inline-flex';
                btn.classList.add('pwa-visible');
            } else {
                btn.style.display = 'none';
                btn.classList.remove('pwa-visible');
            }
        });
    }

    /** Detecta si la PWA está ya instalada. */
    function isAppInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true ||
            document.referrer.includes('android-app://');
    }

    // -------------------------------------------------------------------------
    // 1. Guardián de versión y purga inicial
    // -------------------------------------------------------------------------
    (function versionGuard() {
        const savedVersion = localStorage.getItem('app_version_informes');
        if (savedVersion !== APP_BUILD_VERSION) {
            console.warn(`[PWA Version Guard] Versión previa detectada (${savedVersion} vs ${APP_BUILD_VERSION}). Purgando cachés y sincronizando...`);
            localStorage.setItem('app_version_informes', APP_BUILD_VERSION);
            purgeObsoleteCaches().catch(e => console.error('[PWA Version Guard] Error purgando cachés:', e));
        }
    })();

    // -------------------------------------------------------------------------
    // 2. Purga de cachés obsoletas al cargar la página
    // -------------------------------------------------------------------------
    (function immediateCachePurge() {
        if (typeof window !== 'undefined' && 'caches' in window) {
            purgeObsoleteCaches().catch(e => console.error('[PWA Init] Error purgando cachés al iniciar:', e));
        }
    })();

    // -------------------------------------------------------------------------
    // 3. Limpieza de bases locales corruptas
    // -------------------------------------------------------------------------
    (function cleanLocalDatabases() {
        const keys = [
            'patientDatabaseLocal', 'patientDatabase', 'pacientesDB',
            'patientDatabaseLocal_bak1', 'patientDatabaseLocal_bak2',
            'patientDatabaseLocal_bak3', 'activePatientDb'
        ];
        keys.forEach(k => {
            const val = localStorage.getItem(k);
            if (val && (val.includes('SIN NOMBRE') || val.includes('26Q-18974'))) {
                localStorage.removeItem(k);
            }
        });
    })();

    // -------------------------------------------------------------------------
    // 4. Registro y gestión del Service Worker
    // -------------------------------------------------------------------------
    if ('serviceWorker' in navigator) {
        let refreshing = false;
        const hadController = !!navigator.serviceWorker.controller;

        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (hadController && !refreshing) {
                refreshing = true;
                console.log(`[PWA Medical] Nuevo Service Worker activo (${APP_BUILD_VERSION}). Actualizando interfaz automáticamente...`);
                localStorage.setItem('app_version_informes', APP_BUILD_VERSION);
                window.location.reload();
            }
        });

        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js?v=20261105_v674', { scope: './', updateViaCache: 'none' })
                .then(reg => {
                    reg.update().catch(() => { /* ignore */ });
                    console.log('[PWA Medical] Service Worker registrado con éxito (v655). Scope:', reg.scope);

                    reg.addEventListener('updatefound', () => {
                        const newWorker = reg.installing;
                        if (!newWorker) return;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('[PWA Medical] Nueva versión médica lista. Activando inmediatamente...');
                                newWorker.postMessage({ action: 'skipWaiting' });
                            }
                        });
                    });
                })
                .catch(err => {
                    console.warn('[PWA Medical] Aviso: Service Worker no disponible o error menor en registro (continuando carga normal):', err);
                });
        });
    }

    // -------------------------------------------------------------------------
    // 5. Manejo del evento beforeinstallprompt
    // -------------------------------------------------------------------------
    let deferredInstallPrompt = null;
    window.deferredInstallPrompt = null;

    window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault();
        deferredInstallPrompt = e;
        window.deferredInstallPrompt = e;
        console.log('[PWA Medical] Evento beforeinstallprompt capturado. Listo para instalación.');
        updateInstallUi(true);
        window.dispatchEvent(new CustomEvent('pwa-install-ready', { detail: { promptEvent: e } }));
    });

    // -------------------------------------------------------------------------
    // 6. Instalación de la PWA mediante un clic
    // -------------------------------------------------------------------------
    window.installPwaApp = async function () {
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

    // -------------------------------------------------------------------------
    // 7. Notificación de instalación completada
    // -------------------------------------------------------------------------
    window.addEventListener('appinstalled', () => {
        console.log('[PWA Medical] Aplicación instalada correctamente.');
        deferredInstallPrompt = null;
        window.deferredInstallPrompt = null;
        updateInstallUi(false);
        if (typeof window.showToast === 'function') {
            window.showToast('¡App Patología Digital instalada con éxito!', 'success');
        }
    });

    // -------------------------------------------------------------------------
    // 8. Vinculación de botones de instalación (única vez)
    // -------------------------------------------------------------------------
    let installButtonsBound = false;
    function bindInstallButtons() {
        if (installButtonsBound) return;
        installButtonsBound = true;

        if (isAppInstalled()) {
            updateInstallUi(false);
            return;
        }

        const installBtns = document.querySelectorAll('#btnInstallApp, .pwa-install-header-btn, .btn-pwa-install');
        installBtns.forEach(btn => {
            if (!btn._pwaBound) {
                btn._pwaBound = true;
                btn.addEventListener('click', ev => {
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

    // -------------------------------------------------------------------------
    // 9. Healthcheck y autoreparación (prevención de bucles)
    // -------------------------------------------------------------------------
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const container = document.getElementById('tableBody') ||
                document.getElementById('reportTable') ||
                document.getElementById('tablaPacientes') ||
                document.getElementById('pacientesTable') ||
                document.querySelector('.pv-sheet') ||
                document.querySelector('table');

            const hasContent = container ?
                (container.innerText.trim().length > 10 || container.querySelectorAll('tr, div').length > 0) :
                true;

            const alreadyRepaired = sessionStorage.getItem('pwa_auto_repaired_v630');

            if (!hasContent && !alreadyRepaired) {
                console.warn('[Healthcheck Frontend] Falla detectada (tabla vacía o sin contenido). Ejecutando Autoreparación única...');
                sessionStorage.setItem('pwa_auto_repaired_v630', 'true');
                triggerAutoRepair();
            }
        }, 3500);
    });

    async function triggerAutoRepair() {
        try {
            await purgeObsoleteCaches();
            localStorage.removeItem('app_cache');

            if (window.RealSupabaseBackup && typeof window.RealSupabaseBackup.restore === 'function') {
                window.RealSupabaseBackup.restore();
            }

            showBanner();
            setTimeout(() => window.location.reload(true), 1500);
        } catch (e) {
            console.error('[AutoRepair Error]', e);
        }
    }

    function showBanner() {
        if (document.getElementById('auto-recovered-banner')) return;
        const b = document.createElement('div');
        b.id = 'auto-recovered-banner';
        b.style.cssText = 'position:fixed;top:0;left:0;width:100%;background:#10b981;color:#fff;text-align:center;padding:14px;font-weight:bold;z-index:999999;font-family:Inter,sans-serif;box-shadow:0 4px 15px rgba(0,0,0,0.3);';
        b.innerHTML = '<i class="fa-solid fa-circle-check" style="margin-right:8px;"></i> Sistema Autorecuperado - Caché Purgada y Caja Negra Sincronizada';
        document.body.insertBefore(b, document.body.firstChild);
    }
})();
