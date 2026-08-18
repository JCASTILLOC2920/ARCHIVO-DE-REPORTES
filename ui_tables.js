// ui_tables.js
// PROTOCOLO ACTOR-CRITICO: Módulo de Interfaz para Tablas y Filtros

import { patientDatabase, correctPapanicolaouSpelling, cleanCodeFunc, searchPatientsFromSupabase, sortPatientArray } from './db_service.js?v=3.75';

// Elementos del DOM gestionados por este módulo
let tableBody = null;
let currentService = 'Q';
export let currentPage = 1;
export let rowsPerPage = 30;

// Inicializador de elementos
export function initTableUI(bodyElementId) {
    tableBody = document.getElementById(bodyElementId);
}

export function setCurrentService(serviceId) {
    currentService = serviceId;
    currentPage = 1;
}

// Función auxiliar para formato de fecha
function formatDisplayDate(dateStr) {
    if (!dateStr) return '---';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
}

// Renderizado principal matemático de alto rendimiento (Chunked Rendering < 15ms)
export function renderTable(data = patientDatabase) {
    const wrapper = document.querySelector('.table-responsive-wrapper');
    if (!wrapper) {
        console.error("Error: no se encontró .table-responsive-wrapper");
        return;
    }

    // Poblar datalist de clínicas de forma dinámica
    const datalistEl = document.getElementById('clinicasDatalist');
    if (datalistEl) {
        const uniqueClinicas = new Set();
        uniqueClinicas.add("CLINICA LA MUJER");
        uniqueClinicas.add("CLÍNICA CARRIÓN");
        data.forEach(item => {
            if (item.clinica && item.clinica.trim() !== '') {
                uniqueClinicas.add(item.clinica.trim().toUpperCase());
            }
        });
        datalistEl.innerHTML = '';
        Array.from(uniqueClinicas).sort().forEach(clinica => {
            const option = document.createElement('option');
            option.value = clinica;
            datalistEl.appendChild(option);
        });
    }

    // Filtrar por servicio activo con autocuración dinámica de tipo de servicio (C vs Q)
    const filteredByService = data.filter(item => {
        let s = item.service;
        if (!s || (s !== 'C' && s !== 'Q')) {
            const combined = `${item.service || ''} ${item.tipo_servicio || ''} ${item.especimen || ''} ${item.codAtencion || ''} ${item.cod_atencion || ''}`.toUpperCase();
            if (combined.includes('PAPANICOLAOU') || combined.includes('CITOLOG') || combined.includes('-C') || combined.startsWith('C')) {
                s = 'C';
            } else {
                s = 'Q';
            }
            item.service = s;
        }
        return s === currentService;
    });

    // ORDENAR primero (antes de paginar) por año descendente y número descendente (ej: 26Q-235 arriba de 26Q-232)
    sortPatientArray(filteredByService);

    // Lógica de Paginación (después del sort)
    const totalRecords = filteredByService.length;
    const totalPages = Math.ceil(totalRecords / rowsPerPage);
    
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalRecords);
    
    const currentSet = filteredByService.slice(startIndex, endIndex);

    const createRow = (item, index) => {
        const row = document.createElement('tr');

        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const isAdmin = currentUser.perfil === 'Administrador';
        const isFirmado = item.firmado === true || item.estado === 'Completado';
        const hasDiagnostico = (item.diagnostico && String(item.diagnostico).trim() !== '') || isFirmado;

        const paymentClass = item.pagado ? 'payment-completed' : 'payment-pending';
        
        let dateClass = 'date-normal';
        if (hasDiagnostico || isFirmado) {
            dateClass = 'date-completed';
        } else if (isAdmin) {
            // Lógica de alerta de vencimiento (SLA) para el Patólogo
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            
            let entregaDate = null;
            if (item.fecEntrega) {
                const parts = item.fecEntrega.split('-');
                if (parts.length === 3) {
                    entregaDate = new Date(parts[0], parts[1] - 1, parts[2]);
                    entregaDate.setHours(0, 0, 0, 0);
                }
            }

            if (entregaDate) {
                const diffTime = entregaDate.getTime() - hoy.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays < 0) {
                    dateClass = 'date-delay'; // Rojo (Atrasado)
                } else if (diffDays <= 1) {
                    dateClass = 'date-urgent'; // Amarillo/Naranja (Vence hoy o mañana)
                } else {
                    dateClass = 'date-normal'; // Normal
                }
            }
        }

        const costoVal = parseFloat(item.costo) || 0;
        const adelantoVal = parseFloat(item.adelanto) || 0;
        const costoText = `S/ ${costoVal.toFixed(2)}`;
        const adelantoText = `S/ ${adelantoVal.toFixed(2)}`;

        let pacienteName = item.paciente || '';
        if (pacienteName.includes(',')) {
            const parts = pacienteName.split(',');
            pacienteName = `${parts[0].trim()} ${(parts[1] || '').trim()}`;
        }

        let especimenText = (item.especimen !== undefined && item.especimen !== null ? item.especimen : (item.telContacto || '')).trim();
        especimenText = correctPapanicolaouSpelling(especimenText);
        const safeCod = String(item.codAtencion || '').replace(/'/g, "\\'");
        const hasAvance = (item.macroDesc && String(item.macroDesc).trim() !== '') || (item.microDesc && String(item.microDesc).trim() !== '');

        let statusText = 'Pendiente';
        let statusClass = 'status-pending';

        if (hasDiagnostico || isFirmado) {
            statusText = 'Completado';
            statusClass = 'status-completed';
        } else if (hasAvance) {
            statusText = 'En Proceso';
            statusClass = 'status-process';
        }

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${item.codAtencion || '---'}</strong></td>
            <td>${item.dni || '---'}</td>
            <td>${(item.medSolicitante || '---').toUpperCase()}<br><span class="table-clinica-subtext" style="color: #94a3b8; font-size: 0.7rem; font-weight: 500; display: block; margin-top: 2px;">${item.clinica || 'SIN CLÍNICA'}</span></td>
            <td>${pacienteName}</td>
            <td>${especimenText}</td>
            <td class="${paymentClass}">${costoText}</td>
            <td class="${paymentClass}">${adelantoText}</td>
            <td style="text-align: center;">${formatDisplayDate(item.fecRegistro || '')}</td>
            <td class="${dateClass}">${formatDisplayDate(item.fecEntrega || '')}</td>
            <td style="text-align: center;"><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td style="text-align: center;">
                <div class="action-btns-wrapper">
                    <button class="action-btn edit-btn admin-only" title="Editar Registro" onclick="window.handleAction('editar', '${safeCod}')">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                    <button class="action-btn pdf-btn" title="Imprimir Reporte" onclick="window.handleAction('pdf', '${safeCod}')">
                        <i class="fa-solid fa-print"></i>
                    </button>
                    <button class="action-btn delete-btn admin-only" title="Eliminar Registro" onclick="window.handleAction('eliminar', '${safeCod}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
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
                    <th style="width: 3%;">#</th>
                    <th style="width: 8%;">COD-<br>ATENCIÓN</th>
                    <th style="width: 7%;">DNI</th>
                    <th style="width: 15.5%;">MED. SOLICITANTE</th>
                    <th style="width: 15.5%;">PACIENTE</th>
                    <th style="width: 13.5%;">ESPÉCIMEN /<br>MUESTRA</th>
                    <th style="width: 6%;">COSTO<br>SERVICIO</th>
                    <th style="width: 6%;">ADELANTO</th>
                    <th style="width: 7%;">FEC.<br>RECEPCIÓN</th>
                    <th style="width: 7%;">FEC.<br>ENTREGA</th>
                    <th style="width: 5.5%;">ESTADO</th>
                    <th style="width: 6%;" class="action-header">ACCIONES</th>
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

    // Si no hay datos, mostrar tabla única con mensaje
    if (filteredByService.length === 0) {
        wrapper.style.display = 'block';
        wrapper.style.overflowX = 'hidden';
        wrapper.innerHTML = `
            <table class="report-table" id="reportTable">
                <thead>
                    <tr>
                        <th style="width: 3%;">#</th>
                        <th style="width: 8%;">COD-<br>ATENCIÓN</th>
                        <th style="width: 7%;">DNI</th>
                        <th style="width: 15.5%;">MED. SOLICITANTE</th>
                        <th style="width: 15.5%;">PACIENTE</th>
                        <th style="width: 13.5%;">ESPÉCIMEN /<br>MUESTRA</th>
                        <th style="width: 6%;">COSTO<br>SERVICIO</th>
                        <th style="width: 6%;">ADELANTO</th>
                        <th style="width: 7%;">FEC.<br>RECEPCIÓN</th>
                        <th style="width: 7%;">FEC.<br>ENTREGA</th>
                        <th style="width: 5.5%;">ESTADO</th>
                        <th style="width: 6%;" class="action-header">ACCIONES</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colspan="12" style="text-align: center; padding: 20px; color: var(--text-secondary);">
                            No se encontraron registros de pacientes para los filtros seleccionados.
                        </td>
                    </tr>
                </tbody>
            </table>
        `;
        // Actualizar información a 0
        const infoEl = document.getElementById('patientsTableInfo');
        if (infoEl) infoEl.textContent = `Mostrando 0 a 0 de 0 registros`;
        const pagEl = document.getElementById('patientsPagination');
        if (pagEl) pagEl.innerHTML = '';
        return;
    }

    // (Sort ya aplicado antes de la paginación)

    wrapper.style.display = 'block';
    wrapper.style.overflowX = 'hidden';
    wrapper.innerHTML = `
        <table class="report-table" id="reportTable">
            <thead>
                <tr>
                    <th style="width: 3%;">#</th>
                    <th style="width: 8%;">COD-<br>ATENCIÓN</th>
                    <th style="width: 7%;">DNI</th>
                    <th style="width: 15.5%;">MED. SOLICITANTE</th>
                    <th style="width: 15.5%;">PACIENTE</th>
                    <th style="width: 13.5%;">ESPÉCIMEN /<br>MUESTRA</th>
                    <th style="width: 6%;">COSTO<br>SERVICIO</th>
                    <th style="width: 6%;">ADELANTO</th>
                    <th style="width: 7%;">FEC.<br>RECEPCIÓN</th>
                    <th style="width: 7%;">FEC.<br>ENTREGA</th>
                    <th style="width: 5.5%;">ESTADO</th>
                    <th style="width: 6%;" class="action-header">ACCIONES</th>
                </tr>
            </thead>
            <tbody id="tableBody"></tbody>
        </table>
    `;
    const tbody = document.getElementById('tableBody');
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
    applyFilters(false);
};

