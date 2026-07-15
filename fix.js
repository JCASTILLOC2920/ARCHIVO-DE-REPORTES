const fs = require('fs');

// 1. Modificar reportes.js
let reportes = fs.readFileSync('reportes.js', 'utf8');

// Eliminar descarga automática
reportes = reportes.replace(
    /\/\/ 2\. Crear archivo descargable[\s\S]*?URL\.revokeObjectURL\(url\);/,
    '// 2. Se elimina la descarga forzada por cada guardado a petición del usuario.'
);

// Modificar action === 'pdf'
reportes = reportes.replace(
    /window\.open\('imprimir\.html\?v=3', '_blank', 'width=950,height=1000'\);/g,
    'window.open(\'imprimir.html?autoDownload=true\', \'_blank\', \'width=950,height=1000\');'
);

// Modificar el botón de firma (reBtnFirma) para que haga lo mismo pero con autoDownload=true
const getTempStr = `
    function getTempPatientFromEditor() {
        const selectedSexo = document.getElementById('re_sexo').value;
        const currentPatient = patientDatabase.find(x => x.codAtencion === editingCodAtencion);
        let img01 = '';
        let img02 = '';
        if (document.getElementById('re_img01PreviewContainer').style.display !== 'none') {
            img01 = document.getElementById('re_img01Preview').src;
        }
        if (document.getElementById('re_img02PreviewContainer').style.display !== 'none') {
            img02 = document.getElementById('re_img02Preview').src;
        }
        return {
            codAtencion: document.getElementById('re_codAtencion').value.trim(),
            dni: document.getElementById('re_dni').value,
            sexo: selectedSexo === 'MASCULINO' ? 'M' : (selectedSexo === 'FEMENINO' ? 'F' : 'O'),
            nombres: document.getElementById('re_nomPaciente').value,
            apellidos: document.getElementById('re_apePaciente').value,
            paciente: \`\${document.getElementById('re_apePaciente').value}, \${document.getElementById('re_nomPaciente').value}\`,
            edad: parseInt(document.getElementById('re_edad').value) || 0,
            telefono: document.getElementById('re_telefono').value,
            fContacto: document.getElementById('re_fContacto').value,
            telContacto: document.getElementById('re_telContacto').value,
            medSolicitante: document.getElementById('re_medSolicitante').value,
            motivoEstudio: document.getElementById('re_motivoEstudio').value,
            especimen: document.getElementById('re_motivoEstudio').value,
            doctor: document.getElementById('re_doctor').value,
            casetes: parseInt(document.getElementById('re_casetes').value) || 1,
            diagnostico: document.getElementById('re_diagnostico').value,
            catMacro: document.getElementById('re_catMacro').value,
            planMacro: document.getElementById('re_planMacro').value,
            macroDesc: document.getElementById('re_macroDesc').value,
            microDesc: document.getElementById('re_microDesc').value,
            fecRegistro: currentPatient ? currentPatient.fecRegistro : '',
            fecEntrega: currentPatient ? currentPatient.fecEntrega : '',
            img01: img01,
            img02: img02
        };
    }
`;

