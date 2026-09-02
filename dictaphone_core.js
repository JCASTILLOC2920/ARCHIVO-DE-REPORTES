// main.js\\\\r\\r\r
// PROTOCOLO ACTOR-CRITICO: Orquestador Principal (Punto de Entrada Modular)\\\\r\\r\r
\\\\r\\r\r
\\\\r\\r\r
\\\\r\\r\r
export function initMainApp() {\\\\r\\r\r
    // Aplicar tema guardado al cargar\\\\r\\r\r
    const savedTheme = localStorage.getItem('appTheme') || 'dark';\\\\r\\r\r
    if (savedTheme === 'light') {\\\\r\\r\r
        document.body.classList.add('light-theme');\\\\r\\r\r
    }\\\\r\\r\r
\\\\r\\r\r
    // 0. Control de Acceso (RBAC) y Redirecci\\\\u00f3n\\\\r\\r\r
    let currentUser = null;\r
    try {\r
        currentUser = JSON.parse(localStorage.getItem('currentUser'));\r
    } catch (eUser) {\r
        currentUser = null;\r
    }\r
    if (!currentUser) {\r
        window.location.href = 'login.html';\r
        return;\r
    }\r
\r
    // Configurar clase en body para ocultar elementos marcados con .admin-only por CSS\r
    if (currentUser.perfil === 'Usuario') {\r
        document.body.classList.add('role-clinic');\r
    }\r
\r
    // Personalizar cabecera con el nombre de usuario\r
    const welcomeText = document.querySelector('.welcome-text strong');\r
    if (welcomeText) {\r
        let name = currentUser.nombres || '';\r
        name = name.replace('JOSEPH', 'JOSEHP').replace('CRISTOPHER', 'CHRISTOPHER');\r
        welcomeText.textContent = name;\r
    }\r
\r
    // Añadir botón de Cerrar Sesión y Cambiar Tema en la cabecera\r
    const headerRight = document.querySelector('.header-right');\r
    if (headerRight) {\r
        if (!document.getElementById('btnThemeToggle')) {\r
            const themeBtn = document.createElement('button');\r
            themeBtn.id = 'btnThemeToggle';\r
            themeBtn.className = 'header-utility-btn';\r
            themeBtn.title = 'Alternar Tema Claro/Oscuro';\r
            themeBtn.style.marginLeft = '10px';\r
\r
            const savedTheme = localStorage.getItem('appTheme') || 'dark';\r
            if (savedTheme === 'light') {\r
                themeBtn.innerHTML = '<i class=\"fa-solid fa-moon\"></i>';\r
            } else {\r
                themeBtn.innerHTML = '<i class=\"fa-solid fa-sun\"></i>';\r
            }\r
\r
            themeBtn.addEventListener('click', () => {\r
                const isLight = document.body.classList.toggle('light-theme');\r
                localStorage.setItem('appTheme', isLight ? 'light' : 'dark');\r
                themeBtn.innerHTML = isLight ? '<i class=\"fa-solid fa-moon\"></i>' : '<i class=\"fa-solid fa-sun\"></i>';\r
                if (typeof showToast === 'function') {\r
                    showToast(isLight ? \"Modo Claro activado\" : \"Modo Oscuro activado\", \"info\");\r
                }\r
            });\r
            headerRight.appendChild(themeBtn);\r
        }\r
\r
        if (!document.getElementById('btnLogout')) {\r
            const logoutBtn = document.createElement('button');\r
            logoutBtn.id = 'btnLogout';\r
            logoutBtn.className = 'header-utility-btn';\r
            logoutBtn.title = 'Cerrar Sesión';\r
            logoutBtn.innerHTML = '<i class=\"fa-solid fa-right-from-bracket\"></i>';\r
            logoutBtn.style.marginLeft = '10px';\r
            logoutBtn.addEventListener('click', () => {\r
                localStorage.removeItem('currentUser');\r
                window.location.href = 'login.html';\r
            });\r
            headerRight.appendChild(logoutBtn);\r
        }\r
\r
        const dbBtn = document.querySelector('button[aria-label=\"Base de datos\"]');\r
        if (dbBtn) {\r
            dbBtn.title = \"Sincronizar y Subir Todos los Reportes a la Nube (Supabase)\";\r
            dbBtn.addEventListener('click', async () => {\r
                if (typeof showToast === 'function') showToast(\"Sincronizando reportes locales con la nube...\", \"info\");\r
                await uploadAllLocalReportsToSupabase();\r
                await syncPatientsFromSupabase();\r
                applyFilters(false);\r
            });\r
        }\r
    }\r
\r
    console.log(\"[Core] Inicializando Sistema Modular V2...\");\r
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
    // Renderizar de inmediato la tabla con los datos locales para eliminar \"Cargando registros...\" al instante (0ms)\r
    try {\r
        applyFilters(false);\r
    } catch (e) {\r
        console.error(\"[Main Engine] Error en renderizado inicial local:\", e);\r
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
                    console.error(\"Error cargando detalles del paciente:\", e);\r
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
                if (typeof showToast === 'function') showToast(\"Paciente eliminado con éxito.\", \"success\");\r
            }\r
        } else if (action === 'solicitar_correccion') {\r
            const nuevoNombre = prompt(\"Ingrese el nombre corregido del paciente:\");\r
            if (!nuevoNombre || !nuevoNombre.trim()) return;\r
            const paciente = patientDatabase.find(p => String(p.codAtencion) === String(codAtencion));\r
            if (paciente) {\r
                paciente.solicitud_correccion = {\r
                    nombre_solicitado: nuevoNombre.trim().toUpperCase(),\r
                    fecha_solicitud: new Date().toISOString(),\r
                    estado: 'pendiente'\r
                };\r
                savePatient(paciente);\r
                if (typeof showToast === 'function') showToast(\"Solicitud de corrección enviada con éxito al patólogo\", \"success\");\r
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
                if (reMacro) reMacro.contentEditable = \"false\";\r
                if (reMicro) reMicro.contentEditable = \"false\";\r
                if (reDiag) reDiag.contentEditable = \"false\";\r
                if (btnFirma) btnFirma.style.display = \"none\";\r
                if (typeof showToast === 'function') showToast(\"Modo Edición Restringida: Solo Nombre y Fechas permitidos\", \"info\");\r
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
            if (typeof showToast === 'function') showToast(`Nombre corregido a \"${nombreNuevo}\" y re-firmado en 0.5s`, \"success\");\r
            if (typeof renderTable === 'function') renderTable();\r
        }\r
    };\r
\r
    window.rechazarCorreccion = function(codAtencion) {\r
        const paciente = patientDatabase.find(p => String(p.codAtencion) === String(codAtencion));\r
        if (paciente && paciente.solicitud_correccion) {\r
            paciente.solicitud_correccion.estado = 'rechazado';\r
            savePatient(paciente);\r
            if (typeof showToast === 'function') showToast(\"Solicitud de corrección rechazada\", \"info\");\r
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