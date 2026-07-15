const fs = require('fs');
let html = fs.readFileSync('imprimir.html', 'utf8');

const regex = /\}\)\.output\(isAutoDownload \? 'save' : 'bloburl'\)\.then\(\(result\) => \{[\s\S]*?\}\);/;

const replacement = `});

                if (isAutoDownload) {
                    // Si es auto-descarga, forzar la descarga real usando .save()
                    worker.save().then(() => {
                        setTimeout(() => window.close(), 500);
                    });
                } else {
                    // Modo Vista Previa: Abrir en el visor nativo PDF del navegador
                    worker.output('bloburl').then((result) => {
                        window.location.replace(result);
                    });
                }
            };`;

const html2pdfRegex = /html2pdf\(\)\.set\(opt\)\.from\(document\.body\)\.toPdf\(\)\.get\('pdf'\)\.then\(\(pdf\) => \{/;
const html2pdfReplacement = `let worker = html2pdf().set(opt).from(document.body).toPdf().get('pdf').then((pdf) => {`;

if (regex.test(html) && html2pdfRegex.test(html)) {
    html = html.replace(html2pdfRegex, html2pdfReplacement);
    html = html.replace(regex, replacement);
    fs.writeFileSync('imprimir.html', html);
    console.log("Success");
} else {
    console.log("Regex not found");
}
