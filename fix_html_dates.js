const fs = require('fs');

let html = fs.readFileSync('reportes.html', 'utf8');

const targetBlock = `<div class="editor-form-row">
                                <label for="re_fecEntrega">FEC. PROBABLE-ENTREGA:</label>
                                <div class="inline-control-group">
                                    <input type="date" id="re_fecEntrega" class="editor-input readonly-field" readonly>
                                    <button type="button" id="re_btnUnlockFecEntrega" class="editor-btn-action" title="Modificar Fecha Entrega" style="background-color: #f59e0b; padding: 0 10px;"><i class="fa-solid fa-lock"></i></button>
                                </div>
                            </div>`;

const replacementBlock = `<div class="editor-form-row">
                                <label for="re_fecEntregaReal">FECHA DE ENTREGA:</label>
                                <div class="inline-control-group">
                                    <input type="date" id="re_fecEntregaReal" class="editor-input readonly-field" readonly>
                                    <button type="button" id="re_btnUnlockFecEntregaReal" class="editor-btn-action" title="Modificar Fecha Entrega" style="background-color: #f59e0b; padding: 0 10px;"><i class="fa-solid fa-lock"></i></button>
                                </div>
                            </div>
                            <div class="editor-form-row">
                                <label for="re_fecProbable">FEC. PROBABLE-ENTREGA:</label>
                                <div class="inline-control-group">
                                    <input type="date" id="re_fecProbable" class="editor-input readonly-field" readonly title="Se calcula automáticamente (Recepción + 5 días)">
                                </div>
                            </div>`;

html = html.replace(targetBlock, replacementBlock);
fs.writeFileSync('reportes.html', html);
console.log('Modified reportes.html');
