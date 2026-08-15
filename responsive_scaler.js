/**
 * responsive_scaler.js
 * Sistema de Escalado Matemático Fluido y Resiliencia Estética ante Zoom del Navegador (50% a 200%)
 */
(function () {
    function updateResponsiveScale() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const dpr = window.devicePixelRatio || 1;
        
        // Medir zoom óptico real del viewport si está disponible
        const vvScale = (window.visualViewport && window.visualViewport.scale) ? window.visualViewport.scale : 1;
        const totalZoomFactor = Math.max(0.5, Math.min(2.5, dpr * vvScale));

        // Ancho base de referencia (Full HD / Laptops grandes standard ~1440px)
        const baselineWidth = 1440;
        
        // Factor de escala suavizado usando raíz cuadrada para evitar tamaños excesivamente gigantes en 4K
        let rawRatio = width / baselineWidth;
        let scaleFactor = Math.max(0.80, Math.min(1.45, Math.pow(rawRatio, 0.42)));

        // Factor de compensación contra zooms agresivos (>120% o <90%)
        let zoomCompensation = 1.0;
        if (totalZoomFactor > 1.15) {
            // A zooms altos (120% a 200%), reducir proporcionalmente márgenes y paddings para evitar desbordes
            zoomCompensation = Math.max(0.72, 1 / Math.pow(totalZoomFactor, 0.5));
        } else if (totalZoomFactor < 0.9) {
            // A zooms bajos (50% a 80%), amplificar ligeramente legibilidad
            zoomCompensation = Math.min(1.25, 1 / Math.pow(totalZoomFactor, 0.35));
        }

        const root = document.documentElement;
        root.style.setProperty('--screen-scale-factor', scaleFactor.toFixed(4));
        root.style.setProperty('--zoom-level', totalZoomFactor.toFixed(2));
        root.style.setProperty('--zoom-compensation', zoomCompensation.toFixed(4));
        root.style.setProperty('--vw-width', width + 'px');
        root.style.setProperty('--vh-height', height + 'px');
        root.style.setProperty('--device-dpr', dpr.toFixed(2));

        // Auto-colapsar o compactar layout cuando el espacio libre sea restringido por zoom o pantalla
        if (document.body) {
            if (width < 1350) {
                document.body.classList.add('viewport-compact');
            } else {
                document.body.classList.remove('viewport-compact');
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
