// main.js
// PROTOCOLO ACTOR-CRITICO: Orquestador Principal (Punto de Entrada Modular)

import { initLocalDatabases, patientDatabase, loadDoctorsData, doctorsDatabase, categoriesDatabase, templatesDatabase, triggerAutomaticBackup, syncPatientsFromSupabase, subscribePatientsRealtime, savePatient, deletePatient, updateSyncStatusUI, fetchFullPatientDetails } from './db_service.js?v=3.8';
import { initTableUI, renderTable, applyFilters, setCurrentService } from './ui_tables.js?v=3.8';
import { initModalListeners, openModal, closeModal } from './ui_editor.js?v=3.8';
import { openPrintWindow } from './pdf_engine.js?v=3.8';
import { initDictaphone, startDictation } from './dictaphone_core.js?v=3.8';
import { initReportEditorLogic, populateEditorModal } from './ui_report_editor.js?v=3.8';
import { initAdminUI, populateModalDoctorsSelect } from './ui_admin.js?v=3.8';

document.addEventListener('DOMContentLoaded', () => {
    // 0. Control de Acceso (RBAC) y Redirección
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Configurar clase en body para ocultar elementos marcados con .admin-only por CSS
    if (currentUser.perfil === 'Usuario') {
        document.body.classList.add('role-clinic');
    }

    // Personalizar cabecera con el nombre de usuario
    const welcomeText = document.querySelector('.welcome-text strong');
    if (welcomeText) {
        welcomeText.textContent = currentUser.nombres;
    }

    // Añadir botón de Cerrar Sesión en cabecera
    const headerRight = document.querySelector('.header-right');
    if (headerRight && !document.getElementById('btnLogout')) {
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'btnLogout';
        logoutBtn.className = 'header-utility-btn';
        logoutBtn.title = 'Cerrar Sesión';
        logoutBtn.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i>';
        logoutBtn.style.marginLeft = '10px';
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
        headerRight.appendChild(logoutBtn);
    }

    console.log("[Core] Inicializando Sistema Modular V2...");

    // 1. Inicializar Bases de Datos
    initLocalDatabases();
    window.patientDatabase = patientDatabase;
    window.doctorsDatabase = doctorsDatabase;
    window.categoriesDatabase = categoriesDatabase;
    window.templatesDatabase = templatesDatabase;
    window.populateModalDoctorsSelect = populateModalDoctorsSelect;
    window.triggerAutomaticBackup = triggerAutomaticBackup;
    window.savePatient = savePatient;
    window.deletePatient = deletePatient;
    window.refreshPatientTable = () => renderTable(patientDatabase);
    window.closeModal = closeModal;
    window.openModal = openModal;
    window.handleAction = (action, codAtencion) => {
        if (action === 'pdf') {
            openPrintWindow(codAtencion);
        } else if (action === 'editar' || action === 'ver') {
            console.log(`Abriendo modal para ${action} el código ${codAtencion}`);
            (async () => {
                let fullPatient = null;
                try {
                    fullPatient = await fetchFullPatientDetails(codAtencion);
                } catch (e) {
                    console.error("Error cargando detalles del paciente:", e);
                }

                if (!fullPatient) {
                    const cleanCode = String(codAtencion || '').trim().toLowerCase();
                    const cleanNoHyphen = cleanCode.replace(/[-_\s]/g, '');
                    fullPatient = patientDatabase.find(x => {
                        const code = String(x.codAtencion || '').trim().toLowerCase();
                        return code === cleanCode || code.replace(/[-_\s]/g, '') === cleanNoHyphen;
                    });
                }

                if (!fullPatient) {
                    fullPatient = { codAtencion: codAtencion };
                }

                populateEditorModal(fullPatient);
                openModal('reportEditorModalOverlay');
            })();
        } else if (action === 'eliminar') {
            if (confirm(`¿Está seguro de eliminar el registro del paciente con código ${codAtencion}?`)) {
                deletePatient(codAtencion);
                if (typeof showToast === 'function') showToast("Paciente eliminado con éxito.", "success");
            }
        }
    };

    // Sincronizar desde la nube asíncronamente
    syncPatientsFromSupabase();
    subscribePatientsRealtime();
    updateSyncStatusUI();

    // Auto-refresco multi-dispositivo para clínicas en tiempo real (al volver a la pestaña o cada 20s)
    window.addEventListener('focus', () => {
        syncPatientsFromSupabase();
    });
    setInterval(() => {
        syncPatientsFromSupabase();
    }, 20000);

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

    // Soporte para apertura directa de vista o editor por parámetros URL
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    if (viewParam && views[viewParam]) {
        const targetBtn = document.querySelector(`.nav-item-btn[data-target="${viewParam}"]`);
        if (targetBtn) {
            targetBtn.click();
        }
    }
    const editCod = urlParams.get('edit');
    if (editCod) {
        setTimeout(() => {
            if (typeof window.handleAction === 'function') {
                window.handleAction('editar', editCod);
            }
        }, 300);
    }

    window.startRecording = (inputId) => {
        startDictation(inputId);
    };
    window.toggleDictation = (inputId) => {
        startDictation(inputId);
    };

    // Alerta de prevención de pérdida de datos por cierre de ventana con cola de sync activa
    window.addEventListener('beforeunload', (e) => {
        try {
            const queue = JSON.parse(localStorage.getItem('pendingSyncWrites')) || [];
            if (queue.length > 0) {
                e.preventDefault();
                e.returnValue = 'Tiene cambios pendientes de guardar en Supabase. Si cierra la página ahora, se podrían perder los últimos cambios en otros dispositivos.';
                return e.returnValue;
            }
        } catch(err) {
            console.error(err);
        }
    });

    console.log("[Core] Sistema Modular V2 En Línea. Velocidad optimizada.");
});
