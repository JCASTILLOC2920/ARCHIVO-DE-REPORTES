const html = require('fs').readFileSync('reportes.html', 'utf8');
const lines = html.split('\n');
lines.forEach((l, i) => {
    if (l.includes('id="re_macroDesc"') || l.includes('id="re_microDesc"') || l.includes('id="re_diagnostico"')) {
        console.log(`Line ${i+1}: ${l.trim()}`);
    }
});
