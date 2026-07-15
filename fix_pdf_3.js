const fs = require('fs');
let html = fs.readFileSync('imprimir.html', 'utf8');

const regex = /\}\)\.save\(\)\.then\(\(\) => \{[\s\S]*?\}\);\s*\}\s*;\s*const triggerPrint = \(\) => \{[\s\S]*?\}\s*;/;

const replacement = `}).output(isAutoDownload ? 'save' : 'bloburl').then((result) => {
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

if (regex.test(html)) {
    html = html.replace(regex, replacement);
    fs.writeFileSync('imprimir.html', html);
    console.log("Success");
} else {
    console.log("Regex not found");
}
