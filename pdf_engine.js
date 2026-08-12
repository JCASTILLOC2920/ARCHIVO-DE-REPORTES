// pdf_engine.js
// PROTOCOLO ACTOR-CRITICO: Módulo Aislado para Generación y Enrutamiento de PDF
import { patientDatabase } from './db_service.js?v=3.25';

export function openPrintWindow(codAtencion) {
    if (!codAtencion) {
        console.error("Error: No se proporcionó código de atención para imprimir.");
        return;
    }
    
    console.log(`[PDF Engine] Preparando impresión para código: ${codAtencion}`);
    
    // Si estamos en línea, no confiamos en la base de datos local en caché para evitar imprimir datos obsoletos
    if (navigator.onLine) {
        localStorage.removeItem('printPatientData');
    } else if (patientDatabase && Array.isArray(patientDatabase)) {
        const patient = patientDatabase.find(x => x.codAtencion === codAtencion);
        if (patient && (patient.macroDesc || patient.microDesc || patient.diagnostico)) {
            try {
                localStorage.setItem('printPatientData', JSON.stringify(patient));
            } catch (e) {
                console.warn("[PDF Engine] No se pudo guardar en localStorage", e);
            }
        } else {
            // Eliminar datos ligeros/incompletos de localStorage para forzar consulta completa en imprimir.html
            localStorage.removeItem('printPatientData');
        }
    } else {
        localStorage.removeItem('printPatientData');
    }
    
    // Abrir imprimir.html pasando el codAtencion como parámetro GET con autoDownload activo
    const printUrl = `imprimir.html?autoDownload=true&codAtencion=${encodeURIComponent(codAtencion)}`;
    const newWindow = window.open(printUrl, '_blank');
    
    if (newWindow) {
        newWindow.focus();
    } else {
        alert("Por favor permita las ventanas emergentes (pop-ups) para generar el PDF.");
    }
}
