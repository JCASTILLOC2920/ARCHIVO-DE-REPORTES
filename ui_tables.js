// ui_tables.js
// PROTOCOLO ACTOR-CRITICO: Módulo de Interfaz para Tablas y Filtros

import { patientDatabase } from './db_service.js?v=3.6';

// Elementos del DOM gestionados por este módulo
let tableBody = null;
let currentService = 'Q';

// Inicializador de elementos
export function initTableUI(bodyElementId) {
    tableBody = document.getElementById(bodyElementId);
}

export function setCurrentService(serviceId) {
    currentService = serviceId;
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

// Renderizado principal matemático
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

    const fragment = document.createDocumentFragment();

    filteredByService.forEach((item, index) => {
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

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${item.codAtencion || '---'}</strong></td>
            <td>${item.dni || '---'}</td>
            <td>${item.medSolicitante || '---'}</td>
            <td>${pacienteName}</td>
            <td>${item.especimen || '---'}</td>
            <td class="${paymentClass}">${costoText}</td>
            <td class="${paymentClass}">${adelantoText}</td>
            <td style="text-align: center;">${formatDisplayDate(item.fecRegistro || '')}</td>
            <td class="${dateClass}">${formatDisplayDate(item.fecEntrega || '')}</td>
            <td class="action-cell admin-only">
                <button class="action-btn edit-btn" title="Editar Registro" onclick="window.handleAction('editar', '${item.codAtencion}')">
                    <i class="fa-solid fa-pencil"></i>
                </button>
            </td>
            <td class="action-cell">
                <button class="action-btn" title="Ver Detalles" onclick="window.handleAction('ver', '${item.codAtencion}')">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </button>
            </td>
            <td class="action-cell">
                <button class="action-btn" title="Imprimir Reporte" onclick="window.handleAction('pdf', '${item.codAtencion}')">
                    <i class="fa-solid fa-file-lines"></i>
                </button>
            </td>
            <td class="action-cell admin-only">
                <button class="action-btn delete-btn" title="Eliminar Registro" onclick="window.handleAction('eliminar', '${item.codAtencion}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;

        fragment.appendChild(row);
    });

    tableBody.appendChild(fragment);
}

function normalizeText(text) {
    if (!text) return '';
    return text.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function applyFilters() {
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
