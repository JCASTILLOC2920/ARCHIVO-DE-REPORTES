const fs = require('fs');
let html = fs.readFileSync('imprimir.html', 'utf8');

// The main content of the report starts with <div class="header-container">
// and ends right before <script> tag.
// We need to wrap it inside the table structure.

// We will find the start of the body content
const bodyStartIdx = html.indexOf('<body>') + 6;
const scriptStartIdx = html.indexOf('<script>');

let bodyContent = html.substring(bodyStartIdx, scriptStartIdx);

// Note: we have <div class="print-btn-container"> at the very top.
// Let's exclude it from the table so it doesn't mess up.
const printBtnRegex = /<div class="print-btn-container">[\s\S]*?<\/div>/;
const printBtnMatch = bodyContent.match(printBtnRegex);
let printBtnHTML = "";
if (printBtnMatch) {
    printBtnHTML = printBtnMatch[0];
    bodyContent = bodyContent.replace(printBtnHTML, '');
}

const tableWrapper = `
${printBtnHTML}
<table style="width: 100%; border: none; border-collapse: collapse;">
    <thead><tr><td><div class="header-space" style="height: 0px;"></div></td></tr></thead>
    <tbody>
        <tr>
            <td style="padding: 0;">
                ${bodyContent}
            </td>
        </tr>
    </tbody>
    <tfoot>
        <tr>
            <td style="padding: 0;">
                <div class="footer-space" style="height: 50px;"></div>
            </td>
        </tr>
    </tfoot>
</table>
`;

html = html.substring(0, bodyStartIdx) + tableWrapper + html.substring(scriptStartIdx);

// Make sure #print-footer has a fixed height and z-index so it stays visible
html = html.replace(
    '#print-footer {',
    '#print-footer {\n                height: 30px;\n                z-index: 1000;'
);

fs.writeFileSync('imprimir.html', html);
console.log("Wrapped content in table to prevent footer overlap.");
