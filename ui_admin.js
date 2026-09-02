// main.js\\r\r
// PROTOCOLO ACTOR-CRITICO: Orquestador Principal (Punto de Entrada Modular)\\r\r
\\r\r
import { initLocalDatabases, patientDatabase, loadDoctorsData, doctorsDatabase, categoriesDatabase, templatesDatabase, sortPatientArray, triggerAutomaticBackup, syncPatientsFromSupabase, syncTemplatesFromSupabase, syncCategoriesFromSupabase, subscribePatientsRealtime, savePatient, deletePatient, updateSyncStatusUI, fetchFullPatientDetails, processSyncQueue, uploadAllLocalReportsToSupabase } from './db_service.js?v=22.00';\\r\r
import { initTableUI, renderTable, applyFilters, setCurrentService } from './ui_tables.js?v=22.00';\\r\r
import { initModalListeners, openModal, closeModal } from './ui_editor.js?v=22.00';\\r\r
import { openPrintWindow } from './pdf_engine.js?v=22.00';\\r\r
import { initDictaphone, startDictation } from './dictaphone_core.js?v=22.00';\\r\r
import { initReportEditorLogic, populateEditorModal } from './ui_report_editor.js?v=22.00';\\r\r
import { initAdminUI, populateModalDoctorsSelect } from './ui_admin.js?v=22.00';\\r\r
\\r\r
\\r\r
function initMainApp() {\\r\r
    // Aplicar tema guardado al cargar\\r\r
    const savedTheme = localStorage.getItem('appTheme') || 'dark';\\r\r
    if (savedTheme === 'light') {\\r\r
        document.body.classList.add('light-theme');\\r\r
    }\\r\r
\\r\r
    // 0. Control de Acceso (RBAC) y Redirecci\\u00f3n\\r\r
    let currentUser = null;\r
    try {\r
        currentUser = JSON.parse(localStorage.getItem('currentUser'));\r
    } catch (eUser) {\r
        currentUser = null;\r
    }\r
    if (!currentUser) {\r
        window.location.href = 'login.html';\r
        return;\r
            actualBtn.classList.add('active');\r
\r
            document.querySelectorAll('.dashboard-view, .dashboard-section, #view-patients, #view-templates, #view-users, #view-doctors, #view-contaduria').forEach(view => {\r
                view.style.display = 'none';\r
            });\r
\r
            if (target === 'pacientes') {\r
                const v = document.getElementById('view-patients');\r
                if (v) v.style.display = 'block';\r
                if (typeof window.applyFilters === 'function') {\r
                    window.applyFilters(false);\r
                } else if (typeof applyFilters === 'function') {\r
                    applyFilters(false);\r
                }\r
            } else if (target === 'doctor') {\r
                const v = document.getElementById('view-doctors');\r
                if (v) v.style.display = 'block';\r
                loadDoctorsData();\r
            } else if (target === 'usuario') {\r
                const v = document.getElementById('view-users');\r
                if (v) v.style.display = 'block';\r
                loadUsersData();\r
            } else if (target === 'plantilla' || target === 'template') {\r
                const v = document.getElementById('view-templates');\r
                if (v) v.style.display = 'block';\r
                loadCategoriesData();\r
            } else if (target === 'contaduria') {\r
                const v = document.getElementById('view-contaduria');\r
                if (v) v.style.display = 'block';\r
                loadContaduriaData();\r
            }\r
        });\r
    });\r
\r
    const contaduriaSearchInput = document.getElementById('contaduriaSearchInput');\r
    if (contaduriaSearchInput) contaduriaSearchInput.addEventListener('input', applyContaduriaFilters);\r
\r
    const contaduriaPageLength = document.getElementById('contaduriaPageLength');\r
    if (contaduriaPageLength) contaduriaPageLength.addEventListener('change', renderContaduriaTable);\r
\r
    document.querySelectorAll('#contaduriaTabsNav button[data-contaduria-service]').forEach(btn => {\r
        btn.addEventListener('click', () => {\r
            document.querySelectorAll('#contaduriaTabsNav button').forEach(b => b.classList.remove('active'));\r
            btn.classList.add('active');\r
            setContaduriaService(btn.getAttribute('data-contaduria-service'));\r
        });\r
    });\r
\r
    const doctorsSearchInput = document.getElementById('doctorsSearchInput');\r
    if (doctorsSearchInput) doctorsSearchInput.addEventListener('input', applyDoctorFilters);\r
