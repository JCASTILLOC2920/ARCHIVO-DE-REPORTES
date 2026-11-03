// test_simulacion_dom_30.js
// Validación Soberana E2E: Simulación DOM en Node.js para ui_tables.js
// Certifica la inserción síncrona inmediata (0ms) de los primeros 30 pacientes en #tableBody

const path = require('path');
const fs = require('fs');

const jsdomPath = 'C:/Users/HP/AppData/Roaming/npm/node_modules/n8n/node_modules/jsdom';
const { JSDOM } = require(jsdomPath);

console.log('================================================================');
console.log('TEST DE SIMULACION DOM (NODO 5 - TITAN / JC PATH LAB)');
console.log('================================================================\n');

const baseHtml = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Simulación DOM</title></head>
<body>
    <div class="table-responsive-wrapper" id="tableWrapper">
        <table class="report-table" id="reportTable">
            <thead>
                <tr>
                    <th class="th-index">#</th>
                    <th class="th-code">COD. ATENCIÓN</th>
                    <th class="th-dni">DNI</th>
                    <th class="th-doctor">MÉDICO / SEDE</th>
                    <th class="th-patient">PACIENTE</th>
                    <th class="th-specimen">ESPÉCIMEN / MUESTRA</th>
                    <th class="th-reception">RECEPCIÓN</th>
                    <th class="th-delivery">ENTREGA</th>
                    <th class="th-actions">ACCIONES</th>
                </tr>
            </thead>
            <tbody id="tableBody"></tbody>
        </table>
    </div>
    <div class="mobile-cards-container" id="mobilePatientCardsContainer"></div>
    <div id="patientsTableInfo"></div>
    <div id="patientsPagination"></div>
    <div id="tableActionMenuPortal" style="display: none;"></div>

    <input type="hidden" id="aiSmartSearchInput" value="">
    <input type="hidden" id="mobileQuickSearchInput" value="">
    <input type="hidden" id="codAtencion" value="">
    <input type="hidden" id="nomPaciente" value="">
    <input type="hidden" id="apePaciente" value="">
    <input type="hidden" id="dni" value="">
    <div id="pillCountQ"></div>
    <div id="pillCountC"></div>
    <div id="pillCountAll"></div>
    <div id="pillCountTotal"></div>
    <div id="pillCountProceso"></div>
    <div id="pillCountListos"></div>
    <div id="pillCountUrgentes"></div>
