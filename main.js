// main.js
// PROTOCOLO ACTOR-CRITICO: Orquestador Principal (Punto de Entrada Modular)

import { initLocalDatabases, patientDatabase, loadDoctorsData, doctorsDatabase, categoriesDatabase, templatesDatabase, sortPatientArray, triggerAutomaticBackup, syncPatientsFromSupabase, syncTemplatesFromSupabase, syncCategoriesFromSupabase, subscribePatientsRealtime, savePatient, deletePatient, updateSyncStatusUI, fetchFullPatientDetails, processSyncQueue } from './db_service.js?v=22.00';
import { initTableUI, renderTable, applyFilters, setCurrentService } from './ui_tables.js?v=22.00';
import { initModalListeners, openModal, closeModal } from './ui_editor.js?v=22.00';
import { openPrintWindow } from './pdf_engine.js?v=22.00';
import { initDictaphone, startDictation } from './dictaphone_core.js?v=22.00';
import { initReportEditorLogic, populateEditorModal } from './ui_report_editor.js?v=22.00';
import { initAdminUI, populateModalDoctorsSelect } from './ui_admin.js?v=22.00';


function initMainApp() {
    // Aplicar tema guardado al cargar
    const savedTheme = localStorage.getItem('appTheme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }

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
        let name = currentUser.nombres || '';
        name = name.replace('JOSEPH', 'JOSEHP').replace('CRISTOPHER', 'CHRISTOPHER');
        welcomeText.textContent = name;
    }

    // Añadir botón de Cerrar Sesión y Cambiar Tema en la cabecera
    const headerRight = document.querySelector('.header-right');
    if (headerRight) {
        if (!document.getElementById('btnThemeToggle')) {
            const themeBtn = document.createElement('button');
            themeBtn.id = 'btnThemeToggle';
            themeBtn.className = 'header-utility-btn';
            themeBtn.title = 'Alternar Tema Claro/Oscuro';
            themeBtn.style.marginLeft = '10px';

            const savedTheme = localStorage.getItem('appTheme') || 'dark';
            if (savedTheme === 'light') {
                themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
            } else {
                themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
            }

            themeBtn.addEventListener('click', () => {
                const isLight = document.body.classList.toggle('light-theme');
                localStorage.setItem('appTheme', isLight ? 'light' : 'dark');
                themeBtn.innerHTML = isLight ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
                if (typeof showToast === 'function') {
                    showToast(isLight ? "Modo Claro activado" : "Modo Oscuro activado", "info");
                }
            });
            headerRight.appendChild(themeBtn);
        }

        if (!document.getElementById('btnLogout')) {
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
    }

    console.log("[Core] Inicializando Sistema Modular V2...");

    // 1. Inicializar Bases de Datos e Interfaz de Tabla
    initLocalDatabases();
    initTableUI('tableBody');
    window.patientDatabase = patientDatabase;
    window.doctorsDatabase = doctorsDatabase;
    window.categoriesDatabase = categoriesDatabase;
    window.templatesDatabase = templatesDatabase;
    window.sortPatientArray = sortPatientArray;
    window.populateModalDoctorsSelect = populateModalDoctorsSelect;
    window.triggerAutomaticBackup = triggerAutomaticBackup;
    window.savePatient = savePatient;
    window.deletePatient = deletePatient;
    window.applyFilters = applyFilters;
    window.refreshPatientTable = () => {
        applyFilters(false);
        if (typeof window.loadContaduriaData === 'function') {
            window.loadContaduriaData();
        }
    };

    // Renderizar de inmediato la tabla con los datos locales para eliminar "Cargando registros..." al instante (0ms)
    try {
        applyFilters(false);
    } catch (e) {
        console.error("[Main Engine] Error en renderizado inicial local:", e);
    }
    window.closeModal = closeModal;
    window.openModal = openModal;
    window.handleAction = (action, codAtencion) => {
        if (action === 'descargar_pdf') {
            openPrintWindow(codAtencion, true);
        } else if (action === 'pdf') {
            openPrintWindow(codAtencion, false);
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

    // Sincronización ultrarrápida: 1. Carga incremental inicial de los últimos 150 registros (0.3s)
    let lastFocusSyncTime = Date.now();
    syncPatientsFromSupabase(150);
    syncTemplatesFromSupabase();
    syncCategoriesFromSupabase();
    subscribePatientsRealtime();
    updateSyncStatusUI();

    // 2. Carga en segundo plano del histórico completo y auto-subida masiva de registros locales atrapados
    setTimeout(() => {
        syncPatientsFromSupabase();
        if (typeof forcePushAllLocalPatientsToCloud === 'function') {
            forcePushAllLocalPatientsToCloud();
        }
    }, 1800);

    // 3. LATIDO DE CORAZÓN AUTOMÁTICO (Heartbeat de Grado Militar cada 15s)
    // Garantiza que registros creados en otras computadoras aparezcan de inmediato sin necesidad de hacer clic ni cambiar de pestaña
    setInterval(() => {
        if (navigator.onLine) {
            processSyncQueue();
            syncPatientsFromSupabase(150);
        }
    }, 15000);

    // Auto-refresco inteligente al conectarse o cambiar de pestaña (con control anti-spam de 60s)
    window.addEventListener('online', () => {
        console.log("[Network] Conexión restablecida. Procesando cola y sincronizando...");
        processSyncQueue();
        syncPatientsFromSupabase(150);
        lastFocusSyncTime = Date.now();
    });
    window.addEventListener('focus', () => {
        processSyncQueue();
        if (Date.now() - lastFocusSyncTime > 15000) {
            lastFocusSyncTime = Date.now();
            syncPatientsFromSupabase(150);
        }
    });
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (typeof applyFilters === 'function') applyFilters(false);
        }, 150);
    });
    // Sincronización periódica de respaldo preventiva cada 10 minutos (WebSocket maneja tiempo real)
    setInterval(() => {
        if (navigator.onLine) {
            syncPatientsFromSupabase(150);
        }
    }, 600000);

    // Cargar médicos y poblar datalists de autocompletado
    loadDoctorsData().then(() => {
        populateModalDoctorsSelect();
    }).catch(err => {
        console.error("[Core] Error al cargar médicos para autocompletar:", err);
    });

    // 2. Inicializar Interfaz (UI)
    initTableUI('tableBody');
    try {
        applyFilters(false);
    } catch (err) {
        console.error("[Core] Error en applyFilters inicial:", err);
    }

    // 3. Inicializar Listeners Globales para Modales
    initModalListeners();
    initReportEditorLogic();
    initAdminUI();

    if (typeof window.loadContaduriaData === 'function') {
        window.loadContaduriaData();
    }

    // 4. Conectar Eventos de la Tabla
    const btnBuscar = document.getElementById('btnBuscarReportes');
    if (btnBuscar) {
        btnBuscar.addEventListener('click', () => applyFilters(true));
    }

    // Filtrado automático instantáneo con debounce suave de 150ms al escribir
    let filterDebounceTimer = null;
    const filterInputIds = ['codAtencion', 'nomPaciente', 'apePaciente', 'dni', 'medSolicitante', 'filterClinica', 'fecInicio', 'fecFinal'];
    filterInputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                clearTimeout(filterDebounceTimer);
                filterDebounceTimer = setTimeout(() => {
                    applyFilters(true);
                }, 150);
            });
        }
    });

    // Manejo automático de campo Edad (-- si se deja en blanco al pasar a otra casilla)
    ['m_edad', 're_edad'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('blur', () => {
                const val = el.value.trim();
                if (!val || val === '0') {
                    el.value = '--';
                }
            });
            el.addEventListener('focus', () => {
                if (el.value.trim() === '--') {
                    el.value = '';
                }
            });
        }
    });

    // Restricción estricta de SOLO NÚMEROS para campos de DNI (máximo 8 dígitos)
    ['dni', 'm_dni', 're_dni'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const sanitize = () => {
                el.value = el.value.replace(/[^0-9]/g, '').slice(0, 8);
            };
            el.addEventListener('input', sanitize);
            el.addEventListener('keyup', sanitize);
            el.addEventListener('paste', () => setTimeout(sanitize, 0));
        }
    });

    let lastTabSyncTime = 0;
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            setCurrentService(button.getAttribute('data-service'));
            applyFilters();
            // Cargar últimos cambios en segundo plano al cambiar de servicio (optimizado con throttle de 15 segundos)
            const now = Date.now();
            if (now - lastTabSyncTime > 15000) {
                lastTabSyncTime = now;
                syncPatientsFromSupabase();
            }
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


    // 6. Soporte para apertura directa de vista o editor por parámetros URL
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    if (viewParam) {
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

    // Manejar colapso de filtros en móvil
    const btnToggleFilters = document.getElementById('btnToggleFilters');
    const filterForm = document.getElementById('filterForm');
    if (btnToggleFilters && filterForm) {
        btnToggleFilters.addEventListener('click', () => {
            const isCollapsed = filterForm.classList.toggle('collapsed');
            const spanText = btnToggleFilters.querySelector('span');
            if (spanText) {
                spanText.textContent = isCollapsed ? 'MOSTRAR FILTROS DE BÚSQUEDA' : 'OCULTAR FILTROS DE BÚSQUEDA';
            }
        });
    }

    console.log("[Core] Sistema Modular V2 En Línea. Velocidad optimizada.");
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMainApp);
} else {
    initMainApp();
}