\r
    const doctorsPageLength = document.getElementById('doctorsPageLength');\r
    if (doctorsPageLength) doctorsPageLength.addEventListener('change', renderDoctorsTable);\r
\r
    const btnNuevoDoctor = document.getElementById('btnNuevoDoctor');\r
    if (btnNuevoDoctor) btnNuevoDoctor.addEventListener('click', () => openDoctorModal());\r
\r
    const closeDoctorModalBtn = document.getElementById('closeDoctorModalBtn');\r
    if (closeDoctorModalBtn) closeDoctorModalBtn.addEventListener('click', closeDoctorModal);\r
\r
    const btnCancelarDoctor = document.getElementById('btnCancelarDoctor');\r
    if (btnCancelarDoctor) btnCancelarDoctor.addEventListener('click', closeDoctorModal);\r
\r
    const doctorForm = document.getElementById('doctorForm');\r
    if (doctorForm) {\r
        doctorForm.addEventListener('submit', (e) => {\r
            e.preventDefault();\r
            saveDoctorData();\r
        });\r
    }\r
\r
    // 1. Inicializar Bases de Datos e Interfaz de Tabla\r
    initLocalDatabases();\r
    initTableUI('tableBody');\r
    window.patientDatabase = patientDatabase;\r
    window.doctorsDatabase = doctorsDatabase;\r
    window.categoriesDatabase = categoriesDatabase;\r
    window.templatesDatabase = templatesDatabase;\r
    window.sortPatientArray = sortPatientArray;\r
    window.populateModalDoctorsSelect = populateModalDoctorsSelect;\r
    window.triggerAutomaticBackup = triggerAutomaticBackup;\r
    window.savePatient = savePatient;\r
    window.deletePatient = deletePatient;\r
    window.uploadAllLocalReportsToSupabase = uploadAllLocalReportsToSupabase;\r
    window.applyFilters = applyFilters;\r
    window.refreshPatientTable = () => {\r
        applyFilters(false);\r
        if (typeof window.loadContaduriaData === 'function') {\r
            window.loadContaduriaData();\r
        }\r
    };\r
\r
    // Renderizar de inmediato la tabla con los datos locales para eliminar "Cargando registros..." al instante (0ms)\r
    try {\r
        applyFilters(false);\r
    } catch (e) {\r
        console.error("[Main Engine] Error en renderizado inicial local:", e);\r
    }\r
    window.closeModal = closeModal;\r
    window.openModal = openModal;\r
    window.handleAction = (action, codAtencion) => {\r
        if (action === 'descargar_pdf') {\r
            openPrintWindow(codAtencion, true);\r
        } else if (action === 'pdf') {\r
            openPrintWindow(codAtencion, false);\r
        } else if (action === 'editar' || action === 'ver') {\r
            console.log(`Abriendo modal para ${action} el código ${codAtencion}`);\r
            (async () => {\r
                let fullPatient = null;\r
                try {\r
                    fullPatient = await fetchFullPatientDetails(codAtencion);\r
                } catch (e) {\r
                    console.error("Error cargando detalles del paciente:", e);\r
                }\r
\r
                if (!fullPatient) {\r
                    const cleanCode = String(codAtencion || '').trim().toLowerCase();\r
                    const cleanNoHyphen = cleanCode.replace(/[-_\\s]/g, '');\r
                    fullPatient = patientDatabase.find(x => {\r
                        const code = String(x.codAtencion || '').trim().toLowerCase();\r
                        return code === cleanCode || code.replace(/[-_\\s]/g, '') === cleanNoHyphen;\r
                    });\r
                }\r
\r
                if (!fullPatient) {\r
                    fullPatient = { codAtencion: codAtencion };\r
                }\r
\r
                populateEditorModal(fullPatient);\r
                openModal('reportEditorModalOverlay');\r
            })();\r
        } else if (action === 'eliminar') {\r
            if (confirm(`¿Está seguro de eliminar el registro del paciente con código ${codAtencion}?`)) {\r
                deletePatient(codAtencion);\r
                if (typeof showToast === 'function') showToast("Paciente eliminado con éxito.", "success");\r
            }\r
        } else if (action === 'solicitar_correccion') {\r
            const nuevoNombre = prompt("Ingrese el nombre corregido del paciente:");\r
            if (!nuevoNombre || !nuevoNombre.trim()) return;\r
            const paciente = patientDatabase.find(p => String(p.codAtencion) === String(codAtencion));\r
            if (paciente) {\r
                paciente.solicitud_correccion = {\r
                    nombre_solicitado: nuevoNombre.trim().toUpperCase(),\r
                    fecha_solicitud: new Date().toISOString(),\r
                    estado: 'pendiente'\r
                };\r
                savePatient(paciente);\r
                if (typeof showToast === 'function') showToast("Solicitud de corrección enviada con éxito al patólogo", "success");\r
                if (typeof renderTable === 'function') renderTable();\r
            }\r
        } else if (action === 'editar_restringido') {\r
            (async () => {\r
                let fullPatient = await fetchFullPatientDetails(codAtencion) || { codAtencion: codAtencion };\r
                populateEditorModal(fullPatient);\r
                openModal('reportEditorModalOverlay');\r
                \r
                // Bloquear todos los campos excepto Nombre y Fechas para usuarios de clínica\r
                const reMacro = document.getElementById('re_macroDesc');\r
                const reMicro = document.getElementById('re_microDesc');\r
                const reDiag = document.getElementById('re_diagnostico');\r
                const btnFirma = document.getElementById('reBtnFirma');\r
                \r
                if (reMacro) reMacro.contentEditable = "false";\r
                if (reMicro) reMicro.contentEditable = "false";\r
                if (reDiag) reDiag.contentEditable = "false";\r
                if (btnFirma) btnFirma.style.display = "none";\r
                if (typeof showToast === 'function') showToast("Modo Edición Restringida: Solo Nombre y Fechas permitidos", "info");\r
            })();\r
        }\r
    };\r
