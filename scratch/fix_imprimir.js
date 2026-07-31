const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'imprimir.html');
let content = fs.readFileSync(filePath, 'utf8');

// Target 1: cleanAndSanitizeReportText
const target1 = `str = str.replace(/<\\/?(?:ul|ol|li|p|div|header|section)[^>]*>/gi, '\\n');
                    str = str.replace(/<br\\s*\\/?>/gi, '\\n');
                    str = str.replace(/&nbsp;/g, ' ');`;

const replacement1 = `str = str.replace(/<\\/?(?:ul|ol|li|p|div|header|section)[^>]*>/gi, '\\n');
                    str = str.replace(/<br\\s*\\/?>/gi, '\\n');
                    // Strip all other HTML tags to prevent style leakage
                    str = str.replace(/<\\/?[a-zA-Z][a-zA-Z0-9]*[^>]*>/gi, '');
                    str = str.replace(/&nbsp;/g, ' ');`;

// Target 2: formatMicroscopicDescription
const target2 = `str = str.replace(/<\\/?(?:ul|ol|li|p|div|header|section)[^>]*>/gi, '\\n');
                    str = str.replace(/<br\\s*\\/?>/gi, '\\n');
                    str = str.replace(/&nbsp;/g, ' ');`;

const replacement2 = `str = str.replace(/<\\/?(?:ul|ol|li|p|div|header|section)[^>]*>/gi, '\\n');
                    str = str.replace(/<br\\s*\\/?>/gi, '\\n');
                    // Strip all other HTML tags to prevent styling leakage and colon splitting issues
                    str = str.replace(/<\\/?[a-zA-Z][a-zA-Z0-9]*[^>]*>/gi, '');
                    str = str.replace(/&nbsp;/g, ' ');`;

// Let's replace by normalizing line endings first to handle both LF and CRLF
const normalizedContent = content.replace(/\r\n/g, '\n');

const normTarget1 = target1.replace(/\r\n/g, '\n');
const normTarget2 = target2.replace(/\r\n/g, '\n');

if (!normalizedContent.includes(normTarget1)) {
    console.error("Could not find target 1 in imprimir.html!");
    process.exit(1);
}

let modifiedContent = normalizedContent.replace(normTarget1, replacement1);
modifiedContent = modifiedContent.replace(normTarget2, replacement2);

// Write back with original CRLF line endings
const finalContent = modifiedContent.replace(/\n/g, '\r\n');
fs.writeFileSync(filePath, finalContent, 'utf8');
console.log("Successfully patched imprimir.html!");
