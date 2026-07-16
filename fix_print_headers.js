const fs = require('fs');
let html = fs.readFileSync('imprimir.html', 'utf8');

// 1. Update @page and body margins
html = html.replace(
    /@page \{\s*size: A4;\s*margin: 15mm 20mm 20mm 20mm;\s*\}/,
    `@page {
            size: A4;
            margin: 0 !important; /* Mata el URL y la Fecha por defecto de Chrome */
        }`
);

// We need to inject the body padding into @media print
const printMediaRegex = /@media print \{/;
if (printMediaRegex.test(html)) {
    html = html.replace(
        /@media print \{/,
        `@media print {
            body {
                padding: 0 20mm !important;
                box-sizing: border-box;
            }`
    );
}

// 2. Adjust #print-footer in CSS
const footerCssRegex = /#print-footer \{([\s\S]*?)\}/;
html = html.replace(footerCssRegex, `#print-footer {
                position: fixed;
                bottom: 20mm;
                left: 20mm;
                width: calc(100% - 40mm);
                border-top: 1.5px solid #5a85b5;
                padding-top: 8px;
                padding-bottom: 5px;
                display: flex !important;
                align-items: center;
                font-size: 10pt;
                font-family: Helvetica, Arial, sans-serif;
                font-weight: bold;
                background-color: white;
                height: 30px;
                z-index: 1000;
            }`);

// 3. Update table spacers
html = html.replace(
    '<div class="header-space" style="height: 0px;"></div>',
    '<div class="header-space" style="height: 15mm;"></div>'
);

html = html.replace(
    '<div class="footer-space" style="height: 50px;"></div>',
    '<div class="footer-space" style="height: 30mm;"></div>'
);

fs.writeFileSync('imprimir.html', html);
console.log("Successfully removed default browser headers and adjusted margins.");
