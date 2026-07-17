// main.js
// PROTOCOLO ACTOR-CRITICO: Orquestador Principal (Punto de Entrada Modular)

import { initLocalDatabases, patientDatabase, loadDoctorsData, doctorsDatabase, categoriesDatabase, templatesDatabase, triggerAutomaticBackup, syncPatientsFromSupabase, subscribePatientsRealtime } from './db_service.js?v=3.5';
import { initTableUI, renderTable, applyFilters, setCurrentService } from './ui_tables.js?v=3.5';
import { initModalListeners, openModal, closeModal } from './ui_editor.js?v=3.5';
import { openPrintWindow } from './pdf_engine.js?v=3.5';
import { initDictaphone, startDictation } from './dictaphone_core.js?v=3.5';
import { initReportEditorLogic, populateEditorModal } from './ui_report_editor.js?v=3.5';
import { initAdminUI, populateModalDoctorsSelect } from './ui_admin.js?v=3.5';

document.addEventListener('DOMContentLoaded', () => {
    console.log("[Core] Inicializando Sistema Modular V2...");

    // 1. Inicializar Bases de Datos
    initLocalDatabases();
    window.patientDatabase = patientDatabase;
    window.doctorsDatabase = doctorsDatabase;
    window.categoriesDatabase = categoriesDatabase;
    window.templatesDatabase = templatesDatabase;
    window.populateModalDoctorsSelect = populateModalDoctorsSelect;
    window.triggerAutomaticBackup = triggerAutomaticBackup;
    window.refreshPatientTable = () => renderTable(patientDatabase);
    window.closeModal = closeModal;
    window.openModal = openModal;

    // Sincronizar desde la nube asíncronamente
    syncPatientsFromSupabase();
    subscribePatientsRealtime();

    // Cargar médicos y poblar datalists de autocompletado
    loadDoctorsData().then(() => {
        populateModalDoctorsSelect();
    }).catch(err => {
        console.error("[Core] Error al cargar médicos para autocompletar:", err);
    });

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

    // Enlazar botón de respaldo de pacientes
    const btnRespaldoPacientes = document.getElementById('btnRespaldoPacientes');
    if (btnRespaldoPacientes) {
        btnRespaldoPacientes.addEventListener('click', () => {
            try {
                const backupData = JSON.stringify(patientDatabase, null, 2);
                const blob = new Blob([backupData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `respaldo_pacientes_${new Date().toISOString().slice(0, 10)}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('Respaldo JSON descargado con éxito', 'success');
            } catch(e) {
                console.error(e);
                showToast('Error al generar el respaldo', 'error');
            }
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
        } else if (action === 'eliminar') {
            if (confirm(`¿Está seguro de eliminar el registro del paciente con código ${codAtencion}?`)) {
                const idx = patientDatabase.findIndex(p => p.codAtencion === codAtencion);
                if (idx !== -1) {
                    patientDatabase.splice(idx, 1);
                }
                
                if (typeof window.triggerAutomaticBackup === 'function') {
                    window.triggerAutomaticBackup();
                }
                
                if (typeof window.refreshPatientTable === 'function') {
                    window.refreshPatientTable();
                }

                if (window.supabase && typeof window.SUPABASE_CONFIG !== 'undefined') {
                    window.supabase
                        .from('pacientes')
                        .delete()
                        .eq('cod_atencion', codAtencion)
                        .then(({ error }) => {
                            if (error) {
                                console.error("Error al eliminar paciente en Supabase:", error);
                                if (typeof showToast === 'function') showToast("Error al eliminar de la nube.", "error");
                            } else {
                                if (typeof showToast === 'function') showToast("Paciente eliminado de la nube con éxito.", "success");
                            }
                        });
                } else {
                    if (typeof showToast === 'function') showToast("Paciente eliminado localmente con éxito.", "success");
                }
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
    window.toggleDictation = (inputId) => {
        startDictation(inputId);
    };

    console.log("[Core] Sistema Modular V2 En Línea. Velocidad optimizada.");
});
