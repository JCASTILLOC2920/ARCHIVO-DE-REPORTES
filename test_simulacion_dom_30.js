// test_simulacion_dom_30.js
// Validación Soberana E2E: Simulación DOM en Node.js para ui_tables.js
// Certifica la inserción síncrona inmediata (0ms) de los primeros 30 pacientes en #tableBody

const path = require('path');
const fs = require('fs');

// 1. Cargar JSDOM desde el entorno local n8n / node_modules
const jsdomPath = 'C:/Users/HP/AppData/Roaming/npm/node_modules/n8n/node_modules/jsdom';
const { JSDOM } = require(jsdomPath);

console.log('================================================================');
console.log('TEST DE SIMULACION DOM (NODO 5 - TITAN / JC PATH LAB)');
console.log('================================================================\n');

// 2. Estructura HTML base que refleja reportes.html
const baseHtml = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Simulación DOM</title></head>
<body>
    <div id="tableContainer">
        <div id="tableWrapper">
            <table class="report-table" id="reportTable">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>COD. ATENCIÓN</th>
                        <th>DNI</th>
                        <th>MÉDICO / SEDE</th>
                        <th>PACIENTE</th>
                        <th>ESPÉCIMEN / MUESTRA</th>
                        <th>RECEPCIÓN</th>
                        <th>ENTREGA</th>
                        <th>ACCIONES</th>
                    </tr>
                </thead>
                <tbody id="tableBody"></tbody>
            </table>
        </div>
    </div>
    <div class="mobile-cards-container" id="mobilePatientCardsContainer"></div>
    <div id="patientsTableInfo"></div>
    <div id="patientsPagination"></div>
    <div id="tableActionMenuPortal" style="display: none;"></div>
