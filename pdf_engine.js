// pdf_engine.js
// PROTOCOLO ACTOR-CRITICO: Módulo Aislado para Generación y Enrutamiento de PDF
import { patientDatabase } from './db_service.js?v=3.6';

export function openPrintWindow(codAtencion) {
    if (!codAtencion) {
        console.error("Error: No se proporcionó código de atención para imprimir.");
        return;
    }
    
    console.log(`[PDF Engine] Preparando impresión para código: ${codAtencion}`);
    
    // Buscar en la base de datos local y sincronizar con localStorage para carga instantánea
    if (patientDatabase && Array.isArray(patientDatabase)) {
        const patient = patientDatabase.find(x => x.codAtencion === codAtencion);
        if (patient) {
            try {
                localStorage.setItem('printPatientData', JSON.stringify(patient));
            } catch (e) {
                console.warn("[PDF Engine] No se pudo guardar en localStorage", e);
            }
        }
    }
    
    // Abrir imprimir.html pasando el codAtencion como parámetro GET
    const printUrl = `imprimir.html?autoDownload=false&codAtencion=${encodeURIComponent(codAtencion)}`;
    const newWindow = window.open(printUrl, '_blank');
    
    if (newWindow) {
        newWindow.focus();
    } else {
        alert("Por favor permita las ventanas emergentes (pop-ups) para generar el PDF.");
    }
}


