const fs = require('fs');
let html = fs.readFileSync('imprimir.html', 'utf8');

const regex = /\}\)\.save\(\)\.then\(\(\) => \{[\s\S]*?\}\);/;

const newLogic = `}).output(isAutoDownload ? 'save' : 'bloburl').then((result) => {
                    if (isAutoDownload) {
                        // Si es auto-descarga (Botón Firma o PDF directo), cerrar la ventana después
                        setTimeout(() => window.close(), 500);
                    } else {
                        // Si es Vista Previa, reemplazar la página HTML por el Visor PDF Nativo del navegador
                        window.location.replace(result);
                    }
                });
            };

            const triggerPrint = () => {
                window.generatePdf();
            };`;

html = html.replace(regex, newLogic);
fs.writeFileSync('imprimir.html', html);