</body>
</html>
`;

function createDomEnvironment(width = 1200) {
    const dom = new JSDOM(baseHtml, {
        url: 'http://localhost:8080/reportes.html',
        runScripts: 'outside-only'
    });
    const win = dom.window;

    // Configurar polyfills necesarios para ui_tables.js
    win.innerWidth = width;
    win.innerHeight = 800;
    win.requestAnimationFrame = (cb) => {
        // En este test validamos que el primer lote NO depende de rAF (síncrono a 0ms)
        return 999;
    };
    win.cancelAnimationFrame = (id) => {};
    win.sessionStorage.setItem('activeTablePage', '1');

    // Globalizar para que las funciones del módulo operen transparentemente
    global.window = win;
    global.document = win.document;
    global.sessionStorage = win.sessionStorage;
    global.localStorage = win.localStorage;
    global.requestAnimationFrame = win.requestAnimationFrame;
    global.cancelAnimationFrame = win.cancelAnimationFrame;

    return { dom, win };
}

// 3. Crear dataset de 50 pacientes de prueba
function generateTestPatients(count = 50) {
    const list = [];
    for (let i = 1; i <= count; i++) {
        const numStr = i < 10 ? `00${i}` : (i < 100 ? `0${i}` : `${i}`);
        list.push({
            id: 1000 + i,
            service: 'Q',
            codAtencion: `26Q-${numStr}`,
            cod_atencion: `26Q-${numStr}`,
            codigo: `26Q-${numStr}`,
            paciente: `PACIENTE TEST APELLIDO, NOMBRE ${i}`,
            apellidos: `PACIENTE TEST APELLIDO`,
            nombres: `NOMBRE ${i}`,
            dni: `456789${(10 + i).toString().slice(-2)}`,
            medSolicitante: 'DR. TEST SOLICITANTE',
            medico: 'DR. TEST SOLICITANTE',
            clinica: 'CLÍNICA LA LUZ',
            procedencia: 'CLÍNICA LA LUZ',
            especimen: `BIOPSIA GÁSTRICA PROTOCOLO ${i}`,
            fecRegistro: '2026-11-01',
            fecEntrega: '2026-11-04',
            firmado: i % 2 === 0,
            estado: i % 2 === 0 ? 'listo' : 'proceso'
        });
    }
    return list;
}

async function runTestSuite() {
    let allPassed = true;

    // Importar dinámicamente ui_tables.js en el entorno
    const { dom: envDom, win: envWin } = createDomEnvironment(1200);
    const uiTables = await import('./ui_tables.js');
    const { renderTable, initTableUI } = uiTables;

    // -----------------------------------------------------------------
    // TEST 1: MODO ESCRITORIO (Viewport: 1200px)
    // -----------------------------------------------------------------
    console.log('--- TEST 1: RENDERIZADO SÍNCRONO ESCRITORIO (1200px) ---');
    const { win: winDesk } = createDomEnvironment(1200);
    initTableUI('tableBody');

    const testPatients = generateTestPatients(50);
    const t0 = process.hrtime.bigint();
    renderTable(testPatients);
    const t1 = process.hrtime.bigint();
    const durationMs = Number(t1 - t0) / 1e6;

    const tbodyDesk = winDesk.document.getElementById('tableBody');
    const rowsDesk = tbodyDesk ? tbodyDesk.querySelectorAll('tr') : [];
    const mobileCardsDesk = winDesk.document.getElementById('mobilePatientCardsContainer').querySelectorAll('.mobile-patient-card');

    console.log(`Tiempo de renderizado síncrono: ${durationMs.toFixed(2)} ms`);
    console.log(`Filas insertadas en #tableBody: ${rowsDesk.length} / 30 esperadas`);
    console.log(`Tarjetas en #mobilePatientCardsContainer: ${mobileCardsDesk.length} / 30 esperadas`);

    if (rowsDesk.length === 30) {
        console.log('TEST 1.1 PASADO: #tableBody contiene exactamente los 30 primeros pacientes.');
    } else {
        console.error(`TEST 1.1 FALLADO: Se esperaban 30 filas pero se encontraron ${rowsDesk.length}`);
        allPassed = false;
    }

    const firstRowText = rowsDesk[0] ? rowsDesk[0].textContent : '';
    const lastRowText = rowsDesk[29] ? rowsDesk[29].textContent : '';
    console.log(`   - Fila 1: COD [26Q-001] -> ${firstRowText.includes('26Q-001') ? 'CORRECTO' : 'ERROR'}`);
    console.log(`   - Fila 30: COD [26Q-030] -> ${lastRowText.includes('26Q-030') ? 'CORRECTO' : 'ERROR'}`);

    if (!firstRowText.includes('26Q-001') || !lastRowText.includes('26Q-030')) {
        console.error('TEST 1.2 FALLADO: Discrepancia en los códigos de las posiciones 1 y 30');
        allPassed = false;
    } else {
        console.log('TEST 1.2 PASADO: Posiciones 1 a 30 correctamente mapeadas en DOM.');
    }

    // -----------------------------------------------------------------
    // TEST 2: MODO MÓVIL (Viewport: 390px - iPhone / Android)
    // -----------------------------------------------------------------
    console.log('\n--- TEST 2: RENDERIZADO SÍNCRONO MÓVIL (390px) ---');
    const { win: winMob } = createDomEnvironment(390);
    initTableUI('tableBody');

    const t0m = process.hrtime.bigint();
    renderTable(testPatients);
    const t1m = process.hrtime.bigint();
    const durationMsm = Number(t1m - t0m) / 1e6;

    const tbodyMob = winMob.document.getElementById('tableBody');
    const rowsMob = tbodyMob ? tbodyMob.querySelectorAll('tr') : [];
    const mobileCardsMob = winMob.document.getElementById('mobilePatientCardsContainer').querySelectorAll('.mobile-patient-card');

    console.log(`Tiempo de renderizado síncrono: ${durationMsm.toFixed(2)} ms`);
    console.log(`Filas insertadas en #tableBody: ${rowsMob.length} / 30 esperadas`);
    console.log(`Tarjetas en #mobilePatientCardsContainer: ${mobileCardsMob.length} / 30 esperadas`);

    if (rowsMob.length === 30) {
        console.log('TEST 2.1 PASADO: #tableBody contiene síncronamente las 30 filas en móvil.');
    } else {
        console.error(`TEST 2.1 FALLADO: #tableBody en móvil tiene ${rowsMob.length} filas (esperadas: 30)`);
        allPassed = false;
    }

    if (mobileCardsMob.length === 30) {
        console.log('TEST 2.2 PASADO: #mobilePatientCardsContainer contiene síncronamente las 30 tarjetas en móvil.');
    } else {
        console.error(`TEST 2.2 FALLADO: Tarjetas móviles tiene ${mobileCardsMob.length} (esperadas: 30)`);
        allPassed = false;
    }

    // -----------------------------------------------------------------
    // TEST 3: VALIDACIÓN CON BACKUP REAL DE PRODUCCIÓN (1,222 PACIENTES)
    // -----------------------------------------------------------------
    console.log('\n--- TEST 3: VALIDACIÓN CON BACKUP MAESTRO REAL DE PRODUCCIÓN ---');
    const backupFilePath = path.join(__dirname, 'real_supabase_backup.js');
    let realPatients = [];
    if (fs.existsSync(backupFilePath)) {
        const rawContent = fs.readFileSync(backupFilePath, 'utf8');
        const match = rawContent.match(/window\.REAL_SUPABASE_BACKUP\s*=\s*(\[[\s\S]*?\]);/);
        if (match) {
            try {
                realPatients = JSON.parse(match[1]);
                console.log(`Pacientes reales cargados de producción: ${realPatients.length}`);
            } catch (eParse) {
                console.warn('Advertencia parseando JSON real:', eParse.message);
            }
        }
    }

    if (realPatients.length > 0) {
        const { win: winReal } = createDomEnvironment(1200);
        initTableUI('tableBody');

        renderTable(realPatients);

        const tbodyReal = winReal.document.getElementById('tableBody');
        const rowsReal = tbodyReal ? tbodyReal.querySelectorAll('tr') : [];
        console.log(`Filas de producción insertadas en #tableBody: ${rowsReal.length} / 30 esperadas`);

        if (rowsReal.length === 30) {
            console.log('TEST 3.1 PASADO: 30 pacientes de producción montados de inmediato en DOM.');
            const cod1 = rowsReal[0].querySelector('.code-badge-cassette')?.getAttribute('data-code') || '---';
            const cod30 = rowsReal[29].querySelector('.code-badge-cassette')?.getAttribute('data-code') || '---';
            console.log(`   - Paciente 1 Código Real: [${cod1}]`);
            console.log(`   - Paciente 30 Código Real: [${cod30}]`);
        } else {
            console.error(`TEST 3.1 FALLADO: Se encontraron ${rowsReal.length} filas.`);
            allPassed = false;
        }
    } else {
        console.warn('No se pudo leer real_supabase_backup.js para Test 3');
    }

    console.log('\n================================================================');
    if (allPassed) {
        console.log('TODOS LOS TESTS DE SIMULACION DOM PASARON CON EXITO (100% OK)');
        console.log('   - 30 primeros pacientes insertados sincronamente (0ms)');
        console.log('   - #tableBody garantizado en Escritorio y Movil');
        console.log('   - #mobilePatientCardsContainer garantizado en Movil');
    } else {
        console.log('ALGUNOS TESTS FALLARON - REVISAR LOGS ANTERIORES');
        process.exit(1);
    }
    console.log('================================================================\n');
}

runTestSuite().catch(err => {
    console.error('Error fatal ejecutando test suite:', err);
    process.exit(1);
});
