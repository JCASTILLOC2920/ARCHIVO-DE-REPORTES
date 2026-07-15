const fs = require('fs');
let css = fs.readFileSync('reportes.css', 'utf8');

// 1. Ampliar contenedor
css = css.replace(
    /\.report-editor-container \{[\s\S]*?width: 96vw;[\s\S]*?height: 96vh;[\s\S]*?max-width: 1450px;/,
    `.report-editor-container {
    width: 98vw;
    height: 98vh;
    max-width: none;`
);

// 2. Modificar columnas
css = css.replace(
    /\.report-editor-left-col \{[\s\S]*?width: 40%;/,
    `.report-editor-left-col {
    width: 28%;`
);

css = css.replace(
    /\.report-editor-right-col \{[\s\S]*?width: 60%;/,
    `.report-editor-right-col {
    width: 72%;`
);

fs.writeFileSync('reportes.css', css);
console.log("CSS Updated");
