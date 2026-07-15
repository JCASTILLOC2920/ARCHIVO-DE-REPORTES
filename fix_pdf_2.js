const fs = require('fs');
let html = fs.readFileSync('imprimir.html', 'utf8');

const target = `                }).save().then(() => {
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
            };`;

const replacement = `                }).output(isAutoDownload ? 'save' : 'bloburl').then((result) => {
                    if (isAutoDownload) {
                        // Descargar e intentar cerrar
                        setTimeout(() => window.close(), 500);
                    } else {
                        // Modo Vista Previa: Abrir en el visor nativo PDF del navegador
                        window.location.replace(result);
                    }
                });
            };

            const triggerPrint = () => {
                window.generatePdf();
            };`;

if (html.includes(target)) {
    html = html.replace(target, replacement);
    fs.writeFileSync('imprimir.html', html);
    console.log("Success");
} else {
    console.log("Target not found");
}
