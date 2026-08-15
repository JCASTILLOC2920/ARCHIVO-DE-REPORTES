/**
 * responsive_scaler.js
 * Sistema de Escalado Matemático Fluido y Matriz Tri-Adaptativa por Densidad Útil
 * Resiliencia Total ante Zoom del Navegador (50% a 200%) y Tamaño de Monitor (13" a 32")
 */
(function () {
    function updateResponsiveScale() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const dpr = window.devicePixelRatio || 1;
        
        // Medir zoom óptico real del viewport si está disponible
        const vvScale = (window.visualViewport && window.visualViewport.scale) ? window.visualViewport.scale : 1;
        const totalZoomFactor = Math.max(0.5, Math.min(2.5, dpr * vvScale));

        // Ancho de sidebar según estado de colapso o resolución
        const appContainer = document.getElementById('appContainer');
        const isCollapsed = appContainer && appContainer.classList.contains('collapsed');
        let sidebarWidth = isCollapsed ? 65 : 260;
        if (width < 1250) sidebarWidth = 70;

        // Ancho real libre para el contenido descontando sidebar y zoom
        const rawContentWidth = width - sidebarWidth;
        const effectiveUsableWidth = rawContentWidth / Math.max(0.8, totalZoomFactor);

        // Ancho base de referencia
        const baselineWidth = 1440;
        let rawRatio = width / baselineWidth;
        let scaleFactor = Math.max(0.78, Math.min(1.40, Math.pow(rawRatio, 0.40)));

        // Factor de compensación contra zoom agresivo (>120% o <90%)
        let zoomCompensation = 1.0;
        if (totalZoomFactor > 1.15) {
            zoomCompensation = Math.max(0.70, 1 / Math.pow(totalZoomFactor, 0.55));
        } else if (totalZoomFactor < 0.9) {
            zoomCompensation = Math.min(1.25, 1 / Math.pow(totalZoomFactor, 0.35));
        }

        const root = document.documentElement;
        root.style.setProperty('--screen-scale-factor', scaleFactor.toFixed(4));
        root.style.setProperty('--zoom-level', totalZoomFactor.toFixed(2));
        root.style.setProperty('--zoom-compensation', zoomCompensation.toFixed(4));
        root.style.setProperty('--vw-width', width + 'px');
        root.style.setProperty('--vh-height', height + 'px');
        root.style.setProperty('--usable-content-width', effectiveUsableWidth.toFixed(2) + 'px');

        // Determinación de Modo de Densidad Tri-Adaptativo en document.body
        if (document.body) {
            document.body.classList.remove('density-mode-1', 'density-mode-2', 'density-mode-3');
            
            if (effectiveUsableWidth >= 1280 && width >= 1400) {
                document.body.classList.add('density-mode-1'); // Modo 1: Vista Ejecutiva Amplia
            } else if (effectiveUsableWidth >= 980 && width >= 1100) {
                document.body.classList.add('density-mode-2'); // Modo 2: Vista Balanceada Fluid-Wrap
            } else {
                document.body.classList.add('density-mode-3'); // Modo 3: Vista Ultrafina de Alta Densidad (0 Recorte)
            }
        }
    }

    // Ejecutar al cargar y al cambiar de tamaño o zoom
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateResponsiveScale);
    } else {
        updateResponsiveScale();
    }

    window.addEventListener('resize', updateResponsiveScale, { passive: true });
    
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', updateResponsiveScale, { passive: true });
        window.visualViewport.addEventListener('scroll', updateResponsiveScale, { passive: true });
    }

    window.ResponsiveScaler = { updateScale: updateResponsiveScale };
})();
