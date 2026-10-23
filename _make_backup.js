
const fs = require('fs');
const code = fs.readFileSync('real_supabase_backup.js', 'utf8');
let jsonStr = code.replace(/const\s+_patientsData\s*=\s*/, '').replace(/;\s*$/, '');
let data = eval(jsonStr);
if (!fs.existsSync('_scripts_respaldo')) fs.mkdirSync('_scripts_respaldo');
fs.writeFileSync('_scripts_respaldo/backup_seguridad_disco_v651.json', JSON.stringify(data, null, 2));
console.log('SUCCESS: Backup created with ' + data.length + ' records.');
