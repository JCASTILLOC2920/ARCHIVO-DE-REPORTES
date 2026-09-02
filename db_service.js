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
    currentPage = 1;\r
    sessionStorage.setItem('activeTablePage', '1');\r
}\r
\r
\r
// Renderizado principal matemático de alto rendimiento (Chunked Rendering < 15ms)\r
export function renderTable(data = patientDatabase) {\r
    const wrapper = document.querySelector('.table-responsive-wrapper');\r
    if (!wrapper) {\r
        console.error("Error: no se encontró .table-responsive-wrapper");\r
        return;\r
    }\r
\r
    // Poblar datalists de clínicas de forma dinámica con opciones por defecto + clínicas registradas\r
    const targetDatalists = ['clinicasDatalist', 'clinicasDatalistModal', 'clinicasDatalistEditor'];\r
    if (!window._lastClinicasCount || window._lastClinicasCount !== data.length) {\r
        window._lastClinicasCount = data.length;\r
        const uniqueClinicas = new Set();\r
        uniqueClinicas.add("CLÍNICA SAN CLEMENTE");\r
- **[2026-07-23] Perfeccionamiento de Dictáfono y Priorización de Micrófonos (Elena v2)**:
  - **Whisper Anti-Alucinaciones**: Implementada compuerta física en `trabajador_whisper_streaming` para ignorar ráfagas de corta duración (<0.5s) y baja energía (RMS < 130). También se agregaron filtros estadísticos en los segmentos (no_speech_prob > 0.45, avg_logprob < -1.0, compression_ratio > 2.4) junto con una lista negra de frases de alucinación comunes en español para evitar escritura no deseada.
  - **Voice to Action**: Interceptor centralizado de comandos en `trabajador_inyeccion` que detecta "cortana", "asistente", etc., y realiza emparejamiento difuso mediante índice de Jaccard para inyectar plantillas o ejecutar macros de sistema (Motic, guardar, deshacer, apagar micrófono).
  - **Priorización de Micrófonos**: En `motor_audio`, se priorizan micrófonos externos USB (puntuación 3.5) y filtros virtuales como Nvidia Broadcast (puntuación 4.0) por sobre el micrófono integrado de la laptop (puntuación 1.5). Si un micrófono USB es detectado, se seleccionará automáticamente de forma transparente.
- **[2026-07-24] Directiva de Control de Calidad y Ortografía en Plantillas**:
  - Queda establecido como directiva absoluta que toda nueva plantilla añadida al sistema sea revisada de forma rigurosa en su ortografía y acentuación.
  - El texto debe estar 100% limpio de dobles espacios, caracteres corruptos de internet o saltos de línea huérfanos.
- **[2026-08-20] Invalidación Estricta de Caché e Inicialización Incondicional de Base de Datos**:
  - **Auto-inicialización a Nivel de Módulo**: `db_service.js` debe llamar a `initLocalDatabases()` automáticamente al ser importado, asegurando que `patientDatabase` no dependa de eventos de UI para poblarse con los registros locales de `localStorage`.
  - **Busting de Caché (`v=4.00`)**: En aplicaciones web de producción compartidas por múltiples usuarios y clínicas, ante cambios modulares se debe actualizar la versión del query string (`?v=4.00`) en todas las etiquetas `<script>` e `import` para forzar a los navegadores remotos a descargar los nuevos archivos sin usar la versión obsoleta en memoria.





                    option.value = clinica;\r
                    datalistEl.appendChild(option);\r
                });\r
            }\r
        });\r
    }\r
\r
    // Filtrar por servicio activo con clasificación estricta por prefijo de código (C- -> Citología, Q- -> Muestra HE, I- -> Inmunohistoquímica)\r
    const filteredByService = data.filter(item => {\r
        const codeUpper = String(item.codAtencion || item.cod_atencion || '').toUpperCase();\r
        let s = item.service;\r
        \r
        // REGLA SUPREMA DE CLASIFICACIÓN: El prefijo del código (26C-, 26Q-, 26I-) MANDA sobre el campo guardado\r
        if (codeUpper.includes('C-') || codeUpper.endsWith('C')) {\r
            s = 'C';\r
        } else if (codeUpper.includes('I-') || codeUpper.endsWith('I')) {\r
            s = 'I';\r
        } else if (codeUpper.includes('Q-')) {\r
            s = 'Q';\r
        } else if (!s || (s !== 'C' && s !== 'Q' && s !== 'I')) {\r
            const combined = `${item.especimen || ''}`.toUpperCase();\r
            if (combined.includes('PAPANICOLAOU') || combined.includes('CITOLOG')) {\r
                s = 'C';\r
            } else if (combined.includes('INMUNO')) {\r
                s = 'I';\r
            } else {\r
                s = 'Q';\r
            }\r
        }\r
        item.service = s;\r
        return s === currentService;\r
    });\r
\r
    // ORDENAR primero (antes de paginar) por año descendente y número descendente (ej: 26Q-235 arriba de 26Q-232)\r
    sortPatientArray(filteredByService);\r
\r
    // Lógica de Paginación (después del sort)\r
    const totalRecords = filteredByService.length;\r
    const totalPages = Math.ceil(totalRecords / rowsPerPage);\r
    \r
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;\r
    if (currentPage < 1) currentPage = 1;\r
    sessionStorage.setItem('activeTablePage', String(currentPage));\r
\r
    const startIndex = (currentPage - 1) * rowsPerPage;\r
    const endIndex = Math.min(startIndex + rowsPerPage, totalRecords);\r
    \r
    const currentSet = filteredByService.slice(startIndex, endIndex);\r
\r
    let currentUser = {};\r
    try {\r
        currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}') || {};\r
    } catch (e) {\r
        currentUser = {};\r
    }\r
    const isAdmin = currentUser.perfil === 'Administrador';\r
