/**
 * responsive_scaler.js
 * Sistema de Escalado Matemático Fluido para Ajuste a Cualquier Monitor y Zoom
 */
(function () {
    function updateResponsiveScale() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const dpr = window.devicePixelRatio || 1;

        // Ancho base de referencia (Full HD / Laptops grandes standard ~1440px - 1536px)
        const baselineWidth = 1440;
        
        // Factor de escala suavizado usando raíz cuadrada para evitar tamaños excesivamente gigantes en 4K
        let rawRatio = width / baselineWidth;
        let scaleFactor = Math.max(0.85, Math.min(1.45, Math.pow(rawRatio, 0.45)));

        // Ajuste por nivel de zoom / alta densidad de píxeles (DPI)
        if (dpr > 1.25 && width < 1600) {
            // En laptops con escalado de Windows al 125% o 150% (DPI alto), compensar ligeramente el tamaño
            scaleFactor = scaleFactor * 0.96;
        }

        const root = document.documentElement;
        root.style.setProperty('--screen-scale-factor', scaleFactor.toFixed(4));
        root.style.setProperty('--vw-width', width + 'px');
        root.style.setProperty('--vh-height', height + 'px');
        root.style.setProperty('--device-dpr', dpr.toFixed(2));
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
    }

    window.ResponsiveScaler = { updateScale: updateResponsiveScale };
})();