reportes = reportes.replace(
    /\/\/ Firma button[\s\S]*?reBtnFirma\.addEventListener\('click', \(\) => {[\s\S]*?showToast\(\"Insertando firma digital del patólogo en el reporte\.\.\.\", \"success\"\);[\s\S]*?}\);\s*}\s*\/\/ Vista Previa button[\s\S]*?reBtnPreview\.addEventListener\('click', \(\) => {[\s\S]*?localStorage\.setItem\('printPatientData', JSON\.stringify\(tempPatient\)\);\s*window\.open\('imprimir\.html\?v=3', '_blank', 'width=950,height=1000'\);\s*}\);\s*}/,
    getTempStr + `

    // Firma button
    const reBtnFirma = document.getElementById('re_btnFirma');
    if (reBtnFirma) {
        reBtnFirma.addEventListener('click', () => {
            const tempPatient = getTempPatientFromEditor();
            localStorage.setItem('printPatientData', JSON.stringify(tempPatient));
            window.open('imprimir.html?autoDownload=true', '_blank', 'width=950,height=1000');
        });
    }

    // Vista Previa button
    const reBtnPreview = document.getElementById('re_btnPreview');
    if (reBtnPreview) {
        reBtnPreview.addEventListener('click', () => {
            const tempPatient = getTempPatientFromEditor();
            localStorage.setItem('printPatientData', JSON.stringify(tempPatient));
            window.open('imprimir.html?autoDownload=false', '_blank', 'width=950,height=1000');
        });
    }
`
);

fs.writeFileSync('reportes.js', reportes);

// 2. Modificar imprimir.html
let imprimir = fs.readFileSync('imprimir.html', 'utf8');

imprimir = imprimir.replace(
    /<button class="print-btn" onclick="window\.print\(\)">Imprimir \/ Guardar PDF<\/button>/,
    '<button class="print-btn" onclick="generatePdf()">Descargar PDF</button>'
);

const newPrintStr = `
            const urlParams = new URLSearchParams(window.location.search);
            const isAutoDownload = urlParams.get('autoDownload') === 'true';

            window.generatePdf = () => {
                document.querySelector('.print-btn-container').style.display = 'none';
                
                // Formato de nombre: CÓDIGO APELLIDOS NOMBRES
                const fileNameStr = \`\${code} \${patient.apellidos || ''} \${patient.nombres || ''}\`.trim().toUpperCase().replace(/\\s+/g, ' ') + '.pdf';
                const opt = {
                  margin:       [10, 10, 20, 10], // mm [arriba, derecha, abajo, izquierda]
                  filename:     fileNameStr,
                  image:        { type: 'jpeg', quality: 0.65 }, // Compresión ultra para reducir peso del PDF
                  html2canvas:  { scale: 1.5, useCORS: true }, // Reducción ligera de escala
                  jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
                  pagebreak:    { mode: ['css', 'legacy'] }
                };

                // Generar PDF y abrirlo en el visor nativo del navegador
                html2pdf().set(opt).from(document.body).toPdf().get('pdf').then((pdf) => {
                    const totalPages = pdf.internal.getNumberOfPages();
                    const footerText = \`\${code} \${patient.apellidos || ''} \${patient.nombres || ''}\`.trim().toUpperCase() || \`\${code} \${patient.paciente.toUpperCase()}\`;
                    
                    for (let i = 1; i <= totalPages; i++) {
                        pdf.setPage(i);
                        pdf.setFontSize(9.5);
                        pdf.setTextColor(0, 0, 0);
                        
                        const pageWidth = pdf.internal.pageSize.getWidth();
                        const pageHeight = pdf.internal.pageSize.getHeight();
                        
                        // Linea superior del footer
                        pdf.setDrawColor(90, 133, 181); // #5a85b5
                        pdf.setLineWidth(0.5);
                        pdf.line(20, pageHeight - 12, pageWidth - 20, pageHeight - 12);
                        
                        // Icono (circulo azul)
                        pdf.setFillColor(59, 116, 179); // #3b74b3
                        pdf.circle(21.5, pageHeight - 8.5, 1.5, 'F');
                        
                        // Texto izquierdo
                        pdf.setFont('helvetica', 'bold');
                        pdf.text(footerText, 25, pageHeight - 7.5);
                        
                        // Texto derecho
                        const rightText = \`página \${i} de \${totalPages}\`;
                        pdf.text(rightText, pageWidth - 20, pageHeight - 7.5, { align: 'right' });
                    }
                }).save().then(() => {
                    if (isAutoDownload) {
                        setTimeout(() => window.close(), 500);
                    } else {
                        document.querySelector('.print-btn-container').style.display = 'block';
                    }
                });
            };

            const triggerPrint = () => {
                if (isAutoDownload) {
                    window.generatePdf();
                }
            };
`;

imprimir = imprimir.replace(
    /const triggerPrint = \(\) => {[\s\S]*?setTimeout\(\(\) => window\.close\(\), 500\);\s*}\);\s*};/,
    newPrintStr
);

fs.writeFileSync('imprimir.html', imprimir);
