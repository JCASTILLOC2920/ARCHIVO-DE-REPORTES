// pdf_engine.js
// PROTOCOLO ACTOR-CRITICO: Módulo Aislado para Generación y Enrutamiento de PDF

export function openPrintWindow(codAtencion) {
    if (!codAtencion) {
        console.error("Error: No se proporcionó código de atención para imprimir.");
        return;
    }
    
    console.log(`[PDF Engine] Preparando impresión para código: ${codAtencion}`);
    
    // Abrir imprimir.html pasando el codAtencion como parámetro GET
    const printUrl = `../imprimir.html?codAtencion=${encodeURIComponent(codAtencion)}`;
    const newWindow = window.open(printUrl, '_blank');
    
    if (newWindow) {
        newWindow.focus();
    } else {
        alert("Por favor permita las ventanas emergentes (pop-ups) para generar el PDF.");
    }
}
