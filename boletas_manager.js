// ==============================================================================
// MÓDULO AUTÓNOMO DE BOLETAS Y CONSTANCIAS DE PAGO A EMPRESAS (JC PATH LAB)
// Arquitectura: Local-First Permanente + Respaldo en Supabase (Cero Pérdidas)
// ==============================================================================

const STORAGE_KEY_EMPRESAS = 'jcpath_empresas_catalog';
const STORAGE_KEY_BOLETAS = 'jcpath_boletas_history';

// Empresas iniciales por defecto si la base de datos está completamente vacía
const DEFAULT_EMPRESAS = [
    {
        id: 'emp_01',
        razonSocial: 'CLÍNICA SAN CLEMENTE S.A.C.',
        ruc: '20512345678',
        direccion: 'Av. Principal 123, Ica',
        telefono: '956123456',
        contacto: 'Administración / Facturación',
        createdAt: new Date().toISOString()
    }
];

// ==============================================================================
// 1. CAPA DE PERSISTENCIA LOCAL BLINDADA
// ==============================================================================

export function getStoredEmpresas() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_EMPRESAS);
        if (!raw) {
            localStorage.setItem(STORAGE_KEY_EMPRESAS, JSON.stringify(DEFAULT_EMPRESAS));
            return DEFAULT_EMPRESAS;
        }
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : DEFAULT_EMPRESAS;
    } catch (e) {
        console.warn('[BoletasManager] Error al leer empresas locales:', e);
        return DEFAULT_EMPRESAS;
    }
}

export function saveStoredEmpresas(empresas) {
    try {
        localStorage.setItem(STORAGE_KEY_EMPRESAS, JSON.stringify(empresas));
        syncEmpresaToSupabase(empresas);
    } catch (e) {
        console.error('[BoletasManager] Error al guardar empresas locales:', e);
    }
}

export function getStoredBoletas() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_BOLETAS);
        if (!raw) return [];
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.warn('[BoletasManager] Error al leer boletas locales:', e);
        return [];
    }
}

export function saveStoredBoletas(boletas) {
    try {
        localStorage.setItem(STORAGE_KEY_BOLETAS, JSON.stringify(boletas));
        syncBoletasToSupabase(boletas);
    } catch (e) {
        console.error('[BoletasManager] Error al guardar boletas locales:', e);
    }
}

async function syncEmpresaToSupabase(empresas) {
    try {
        if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
            await window.supabaseClient.from('empresas_boletas').upsert(empresas, { onConflict: 'ruc' });
        }
    } catch (e) {}
}

async function syncBoletasToSupabase(boletas) {
    try {
        if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
            await window.supabaseClient.from('historial_boletas').upsert(boletas, { onConflict: 'codigo' });
        }
    } catch (e) {}
}

// ==============================================================================
// 2. GESTIÓN DE CÓDIGO CORRELATIVO SEGURO (Anti-Colisiones)
// ==============================================================================

export function generateNextBoletaCode() {
    const boletas = getStoredBoletas();
    const currentYear = new Date().getFullYear();
    const prefix = `BOL-${currentYear}-`;
    
    let maxNum = 0;
    boletas.forEach(b => {
        if (b.codigo && b.codigo.startsWith(prefix)) {
            const numPart = parseInt(b.codigo.replace(prefix, ''), 10);
            if (!isNaN(numPart) && numPart > maxNum) {
                maxNum = numPart;
            }
        }
    });

    const nextNum = maxNum + 1;
    return `${prefix}${nextNum.toString().padStart(4, '0')}`;
}

// ==============================================================================
// 3. GENERADOR PROFESIONAL DE CONSTANCIA / BOLETA EN PDF
// ==============================================================================

