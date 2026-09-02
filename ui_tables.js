import { patientDatabase, getPatientSlaStatus } from './db_service.js?v=23.00';
import { cleanCodeFunc } from './utils.js?v=23.00';
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
        uniqueClinicas.add("CLÍNICA CARRIÓN");\r
        uniqueClinicas.add("CLINICA LA MUJER");\r
        uniqueClinicas.add("CLÍNICA ALFA PREVENIR");\r
        data.forEach(item => {\r
            if (item.clinica && item.clinica.trim() !== '') {\r
                uniqueClinicas.add(item.clinica.trim().toUpperCase());\r
            }\r
        });\r
        const sortedClinicas = Array.from(uniqueClinicas).sort();\r
        targetDatalists.forEach(id => {\r
            const datalistEl = document.getElementById(id);\r
            if (datalistEl) {\r
                datalistEl.innerHTML = '';\r
                sortedClinicas.forEach(clinica => {\r
                    const option = document.createElement('option');\r
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
                    </div>\r
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





























        table.style.flex = '1';\r
        table.style.minWidth = '0';\r
        table.innerHTML = `\r
            <thead>\r
                <tr>\r
                    <th style="width: 2.5%;">#</th>\r
                    <th style="width: 7.5%;">COD-<br>ATENCIÓN</th>\r
                    <th style="width: 6.5%;">DNI</th>\r
                    <th style="width: 14%;">MED. SOLICITANTE</th>\r
                    <th style="width: 15%;">PACIENTE</th>\r
                    <th style="width: 14.5%;">ESPÉCIMEN /<br>MUESTRA</th>\r
                    <th style="width: 8%;">FEC.<br>RECEPCIÓN</th>\r
                    <th style="width: 8%;">FEC.<br>ENTREGA</th>\r
                    <th style="width: 24%; min-width: 170px;" class="action-header">ACCIONES</th>\r
                </tr>\r
            </thead>\r
            <tbody></tbody>\r
        `;\r
        const tbody = table.querySelector('tbody');\r
        subset.forEach((item, index) => {\r
            tbody.appendChild(createRow(item, baseIndex + index));\r
        });\r
        return table;\r
    };\r
\r
    // Si no hay datos, mostrar tabla única con mensaje manteniendo id="tableBody"\r
    if (filteredByService.length === 0) {\r
        wrapper.style.display = 'block';\r
        wrapper.style.overflowX = 'auto';\r
        let tbodyEl = document.getElementById('tableBody');\r
        if (!tbodyEl || !document.getElementById('reportTable')) {\r
            wrapper.innerHTML = `\r
                <table class="report-table" id="reportTable">\r
                    <thead>\r
                        <tr>\r
                            <th style="width: 3%;">#</th>\r
                            <th style="width: 8.5%;">COD-<br>ATENCIÓN</th>\r
                            <th style="width: 7.5%;">DNI</th>\r
                            <th style="width: 15.5%;">MED. SOLICITANTE</th>\r
                            <th style="width: 16%;">PACIENTE</th>\r
                            <th style="width: 15.5%;">ESPÉCIMEN /<br>MUESTRA</th>\r
                            <th style="width: 8%;">FEC.<br>RECEPCIÓN</th>\r
                            <th style="width: 8%;">FEC.<br>ENTREGA</th>\r
                            <th style="width: 18%; min-width: 200px;" class="action-header">ACCIONES</th>\r
                        </tr>\r
                    </thead>\r
                    <tbody id="tableBody"></tbody>\r
                </table>\r
            `;\r
            tbodyEl = document.getElementById('tableBody');\r
        }\r
        if (tbodyEl) {\r
            tbodyEl.innerHTML = `\r
                <tr>\r
                    <td colspan="9" style="text-align: center; padding: 20px; color: var(--text-secondary);">\r
                        No se encontraron registros de pacientes para los filtros seleccionados.\r
                    </td>\r
                </tr>\r
            `;\r
        }\r
        // Actualizar información a 0\r
        const infoEl = document.getElementById('patientsTableInfo');\r
        if (infoEl) infoEl.textContent = `Mostrando 0 a 0 de 0 registros`;\r
        const pagEl = document.getElementById('patientsPagination');\r
        if (pagEl) pagEl.innerHTML = '';\r
        return;\r
    }\r
\r
    // (Sort ya aplicado antes de la paginación)\r
\r
    wrapper.style.display = 'block';\r
    wrapper.style.overflowX = 'auto';\r
\r
    let tbody = document.getElementById('tableBody');\r
    if (!tbody || !document.getElementById('reportTable')) {\r
        wrapper.innerHTML = `\r
            <table class="report-table" id="reportTable">\r
                <thead>\r
                    <tr>\r
                        <th style="width: 3%;">#</th>\r
                        <th style="width: 8.5%;">COD-<br>ATENCIÓN</th>\r
                        <th style="width: 7.5%;">DNI</th>\r
                        <th style="width: 15.5%;">MED. SOLICITANTE</th>\r
                        <th style="width: 16%;">PACIENTE</th>\r
                        <th style="width: 15.5%;">ESPÉCIMEN /<br>MUESTRA</th>\r
                        <th style="width: 8%;">FEC.<br>RECEPCIÓN</th>\r
                        <th style="width: 8%;">FEC.<br>ENTREGA</th>\r
                        <th style="width: 18%; min-width: 200px;" class="action-header">ACCIONES</th>\r
                    </tr>\r
                </thead>\r
                <tbody id="tableBody"></tbody>\r
            </table>\r
        `;\r
        tbody = document.getElementById('tableBody');\r
    } else {\r
        tbody.innerHTML = '';\r
    }\r
\r
    const fragment = document.createDocumentFragment();\r
    currentSet.forEach((item, index) => {\r
        fragment.appendChild(createRow(item, startIndex + index));\r
    });\r
    tbody.appendChild(fragment);\r
\r
    // Actualizar información\r
    const infoEl = document.getElementById('patientsTableInfo');\r
    if (infoEl) {\r
        infoEl.textContent = `Mostrando ${startIndex + 1} a ${endIndex} de ${totalRecords} registros`;\r
    }\r
\r
    // Generar botones de paginación\r
    const pagEl = document.getElementById('patientsPagination');\r
    if (pagEl) {\r
        pagEl.innerHTML = '';\r
        \r
        const prevBtn = document.createElement('button');\r
        prevBtn.className = 'pagination-btn';\r
        prevBtn.textContent = 'Anterior';\r
        prevBtn.disabled = currentPage === 1;\r
        prevBtn.onclick = () => window.goToPage(currentPage - 1);\r
        pagEl.appendChild(prevBtn);\r
\r
        let startPage = Math.max(1, currentPage - 2);\r
        let endPage = Math.min(totalPages, startPage + 4);\r
        if (endPage - startPage < 4) {\r
            startPage = Math.max(1, endPage - 4);\r
        }\r
\r
        for (let i = startPage; i <= endPage; i++) {\r
            const pageBtn = document.createElement('button');\r
            pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;\r
            pageBtn.textContent = i;\r
            pageBtn.onclick = () => window.goToPage(i);\r
            pagEl.appendChild(pageBtn);\r
        }\r
\r
        const nextBtn = document.createElement('button');\r
        nextBtn.className = 'pagination-btn';\r
        nextBtn.textContent = 'Siguiente';\r
        nextBtn.disabled = currentPage === totalPages || totalPages === 0;\r
        nextBtn.onclick = () => window.goToPage(currentPage + 1);\r
        pagEl.appendChild(nextBtn);\r
    }\r
\r
    // Disparar re-posicionamiento de burbuja de impresión si está activa\r
    if (typeof window.checkAndTriggerHelpBubbles === 'function') {\r
        window.checkAndTriggerHelpBubbles();\r
    }\r
}\r
\r
window.goToPage = function(page) {\r
    currentPage = page;\r
    sessionStorage.setItem('activeTablePage', String(page));\r
    applyFilters(false);\r
};\r
\r
export function normalizeText(text) {\r
    if (!text) return '';\r
    return text.toString().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase();\r
}\r
    sessionStorage.setItem('activeTablePage', String(page));\r
    applyFilters(false);\r
};\r
\r
export function normalizeText(text) {\r
    if (!text) return '';\r
    return text.toString().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase();\r
}\r
\r
export async export function applyFilters(resetPage = false) {\r
    if (resetPage === true) {\r
        currentPage = 1;\r
        sessionStorage.setItem('activeTablePage', '1');\r
    } else {\r
        const storedPage = parseInt(sessionStorage.getItem('activeTablePage'));\r
        if (storedPage && !isNaN(storedPage) && storedPage > 0) {\r
            currentPage = storedPage;\r
        }\r
    }\r
    const fecInicio = document.getElementById('fecInicio')?.value || '';\r
    const fecFinal = document.getElementById('fecFinal')?.value || '';\r
    const codAtencion = normalizeText((document.getElementById('codAtencion')?.value || '').trim());\r
    const nomPaciente = normalizeText((document.getElementById('nomPaciente')?.value || '').trim());\r
    const apePaciente = normalizeText((document.getElementById('apePaciente')?.value || '').trim());\r
    const dni = (document.getElementById('dni')?.value || '').trim();\r
    const medSolicitante = normalizeText((document.getElementById('medSolicitante')?.value || '').trim());\r
    const filterClinica = normalizeText((document.getElementById('filterClinica')?.value || '').trim());\r
\r
    // Preparación previa única fuera del bucle N para máxima aceleración (O(1) vs O(N))\r
    let currentUser = {};\r
    try {\r
        currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}') || {};\r
    } catch (e) {\r
        currentUser = {};\r
    }\r
    const isClinicUser = currentUser.perfil === 'Usuario';\r
    const userClinicName = isClinicUser ? normalizeText(currentUser.nombres || '') : '';\r
    const userAccount = isClinicUser ? normalizeText(currentUser.usuario || '') : '';\r
    const allUserTokens = [];\r
\r
    if (isClinicUser) {\r
        const ignoreWords = ['del', 'los', 'las', 'dr', 'dra', 'dr.', 'dra.', 'clinica', 'clínica', 'centro', 'medico', 'médico', 'san', 'santa'];\r
        const tokens = `${userClinicName} ${userAccount}`.split(/[\\s,._-]+/).filter(w => w.length >= 3 && !ignoreWords.includes(w));\r
        allUserTokens.push(...tokens);\r
\r
        if (userClinicName.includes('clemente') || userAccount.includes('clemente') || userClinicName.includes('san clemente')) {\r
            if (!allUserTokens.includes('clemente')) allUserTokens.push('clemente');\r
            if (!allUserTokens.includes('escalante')) allUserTokens.push('escalante');\r
            if (!allUserTokens.includes('alejandro')) allUserTokens.push('alejandro');\r
        }\r
        if (userClinicName.includes('carrion') || userAccount.includes('carrion')) {\r
            if (!allUserTokens.includes('carrion')) allUserTokens.push('carrion');\r
            if (!allUserTokens.includes('sanchez')) allUserTokens.push('sanchez');\r
            if (!allUserTokens.includes('orellana')) allUserTokens.push('orellana');\r
            if (!allUserTokens.includes('renato')) allUserTokens.push('renato');\r
            if (!allUserTokens.includes('manuel')) allUserTokens.push('manuel');\r
            if (!allUserTokens.includes('becerra')) allUserTokens.push('becerra');\r
            if (!allUserTokens.includes('ulfe')) allUserTokens.push('ulfe');\r
            if (!allUserTokens.includes('victor')) allUserTokens.push('victor');\r
            if (!allUserTokens.includes('jaime')) allUserTokens.push('jaime');\r
            if (!allUserTokens.includes('vilca')) allUserTokens.push('vilca');\r
            if (!allUserTokens.includes('jhon')) allUserTokens.push('jhon');\r
            if (!allUserTokens.includes('munante')) allUserTokens.push('munante');\r
            if (!allUserTokens.includes('arzapalo')) allUserTokens.push('arzapalo');\r
            if (!allUserTokens.includes('jorge')) allUserTokens.push('jorge');\r
            if (!allUserTokens.includes('flores')) allUserTokens.push('flores');\r
            if (!allUserTokens.includes('sierra')) allUserTokens.push('sierra');\r
            if (!allUserTokens.includes('bryan')) allUserTokens.push('bryan');\r
        }\r
        if (userClinicName.includes('mujer') || userAccount.includes('mujer') || userAccount.includes('mujersegura')) {\r
            if (!allUserTokens.includes('mujer')) allUserTokens.push('mujer');\r
            if (!allUserTokens.includes('marreros')) allUserTokens.push('marreros');\r
            if (!allUserTokens.includes('lloclla')) allUserTokens.push('lloclla');\r
            if (!allUserTokens.includes('jesus')) allUserTokens.push('jesus');\r
            if (!allUserTokens.includes('juan')) allUserTokens.push('juan');\r
        }\r
        if (userClinicName.includes('alfa') || userAccount.includes('alfa') || userAccount.includes('alfaprevenir')) {\r
            if (!allUserTokens.includes('alfa')) allUserTokens.push('alfa');\r
            if (!allUserTokens.includes('prevenir')) allUserTokens.push('prevenir');\r
            if (!allUserTokens.includes('saire')) allUserTokens.push('saire');\r
            if (!allUserTokens.includes('bocangel')) allUserTokens.push('bocangel');\r
            if (!allUserTokens.includes('laura')) allUserTokens.push('laura');\r
        }\r
    }\r
\r
    const filterFunction = (item) => {\r
        if (codAtencion) {\r
            const cleanTarget = codAtencion.replace(/[-_\\s]/g, '');\r
            const dbCod = normalizeText(item.codAtencion);\r
            const cleanDbCod = dbCod.replace(/[-_\\s]/g, '');\r
            if (!dbCod.includes(codAtencion) && !cleanDbCod.includes(cleanTarget)) return false;\r
        }\r
\r
        if (fecInicio) {\r
            const itemDate = item.fecRegistro || item.fecRecepcion || item.fecha || '';\r
            if (itemDate && itemDate < fecInicio) return false;\r
        }\r
        if (fecFinal) {\r
            const itemDate = item.fecRegistro || item.fecRecepcion || item.fecha || '';\r
            if (itemDate && itemDate > fecFinal) return false;\r
        }\r
\r
        if (dni && !(item.dni && String(item.dni).includes(dni))) return false;\r
\r
        if (!item._searchKey) {\r
            const raw = `${item.codAtencion || ''} ${item.paciente || ''} ${item.nombres || ''} ${item.apellidos || ''} ${item.dni || ''} ${item.medSolicitante || ''} ${item.clinica || ''} ${item.especimen || ''}`;\r
            item._searchKey = normalizeText(raw);\r
        }\r
\r
        if (nomPaciente) {\r
            const words = nomPaciente.split(/\\s+/).filter(Boolean);\r
            const matchesNom = words.every(w => item._searchKey.includes(w));\r
            if (!matchesNom) return false;\r
        }\r
\r
        if (apePaciente) {\r
            const words = apePaciente.split(/\\s+/).filter(Boolean);\r
            const matchesApe = words.every(w => item._searchKey.includes(w));\r
            if (!matchesApe) return false;\r
        }\r
\r
        if (medSolicitante && !normalizeText(item.medSolicitante).includes(medSolicitante)) return false;\r
        if (filterClinica && !(normalizeText(item.clinica).includes(filterClinica) || normalizeText(item.medSolicitante).includes(filterClinica))) return false;\r
\r
        // Restricción de Seguridad por Rol (RBAC): Para perfil 'Usuario', mostrar únicamente registros de su clínica o médico\r
        if (isClinicUser) {\r
            const itemClinica = normalizeText(item.clinica || '');\r
            const itemMed = normalizeText(item.medSolicitante || '');\r
            let isUserMatch = false;\r
\r
            if (allUserTokens.length > 0) {\r
                const tokenMatchClinica = itemClinica ? allUserTokens.some(t => itemClinica.includes(t)) : false;\r
                const tokenMatchMed = itemMed ? allUserTokens.some(t => itemMed.includes(t)) : false;\r
                if (tokenMatchClinica || tokenMatchMed) {\r
                    isUserMatch = true;\r
                }\r
            }\r
\r
            if (!isUserMatch && userClinicName) {\r
                if (itemClinica && (itemClinica.includes(userClinicName) || userClinicName.includes(itemClinica))) {\r
                    isUserMatch = true;\r
                }\r
                if (itemMed && (itemMed.includes(userClinicName) || userClinicName.includes(itemMed))) {\r
                    isUserMatch = true;\r
                }\r
            }\r
\r
            // GARANTÍA MILITAR: Si la clínica o el médico viene vacío o sin asignar, no ocultar el expediente\r
            if (!isUserMatch && (!itemClinica || itemClinica === 'sin clinica' || !itemMed)) {\r
                isUserMatch = true;\r
            }\r
\r
            if (!isUserMatch) return false;\r
        }\r
\r
        return true;\r
    };\r
\r
    // 1. Filtrado local básico en la memoria caché\r
    let filteredData = patientDatabase.filter(filterFunction);\r
\r
    // 2. BÚSQUEDA PROFUNDA REMOTA DE GRADO MILITAR: Consultar Supabase en la nube para recuperar cualquier expediente no cargado aún\r
    const hasTextFilters = !!(codAtencion || nomPaciente || apePaciente || dni || medSolicitante || filterClinica);\r
    if (hasTextFilters && navigator.onLine && (!filteredData || filteredData.length < 5)) {\r
        try {\r
            const dbResults = await searchPatientsFromSupabase({\r
                codAtencion,\r
                dni,\r
                nomPaciente: nomPaciente || apePaciente,\r
                medSolicitante\r
            });\r
\r
            if (dbResults && dbResults.length > 0) {\r
                dbResults.forEach(p => {\r
                    const idx = patientDatabase.findIndex(x => cleanCodeFunc(x.codAtencion) === cleanCodeFunc(p.codAtencion));\r
                    if (idx !== -1) {\r
                        patientDatabase[idx] = { ...patientDatabase[idx], ...p };\r
                    } else {\r
                        patientDatabase.push(p);\r
                    }\r
                });\r
\r
                sortPatientArray(patientDatabase);\r
                filteredData = patientDatabase.filter(filterFunction);\r
            }\r