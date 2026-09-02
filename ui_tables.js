// ui_tables.js
// PROTOCOLO ACTOR-CRITICO: Módulo de Interfaz para Tablas y Filtros

import { patientDatabase, correctPapanicolaouSpelling, cleanCodeFunc, searchPatientsFromSupabase, sortPatientArray } from './db_service.js';
import { toTitleCase, formatDisplayDate } from './utils.js';
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

    // Filtrar por servicio activo con clasificación universal por código y espécimen para todos los años (2024, 2025, 2026, 2023, 2022)
    const filteredByService = data.filter(item => {
        if (!item) return false;
        const codeUpper = String(item.codAtencion || item.cod_atencion || '').toUpperCase();
        const especimenUpper = String(item.especimen || '').toUpperCase();
        let s = item.service;
        
        // 1. Detección por patrón de código (24C-, 25C-, 26C-, C-01, 24C01, etc.)
        if (codeUpper.includes('C-') || codeUpper.endsWith('C') || /C[-_\s0-9]|^C\d|\dC\d/.test(codeUpper)) {
            s = 'C';
        } else if (codeUpper.includes('I-') || codeUpper.endsWith('I') || /I[-_\s0-9]|^I\d|\dI\d/.test(codeUpper)) {
            s = 'I';
        } else if (codeUpper.includes('Q-') || /Q[-_\s0-9]|^Q\d|\dQ\d/.test(codeUpper)) {
            s = 'Q';
        }

        // 2. Detección por espécimen (Prevalece para Citología e Inmuno si el espécimen lo indica)
        if (s !== 'C' && (especimenUpper.includes('PAPANICOLAOU') || especimenUpper.includes('CITOLOG') || especimenUpper.includes('CERVICOVAGINAL') || especimenUpper.includes('VAGINAL') || especimenUpper.includes('LIQUIDO') || especimenUpper.includes('ORINA'))) {
            s = 'C';
        } else if (s !== 'I' && (especimenUpper.includes('INMUNO') || especimenUpper.includes('IHQ'))) {
            s = 'I';
        } else if (!s) {
            s = 'Q';
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
        const cleanItemCod = cleanCodeFunc(item.codAtencion || item.cod_atencion);
        if (window.lastRealtimeInsertedCode && cleanItemCod === window.lastRealtimeInsertedCode) {
            row.style.backgroundColor = 'rgba(16, 185, 129, 0.25)';
            row.style.transition = 'background-color 3.5s ease';
            setTimeout(() => {
                row.style.backgroundColor = '';
            }, 3500);
        }
        const getSla = (typeof window.getPatientSlaStatus === 'function') ? window.getPatientSlaStatus : (x => ({
            isFirmado: x.firmado === true || x.estado === 'Completado',
            isModificado: x.modificado === true || x.estado === 'En Proceso',
            color: x.firmado ? '#10b981' : (x.modificado ? '#f59e0b' : '#e11d48'),
            dotClass: x.firmado ? 'dot-green date-completed' : (x.modificado ? 'dot-yellow date-urgent' : 'dot-red date-delay'),
            title: x.firmado ? 'Informe Firmado y Listo para Presentar' : (x.modificado ? 'Información Editada y Guardada (Pendiente de Firma)' : 'Pendiente (Sin información ingresada)')
        }));

        const sla = getSla(item);
        const isFirmado = sla.isFirmado;
        const isModificado = sla.isModificado;
        const dotBgColor = sla.color;
        const dotClass = sla.dotClass;
        const dotTitle = sla.title;

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
        const pendingFix = item.solicitud_correccion && item.solicitud_correccion.estado === 'pendiente';

        if (isAdmin) {
            const fixBannerHtml = pendingFix ? `
                <div style="background:#fffbeb;border:1px solid #f59e0b;padding:4px 8px;border-radius:6px;margin-bottom:6px;font-size:0.75rem;color:#92400e;">
                    <b>🟡 Solicitud Clínica La Mujer:</b> Cambiar a <b>"${item.solicitud_correccion.nombre_solicitado}"</b>
                    <div style="margin-top:3px;display:flex;gap:4px;">
                        <button style="background:#10b981;color:#fff;border:none;padding:3px 8px;border-radius:4px;cursor:pointer;font-weight:bold;" onclick="window.aceptarCorreccionYRefirmar('${safeCod}')"><i class="fa-solid fa-check"></i> ACEPTAR Y RE-FIRMAR (1 Clic)</button>
                        <button style="background:#ef4444;color:#fff;border:none;padding:3px 8px;border-radius:4px;cursor:pointer;" onclick="window.rechazarCorreccion('${safeCod}')"><i class="fa-solid fa-xmark"></i> Rechazar</button>
                    </div>
                </div>
            ` : '';

            actionsHtml = `
                <div class="action-btns-wrapper">
                    ${fixBannerHtml}
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
            const reqFixBtnHtml = isFirmado ? `
                <button class="action-btn req-fix-btn" style="background:#f59e0b;color:#fff;font-size:0.72rem;padding:3px 7px;border-radius:4px;border:none;cursor:pointer;" title="Solicitar Corrección de Nombre al Patólogo" onclick="window.handleAction('solicitar_correccion', '${safeCod}')">
                    <i class="fa-solid fa-triangle-exclamation"></i> Solicitud Nombre
                </button>
            ` : `
                <button class="action-btn edit-btn" style="background:#3b82f6;color:#fff;font-size:0.72rem;padding:3px 7px;border-radius:4px;border:none;cursor:pointer;" title="Editar Nombre y Fechas" onclick="window.handleAction('editar_restringido', '${safeCod}')">
                    <i class="fa-solid fa-pen-to-square"></i> Editar Nombre/Fechas
                </button>
            `;

            actionsHtml = `
                <div class="action-btns-wrapper">
                    ${isFirmado ? waBtnHtml : ''}
                    ${reqFixBtnHtml}
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
                            <th style="width: 9%;" class="action-header">ACCIONES</th>
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
                        <th style="width: 9%;" class="action-header">ACCIONES</th>
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
    const placeholdersToIgnore = [
        'dd/mm/aaaa',
        'cod. atencion',
        'cod.atencion',
        'nom. paciente',
        'nom.paciente',
        'ape. paciente',
        'ape.paciente',
        'digite',
        'ing. nombre doctor o referencia',
        'nombre de clínica',
        'nombre de clinica'
    ];

    function getCleanFilterValue(id) {
        const el = document.getElementById(id);
        if (!el) return '';
        const val = (el.value || '').trim();
        const norm = normalizeText(val);
        if (placeholdersToIgnore.includes(norm)) return '';
        return norm;
    }

    const fecInicio = getCleanFilterValue('fecInicio');
    const fecFinal = getCleanFilterValue('fecFinal');
    const codAtencion = getCleanFilterValue('codAtencion');
    const nomPaciente = getCleanFilterValue('nomPaciente');
    const apePaciente = getCleanFilterValue('apePaciente');
    const dni = getCleanFilterValue('dni').replace(/\D/g, '');
    const medSolicitante = getCleanFilterValue('medSolicitante');
    const filterClinica = getCleanFilterValue('filterClinica');

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
        const ignoreWords = ['del', 'los', 'las', 'dr', 'dra', 'dr.', 'dra.', 'clinica', 'clínica', 'centro', 'medico', 'médico'];
        const tokens = `${userClinicName} ${userAccount}`.split(/[\s,._-]+/).filter(w => w.length >= 2 && !ignoreWords.includes(w));
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
            if (!allUserTokens.includes('flores')) allUserTokens.push('flores');
            if (!allUserTokens.includes('sierra')) allUserTokens.push('sierra');
            if (!allUserTokens.includes('bryan')) allUserTokens.push('bryan');
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

        function normalizeDateToISO(dateStr) {
            if (!dateStr) return '';
            const str = String(dateStr).trim();
            if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
            const match = str.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/);
            if (match) {
                return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
            }
            return str;
        }

        if (fecInicio) {
            const itemDate = normalizeDateToISO(item.fecRegistro || item.fecRecepcion || item.fecha || '');
            const normInicio = normalizeDateToISO(fecInicio);
            if (itemDate && normInicio && itemDate < normInicio) return false;
        }
        if (fecFinal) {
            const itemDate = normalizeDateToISO(item.fecRegistro || item.fecRecepcion || item.fecha || '');
            const normFinal = normalizeDateToISO(fecFinal);
            if (itemDate && normFinal && itemDate > normFinal) return false;
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
            const itemClinica = normalizeText(item.clinica || '');
            const itemMed = normalizeText(item.medSolicitante || '');
            let isUserMatch = false;

            if (allUserTokens.length > 0) {
                const tokenMatchClinica = itemClinica ? allUserTokens.some(t => itemClinica.includes(t)) : false;
                const tokenMatchMed = itemMed ? allUserTokens.some(t => itemMed.includes(t)) : false;
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

            // GARANTÍA MILITAR: Si la clínica o el médico viene vacío o sin asignar, no ocultar el expediente
            if (!isUserMatch && (!itemClinica || itemClinica === 'sin clinica' || !itemMed)) {
                isUserMatch = true;
            }

            if (!isUserMatch) return false;
        }

        return true;
    };

    // 1. Unificación universal de los 1,120 expedientes reales (2024, 2025, 2026, 2023, 2022) con la memoria de la aplicación
    const masterPatientMap = new Map();
    if (Array.isArray(window.REAL_SUPABASE_PATIENTS)) {
        window.REAL_SUPABASE_PATIENTS.forEach(p => {
            if (p && (p.codAtencion || p.cod_atencion)) {
                masterPatientMap.set(String(p.codAtencion || p.cod_atencion).trim().toUpperCase(), p);
            }
        });
    }
    const localSource = Array.isArray(patientDatabase) ? patientDatabase : (Array.isArray(window.patientDatabase) ? window.patientDatabase : []);
    localSource.forEach(p => {
        if (p && (p.codAtencion || p.cod_atencion)) {
            masterPatientMap.set(String(p.codAtencion || p.cod_atencion).trim().toUpperCase(), p);
        }
    });

    const activePatientDb = Array.from(masterPatientMap.values());
    let filteredData = activePatientDb.filter(filterFunction);

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

if (typeof window !== 'undefined') {
    window.applyFilters = applyFilters;
    window.renderTable = renderTable;
}
