const fs = require('fs');
let html = fs.readFileSync('imprimir.html', 'utf8');

const startMarker = `html2pdf().set(opt).from(document.body).toPdf().get('pdf').then((pdf) => {`;
const endMarker = `if (totalImgs === 0) {`;

const startIndex = html.indexOf(startMarker);
const endIndex = html.indexOf(endMarker);

if (startIndex > -1 && endIndex > -1) {
    const replacement = `let worker = html2pdf().set(opt).from(document.body).toPdf().get('pdf').then((pdf) => {
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
                });

                if (isAutoDownload) {
                    worker.save().then(() => {
                        setTimeout(() => window.close(), 500);
                    });
                } else {
                    worker.output('bloburl').then((result) => {
                        window.location.replace(result);
                    });
                }
            };

            const triggerPrint = () => {
                window.generatePdf();
            };

            
            `;

    html = html.substring(0, startIndex) + replacement + html.substring(endIndex);
    
    html = html.replace(
        /const fileNameStr = `\$\{code\} \$\{patient\.apellidos \|\| ''\} \$\{patient\.nombres \|\| ''\}`\.trim\(\)\.toUpperCase\(\)\.replace\(\/\\s\+\/g, ' '\) \+ '\.pdf';/,
        "const fileNameStr = `${code}_${patient.apellidos || ''}_${patient.nombres || ''}`.trim().toUpperCase().replace(/\\s+/g, '_').replace(/_+/g, '_') + '.pdf';"
    );
    
    fs.writeFileSync('imprimir.html', html);
    console.log("Success");
}