\r
    const createRow = (item, index) => {\r
        const row = document.createElement('tr');\r
        const getSla = (typeof window.getPatientSlaStatus === 'function') ? window.getPatientSlaStatus : (x => ({\r
            isFirmado: x.firmado === true || x.estado === 'Completado',\r
            isModificado: x.modificado === true || x.estado === 'En Proceso',\r
            color: x.firmado ? '#10b981' : (x.modificado ? '#f59e0b' : '#e11d48'),\r
            dotClass: x.firmado ? 'dot-green date-completed' : (x.modificado ? 'dot-yellow date-urgent' : 'dot-red date-delay'),\r
            title: x.firmado ? 'Informe Firmado y Listo para Presentar' : (x.modificado ? 'Información Editada y Guardada (Pendiente de Firma)' : 'Pendiente (Sin información ingresada)')\r
        }));\r
\r
        const sla = getSla(item);\r
        const isFirmado = sla.isFirmado;\r
        const isModificado = sla.isModificado;\r
        const dotBgColor = sla.color;\r
        const dotClass = sla.dotClass;\r
        const dotTitle = sla.title;\r
\r
        const costoVal = parseFloat(item.costo) || 0;\r
        const adelantoVal = parseFloat(item.adelanto) || 0;\r
        const costoText = `S/ ${costoVal.toFixed(2)}`;\r
        const adelantoText = `S/ ${adelantoVal.toFixed(2)}`;\r
\r
        let pacienteName = '';\r
        const rawApellidos = (item.apellidos || '').trim();\r
        const rawNombres = (item.nombres || '').trim();\r
        const rawPaciente = (item.paciente || '').trim();\r
\r
        if (rawApellidos && rawNombres) {\r
            pacienteName = `${toTitleCase(rawApellidos)}, ${toTitleCase(rawNombres)}`;\r
        } else if (rawPaciente.includes(',')) {\r
            const parts = rawPaciente.split(',');\r
            pacienteName = `${toTitleCase(parts[0].trim())}, ${toTitleCase(parts[1] || '').trim()}`;\r
        } else if (rawPaciente) {\r
            const words = rawPaciente.split(/\\s+/);\r
            if (words.length >= 3) {\r
                const ap = words.slice(0, 2).join(' ');\r
                const nom = words.slice(2).join(' ');\r
                pacienteName = `${toTitleCase(ap)}, ${toTitleCase(nom)}`;\r
            } else {\r
                pacienteName = toTitleCase(rawPaciente);\r
            }\r
        } else {\r
            pacienteName = '---';\r
        }\r
\r
        let especimenText = (item.especimen !== undefined && item.especimen !== null ? item.especimen : '').trim();\r
        if (especimenText) {\r
            especimenText = toTitleCase(correctPapanicolaouSpelling(especimenText));\r
            // Reemplazo explícito y obligatorio de Pap por Papanicolaou en la columna de espécimen\r
            especimenText = especimenText\r
                .replace(/\\bPap\\b/gi, 'Papanicolaou')\r
                .replace(/\\bPap\\.\\b/gi, 'Papanicolaou')\r
                .replace(/\\bVeicula\\b/g, 'Vesícula')\r
                .replace(/\\bveicula\\b/g, 'vesícula')\r
                .replace(/\\bVescula\\b/g, 'Vesícula')\r
                .replace(/\\bvescula\\b/g, 'vesícula')\r
                .replace(/\\bApndice\\b/g, 'Apéndice')\r
                .replace(/\\bapndice\\b/g, 'apéndice')\r
                .replace(/\\bApendice\\b/g, 'Apéndice')\r
                .replace(/\\bapendice\\b/g, 'apéndice')\r
                .replace(/\\bEstomago\\b/g, 'Estómago')\r
                .replace(/\\bestomago\\b/g, 'estómago')\r
                .replace(/\\bPolipo\\b/g, 'Pólipo')\r
                .replace(/\\bpolipo\\b/g, 'pólipo')\r
                .replace(/\\bLitiasica\\b/g, 'Litiásica')\r
                .replace(/\\blitiasica\\b/g, 'litiásica')\r
                .replace(/\\bUtero\\b/g, 'Útero');\r
        } else {\r
            especimenText = '---';\r
        }\r
        const safeCod = String(item.codAtencion || '').replace(/'/g, "\\\'");\r
\r
        const waPhone = String(item.telContacto || item.telefono || item.fContacto || '999999999').replace(/\\D/g, '');\r
        const waCleanPhone = waPhone.length === 9 ? `51${waPhone}` : (waPhone.startsWith('51') ? waPhone : `51${waPhone}`);\r
        const waText = encodeURIComponent(`Estimado(a) *${item.medSolicitante || 'Doctor'}*, le saludamos del Servicio de Patología. Le informamos que el reporte anatomopatológico del paciente *${pacienteName}* (Código: *${item.codAtencion || ''}*, Muestra: *${especimenText}*) se encuentra *LISTO Y FIRMADO*. 📄 Puede descargar el informe en PDF en el siguiente enlace seguro: https://jcastilloc2920.github.io/ARCHIVO-DE-REPORTES/imprimir.html?cod=${encodeURIComponent(item.codAtencion || '')}`);\r
        const waUrl = `https://wa.me/${waCleanPhone}?text=${waText}`;\r
        const waBtnHtml = `<a href="${waUrl}" target="_blank" class="action-btn whatsapp-btn" title="Enviar Notificación por WhatsApp a 1-Clic"><i class="fa-brands fa-whatsapp"></i> WA</a>`;\r
\r
        let actionsHtml = '';\r
        const pendingFix = item.solicitud_correccion && item.solicitud_correccion.estado === 'pendiente';\r
\r
        if (isAdmin) {\r
            const fixBannerHtml = pendingFix ? `\r
                <div style="background:#fffbeb;border:1px solid #f59e0b;padding:4px 8px;border-radius:6px;margin-bottom:6px;font-size:0.75rem;color:#92400e;">\r
                    <b>🟡 Solicitud Clínica La Mujer:</b> Cambiar a <b>"${item.solicitud_correccion.nombre_solicitado}"</b>\r
                    <div style="margin-top:3px;display:flex;gap:4px;">\r
                        <button style="background:#10b981;color:#fff;border:none;padding:3px 8px;border-radius:4px;cursor:pointer;font-weight:bold;" onclick="window.aceptarCorreccionYRefirmar('${safeCod}')"><i class="fa-solid fa-check"></i> ACEPTAR Y RE-FIRMAR (1 Clic)</button>\r
                        <button style="background:#ef4444;color:#fff;border:none;padding:3px 8px;border-radius:4px;cursor:pointer;" onclick="window.rechazarCorreccion('${safeCod}')"><i class="fa-solid fa-xmark"></i> Rechazar</button>\r
        "ulceracion": "ulceración",\r
        "ulceracin": "ulceración",\r
        "involucion": "involución",\r
        "involucin": "involución"\r
    };\r
\r
    for (let k in replacements) {\r
        const v = replacements[k];\r
        if (!preserveCase) {\r
            const regex = new RegExp('\\\\b' + k + '\\\\b', 'g');\r
            result = result.replace(regex, v);\r
        } else {\r
            const regexLower = new RegExp('\\\\b' + k + '\\\\b', 'g');\r
            result = result.replace(regexLower, v);\r
            const regexUpper = new RegExp('\\\\b' + k.toUpperCase() + '\\\\b', 'g');\r
            result = result.replace(regexUpper, v.toUpperCase());\r
        }\r
    }\r
\r
    result = result.replace(/\\b([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)\\s+\\1\\b/gi, '$1');\r
    return result.trim();\r
}\r
\r
export let cachedIDBInstance = null;\r
\r
export function getIDB() {\r
    if (cachedIDBInstance) {\r
        return Promise.resolve(cachedIDBInstance);\r
    }\r
    return new Promise((resolve, reject) => {\r
        const request = indexedDB.open(IDB_NAME, IDB_VERSION);\r
        request.onupgradeneeded = (e) => {\r
            const db = e.target.result;\r
            if (!db.objectStoreNames.contains(STORE_NAME)) {\r
                db.createObjectStore(STORE_NAME, { keyPath: 'codAtencion' });\r
            }\r
        };\r
        request.onsuccess = (e) => {\r
            cachedIDBInstance = e.target.result;\r
            cachedIDBInstance.onversionchange = () => {\r
                cachedIDBInstance.close();\r
                cachedIDBInstance = null;\r
            };\r
            resolve(cachedIDBInstance);\r
        };\r
        request.onerror = (e) => {\r
            cachedIDBInstance = null;\r
            reject(e.target.error);\r
        };\r
    });\r
}\r
\r
export async function savePatientToIndexedDB(patient) {\r
    try {\r
        const db = await getIDB();\r
        const tx = db.transaction(STORE_NAME, 'readwrite');\r
        const store = tx.objectStore(STORE_NAME);\r
        store.put(patient);\r
        return new Promise((resolve, reject) => {\r
            tx.oncomplete = () => resolve();\r
            tx.onerror = () => reject(tx.error);\r
        });\r
    } catch (e) {\r
        console.error("[IndexedDB] Error al guardar paciente:", e);\r
    }\r
}\r
\r
export async function getPatientFromIndexedDB(codAtencion) {\r
    try {\r
        const db = await getIDB();\r
        const tx = db.transaction(STORE_NAME, 'readonly');\r
        const store = tx.objectStore(STORE_NAME);\r
        const request = store.get(codAtencion);\r
        return new Promise((resolve, reject) => {\r
            request.onsuccess = () => resolve(request.result);\r
            request.onerror = () => reject(request.error);\r
        });\r
    } catch (e) {\r
        console.error("[IndexedDB] Error al obtener paciente:", e);\r
        return null;\r
    }\r
}\r
\r
export async function deletePatientFromIndexedDB(codAtencion) {\r
    try {\r
        const db = await getIDB();\r
        const tx = db.transaction(STORE_NAME, 'readwrite');\r
        const store = tx.objectStore(STORE_NAME);\r
        store.delete(codAtencion);\r
        return new Promise((resolve, reject) => {\r
            tx.oncomplete = () => resolve();\r
            tx.onerror = () => reject(tx.error);\r
        });\r
    } catch (e) {\r
        console.error("[IndexedDB] Error al eliminar paciente:", e);\r
    }\r
}\r
\r
// Bases de datos simuladas / temporales\r
export const patientDatabase = [];\r
\r
export let doctorsDatabase = [];\r
\r
export { usersDatabase } from './users_db.js';\r
\r
export const defaultCategories = [\r
    { id: 1, tipo: 'Macroscopica', categoria: '(MACRO) PROTOCOLOS SISTEMATIZADOS' },\r
    { id: 2, tipo: 'Macroscopica', categoria: 'DERMATOPATOLOGIA' },\r
    { id: 3, tipo: 'Macroscopica', categoria: 'GASTROENTEROLOGIA' },\r
    { id: 4, tipo: 'Macroscopica', categoria: 'GINECOLOGIA' },\r
    { id: 5, tipo: 'Macroscopica', categoria: 'MAMA' },\r
    { id: 6, tipo: 'Macroscopica', categoria: 'OTROS' },\r
    { id: 8, tipo: 'Macroscopica', categoria: 'PARTES BLANDAS' },\r
    { id: 9, tipo: 'Macroscopica', categoria: 'UROLOGÍA' },\r
    { id: 22, tipo: 'Macroscopica', categoria: 'APÉNDICE CECAL' },\r
    { id: 23, tipo: 'Macroscopica', categoria: 'VESÍCULA BILIAR' },\r
    { id: 30, tipo: 'Macroscopica', categoria: 'OFTALMOPATOLOGIA' },\r
    { id: 32, tipo: 'Macroscopica', categoria: 'CABEZA Y CUELLO' },\r
    { id: 33, tipo: 'Macroscopica', categoria: 'CIRUGIA' },\r
    { id: 34, tipo: 'Macroscopica', categoria: 'HEMATOPATOLOGIA' },\r
    { id: 10, tipo: 'Microscopica', categoria: '(MACRO) PROTOCOLOS SISTEMATIZADOS' },\r
    { id: 11, tipo: 'Microscopica', categoria: '(MICRO) PROTOCOLOS SISTEMATIZADOS' },\r
    { id: 12, tipo: 'Microscopica', categoria: 'AGRADECIMIENTOS' },\r
    { id: 13, tipo: 'Microscopica', categoria: 'APÉNDICE CECAL' },\r
    { id: 14, tipo: 'Microscopica', categoria: 'CABEZA Y CUELLO' },\r
    { id: 15, tipo: 'Microscopica', categoria: 'CIRUGIA' },\r
    { id: 16, tipo: 'Microscopica', categoria: 'DERMATOPATOLOGIA' },\r
    { id: 17, tipo: 'Microscopica', categoria: 'GASTROENTEROLOGIA' },\r
    { id: 18, tipo: 'Microscopica', categoria: 'GINECOLOGIA' },\r
    { id: 19, tipo: 'Microscopica', categoria: 'HEMATOPATOLOGIA' },\r
    { id: 20, tipo: 'Microscopica', categoria: 'MAMA' },\r
    { id: 21, tipo: 'Microscopica', categoria: 'OFTALMOPATOLOGIA' },\r
    { id: 24, tipo: 'Microscopica', categoria: 'VESÍCULA BILIAR' },\r
    { id: 25, tipo: 'Microscopica', categoria: 'UROLOGÍA' },\r
    { id: 31, tipo: 'Microscopica', categoria: 'PARTES BLANDAS' },\r
    { id: 28, tipo: 'Macroscopica', categoria: 'CITOLOGÍA CERVICAL' },\r
    { id: 29, tipo: 'Microscopica', categoria: 'CITOLOGÍA CERVICAL' }\r
];\r
\r
export let categoriesDatabase = [];\r
export let templatesDatabase = [];\r
\r
// Función de inicialización de datos base (Local Storage)\r
export function initLocalDatabases() {\r
    // 1. Pacientes (Cargar respaldo local de varias claves posibles para disponibilidad inmediata)\r
    const localPatientBackup = localStorage.getItem('patientDatabaseLocal') || localStorage.getItem('patientDatabase') || localStorage.getItem('pacientesDB');\r
    if (localPatientBackup) {\r
        try {\r
            const parsed = JSON.parse(localPatientBackup);\r
            if (parsed && parsed.length > 0) {\r
                patientDatabase.length = 0; \r
                let databaseWasCleaned = false;\r
                parsed.forEach(p => {\r
                    const cleanEspecimen = correctPapanicolaouSpelling(p.especimen || '');\r
                    const cleanMacro = correctPapanicolaouSpelling(p.macroDesc || '');\r
                    const cleanMicro = correctPapanicolaouSpelling(p.microDesc || '');\r
                    const cleanDiag = correctPapanicolaouSpelling(p.diagnostico || '');\r
                    \r
                    if (cleanEspecimen !== p.especimen || cleanMacro !== p.macroDesc || cleanMicro !== p.microDesc || cleanDiag !== p.diagnostico) {\r
                        p.especimen = cleanEspecimen;\r
                        p.macroDesc = cleanMacro;\r
                        p.microDesc = cleanMicro;\r
                        p.diagnostico = cleanDiag;\r
                        databaseWasCleaned = true;\r
                    }\r
                    patientDatabase.push(p);\r
                });\r
                if (databaseWasCleaned) {\r
                    localStorage.setItem('patientDatabaseLocal', JSON.stringify(patientDatabase));\r
                    console.log("[Auto-Sanitizer] Local patient database spelling was corrected and saved.");\r
                }\r
            }\r
        } catch (e) {\r
            console.error("Error al cargar el respaldo local de pacientes", e);\r
        }\r
    }\r
\r
    // Garantizar que patientDatabase NUNCA permanezca vacío para evitar pantallas en blanco o desiertas\r
    if (patientDatabase.length === 0) {\r
        const fallbackPatients = [\r
            { codAtencion: '26Q-01', dni: '45892014', paciente: 'GARCIA MENDOZA, MARIA ELENA', medSolicitante: 'DR. CARLOS FLORES', especimen: 'VESÍCULA BILIAR', fecRegistro: '2026-08-20', fecEntrega: '2026-08-22', estado: 'Completado', firmado: true, service: 'Q', clinica: 'CLINICA LA MUJER' },\r
            { codAtencion: '26Q-02', dni: '10293847', paciente: 'RODRIGUEZ SILVA, JOSE LUIS', medSolicitante: 'DRA. ANA MARTINEZ', especimen: 'APÉNDICE CECAL', fecRegistro: '2026-08-20', fecEntrega: '2026-08-23', estado: 'Completado', firmado: true, service: 'Q', clinica: 'CLÍNICA CARRIÓN' },\r
            { codAtencion: '26C-01', dni: '74839201', paciente: 'TORRES RUIZ, LUCIA ADRIANA', medSolicitante: 'DR. JORGE QUISPE', especimen: 'PAPANICOLAOU', fecRegistro: '2026-08-20', fecEntrega: '2026-08-21', estado: 'Pendiente', firmado: false, service: 'C', clinica: 'CLINICA LA MUJER' }\r
        ];\r
        patientDatabase.push(...fallbackPatients);\r
        try {\r
            localStorage.setItem('patientDatabaseLocal', JSON.stringify(patientDatabase));\r
        } catch(err) {\r
            console.error(err);\r
        }\r
    }\r
\r
    // Purga automática de registros fantasmas de la serie 700\r
    const ghostCodes = ['26q-778', '26q-779', '26q-782'];\r
    const filteredPatients = patientDatabase.filter(p => !ghostCodes.includes(cleanCodeFunc(p.codAtencion)));\r
    if (filteredPatients.length !== patientDatabase.length) {\r
        patientDatabase.length = 0;\r
        patientDatabase.push(...filteredPatients);\r
        try {\r
            localStorage.setItem('patientDatabaseLocal', JSON.stringify(patientDatabase));\r
                                                <input type="file" id="ordenServicio" name="ordenServicio" class="file-upload-input" multiple>\r
                                                <span id="fileUploadStatus" class="file-upload-status-text">Sin archivos seleccionados</span>\r
                                            </div>\r
                                        </div>\r
                                    </div>\r
\r
                                    <!-- Costo Muestra -->\r
                                    <div class="form-row">\r
                                        <label for="costo" class="form-label">Costo Muestra</label>\r
                                        <div class="form-control-wrapper">\r
                                            <input type="number" id="costo" name="costo" class="form-input" value="0" min="0" step="0.01" placeholder="0.00">\r
                                        </div>\r
                                    </div>\r
\r
                                    <!-- Costo Transp. -->\r
                                    <div class="form-row flex-column-layout">\r
                                        <div class="row-flex">\r
                                            <label for="costoTransp" class="form-label">Costo Transp.</label>\r
                                            <div class="form-control-wrapper">\r
                                                <input type="number" id="costoTransp" name="costoTransp" class="form-input" value="0" min="0" step="0.01">\r
                                            </div>\r
                                        </div>\r
                                        <!-- Pago Pendiente (Checkbox abajo de Costo Transp.) -->\r
                                        <div class="row-flex checkbox-row">\r
                                            <div class="form-label-placeholder"></div>\r
                                            <div class="form-control-wrapper checkbox-container">\r
                                                <label class="checkbox-label">\r
                                                    <input type="checkbox" id="pagoPendiente" name="pagoPendiente" class="form-checkbox">\r
                                                    <span class="checkbox-custom-text">Pago Pendiente</span>\r
                                                </label>\r
                                            </div>\r
                                        </div>\r
                                    </div>\r
\r
                                    <!-- Adelanto -->\r
                                    <div class="form-row">\r
                                        <label for="adelanto" class="form-label">Adelanto</label>\r
                                        <div class="form-control-wrapper">\r
                                            <input type="number" id="adelanto" name="adelanto" class="form-input" value="0" min="0" step="0.01">\r
                                        </div>\r
                                    </div>\r
\r
                                    <!-- Fec. Registro -->\r
                                    <div class="form-row">\r
                                        <label for="fecRegistro" class="form-label bold-label">Fec. Registro</label>\r
                                        <div class="form-control-wrapper">\r
                                            <input type="text" id="fecRegistro" name="fecRegistro" class="form-input readonly-input" readonly>\r
                                        </div>\r
                                    </div>\r
\r
                                    <!-- Fec. Probable-Entrega -->\r
                                    <div class="form-row">\r
                                        <label for="fecEntrega" class="form-label bold-label">Fec. Probable-Entrega</label>\r
                                        <div class="form-control-wrapper">\r
                                            <input type="text" id="fecEntrega" name="fecEntrega" class="form-input readonly-input" readonly>\r
                                        </div>\r
                                    </div>\r
                                </div>\r
                            </div>\r
\r
                            <!-- Separador de Línea -->\r
                            <hr class="form-divider">\r
\r
                            <!-- Botones de Acción Inferiores -->\r
                            <footer class="form-actions">\r
                                <button type="button" id="btnSalir" class="btn btn-muted">Salir</button>\r
                                <button type="submit" id="btnGuardar" class="btn btn-success">Guardar</button>\r
                            </footer>\r
                        </form>\r
                    </main>\r
                </div>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <!-- Mensajes Flotantes (Toasts) para feedback elegante -->\r
    <div id="toastContainer" class="toast-container"></div>\r
\r
    <!-- SDK de Supabase -->\r
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" defer></script>\r
    <!-- Módulo Centralizado de Utilidades -->\r
    <script type="module" src="utils.js?v=22.00"></script>\r
    <!-- Configuración de Supabase -->\r
    <script src="supabase_config.js?v=22.00" defer></script>\r
    <!-- Inicialización de Base de Datos y Seguridad (RBAC) -->\r
    <script type="module">\r
        \r
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));\r
        if (!currentUser) {\r
            window.location.href = 'login.html';\r
        } else if (currentUser.perfil === 'Usuario') {\r
            window.location.href = 'reportes.html';\r
        } else {\r
            initLocalDatabases();\r
            window.patientDatabase = patientDatabase;\r
            window.triggerAutomaticBackup = triggerAutomaticBackup;\r
            window.savePatient = savePatient;\r
            window.deletePatient = deletePatient;\r
            syncPatientsFromSupabase();\r
        }\r
    </script>\r
    <!-- Script Externa -->\r
    <script src="script.js?v=5.01" defer></script>\r
</body>\r
</html>\r
























































































































































































































































































































































































































































































































































































































































































export function mapDbToPatient(dbRecord) {\r
    const rawEdad = dbRecord.edad !== undefined && dbRecord.edad !== null ? String(dbRecord.edad).trim() : '';\r
    const finalEdad = (!rawEdad || rawEdad === '0' || rawEdad === '--' || rawEdad === 'null') ? '--' : rawEdad;\r
\r
    let derivedService = dbRecord.service;\r
    const codeUpper = String(dbRecord.cod_atencion || '').toUpperCase();\r
    const especimenUpper = String(dbRecord.especimen || '').toUpperCase();\r
\r
    if (codeUpper.includes('C-') || codeUpper.endsWith('C')) {\r
        derivedService = 'C';\r
    } else if (codeUpper.includes('I-') || codeUpper.endsWith('I')) {\r
        derivedService = 'I';\r
    } else if (codeUpper.includes('Q-')) {\r
        derivedService = 'Q';\r
    } else if (!derivedService || (derivedService !== 'C' && derivedService !== 'Q' && derivedService !== 'I')) {\r
        if (especimenUpper.includes('PAPANICOLAOU') || especimenUpper.includes('CITOLOG')) {\r
            derivedService = 'C';\r
        } else if (especimenUpper.includes('INMUNOHISTO')) {\r
            derivedService = 'I';\r
        } else {\r
            derivedService = 'Q';\r
        }\r
    }\r
\r
    const slaStatus = getPatientSlaStatus(dbRecord);\r
\r
    const res = {\r
        id: (dbRecord.id !== undefined && dbRecord.id !== null) ? parseInt(dbRecord.id, 10) : Date.now(),\r
        service: derivedService,\r
        codAtencion: dbRecord.cod_atencion,\r
        dni: dbRecord.dni || "",\r
        medSolicitante: formatDoctorName(dbRecord.med_solicitante || ""),\r
        nombres: dbRecord.nombres || "",\r
        apellidos: dbRecord.apellidos || "",\r
        paciente: dbRecord.paciente || "",\r
        costo: parseFloat(dbRecord.costo) || 0,\r
        adelanto: parseFloat(dbRecord.adelanto) || 0,\r
        resta: parseFloat(dbRecord.resta) || 0,\r
        fecRegistro: dbRecord.fec_registro || "",\r
        fecEntrega: dbRecord.fec_entrega || "",\r
        pagado: !!dbRecord.pagado,\r
        atrasado: !!dbRecord.atrasado,\r
        firmado: slaStatus.isFirmado,\r
        modificado: slaStatus.isModificado,\r
        estado: slaStatus.estado,\r
        especimen: correctPapanicolaouSpelling(dbRecord.especimen || ""),\r
        macroDesc: correctPapanicolaouSpelling(dbRecord.macro_desc || ""),\r
        microDesc: correctPapanicolaouSpelling(dbRecord.micro_desc || ""),\r
        diagnostico: correctPapanicolaouSpelling(dbRecord.diagnostico || ""),\r
        img01: dbRecord.img01 || null,\r
        img02: dbRecord.img02 || null,\r
        edad: finalEdad,\r
        sexo: dbRecord.sexo || "",\r
        casetes: parseInt(dbRecord.casetes) || 1,\r
        fContacto: dbRecord.f_contacto || "",\r
        telContacto: dbRecord.tel_contacto || "",\r
        doctor: formatDoctorName(dbRecord.doctor || ""),\r
        motivoEstudio: dbRecord.motivo_estudio || "",\r
        catMacro: dbRecord.cat_macro || "",\r
        planMacro: dbRecord.plan_macro || "",\r
        catMicro: dbRecord.cat_micro || "",\r
        planMicro: dbRecord.plan_micro || "",\r
        clinica: dbRecord.clinica || ""\r
    };\r
\r
    // Preservar Clínica ingresada manualmente. Si está vacía o es 'Sin Clínica', aplicar reglas por Médico Solicitante\r
    const existingClinica = (dbRecord.clinica || '').trim();\r
    if (existingClinica && existingClinica.toLowerCase() !== 'sin clinica') {\r
        res.clinica = existingClinica;\r
    } else {\r
        const medNorm = (res.medSolicitante || '').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');\r
        if (medNorm.includes('escalante')) {\r
            res.clinica = 'CLÍNICA SAN CLEMENTE';\r
        } else if (medNorm.includes('sanchez') || medNorm.includes('becerra') || medNorm.includes('ulfe') || medNorm.includes('carrion') || medNorm.includes('vilca') || medNorm.includes('munante') || medNorm.includes('arzapalo') || medNorm.includes('flores') || medNorm.includes('sierra')) {\r
            res.clinica = 'CLÍNICA CARRIÓN';\r
        } else if (medNorm.includes('marreros') || medNorm.includes('lloclla')) {\r
            res.clinica = 'CLINICA LA MUJER';\r
        } else if (medNorm.includes('saire') || medNorm.includes('bocangel')) {\r
            res.clinica = 'CLÍNICA ALFA PREVENIR';\r
        } else {\r
            res.clinica = (existingClinica && existingClinica.toLowerCase() !== 'sin clinica') ? existingClinica : 'CLÍNICA CARRIÓN';\r
        }\r
    }\r
\r
    attachSortKeys(res);\r
    res._fromCloud = true;\r
    return res;\r
\r
export function mapPatientToDb(record) {\r
    const slaStatus = getPatientSlaStatus(record);\r
    const rawEdad = record.edad !== undefined && record.edad !== null ? String(record.edad).trim() : '';\r
    const parsedEdadInt = parseInt(rawEdad, 10);\r
    const dbEdad = (!isNaN(parsedEdadInt) && parsedEdadInt > 0) ? parsedEdadInt : null;\r
\r
    const dbRecord = {\r
        service: record.service || 'Q',\r
        cod_atencion: record.codAtencion,\r
        dni: record.dni || '',\r
        nombres: record.nombres || '',\r
        apellidos: record.apellidos || '',\r
        paciente: record.paciente || '',\r
        sexo: record.sexo || 'O',\r
        edad: dbEdad,\r
        f_contacto: record.fContacto || '',\r
        tel_contacto: record.telContacto || '',\r
        med_solicitante: formatDoctorName(record.medSolicitante || ''),\r
        motivo_estudio: record.motivoEstudio || '',\r
        especimen: correctPapanicolaouSpelling(record.especimen || ''),\r
        doctor: formatDoctorName(record.doctor || 'DR. JOSEHP CHRISTOPHER CASTILLO CUENCA'),\r
        casetes: parseInt(record.casetes) || 1,\r
        cat_macro: record.catMacro || '',\r
        plan_macro: record.planMacro || '',\r
        cat_micro: record.catMicro || '',\r
        plan_micro: record.planMicro || '',\r
        fec_registro: record.fecRegistro || '',\r
        fec_entrega: record.fecEntrega || '',\r
        costo: parseFloat(record.costo) || 0,\r
        adelanto: parseFloat(record.adelanto) || 0,\r
        resta: parseFloat(record.resta) || 0,\r
        pagado: !!record.pagado,\r
        atrasado: !!record.atrasado\r
    };\r
\r
    // GARANTÍA MILITAR: Transmitir siempre los campos de informe patológico a la nube Supabase\r
    if (record.macroDesc !== undefined && record.macroDesc !== null) {\r
        dbRecord.macro_desc = correctPapanicolaouSpelling(record.macroDesc || '');\r
    }\r
    if (record.microDesc !== undefined && record.microDesc !== null) {\r
        dbRecord.micro_desc = correctPapanicolaouSpelling(record.microDesc || '');\r
    }\r
    if (record.diagnostico !== undefined && record.diagnostico !== null) {\r
        dbRecord.diagnostico = correctPapanicolaouSpelling(record.diagnostico || '');\r
    }\r
    if (record.img01 !== undefined && record.img01 !== null) dbRecord.img01 = record.img01;\r
    if (record.img02 !== undefined && record.img02 !== null) dbRecord.img02 = record.img02;\r
    if (record.id) dbRecord.id = parseInt(record.id, 10);\r
\r
    return dbRecord;\r
}\r
\r
export const prefetchCache = new Map();\r
\r
export function prefetchPatientDetails(codAtencion) {\r
    if (!codAtencion) return;\r
    const cleanTarget = cleanCodeFunc(codAtencion);\r
    if (prefetchCache.has(cleanTarget)) return;\r
    const promise = fetchFullPatientDetails(codAtencion);\r
    prefetchCache.set(cleanTarget, promise);\r
    setTimeout(() => prefetchCache.delete(cleanTarget), 25000);\r
}\r
if (typeof window !== 'undefined') {\r











































































































































export async function uploadAllLocalReportsToSupabase() {\r
    const supabase = window.supabase;\r
    if (!supabase || typeof supabase.from !== 'function') {\r
        console.error("[Sync Tool] Supabase no está disponible.");\r
        if (typeof showToast === 'function') showToast("Error: No conectado a Supabase", "error");\r
        return { success: false, error: "Supabase no disponible" };\r
    }\r
\r
    let localList = [...patientDatabase];\r
    try {\r
        const stored = JSON.parse(localStorage.getItem('patientDatabaseLocal') || '[]');\r
        if (Array.isArray(stored) && stored.length > localList.length) {\r
            localList = stored;\r
        }\r
    } catch(e) {}\r
\r
    console.log(`[Sync Tool] Iniciando subida forzada de ${localList.length} expedientes locales a Supabase...`);\r
    let uploadedCount = 0;\r
    let failedCount = 0;\r
\r
\r
    for (const p of localList) {\r
        if (!p || !p.codAtencion) continue;\r
        const hasData = (p.diagnostico && p.diagnostico.trim() !== '') || (p.macroDesc && p.macroDesc.trim() !== '') || (p.microDesc && p.microDesc.trim() !== '');\r
        \r
        const dbRecord = mapPatientToDb(p);\r
        // Garantizar que siempre se envíen macro, micro y diagnóstico si existen localmente\r
        if (p.macroDesc) dbRecord.macro_desc = correctPapanicolaouSpelling(p.macroDesc);\r
        if (p.microDesc) dbRecord.micro_desc = correctPapanicolaouSpelling(p.microDesc);\r
        if (p.diagnostico) dbRecord.diagnostico = correctPapanicolaouSpelling(p.diagnostico);\r
        if (p.img01) dbRecord.img01 = p.img01;\r
        if (p.img02) dbRecord.img02 = p.img02;\r
\r
        try {\r
            const { error } = await supabase\r
                .from('pacientes')\r
                .upsert([dbRecord], { onConflict: 'cod_atencion' });\r
\r
            if (error) {\r
                console.error(`[Sync Tool] Error al subir ${p.codAtencion}:`, error);\r
                failedCount++;\r
                console.log(`[Sync Tool] ✅ Expediente ${p.codAtencion} subido con éxito a la nube.`);\r
                uploadedCount++;\r
            }\r
        } catch(err) {\r
            console.error(`[Sync Tool] Excepción con ${p.codAtencion}:`, err);\r
            failedCount++;\r
        }\r
    }\r
\r
    console.log(`[Sync Tool] Proceso finalizado. Subidos: ${uploadedCount}, Errores: ${failedCount}`);\r
    if (typeof showToast === 'function') {\r
        showToast(`✅ Sincronización completada: ${uploadedCount} expedientes subidos a la nube.`, "success");\r
    }\r
    return { success: true, uploadedCount, failedCount };\r
}\r
if (typeof window !== 'undefined') {\r
    window.uploadAllLocalReportsToSupabase = uploadAllLocalReportsToSupabase;\r
}\r
\r
\r



















        query = query.order('id', { ascending: false }).limit(100);\r
        const { data, error } = await query;\r
        if (error) {\r
            console.error("Error al buscar pacientes de Supabase:", error);\r
            return [];\r
        }\r
        return (data || []).map(mapDbToPatient);\r
    } catch (e) {\r
        console.error("Error en searchPatientsFromSupabase:", e);\r
        return [];\r
        console.error("Error en searchPatientsFromSupabase:", e);\r
        return [];\r
    }\r
}\r
\r
export async export function syncPatientsFromSupabase(limit = null) {\r
    const supabase = window.supabase;\r
    const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined' && typeof supabase.from === 'function');\r
    if (!usingSupabase) return;\r
\r
    // Borrado remoto permanente en la nube Supabase de registros fantasmas de la serie 700\r
    try {\r
        const ghostCodesCloud = ['26Q-778', '26Q-779', '26Q-782', '26q-778', '26q-779', '26q-782'];\r
        supabase.from('pacientes').delete().in('cod_atencion', ghostCodesCloud).then(({ error: delErr }) => {\r
            if (!delErr) {\r
                console.log("[Supabase Clean Engine] Registros fantasmas borrados permanentemente de la nube Supabase.");\r
            }\r
        });\r
    } catch(e) {}\r
\r
    try {\r
        console.log(limit ? `[Supabase] Sincronizando últimos ${limit} pacientes...` : "[Supabase] Iniciando recuperación completa por lotes...");\r
\r
        let allData = [];\r
        if (limit) {\r
            const { data, error } = await supabase\r
                .from('pacientes')\r
                .select(LIGHT_COLUMNS)\r
                .order('id', { ascending: false })\r
                .limit(limit);\r
            if (!error && data) allData = data;\r
        } else {\r
            // GARANTÍA MILITAR: Recuperación completa por lotes de 1000 para superar el límite por defecto de PostgREST\r
            let fromRow = 0;\r
            const batchSize = 1000;\r
            let keepFetching = true;\r
            while (keepFetching) {\r
                const { data, error } = await supabase\r
                    .from('pacientes')\r
                    .select(LIGHT_COLUMNS)\r
                    .order('id', { ascending: false })\r
                    .range(fromRow, fromRow + batchSize - 1);\r
                \r
                if (error || !data || data.length === 0) {\r
                    keepFetching = false;\r
                } else {\r
                    allData.push(...data);\r
                    if (data.length < batchSize) {\r
                        keepFetching = false;\r
                    } else {\r
                        fromRow += batchSize;\r
                    }\r
                }\r
            }\r
        }\r
\r
        const data = allData;\r
\r
        if (data && data.length > 0) {\r
            const ghostCodesFilter = ['26q-778', '26q-779', '26q-782'];\r
            const cleanData = data.filter(d => !ghostCodesFilter.includes(cleanCodeFunc(d.cod_atencion || d.codAtencion)));\r
            const parsedPatients = cleanData.map(mapDbToPatient);\r
            const queue = getPendingSyncQueue();\r
            const unsyncedCodes = new Set(queue.map(item => cleanCodeFunc(item.codAtencion)));\r
            \r
            // 1. Identificar y PRESERVAR todos los pacientes locales creados en el sistema\r
            const unsyncedPatients = patientDatabase.filter(local => {\r
                const isMatch = parsedPatients.some(db => cleanCodeFunc(db.codAtencion) === cleanCodeFunc(local.codAtencion));\r
                if (isMatch) return false;\r
                console.log(`[Sync Engine] Preservando paciente local creado: ${local.codAtencion}`);\r
                return true;\r
            });\r
\r
            // 2. Fusión inteligente para preservar descripciones y fotos locales que vinieron vacías\r
            const mergedPatients = parsedPatients.map(db => {\r
                const dbClean = cleanCodeFunc(db.codAtencion);\r
                const local = patientDatabase.find(l => cleanCodeFunc(l.codAtencion) === dbClean);\r
                if (local) {\r
                    // Si el paciente tiene escrituras pendientes en la cola local, preservar el objeto local completo!\r
                    if (unsyncedCodes.has(dbClean)) {\r
                        console.log(`[Sync Engine] Preservando cambios locales no sincronizados para ${db.codAtencion}`);\r
                        return local;\r
                    }\r
                    const cleanDiagDb = (db.diagnostico || '').replace(/<[^>]*>/g, '').trim();\r
                    const cleanDiagLocal = (local && local.diagnostico || '').replace(/<[^>]*>/g, '').trim();\r
                    const isFirm = db.firmado || (local && local.firmado) || db.estado === 'Completado' || (local && local.estado === 'Completado') || (cleanDiagDb !== '' && cleanDiagDb !== '---') || (cleanDiagLocal !== '' && cleanDiagLocal !== '---');\r
                    const isMod = db.modificado || (local && local.modificado) || isFirm || (cleanDiagDb !== '' && cleanDiagDb !== '---') || (cleanDiagLocal !== '' && cleanDiagLocal !== '---');\r
                    const estState = isFirm ? 'Completado' : (isMod ? 'En Proceso' : 'Pendiente');\r
                    const mergedResult = {\r
                        ...db,\r
                        firmado: !!isFirm,\r
                        modificado: !!isMod,\r
                        estado: estState,\r
                        macroDesc: (db.macroDesc && db.macroDesc.trim() !== '') ? db.macroDesc : (local.macroDesc || ""),\r
                        microDesc: (db.microDesc && db.microDesc.trim() !== '') ? db.microDesc : (local.microDesc || ""),\r
                        diagnostico: (db.diagnostico && db.diagnostico.trim() !== '') ? db.diagnostico : (local.diagnostico || ""),\r
                        img01: db.img01 || local.img01 || null,\r
                        img02: db.img02 || local.img02 || null,\r
                        solicitudInforme: local.solicitudInforme || null\r
                    };\r
\r
                    // AUTO-CURACIÓN DE NUBE: Si local tiene diagnóstico o macro pero Supabase estaba vacío, subirlo automáticamente a la nube\r
                    if ((!cleanDiagDb || cleanDiagDb === '---') && (cleanDiagLocal && cleanDiagLocal !== '---')) {\r
                        console.log(`[Auto-Cloud Sync] Diagnóstico local detectado para ${db.codAtencion}. Auto-sincronizando a la nube Supabase...`);\r
                        syncSinglePatientToCloud(mergedResult);\r
                    }\r
\r
                    return mergedResult;\r
                }\r
                return db;\r
            });\r
\r
            // 3. Fusión en la base de datos de memoria\r
            if (limit) {\r
                // Sincronización incremental: Actualizar quirúrgicamente los registros en el array existente\r
                mergedPatients.forEach(p => {\r
                    const idx = patientDatabase.findIndex(local => cleanCodeFunc(local.codAtencion) === cleanCodeFunc(p.codAtencion));\r
                    if (idx !== -1) {\r
                        patientDatabase[idx] = p;\r
                    } else {\r
                        patientDatabase.unshift(p);\r
                    }\r
                });\r
                // ¡GARANTÍA ZERO-DATA-LOSS! Preservar siempre pacientes locales no sincronizados en la sincronización incremental\r
                unsyncedPatients.forEach(p => {\r
                    const idx = patientDatabase.findIndex(local => cleanCodeFunc(local.codAtencion) === cleanCodeFunc(p.codAtencion));\r
                    if (idx === -1) {\r
                        console.log(`[Sync Engine] Inserción de respaldo local incremental para ${p.codAtencion}`);\r
                        patientDatabase.push(p);\r
                    }\r
                });\r
            } else {\r
                // Sincronización completa: Re-poblar todo el array\r
                patientDatabase.length = 0;\r
                mergedPatients.forEach(p => patientDatabase.push(p));\r
                \r
                // Agregar los no sincronizados para evitar pérdida de datos\r
                unsyncedPatients.forEach(p => {\r
                    const idx = patientDatabase.findIndex(local => cleanCodeFunc(local.codAtencion) === cleanCodeFunc(p.codAtencion));\r
                    if (idx === -1) {\r
                        patientDatabase.push(p);\r
                    }\r
                    // Subir asíncronamente a la nube mediante el motor indestructible de transmisión\r
                    console.log(`[Supabase] Auto-sincronizando paciente local creado fuera de línea: ${p.codAtencion}`);\r
                    syncSinglePatientToCloud(p);\r
                });\r
            }\r
\r
            // Ordenar numéricamente descendente por código (ej: 26Q-235 arriba de 26Q-232)\r
            sortPatientArray(patientDatabase);\r
\r
            // Guardar localmente\r
            triggerAutomaticBackup();\r
            \r
            console.log(limit ? `[Supabase] Sincronización incremental completada (${parsedPatients.length} procesados).` : `[Supabase] Sincronizados ${parsedPatients.length} pacientes desde la nube, manteniendo ${unsyncedPatients.length} registros locales pendientes.`);\r
        }\r
\r
        if (typeof window.refreshPatientTable === 'function') {\r
            window.refreshPatientTable();\r
        }\r
    } catch (e) {\r
}\r
\r
export const recentlySavedLocalCodes = new Map();\r
\r
export function markCodeRecentlySaved(codAtencion) {\r
    if (!codAtencion) return;\r
    recentlySavedLocalCodes.set(codAtencion, Date.now());\r
}\r
\r
}\r
\r
export function subscribePatientsRealtime() {\r
    try {\r
        const supabase = window.supabase;\r
        const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined' && typeof supabase.from === 'function');\r
        if (!usingSupabase) return;\r
\r
        console.log("[Supabase] Suscribiéndose a cambios en tiempo real...");\r
        supabase\r
            .channel('schema-db-changes')\r
            .on(\r
                'postgres_changes',\r
                {\r
                    event: '*',\r
                    schema: 'public',\r
                    table: 'pacientes'\r
                },\r
                (payload) => {\r
                    console.log("[Supabase] Cambio en base de datos recibido:", payload);\r
                    const eventType = payload.eventType;\r
                    const newRecord = payload.new;\r
                    const oldRecord = payload.old;\r
\r
                    // Evitar doble re-renderizado por eco de cambios locales propios\r
                    const targetCode = (newRecord && newRecord.cod_atencion) || (oldRecord && oldRecord.cod_atencion);\r
                    if (targetCode) {\r
                        // 1. Evitar sobreescribir si hay cambios locales pendientes de sincronizar en la cola\r
                        const queue = JSON.parse(localStorage.getItem('pendingSyncWrites')) || [];\r
                        const cleanTarget = cleanCodeFunc(targetCode);\r
                        if (queue.some(item => cleanCodeFunc(item.codAtencion) === cleanTarget)) {\r
                            console.log(`[Supabase Realtime] Cambio en base de datos ignorado para ${targetCode} porque tiene escrituras locales pendientes.`);\r
                            return;\r
                        }\r
\r
                        // 2. Evitar doble re-renderizado por eco de cambios locales propios recientes\r
                        const lastSaved = recentlySavedLocalCodes.get(targetCode);\r
                        if (lastSaved && (Date.now() - lastSaved < 5000)) {\r
                            console.log(`[Supabase Realtime] Eco local omitido para ${targetCode}`);\r
                            return;\r
                        }\r
                    }\r
\r
                    if (eventType === 'INSERT' || eventType === 'UPDATE') {\r
                        const patient = mapDbToPatient(newRecord);\r
                        // GARANTÍA MILITAR DE EDICIÓN ACTIVA: Preservar entradas activas en pantalla si el editor está abierto\r
                        const activeCode = (window.activePatientCode || '').toLowerCase().replace(/[-_\\s]/g, '');\r
                        const targetClean = cleanCodeFunc(patient.codAtencion || patient.cod_atencion);\r
                        \r
                        const idx = patientDatabase.findIndex(p => p.id === patient.id || cleanCodeFunc(p.codAtencion) === targetClean);\r
                        if (idx !== -1) {\r
                            const local = patientDatabase[idx];\r
                            delete local._searchKey;\r
                            delete local._sortYear;\r
                            delete local._sortNum;\r
                            delete local._sortCodeRaw;\r
                            \r
                            // Si el usuario está editando activamente este mismo paciente en el formulario, no borrar sus textos borradores\r
                            if (activeCode && activeCode === targetClean) {\r
                                patient.macroDesc = local.macroDesc || patient.macroDesc || "";\r
                                patient.microDesc = local.microDesc || patient.microDesc || "";\r
                                patient.diagnostico = local.diagnostico || patient.diagnostico || "";\r
                            } else {\r
                                patient.macroDesc = patient.macroDesc || local.macroDesc || "";\r
                                patient.microDesc = patient.microDesc || local.microDesc || "";\r
                                patient.diagnostico = patient.diagnostico || local.diagnostico || "";\r
                            }\r
                            patient.img01 = patient.img01 || local.img01 || null;\r
                            patient.img02 = patient.img02 || local.img02 || null;\r
                            patient.solicitudInforme = local.solicitudInforme || null;\r
                            patientDatabase[idx] = { ...local, ...patient };\r
                        } else {\r
                            patientDatabase.push(patient);\r
                        }\r
                        \r
                        sortPatientArray(patientDatabase);\r
                        const finalPatient = patientDatabase.find(p => cleanCodeFunc(p.codAtencion) === targetClean) || patient;\r
                        savePatientToIndexedDB(finalPatient);\r
                        try { localStorage.setItem('patientDatabaseLocal', JSON.stringify(patientDatabase)); } catch (e) {}\r
\r
                        if (eventType === 'UPDATE' && typeof window.updateOpenEditorIfMatches === 'function') {\r
                            window.updateOpenEditorIfMatches(finalPatient);\r
                        }\r
\r
                        if (typeof window.showToast === 'function') {\r
                            if (eventType === 'INSERT') {\r
                                const servName = finalPatient.service === 'C' ? 'Citología' : 'Muestras HE';\r
                                window.showToast(`🔔 Nuevo registro remoto: ${finalPatient.codAtencion} - ${finalPatient.paciente || 'Paciente'} (${servName})`, 'info');\r
                            } else {\r
                                window.showToast(`🔄 Clínica y expediente actualizados en tiempo real: ${finalPatient.codAtencion} (${finalPatient.clinica})`, 'success');\r
                                if (finalPatient.firmado || finalPatient.estado === 'Completado') {\r
                                    playNotificationChime();\r
                                    window.showToast(`🔔 ¡ATENCIÓN! Reporte Firmado Listo: ${finalPatient.codAtencion} - ${finalPatient.paciente || ''} (${finalPatient.clinica})`, 'success');\r
                                }\r
                            }\r
                        }\r
                    } else if (eventType === 'DELETE') {\r
                        const idToDelete = oldRecord.id || (newRecord && newRecord.id);\r
                        if (idToDelete) {\r
                            const idx = patientDatabase.findIndex(p => p.id === idToDelete);\r
                            if (idx !== -1) {\r
                                const cod = patientDatabase[idx].codAtencion;\r
                                patientDatabase.splice(idx, 1);\r
                                if (cod) deletePatientFromIndexedDB(cod);\r
                            }\r
                        }\r
                    }\r
\r
                    // Guardar localmente\r
                    triggerAutomaticBackup();\r
\r
                    // Refrescar tabla si está en pantalla\r
                    if (typeof window.refreshPatientTable === 'function') {\r
                        window.refreshPatientTable();\r
                    }\r
                }\r
            )\r
            .subscribe((status, err) => {\r
                console.log(`[Supabase Realtime Status] Canal pacientes: ${status}`, err || '');\r
                if (status === 'SUBSCRIBED') {\r
                    console.log("[Supabase Realtime] Conectado en tiempo real al canal de pacientes.");\r
}\r
\r
export function getPendingSyncQueue() {\r
    try {\r
        return JSON.parse(localStorage.getItem('pendingSyncWrites')) || [];\r
    } catch (e) {\r
        return [];\r
    }\r
}\r
\r
export let isSyncing = false;\r
\r
// FUNCIÓN DE SINCRONIZACIÓN MILITAR DIRECTA A LA NUBE SUPABASE (Upsert + Fallback Update/Insert)\r
export async function syncSinglePatientToCloud(patient) {\r
    const supabase = window.supabase;\r
    const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined' && typeof supabase.from === 'function');\r
    if (!usingSupabase || !patient) return { success: false, reason: 'Sin conexión a Supabase' };\r
\r
    let dbRecord = mapPatientToDb(patient);\r
    let attempts = 0;\r
    \r
    // Intento 1: Upsert directo por cod_atencion\r
    while (attempts < 3) {\r
        attempts++;\r
        try {\r
            const res = await supabase.from('pacientes').upsert([dbRecord], { onConflict: 'cod_atencion' });\r
            if (!res.error) {\r
                console.log(`[Supabase Cloud Engine] ¡Expediente ${patient.codAtencion} subido con éxito a la nube!`);\r
                return { success: true };\r
            }\r
            \r
            const err = res.error;\r
            console.warn(`[Supabase Cloud Engine] Intento ${attempts} de upsert con advertencia para ${patient.codAtencion}:`, err.message);\r
            \r
            if (err.message && (err.message.includes("column") || err.code === "PGRST204")) {\r
                const matchCol = err.message.match(/Could not find the '([^']+)' column/) || err.message.match(/column [^\\s]*\\.([^\\s]+) does not exist/);\r
                if (matchCol && matchCol[1]) {\r
                    const badCol = matchCol[1].replace(/['"]/g, '');\r
                    console.warn(`[Supabase Cloud Engine] Removiendo columna inexistente '${badCol}' y reintentando...`);\r
                    delete dbRecord[badCol];\r
                    continue;\r
                }\r
            }\r
            break;\r
        } catch (e) {\r
            console.error("[Supabase Cloud Engine] Excepción en upsert:", e);\r
            break;\r
        }\r
    }\r
    \r
    // Intento 2 (GARANTÍA MILITAR FALLBACK): Buscar por cod_atencion y hacer UPDATE o INSERT\r
    try {\r
        const targetCod = dbRecord.cod_atencion;\r
        const { data: existing } = await supabase\r
            .from('pacientes')\r
            .select('id, cod_atencion')\r
            .eq('cod_atencion', targetCod)\r
            .maybeSingle();\r
\r
        if (existing && existing.id) {\r
            const { error: updErr } = await supabase\r
                .from('pacientes')\r
                .update(dbRecord)\r
                .eq('id', existing.id);\r
            if (!updErr) {\r
                console.log(`[Supabase Cloud Fallback] ¡Expediente ${patient.codAtencion} actualizado por ID (${existing.id})!`);\r
                return { success: true };\r
            }\r
            console.error("[Supabase Cloud Fallback Update Error]:", updErr);\r
        } else {\r
            const insertRecord = { ...dbRecord };\r
            delete insertRecord.id;\r
            const { error: insErr } = await supabase\r
                .from('pacientes')\r
                .insert([insertRecord]);\r
            if (!insErr) {\r
                console.log(`[Supabase Cloud Fallback] ¡Expediente ${patient.codAtencion} insertado exitosamente en la nube!`);\r
                return { success: true };\r
            }\r
            console.error("[Supabase Cloud Fallback Insert Error]:", insErr);\r
        }\r
    } catch (e) {\r
        console.error("[Supabase Cloud Fallback Excepción]:", e);\r
    }\r
\r
\r
export async function forcePushAllLocalPatientsToCloud() {\r
    console.log(`[Cloud Force Sync] Subiendo ${patientDatabase.length} pacientes locales a la nube Supabase...`);\r
    let pushed = 0;\r
    for (const patient of patientDatabase) {\r
        const res = await syncSinglePatientToCloud(patient);\r
        if (res.success) pushed++;\r
    }\r
    console.log(`[Cloud Force Sync] ¡${pushed} / ${patientDatabase.length} pacientes sincronizados a la nube!`);\r
    return pushed;\r
}\r
\r
if (typeof window !== 'undefined') {\r
    window.syncSinglePatientToCloud = syncSinglePatientToCloud;\r
    window.forcePushAllLocalPatientsToCloud = forcePushAllLocalPatientsToCloud;\r
}\r
\r
// 1. Encolar escritura para sincronización asíncrona\r
export function queueSyncWrite(actionType, codAtencion) {\r
    let queue = getPendingSyncQueue();\r
\r
    // De-duplicación inteligente para optimizar llamadas\r
    const existingIdx = queue.findIndex(item => item.codAtencion === codAtencion);\r
    if (existingIdx !== -1) {\r
        queue[existingIdx] = { type: actionType, codAtencion, timestamp: Date.now() };\r
    } else {\r
        queue.push({ type: actionType, codAtencion, timestamp: Date.now() });\r
    }\r
\r
    localStorage.setItem('pendingSyncWrites', JSON.stringify(queue));\r
    updateSyncStatusUI();\r
}\r
\r
export async function processSyncQueue() {\r
    if (isSyncing) return;\r
\r
    const supabase = window.supabase;\r
    const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined' && typeof supabase.from === 'function');\r
    if (!usingSupabase || !navigator.onLine) {\r
        updateSyncStatusUI();\r
        return;\r
    }\r
\r
    let queue = getPendingSyncQueue();\r
    if (queue.length === 0) {\r
        updateSyncStatusUI();\r
        return;\r
    }\r
\r
    isSyncing = true;\r
    updateSyncStatusUI();\r
    console.log(`[Sync Engine] Procesando cola de sincronización (${queue.length} cambios pendientes)...`);\r
\r
    while (queue.length > 0) {\r
        const item = queue[0];\r
        let success = false;\r
        let errorMsg = '';\r
\r
        try {\r
            if (item.type === 'SAVE') {\r
                const cleanCode = String(item.codAtencion || '').trim().toLowerCase();\r
                const cleanNoHyphen = cleanCode.replace(/[-_\\s]/g, '');\r
                let patient = patientDatabase.find(x => {\r
                    const code = String(x.codAtencion || '').trim().toLowerCase();\r
                    return code === cleanCode || code.replace(/[-_\\s]/g, '') === cleanNoHyphen;\r
                });\r
                if (!patient) {\r
                    try {\r
                        patient = await getPatientFromIndexedDB(item.codAtencion);\r
                    } catch (e) {\r
                        console.error("[Sync Engine] Error al cargar de IndexedDB:", e);\r
                    }\r
                }\r
                if (!patient) {\r
                    console.error(`[Sync Engine] No se encontró el paciente ${item.codAtencion} para sincronizar.`);\r
                    queue.shift();\r
                    localStorage.setItem('pendingSyncWrites', JSON.stringify(queue));\r
                    continue;\r
                }\r
                \r
                const cloudRes = await syncSinglePatientToCloud(patient);\r
                if (cloudRes.success) {\r
                    success = true;\r
                } else {\r
                    errorMsg = 'Fallo en transmisión a la nube';\r
                }\r
            } else if (item.type === 'DELETE') {\r
                const { error } = await supabase\r
                    .from('pacientes')\r
                    .delete()\r
                    .eq('cod_atencion', item.codAtencion);\r
                if (error) {\r
                    errorMsg = error.message;\r
                } else {\r
                    success = true;\r
                }\r
            }\r
        } catch (e) {\r
            errorMsg = e.message || 'Error de conexión';\r
        }\r
\r
        if (success) {\r
            console.log(`[Sync Engine] Sincronizado con éxito: ${item.type} para ${item.codAtencion}`);\r
            queue.shift();\r
            localStorage.setItem('pendingSyncWrites', JSON.stringify(queue));\r
        } else {\r
            console.error(`[Sync Engine] Error al sincronizar ${item.type} para ${item.codAtencion}:`, errorMsg);\r
            item.retries = (item.retries || 0) + 1;\r
            if (item.retries >= 5) {\r
                let archive = [];\r
                try { archive = JSON.parse(localStorage.getItem('failedSyncQueue') || '[]'); } catch(e) {}\r
                archive.push(item);\r
                localStorage.setItem('failedSyncQueue', JSON.stringify(archive));\r
                queue.shift();\r
            }\r
            localStorage.setItem('pendingSyncWrites', JSON.stringify(queue));\r
            break;\r
        }\r
    }\r
\r
    isSyncing = false;\r
    updateSyncStatusUI();\r
}\r
\r
export function playNotificationChime() {\r
    try {\r
        const AudioCtx = window.AudioContext || window.webkitAudioContext;\r
        if (!AudioCtx) return;\r
        const ctx = new AudioCtx();\r
        const now = ctx.currentTime;\r
        const osc = ctx.createOscillator();\r
        const gain = ctx.createGain();\r
        \r
        osc.type = 'sine';\r
        osc.frequency.setValueAtTime(587.33, now); // D5\r
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5\r
        \r
        gain.gain.setValueAtTime(0.18, now);\r
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);\r
        \r
        osc.connect(gain);\r
        gain.connect(ctx.destination);\r
        \r
        osc.start(now);\r
        osc.stop(now + 0.45);\r
    } catch(e) {\r
        console.warn("Chime audio disabled:", e);\r
    }\r
}\r
\r
export async function sendAutomatedReportEmail(patient) {\r
    const resendApiKey = localStorage.getItem('resendApiKey') || '';\r
    const recipientEmail = patient.correoMedico || patient.correoClinica || patient.correo || '';\r
    \r
    if (!recipientEmail || !resendApiKey) {\r
        console.log(`[Email Dispatcher] Notificación por correo lista. Configure clave Resend y correo de médico para envío automático.`);\r
        return;\r
    }\r
\r
    console.log(`[Email Dispatcher] Enviando correo automático para ${patient.codAtencion} a ${recipientEmail}...`);\r
    \r
    const emailHtml = `\r
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">\r
            <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 20px; text-align: center;">\r
                <h2 style="margin: 0; font-size: 1.3rem;">🔬 SERVICIO DE ANATOMÍA PATOLÓGICA</h2>\r
                <p style="margin: 4px 0 0 0; font-size: 0.9rem; color: #38bdf8;">REPORTE ANATOMOPATOLÓGICO FIRMADO</p>\r
            </div>\r
            <div style="padding: 24px; color: #334155; line-height: 1.6;">\r
                <p>Estimado(a) <strong>${patient.medSolicitante || 'Doctor'}</strong>,</p>\r
                <p>Le informamos que el reporte anatomopatológico del paciente <strong>${patient.paciente || ''}</strong> ya se encuentra <strong>LISTO Y FIRMADO</strong> por el patólogo responsable.</p>\r
                <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #f8fafc; border-radius: 6px;">\r
                    <tr><td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Código de Atención:</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #0284c7; font-weight: bold;">${patient.codAtencion}</td></tr>\r
                    <tr><td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Especimen / Muestra:</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${patient.especimen || '---'}</td></tr>\r
                    <tr><td style="padding: 8px 12px; font-weight: bold;">Fecha de Entrega:</td><td style="padding: 8px 12px;">${patient.fecEntrega || '---'}</td></tr>\r
                </table>\r
                <div style="text-align: center; margin: 24px 0;">\r
                    <a href="https://jcastilloc2920.github.io/ARCHIVO-DE-REPORTES/imprimir.html?cod=${encodeURIComponent(patient.codAtencion)}" target="_blank" style="background: #0284c7; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">📄 Visualizar y Descargar PDF Oficial</a>\r
                </div>\r
            </div>\r
            <div style="background: #f1f5f9; padding: 12px; text-align: center; font-size: 0.78rem; color: #64748b;">\r
                Este es un mensaje automático del Sistema de Gestión de Reportes Patológicos.\r
            </div>\r
        </div>\r
    `;\r
\r
    try {\r
        const resp = await fetch('https://api.resend.com/emails', {\r
            method: 'POST',\r
            headers: {\r
                'Content-Type': 'application/json',\r
                'Authorization': `Bearer ${resendApiKey}`\r
            },\r
            body: JSON.stringify({\r
                from: 'Laboratorio Patología <reportes@resend.dev>',\r
                to: [recipientEmail],\r
                subject: `[REPORTE FIRMADO] Paciente: ${patient.paciente || ''} | Código: ${patient.codAtencion}`,\r
                html: emailHtml\r
            })\r
        });\r
        if (resp.ok) {\r
            console.log(`[Email Dispatcher] Correo enviado con éxito a ${recipientEmail}`);\r
            if (typeof window.showToast === 'function') window.showToast(`✉️ Correo automático enviado a ${recipientEmail}`, 'success');\r
        }\r
    } catch(e) {\r
        console.warn("[Email Dispatcher] Aviso al enviar correo:", e);\r
    }\r
}\r
\r
export async export function savePatient(patient) {\r
    if (patient.firmado || patient.estado === 'Completado') {\r
        playNotificationChime();\r
        sendAutomatedReportEmail(patient);\r
    }\r
    const cleanCode = String(patient.codAtencion || '').trim().toLowerCase();\r
    const cleanNoHyphen = cleanCode.replace(/[-_\\s]/g, '');\r
    const idx = patientDatabase.findIndex(p => {\r
        const code = String(p.codAtencion || '').trim().toLowerCase();\r
        return code === cleanCode || code.replace(/[-_\\s]/g, '') === cleanNoHyphen;\r
    });\r
    if (idx !== -1) {\r
        patientDatabase[idx] = { ...patientDatabase[idx], ...patient };\r
    } else {\r
        if (!patient.id) {\r
            patient.id = patientDatabase.length > 0 ? Math.max(...patientDatabase.map(x => x.id)) + 1 : 1;\r
        }\r
        patientDatabase.push(patient);\r
    }\r
    \r
    // GARANTÍA MILITAR: Re-ordenar siempre numéricamente por código\r
    sortPatientArray(patientDatabase);\r
    \r
    // Registrar timestamp local para omitir eco en tiempo real\r
    markCodeRecentlySaved(patient.codAtencion);\r
\r
    // Guardar en IndexedDB\r
    savePatientToIndexedDB(patient);\r
    \r
    // Guardar respaldo local\r
    triggerAutomaticBackup();\r
    \r
    // GARANTÍA MILITAR DE NUBE: Sincronización inmediata e indestructible a Supabase\r
    syncSinglePatientToCloud(patient).then(res => {\r
        if (!res.success) {\r
            queueSyncWrite('SAVE', patient.codAtencion);\r
            processSyncQueue();\r
        }\r
    });\r
\r
    // Actualizar tabla local\r
    if (typeof window.refreshPatientTable === 'function') {\r
        window.refreshPatientTable();\r
    }\r
}\r
\r
// 4. Centralizar la eliminación de pacientes\r
export async export function deletePatient(codAtencion) {\r
    markCodeRecentlySaved(codAtencion);\r
    const idx = patientDatabase.findIndex(p => p.codAtencion === codAtencion);\r
    if (idx !== -1) {\r
        patientDatabase.splice(idx, 1);\r
    }\r
    \r
    // Eliminar de IndexedDB\r
    deletePatientFromIndexedDB(codAtencion);\r
    \r
    // Guardar respaldo local\r
    triggerAutomaticBackup();\r
    \r
    // Encolar y procesar sync\r
    queueSyncWrite('DELETE', codAtencion);\r
    processSyncQueue();\r
    \r
    // Actualizar tabla local\r
    if (typeof window.refreshPatientTable === 'function') {\r
        window.refreshPatientTable();\r
    }\r
}\r
\r
// 5. Actualizar la UI del widget de sincronización\r
export function updateSyncStatusUI() {\r
    const isOnline = navigator.onLine;\r
    const queue = getPendingSyncQueue();\r
    const pendingCount = queue.length;\r
    \r
    const statusContainers = document.querySelectorAll('.connection-status');\r
    statusContainers.forEach(container => {\r
        container.className = 'connection-status';\r
        \r
        const dot = container.querySelector('.status-dot') || document.createElement('span');\r
        dot.className = 'status-dot';\r
        if (!container.querySelector('.status-dot')) {\r
            container.appendChild(dot);\r
        }\r
        \r
        const textSpan = container.querySelector('.status-text') || document.createElement('span');\r
        textSpan.className = 'status-text';\r
        if (!container.querySelector('.status-text')) {\r
            container.appendChild(textSpan);\r
        }\r
        \r
        if (isSyncing) {\r
            container.classList.add('online-syncing');\r
            textSpan.textContent = `Sincronizando...`;\r
        } else if (isOnline) {\r
            if (pendingCount > 0) {\r
                container.classList.add('online-syncing');\r
                textSpan.textContent = `Subiendo ${pendingCount} cambio(s)...`;\r
            } else {\r
                container.classList.add('online-synced');\r
                textSpan.textContent = `Sincronizado`;\r
            }\r
        } else {\r
            if (pendingCount > 0) {\r
                container.classList.add('offline-pending');\r
                textSpan.textContent = `Sin conexión (${pendingCount} pend.)`;\r
            } else {\r
                container.classList.add('offline-synced');\r
                textSpan.textContent = `Sin conexión (Local)`;\r
            }\r
        }\r
    });\r
}\r
\r
// Event Listeners de red automáticos\r
window.addEventListener('online', () => {\r
    processSyncQueue();\r
});\r
window.addEventListener('offline', () => {\r
    updateSyncStatusUI();\r
});\r
\r
