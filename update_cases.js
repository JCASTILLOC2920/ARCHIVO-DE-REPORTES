const fs = require('fs');

// Read the file content
const content = fs.readFileSync('real_supabase_backup.js', 'utf8');

// We can extract the array by evaluating or regex replacement
// Let's inspect where window.REAL_SUPABASE_PATIENTS is defined.
// Since real_supabase_backup.js assigns window.REAL_SUPABASE_PATIENTS = [ ... ];
// We can vm evaluate or parse. Let's write a safe parser or use vm.
const vm = require('vm');

const sandbox = { window: {} };
vm.createContext(sandbox);

try {
    vm.runInContext(content, sandbox);
    const patients = sandbox.window.REAL_SUPABASE_PATIENTS;
    console.log(`Loaded ${patients.length} patients successfully.`);

    let foundCount = 0;
    patients.forEach(p => {
        const cod = (p.cod_atencion || p.codAtencion || '').toString();
        if (cod.includes('327') || cod.includes('328')) {
            console.log(`\nFound Case: ${cod} (ID: ${p.id})`);
            console.log(`Paciente: ${p.paciente || (p.apellidos + ', ' + p.nombres)}`);
            console.log(`Especimen: ${p.especimen}`);
            console.log(`Diagnóstico actual: ${p.diagnostico}`);
            console.log(`Estado actual: ${p.estado}, Firmado: ${p.firmado}`);

            // Update
            p.firmado = true;
            p.estado = 'Completado';
            p.doctor = 'DR. JOSEHP CHRISTOPHER CASTILLO CUENCA';
            p.validado = true;
            if (!p.fec_firma) p.fec_firma = '2026-10-10';
            if (!p.fec_informe) p.fec_informe = '2026-10-10';
            foundCount++;
        }
    });

    console.log(`\nTotal cases updated: ${foundCount}`);

    // Generate new file content
    // We want to replace window.REAL_SUPABASE_PATIENTS = [...] with the updated array
    // To preserve formatting or structure, let's serialize back nicely using JSON.stringify or custom formatting
    const newPatientsJson = JSON.stringify(patients, null, 2);
    const newContent = `if (typeof window !== 'undefined') {\n    window.REAL_SUPABASE_PATIENTS = ${newPatientsJson};\n}\n`;

    fs.writeFileSync('real_supabase_backup.js', newContent, 'utf8');
    console.log('Successfully wrote updated real_supabase_backup.js');

} catch (err) {
    console.error('Error executing/parsing:', err);
}
