const fs = require('fs');
let css = fs.readFileSync('reportes.css', 'utf8');

css = css.replace(
    /\.report-editor-left-col \{\s*width: 28%;/,
    `.report-editor-left-col {\n    width: 33%;`
);

css = css.replace(
    /\.report-editor-right-col \{\s*width: 72%;/,
    `.report-editor-right-col {\n    width: 67%;`
);

fs.writeFileSync('reportes.css', css);
console.log("CSS Updated to 33/67");
