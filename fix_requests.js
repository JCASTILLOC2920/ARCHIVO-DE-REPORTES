const fs = require('fs');

// 1. Modificar reportes.html (Renombrar Fecha de Ingreso a Fecha de Recepción)
let html = fs.readFileSync('reportes.html', 'utf8');
html = html.replace('<label for="re_fecIngreso">FECHA DE INGRESO:</label>', '<label for="re_fecIngreso">FECHA DE RECEPCIÓN:</label>');
fs.writeFileSync('reportes.html', html);

// 2. Modificar index.html (Hacer que Med. Solicitante sea un input type text con datalist en lugar de un select)
let indexHtml = fs.readFileSync('index.html', 'utf8');
const oldSelect = `<select id="medSolicitante" name="medSolicitante" class="form-select">
                                                    <option value="" selected>SELECCIONAR</option>
                                                    <option value="med1">Dr. Alejandro Toledo</option>
                                                    <option value="med2">Dra. Claudia Benavente</option>
                                                    <option value="med3">Dr. Francisco Sagasti</option>
                                                    <option value="med4">Dr. Anibal Torres</option>
                                                </select>`;
const newInput = `<input type="text" id="medSolicitante" name="medSolicitante" class="form-input" list="medicosList" placeholder="Escriba el médico...">
                                                <datalist id="medicosList">
                                                    <option value="DR. ALEJANDRO TOLEDO"></option>
                                                    <option value="DRA. CLAUDIA BENAVENTE"></option>
                                                    <option value="DR. FRANCISCO SAGASTI"></option>
                                                    <option value="DR. ANIBAL TORRES"></option>
                                                </datalist>`;
if (indexHtml.includes('id="medSolicitante" name="medSolicitante" class="form-select"')) {
    // Regex replace to handle any variations
    indexHtml = indexHtml.replace(/<select id="medSolicitante"[\s\S]*?<\/select>/, newInput);
    fs.writeFileSync('index.html', indexHtml);
}

// 3. Modificar reportes.js
let js = fs.readFileSync('reportes.js', 'utf8');

// A) En la lógica del botón Firma, inyectar el cambio de fecha de entrega a HOY antes de guardar
const firmaLogic = `        // Save temp state before opening window
        const patientData = getTempPatientFromEditor();
        localStorage.setItem('currentPatient', JSON.stringify(patientData));
        window.open('imprimir.html?autoDownload=true', '_blank', 'width=950,height=1000');`;

const newFirmaLogic = `        // Set Fecha de Entrega a Hoy automáticamente
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('re_fecEntrega').value = today;
        
        // Disparar guardado de BD para persistir la fecha
        const saveBtn = document.getElementById('re_btnGuardarReporte');
        if (saveBtn) saveBtn.click();

        setTimeout(() => {
            const patientData = getTempPatientFromEditor();
            localStorage.setItem('currentPatient', JSON.stringify(patientData));
            window.open('imprimir.html?autoDownload=true', '_blank', 'width=950,height=1000');
        }, 300);`;

if (js.includes(firmaLogic)) {
    js = js.replace(firmaLogic, newFirmaLogic);
}

// B) Asegurarnos que Fecha de Recepción jale fecRegistro
// Buscar: document.getElementById('re_fecIngreso').value = patient.fechaIngreso || '';
// Cambiar a: document.getElementById('re_fecIngreso').value = patient.fecRegistro || patient.fechaIngreso || '';
js = js.replace(
    /document\.getElementById\('re_fecIngreso'\)\.value = patient\.fechaIngreso \|\| '';/,
    "document.getElementById('re_fecIngreso').value = patient.fecRegistro || patient.fechaIngreso || '';"
);

// Persistencia de Fecha de Recepción como fecRegistro
// En getTempPatientFromEditor
js = js.replace(
    /fechaIngreso: document\.getElementById\('re_fecIngreso'\)\.value,/,
    `fechaIngreso: document.getElementById('re_fecIngreso').value,
            fecRegistro: document.getElementById('re_fecIngreso').value,`
);

fs.writeFileSync('reportes.js', js);
console.log("Modifications complete.");
