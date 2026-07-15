const fs = require('fs');
let html = fs.readFileSync('reportes.html', 'utf8');

// 1. Mover "Diagnostico"
const diagStart = html.indexOf('<!-- Panel: Diagnostico -->');
const diagEnd = html.indexOf('</div>\n                </div>\n\n                <!-- Columna Derecha (60% de ancho) -->');

if (diagStart === -1 || diagEnd === -1) {
    console.log("Error finding Diagnostico bounds");
    process.exit(1);
}

const diagPanel = html.substring(diagStart, diagEnd);

// Eliminarlo de la izquierda
html = html.substring(0, diagStart) + html.substring(diagEnd);

// Insertarlo en la derecha, debajo de la descripción microscópica
const microEnd = html.indexOf('</textarea>\n                            </div>\n                        </div>\n\n                        <!-- Tab 2: Adjunto Imagen 01 -->');
if (microEnd === -1) {
    console.log("Error finding Micro bounds");
    process.exit(1);
}

const insertionPoint = html.indexOf('</div>', microEnd) + 7; // after the closing div of the rich-editor-wrapper

html = html.substring(0, insertionPoint) + '\n\n                            ' + diagPanel + html.substring(insertionPoint);


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
console.log("HTML Updated");
