// main.js
// PROTOCOLO ACTOR-CRITICO: Orquestador Principal (Punto de Entrada Modular)

import { initLocalDatabases, patientDatabase } from './db_service.js?v=3.1';
import { initTableUI, renderTable, applyFilters, setCurrentService } from './ui_tables.js?v=3.1';
import { initModalListeners, openModal, closeModal } from './ui_editor.js?v=3.1';
import { openPrintWindow } from './pdf_engine.js?v=3.1';
import { initDictaphone, startDictation } from './dictaphone_core.js?v=3.1';
import { initReportEditorLogic, populateEditorModal } from './ui_report_editor.js?v=3.1';
import { initAdminUI } from './ui_admin.js?v=3.1';

document.addEventListener('DOMContentLoaded', () => {
    console.log("[Core] Inicializando Sistema Modular V2...");

    // 1. Inicializar Bases de Datos
    initLocalDatabases();
    window.patientDatabase = patientDatabase;

    // 2. Inicializar Interfaz (UI)
    initTableUI('tableBody');
    renderTable(patientDatabase);

    // 3. Inicializar Listeners Globales para Modales
    initModalListeners();
    initReportEditorLogic();
    initAdminUI();

    // 4. Conectar Eventos de la Tabla
    const btnBuscar = document.getElementById('btnBuscarReportes');
    if (btnBuscar) {
        btnBuscar.addEventListener('click', applyFilters);
    }

    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            setCurrentService(button.getAttribute('data-service'));
            applyFilters();
        });
    });

    // Enlazar botones de registro de pacientes
    const btnNuevoPaciente = document.getElementById('btnNuevoPaciente');
    if (btnNuevoPaciente) {
        btnNuevoPaciente.addEventListener('click', () => {
            openModal('registrationModalOverlay');
        });
    }

    const btnSidebarRegistro = document.getElementById('sidebarBtnRegistroPacientes');
    if (btnSidebarRegistro) {
        btnSidebarRegistro.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('registrationModalOverlay');
        });
    }
    
    // Conectar botones de cierre de modal de registro
    const closeHeaderBtn = document.getElementById('closeHeaderBtn');
    if (closeHeaderBtn) {
        closeHeaderBtn.addEventListener('click', () => {
            closeModal('registrationModalOverlay');
        });
    }
    const btnSalir = document.getElementById('m_btnSalir');
    if (btnSalir) {
        btnSalir.addEventListener('click', () => {
            closeModal('registrationModalOverlay');
        });
    }

    // 5. Exponer funciones vitales globalmente (Safe Fallback para onClick HTML legacy)
    window.handleAction = (action, codAtencion) => {
        if (action === 'pdf') {
            openPrintWindow(codAtencion);
        } else if (action === 'editar' || action === 'ver') {
            console.log(`Abriendo modal para ${action} el código ${codAtencion}`);
            const populated = populateEditorModal(codAtencion);
            if (populated) {
                openModal('reportEditorModalOverlay');
            }
        }
    };

    // 6. Lógica de Cambio de Vistas (Navegación Lateral)
    const navButtons = document.querySelectorAll('.nav-item-btn[data-target], a.nav-item-btn[href="reportes.html"]');
    const views = {
        'usuario': 'view-users',
        'plantilla': 'view-templates',
        'doctor': 'view-doctors',
        'pacientes': 'view-patients'
    };

    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Evitar comportamiento por defecto y detener propagación (para anular script.js legacy)
            e.preventDefault();
            e.stopImmediatePropagation();

            // Identificar el target (si es el enlace de pacientes, target es 'pacientes')
            let target = btn.getAttribute('data-target');
            if (!target && btn.getAttribute('href') === 'reportes.html') {
                target = 'pacientes';
            }

            if (target && views[target]) {
                // Actualizar estado activo en botones
                navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Ocultar todas las vistas
                Object.values(views).forEach(viewId => {
                    const viewEl = document.getElementById(viewId);
                    if (viewEl) {
                        viewEl.style.display = 'none';
                        viewEl.classList.remove('active');
                    }
                });

                // Mostrar la vista seleccionada
                const selectedView = document.getElementById(views[target]);
                if (selectedView) {
                    selectedView.style.display = '';
                    selectedView.classList.add('active');
                }
            }
        });
    });

    window.startRecording = (inputId) => {
        startDictation(inputId);
    };

    console.log("[Core] Sistema Modular V2 En Línea. Velocidad optimizada.");
});
