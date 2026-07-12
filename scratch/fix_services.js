const fs = require('fs');
const https = require('https');

const configPath = '../supabase_config.js'; // Running from scratch/
let url = '';
let anonKey = '';

try {
    const configContent = fs.readFileSync('supabase_config.js', 'utf8');
    const urlMatch = configContent.match(/url:\s*["']([^"']*)["']/);
    const keyMatch = configContent.match(/anonKey:\s*["']([^"']*)["']/);
    
    if (urlMatch) url = urlMatch[1];
    if (keyMatch) anonKey = keyMatch[1];
} catch (e) {
    console.error("No se pudo leer supabase_config.js", e);
    process.exit(1);
}

if (!url || !anonKey) {
    console.error("Credenciales no encontradas.");
    process.exit(1);
}

const updates = [
    { old: 'EXAMEN DE MUESTRA POR HE', new: 'Q' },
    { old: 'PAPANICOLAOU', new: 'C' },
    { old: 'CITOLOGÍA ESPECIAL', new: 'C' },
    { old: 'INMUNO ISTOQUIMICA', new: 'I' }
];

async function updateService(mapping) {
    return new Promise((resolve, reject) => {
        const reqUrl = `${url}/rest/v1/pacientes?service=eq.${encodeURIComponent(mapping.old)}`;
        const options = {
            method: 'PATCH',
            headers: {
                'apikey': anonKey,
                'Authorization': `Bearer ${anonKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            }
        };

        const req = https.request(reqUrl, options, (res) => {
            console.log(`Update ${mapping.old} -> ${mapping.new} : STATUS: ${res.statusCode}`);
            resolve();
        });

        req.on('error', (e) => {
            console.error(`Error with ${mapping.old}: ${e.message}`);
            reject(e);
        });

        req.write(JSON.stringify({ service: mapping.new }));
        req.end();
    });
}

async function main() {
    for (const mapping of updates) {
        await updateService(mapping);
    }
    console.log("Todas las correcciones completadas.");
}

main();
