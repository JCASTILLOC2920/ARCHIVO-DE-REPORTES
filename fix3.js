const fs = require('fs');
let html = fs.readFileSync('imprimir.html', 'utf8');

html = html.replace(
    /const urlParams = new URLSearchParams\(window\.location\.search\);\s*const urlParams = new URLSearchParams\(window\.location\.search\);/,
    "const urlParams = new URLSearchParams(window.location.search);"
);

fs.writeFileSync('imprimir.html', html);
