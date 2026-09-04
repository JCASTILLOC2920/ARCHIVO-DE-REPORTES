// pwa_init.js - Inicializador de Aplicación Móvil PWA para JC Path Lab
(function() {
    // 1. Registro del Service Worker con Actualización Forzada
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then((registration) => {
                    registration.update();
                    console.log('[PWA Engine] ✅ Service Worker activo en alcance:', registration.scope);
                })
                .catch((error) => {
                    console.warn('[PWA Engine] Aviso de registro:', error);
                });
        });

        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                window.location.reload();
            }
        });
    }

    // 2. Manejo del Banner de Instalación Nativa en Android / Celular
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        console.log('[PWA Engine] 📱 Evento de instalación capturado.');

        // Crear o mostrar botón/banner de instalación si estamos en móvil o navegador compatible
        showInstallPromotion();
    });

    function showInstallPromotion() {
        if (document.getElementById('pwa-install-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'pwa-install-banner';
        banner.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            left: 20px;
            max-width: 400px;
            margin: 0 auto;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #ffffff;
            border: 1px solid #38bdf8;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 15px rgba(56, 189, 248, 0.3);
            border-radius: 12px;
            padding: 14px 18px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            z-index: 999999;
            font-family: 'Inter', -apple-system, sans-serif;
            animation: pwaSlideUp 0.35s ease-out;
        `;

        banner.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <img src="icon-192.png" alt="Logo" style="width: 42px; height: 42px; border-radius: 8px; border: 1px solid #38bdf8;">
                <div>
                    <div style="font-weight: 700; font-size: 0.92rem; color: #38bdf8;">JC Path Lab Móvil</div>
                    <div style="font-size: 0.76rem; color: #cbd5e1;">Instale la app en su celular</div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <button type="button" id="pwa-btn-install" style="
                    background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
                    color: white;
                    border: none;
                    padding: 7px 14px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 0.82rem;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(2, 132, 199, 0.4);
                ">Instalar</button>
                <button type="button" id="pwa-btn-close" style="
                    background: transparent;
                    color: #94a3b8;
                    border: none;
                    font-size: 1.1rem;
                    cursor: pointer;
                    padding: 4px;
                ">&times;</button>
            </div>
        `;

        document.body.appendChild(banner);

        document.getElementById('pwa-btn-install').addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`[PWA Engine] Resultado de instalación: ${outcome}`);
                deferredPrompt = null;
            }
            banner.remove();
        });

        document.getElementById('pwa-btn-close').addEventListener('click', () => {
            banner.remove();
        });
    }

    window.addEventListener('appinstalled', () => {
        console.log('[PWA Engine] 🎉 ¡Aplicación JC Path Lab instalada con éxito en el dispositivo!');
        const banner = document.getElementById('pwa-install-banner');
        if (banner) banner.remove();
        if (typeof showToast === 'function') {
            showToast('🎉 ¡JC Path Lab instalada con éxito en su pantalla de inicio!', 'success');
        }
    });
})();
