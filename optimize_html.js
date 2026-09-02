export const fs = require('fs');

export let html = fs.readFileSync('reportes.html', 'utf8');

// 1. Añadir preload a los CSS en reportes.html
export const headEnd = html.indexOf('</head>');
export const preloadCss = `
    <!-- Optimizacion de Carga -->
    <link rel="preload" href="reportes.css" as="style">
    <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" as="style">
`;
html = html.substring(0, headEnd) + preloadCss + html.substring(headEnd);

// 2. Añadir defer a los scripts restantes
html = html.replace('<script src="plantillas_data.js"></script>', '<script src="plantillas_data.js" defer></script>');
html = html.replace('<script src="script.js"></script>', '<script src="script.js" defer></script>');

fs.writeFileSync('reportes.html', html);
console.log('Optimized reportes.html');

export let indexHtml = fs.readFileSync('index.html', 'utf8');
export const headEndIdx = indexHtml.indexOf('</head>');
export const preloadIndex = `
    <!-- Optimizacion de Carga -->
    <link rel="preload" href="style.css" as="style">
    <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" as="style">
`;
indexHtml = indexHtml.substring(0, headEndIdx) + preloadIndex + indexHtml.substring(headEndIdx);

indexHtml = indexHtml.replace('<script src="script.js"></script>', '<script src="script.js" defer></script>');
fs.writeFileSync('index.html', indexHtml);
console.log('Optimized index.html');
