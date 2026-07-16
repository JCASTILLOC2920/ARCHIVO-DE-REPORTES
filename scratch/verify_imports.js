const fs = require('fs');
const path = require('path');

const files = ['main.js', 'ui_tables.js', 'ui_report_editor.js', 'ui_admin.js'];
let failed = false;

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
        if (line.includes('import ') && line.includes('from ')) {
            const match = line.match(/from\s+['"]([^'"]+)['"]/);
            if (match) {
                const importPath = match[1];
                console.log(`[Import] ${file}:${idx + 1} -> ${importPath}`);
                if (!importPath.endsWith('?v=3.5')) {
                    console.error(`[ERROR] Non-standard version in import at ${file}:${idx + 1}: ${line}`);
                    failed = true;
                }
            }
        }
    });
});

if (failed) {
    process.exit(1);
} else {
    console.log('[SUCCESS] All ES module imports are correctly aligned to v=3.5.');
}
