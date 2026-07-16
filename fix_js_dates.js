const fs = require('fs');

let js = fs.readFileSync('reportes.js', 'utf8');

// 1. In openEditorModal: Fix 'sexo' loading
const sexoLoadingRegex = /document\.getElementById\('re_sexo'\)\.value = patient\.sexo \|\| "MASCULINO";/;
js = js.replace(sexoLoadingRegex, `const s = patient.sexo || "MASCULINO";
    document.getElementById('re_sexo').value = (s === 'M' || s === 'MASCULINO') ? 'MASCULINO' : ((s === 'F' || s === 'FEMENINO') ? 'FEMENINO' : 'MASCULINO');`);

// 2. In btnGuardar: Fix 'sexo' mapping to db (Wait, actually we don't need to change btnGuardar's sexo mapping because it saves 'M' or 'F' correctly now that it reads FEMENINO)
// Wait! `patient.sexo = selectedSexo === 'MASCULINO' ? 'M' : (selectedSexo === 'FEMENINO' ? 'F' : 'O');`
// This is already correct.

// 3. In openEditorModal: Load fecIngreso, fecEntregaReal and calculate fecProbable
const dateLoadingRegex = /document\.getElementById\('re_fecIngreso'\)\.value = patient\.fecRegistro \|\| "";/;
const newDateLoading = `document.getElementById('re_fecIngreso').value = patient.fecRegistro || "";
    document.getElementById('re_fecEntregaReal').value = patient.fecEntrega || "";
    
    // Calcular fecha probable: fecRegistro + 5 días
    if (patient.fecRegistro) {
        const d = new Date(patient.fecRegistro + 'T00:00:00');
        if (!isNaN(d.getTime())) {
            d.setDate(d.getDate() + 5);
            const prob = d.toISOString().split('T')[0];
            document.getElementById('re_fecProbable').value = prob;
        }
    } else {
        document.getElementById('re_fecProbable').value = "";
    }`;
js = js.replace(dateLoadingRegex, newDateLoading);

// 4. In setupLock: add re_btnUnlockFecEntregaReal
const setupLockRegex = /setupLock\('re_btnUnlockFecEntrega', 're_fecEntrega'\);/;
js = js.replace(setupLockRegex, `setupLock('re_btnUnlockFecEntregaReal', 're_fecEntregaReal');`);

// 5. In getTempPatientFromEditor: read fecRegistro and fecEntregaReal from DOM
const tempPatientRegex = /fecRegistro: currentPatient \? currentPatient\.fecRegistro : '',\s*fecEntrega: currentPatient \? currentPatient\.fecEntrega : '',/;
js = js.replace(tempPatientRegex, `fecRegistro: document.getElementById('re_fecIngreso').value,
            fecEntrega: document.getElementById('re_fecEntregaReal').value,`);

// 6. In btnGuardar: save fecRegistro and fecEntrega back to patient
const btnGuardarSaveRegex = /patient\.sexo = selectedSexo === 'MASCULINO' \? 'M' : \(selectedSexo === 'FEMENINO' \? 'F' : 'O'\);/;
js = js.replace(btnGuardarSaveRegex, `patient.sexo = selectedSexo === 'MASCULINO' ? 'M' : (selectedSexo === 'FEMENINO' ? 'F' : 'O');
                patient.fecRegistro = document.getElementById('re_fecIngreso').value;
                patient.fecEntrega = document.getElementById('re_fecEntregaReal').value;`);

// 7. In btnFirma: auto-populate fecEntregaReal with today's date
const btnFirmaRegex = /reBtnFirma\.addEventListener\('click', \(\) => \{/;
const btnFirmaReplacement = `reBtnFirma.addEventListener('click', () => {
            // Auto-generar fecha de entrega si está vacía
            const fecEntregaInput = document.getElementById('re_fecEntregaReal');
            if (!fecEntregaInput.value) {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                fecEntregaInput.value = \`\${yyyy}-\${mm}-\${dd}\`;
            }`;
js = js.replace(btnFirmaRegex, btnFirmaReplacement);

fs.writeFileSync('reportes.js', js);
console.log('Modified reportes.js');
