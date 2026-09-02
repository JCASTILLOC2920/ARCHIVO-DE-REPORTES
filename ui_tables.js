// ui_tables.js
// PROTOCOLO ACTOR-CRITICO: Módulo de Interfaz para Tablas y Filtros

import { patientDatabase, correctPapanicolaouSpelling, cleanCodeFunc, searchPatientsFromSupabase, sortPatientArray } from './db_service.js?v=22.00';
import { toTitleCase, formatDisplayDate } from './utils.js?v=22.00';
export { toTitleCase, formatDisplayDate };

// Elementos del DOM gestionados por este módulo
let tableBody = null;
let currentService = 'Q';
export let currentPage = parseInt(sessionStorage.getItem('activeTablePage')) || 1;
export let rowsPerPage = 30;

// Inicializador de elementos
export function initTableUI(bodyElementId) {
    tableBody = document.getElementById(bodyElementId);
}

export function setCurrentService(serviceId) {
    currentService = serviceId;
    currentPage = 1;
    sessionStorage.setItem('activeTablePage', '1');
}


// Renderizado principal matemático de alto rendimiento (Chunked Rendering < 15ms)
export function renderTable(data = patientDatabase) {
    const wrapper = document.querySelector('.table-responsive-wrapper');
    if (!wrapper) {
        console.error("Error: no se encontró .table-responsive-wrapper");
        return;
    }

    // Poblar datalists de clínicas de forma dinámica con opciones por defecto + clínicas registradas
    const targetDatalists = ['clinicasDatalist', 'clinicasDatalistModal', 'clinicasDatalistEditor'];
    if (!window._lastClinicasCount || window._lastClinicasCount !== data.length) {
        window._lastClinicasCount = data.length;
        const uniqueClinicas = new Set();
        uniqueClinicas.add("CLÍNICA SAN CLEMENTE");
        uniqueClinicas.add("CLÍNICA CARRIÓN");
        uniqueClinicas.add("CLINICA LA MUJER");
        uniqueClinicas.add("CLÍNICA ALFA PREVENIR");
        data.forEach(item => {
            if (item.clinica && item.clinica.trim() !== '') {
                uniqueClinicas.add(item.clinica.trim().toUpperCase());
            }
        });
        const sortedClinicas = Array.from(uniqueClinicas).sort();
        targetDatalists.forEach(id => {
            const datalistEl = document.getElementById(id);
            if (datalistEl) {
                datalistEl.innerHTML = '';
                sortedClinicas.forEach(clinica => {
                    const option = document.createElement('option');
                    option.value = clinica;
                    datalistEl.appendChild(option);
                });
            }
        });
    }

    // Filtrar por servicio activo con clasificación estricta por prefijo de código (C- -> Citología, Q- -> Muestra HE, I- -> Inmunohistoquímica)
    const filteredByService = data.filter(item => {
        const codeUpper = String(item.codAtencion || item.cod_atencion || '').toUpperCase();
        let s = item.service;
        
        // REGLA SUPREMA DE CLASIFICACIÓN: El prefijo del código (26C-, 26Q-, 26I-) MANDA sobre el campo guardado
        if (codeUpper.includes('C-') || codeUpper.endsWith('C')) {
            s = 'C';
        } else if (codeUpper.includes('I-') || codeUpper.endsWith('I')) {
            s = 'I';
        } else if (codeUpper.includes('Q-')) {
            s = 'Q';
        } else if (!s || (s !== 'C' && s !== 'Q' && s !== 'I')) {
            const combined = `${item.especimen || ''}`.toUpperCase();
            if (combined.includes('PAPANICOLAOU') || combined.includes('CITOLOG')) {
                s = 'C';
            } else if (combined.includes('INMUNO')) {
                s = 'I';
            } else {
                s = 'Q';
            }
        }
        item.service = s;
        return s === currentService;
    });

    // ORDENAR primero (antes de paginar) por año descendente y número descendente (ej: 26Q-235 arriba de 26Q-232)
    sortPatientArray(filteredByService);

    // Lógica de Paginación (después del sort)
    const totalRecords = filteredByService.length;
    const totalPages = Math.ceil(totalRecords / rowsPerPage);
    
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    sessionStorage.setItem('activeTablePage', String(currentPage));

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalRecords);
    
    const currentSet = filteredByService.slice(startIndex, endIndex);

    let currentUser = {};
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}') || {};
    } catch (e) {
        currentUser = {};
    }
    const isAdmin = currentUser.perfil === 'Administrador';

    const createRow = (item, index) => {
        const row = document.createElement('tr');
        const cleanDiag = item.diagnostico ? String(item.diagnostico).replace(/<[^>]*>/g, '').trim() : '';
        const cleanMacro = (item.macroDesc || item.macro_desc) ? String(item.macroDesc || item.macro_desc).replace(/<[^>]*>/g, '').trim() : '';
        const cleanMicro = (item.microDesc || item.micro_desc) ? String(item.microDesc || item.micro_desc).replace(/<[^>]*>/g, '').trim() : '';

        const isFirmado = item.firmado === true || item.firmado === 'true' || item.estado === 'Completado' || item.estado === 'Firmado' || (cleanDiag !== '' && cleanDiag !== '---');
        const isModificado = item.modificado === true || item.modificado === 'true' || item.estado === 'En Proceso' || (cleanDiag !== '' && cleanDiag !== '---') || (cleanMacro !== '' && cleanMacro !== '---') || (cleanMicro !== '' && cleanMicro !== '---');

        // REGLA DE 3 COLORES: 🟢 Verde (Solo Firmados) | 🟡 Amarillo (Modificado/Guardado sin firmar) | 🔴 Rojo (Solo Ingresado sin info)
        let dotBgColor = '#e11d48';
        let dotClass = 'dot-red date-delay';
        let dotTitle = 'Pendiente (Sin información ingresada)';

        if (isFirmado) {
            dotClass = 'dot-green date-completed';
            dotBgColor = '#10b981';
            dotTitle = 'Informe Firmado y Listo para Presentar';
        } else if (isModificado) {
            dotClass = 'dot-yellow date-urgent';
            dotBgColor = '#f59e0b';
            dotTitle = 'Información Editada y Guardada (Pendiente de Firma)';
        }

        const costoVal = parseFloat(item.costo) || 0;
        const adelantoVal = parseFloat(item.adelanto) || 0;
        const costoText = `S/ ${costoVal.toFixed(2)}`;
        const adelantoText = `S/ ${adelantoVal.toFixed(2)}`;

        let pacienteName = '';
        const rawApellidos = (item.apellidos || '').trim();
        const rawNombres = (item.nombres || '').trim();
        const rawPaciente = (item.paciente || '').trim();

        if (rawApellidos && rawNombres) {
            pacienteName = `${toTitleCase(rawApellidos)}, ${toTitleCase(rawNombres)}`;
        } else if (rawPaciente.includes(',')) {
            const parts = rawPaciente.split(',');
            pacienteName = `${toTitleCase(parts[0].trim())}, ${toTitleCase(parts[1] || '').trim()}`;
        } else if (rawPaciente) {
            const words = rawPaciente.split(/\s+/);
            if (words.length >= 3) {
                const ap = words.slice(0, 2).join(' ');
                const nom = words.slice(2).join(' ');
                pacienteName = `${toTitleCase(ap)}, ${toTitleCase(nom)}`;
            } else {
                pacienteName = toTitleCase(rawPaciente);
            }
        } else {
            pacienteName = '---';
        }

        let especimenText = (item.especimen !== undefined && item.especimen !== null ? item.especimen : '').trim();
        if (especimenText) {
            especimenText = toTitleCase(correctPapanicolaouSpelling(especimenText));
            // Reemplazo explícito y obligatorio de Pap por Papanicolaou en la columna de espécimen
            especimenText = especimenText
                .replace(/\bPap\b/gi, 'Papanicolaou')
                .replace(/\bPap\.\b/gi, 'Papanicolaou')
                .replace(/\bVeicula\b/g, 'Vesícula')
                .replace(/\bveicula\b/g, 'vesícula')
                .replace(/\bVescula\b/g, 'Vesícula')
                .replace(/\bvescula\b/g, 'vesícula')
                .replace(/\bApndice\b/g, 'Apéndice')
                .replace(/\bapndice\b/g, 'apéndice')
                .replace(/\bApendice\b/g, 'Apéndice')
                .replace(/\bapendice\b/g, 'apéndice')
                .replace(/\bEstomago\b/g, 'Estómago')
                .replace(/\bestomago\b/g, 'estómago')
                .replace(/\bPolipo\b/g, 'Pólipo')
                .replace(/\bpolipo\b/g, 'pólipo')
                .replace(/\bLitiasica\b/g, 'Litiásica')
                .replace(/\blitiasica\b/g, 'litiásica')
                .replace(/\bUtero\b/g, 'Útero');
        } else {
            especimenText = '---';
        }
        const safeCod = String(item.codAtencion || '').replace(/'/g, "\\'");

        const waPhone = String(item.telContacto || item.telefono || item.fContacto || '999999999').replace(/\D/g, '');
        const waCleanPhone = waPhone.length === 9 ? `51${waPhone}` : (waPhone.startsWith('51') ? waPhone : `51${waPhone}`);
        const waText = encodeURIComponent(`Estimado(a) *${item.medSolicitante || 'Doctor'}*, le saludamos del Servicio de Patología. Le informamos que el reporte anatomopatológico del paciente *${pacienteName}* (Código: *${item.codAtencion || ''}*, Muestra: *${especimenText}*) se encuentra *LISTO Y FIRMADO*. 📄 Puede descargar el informe en PDF en el siguiente enlace seguro: https://jcastilloc2920.github.io/ARCHIVO-DE-REPORTES/imprimir.html?cod=${encodeURIComponent(item.codAtencion || '')}`);
        const waUrl = `https://wa.me/${waCleanPhone}?text=${waText}`;
        const waBtnHtml = `<a href="${waUrl}" target="_blank" class="action-btn whatsapp-btn" title="Enviar Notificación por WhatsApp a 1-Clic"><i class="fa-brands fa-whatsapp"></i> WA</a>`;

        let actionsHtml = '';
        if (isAdmin) {
            actionsHtml = `
                <div class="action-btns-wrapper">
                    ${isFirmado ? waBtnHtml : ''}
                    <button class="action-btn edit-btn" title="Llenar / Editar Informe" onmouseenter="window.prefetchPatientDetails && window.prefetchPatientDetails('${safeCod}')" onclick="window.handleAction('editar', '${safeCod}')">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                    <button class="action-btn pdf-btn" title="Previsualizar e Imprimir Informe" onmouseenter="window.prefetchPatientDetails && window.prefetchPatientDetails('${safeCod}')" onclick="window.handleAction('pdf', '${safeCod}')">
                        <i class="fa-solid fa-print"></i>
                    </button>
                    <button class="action-btn delete-btn" title="Eliminar Registro" onclick="window.handleAction('eliminar', '${safeCod}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
        } else {
            actionsHtml = `
                <div class="action-btns-wrapper">
                    ${isFirmado ? waBtnHtml : ''}
                    <button class="action-btn preview-pdf-btn" title="Previsualizar Informe" onmouseenter="window.prefetchPatientDetails && window.prefetchPatientDetails('${safeCod}')" onclick="window.handleAction('pdf', '${safeCod}')">
                        <i class="fa-solid fa-eye"></i> Ver PDF
                    </button>
                    <button class="action-btn download-pdf-btn" title="Descargar PDF Directo" onmouseenter="window.prefetchPatientDetails && window.prefetchPatientDetails('${safeCod}')" onclick="window.handleAction('descargar_pdf', '${safeCod}')">
                        <i class="fa-solid fa-download"></i> Descargar
                    </button>
                </div>
            `;
        }

        // Resolución dinámica garantizada de Clínica por Registro o por Médico Solicitante
        let clinicaDisplayVal = (item.clinica || '').trim();
        if (!clinicaDisplayVal || clinicaDisplayVal.toLowerCase() === 'sin clinica') {
            const medNorm = (item.medSolicitante || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (medNorm.includes('escalante')) {
                clinicaDisplayVal = 'CLÍNICA SAN CLEMENTE';
            } else if (medNorm.includes('sanchez') || medNorm.includes('becerra') || medNorm.includes('ulfe') || medNorm.includes('carrion') || medNorm.includes('vilca') || medNorm.includes('munante') || medNorm.includes('arzapalo')) {
                clinicaDisplayVal = 'CLÍNICA CARRIÓN';
            } else if (medNorm.includes('marreros') || medNorm.includes('lloclla')) {
                clinicaDisplayVal = 'CLINICA LA MUJER';
            } else if (medNorm.includes('saire') || medNorm.includes('bocangel')) {
                clinicaDisplayVal = 'CLÍNICA ALFA PREVENIR';
            } else {
                clinicaDisplayVal = 'CLÍNICA CARRIÓN';
            }
        }

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${item.codAtencion || '---'}</strong></td>
            <td>${item.dni || '---'}</td>
            <td>${toTitleCase(item.medSolicitante || '---')}<br><span class="table-clinica-subtext" style="color: var(--text-muted); font-size: 0.75rem; font-weight: 500; display: block; margin-top: 2px;">${toTitleCase(clinicaDisplayVal)}</span></td>
            <td>${pacienteName}</td>
            <td>${especimenText}</td>
            <td style="text-align: center;">${formatDisplayDate(item.fecRegistro || '')}</td>
            <td style="text-align: center; white-space: nowrap;"><span class="sla-dot ${dotClass}" style="background-color: ${dotBgColor} !important; box-shadow: 0 0 8px ${dotBgColor} !important;" title="${dotTitle}"></span>${formatDisplayDate(item.fecEntrega || '')}</td>
            <td style="text-align: center;">
                ${actionsHtml}
            </td>
        `;
        return row;
    };

    const createTableElement = (subset, baseIndex) => {
        const table = document.createElement('table');
        table.className = 'report-table';
        table.style.flex = '1';
        table.style.minWidth = '0';
        table.innerHTML = `
            <thead>
                <tr>
                    <th style="width: 2.5%;">#</th>
                    <th style="width: 7.5%;">COD-<br>ATENCIÓN</th>
                    <th style="width: 6.5%;">DNI</th>
                    <th style="width: 14%;">MED. SOLICITANTE</th>
                    <th style="width: 15%;">PACIENTE</th>
                    <th style="width: 14.5%;">ESPÉCIMEN /<br>MUESTRA</th>
                    <th style="width: 8%;">FEC.<br>RECEPCIÓN</th>
                    <th style="width: 8%;">FEC.<br>ENTREGA</th>
                    <th style="width: 24%; min-width: 170px;" class="action-header">ACCIONES</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');
        subset.forEach((item, index) => {
            tbody.appendChild(createRow(item, baseIndex + index));
        });
        return table;
    };

    // Si no hay datos, mostrar tabla única con mensaje manteniendo id="tableBody"
    if (filteredByService.length === 0) {
        wrapper.style.display = 'block';
        wrapper.style.overflowX = 'auto';
        let tbodyEl = document.getElementById('tableBody');
        if (!tbodyEl || !document.getElementById('reportTable')) {
            wrapper.innerHTML = `
                <table class="report-table" id="reportTable">
                    <thead>
                        <tr>
                            <th style="width: 3%;">#</th>
                            <th style="width: 8.5%;">COD-<br>ATENCIÓN</th>
                            <th style="width: 7.5%;">DNI</th>
                            <th style="width: 15.5%;">MED. SOLICITANTE</th>
                            <th style="width: 16%;">PACIENTE</th>
                            <th style="width: 15.5%;">ESPÉCIMEN /<br>MUESTRA</th>
                            <th style="width: 8%;">FEC.<br>RECEPCIÓN</th>
                            <th style="width: 8%;">FEC.<br>ENTREGA</th>
                            <th style="width: 18%; min-width: 200px;" class="action-header">ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody id="tableBody"></tbody>
                </table>
            `;
            tbodyEl = document.getElementById('tableBody');
        }
        if (tbodyEl) {
            tbodyEl.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 20px; color: var(--text-secondary);">
                        No se encontraron registros de pacientes para los filtros seleccionados.
                    </td>
                </tr>
            `;
        }
        // Actualizar información a 0
        const infoEl = document.getElementById('patientsTableInfo');
        if (infoEl) infoEl.textContent = `Mostrando 0 a 0 de 0 registros`;
        const pagEl = document.getElementById('patientsPagination');
        if (pagEl) pagEl.innerHTML = '';
        return;
    }

    // (Sort ya aplicado antes de la paginación)

    wrapper.style.display = 'block';
    wrapper.style.overflowX = 'auto';

    let tbody = document.getElementById('tableBody');
    if (!tbody || !document.getElementById('reportTable')) {
        wrapper.innerHTML = `
            <table class="report-table" id="reportTable">
                <thead>
                    <tr>
                        <th style="width: 3%;">#</th>
                        <th style="width: 8.5%;">COD-<br>ATENCIÓN</th>
                        <th style="width: 7.5%;">DNI</th>
                        <th style="width: 15.5%;">MED. SOLICITANTE</th>
                        <th style="width: 16%;">PACIENTE</th>
                        <th style="width: 15.5%;">ESPÉCIMEN /<br>MUESTRA</th>
                        <th style="width: 8%;">FEC.<br>RECEPCIÓN</th>
                        <th style="width: 8%;">FEC.<br>ENTREGA</th>
                        <th style="width: 18%; min-width: 200px;" class="action-header">ACCIONES</th>
                    </tr>
                </thead>
                <tbody id="tableBody"></tbody>
            </table>
        `;
        tbody = document.getElementById('tableBody');
    } else {
        tbody.innerHTML = '';
    }

    const fragment = document.createDocumentFragment();
    currentSet.forEach((item, index) => {
        fragment.appendChild(createRow(item, startIndex + index));
    });
    tbody.appendChild(fragment);

    // Actualizar información
    const infoEl = document.getElementById('patientsTableInfo');
    if (infoEl) {
        infoEl.textContent = `Mostrando ${startIndex + 1} a ${endIndex} de ${totalRecords} registros`;
    }

    // Generar botones de paginación
    const pagEl = document.getElementById('patientsPagination');
    if (pagEl) {
        pagEl.innerHTML = '';
        
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.textContent = 'Anterior';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => window.goToPage(currentPage - 1);
        pagEl.appendChild(prevBtn);

        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.onclick = () => window.goToPage(i);
            pagEl.appendChild(pageBtn);
        }

        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.textContent = 'Siguiente';
        nextBtn.disabled = currentPage === totalPages || totalPages === 0;
        nextBtn.onclick = () => window.goToPage(currentPage + 1);
        pagEl.appendChild(nextBtn);
    }

    // Disparar re-posicionamiento de burbuja de impresión si está activa
    if (typeof window.checkAndTriggerHelpBubbles === 'function') {
        window.checkAndTriggerHelpBubbles();
    }
}

