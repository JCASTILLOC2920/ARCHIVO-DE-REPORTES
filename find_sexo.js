const js = require('fs').readFileSync('reportes.js', 'utf8');
const lines = js.split('\n');
lines.forEach((l, i) => {
    if (l.includes('re_sexo')) console.log(`Line ${i}: ${l.trim()}`);
});
