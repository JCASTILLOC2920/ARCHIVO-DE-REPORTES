import { patientDatabase, fetchFullPatientDetails, triggerAutomaticBackup, savePatient } from './db_service.js?v=23.00';
import { openPrintWindow } from './pdf_engine.js?v=23.00';
// main.js\\r\r
// PROTOCOLO ACTOR-CRITICO: Orquestador Principal (Punto de Entrada Modular)\\r\r
\\r\r
\\r\r
\\r\r
export function initMainApp() {\\r\r
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
                themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';\r
            } else {\r
                themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';\r
            }\r
\r
            themeBtn.addEventListener('click', () => {\r
                const isLight = document.body.classList.toggle('light-theme');\r
                localStorage.setItem('appTheme', isLight ? 'light' : 'dark');\r
                themeBtn.innerHTML = isLight ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';\r
                if (typeof showToast === 'function') {\r
                    showToast(isLight ? "Modo Claro activado" : "Modo Oscuro activado", "info");\r
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
            logoutBtn.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i>';\r
            logoutBtn.style.marginLeft = '10px';\r
            logoutBtn.addEventListener('click', () => {\r
                localStorage.removeItem('currentUser');\r
                window.location.href = 'login.html';\r
            });\r
            headerRight.appendChild(logoutBtn);\r
        }\r
\r
        const dbBtn = document.querySelector('button[aria-label="Base de datos"]');\r
        if (dbBtn) {\r
            dbBtn.title = "Sincronizar y Subir Todos los Reportes a la Nube (Supabase)";\r
            dbBtn.addEventListener('click', async () => {\r
                if (typeof showToast === 'function') showToast("Sincronizando reportes locales con la nube...", "info");\r
                await uploadAllLocalReportsToSupabase();\r
                await syncPatientsFromSupabase();\r
                applyFilters(false);\r
            });\r
        }\r
    }\r
\r
    console.log("[Core] Inicializando Sistema Modular V2...");\r
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











































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































            targetPatient.codAtencion = newCodAtencion;\r
            targetPatient.dni = document.getElementById('re_dni').value;\r
\r
            const selectedSexo = document.getElementById('re_sexo').value;\r
            targetPatient.sexo = selectedSexo === 'MASCULINO' ? 'M' : (selectedSexo === 'FEMENINO' ? 'F' : 'O');\r
            targetPatient.fecRegistro = document.getElementById('re_fecIngreso').value;\r
            targetPatient.fecEntrega = document.getElementById('re_fecEntregaReal').value;\r
\r
            targetPatient.nombres = document.getElementById('re_nomPaciente').value;\r
            targetPatient.apellidos = document.getElementById('re_apePaciente').value;\r
            targetPatient.paciente = `${targetPatient.apellidos}, ${targetPatient.nombres}`;\r
\r
            const rawEdadVal = document.getElementById('re_edad').value.trim();\r
            targetPatient.edad = (rawEdadVal && rawEdadVal !== '0' && rawEdadVal !== '--') ? rawEdadVal : '--';\r
            targetPatient.telefono = document.getElementById('re_telefono').value;\r
            targetPatient.fContacto = document.getElementById('re_fContacto').value;\r
            targetPatient.telContacto = document.getElementById('re_telContacto').value;\r
\r
            targetPatient.medSolicitante = document.getElementById('re_medSolicitante').value;\r
            targetPatient.motivoEstudio = document.getElementById('re_motivoEstudio').value;\r
            targetPatient.especimen = targetPatient.telContacto;\r
\r
            targetPatient.doctor = document.getElementById('re_doctor').value;\r
            targetPatient.casetes = parseInt(document.getElementById('re_casetes').value) || 1;\r
            const enteredClinica = document.getElementById('re_clinica') ? document.getElementById('re_clinica').value.trim() : '';\r
            targetPatient.clinica = (enteredClinica && enteredClinica.toLowerCase() !== 'sin clinica') ? enteredClinica : 'CLÍNICA CARRIÓN';\r
\r
            targetPatient.diagnostico = autoCorrectClinicalText(document.getElementById('re_diagnostico').innerHTML);\r
\r
            const cleanDiagTxt = (document.getElementById('re_diagnostico')?.textContent || document.getElementById('re_diagnostico')?.innerText || '').replace(/<[^>]*>/g, '').trim();\r
            const cleanMacroTxt = (document.getElementById('re_macroDesc')?.textContent || document.getElementById('re_macroDesc')?.innerText || '').replace(/<[^>]*>/g, '').trim();\r
            const cleanMicroTxt = (document.getElementById('re_microDesc')?.textContent || document.getElementById('re_microDesc')?.innerText || '').replace(/<[^>]*>/g, '').trim();\r
\r
            const hasInfoSaved = (cleanDiagTxt !== '' && cleanDiagTxt !== '---') || (cleanMacroTxt !== '' && cleanMacroTxt !== '---') || (cleanMicroTxt !== '' && cleanMicroTxt !== '---');\r
\r
            // Al hacer clic en Guardar, cualquier cambio en texto, plantilla, clinica, paciente o fotos queda PERMANENTE\r
            targetPatient.modificado = true;\r
\r
            if (targetPatient.firmado === true || targetPatient.estado === 'Completado' || targetPatient.estado === 'Firmado') {\r
                targetPatient.firmado = true;\r
                targetPatient.estado = 'Completado';\r
            } else {\r
                targetPatient.firmado = false;\r
                targetPatient.estado = 'En Proceso';\r
            }\r
\r
            targetPatient.catMacro = document.getElementById('re_catMacro').value;\r
            targetPatient.planMacro = document.getElementById('re_planMacro').value;\r
            targetPatient.macroDesc = fixMedicalCapitalization(document.getElementById('re_macroDesc').innerHTML);\r
\r
            targetPatient.catMicro = document.getElementById('re_catMicro').value;\r
            targetPatient.planMicro = document.getElementById('re_planMicro').value;\r
            targetPatient.microDesc = fixMedicalCapitalization(document.getElementById('re_microDesc').innerHTML);\r
\r
            // Guardar Solicitud de Informe\r
            if (window.currentUploadedFileBase64) {\r
                targetPatient.solicitudInforme = window.currentUploadedFileBase64;\r
            } else {\r
                targetPatient.solicitudInforme = "";\r
            }\r
\r
            // Guardar imágenes de forma segura\r
            const img01Cont = document.getElementById('re_img01PreviewContainer');\r
            const img01Prev = document.getElementById('re_img01Preview');\r
            const img01Raw = document.getElementById('re_img01Raw');\r
            const img01Work = document.getElementById('re_img01Workspace');\r
\r
            if (img01Cont && img01Cont.style.display !== 'none' && img01Prev && img01Prev.src) {\r
                targetPatient.img01 = img01Prev.src;\r
            } else if (img01Work && img01Work.style.display !== 'none' && cropper01) {\r
                try {\r
                    const canvas = cropper01.getCroppedCanvas({ maxWidth: 800, maxHeight: 800 });\r
                    if (canvas) {\r
                        targetPatient.img01 = canvas.toDataURL('image/jpeg', 0.65);\r
                    } else if (img01Raw && img01Raw.src) {\r
                        targetPatient.img01 = img01Raw.src;\r
                    }\r
                } catch (e) {\r
                    if (img01Raw && img01Raw.src) targetPatient.img01 = img01Raw.src;\r
                }\r
            } else if (img01Raw && img01Raw.src && img01Raw.src.startsWith('data:')) {\r
                targetPatient.img01 = img01Raw.src;\r
            } else {\r
                targetPatient.img01 = "";\r
            }\r
\r
            const img02Cont = document.getElementById('re_img02PreviewContainer');\r
            const img02Prev = document.getElementById('re_img02Preview');\r
            const img02Raw = document.getElementById('re_img02Raw');\r
            const img02Work = document.getElementById('re_img02Workspace');\r
\r
            if (img02Cont && img02Cont.style.display !== 'none' && img02Prev && img02Prev.src) {\r
                targetPatient.img02 = img02Prev.src;\r
            } else if (img02Work && img02Work.style.display !== 'none' && cropper02) {\r
                try {\r
                    const canvas = cropper02.getCroppedCanvas({ maxWidth: 800, maxHeight: 800 });\r
                    if (canvas) {\r
                        targetPatient.img02 = canvas.toDataURL('image/jpeg', 0.65);\r
                    } else if (img02Raw && img02Raw.src) {\r
                        targetPatient.img02 = img02Raw.src;\r
                    }\r
                } catch (e) {\r
                    if (img02Raw && img02Raw.src) targetPatient.img02 = img02Raw.src;\r
                }\r
            } else if (img02Raw && img02Raw.src && img02Raw.src.startsWith('data:')) {\r
                targetPatient.img02 = img02Raw.src;\r
            } else {\r
                targetPatient.img02 = "";\r
            }\r
\r
            // Manejar cambio de código de atención\r
            if (codeChanged) {\r
                if (typeof window.deletePatient === 'function') {\r
                    window.deletePatient(originalCodAtencion);\r
                } else {\r
                    const oldIdx = patientDatabase.findIndex(x => x.codAtencion === originalCodAtencion);\r
                    if (oldIdx !== -1) patientDatabase.splice(oldIdx, 1);\r
                }\r
                originalCodAtencion = newCodAtencion;\r
                editingCodAtencion = newCodAtencion;\r
            }\r
\r
            // Guardar cambios a IndexedDB y encolar envío a Supabase\r
            if (typeof window.savePatient === 'function') {\r
                window.savePatient(targetPatient);\r
            } else {\r
                const idx = patientDatabase.findIndex(x => x.codAtencion === targetPatient.codAtencion);\r
                if (idx !== -1) {\r
                    patientDatabase[idx] = targetPatient;\r
                } else {\r
                    patientDatabase.push(targetPatient);\r
                }\r
                sortPatientArray(patientDatabase);\r
                if (typeof window.triggerAutomaticBackup === 'function') window.triggerAutomaticBackup();\r
                if (typeof window.refreshPatientTable === 'function') window.refreshPatientTable(); else applyFilters(false);\r
            }\r
\r
            if (shouldNotify) {\r
                notifyUser("Cambios guardados con éxito en la ficha del paciente", "success");\r
            } else {\r
                notifyUser("Sincronizando cambios con la nube en tiempo real...", "info");\r
            }\r
            return targetPatient;\r
        }\r
        return null;\r
    }\r
\r
    // Firma button\r
    const reBtnFirma = document.getElementById('re_btnFirma');\r
    if (reBtnFirma) {\r
        reBtnFirma.addEventListener('click', () => {\r