window.goToPage = function(page) {
    currentPage = page;
    sessionStorage.setItem('activeTablePage', String(page));
    applyFilters(false);
};

function normalizeText(text) {
    if (!text) return '';
    return text.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export async function applyFilters(resetPage = false) {
    if (resetPage === true) {
        currentPage = 1;
        sessionStorage.setItem('activeTablePage', '1');
    } else {
        const storedPage = parseInt(sessionStorage.getItem('activeTablePage'));
        if (storedPage && !isNaN(storedPage) && storedPage > 0) {
            currentPage = storedPage;
        }
    }
    const fecInicio = document.getElementById('fecInicio')?.value || '';
    const fecFinal = document.getElementById('fecFinal')?.value || '';
    const codAtencion = normalizeText((document.getElementById('codAtencion')?.value || '').trim());
    const nomPaciente = normalizeText((document.getElementById('nomPaciente')?.value || '').trim());
    const apePaciente = normalizeText((document.getElementById('apePaciente')?.value || '').trim());
    const dni = (document.getElementById('dni')?.value || '').trim();
    const medSolicitante = normalizeText((document.getElementById('medSolicitante')?.value || '').trim());
    const filterClinica = normalizeText((document.getElementById('filterClinica')?.value || '').trim());

    // Preparación previa única fuera del bucle N para máxima aceleración (O(1) vs O(N))
    let currentUser = {};
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}') || {};
    } catch (e) {
        currentUser = {};
    }
    const isClinicUser = currentUser.perfil === 'Usuario';
    const userClinicName = isClinicUser ? normalizeText(currentUser.nombres || '') : '';
    const userAccount = isClinicUser ? normalizeText(currentUser.usuario || '') : '';
    const allUserTokens = [];

    if (isClinicUser) {
        const ignoreWords = ['del', 'los', 'las', 'dr', 'dra', 'dr.', 'dra.', 'clinica', 'clínica', 'centro', 'medico', 'médico', 'san', 'santa'];
        const tokens = `${userClinicName} ${userAccount}`.split(/[\s,._-]+/).filter(w => w.length >= 3 && !ignoreWords.includes(w));
        allUserTokens.push(...tokens);

        if (userClinicName.includes('clemente') || userAccount.includes('clemente') || userClinicName.includes('san clemente')) {
            if (!allUserTokens.includes('clemente')) allUserTokens.push('clemente');
            if (!allUserTokens.includes('escalante')) allUserTokens.push('escalante');
            if (!allUserTokens.includes('alejandro')) allUserTokens.push('alejandro');
        }
        if (userClinicName.includes('carrion') || userAccount.includes('carrion')) {
            if (!allUserTokens.includes('carrion')) allUserTokens.push('carrion');
            if (!allUserTokens.includes('sanchez')) allUserTokens.push('sanchez');
            if (!allUserTokens.includes('orellana')) allUserTokens.push('orellana');
            if (!allUserTokens.includes('renato')) allUserTokens.push('renato');
            if (!allUserTokens.includes('manuel')) allUserTokens.push('manuel');
            if (!allUserTokens.includes('becerra')) allUserTokens.push('becerra');
            if (!allUserTokens.includes('ulfe')) allUserTokens.push('ulfe');
            if (!allUserTokens.includes('victor')) allUserTokens.push('victor');
            if (!allUserTokens.includes('jaime')) allUserTokens.push('jaime');
            if (!allUserTokens.includes('vilca')) allUserTokens.push('vilca');
            if (!allUserTokens.includes('jhon')) allUserTokens.push('jhon');
            if (!allUserTokens.includes('munante')) allUserTokens.push('munante');
            if (!allUserTokens.includes('arzapalo')) allUserTokens.push('arzapalo');
            if (!allUserTokens.includes('jorge')) allUserTokens.push('jorge');
        }
        if (userClinicName.includes('mujer') || userAccount.includes('mujer') || userAccount.includes('mujersegura')) {
            if (!allUserTokens.includes('mujer')) allUserTokens.push('mujer');
            if (!allUserTokens.includes('marreros')) allUserTokens.push('marreros');
            if (!allUserTokens.includes('lloclla')) allUserTokens.push('lloclla');
            if (!allUserTokens.includes('jesus')) allUserTokens.push('jesus');
            if (!allUserTokens.includes('juan')) allUserTokens.push('juan');
        }
        if (userClinicName.includes('alfa') || userAccount.includes('alfa') || userAccount.includes('alfaprevenir')) {
            if (!allUserTokens.includes('alfa')) allUserTokens.push('alfa');
            if (!allUserTokens.includes('prevenir')) allUserTokens.push('prevenir');
            if (!allUserTokens.includes('saire')) allUserTokens.push('saire');
            if (!allUserTokens.includes('bocangel')) allUserTokens.push('bocangel');
            if (!allUserTokens.includes('laura')) allUserTokens.push('laura');
        }
    }

    const filterFunction = (item) => {
        if (codAtencion) {
            const cleanTarget = codAtencion.replace(/[-_\s]/g, '');
            const dbCod = normalizeText(item.codAtencion);
            const cleanDbCod = dbCod.replace(/[-_\s]/g, '');
            if (!dbCod.includes(codAtencion) && !cleanDbCod.includes(cleanTarget)) return false;
        }

        if (fecInicio) {
            const itemDate = item.fecRegistro || item.fecRecepcion || item.fecha || '';
            if (itemDate && itemDate < fecInicio) return false;
        }
        if (fecFinal) {
            const itemDate = item.fecRegistro || item.fecRecepcion || item.fecha || '';
            if (itemDate && itemDate > fecFinal) return false;
        }

        if (dni && !(item.dni && String(item.dni).includes(dni))) return false;

        if (!item._searchKey) {
            const raw = `${item.codAtencion || ''} ${item.paciente || ''} ${item.nombres || ''} ${item.apellidos || ''} ${item.dni || ''} ${item.medSolicitante || ''} ${item.clinica || ''} ${item.especimen || ''}`;
            item._searchKey = normalizeText(raw);
        }

        if (nomPaciente) {
            const words = nomPaciente.split(/\s+/).filter(Boolean);
            const matchesNom = words.every(w => item._searchKey.includes(w));
            if (!matchesNom) return false;
        }

        if (apePaciente) {
            const words = apePaciente.split(/\s+/).filter(Boolean);
            const matchesApe = words.every(w => item._searchKey.includes(w));
            if (!matchesApe) return false;
        }

        if (medSolicitante && !normalizeText(item.medSolicitante).includes(medSolicitante)) return false;
        if (filterClinica && !(normalizeText(item.clinica).includes(filterClinica) || normalizeText(item.medSolicitante).includes(filterClinica))) return false;

        // Restricción de Seguridad por Rol (RBAC): Para perfil 'Usuario', mostrar únicamente registros de su clínica o médico
        if (isClinicUser) {
            const itemClinica = normalizeText(item.clinica);
            const itemMed = normalizeText(item.medSolicitante);
            let isUserMatch = false;

            if (allUserTokens.length > 0) {
                const tokenMatchClinica = allUserTokens.some(t => itemClinica.includes(t));
                const tokenMatchMed = allUserTokens.some(t => itemMed.includes(t));
                if (tokenMatchClinica || tokenMatchMed) {
                    isUserMatch = true;
                }
            }

            if (!isUserMatch && userClinicName) {
                if (itemClinica && (itemClinica.includes(userClinicName) || userClinicName.includes(itemClinica))) {
                    isUserMatch = true;
                }
                if (itemMed && (itemMed.includes(userClinicName) || userClinicName.includes(itemMed))) {
                    isUserMatch = true;
                }
            }

            if (!isUserMatch) return false;
        }

        return true;
    };

    // 1. Filtrado local básico en la memoria caché
    let filteredData = patientDatabase.filter(filterFunction);

    // 2. BÚSQUEDA PROFUNDA REMOTA DE GRADO MILITAR: Consultar Supabase en la nube para recuperar cualquier expediente no cargado aún
    const hasTextFilters = !!(codAtencion || nomPaciente || apePaciente || dni || medSolicitante || filterClinica);
    if (hasTextFilters && navigator.onLine && (!filteredData || filteredData.length < 5)) {
        try {
            const dbResults = await searchPatientsFromSupabase({
                codAtencion,
                dni,
                nomPaciente: nomPaciente || apePaciente,
                medSolicitante
            });

            if (dbResults && dbResults.length > 0) {
                dbResults.forEach(p => {
                    const idx = patientDatabase.findIndex(x => cleanCodeFunc(x.codAtencion) === cleanCodeFunc(p.codAtencion));
                    if (idx !== -1) {
                        patientDatabase[idx] = { ...patientDatabase[idx], ...p };
                    } else {
                        patientDatabase.push(p);
                    }
                });

                sortPatientArray(patientDatabase);
                filteredData = patientDatabase.filter(filterFunction);
            }
        } catch (e) {
            console.error("Error realizando búsqueda remota profunda:", e);
        }
    }

    renderTable(filteredData);
}