export function generateBoletaPDF(boletaData) {
    const jsPDFClass = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : (window.jsPDF || null);
    if (!jsPDFClass) {
        alert('Cargando motor de generación PDF... Por favor intente en un momento.');
        return;
    }

    const doc = new jsPDFClass({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const primaryColor = [15, 23, 42];     // #0f172a
    const accentColor = [2, 132, 199];     // #0284c7
    const textColor = [30, 41, 59];        // #1e293b
    const lightBg = [248, 250, 252];       // #f8fafc

    // 1. Cabecera con Membrete Oficial
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 42, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('JC PATH LAB | ANATOMÍA PATOLÓGICA', 14, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text('DIAGNÓSTICO HISTOPATOLÓGICO, CITOLÓGICO E INMUNOHISTOQUÍMICA', 14, 25);
    doc.text('Dirección Médica Especializada | Dr. Juan Castillo', 14, 31);
    doc.text('RUC: 10458923412 | Teléfono: 956 789 012 | Ica - Perú', 14, 37);

    // Recuadro de la Constancia
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(138, 8, 58, 28, 2, 2, 'FD');
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.6);
    doc.roundedRect(138, 8, 58, 28, 2, 2, 'S');

    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('CONSTANCIA DE SERVICIO', 167, 15, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(...accentColor);
    doc.text('LIQUIDACIÓN TÉCNICA CLÍNICA', 167, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(220, 38, 38);
    doc.text(boletaData.codigo, 167, 30, { align: 'center' });

    // 2. Datos de la Entidad / Clínica Facturada
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(...lightBg);
    doc.roundedRect(14, 48, 182, 34, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...accentColor);
    doc.text('DATOS DE LA EMPRESA / INSTITUCIÓN CLIENTE:', 18, 55);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...textColor);
    doc.text('RAZÓN SOCIAL:', 18, 62);
    doc.setFont('helvetica', 'normal');
    doc.text(boletaData.razonSocial || 'NO ESPECIFICADO', 50, 62);

    doc.setFont('helvetica', 'bold');
    doc.text('RUC / DNI:', 18, 69);
    doc.setFont('helvetica', 'normal');
    doc.text(boletaData.ruc || '-', 50, 69);

    doc.setFont('helvetica', 'bold');
    doc.text('FECHA EMISIÓN:', 125, 69);
    doc.setFont('helvetica', 'normal');
    const fechaFormat = boletaData.fecha ? new Date(boletaData.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : new Date().toLocaleDateString('es-PE');
    doc.text(fechaFormat, 158, 69);

    doc.setFont('helvetica', 'bold');
    doc.text('DIRECCIÓN:', 18, 76);
    doc.setFont('helvetica', 'normal');
    doc.text(boletaData.direccion || 'Domicilio fiscal convenido', 50, 76);

    // 3. Tabla Desglosada
    let currentY = 90;

    doc.setFillColor(...primaryColor);
    doc.rect(14, currentY, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('ITEM', 18, currentY + 5.5);
    doc.text('DESCRIPCIÓN DEL SERVICIO / ESTUDIO PATOLÓGICO', 35, currentY + 5.5);
    doc.text('CANTIDAD', 130, currentY + 5.5, { align: 'center' });
    doc.text('P. UNIT (S/)', 158, currentY + 5.5, { align: 'right' });
    doc.text('IMPORTE (S/)', 190, currentY + 5.5, { align: 'right' });

    currentY += 8;

    const numMuestras = parseInt(boletaData.numMuestras, 10) || 1;
    const precioUnit = parseFloat(boletaData.precioUnitario) || (boletaData.total / numMuestras);
    const total = parseFloat(boletaData.total) || (numMuestras * precioUnit);
    const descripcion = boletaData.concepto || 'Procesamiento, lectura diagnóstica e informe histopatológico de muestras quirúrgicas / citología.';

    doc.setFillColor(255, 255, 255);
    doc.rect(14, currentY, 182, 14, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(14, currentY + 14, 196, currentY + 14);

    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('01', 18, currentY + 6);

    doc.setFont('helvetica', 'bold');
    doc.text(boletaData.tipoServicio || 'Servicio de Anatomía Patológica', 35, currentY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(descripcion.substring(0, 75), 35, currentY + 11);

    doc.setTextColor(...textColor);
    doc.setFontSize(9);
    doc.text(`${numMuestras}`, 130, currentY + 7, { align: 'center' });
    doc.text(precioUnit.toFixed(2), 158, currentY + 7, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(total.toFixed(2), 190, currentY + 7, { align: 'right' });

    currentY += 24;

    // 4. Bloque de Totales y Liquidación
    doc.setFillColor(...lightBg);
    doc.roundedRect(115, currentY, 81, 24, 2, 2, 'FD');
    doc.setDrawColor(...accentColor);
    doc.roundedRect(115, currentY, 81, 24, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    doc.text('N° TOTAL MUESTRAS:', 120, currentY + 7);
    doc.text(`${numMuestras}`, 190, currentY + 7, { align: 'right' });

    doc.text('TOTAL A LIQUIDAR:', 120, currentY + 16);
    doc.setFontSize(13);
    doc.setTextColor(16, 185, 129);
    doc.text(`S/ ${total.toFixed(2)}`, 190, currentY + 17, { align: 'right' });

    // 5. Nota Bancaria
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Modalidad de Pago: Depósito / Transferencia Bancaria Directa.', 14, currentY + 10);
    doc.text('Constancia de conformidad técnica para archivo contable y auditoría clínica.', 14, currentY + 15);
    doc.text('Válido como comprobante interno de liquidación por servicios profesionales.', 14, currentY + 20);

    // 6. Pie de Página
    const footerY = 270;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, footerY, 196, footerY);

    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('JC PATH LAB © 2026 | Sistema de Informes Anatomopatológicos | Generado digitalmente.', 14, footerY + 6);
    doc.text(`Constancia Ref: ${boletaData.codigo} | Emisión: ${new Date().toLocaleString('es-PE')}`, 196, footerY + 6, { align: 'right' });

    // Descarga directa
    const filename = `Constancia_${boletaData.codigo}_${(boletaData.razonSocial || 'Empresa').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)}.pdf`;
    doc.save(filename);
}

// ==============================================================================
// 4. CONTROLADOR DE INTERFAZ DE USUARIO (#view-boletas)
// ==============================================================================

export function initBoletasModule() {
    renderEmpresasSelect();
    renderEmpresasTable();
    renderBoletasTable();
    setupBoletasEventListeners();

    const fechaInput = document.getElementById('boletaFechaEmision');
    if (fechaInput && !fechaInput.value) {
        fechaInput.value = new Date().toISOString().split('T')[0];
    }
}

export function renderEmpresasSelect() {
    const select = document.getElementById('boletaEmpresaSelect');
    if (!select) return;

    const empresas = getStoredEmpresas();
    select.innerHTML = '<option value="">-- SELECCIONAR EMPRESA O CLÍNICA HABITUAL --</option>';

    empresas.forEach(emp => {
        const opt = document.createElement('option');
        opt.value = emp.id;
        opt.textContent = `${emp.razonSocial} (RUC: ${emp.ruc})`;
        select.appendChild(opt);
    });
}

export function renderEmpresasTable() {
    const tbody = document.getElementById('boletasEmpresasTableBody');
    if (!tbody) return;

    const empresas = getStoredEmpresas();
    tbody.innerHTML = '';

    if (empresas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px; color: #94a3b8;">No hay empresas registradas aún. Presione "➕ Nueva Empresa" para agregar una.</td></tr>';
        return;
    }

    empresas.forEach((emp, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>#${index + 1}</strong></td>
            <td><strong>${escapeHtml(emp.razonSocial)}</strong></td>
            <td><code>${escapeHtml(emp.ruc)}</code></td>
            <td>${escapeHtml(emp.direccion || '-')}</td>
            <td>${escapeHtml(emp.telefono || '-')}</td>
            <td>
                <button type="button" class="editor-btn-danger btn-sm-tool" onclick="window.deleteEmpresaDirectly && window.deleteEmpresaDirectly('${emp.id}')" title="Eliminar empresa del catálogo">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

export function renderBoletasTable() {
    const tbody = document.getElementById('boletasHistoryTableBody');
    if (!tbody) return;

    const boletas = getStoredBoletas();
    tbody.innerHTML = '';

    if (boletas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px; color: #94a3b8;">Aún no se han emitido constancias. Seleccione una empresa arriba y presione "GENERAR CONSTANCIA PDF".</td></tr>';
        return;
    }

    const sorted = [...boletas].sort((a, b) => new Date(b.createdAt || b.fecha) - new Date(a.createdAt || a.fecha));

    sorted.forEach(b => {
        const tr = document.createElement('tr');
        const fechaStr = b.fecha ? new Date(b.fecha).toLocaleDateString('es-PE') : '-';
        tr.innerHTML = `
            <td><strong style="color: #38bdf8;">${escapeHtml(b.codigo)}</strong></td>
            <td><strong>${escapeHtml(b.razonSocial)}</strong></td>
            <td>${fechaStr}</td>
            <td style="text-align:center;">${b.numMuestras || 1} muestras</td>
            <td><strong style="color: #10b981;">S/ ${(parseFloat(b.total) || 0).toFixed(2)}</strong></td>
            <td>
                <button type="button" class="editor-btn-secondary btn-sm-tool" onclick="window.reprintBoletaDirectly && window.reprintBoletaDirectly('${b.codigo}')" title="Reimprimir / Descargar PDF">
                    <i class="fa-solid fa-print"></i> PDF
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

let _boletasListenersAttached = false;

function setupBoletasEventListeners() {
    if (_boletasListenersAttached) return;
    _boletasListenersAttached = true;

    const select = document.getElementById('boletaEmpresaSelect');
    if (select) {
        select.addEventListener('change', (e) => {
            const empId = e.target.value;
            const empresas = getStoredEmpresas();
            const found = empresas.find(emp => emp.id === empId);

            const rucEl = document.getElementById('boletaRucDisplay');
            const dirEl = document.getElementById('boletaDirDisplay');
            const telEl = document.getElementById('boletaTelDisplay');

            if (found) {
                if (rucEl) rucEl.textContent = found.ruc || '-';
                if (dirEl) dirEl.textContent = found.direccion || 'No especificada';
                if (telEl) telEl.textContent = found.telefono || 'No registrado';
            } else {
                if (rucEl) rucEl.textContent = '-';
                if (dirEl) dirEl.textContent = '-';
                if (telEl) telEl.textContent = '-';
            }
        });
    }

    const numInput = document.getElementById('boletaNumMuestras');
    const precioInput = document.getElementById('boletaPrecioUnitario');
    const totalInput = document.getElementById('boletaTotalDirecto');
    const totalDisplay = document.getElementById('boletaTotalDisplay');

    function recomputeTotal() {
        const num = parseInt(numInput?.value, 10) || 1;
        const precioUnit = parseFloat(precioInput?.value) || 0;
        
        let total = 0;
        const isGlobalMode = document.getElementById('boletaCobroModoGlobal')?.checked;

        if (isGlobalMode) {
            total = parseFloat(totalInput?.value) || 0;
        } else {
            total = num * precioUnit;
            if (totalInput) totalInput.value = total.toFixed(2);
        }

        if (totalDisplay) {
            totalDisplay.textContent = `S/ ${total.toFixed(2)}`;
        }
    }

    if (numInput) numInput.addEventListener('input', recomputeTotal);
    if (precioInput) precioInput.addEventListener('input', recomputeTotal);
    if (totalInput) totalInput.addEventListener('input', () => {
        const isGlobalMode = document.getElementById('boletaCobroModoGlobal')?.checked;
        if (isGlobalMode) {
            const val = parseFloat(totalInput.value) || 0;
            if (totalDisplay) totalDisplay.textContent = `S/ ${val.toFixed(2)}`;
        }
    });

    document.querySelectorAll('input[name="boletaCobroModo"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const isGlobal = document.getElementById('boletaCobroModoGlobal')?.checked;
            const wrapUnit = document.getElementById('boletaWrapPrecioUnitario');
            const wrapGlobal = document.getElementById('boletaWrapTotalDirecto');

            if (wrapUnit) wrapUnit.style.display = isGlobal ? 'none' : 'block';
            if (wrapGlobal) wrapGlobal.style.display = isGlobal ? 'block' : 'none';
            recomputeTotal();
        });
    });

    const btnEmitir = document.getElementById('btnEmitirBoletaDirecto');
    if (btnEmitir) {
        btnEmitir.addEventListener('click', handleEmitirBoletaClick);
    }

    const btnNuevaEmpresa = document.getElementById('btnOpenModalNuevaEmpresa');
    if (btnNuevaEmpresa) {
        btnNuevaEmpresa.addEventListener('click', () => {
            const modal = document.getElementById('modalNuevaEmpresa');
            if (modal) modal.style.display = 'flex';
        });
    }

    const btnGuardarEmpresa = document.getElementById('btnGuardarNuevaEmpresa');
    if (btnGuardarEmpresa) {
        btnGuardarEmpresa.addEventListener('click', handleGuardarNuevaEmpresa);
    }
}

function handleEmitirBoletaClick() {
    const select = document.getElementById('boletaEmpresaSelect');
    const empId = select?.value;

    if (!empId) {
        alert('Por favor seleccione una empresa o clínica de la lista antes de generar la constancia.');
        select?.focus();
        return;
    }

    const empresas = getStoredEmpresas();
    const empresa = empresas.find(e => e.id === empId);
    if (!empresa) {
        alert('Empresa no encontrada en el catálogo.');
        return;
    }

    const numMuestras = parseInt(document.getElementById('boletaNumMuestras')?.value, 10) || 1;
    const isGlobal = document.getElementById('boletaCobroModoGlobal')?.checked;
    const precioUnit = parseFloat(document.getElementById('boletaPrecioUnitario')?.value) || 0;
    const total = isGlobal 
        ? (parseFloat(document.getElementById('boletaTotalDirecto')?.value) || 0)
        : (numMuestras * precioUnit);

    if (total <= 0) {
        alert('El monto total a facturar debe ser mayor a cero.');
        return;
    }

    const codigo = generateNextBoletaCode();
    const fecha = document.getElementById('boletaFechaEmision')?.value || new Date().toISOString().split('T')[0];
    const concepto = document.getElementById('boletaConceptoEstudio')?.value || 'Servicio de procesamiento e informe histopatológico.';
    const tipoServicio = document.getElementById('boletaTipoServicioSelect')?.value || 'Servicio de Anatomía Patológica';

    const boletaData = {
        codigo,
        empresaId: empresa.id,
        razonSocial: empresa.razonSocial,
        ruc: empresa.ruc,
        direccion: empresa.direccion,
        telefono: empresa.telefono,
        fecha,
        numMuestras,
        precioUnitario: isGlobal ? (total / numMuestras) : precioUnit,
        total,
        concepto,
        tipoServicio,
        createdAt: new Date().toISOString()
    };

    const boletas = getStoredBoletas();
    boletas.push(boletaData);
    saveStoredBoletas(boletas);

    generateBoletaPDF(boletaData);
    renderBoletasTable();

    if (typeof window.notifyUser === 'function') {
        window.notifyUser(`Constancia ${codigo} generada exitosamente.`, 'success');
    } else {
        alert(`✅ Constancia ${codigo} generada exitosamente para ${empresa.razonSocial}.`);
    }
}

function handleGuardarNuevaEmpresa() {
    const razonSocial = (document.getElementById('newEmpRazonSocial')?.value || '').trim();
    const ruc = (document.getElementById('newEmpRuc')?.value || '').trim();
    const direccion = (document.getElementById('newEmpDireccion')?.value || '').trim();
    const telefono = (document.getElementById('newEmpTelefono')?.value || '').trim();

    if (!razonSocial) {
        alert('Ingrese la Razón Social o Nombre de la Institución.');
        return;
    }
    if (!ruc || ruc.length < 8) {
        alert('Ingrese un RUC (11 dígitos) o DNI (8 dígitos) válido.');
        return;
    }

    const empresas = getStoredEmpresas();
    const existe = empresas.find(e => e.ruc === ruc);
    if (existe) {
        alert('Ya existe una empresa registrada con este mismo RUC o documento.');
        return;
    }

    const newEmp = {
        id: `emp_${Date.now()}`,
        razonSocial: razonSocial.toUpperCase(),
        ruc,
        direccion: direccion || 'No especificada',
        telefono: telefono || '-',
        createdAt: new Date().toISOString()
    };

    empresas.push(newEmp);
    saveStoredEmpresas(empresas);

    document.getElementById('newEmpRazonSocial').value = '';
    document.getElementById('newEmpRuc').value = '';
    document.getElementById('newEmpDireccion').value = '';
    document.getElementById('newEmpTelefono').value = '';

    const modal = document.getElementById('modalNuevaEmpresa');
    if (modal) modal.style.display = 'none';

    renderEmpresasSelect();
    renderEmpresasTable();

    const select = document.getElementById('boletaEmpresaSelect');
    if (select) {
        select.value = newEmp.id;
        select.dispatchEvent(new Event('change'));
    }

    if (typeof window.notifyUser === 'function') {
        window.notifyUser(`Empresa "${newEmp.razonSocial}" registrada permanentemente.`, 'success');
    }
}

window.deleteEmpresaDirectly = function(empId) {
    const empresas = getStoredEmpresas();
    const emp = empresas.find(e => e.id === empId);
    if (!emp) return;

    if (confirm(`¿Está seguro de eliminar a "${emp.razonSocial}" del catálogo de empresas?`)) {
        const filtered = empresas.filter(e => e.id !== empId);
        saveStoredEmpresas(filtered);
        renderEmpresasSelect();
        renderEmpresasTable();
        if (typeof window.notifyUser === 'function') {
            window.notifyUser('Empresa eliminada del catálogo.', 'info');
        }
    }
};

window.reprintBoletaDirectly = function(codigo) {
    const boletas = getStoredBoletas();
    const found = boletas.find(b => b.codigo === codigo);
    if (found) {
        generateBoletaPDF(found);
    } else {
        alert('No se encontró la boleta especificada.');
    }
};

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
