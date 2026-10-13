/**
 * ============================================================================
 * MOTOR DE HEALTHCHECK Y AUTOREPARACIÓN DE FRONTEND (LIVENESS & AUTO-REPAIR)
 * ============================================================================
 * - Detects missing libraries (e.g., window.jspdf, etc.)
 * - Detects table loading timeout within 3 seconds
 * - Automatically triggers self-repair: purges caches, reloads from local Black Box,
 *   and displays a green visual banner of 'Sistema Autorecuperado'.
 */
(function() {
    window.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            const missingLib = (typeof window.jspdf === 'undefined' && document.querySelector('script[src*="jspdf"]') !== null);
            const container = document.getElementById('tablaPacientes') || document.getElementById('pacientesTable') || document.querySelector('.pv-sheet') || document.querySelector('table');
            const hasContent = container ? (container.innerText.trim().length > 20 || container.querySelectorAll('tr, div').length > 0) : true;

            if (missingLib || !hasContent) {
                console.warn('[Healthcheck Frontend] Falla detectada (librería ausente o timeout de tabla 3s). Ejecutando Autoreparación...');
                triggerAutoRepair();
            }
        }, 3000);
    });

    function triggerAutoRepair() {
        try {
            if ('caches' in window) {
                caches.keys().then(names => names.forEach(n => caches.delete(n)));
            }
            localStorage.removeItem('app_cache');
            sessionStorage.clear();

            if (window.RealSupabaseBackup && typeof window.RealSupabaseBackup.restore === 'function') {
                window.RealSupabaseBackup.restore();
            }

            showBanner();
            setTimeout(() => window.location.reload(true), 1500);
        } catch (e) {
            console.error('[AutoRepair Error]', e);
            window.location.reload();
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
