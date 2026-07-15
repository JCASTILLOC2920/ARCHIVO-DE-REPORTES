const fs = require('fs');
let js = fs.readFileSync('reportes.js', 'utf8');

// 1. Agregar lógica de candados si no existe (o simplemente inyectarla en openEditorModal o DOMContentLoaded)
// Let's inject it into the DOMContentLoaded block where other listeners are.
const domContentLoadedIndex = js.indexOf("document.addEventListener('DOMContentLoaded', () => {");
if (domContentLoadedIndex > -1) {
    const injection = `
    // Lógica de Candados
    const setupLock = (btnId, inputId) => {
        const btn = document.getElementById(btnId);
        const input = document.getElementById(inputId);
        if (btn && input) {
            // Remove previous listener to avoid duplicates if re-injected
            const clone = btn.cloneNode(true);
            btn.parentNode.replaceChild(clone, btn);
            clone.addEventListener('click', () => {
                if (input.hasAttribute('readonly')) {
                    if (confirm('¿Está seguro de habilitar la modificación de este campo? Podría afectar el registro.')) {
                        input.removeAttribute('readonly');
                        input.classList.remove('readonly-field');
                        clone.innerHTML = '<i class="fa-solid fa-lock-open"></i>';
                        clone.style.backgroundColor = '#ef4444';
                    }
                } else {
                    input.setAttribute('readonly', 'readonly');
                    input.classList.add('readonly-field');
                    clone.innerHTML = '<i class="fa-solid fa-lock"></i>';
                    clone.style.backgroundColor = '#f59e0b';
                }
            });
        }
    };
    setupLock('re_btnUnlockCode', 're_codAtencion');
    setupLock('re_btnUnlockFecIngreso', 're_fecIngreso');
    setupLock('re_btnUnlockFecEntrega', 're_fecEntrega');
    `;
    const injectPos = js.indexOf('{', domContentLoadedIndex) + 1;
    js = js.substring(0, injectPos) + injection + js.substring(injectPos);
}

// 2. Modificar getTempPatientFromEditor
const getTempRegex = /fechaEntrega: document\.getElementById\('re_fecEntrega'\)\.value,/;
if (getTempRegex.test(js)) {
    js = js.replace(getTempRegex, `fechaEntrega: document.getElementById('re_fecEntrega').value,
            fechaIngreso: document.getElementById('re_fecIngreso').value,`);
}

// 3. Modificar openEditorModal para poblar re_fecIngreso
const populateRegex = /document\.getElementById\('re_fecEntrega'\)\.value = patient\.fechaEntrega \|\| '';/;
if (populateRegex.test(js)) {
    js = js.replace(populateRegex, `document.getElementById('re_fecEntrega').value = patient.fechaEntrega || '';
    document.getElementById('re_fecIngreso').value = patient.fechaIngreso || '';`);
}

// 4. Modificar reBtnGuardarReporte para persistir (si se hace manualmente, pero getTempPatientFromEditor ya lo hace)

fs.writeFileSync('reportes.js', js);
console.log("Success JS");