function normalizeText(text) {
    if (!text) return '';
    return text.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export async function applyFilters(resetPage = true) {
    if (resetPage) currentPage = 1;
    const fecInicio = document.getElementById('fecInicio')?.value || '';
    const fecFinal = document.getElementById('fecFinal')?.value || '';
    const codAtencion = normalizeText(document.getElementById('codAtencion')?.value.trim());
    const nomPaciente = normalizeText(document.getElementById('nomPaciente')?.value.trim());
    const apePaciente = normalizeText(document.getElementById('apePaciente')?.value.trim());
    const dni = document.getElementById('dni')?.value.trim();
    const medSolicitante = normalizeText(document.getElementById('medSolicitante')?.value.trim());
    const filterClinica = normalizeText(document.getElementById('filterClinica')?.value.trim());

    const filterFunction = (item) => {
        if (codAtencion) {
            const cleanTarget = codAtencion.replace(/[-_\s]/g, '');
            const dbCod = normalizeText(item.codAtencion);
            const cleanDbCod = dbCod.replace(/[-_\s]/g, '');
            if (!dbCod.includes(codAtencion) && !cleanDbCod.includes(cleanTarget)) return false;
        }

        if (dni && !(item.dni && String(item.dni).includes(dni))) return false;

        const dbNombres = normalizeText(item.nombres);
        const dbApellidos = normalizeText(item.apellidos);
        const dbPaciente = normalizeText(item.paciente); 

        if (nomPaciente) {
            const words = nomPaciente.split(/\s+/).filter(Boolean);
            const matchesNom = words.every(w => dbNombres.includes(w) || dbApellidos.includes(w) || dbPaciente.includes(w));
            if (!matchesNom) return false;
        }

        if (apePaciente) {
            const words = apePaciente.split(/\s+/).filter(Boolean);
            const matchesApe = words.every(w => dbNombres.includes(w) || dbApellidos.includes(w) || dbPaciente.includes(w));
            if (!matchesApe) return false;
        }

        if (medSolicitante && !normalizeText(item.medSolicitante).includes(medSolicitante)) return false;
        if (filterClinica && !(normalizeText(item.clinica).includes(filterClinica) || normalizeText(item.medSolicitante).includes(filterClinica))) return false;

        if (fecInicio) {
            const dateTarget = item.fecRegistro || item.fecEntrega || '';
            if (dateTarget < fecInicio) return false;
        }
        if (fecFinal) {
            const dateTarget = item.fecRegistro || item.fecEntrega || '';
            if (dateTarget > fecFinal) return false;
        }

        return true;
    };

    // 1. Filtrado local básico en la memoria caché
    let filteredData = patientDatabase.filter(filterFunction);

    // 2. Si no se encuentran resultados locales y el usuario ingresó algún criterio de texto,
    // consultar directamente a Supabase de forma remota para recuperar registros históricos
    const hasTextFilters = !!(codAtencion || nomPaciente || apePaciente || dni || medSolicitante || filterClinica);
    if (filteredData.length === 0 && hasTextFilters && navigator.onLine) {
        const infoEl = document.getElementById('patientsTableInfo');
        if (infoEl) infoEl.textContent = "Buscando en la nube de Supabase...";

        try {
            const dbResults = await searchPatientsFromSupabase({
                codAtencion,
                dni,
                nomPaciente: nomPaciente || apePaciente,
                medSolicitante
            });

            if (dbResults && dbResults.length > 0) {
                // Fusionar de forma limpia en la base de datos de memoria
                dbResults.forEach(p => {
                    const exists = patientDatabase.some(x => cleanCodeFunc(x.codAtencion) === cleanCodeFunc(p.codAtencion));
                    if (!exists) {
                        patientDatabase.push(p);
                    }
                });

                // Re-filtrar localmente con los datos recién traídos de la nube
                filteredData = patientDatabase.filter(filterFunction);
            }
        } catch (e) {
            console.error("Error realizando búsqueda remota:", e);
        }
    }

    renderTable(filteredData);
}
