// ui_editor.js
// PROTOCOLO ACTOR-CRITICO: Módulo de Interfaz para Modales, Editores y Safe-Setters
// VERSIÓN: 12.0 OMEGA-ARGÓN
// AUTORIDAD: DR. JOSÉ CASTILLO - JC PATH LAB

// --- SAFE SETTERS MATEMÁTICOS ---
// Previene crasheos si el elemento no existe en el DOM (Zero Redundancy)

export const safeSetElementValue = (elementId, value) => {
    const el = document.getElementById(elementId);
    if (el) {
        const valToSet = (value !== undefined && value !== null) ? value : '';
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
            el.value = valToSet;
        } else {
            el.innerText = valToSet;
        }
    } else {
        console.warn(`[SafeSetter] Elemento ${elementId} no encontrado.`);
    }
};

export const safeSetElementHTML = (elementId, htmlContent) => {
    const el = document.getElementById(elementId);
    if (el) {
        el.innerHTML = (htmlContent !== undefined && htmlContent !== null) ? htmlContent : '';
    }
};

export const safeToggleDisplay = (elementId, displayState) => {
    const el = document.getElementById(elementId);
    if (el) {
        el.style.display = displayState;
    }
};

// --- GESTIÓN DE MODALES ---

let savedMainScrollY = 0;

export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Capturar posición de scroll actual para restaurar al cerrar
        savedMainScrollY = (typeof window !== 'undefined' && window.scrollY) || (document.documentElement ? document.documentElement.scrollTop : 0) || 0;
        
        // Activar clase y estilos inline para garantizar visibilidad
        modal.classList.add('active');
        if (modal.style && typeof modal.style.setProperty === 'function') {
            modal.style.setProperty('display', 'flex', 'important');
            modal.style.setProperty('z-index', '999999', 'important');
            modal.style.setProperty('visibility', 'visible', 'important');
            modal.style.setProperty('opacity', '1', 'important');
        } else if (modal.style) {
            modal.style.display = 'flex';
        }
        
        // Bloquear scroll del body para evitar desplazamiento de fondo
        if (document.body && document.body.style) {
            document.body.style.overflow = 'hidden';
        }
    }
}

export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Limpieza específica para el editor de reportes
        if (modalId === 'reportEditorModalOverlay') {
            if (typeof window !== 'undefined') {
                window.activePatientCode = null;
            }
            // Intentar limpiar espacios de trabajo del cropper si la función está disponible
            if (typeof resetEditorCropperWorkspaces === 'function') {
                resetEditorCropperWorkspaces();
            } else if (typeof window !== 'undefined' && typeof window.resetEditorCropperWorkspaces === 'function') {
                window.resetEditorCropperWorkspaces();
            }
        }
        
        // Desactivar modal
        modal.classList.remove('active');
        if (modal.style && typeof modal.style.setProperty === 'function') {
            modal.style.setProperty('display', 'none', 'important');
        } else if (modal.style) {
            modal.style.display = 'none';
        }
        
        // Verificar si quedan otros modales activos antes de restaurar el scroll del body
        const otherActiveModals = document.querySelectorAll 
            ? document.querySelectorAll('.modal-overlay.active, .report-editor-overlay.active, .modal-overlay[style*="display: flex"], .report-editor-overlay[style*="display: flex"]') 
            : [];
        
        if (otherActiveModals.length === 0) {
            if (document.body && document.body.style) {
                document.body.style.overflow = ''; 
            }
            // Restaurar posición de scroll original
            if (savedMainScrollY > 0 && typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
                window.scrollTo({ top: savedMainScrollY, behavior: 'instant' });
            }
        }
    }
}

export function initModalListeners() {
    // Cerrar modales al hacer clic fuera (excluyendo overlays específicos que requieren gestión manual)
    window.addEventListener('click', (e) => {
        // Si el clic es directamente en el overlay, no cerrar (permite interacción con contenido)
        if (
            e.target.classList.contains('floating-modal-overlay') ||
            e.target.classList.contains('modal-overlay') ||
            e.target.classList.contains('report-editor-overlay') ||
            e.target.id === 'registrationModalOverlay' ||
            e.target.id === 'reportEditorModalOverlay'
        ) {
            return;
        }
        
        // Si el clic es en el contenedor del modal (no en el overlay), cerrar
        if (e.target.classList.contains('modal') && e.target.id !== 'reportEditorModalOverlay' && e.target.id !== 'registrationModalOverlay') {
            e.target.classList.remove('active');
            if (e.target.style) {
                e.target.style.display = 'none';
            }
        }
    });

    // Escuchar tecla Escape para cerrar modales activos
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModals = document.querySelectorAll 
                ? document.querySelectorAll('.modal-overlay.active, .report-editor-overlay.active, .report-editor-overlay[style*="display: flex"]') 
                : [];
                
            activeModals.forEach(modal => {
                // Proteger modales críticos de cierre accidental por Escape si se requiere
                if (modal.id === 'registrationModalOverlay' || modal.id === 'reportEditorModalOverlay') {
                    return; 
                }
                closeModal(modal.id);
            });
        }
    });
}
