// help_guide.js
// Sistema de Burbujas de Ayuda Visual / Onboarding Premium para Personal Técnico

(function() {
    function initHelpGuide() {
        // 1. Agregar botón de ayuda en la cabecera si no existe
        const headerRight = document.querySelector('.header-right');
        if (headerRight && !document.getElementById('btnShowHelpGuide')) {
            const helpBtn = document.createElement('button');
            helpBtn.id = 'btnShowHelpGuide';
            helpBtn.type = 'button';
            helpBtn.className = 'header-utility-btn';
            helpBtn.title = 'Guía de Ayuda Visual';
            helpBtn.innerHTML = '<i class="fa-solid fa-circle-question"></i>';
            helpBtn.style.marginRight = '8px';
            
            // Insertar antes del botón de base de datos
            const dbBtn = headerRight.querySelector('.header-utility-btn[aria-label="Base de datos"]');
            if (dbBtn) {
                headerRight.insertBefore(helpBtn, dbBtn);
            } else {
                headerRight.appendChild(helpBtn);
            }

            helpBtn.addEventListener('click', () => {
                localStorage.removeItem('helpGuideDismissed');
                showHelpBubbles();
            });
        }

        // 2. Comprobar si ya fue descartado en esta sesión/navegador
        if (!localStorage.getItem('helpGuideDismissed')) {
            // Esperar un momento corto para renderizar
            setTimeout(showHelpBubbles, 1200);
        }
    }

    function createBubble(id, targetElement, placement, text) {
        // Eliminar si ya existe
        const existing = document.getElementById(id);
        if (existing) existing.remove();

        const rect = targetElement.getBoundingClientRect();
        
        // Si el elemento no es visible en el DOM, no crear la burbuja
        if (rect.width === 0 || rect.height === 0) return;

        const bubble = document.createElement('div');
        bubble.id = id;
        bubble.className = 'help-guide-bubble';
        
        // Contenido de la burbuja
        bubble.innerHTML = `
            <div class="bubble-content">${text}</div>
            <div class="bubble-actions">
                <button type="button" class="btn-bubble-close">Entendido</button>
            </div>
        `;

        document.body.appendChild(bubble);

        // Posicionar burbuja de forma absoluta en el documento
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;
        
        let top = 0;
        let left = 0;
        let arrowClass = '';

        const bubbleWidth = bubble.offsetWidth || 230;
        const bubbleHeight = bubble.offsetHeight || 80;

        if (placement === 'bottom') {
            top = rect.bottom + scrollY + 12;
            left = rect.left + scrollX + (rect.width / 2) - (bubbleWidth / 2);
            arrowClass = 'arrow-top';
        } else if (placement === 'top') {
            top = rect.top + scrollY - bubbleHeight - 12;
            left = rect.left + scrollX + (rect.width / 2) - (bubbleWidth / 2);
            arrowClass = 'arrow-bottom';
        } else if (placement === 'left') {
            top = rect.top + scrollY + (rect.height / 2) - (bubbleHeight / 2);
            left = rect.left + scrollX - bubbleWidth - 12;
            arrowClass = 'arrow-right';
        } else if (placement === 'right') {
            top = rect.top + scrollY + (rect.height / 2) - (bubbleHeight / 2);
            left = rect.right + scrollX + 12;
            arrowClass = 'arrow-left';
        }

        // Limitar los márgenes para evitar desborde fuera de la pantalla
        left = Math.max(10, Math.min(window.innerWidth - bubbleWidth - 10, left));
        top = Math.max(10, top);

        bubble.style.top = top + 'px';
        bubble.style.left = left + 'px';
        bubble.classList.add(arrowClass);

        // Configurar evento de cierre
        bubble.querySelector('.btn-bubble-close').addEventListener('click', () => {
            bubble.remove();
            
            // Si ambas burbujas se cierran, marcar como desactivado globalmente en localStorage
            const activeBubbles = document.querySelectorAll('.help-guide-bubble');
            if (activeBubbles.length === 0) {
                localStorage.setItem('helpGuideDismissed', 'true');
            }
        });
    }

    function showHelpBubbles() {
        // 1. Burbuja de Búsqueda
        const isMobile = window.innerWidth <= 768;
        const searchTarget = isMobile ? document.getElementById('btnToggleFilters') : document.getElementById('nomPaciente');
        
        if (searchTarget) {
            const text = isMobile 
                ? '🔍 Presiona aquí para mostrar los filtros de búsqueda por Nombre o DNI.'
                : '🔍 Escribe aquí el Nombre o el DNI para buscar un informe rápido.';
            createBubble('search-help-bubble', searchTarget, isMobile ? 'bottom' : 'top', text);
        }

        // 2. Burbuja de Impresión (se ancla al primer botón de PDF visible)
        const firstPdfBtn = document.querySelector('.report-table .pdf-btn');
        if (firstPdfBtn) {
            createBubble(
                'print-help-bubble',
                firstPdfBtn,
                isMobile ? 'bottom' : 'left',
                '🖨️ Presiona este icono de impresora para abrir y mandar a imprimir el informe.'
            );
        }
    }

    function hideHelpBubbles() {
        const bubbles = document.querySelectorAll('.help-guide-bubble');
        bubbles.forEach(b => b.remove());
    }

    // Registrar funciones globalmente
    window.checkAndTriggerHelpBubbles = showHelpBubbles;
    window.hideHelpBubbles = hideHelpBubbles;

    // Ejecutar al cargar la página
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHelpGuide);
    } else {
        initHelpGuide();
    }

    // Reposicionar burbujas dinámicamente si se redimensiona la pantalla
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (!localStorage.getItem('helpGuideDismissed')) {
                showHelpBubbles();
            }
        }, 150);
    });
})();
