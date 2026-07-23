// ui_tables.js
// PROTOCOLO ACTOR-CRITICO: Módulo de Interfaz para Tablas y Filtros

import { patientDatabase, correctPapanicolaouSpelling } from './db_service.js?v=3.8';

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

// Función auxiliar para parsear código
function parseCodAtencionForSort(cod) {
    if (!cod) return { year: 0, num: 0 };
    const codStr = String(cod || '').trim().toUpperCase();
    
    let year = 0;
    const yearMatch = codStr.match(/^(\d{2})/);
    if (yearMatch) {
        year = parseInt(yearMatch[1], 10);
    }
    
    let num = 0;
    const numMatch = codStr.match(/(\d+)$/);
    if (numMatch) {
        num = parseInt(numMatch[1], 10);
    }
    
    return { year, num };
}

// Renderizado principal matemático de alto rendimiento (Chunked Rendering < 15ms)
export function renderTable(data = patientDatabase) {
    if (!tableBody) {
        console.error("Error: tableBody no inicializado. Llama a initTableUI primero.");
        return;
    }
    
    tableBody.innerHTML = '';

    // Filtrar por servicio activo
    const filteredByService = data.filter(item => item.service === currentService);

    if (filteredByService.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="14" style="text-align: center; padding: 20px; color: var(--text-secondary);">
                    No se encontraron registros de pacientes para los filtros seleccionados.
                </td>
            </tr>
        `;
        return;
    }

    filteredByService.sort((a, b) => {
        const parsedA = parseCodAtencionForSort(a.codAtencion);
        const parsedB = parseCodAtencionForSort(b.codAtencion);
        
        if (parsedB.year !== parsedA.year) {
            return parsedB.year - parsedA.year;
        }
        return parsedB.num - parsedA.num;
    });

    const createRow = (item, index) => {
        const row = document.createElement('tr');

        const paymentClass = item.pagado ? 'payment-completed' : 'payment-pending';
        const dateClass = item.atrasado ? 'date-delay' : 'date-normal';

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

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${item.codAtencion || '---'}</strong></td>
            <td>${item.dni || '---'}</td>
            <td>${(item.medSolicitante || '---').toUpperCase()}</td>
            <td>${pacienteName}</td>
            <td>${especimenText}</td>
            <td class="${paymentClass}">${costoText}</td>
            <td class="${paymentClass}">${adelantoText}</td>
            <td style="text-align: center;">${formatDisplayDate(item.fecRegistro || '')}</td>
            <td class="${dateClass}">${formatDisplayDate(item.fecEntrega || '')}</td>
            <td class="action-cell admin-only">
                <button class="action-btn edit-btn" title="Editar Registro" onclick="window.handleAction('editar', '${safeCod}')">
                    <i class="fa-solid fa-pencil"></i>
                </button>
            </td>
            <td class="action-cell">
                <button class="action-btn view-btn" title="Ver Detalles" onclick="window.handleAction('ver', '${safeCod}')">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </button>
            </td>
            <td class="action-cell">
                <button class="action-btn pdf-btn" title="Imprimir Reporte" onclick="window.handleAction('pdf', '${safeCod}')">
                    <i class="fa-solid fa-file-lines"></i>
                </button>
            </td>
            <td class="action-cell admin-only">
                <button class="action-btn delete-btn" title="Eliminar Registro" onclick="window.handleAction('eliminar', '${safeCod}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        return row;
    };

    // Lógica de Paginación
    const totalRecords = filteredByService.length;
    const totalPages = Math.ceil(totalRecords / rowsPerPage);
    
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalRecords);
    
    const currentSet = filteredByService.slice(startIndex, endIndex);

    const fragment = document.createDocumentFragment();
    currentSet.forEach((item, index) => {
        fragment.appendChild(createRow(item, startIndex + index));
    });
    tableBody.appendChild(fragment);

    // Actualizar información
    const infoEl = document.getElementById('patientsTableInfo');
    if (infoEl) {
        if (totalRecords === 0) {
            infoEl.textContent = `Mostrando 0 a 0 de 0 registros`;
        } else {
            infoEl.textContent = `Mostrando ${startIndex + 1} a ${endIndex} de ${totalRecords} registros`;
        }
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
}

window.goToPage = function(page) {
    currentPage = page;
    applyFilters(false);
};

function normalizeText(text) {
    if (!text) return '';
    return text.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function applyFilters(resetPage = true) {
    if (resetPage) currentPage = 1;
    const fecInicio = document.getElementById('fecInicio')?.value || '';
    const fecFinal = document.getElementById('fecFinal')?.value || '';
    const codAtencion = normalizeText(document.getElementById('codAtencion')?.value.trim());
    const nomPaciente = normalizeText(document.getElementById('nomPaciente')?.value.trim());
    const apePaciente = normalizeText(document.getElementById('apePaciente')?.value.trim());
    const dni = document.getElementById('dni')?.value.trim();
    const medSolicitante = normalizeText(document.getElementById('medSolicitante')?.value.trim());

    const filteredData = patientDatabase.filter(item => {
        if (codAtencion && !normalizeText(item.codAtencion).includes(codAtencion)) return false;
        if (dni && !item.dni.includes(dni)) return false;

        const dbNombres = normalizeText(item.nombres);
        const dbApellidos = normalizeText(item.apellidos);
        const dbPaciente = normalizeText(item.paciente); 

        if (nomPaciente && !(dbNombres.includes(nomPaciente) || dbPaciente.includes(nomPaciente))) return false;
        if (apePaciente && !(dbApellidos.includes(apePaciente) || dbPaciente.includes(apePaciente))) return false;
        if (medSolicitante && !normalizeText(item.medSolicitante).includes(medSolicitante)) return false;

        if (fecInicio) {
            const dateTarget = item.fecRegistro || item.fecEntrega || '';
            if (dateTarget < fecInicio) return false;
        }
        if (fecFinal) {
            const dateTarget = item.fecRegistro || item.fecEntrega || '';
            if (dateTarget > fecFinal) return false;
        }

        return true;
    });

    renderTable(filteredData);
}