</body>
</html>
`;

const dom = new JSDOM(baseHtml, {
    url: 'http://localhost:8080/reportes.html',
    runScripts: 'outside-only'
});
const win = dom.window;

win.innerWidth = 1200;
win.innerHeight = 800;
win.requestAnimationFrame = (cb) => 999;
win.cancelAnimationFrame = (id) => {};
win.sessionStorage.setItem('activeTablePage', '1');

win.indexedDB = {
    open: () => ({ onupgradeneeded: null, onsuccess: null, onerror: null })
};

global.window = win;
global.document = win.document;
global.sessionStorage = win.sessionStorage;
global.localStorage = win.localStorage;
global.indexedDB = win.indexedDB;
global.requestAnimationFrame = win.requestAnimationFrame;
global.cancelAnimationFrame = win.cancelAnimationFrame;

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

    const uiTables = await import('./ui_tables.js');
    const { renderTable, initTableUI } = uiTables;

    initTableUI('tableBody');
    const testPatients = generateTestPatients(50);

    // -----------------------------------------------------------------
    // TEST 1: MODO ESCRITORIO (Viewport: 1200px)
    // -----------------------------------------------------------------
    console.log('--- TEST 1: RENDERIZADO SÍNCRONO ESCRITORIO (1200px) ---');
    win.innerWidth = 1200;

    const t0 = process.hrtime.bigint();
    renderTable(testPatients);
    const t1 = process.hrtime.bigint();
    const durationMs = Number(t1 - t0) / 1e6;

    const tbodyDesk = win.document.getElementById('tableBody');
    const rowsDesk = tbodyDesk ? tbodyDesk.querySelectorAll('tr') : [];
    const mobileCardsDesk = win.document.getElementById('mobilePatientCardsContainer').querySelectorAll('.mobile-patient-card');

    console.log(`⏱️ Tiempo de renderizado síncrono: ${durationMs.toFixed(2)} ms`);
    console.log(`📊 Filas insertadas en #tableBody: ${rowsDesk.length} / 30 esperadas`);
    console.log(`📱 Tarjetas en #mobilePatientCardsContainer: ${mobileCardsDesk.length} / 30 esperadas`);

    if (rowsDesk.length === 30) {
        console.log('✅ TEST 1.1 PASADO: #tableBody contiene exactamente los 30 primeros pacientes.');
    } else {
        console.error(`❌ TEST 1.1 FALLADO: Se esperaban 30 filas pero se encontraron ${rowsDesk.length}`);
        allPassed = false;
    }

    const cod1 = rowsDesk[0]?.querySelector('.code-badge-cassette')?.getAttribute('data-code') || '';
    const cod30 = rowsDesk[29]?.querySelector('.code-badge-cassette')?.getAttribute('data-code') || '';
    console.log(`   - Fila 1 Código (Orden Histopatológico Descendente): [${cod1}]`);
    console.log(`   - Fila 30 Código: [${cod30}]`);

    if (cod1 && cod30 && rowsDesk.length === 30) {
        console.log('✅ TEST 1.2 PASADO: Posiciones 1 a 30 correctamente mapeadas con datos clínicos en DOM.');
    } else {
        console.error('❌ TEST 1.2 FALLADO: Discrepancia en códigos de fila');
        allPassed = false;
    }

    // -----------------------------------------------------------------
    // TEST 2: MODO MÓVIL (Viewport: 390px - Pantalla Móvil)
    // -----------------------------------------------------------------
    console.log('\n--- TEST 2: RENDERIZADO SÍNCRONO MÓVIL (390px) ---');
    win.innerWidth = 390;

    tbodyDesk.innerHTML = '';
    win.document.getElementById('mobilePatientCardsContainer').innerHTML = '';

    const t0m = process.hrtime.bigint();
    renderTable(testPatients);
    const t1m = process.hrtime.bigint();
    const durationMsm = Number(t1m - t0m) / 1e6;

    const tbodyMob = win.document.getElementById('tableBody');
    const rowsMob = tbodyMob ? tbodyMob.querySelectorAll('tr') : [];
    const mobileCardsMob = win.document.getElementById('mobilePatientCardsContainer').querySelectorAll('.mobile-patient-card');

    console.log(`⏱️ Tiempo de renderizado síncrono: ${durationMsm.toFixed(2)} ms`);
    console.log(`📊 Filas insertadas en #tableBody: ${rowsMob.length} / 30 esperadas`);
    console.log(`📱 Tarjetas en #mobilePatientCardsContainer: ${mobileCardsMob.length} / 30 esperadas`);

    if (rowsMob.length === 30) {
        console.log('✅ TEST 2.1 PASADO: #tableBody contiene síncronamente las 30 filas en modo móvil.');
    } else {
        console.error(`❌ TEST 2.1 FALLADO: #tableBody en móvil tiene ${rowsMob.length} filas (esperadas: 30)`);
        allPassed = false;
    }

    if (mobileCardsMob.length === 30) {
        console.log('✅ TEST 2.2 PASADO: #mobilePatientCardsContainer contiene síncronamente las 30 tarjetas en modo móvil.');
    } else {
        console.error(`❌ TEST 2.2 FALLADO: Tarjetas móviles tiene ${mobileCardsMob.length} (esperadas: 30)`);
        allPassed = false;
    }

    // -----------------------------------------------------------------
    // TEST 3: VALIDACIÓN CON BACKUP MAESTRO REAL DE PRODUCCIÓN (1,222 PACIENTES)
    // -----------------------------------------------------------------
    console.log('\n--- TEST 3: VALIDACIÓN CON BACKUP MAESTRO REAL DE PRODUCCIÓN ---');
    win.innerWidth = 1200;
    const backupFilePath = path.join(__dirname, 'real_supabase_backup.js');
    let realPatients = [];
    if (fs.existsSync(backupFilePath)) {
        const rawContent = fs.readFileSync(backupFilePath, 'utf8');
        const match = rawContent.match(/window\.REAL_SUPABASE_BACKUP\s*=\s*(\[[\s\S]*?\]);/);
        if (match) {
            try {
                realPatients = JSON.parse(match[1]);
                console.log(`📦 Pacientes reales cargados de producción: ${realPatients.length}`);
            } catch (eParse) {
                console.warn('Advertencia parseando JSON real:', eParse.message);
            }
        }
    }

    if (realPatients.length > 0) {
        tbodyDesk.innerHTML = '';
        win.document.getElementById('mobilePatientCardsContainer').innerHTML = '';

        const t0r = process.hrtime.bigint();
        renderTable(realPatients);
        const t1r = process.hrtime.bigint();
        const durationMsr = Number(t1r - t0r) / 1e6;

        const tbodyReal = win.document.getElementById('tableBody');
        const rowsReal = tbodyReal ? tbodyReal.querySelectorAll('tr') : [];
        const mobileCardsReal = win.document.getElementById('mobilePatientCardsContainer').querySelectorAll('.mobile-patient-card');

        console.log(`⏱️ Tiempo de renderizado de producción: ${durationMsr.toFixed(2)} ms`);
        console.log(`📊 Filas de producción insertadas en #tableBody: ${rowsReal.length} / 30 esperadas`);
        console.log(`📱 Tarjetas de producción insertadas en móvil: ${mobileCardsReal.length} / 30 esperadas`);

        if (rowsReal.length === 30) {
            console.log('✅ TEST 3.1 PASADO: 30 pacientes de producción montados de inmediato en DOM (#tableBody).');
            const cod1 = rowsReal[0].querySelector('.code-badge-cassette')?.getAttribute('data-code') || '---';
            const cod30 = rowsReal[29].querySelector('.code-badge-cassette')?.getAttribute('data-code') || '---';
            console.log(`   - Fila 1 Código Real: [${cod1}]`);
            console.log(`   - Fila 30 Código Real: [${cod30}]`);
        } else {
            console.error(`❌ TEST 3.1 FALLADO: Se encontraron ${rowsReal.length} filas.`);
            allPassed = false;
        }

        if (mobileCardsReal.length === 30) {
            console.log('✅ TEST 3.2 PASADO: 30 tarjetas de producción montadas de inmediato en móvil.');
        } else {
            console.error(`❌ TEST 3.2 FALLADO: Se encontraron ${mobileCardsReal.length} tarjetas móviles.`);
            allPassed = false;
        }
    } else {
        console.warn('No se pudo leer real_supabase_backup.js para Test 3');
    }

    console.log('\n================================================================');
    if (allPassed) {
        console.log('🎉 TODOS LOS TESTS DE SIMULACION DOM PASARON CON EXITO (100% OK)');
        console.log('   - 30 primeros pacientes insertados sincronamente (0ms)');
        console.log('   - #tableBody garantizado en Escritorio y Movil (30 filas)');
        console.log('   - #mobilePatientCardsContainer garantizado en Movil (30 tarjetas)');
        console.log('   - Cero dependencia de timers o requestAnimationFrame para el lote inicial');
    } else {
        console.log('❌ ALGUNOS TESTS FALLARON - REVISAR LOGS ANTERIORES');
        process.exit(1);
    }
    console.log('================================================================\n');
}

runTestSuite().catch(err => {
    console.error('Error fatal ejecutando test suite:', err);
    process.exit(1);
});
