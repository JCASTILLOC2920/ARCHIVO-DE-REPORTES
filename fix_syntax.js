const fs = require('fs');
let content = fs.readFileSync('reportes.js', 'utf8');
content = content.replace(/if \(\(function\(\)\{ const el = document\.getElementById\('tplId'\); if\(el\) \{ el\.value == id \{[\s\S]*?\}\)\(\);\s*\}/g, 'if (document.getElementById("tplId") && document.getElementById("tplId").value == id) {\n            window.limpiarEditorPlantilla();\n        }');
fs.writeFileSync('reportes.js', content);
