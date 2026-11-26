// pdf_engine.js
// Módulo aislado para generación y enrutamiento de PDF
import { patientDatabase } from './db_service.js?v=20261105_v674';

/**
 * Normaliza cualquier código de atención para comparaciones.
 * @param {string|number} code
 * @returns {string}
 */
function normalizeCode(code) {
    return String(code ?? '')
        .trim()
        .toLowerCase()
        .replace(/[-_\s]/g, '');
}

/**
 * Busca un paciente en las fuentes disponibles.
 * @param {string} target Normalized code.
 * @returns {object|null}
 */
function findPatient(target) {
    // 1️⃣ Base local importada
    if (Array.isArray(patientDatabase)) {
        const found = patientDatabase.find(p => normalizeCode(p.codAtencion ?? p.cod_atencion) === target);
        if (found) return found;
    }

    // 2️⃣ Cache global Supabase (si existe)
    if (Array.isArray(window?.REAL_SUPABASE_PATIENTS)) {
        const found = window.REAL_SUPABASE_PATIENTS.find(p => normalizeCode(p.codAtencion ?? p.cod_atencion) === target);
        if (found) return found;
    }

    // 3️⃣ Paciente activo en la UI
    const active = window?.activePatient ?? window?.currentEditingPatient;
    if (active && normalizeCode(active.codAtencion ?? active.cod_atencion) === target) {
        return active;
    }

    return null;
}

/**
 * Persiste temporalmente los datos del paciente para la ventana de impresión.
 * @param {object} patient
 */
function persistPatientData(patient) {
    try {
        const payload = JSON.stringify(patient);
        localStorage.setItem('printPatientData', payload);
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('printPatientData', payload);
        }
    } catch (e) {
        console.warn('[PDF Engine] No se pudo guardar en storage', e);
    }
}

/**
 * Abre la ventana de impresión del PDF.
 * @param {string|number} codAtencion Código de atención del paciente.
 * @param {boolean} [autoDownload=false] Si true, la página intentará descargar el PDF automáticamente.
 * @returns {Window|null} Referencia a la ventana abierta o null si el popup fue bloqueado.
 */
export function openPrintWindow(codAtencion, autoDownload = false) {
    if (!codAtencion) {
        console.error('Error: No se proporcionó código de atención para generar PDF.');
        return null;
    }

    console.log(`[PDF Engine] Preparando documento para código: ${codAtencion} (autoDownload: ${autoDownload})`);

    const target = normalizeCode(codAtencion);
    const patient = findPatient(target);

    // Si no se encuentra el paciente, avisar y abortar la generación.
    if (!patient) {
        alert('Paciente no encontrado. Verifique el código de atención.');
        return null;
    }

    // Persistir datos para la página de impresión.
    persistPatientData(patient);

    // Determinar si el paciente está completamente firmado.
    const isSigned = Boolean(patient.firmado === true || patient.firmado === 1 || String(patient.firmado).toLowerCase() === 'true');
    const isReady = /completad|listo|firmad/i.test(String(patient.estado ?? ''));
    const isFullySigned = isSigned && isReady;

    // Si se solicitó descarga automática pero el caso no está firmado, impedirla.
    if (autoDownload && !isFullySigned) {
        const proceed = confirm('El caso aún no está firmado completamente. ¿Desea continuar con la descarga?');
        if (!proceed) return null;
    }

    // Construir URL de impresión.
    const params = new URLSearchParams();
    if (autoDownload) params.append('autoDownload', 'true');
    params.append('codAtencion', codAtencion);
    params.append('_cb', Date.now().toString());

    const printUrl = `imprimir.html?${params.toString()}`;
    const newWindow = window.open(printUrl, '_blank');

    if (newWindow) {
        newWindow.focus();
        return newWindow;
    }

    alert('Por favor permita las ventanas emergentes (pop-ups) para generar el PDF.');
    return null;
}
