const fs = require('fs');
let html = fs.readFileSync('reportes.html', 'utf8');

const diagStart = html.indexOf('<!-- Panel: Diagnostico -->');
const diagEndMatch = html.substring(diagStart).indexOf('<!-- Columna Derecha');
if (diagStart === -1 || diagEndMatch === -1) {
    console.log("Error bounds");
    process.exit(1);
}

const diagEnd = diagStart + diagEndMatch;
// diagPanel includes the trailing div closures before 'Columna Derecha'
// Actually let's be more precise
const exactDiagEnd = html.substring(diagStart, diagEnd).lastIndexOf('</div>') + 6;
const exactDiagEnd2 = html.substring(diagStart, diagStart + exactDiagEnd).lastIndexOf('</div>') + 6;

// Let's just use regex to extract the block
const regex = /<!-- Panel: Diagnostico -->[\s\S]*?<\/textarea>\s*<\/div>\s*<\/div>/;
const match = html.match(regex);
if (!match) {
    console.log("Regex not found");
    process.exit(1);
}

const diagPanel = match[0];
html = html.replace(regex, '');

// Insert after Microscopica
const microRegex = /<textarea id="re_microDesc"[\s\S]*?<\/textarea>\s*<\/div>/;
const microMatch = html.match(microRegex);
if (microMatch) {
    const insertIdx = microMatch.index + microMatch[0].length;
    html = html.substring(0, insertIdx) + '\n\n                            ' + diagPanel + html.substring(insertIdx);
}

// 2. Modificar las fechas (Ingreso y Entrega) con candados
const oldFecEntrega = `<div class="editor-form-row">
                                <label for="re_fecEntrega">FEC. PROBABLE-ENTREGA:</label>
                                <input type="text" id="re_fecEntrega" class="editor-input readonly-field" readonly>
                            </div>`;

const newFechas = `<div class="editor-form-row">
                                <label for="re_fecIngreso">FECHA DE INGRESO:</label>
                                <div class="inline-control-group">
                                    <input type="date" id="re_fecIngreso" class="editor-input readonly-field" readonly>
                                    <button type="button" id="re_btnUnlockFecIngreso" class="editor-btn-action" title="Modificar Fecha Ingreso" style="background-color: #f59e0b; padding: 0 10px;"><i class="fa-solid fa-lock"></i></button>
                                </div>
                            </div>
                            <div class="editor-form-row">
                                <label for="re_fecEntrega">FEC. PROBABLE-ENTREGA:</label>
                                <div class="inline-control-group">
                                    <input type="date" id="re_fecEntrega" class="editor-input readonly-field" readonly>
                                    <button type="button" id="re_btnUnlockFecEntrega" class="editor-btn-action" title="Modificar Fecha Entrega" style="background-color: #f59e0b; padding: 0 10px;"><i class="fa-solid fa-lock"></i></button>
                                </div>
                            </div>`;

html = html.replace(oldFecEntrega, newFechas);

fs.writeFileSync('reportes.html', html);
console.log("Success HTML");
