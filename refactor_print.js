const fs = require('fs');
let html = fs.readFileSync('imprimir.html', 'utf8');

// 1. Quitar html2pdf
html = html.replace(/<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/html2pdf\.js\/.*?<\/script>/g, '');

// 2. Insertar estilos de impresión
const styleInjection = `
        @media print {
            .print-btn-container { display: none !important; }
            #print-footer {
                position: fixed;
                bottom: 0;
                width: 100%;
                border-top: 1.5px solid #5a85b5;
                padding-top: 8px;
                padding-bottom: 5px;
                display: flex !important;
                align-items: center;
                font-size: 10pt;
                font-family: Helvetica, Arial, sans-serif;
                font-weight: bold;
                background-color: white;
            }
            body { margin: 0; }
        }
        #print-footer { display: none; }
`;
html = html.replace('</style>', styleInjection + '\n    </style>');

// 3. Insertar el footer HTML al final del body
const footerHtml = `
    <div id="print-footer">
        <span style="display:inline-block; width:12px; height:12px; background-color:#3b74b3; border-radius:50%; margin-right:8px; margin-left:15px;"></span>
        <span id="footer-patient-text" style="color: #000;"></span>
    </div>
</body>`;
html = html.replace('</body>', footerHtml);

// 4. Reescribir window.generatePdf
const generatePdfRegex = /window\.generatePdf = \(\) => \{[\s\S]*?\}\s*;\s*const triggerPrint/m;

const newGeneratePdf = `window.generatePdf = () => {
                document.querySelector('.print-btn-container').style.display = 'none';
                
                // Formato de nombre: CÓDIGO APELLIDOS NOMBRES
                const fileNameStr = \`\${code}_\${patient.apellidos || ''}_\${patient.nombres || ''}\`.trim().toUpperCase().replace(/\\s+/g, '_').replace(/_+/g, '_');
                
                // TRUCO: Cambiar el titulo para forzar el nombre de archivo en Chrome
                document.title = fileNameStr;
                
                const footerText = \`\${code} \${patient.apellidos || ''} \${patient.nombres || ''}\`.trim().toUpperCase() || \`\${code} \${patient.paciente.toUpperCase()}\`;
                const ftr = document.getElementById('footer-patient-text');
                if (ftr) ftr.textContent = footerText;

                setTimeout(() => {
                    window.print();
                    
                    if (isAutoDownload) {
                        setTimeout(() => {
                            document.body.innerHTML = \`
                                <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; font-family:Arial,sans-serif; background-color:#f4f7f6;">
                                    <div style="background:white; padding:40px; border-radius:10px; box-shadow:0 4px 15px rgba(0,0,0,0.1); text-align:center;">
                                        <h2 style="color:#22c55e; margin-bottom:15px;">✔️ PDF Configurado</h2>
                                        <p style="color:#555; font-size:16px; margin-bottom:25px;">El cuadro de Guardar/Imprimir de Chrome se ha abierto.</p>
                                        <p style="color:#888; font-size:14px; margin-bottom:25px;">El archivo ya tiene el nombre automático: <br><strong style="color:#333;">\${fileNameStr}.pdf</strong></p>
                                        <button onclick="window.close()" style="background:#3b82f6; color:white; border:none; padding:12px 24px; border-radius:5px; font-size:16px; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.1);">Cerrar Ventana</button>
                                    </div>
                                </div>
                            \`;
                        }, 1500); // Dar un momento a que Chrome abra el cuadro de diálogo
                    }
                }, 500);
            };

            const triggerPrint`;

html = html.replace(generatePdfRegex, newGeneratePdf);

fs.writeFileSync('imprimir.html', html);
console.log("Refactored imprimir.html for native printing");
