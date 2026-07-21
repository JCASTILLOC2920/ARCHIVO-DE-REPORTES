// ui_editor.js
// PROTOCOLO ACTOR-CRITICO: Módulo de Interfaz para Modales, Editores y Safe-Setters

// --- SAFE SETTERS MATEMÁTICOS ---
// Previene crasheos si el elemento no existe en el DOM (Zero Redundancy)

export const safeSetElementValue = (elementId, value) => {
    const el = document.getElementById(elementId);
    if (el) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
            el.value = value || '';
        } else {
            el.innerText = value || '';
        }
    } else {
        console.warn(`[SafeSetter] Elemento ${elementId} no encontrado. Asignación evadida para prevenir caída.`);
    }
};

export const safeSetElementHTML = (elementId, htmlContent) => {
    const el = document.getElementById(elementId);
    if (el) {
        el.innerHTML = htmlContent || '';
    }
};

export const safeToggleDisplay = (elementId, displayState) => {
    const el = document.getElementById(elementId);
    if (el) {
        el.style.display = displayState;
    }
};

// --- GESTIÓN DE MODALES ---

export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Bloquear scroll trasero
    }
}

export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.body.style.overflow = ''; 
    }
}

// Escuchar clics fuera de los modales para cerrarlos automáticamente
export function initModalListeners() {
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Escuchar tecla Escape
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                modal.classList.remove('active');
            });
            document.body.style.overflow = '';
        }
    });
}
