const fs = require('fs');
let html = fs.readFileSync('reportes.html', 'utf8');

const regexFechas = /<div class="editor-form-row">\s*<label for="re_fecEntrega">FEC\. PROBABLE-ENTREGA:<\/label>\s*<input type="text" id="re_fecEntrega" class="editor-input readonly-field" readonly>\s*<\/div>/;

const newFechas = `<div class="editor-form-row">
                                <label for="re_fecIngreso">FECHA DE RECEPCIÓN:</label>
                                <div class="inline-control-group">
                                    <input type="date" id="re_fecIngreso" class="editor-input readonly-field" readonly>
                                    <button type="button" id="re_btnUnlockFecIngreso" class="editor-btn-action" title="Modificar Fecha Recepción" style="background-color: #f59e0b; padding: 0 10px;"><i class="fa-solid fa-lock"></i></button>
                                </div>
                            </div>
                            <div class="editor-form-row">
                                <label for="re_fecEntrega">FEC. PROBABLE-ENTREGA:</label>
                                <div class="inline-control-group">
                                    <input type="date" id="re_fecEntrega" class="editor-input readonly-field" readonly>
                                    <button type="button" id="re_btnUnlockFecEntrega" class="editor-btn-action" title="Modificar Fecha Entrega" style="background-color: #f59e0b; padding: 0 10px;"><i class="fa-solid fa-lock"></i></button>
                                </div>
                            </div>`;

if (regexFechas.test(html)) {
    html = html.replace(regexFechas, newFechas);
    fs.writeFileSync('reportes.html', html);
    console.log("Successfully replaced dates block.");
} else {
    console.log("Regex did not match!");
}
