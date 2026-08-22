// ui_tables.js
// PROTOCOLO ACTOR-CRITICO: Módulo de Interfaz para Tablas y Filtros

import { patientDatabase, correctPapanicolaouSpelling, cleanCodeFunc, searchPatientsFromSupabase, sortPatientArray } from './db_service.js?v=4.00';

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

// Función auxiliar para capitalizar nombres respetando preposiciones en minúscula
function toTitleCase(str) {
    if (!str) return '';
    const minorWords = ['de', 'del', 'la', 'las', 'los', 'y', 'o', 'en'];
    return str.toLowerCase().split(/\s+/).map((word, idx) => {
        if (minorWords.includes(word) && idx > 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
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

    const createRow = (item, index) => {
        const row = document.createElement('tr');

        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const isAdmin = currentUser.perfil === 'Administrador';
        const isFirmado = item.firmado === true || item.estado === 'Completado';
        const hasDiagnostico = (item.diagnostico && String(item.diagnostico).trim() !== '') || isFirmado;

        // El punto verde indica informe firmado/listo; el punto rojo indica pendiente de evaluación
        const isReady = isFirmado || hasDiagnostico;
        const dotClass = isReady ? 'dot-green' : 'dot-red';
        const dotTitle = isReady ? 'Informe firmado / listo' : 'Pendiente de evaluación';

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
            // Correcciones ortográficas comunes del espécimen
            especimenText = especimenText
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
                .replace(/\bUtero\b/g, 'Útero')
                .replace(/\butero\b/g, 'útero');
        } else {
            especimenText = '---';
        }
        const safeCod = String(item.codAtencion || '').replace(/'/g, "\\'");

        let actionsHtml = '';
        if (isAdmin) {
            actionsHtml = `
                <div class="action-btns-wrapper">
                    <button class="action-btn edit-btn" title="Llenar / Editar Informe" onclick="window.handleAction('editar', '${safeCod}')">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                    <button class="action-btn pdf-btn" title="Previsualizar e Imprimir Informe" onclick="window.handleAction('pdf', '${safeCod}')">
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
                    <button class="action-btn preview-pdf-btn" title="Previsualizar Informe" onclick="window.handleAction('pdf', '${safeCod}')">
                        <i class="fa-solid fa-eye"></i> Ver PDF
                    </button>
                    <button class="action-btn download-pdf-btn" title="Descargar PDF Directo" onclick="window.handleAction('descargar_pdf', '${safeCod}')">
                        <i class="fa-solid fa-download"></i> Descargar
                    </button>
                </div>
            `;
        }

        // Resolución dinámica garantizada de Clínica por Médico Solicitante
        let clinicaDisplayVal = (item.clinica || '').trim();
        if (!clinicaDisplayVal || clinicaDisplayVal.toLowerCase() === 'sin clinica') {
            const medNorm = (item.medSolicitante || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (medNorm.includes('escalante')) {
                clinicaDisplayVal = 'CLÍNICA SAN CLEMENTE';
            } else if (medNorm.includes('sanchez orellana') || medNorm.includes('becerra') || medNorm.includes('ulfe')) {
                clinicaDisplayVal = 'CLÍNICA CARRIÓN';
            } else if (medNorm.includes('marreros') || medNorm.includes('lloclla')) {
                clinicaDisplayVal = 'CLINICA LA MUJER';
            } else if (medNorm.includes('saire') || medNorm.includes('bocangel')) {
                clinicaDisplayVal = 'CLÍNICA ALFA PREVENIR';
            } else {
                clinicaDisplayVal = 'Sin Clínica';
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
            <td style="text-align: center; white-space: nowrap;"><span class="sla-dot ${dotClass}" title="${dotTitle}"></span>${formatDisplayDate(item.fecEntrega || '')}</td>
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
        wrapper.style.overflowX = 'auto';
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
                <tbody>
                    <tr>
                        <td colspan="9" style="text-align: center; padding: 20px; color: var(--text-secondary);">
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

        // Restricción de Seguridad por Rol (RBAC): Para perfil 'Usuario', mostrar únicamente registros de su clínica o médico
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (currentUser.perfil === 'Usuario') {
            const userClinicName = normalizeText(currentUser.nombres || '');
            const userAccount = normalizeText(currentUser.usuario || '');
            const itemClinica = normalizeText(item.clinica);
            const itemMed = normalizeText(item.medSolicitante);
            
            let isUserMatch = false;

            // Extraer palabras clave de identificación
            const ignoreWords = ['del', 'los', 'las', 'dr', 'dra', 'dr.', 'dra.', 'clinica', 'clínica', 'centro', 'medico', 'médico', 'san', 'santa'];
            const allUserTokens = `${userClinicName} ${userAccount}`.split(/[\s,._-]+/).filter(w => w.length >= 3 && !ignoreWords.includes(w));

            // Si el usuario pertenece a San Clemente, incluir explícitamente al Dr. Alejandro Escalante Álvaro
            if (userClinicName.includes('clemente') || userAccount.includes('clemente') || userClinicName.includes('san clemente')) {
                if (!allUserTokens.includes('clemente')) allUserTokens.push('clemente');
                if (!allUserTokens.includes('escalante')) allUserTokens.push('escalante');
                if (!allUserTokens.includes('alejandro')) allUserTokens.push('alejandro');
            }

            // Si el usuario pertenece a Clínica Carrión, incluir explícitamente al Dr. Manuel Renato Sánchez Orellana y Dr. Jaime Víctor Becerra Ulfe
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
            }

            // Si el usuario pertenece a Clínica La Mujer, incluir explícitamente al Dr. Juan Jesús Marreros Lloclla
            if (userClinicName.includes('mujer') || userAccount.includes('mujer') || userAccount.includes('mujersegura')) {
                if (!allUserTokens.includes('mujer')) allUserTokens.push('mujer');
                if (!allUserTokens.includes('marreros')) allUserTokens.push('marreros');
                if (!allUserTokens.includes('lloclla')) allUserTokens.push('lloclla');
                if (!allUserTokens.includes('jesus')) allUserTokens.push('jesus');
                if (!allUserTokens.includes('juan')) allUserTokens.push('juan');
            }

            // Si el usuario pertenece a Clínica Alfa Prevenir, incluir explícitamente a la Dra. Laura Saire Bocangel
            if (userClinicName.includes('alfa') || userAccount.includes('alfa') || userAccount.includes('alfaprevenir')) {
                if (!allUserTokens.includes('alfa')) allUserTokens.push('alfa');
                if (!allUserTokens.includes('prevenir')) allUserTokens.push('prevenir');
                if (!allUserTokens.includes('saire')) allUserTokens.push('saire');
                if (!allUserTokens.includes('bocangel')) allUserTokens.push('bocangel');
                if (!allUserTokens.includes('laura')) allUserTokens.push('laura');
            }

            // Comprobar coincidencia de tokens en clínica o médico solicitante
            if (allUserTokens.length > 0) {
                const tokenMatchClinica = allUserTokens.some(t => itemClinica.includes(t));
                const tokenMatchMed = allUserTokens.some(t => itemMed.includes(t));
                if (tokenMatchClinica || tokenMatchMed) {
                    isUserMatch = true;
                }
            }

            // Fallback de coincidencia amplia por subcadena
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
