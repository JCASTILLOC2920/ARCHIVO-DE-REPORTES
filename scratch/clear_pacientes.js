const fs = require('fs');
const https = require('https');

const configPath = 'supabase_config.js';

let url = '';
let anonKey = '';

try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const urlMatch = configContent.match(/url:\s*["']([^"']*)["']/);
    const keyMatch = configContent.match(/anonKey:\s*["']([^"']*)["']/);
    
    if (urlMatch) url = urlMatch[1];
    if (keyMatch) anonKey = keyMatch[1];
} catch (e) {
    console.error("No se pudo leer supabase_config.js");
    process.exit(1);
}

if (!url || !anonKey) {
    console.error("Credenciales no encontradas.");
    process.exit(1);
}

const reqUrl = `${url}/rest/v1/pacientes?id=gt.0`;

const options = {
    method: 'DELETE',
    headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
};

const req = https.request(reqUrl, options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log("Registros antiguos de pacientes eliminados correctamente de Supabase.");
    } else {
        console.error("Error al limpiar:", res.statusMessage);
    }
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