\r
    window.aceptarCorreccionYRefirmar = function(codAtencion) {\r
        const paciente = patientDatabase.find(p => String(p.codAtencion) === String(codAtencion));\r
        if (paciente && paciente.solicitud_correccion) {\r
            const nombreNuevo = paciente.solicitud_correccion.nombre_solicitado;\r
            paciente.paciente = nombreNuevo;\r
            paciente.firmado = true;\r
            paciente.estado = 'Completado';\r
            paciente.solicitud_correccion.estado = 'aprobado';\r
            savePatient(paciente);\r
            if (typeof showToast === 'function') showToast(`Nombre corregido a "${nombreNuevo}" y re-firmado en 0.5s`, "success");\r
            if (typeof renderTable === 'function') renderTable();\r
        }\r
    };\r
\r
    window.rechazarCorreccion = function(codAtencion) {\r
        const paciente = patientDatabase.find(p => String(p.codAtencion) === String(codAtencion));\r
        if (paciente && paciente.solicitud_correccion) {\r
            paciente.solicitud_correccion.estado = 'rechazado';\r
            savePatient(paciente);\r
            if (typeof showToast === 'function') showToast("Solicitud de corrección rechazada", "info");\r
            if (typeof renderTable === 'function') renderTable();\r
        }\r
    };\r
\r
    // Sincronización ultrarrápida: 1. Carga incremental inicial de los últimos 150 registros (0.3s)\r
    let lastFocusSyncTime = Date.now();\r
    syncPatientsFromSupabase(150);\r
    syncTemplatesFromSupabase();\r
    syncCategoriesFromSupabase();\r
    subscribePatientsRealtime();\r
    updateSyncStatusUI();\r
\r
    // 2. Carga en segundo plano del histórico completo y auto-subida masiva de registros locales atrapados\r
    setTimeout(() => {\r
        syncPatientsFromSupabase();\r
        if (typeof forcePushAllLocalPatientsToCloud === 'function') {\r
            forcePushAllLocalPatientsToCloud();\r
        }\r
    }, 1800);\r
\r
    // 3. LATIDO DE CORAZÓN AUTOMÁTICO (Heartbeat de Grado Militar cada 15s)\r
    // Garantiza que registros creados en otras computadoras aparezcan de inmediato sin necesidad de hacer clic ni cambiar de pestaña\r
    setInterval(() => {\r
        if (navigator.onLine) {\r
            processSyncQueue();\r
            syncPatientsFromSupabase(150);\r
        }\r
    }, 15000);\r
\r
    // Auto-refresco inteligente al conectarse o cambiar de pestaña (con control anti-spam de 60s)\r