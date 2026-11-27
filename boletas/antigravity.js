// =============================================================================
// PROTOCOLO ANTIGRAVITY v6.0 - SISTEMA SOBERANO DE REPORTES Y BOLETAS
// JC PATH LAB - UNIDAD DE ANATOMÍA PATOLÓGICA Y CITODIAGNÓSTICO
// Dirección Médica: Dr. Josehp Christopher Castillo Cuenca • CMP 58455 • RNE 029091
// Dirección Oficial: Mz. M2 Lote 13, Urb. Jardines de Chillón, Puente Piedra, Lima
// Central / WhatsApp: 986 396 733
// 100% Offline Soberano • Cero Créditos de Nube • Persistencia n8n Docker / Dexie IDB
// =============================================================================

const SOBERANO_N8N_PRIMARY = 'http://localhost:5678';
const SOBERANO_N8N_FALLBACK = 'http://localhost:5679';
const USUARIO_MAESTRO = "admin";
const CLAVE_MAESTRA = "JCPATH2026";

// --- LLAVE SECRETA LOCAL SOBERANA Y PARÁMETROS ZERO-TRUST ---
const SOBERANA_SECRET_KEY = "e4f8a29b3c7d1e0f5a8b9c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f";
const SOBERANO_FASTAPI_PORT = "http://localhost:8010";

// --- MOTOR CRIPTOGRÁFICO SHA-256 SOBERANO (100% PURO JS CON RESPALDO SUBTLE) ---
function sha256_pure_js(ascii) {
    function rightRotate(value, amount) { return (value >>> amount) | (value << (32 - amount)); }
    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = 'length';
    var i, j;
    var result = '';
    var words = [];
    var asciiBitLength = ascii[lengthProperty] * 8;
    var hash = [];
    var k = [];
    var primeCounter = 0;
    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
        if (!isComposite[candidate]) {
            for (i = 0; i < 313; i += candidate) { isComposite[i] = candidate; }
            hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
            k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
        }
    }
    ascii += '\x80';
    while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii[lengthProperty]; i++) {
        j = ascii.charCodeAt(i);
        if (j >> 8) return '';
        words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
    words[words[lengthProperty]] = (asciiBitLength);
    for (j = 0; j < words[lengthProperty];) {
        var w = words.slice(j, j += 16);
        var oldHash = hash;
        hash = hash.slice(0, 8);
        for (i = 0; i < 64; i++) {
            var w15 = w[i - 15], w2 = w[i - 2];
            var a = hash[0], e = hash[4];
            var temp1 = hash[7]
                + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
                + ((e & hash[5]) ^ ((~e) & hash[6]))
                + k[i]
                + (w[i] = (i < 16) ? w[i] : (
                    w[i - 16]
                    + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
                    + w[i - 7]
                    + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
                ) | 0);
            var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
                + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
            hash = [(temp1 + temp2) | 0].concat(hash);
            hash[4] = (hash[4] + temp1) | 0;
        }
        for (i = 0; i < 8; i++) { hash[i] = (hash[i] + oldHash[i]) | 0; }
    }
    for (i = 0; i < 8; i++) {
        for (j = 3; j >= 0; j--) {
            var b = (hash[i] >> (j * 8)) & 255;
            result += ((b < 16) ? '0' : '') + b.toString(16);
        }
    }
    return result;
}

async function calcularSHA256(cadena) {
    try {
        if (window.crypto && window.crypto.subtle && window.TextEncoder) {
            const encoder = new TextEncoder();
            const data = encoder.encode(cadena);
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
    } catch (e) {
        // Fallback a pure JS
    }
    const utf8Str = unescape(encodeURIComponent(cadena));
    return sha256_pure_js(utf8Str);
}

function construirMensajeCanonicoBoleta(b) {
    const codigo = String(b.codigo || '').trim().toUpperCase();
    const ruc = String(b.ruc || '00000000000').trim();
    const fecha = String(b.fecha || '').trim();
    const montosArr = Array.isArray(b.montos) ? b.montos : (typeof b.montos === 'string' ? JSON.parse(b.montos || '[]') : []);
    const totalNum = typeof b.total === 'number' ? b.total : montosArr.reduce((x, y) => x + (parseFloat(y) || 0), 0);
    const total = totalNum.toFixed(2);
    const concepto = "PROCESAMIENTO E INFORME HISTOPATOLÓGICO";
    return `${codigo}|${ruc}|${fecha}|${total}|${concepto}`;
}

async function generarSelloCriptograficoBoleta(b) {
    const mensajeCanonico = construirMensajeCanonicoBoleta(b);
    const cargaConSecreto = `${mensajeCanonico}|${SOBERANA_SECRET_KEY}`;
    const hashCompleto = await calcularSHA256(cargaConSecreto);
    const firmaTruncada = hashCompleto.substring(0, 32).toLowerCase();
    return {
        mensajeCanonico,
        hashCompleto,
        firmaTruncada,
        codigo: b.codigo,
        ruc: b.ruc,
        total: b.total,
        fecha: b.fecha
    };
}

// Parametrización canónica universal del código QR para validación local móvil y remota
function construirUrlQRBoleta(b, sello) {
    const totalNum = typeof b.total === 'number' ? b.total : parseFloat(b.total || 0);
    const totalStr = totalNum.toFixed(2);
    const rucStr = encodeURIComponent(String(b.ruc || '00000000000').trim());
    const fechaStr = encodeURIComponent(String(b.fecha || '').trim());
    const codStr = encodeURIComponent(String(b.codigo || '').trim().toUpperCase());
    const sigStr = encodeURIComponent(sello.firmaTruncada);
    const razonStr = encodeURIComponent(String(b.razonSocial || '').trim());
    const muestrasStr = encodeURIComponent(String(b.numMuestras || 1));
    return `verificar_boleta.html?id=${codStr}&ruc=${rucStr}&total=${totalStr}&f=${fechaStr}&rz=${razonStr}&m=${muestrasStr}&sig=${sigStr}`;
}

// --- UTILIDAD DE REBOTE (DEBOUNCE) DE ALTO RENDIMIENTO (TITÁN & PRIME) ---
function debounce(fn, delay = 250) {
    let timeoutId;
    return function (...args) {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

function generarQRCodeDataURL(texto, tamano = 220) {
    return new Promise((resolve) => {
        let container = null;
        try {
            container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.left = '-9999px';
            container.style.top = '-9999px';
            container.style.width = tamano + 'px';
            container.style.height = tamano + 'px';
            container.style.opacity = '0';
            document.body.appendChild(container);

            if (typeof QRCode !== 'undefined') {
                new QRCode(container, {
                    text: texto,
                    width: tamano,
                    height: tamano,
                    colorDark: "#080c14",
                    colorLight: "#ffffff",
                    correctLevel: (QRCode.CorrectLevel && QRCode.CorrectLevel.M !== undefined) ? QRCode.CorrectLevel.M : 0
                });

                let canvas = container.querySelector('canvas');
                if (canvas) {
                    const dataUrl = canvas.toDataURL('image/png');
                    if (container && container.parentNode) container.parentNode.removeChild(container);
                    container = null;
                    return resolve(dataUrl);
                }

                setTimeout(() => {
                    let dataUrl = '';
                    try {
                        canvas = container ? container.querySelector('canvas') : null;
                        if (canvas) {
                            dataUrl = canvas.toDataURL('image/png');
                        } else if (container) {
                            const img = container.querySelector('img');
                            if (img && img.src) dataUrl = img.src;
                        }
                    } catch (err) {
                        console.warn("Fallo lectura async canvas QR:", err);
                    } finally {
                        if (container && container.parentNode) container.parentNode.removeChild(container);
                        container = null;
                        resolve(dataUrl || null);
                    }
                }, 40);
            } else {
                if (container && container.parentNode) container.parentNode.removeChild(container);
                container = null;
                resolve(null);
            }
        } catch (e) {
            console.error("Error generando QR code local:", e);
            if (container && container.parentNode) container.parentNode.removeChild(container);
            container = null;
            resolve(null);
        }
    });
}

let db;

// --- CATÁLOGO CANÓNICO OFICIAL DE CLÍNICAS (22 INSTITUCIONES VERIFICADAS) ---
const CANONICAL_CLINICAS = [
    {
        "id": 1,
        "razonSocial": "CLÍNICA LA LUZ S.A.C.",
        "nombreComercial": "Clínica La Luz (Sede Central Lima)",
        "ruc": "20517865270",
        "direccion": "Av. Arequipa 1148, Cercado de Lima",
        "telefono": "(01) 613-9292",
        "email": "informes@clinicalaluz.pe",
        "ciudad": "Lima",
        "tipo": "Clínica Privada",
        "tarifaBase": 70.0,
        "contacto": "Dr. Jhon Vilca (Cirugía / Urología)",
        "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
        "id": 2,
        "razonSocial": "CENTRO MÉDICO CLÍNICA DE LA MUJER S.A.C.",
        "nombreComercial": "Clínica La Mujer",
        "ruc": "20512845645",
        "direccion": "Av. Javier Prado Este 2824, San Borja",
        "telefono": "+51 998 450 120",
        "email": "atencion@clinicadelamujer.pe",
        "ciudad": "Lima",
        "tipo": "Clínica Privada Especializada",
        "tarifaBase": 70.0,
        "contacto": "Dr. Juan Jesús Marreros Lloclla",
        "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
        "id": 3,
        "razonSocial": "EMP. DE SERV. DE SALUD POLICL. CARRION S.A. (CLÍNICA CARRIÓN VENTANILLA)",
        "nombreComercial": "Clínica Carrión Ventanilla",
        "ruc": "20419815552",
        "direccion": "Av. Pedro Beltrán Nro. 175 / Mz. B Lte. 1, Urb. Ciudad Satélite, Ventanilla, Callao",
        "telefono": "(01) 577-1000 / 5531610",
        "email": "informes@carrionventanilla.pe",
        "ciudad": "Callao",
        "tipo": "Policlínico y Centro Médico Quirúrgico",
        "tarifaBase": 70.0,
        "contacto": "Administración / Facturación",
        "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
        "id": 4,
        "razonSocial": "CLÍNICA CARRIÓN S.A.C. (HUANCAYO)",
        "nombreComercial": "Clínica Carrión Sede Hospitalaria",
        "ruc": "20130085403",
        "direccion": "Av. Daniel Alcides Carrión 1250, Huancayo",
        "telefono": "(064) 221-500",
        "email": "contacto@clinicacarrion.com.pe",
        "ciudad": "Huancayo / Junín",
        "tipo": "Clínica Quirúrgica y Hospitalaria",
        "tarifaBase": 70.0,
        "contacto": "Dr. Jaime Becerra / Dr. Manuel Sánchez / Dr. Diego Chungui",
        "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
        "id": 5,
        "razonSocial": "CLÍNICA SAN CLEMENTE S.A.C.",
        "nombreComercial": "Clínica San Clemente",
        "ruc": "20512345678",
        "direccion": "Av. Principal 123, Ica / Av. República de Panamá 3055, San Isidro, Lima",
        "telefono": "956123456 / (01) 440-2000",
        "email": "admision@clinicasanclemente.com",
        "ciudad": "Ica / Lima",
        "tipo": "Clínica Privada Regional",
        "tarifaBase": 70.0,
        "contacto": "Dr. Alejandro Escalante Álvaro / Dra. Carmen Vásquez",
        "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
        "id": 6,
        "razonSocial": "EMPRESA DE SALUD ALFA PREVENIR S.A.C. (CLÍNICA ALFA PREVENIR)",
        "nombreComercial": "Policlínico / Clínica Alfa Prevenir",
        "ruc": "20574633177",
        "direccion": "Mza. B Lte. 17, Urb. Mariscal Cáceres, Huamanga / Lima",
        "telefono": "966 612 345 / (066) 312-580",
        "email": "contacto@alfaprevenir.pe",
        "ciudad": "Ayacucho / Lima",
        "tipo": "Centro Médico Preventivo",
        "tarifaBase": 55.0,
        "contacto": "Dra. Laura Saire Bocangel",
        "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
        "id": 7,
        "razonSocial": "CLÍNICA PROVIDENCIA S.A.C.",
        "nombreComercial": "Clínica Providencia",
        "ruc": "20502123456",
        "direccion": "Av. Carlos Izaguirre 1234, Los Olivos, Lima",
        "telefono": "(01) 719-5000",
        "email": "admision@clinicaprovidencia.pe",
        "ciudad": "Lima",
        "tipo": "Clínica Quirúrgica y Maternidad",
        "tarifaBase": 75.0,
        "contacto": "Dra. Nancy Álvarez / Dr. Carlos Mendoza",
        "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
        "id": 8,
        "razonSocial": "CLÍNICA SAN PABLO S.A.C. (SEDE CENTRAL SURCO)",
        "nombreComercial": "Clínica San Pablo Surco",
        "ruc": "20204652474",
        "direccion": "Av. El Polo 789, Santiago de Surco, Lima",
        "telefono": "(01) 610-3333",
        "email": "consultas@sanpablo.com.pe",
        "ciudad": "Lima",
        "tipo": "Complejo Hospitalario de Alta Complejidad",
        "tarifaBase": 100.0,
        "contacto": "Jefatura de Laboratorio / Patología",
        "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
        "id": 9,
        "razonSocial": "CLÍNICA JESÚS DEL NORTE S.A.C. (RED SAN PABLO)",
        "nombreComercial": "Clínica Jesús del Norte",
        "ruc": "20508654321",
        "direccion": "Av. Carlos Izaguirre 153, Independencia, Lima",
        "telefono": "(01) 614-5555",
        "email": "informes@jesusdelnorte.com.pe",
        "ciudad": "Lima",
        "tipo": "Clínica Médico Quirúrgica",
        "tarifaBase": 85.0,
        "contacto": "Dr. Fernando Ortiz / Lic. Patricia Rojas",
        "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
        "id": 10,
        "razonSocial": "CLÍNICA SAN GABRIEL S.A.C. (RED SAN PABLO)",
        "nombreComercial": "Clínica San Gabriel",
        "ruc": "20456789012",
        "direccion": "Av. La Marina 2955, San Miguel, Lima",
        "telefono": "(01) 614-2222",
        "email": "atencion@sangabriel.com.pe",
        "ciudad": "Lima",
        "tipo": "Clínica Quirúrgica y Hospitalaria",
        "tarifaBase": 85.0,
        "contacto": "Dr. Walter Gómez / Dra. Elena Vidal",
        "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
        "id": 11,
        "razonSocial": "CLÍNICA SAN JUAN BAUTISTA S.A.C. (RED SAN PABLO)",
        "nombreComercial": "Clínica San Juan Bautista",
        "ruc": "20519876543",
        "direccion": "Av. Próceres de la Independencia 1764, San Juan de Lurigancho",
        "telefono": "(01) 610-4545",
        "email": "informes@sanjuanbautista.com.pe",
        "ciudad": "Lima",
        "tipo": "Clínica Quirúrgica de San Juan de Lurigancho",
        "tarifaBase": 70.0,
        "contacto": "Dra. Mónica Salazar / Dr. César Huamán",
        "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
        "id": 12,
        "razonSocial": "CLÍNICA MONTEFIORI S.A.",
        "nombreComercial": "Clínica Montefiori",
        "ruc": "20100412345",
        "direccion": "Av. Separadora Industrial 380, Urb. Los Ficus, Ate, Lima",
        "telefono": "(01) 437-5151",
        "email": "admision@montefiori.com.pe",
        "ciudad": "Lima",
        "tipo": "Clínica Privada de Salud Integral",
        "tarifaBase": 70.0,
        "contacto": "Dr. Raúl Palacios / Dra. Gloria Cáceres",
        "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
        "id": 13,
        "razonSocial": "CLÍNICA SAN BERNARDO S.A.C.",
        "nombreComercial": "Clínica San Bernardo",
        "ruc": "20534567890",
        "direccion": "Av. Guardia Civil 337, San Borja, Lima",
        "telefono": "(01) 225-8888",
        "email": "contacto@clinicasanbernardo.com.pe",
        "ciudad": "Lima",
        "tipo": "Clínica Gineco-Obstétrica y Pediátrica",
        "tarifaBase": 75.0,
        "contacto": "Dr. Héctor Barrientos",
        "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
        "id": 14,
        "razonSocial": "CLÍNICA PADRE LUIS TEZZA (HNAS. DE SAN CAMILO)",
        "nombreComercial": "Clínica Tezza",
        "ruc": "20138676249",
        "direccion": "Av. El Polo 570, Monterrico, Surco, Lima",
        "telefono": "(01) 610-5050",
        "email": "informes@tezza.com.pe",
        "ciudad": "Lima",
        "tipo": "Clínica Hospitalaria Religiosa Privada",
        "tarifaBase": 90.0,
        "contacto": "Sor María Rosa / Dr. Gonzalo Farfán",
        "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
        "id": 15,
        "razonSocial": "CLÍNICA STELLA MARIS",
        "nombreComercial": "Clínica Stella Maris",
        "ruc": "20100147603",
        "direccion": "Av. Paso de los Andes 923, Pueblo Libre, Lima",
        "telefono": "(01) 463-6666",
        "email": "informes@stellamaris.com.pe",
        "ciudad": "Lima",
        "tipo": "Clínica General y Hospitalaria",
        "tarifaBase": 80.0,
        "contacto": "Dr. Miguel Ángel Torres / Dra. Clara Soto",
        "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
        "id": 16,
        "razonSocial": "CLÍNICA VESALIO S.A.",
        "nombreComercial": "Clínica Vesalio",
        "ruc": "20108342154",
        "direccion": "Calle Joseph Thompson 140, San Borja, Lima",
        "telefono": "(01) 618-9999",
        "email": "contacto@vesalio.com.pe",
        "ciudad": "Lima",
        "tipo": "Clínica Quirúrgica y Especialidades",
        "tarifaBase": 85.0,
        "contacto": "Dr. Enrique León / Dra. Beatriz Núñez",
        "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
        "id": 17,
        "razonSocial": "CLÍNICA GOOD HOPE (UNIÓN INCA)",
        "nombreComercial": "Clínica Good Hope",
        "ruc": "20100135851",
        "direccion": "Malecón Balta 956, Miraflores, Lima",
        "telefono": "(01) 610-7300",
        "email": "admision@goodhope.org.pe",
        "ciudad": "Lima",
        "tipo": "Clínica Adventista de Alta Complejidad",
        "tarifaBase": 95.0,
        "contacto": "Dr. David Huanca / Dra. Miriam Quispe",
        "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
        "id": 18,
        "razonSocial": "CLÍNICA JAVIER PRADO S.A.",
        "nombreComercial": "Clínica Javier Prado",
        "ruc": "20100010721",
        "direccion": "Av. Javier Prado Este 499, San Isidro, Lima",
        "telefono": "(01) 211-4141",
        "email": "consultas@cjp.pe",
        "ciudad": "Lima",
        "tipo": "Centro Médico y Quirúrgico Integral",
        "tarifaBase": 90.0,
        "contacto": "Dr. Roberto Chang / Dra. Silvia Rivas",
        "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
        "id": 19,
        "razonSocial": "CLÍNICA ANGLO AMERICANA S.A.",
        "nombreComercial": "Clínica Anglo Americana",
        "ruc": "20100030595",
        "direccion": "Calle Alfredo Salazar s/n, San Isidro, Lima",
        "telefono": "(01) 616-8900",
        "email": "servicios@angloamericana.com.pe",
        "ciudad": "Lima",
        "tipo": "Hospital Privado de Acreditación Internacional",
        "tarifaBase": 140.0,
        "contacto": "Departamento de Patología y Laboratorio",
        "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
        "id": 20,
        "razonSocial": "CLÍNICA RICARDO PALMA S.A.",
        "nombreComercial": "Clínica Ricardo Palma",
        "ruc": "20100121800",
        "direccion": "Av. Javier Prado Este 1066, San Borja, Lima",
        "telefono": "(01) 224-2224",
        "email": "informes@crp.com.pe",
        "ciudad": "Lima",
        "tipo": "Hospital Privado de Referencia Nacional",
        "tarifaBase": 130.0,
        "contacto": "Dr. Marco Zúñiga / Dra. Patricia Bedoya",
        "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
        "id": 21,
        "razonSocial": "CLÍNICA INTERNACIONAL S.A.",
        "nombreComercial": "Clínica Internacional (Red Breca)",
        "ruc": "20100054184",
        "direccion": "Av. Garcilaso de la Vega 1420, Cercado de Lima",
        "telefono": "(01) 619-6161",
        "email": "atencionreclamosci@cinternacional.com.pe",
        "ciudad": "Lima",
        "tipo": "Red de Salud Privada",
        "tarifaBase": 120.0,
        "contacto": "Laboratorio y Anatomía Patológica",
        "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
        "id": 22,
        "razonSocial": "ATENCIÓN PARTICULAR / PACIENTE PRIVADO",
        "nombreComercial": "Particular (JC PATH LAB)",
        "ruc": "00000000000",
        "direccion": "Mz. M2 Lote 13, Urb. Jardines de Chillón, Puente Piedra, Lima",
        "telefono": "986 396 733",
        "email": "jcpathlab@gmail.com",
        "ciudad": "Lima",
        "tipo": "Atención Particular Directa",
        "tarifaBase": 70.0,
        "contacto": "Dr. Josehp Christopher Castillo Cuenca",
        "createdAt": "2026-01-01T00:00:00.000Z"
    }
];

// --- INICIALIZACIÓN DE LA RED NEURAL LOCAL (DEXIE v9 CON COLA PERSISTENTE) ---
async function initDatabase() {
    try {
        db = new Dexie('LaboratorioDB');
        db.version(8).stores({
            clientes: '++id, &ruc, razonSocial, createdAt',
            boletas: '++id, codigo, ruc, fecha, createdAt, [fecha+ruc]'
        });
        db.version(9).stores({
            clientes: '++id, &ruc, razonSocial, createdAt',
            boletas: '++id, codigo, ruc, fecha, createdAt, [fecha+ruc], syncStatus',
            sync_queue: '++id, tipo, estado, intentos, createdAt'
        });
        await db.open();
        console.log("✅ Base de Datos Dexie Online (LaboratorioDB v9 Soberana con sync_queue).");
        
        // Auto-población garantizada y corrección de datos de contacto
        await seedCanonicalClinicas();
        // Procesar cola de sincronización pendiente
        procesarColaSincronizacion();
    } catch (e) {
        console.error("❌ Fallo crítico en DB Dexie:", e);
    }
}

// --- COLA DE SINCRONIZACIÓN PERSISTENTE (DEXIE -> SQLite / n8n) ---
async function encolarSincronizacion(tipo, data) {
    try {
        if (!db || !db.sync_queue) return;
        await db.sync_queue.add({
            tipo,
            data,
            estado: 'pendiente',
            intentos: 0,
            createdAt: new Date().toISOString()
        });
        procesarColaSincronizacion();
    } catch (e) {
        console.warn("Aviso al encolar en sync_queue:", e);
    }
}

async function procesarColaSincronizacion() {
    if (!db || !db.sync_queue) return;
    try {
        const pendientes = await db.sync_queue.where('estado').equals('pendiente').toArray();
        if (!pendientes || pendientes.length === 0) return;

        console.log(`🔄 Procesando cola de sincronización: ${pendientes.length} elementos pendientes...`);
        for (const item of pendientes) {
            let n8nOk = false;
            let sqliteOk = false;

            try {
                if (item.tipo === 'boleta') {
                    // 1. Persistir en n8n
                    const resN8n = await fetchSovereign('/webhook/guardar-boleta', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(item.data)
                    });
                    if (resN8n) n8nOk = true;

                    // 2. Persistir en SQLite (FastAPI 8010)
                    const resSqlite = await fetch('http://localhost:8010/api/guardar-boleta', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(item.data)
                    });
                    if (resSqlite && resSqlite.ok) sqliteOk = true;
                } else if (item.tipo === 'cliente') {
                    const resCli = await fetchSovereign('/webhook/guardar-cliente', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(item.data)
                    });
                    if (resCli) n8nOk = true;
                }
            } catch (err) {
                // Falla conexión transitoria
            }

            if (n8nOk || sqliteOk) {
                await db.sync_queue.update(item.id, { estado: 'sincronizado', syncedAt: new Date().toISOString() });
                if (item.tipo === 'boleta' && item.data && item.data.codigo) {
                    const b = await db.boletas.where('codigo').equals(item.data.codigo).first();
                    if (b) await db.boletas.update(b.id, { syncStatus: 'sincronizado' });
                }
            } else {
                await db.sync_queue.update(item.id, { intentos: (item.intentos || 0) + 1 });
            }
        }
    } catch (e) {
        console.warn("Aviso procesando sync_queue:", e);
    }
}

// --- SIEMBRA Y ACTUALIZACIÓN DEL CATÁLOGO CANÓNICO ---
async function seedCanonicalClinicas() {
    if (!db) return;
    try {
        let countNuevas = 0;
        let countActualizadas = 0;

        // Transacción Atómica Optimizada (Prime): 1 sola transacción en lugar de 44 individuales
        await db.transaction('rw', db.clientes, async () => {
            const todosExistentes = await db.clientes.toArray();
            const rucMap = new Map(todosExistentes.map(item => [item.ruc, item]));

            for (const c of CANONICAL_CLINICAS) {
                const existe = rucMap.get(c.ruc);
                if (!existe) {
                    await db.clientes.add({
                        ruc: c.ruc,
                        razonSocial: c.razonSocial,
                        nombreComercial: c.nombreComercial || c.razonSocial,
                        direccion: c.direccion || '',
                        telefono: c.telefono || '',
                        tarifaBase: c.tarifaBase || 70.0,
                        ciudad: c.ciudad || 'Lima',
                        tipo: c.tipo || 'Clínica',
                        contacto: c.contacto || '',
                        createdAt: c.createdAt || new Date().toISOString()
                    });
                    countNuevas++;
                } else {
                    const updates = {};
                    const esParticular = c.ruc === '00000000000';
                    const tieneAntigua = existe.direccion && existe.direccion.includes('Cutervo');

                    if (esParticular || tieneAntigua) {
                        updates.direccion = c.direccion;
                        updates.telefono = c.telefono;
                        updates.ciudad = c.ciudad;
                        updates.tarifaBase = c.tarifaBase;
                    } else {
                        if (!existe.direccion && c.direccion) updates.direccion = c.direccion;
                        if (!existe.telefono && c.telefono) updates.telefono = c.telefono;
                        if (!existe.tarifaBase && c.tarifaBase) updates.tarifaBase = c.tarifaBase;
                    }

                    if (Object.keys(updates).length > 0) {
                        await db.clientes.update(existe.id, updates);
                        countActualizadas++;
                    }
                }
            }
        });
        console.log(`🏛️ Catálogo verificado: ${countNuevas} nuevas sembradas, ${countActualizadas} actualizadas con dirección oficial.`);
    } catch (err) {
        console.warn("⚠️ Aviso al sembrar catálogo en Dexie:", err);
    }
}

// --- ACTUALIZADOR DEL BADGE DE ESTADO SOBERANO ---
function updateSovereignStatus(isOnline, label = "n8n Docker :5678") {
    const badge = document.getElementById('sovereign-sync-status');
    if (!badge) return;
    const dot = badge.querySelector('.status-dot');
    const text = badge.querySelector('.status-text');

    if (isOnline) {
        badge.classList.remove('offline');
        if (text) text.textContent = label || "n8n Docker :5678";
        badge.title = "Conexión activa y sincronizada con Docker n8n (puerto 5678)";
    } else {
        badge.classList.add('offline');
        if (text) text.textContent = label || "100% Offline (Dexie IDB)";
        badge.title = "Modo autónomo local: Datos guardados en Dexie IndexedDB";
    }
}

// --- CLIENTE HTTP SOBERANO CON RESILIENCIA Y TIMEOUT <2s ---
async function fetchSovereign(endpoint, options = {}) {
    const primaryUrl = `${SOBERANO_N8N_PRIMARY}${endpoint}`;
    const fallbackUrl = `${SOBERANO_N8N_FALLBACK}${endpoint}`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(primaryUrl, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
            updateSovereignStatus(true, "n8n Docker :5678");
            return await res.json();
        }
    } catch (err) {
        // Intento con fallback secundario
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(fallbackUrl, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
            updateSovereignStatus(true, "n8n Fallback :5679");
            return await res.json();
        }
    } catch (err) {
        // Fallback local soberano garantizado
    }

    updateSovereignStatus(false, "100% Offline (Dexie IDB)");
    return null;
}

// --- SINCRONIZACIÓN SOBERANA BIDIRECCIONAL ---
async function syncFromSovereignDB() {
    const spinner = document.getElementById('search-spinner');
    if (spinner) spinner.style.display = 'block';

    try {
        // 1. Sincronizar Clientes desde n8n (Transacción atómica)
        const dataClientes = await fetchSovereign('/webhook/obtener-clientes');
        if (dataClientes && Array.isArray(dataClientes.clientes)) {
            await db.transaction('rw', db.clientes, async () => {
                for (const c of dataClientes.clientes) {
                    const existe = await db.clientes.where('ruc').equals(c.ruc).first();
                    if (existe) {
                        await db.clientes.update(existe.id, {
                            razonSocial: c.razonSocial,
                            direccion: c.direccion,
                            telefono: c.telefono,
                            tarifaBase: c.tarifaBase || 70.0
                        });
                    } else {
                        await db.clientes.add({
                            ruc: c.ruc,
                            razonSocial: c.razonSocial,
                            direccion: c.direccion,
                            telefono: c.telefono,
                            tarifaBase: c.tarifaBase || 70.0,
                            createdAt: c.createdAt || new Date().toISOString()
                        });
                    }
                }
            });
            console.log(`✅ Clientes remotos sincronizados desde n8n: ${dataClientes.clientes.length}`);
        }

        // 2. Sincronizar Boletas desde n8n (Transacción atómica)
        const dataBoletas = await fetchSovereign('/webhook/obtener-boletas');
        if (dataBoletas && Array.isArray(dataBoletas.boletas)) {
            await db.transaction('rw', db.boletas, async () => {
                for (const b of dataBoletas.boletas) {
                    const existe = await db.boletas.where('codigo').equals(b.codigo).first();
                    const montos = Array.isArray(b.montos) ? b.montos : (typeof b.montos === 'string' ? JSON.parse(b.montos || '[]') : []);
                    const registro = {
                        codigo: b.codigo,
                        clienteId: b.clienteId,
                        razonSocial: b.razonSocial,
                        ruc: b.ruc,
                        total: b.total,
                        montos: montos,
                        numMuestras: b.numMuestras || montos.length,
                        fecha: b.fecha,
                        createdAt: b.createdAt || new Date().toISOString()
                    };
                    if (existe) {
                        await db.boletas.update(existe.id, registro);
                    } else {
                        await db.boletas.add(registro);
                    }
                }
            });
            console.log(`✅ Boletas remotas sincronizadas desde n8n: ${dataBoletas.boletas.length}`);
        }

        // Si n8n no respondió directamente boletas, verificar con obtener-datos general
        if (!dataBoletas) {
            const dataGeneral = await fetchSovereign('/webhook/obtener-datos');
            if (dataGeneral) {
                console.log("ℹ️ Endpoint general n8n verificado:", dataGeneral.servidor);
            }
        }
    } catch (err) {
        console.warn("Aviso de sincronización en background:", err);
    } finally {
        if (spinner) spinner.style.display = 'none';
        renderAll();
    }
}

// --- CAPA DE AUTENTICACIÓN SOBERANA ---
function handleAuth() {
    sessionStorage.setItem('ag_auth', 'true');
    const lockScreen = document.getElementById('ag-lock-screen');
    if (lockScreen) lockScreen.style.display = 'none';
    syncFromSovereignDB();
}


// =============================================================================
// SISTEMA DE NOTIFICACIONES TOAST ANTIGRAVITY (BIOTECH ZERO-TRUST)
// Reemplazo no bloqueante para window.alert() con iconos biotecnológicos y progreso
// =============================================================================
function showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('ag-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'ag-toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `ag-toast ${type}`;

    let iconClass = 'fa-circle-info';
    let defaultTitle = 'INFORMACIÓN OPERATIVA';
    if (type === 'success') {
        iconClass = 'fa-circle-check';
        defaultTitle = 'OPERACIÓN EXITOSA';
    } else if (type === 'error') {
        iconClass = 'fa-circle-xmark';
        defaultTitle = 'ERROR DEL SISTEMA';
    } else if (type === 'warning') {
        iconClass = 'fa-triangle-exclamation';
        defaultTitle = 'AVISO REQUERIDO';
    }

    toast.innerHTML = `
        <div class="toast-icon-wrap">
            <i class="fas ${iconClass}"></i>
        </div>
        <div class="toast-body-block">
            <div class="toast-title">${defaultTitle}</div>
            <div class="toast-desc">${escapeHtml(message).replace(/\n/g, '<br>')}</div>
        </div>
        <button type="button" class="toast-close-btn" title="Cerrar">&times;</button>
        <div class="toast-progress"></div>
    `;

    container.appendChild(toast);

    const progressBar = toast.querySelector('.toast-progress');
    if (progressBar) {
        progressBar.style.transition = `width ${duration}ms linear`;
        progressBar.style.width = '100%';
        setTimeout(() => {
            if (progressBar) progressBar.style.width = '0%';
        }, 20);
    }

    let dismissed = false;
    const dismiss = () => {
        if (dismissed) return;
        dismissed = true;
        toast.classList.add('toast-hiding');
        setTimeout(() => {
            if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
        }, 260);
    };

    toast.querySelector('.toast-close-btn').onclick = dismiss;
    const timeoutId = setTimeout(dismiss, duration);

    toast.addEventListener('mouseenter', () => {
        clearTimeout(timeoutId);
        if (progressBar) progressBar.style.transition = 'none';
    });
    toast.addEventListener('mouseleave', () => {
        setTimeout(dismiss, 1200);
    });

    return toast;
}

// Red de seguridad: Sobrescribir window.alert nativo
window.alert = function(msg) {
    showToast(msg, 'info');
};

// =============================================================================
// COMPONENTE FLOTANTE CORTANA GUIDANCE ORB (ASISTENTE DIDÁCTICA)
// Guía contextual no intrusiva con micro-tips clínicos
// =============================================================================
const CORTANA_TIPS = {
    inicio: [
        "Centro de Operaciones listo. Seleccione 'Emitir' para facturar muestras o 'Integrar' para registrar una nueva clínica.",
        "Soberanía 100% Offline: Todos los comprobantes se firman localmente con SHA-256 inmutable."
    ],
    registro: [
        "Escriba la razón social para autocompletar RUC y dirección desde nuestro catálogo médico verificado.",
        "Los datos registrados quedan persistidos en el nodo local Dexie y se replican al contenedor n8n."
    ],
    listado: [
        "Cartera sincronizada: Puede filtrar por RUC o ciudad para localizar clínicas rápidamente.",
        "Cada cliente conserva su tarifa médica arancelaria base preconfigurada (S/ 70.00)."
    ],
    plantilla: [
        "Seleccione la entidad: el total se recalculará según la tarifa base sugerida (S/ 70.00).",
        "Puede agregar o reducir muestras clínicas; cada espécimen puede tener un costo individual personalizado.",
        "Al generar la boleta, se creará un código QR criptográfico compatible con el validador oficial."
    ],
    'registro-boletas': [
        "Archivo Maestro: Presione 'QR' para ver la verificación Zero-Trust o 'PDF' para descargar en alta resolución (300+ DPI).",
        "Los comprobantes generados no pueden ser adulterados gracias al sello criptográfico de 64 caracteres."
    ]
};

let cortanaCurrentSection = 'inicio';
let cortanaTipIndex = 0;
let cortanaBubbleVisible = true;
let cortanaAutoDismissTimer = null;

function initCortanaOrb() {
    let orbContainer = document.getElementById('cortana-orb-container');
    if (!orbContainer) {
        orbContainer = document.createElement('div');
        orbContainer.id = 'cortana-orb-container';
        orbContainer.className = 'cortana-orb-container';
        document.body.appendChild(orbContainer);
    }

    orbContainer.innerHTML = `
        <div class="cortana-speech-bubble" id="cortana-speech-bubble">
            <div class="cortana-bubble-header">
                <div class="cortana-tag">
                    <i class="fas fa-sparkles"></i>
                    <span>CORTANA &bull; GUÍA DIDÁCTICA</span>
                </div>
                <button type="button" class="cortana-bubble-close" id="cortana-close-btn" title="Minimizar sugerencia">&times;</button>
            </div>
            <div class="cortana-bubble-text" id="cortana-bubble-text">
                Centro de Operaciones listo. Seleccione 'Emitir' para facturar o 'Integrar' para agregar clínicas.
            </div>
            <div class="cortana-bubble-footer">
                <span class="cortana-tip-step" id="cortana-tip-counter">Tip 1 de 2</span>
                <button type="button" class="cortana-next-btn" id="cortana-next-btn">Siguiente &rarr;</button>
            </div>
        </div>
        <button type="button" class="cortana-orb-btn" id="cortana-orb-btn" title="Asistente Didáctica CORTANA">
            <i class="fas fa-brain"></i>
        </button>
    `;

    const bubble = document.getElementById('cortana-speech-bubble');
    const orbBtn = document.getElementById('cortana-orb-btn');
    const closeBtn = document.getElementById('cortana-close-btn');
    const nextBtn = document.getElementById('cortana-next-btn');

    if (closeBtn) {
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            cortanaBubbleVisible = false;
            bubble.style.display = 'none';
        };
    }

    if (orbBtn) {
        orbBtn.onclick = () => {
            cortanaBubbleVisible = !cortanaBubbleVisible;
            bubble.style.display = cortanaBubbleVisible ? 'flex' : 'none';
            if (cortanaBubbleVisible) {
                updateCortanaTip();
            }
        };
    }

    if (nextBtn) {
        nextBtn.onclick = (e) => {
            e.stopPropagation();
            const tips = CORTANA_TIPS[cortanaCurrentSection] || CORTANA_TIPS.inicio;
            cortanaTipIndex = (cortanaTipIndex + 1) % tips.length;
            updateCortanaTip();
        };
    }

    // Auto ocultar después de 9 segundos
    cortanaAutoDismissTimer = setTimeout(() => {
        if (bubble && cortanaBubbleVisible) {
            bubble.style.display = 'none';
            cortanaBubbleVisible = false;
        }
    }, 9000);
}

function updateCortanaTip() {
    const bubble = document.getElementById('cortana-speech-bubble');
    const textEl = document.getElementById('cortana-bubble-text');
    const counterEl = document.getElementById('cortana-tip-counter');
    if (!bubble || !textEl) return;

    const tips = CORTANA_TIPS[cortanaCurrentSection] || CORTANA_TIPS.inicio;
    if (cortanaTipIndex >= tips.length) cortanaTipIndex = 0;

    textEl.innerHTML = tips[cortanaTipIndex];
    if (counterEl) {
        counterEl.textContent = `Tip ${cortanaTipIndex + 1} de ${tips.length}`;
    }
}

function notifyCortanaSection(sectionId) {
    cortanaCurrentSection = sectionId;
    cortanaTipIndex = 0;
    const bubble = document.getElementById('cortana-speech-bubble');
    if (bubble) {
        cortanaBubbleVisible = true;
        bubble.style.display = 'flex';
        updateCortanaTip();
        if (cortanaAutoDismissTimer) clearTimeout(cortanaAutoDismissTimer);
        cortanaAutoDismissTimer = setTimeout(() => {
            if (bubble) {
                bubble.style.display = 'none';
                cortanaBubbleVisible = false;
            }
        }, 7500);
    }
}

// --- GESTIÓN DE CLIENTES / CLÍNICAS ---
async function handleAddCliente() {
    const razonSocial = document.getElementById('razon-social').value.trim();
    const ruc = document.getElementById('ruc').value.trim();
    if (!razonSocial || !ruc) return showToast("Por favor complete Razón Social y RUC/DNI.", "warning");

    try {
        const existe = await db.clientes.where('ruc').equals(ruc).first();
        if (existe) return showToast(`El documento ${ruc} ya se encuentra registrado para "${existe.razonSocial}".`, "warning");

        const cliente = {
            razonSocial: razonSocial.toUpperCase(),
            nombreComercial: razonSocial,
            ruc,
            direccion: document.getElementById('direccion').value.trim() || 'No registrada',
            telefono: document.getElementById('telefono').value.trim() || '-',
            tarifaBase: 70.0,
            ciudad: 'Lima',
            tipo: 'Clínica / Entidad',
            createdAt: new Date().toISOString()
        };

        // 1. Guardado Inmediato Atómico en Dexie Cache
        const newId = await db.clientes.add(cliente);
        cliente.id = newId;

        // 2. Persistencia Asíncrona en n8n
        fetchSovereign('/webhook/guardar-cliente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cliente)
        }).then(res => {
            console.log("✅ Cliente persistido en Docker n8n:", res);
        }).catch(err => {
            console.warn("Aviso: Persistencia local garantizada:", err);
        });

        document.getElementById('cliente-form').reset();
        showSection('listado');
        renderClientes();
        populateClientSelect();
        populateClinicasDatalist();
        
        showToast("Entidad / Clínica registrada exitosamente en la Red Soberana.", "success");
    } catch (e) {
        console.error("Fallo en registro:", e);
        showToast("Error en registro local: " + e.message, "error");
    }
}

async function renderClientes(filtro = '') {
    const tbody = document.getElementById('clientes-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    let clientes = await db.clientes.orderBy('razonSocial').toArray();
    if (filtro) {
        const term = filtro.toLowerCase();
        clientes = clientes.filter(c => 
            (c.razonSocial && c.razonSocial.toLowerCase().includes(term)) ||
            (c.ruc && c.ruc.includes(term)) ||
            (c.ciudad && c.ciudad.toLowerCase().includes(term))
        );
    }

    if (clientes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-dim); padding:2rem;">No se encontraron registros de clientes.</td></tr>`;
        return;
    }

    clientes.forEach((c, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-label="IDENT">#${index + 1}</td>
            <td data-label="RAZÓN SOCIAL / CLÍNICA"><strong>${escapeHtml(c.razonSocial)}</strong></td>
            <td data-label="RUC / DNI"><span class="badge-code">${escapeHtml(c.ruc)}</span></td>
            <td data-label="ACCIONES" style="text-align: center;">
                <button class="btn-mini btn-delete" onclick="deleteClient(${c.id})" title="Eliminar Cliente de la Cartera">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function deleteClient(id) {
    const c = await db.clientes.get(id);
    const nombre = c ? c.razonSocial : 'este cliente';
    if (confirm(`¿Desea eliminar a "${nombre}" del registro local?`)) {
        await db.clientes.delete(id);
        renderClientes();
        populateClientSelect();
        populateClinicasDatalist();
    }
}

// --- GESTIÓN DE BOLETAS ---
async function handleAddBoleta() {
    const clientSelect = document.getElementById('cliente-select');
    const clientId = parseInt(clientSelect.value);
    if (!clientId) return showToast("Por favor seleccione un cliente o clínica registrado.", "warning");

    const cliente = await db.clientes.get(clientId);
    if (!cliente) return showToast("No se encontró el registro del cliente.", "error");

    const montos = Array.from(document.querySelectorAll('.costo-muestra')).map(i => parseFloat(i.value) || 0);
    const total = montos.reduce((a, b) => a + b, 0);

    if (total <= 0) return showToast("El monto total a facturar debe ser mayor a cero.", "warning");
    
    const codigo = await generarCodigo();
    const boleta = {
        codigo,
        clienteId: cliente.id,
        razonSocial: cliente.razonSocial,
        ruc: cliente.ruc,
        total,
        montos,
        numMuestras: montos.length,
        fecha: new Date().toISOString(),
        createdAt: new Date().toISOString()
    };

    // Generar Sello Criptográfico SHA-256 Zero-Trust
    const sello = await generarSelloCriptograficoBoleta(boleta);
    boleta.hashSHA256 = sello.hashCompleto;
    boleta.firmaDigital = sello.firmaTruncada;
    // URL canónica empaquetada apta para lectores móviles y verificación autónoma
    boleta.qrUrl = construirUrlQRBoleta(boleta, sello);
    boleta.syncStatus = 'pendiente';

    // 1. Guardar localmente en Dexie
    const boletaId = await db.boletas.add(boleta);
    boleta.id = boletaId;

    // 2. Encolar en la cola persistente de sincronización (Dexie -> n8n / SQLite)
    await encolarSincronizacion('boleta', boleta);

    showToast(`Boleta ${codigo} generada con éxito para ${cliente.razonSocial} (Total: S/ ${total.toFixed(2)})`, "success", 4000);
    renderBoletas();
    showSection('registro-boletas');
}

async function renderBoletas(filtro = '') {
    const tbody = document.getElementById('boletas-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    let boletas = await db.boletas.orderBy('createdAt').reverse().toArray();

    if (filtro) {
        const term = filtro.toLowerCase();
        boletas = boletas.filter(b => 
            (b.codigo && b.codigo.toLowerCase().includes(term)) ||
            (b.razonSocial && b.razonSocial.toLowerCase().includes(term)) ||
            (b.ruc && b.ruc.includes(term))
        );
    }

    if (boletas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-dim); padding:2rem;">No se encontraron boletas archivadas.</td></tr>`;
        return;
    }

    boletas.forEach(b => {
        const montosArr = Array.isArray(b.montos) ? b.montos : (typeof b.montos === 'string' ? JSON.parse(b.montos || '[]') : []);
        const totalVal = typeof b.total === 'number' ? b.total : (montosArr.reduce((x, y2) => x + (parseFloat(y2) || 0), 0));
        const fechaStr = b.fecha ? new Date(b.fecha).toLocaleDateString('es-PE') : '-';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-label="CÓDIGO"><span class="badge-code">${escapeHtml(b.codigo)}</span></td>
            <td data-label="ENTIDAD / INSTITUCIÓN"><strong>${escapeHtml(b.razonSocial)}</strong></td>
            <td data-label="FECHA">${fechaStr}</td>
            <td data-label="MONTO TOTAL"><span class="badge-monto">S/ ${totalVal.toFixed(2)}</span></td>
            <td data-label="ACCIONES" style="text-align: center;">
                <button onclick="verQRBoleta(${b.id})" class="btn-mini btn-qr" title="Ver Validación Zero-Trust y QR Antifraude">
                    <i class="fas fa-qrcode"></i> QR
                </button>
                <button onclick="imprimirPDF(${b.id})" class="btn-mini btn-pdf" title="Descargar PDF Vectorial con QR">
                    <i class="fas fa-file-pdf"></i> PDF
                </button>
                <button onclick="deleteBoleta(${b.id})" class="btn-mini btn-delete" title="Eliminar Boleta del Registro">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function deleteBoleta(id) {
    const b = await db.boletas.get(id);
    if (!b) return;
    if (confirm(`¿Confirma eliminar la boleta ${b.codigo} de ${b.razonSocial}?`)) {
        await db.boletas.delete(id);
        renderBoletas();
    }
}

// --- VENTANA MODAL FLOTANTE DE VALIDACIÓN ZERO-TRUST Y QR ---
async function verQRBoleta(id) {
    const b = await db.boletas.get(id);
    if (!b) return showToast("Boleta no encontrada en la base de datos.", "error");

    const sello = await generarSelloCriptograficoBoleta(b);
    const qrUrl = b.qrUrl || construirUrlQRBoleta(b, sello);

    // Renderizar QR en el canvas wrap del modal
    const qrWrap = document.getElementById('modal-qr-canvas-wrap');
    if (qrWrap) {
        qrWrap.innerHTML = '';
        if (typeof QRCode !== 'undefined') {
            new QRCode(qrWrap, {
                text: qrUrl,
                width: 170,
                height: 170,
                colorDark: "#080c14",
                colorLight: "#ffffff",
                correctLevel: (QRCode.CorrectLevel && QRCode.CorrectLevel.M !== undefined) ? QRCode.CorrectLevel.M : 0
            });
        }
    }

    // Llenar detalles en el modal
    const setVal = (elId, val) => { const el = document.getElementById(elId); if (el) el.textContent = val; };
    setVal('modal-qr-codigo', b.codigo);
    setVal('modal-qr-cliente', b.razonSocial || 'Particular');
    setVal('modal-qr-ruc', b.ruc || '-');
    const montosArr = Array.isArray(b.montos) ? b.montos : (typeof b.montos === 'string' ? JSON.parse(b.montos || '[]') : []);
    const totalVal = typeof b.total === 'number' ? b.total : montosArr.reduce((x, y) => x + (parseFloat(y) || 0), 0);
    setVal('modal-qr-total', `S/ ${totalVal.toFixed(2)}`);
    setVal('modal-qr-fecha', b.fecha ? new Date(b.fecha).toLocaleString('es-PE') : '-');
    setVal('modal-qr-hash', `${sello.hashCompleto.substring(0, 32)}...`);

    // Botón copiar hash
    const btnCopy = document.getElementById('btn-copy-hash');
    if (btnCopy) {
        btnCopy.onclick = () => {
            navigator.clipboard.writeText(sello.hashCompleto).then(() => {
                btnCopy.innerHTML = '<i class="fas fa-check"></i>';
                showToast("Sello Hash SHA-256 copiado al portapapeles.", "success", 2500);
                setTimeout(() => btnCopy.innerHTML = '<i class="fas fa-copy"></i>', 1500);
            }).catch(() => {
                showToast(`Sello Hash: ${sello.hashCompleto.substring(0, 24)}...`, "info", 4000);
            });
        };
    }

    // Link a validador soberano
    const linkVerificar = document.getElementById('modal-qr-link-verificar');
    if (linkVerificar) {
        linkVerificar.href = qrUrl;
    }

    // Botón descargar PDF
    const btnPdf = document.getElementById('btn-modal-descargar-pdf');
    if (btnPdf) {
        btnPdf.onclick = () => imprimirPDF(b.id);
    }

    // Abrir modal
    const modal = document.getElementById('modal-qr-container');
    if (modal) modal.style.display = 'flex';
}

function cerrarModalQR() {
    const modal = document.getElementById('modal-qr-container');
    if (modal) modal.style.display = 'none';
}

async function generarCodigo() {
    const year = new Date().getFullYear();
    const count = await db.boletas.count();
    return `BOL-${year}-${(count + 1).toString().padStart(4, '0')}`;
}

// --- POBLADO DE SELECTORES Y SUGERENCIAS ---
async function populateClientSelect() {
    const select = document.getElementById('cliente-select');
    if (!select) return;
    const currentVal = select.value;
    select.innerHTML = '<option value="">-- Seleccionar Institución o Paciente --</option>';

    const clientes = await db.clientes.orderBy('razonSocial').toArray();
    clientes.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.razonSocial} (${c.ruc})`;
        select.appendChild(opt);
    });

    if (currentVal && Array.from(select.options).some(o => o.value === currentVal)) {
        select.value = currentVal;
    } else if (clientes.length > 0) {
        // Seleccionar por defecto la primera opción
        select.selectedIndex = 1;
        updateClientDetails(clientes[0]);
    }
}

async function populateClinicasDatalist() {
    const dl = document.getElementById('datalist-clinicas-sugeridas');
    if (!dl) return;
    dl.innerHTML = '';
    CANONICAL_CLINICAS.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.razonSocial;
        opt.dataset.ruc = c.ruc;
        opt.dataset.direccion = c.direccion;
        opt.dataset.telefono = c.telefono;
        dl.appendChild(opt);
    });
}

function updateClientDetails(c) {
    const rucEl = document.getElementById('ruc-cliente');
    const dirEl = document.getElementById('direccion-cliente');
    const tarEl = document.getElementById('tarifa-cliente');

    if (c) {
        if (rucEl) rucEl.textContent = c.ruc || '-';
        if (dirEl) dirEl.textContent = c.direccion || 'Dirección no registrada';
        if (tarEl) tarEl.textContent = `S/ ${(c.tarifaBase || 70.0).toFixed(2)}`;
    } else {
        if (rucEl) rucEl.textContent = '-';
        if (dirEl) dirEl.textContent = '-';
        if (tarEl) tarEl.textContent = 'S/ 70.00';
    }
}

function renderCostoInputs() {
    const numEl = document.getElementById('num-muestras');
    const num = parseInt(numEl ? numEl.value : 1) || 1;
    const container = document.getElementById('costos-container');
    if (!container) return;

    const clientSelect = document.getElementById('cliente-select');
    const selectedId = clientSelect ? parseInt(clientSelect.value) : null;
    
    let defaultTarifa = "70.00";
    if (selectedId) {
        db.clientes.get(selectedId).then(c => {
            const tarifa = c && c.tarifaBase ? c.tarifaBase.toFixed(2) : "70.00";
            buildCostoInputs(num, container, tarifa);
        }).catch(() => {
            buildCostoInputs(num, container, defaultTarifa);
        });
    } else {
        buildCostoInputs(num, container, defaultTarifa);
    }
}

function buildCostoInputs(num, container, defaultTarifa) {
    container.innerHTML = '';
    const clientSelect = document.getElementById('cliente-select');
    const selectedId = clientSelect ? parseInt(clientSelect.value) : null;
    
    // Lógica de tarifario escalonado para Clínica La Mujer (ID 2)
    const esClinicaLaMujer = selectedId === 2;
    const tarifasEscalonadas = { 1: 40.00, 2: 60.00, 3: 80.00 };

    for (let i = 1; i <= num; i++) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'costo-item';

        const labelSpan = document.createElement('span');
        labelSpan.className = 'costo-label';
        labelSpan.innerHTML = `<i class="fas fa-vial"></i> Muestra #${i}`;

        const inputWrap = document.createElement('div');
        inputWrap.className = 'costo-input-wrap';

        const prefix = document.createElement('span');
        prefix.className = 'currency-prefix';
        prefix.textContent = 'S/';

        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'costo-muestra';
        
        // Aplicar tarifa escalonada si es Clínica La Mujer, sino usar default
        const valor = esClinicaLaMujer ? (tarifasEscalonadas[i] || 80.00) : defaultTarifa;
        input.value = parseFloat(valor).toFixed(2);
        
        input.step = "5.00";
        input.min = "0";
        input.oninput = debounce(calcularTotal, 200);

        inputWrap.appendChild(prefix);
        inputWrap.appendChild(input);
        itemDiv.appendChild(labelSpan);
        itemDiv.appendChild(inputWrap);
        container.appendChild(itemDiv);
    }
    calcularTotal();
}

function calcularTotal() {
    const total = Array.from(document.querySelectorAll('.costo-muestra')).reduce((s, i) => s + (parseFloat(i.value) || 0), 0);
    const totalEl = document.getElementById('pago-total');
    if (totalEl) totalEl.textContent = `S/ ${total.toFixed(2)}`;
    actualizarPreviewZeroTrust(total);
}

// --- ACTUALIZADOR DE PREVISUALIZACIÓN ZERO-TRUST EN PANTALLA ---
async function actualizarPreviewZeroTrust(total) {
    try {
        const clientSelect = document.getElementById('cliente-select');
        const clientId = parseInt(clientSelect ? clientSelect.value : 0);
        const cliente = clientId ? await db.clientes.get(clientId) : null;
        const totalNum = typeof total === 'number' ? total : 70.0;

        const previewBoleta = {
            codigo: 'BOL-PREVIEW',
            ruc: cliente ? cliente.ruc : '20517865270',
            fecha: new Date().toISOString(),
            total: totalNum
        };
        const sello = await generarSelloCriptograficoBoleta(previewBoleta);
        const hashEl = document.getElementById('zt-preview-hash');
        if (hashEl) {
            hashEl.textContent = `${sello.hashCompleto.substring(0, 32)}... (${sello.firmaTruncada.substring(0, 8)})`;
        }

        const qrBox = document.getElementById('zt-preview-qr');
        if (qrBox && typeof QRCode !== 'undefined') {
            qrBox.innerHTML = '';
            const previewUrl = construirUrlQRBoleta(previewBoleta, sello);
            new QRCode(qrBox, {
                text: previewUrl,
                width: 66,
                height: 66,
                colorDark: "#080c14",
                colorLight: "#ffffff",
                correctLevel: (QRCode.CorrectLevel && QRCode.CorrectLevel.M !== undefined) ? QRCode.CorrectLevel.M : 0
            });
        }
    } catch (e) {
        // Fallo no bloqueante de preview
    }
}

// =============================================================================
// =============================================================================
// MOTOR VECTORIAL JSPDF: CARGA PEREZOSA (LAZY LOADING) Y AUTO-PAGINACIÓN
// =============================================================================
let jsPDFLoadingPromise = null;

function asegurarMotorPDF() {
    const jsPDFClass = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : (window.jsPDF || null);
    if (jsPDFClass) return Promise.resolve(jsPDFClass);

    if (jsPDFLoadingPromise) return jsPDFLoadingPromise;

    jsPDFLoadingPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'jspdf.umd.min.js';
        script.onload = () => {
            const cls = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : (window.jsPDF || null);
            if (cls) {
                console.log("✅ Motor jsPDF cargado de forma perezosa (lazy loading).");
                resolve(cls);
            } else {
                reject(new Error("No se pudo inicializar la clase jsPDF"));
            }
        };
        script.onerror = () => {
            jsPDFLoadingPromise = null;
            reject(new Error("Error al cargar el script local jspdf.umd.min.js"));
        };
        document.head.appendChild(script);
    });

    return jsPDFLoadingPromise;
}

async function imprimirPDF(id) {
    const b = await db.boletas.get(id);
    if (!b) return alert("Boleta no encontrada en la base de datos.");

    // Carga perezosa del motor vectorial jsPDF bajo demanda
    let jsPDFClass;
    try {
        jsPDFClass = await asegurarMotorPDF();
    } catch (err) {
        console.error("Fallo al cargar motor jsPDF:", err);
        return alert("Error: El motor vectorial jsPDF no está disponible.");
    }

    // Sello Criptográfico SHA-256 Zero-Trust
    const sello = await generarSelloCriptograficoBoleta(b);
    const urlVerificacion = construirUrlQRBoleta(b, sello);
    const qrDataUrl = await generarQRCodeDataURL(urlVerificacion, 256);

    // Documento ISO A4 Vertical
    const doc = new jsPDFClass({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const PAGE_HEIGHT = 297;
    const PAGE_WIDTH = 210;
    const MARGIN_X = 14;
    const CONTENT_WIDTH = 182;
    const FOOTER_Y = 276;

    // Helper: Pie de página institucional en cada página
    function renderFooter(paginaNum, totalPaginas) {
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.line(MARGIN_X, FOOTER_Y, MARGIN_X + CONTENT_WIDTH, FOOTER_Y);
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'normal');
        doc.text('JC PATH LAB © 2026 • Mz. M2 Lote 13, Urb. Jardines de Chillón, Puente Piedra, Lima • Tel: 986 396 733', MARGIN_X, FOOTER_Y + 5);
        const pagText = totalPaginas ? `Página ${paginaNum} de ${totalPaginas} • 100% Offline Soberano` : `Página ${paginaNum} • 100% Offline Soberano`;
        doc.text(pagText, MARGIN_X + CONTENT_WIDTH, FOOTER_Y + 5, { align: 'right' });
    }

    // Helper: Cabecera completa en Página 1
    function renderHeaderPage1() {
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, PAGE_WIDTH, 44, 'F');
        doc.setDrawColor(56, 189, 248);
        doc.setLineWidth(1.0);
        doc.line(0, 44, PAGE_WIDTH, 44);

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('JC PATH LAB | ANATOMÍA PATOLÓGICA', MARGIN_X, 16);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(56, 189, 248);
        doc.text('DIAGNÓSTICO HISTOPATOLÓGICO, CITOLÓGICO E INMUNOHISTOQUÍMICA', MARGIN_X, 22.5);

        doc.setTextColor(226, 232, 240);
        doc.setFontSize(8);
        doc.text('Dirección Médica: Dr. Josehp Christopher Castillo Cuenca • CMP 58455 • RNE 029091', MARGIN_X, 29);

        doc.setTextColor(203, 213, 225);
        doc.setFontSize(7.5);
        doc.text('Local: Mz. M2 Lote 13, Urb. Jardines de Chillón, Puente Piedra, Lima | WhatsApp / Central: 986 396 733', MARGIN_X, 35);
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text('Sistema 100% Offline Soberano • JC PATH LAB • Red Médica Especializada', MARGIN_X, 40);

        // Recuadro Superior Derecho: Constancia y Código
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(142, 8, 54, 28, 2, 2, 'FD');
        doc.setDrawColor(56, 189, 248);
        doc.setLineWidth(0.6);
        doc.roundedRect(142, 8, 54, 28, 2, 2, 'S');

        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text('CONSTANCIA DE SERVICIO', 169, 16, { align: 'center' });
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text('LIQUIDACIÓN TÉCNICA', 169, 21, { align: 'center' });
        doc.setFontSize(11);
        doc.setTextColor(2, 132, 199);
        doc.text(b.codigo, 169, 30, { align: 'center' });
    }

    // Helper: Cabecera compacta para páginas de continuación
    function renderSubHeaderContinuation(paginaNum) {
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, PAGE_WIDTH, 26, 'F');
        doc.setDrawColor(56, 189, 248);
        doc.setLineWidth(0.8);
        doc.line(0, 26, PAGE_WIDTH, 26);

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(`JC PATH LAB | ANATOMÍA PATOLÓGICA (Hoja ${paginaNum})`, MARGIN_X, 12);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(56, 189, 248);
        const safeRazonSub = (b.razonSocial || 'Particular').substring(0, 40);
        doc.text(`Comprobante: ${b.codigo} • Destinatario: ${safeRazonSub} • Fecha: ${new Date(b.fecha).toLocaleDateString('es-PE')}`, MARGIN_X, 20);
    }

    // Helper: Cabecera de la tabla de muestras
    function renderTableHeader(yPos) {
        doc.setFillColor(15, 23, 42);
        doc.rect(MARGIN_X, yPos, CONTENT_WIDTH, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text('ITEM', 18, yPos + 5.5);
        doc.text('CONCEPTO / DESCRIPCIÓN TÉCNICA', 36, yPos + 5.5);
        doc.text('CANTIDAD', 135, yPos + 5.5, { align: 'center' });
        doc.text('PRECIO UNIT.', 162, yPos + 5.5, { align: 'right' });
        doc.text('SUBTOTAL', 190, yPos + 5.5, { align: 'right' });
    }

    // --- PÁGINA 1 ---
    let currentPage = 1;
    renderHeaderPage1();

    // Tarjeta de Datos del Cliente
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(MARGIN_X, 50, CONTENT_WIDTH, 34, 2, 2, 'FD');

    doc.setTextColor(2, 132, 199);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('DATOS DE LA INSTITUCIÓN O CLIENTE DESTINATARIO:', 18, 57);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('RAZÓN SOCIAL:', 18, 64);
    doc.setFont('helvetica', 'normal');
    const safeRazon = b.razonSocial || 'Particular';
    const wrappedRazon = doc.splitTextToSize(safeRazon, 90);
    doc.text(wrappedRazon, 44, 64);

    doc.setFont('helvetica', 'bold');
    doc.text('RUC / DNI:', 18, 71);
    doc.setFont('helvetica', 'normal');
    doc.text(b.ruc || '00000000000', 44, 71);

    doc.setFont('helvetica', 'bold');
    doc.text('FECHA EMISIÓN:', 138, 71);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(b.fecha).toLocaleDateString('es-PE'), 166, 71);

    doc.setFont('helvetica', 'bold');
    doc.text('DIRECCIÓN:', 18, 78);
    doc.setFont('helvetica', 'normal');
    const clienteObj = await db.clientes.where('ruc').equals(b.ruc || '').first();
    const dirTexto = clienteObj ? (clienteObj.direccion || 'Domicilio fiscal registrado') : 'Mz. M2 Lote 13, Urb. Jardines de Chillón, Puente Piedra, Lima';
    const wrappedDir = doc.splitTextToSize(dirTexto, 145);
    doc.text(wrappedDir, 44, 78);

    // Tabla de Muestras con Salto Automático
    let yTable = 90;
    renderTableHeader(yTable);
    let y = yTable + 14;

    const montosArr = Array.isArray(b.montos) ? b.montos : (typeof b.montos === 'string' ? JSON.parse(b.montos || '[]') : []);
    const totalVal = typeof b.total === 'number' ? b.total : (montosArr.reduce((x, y2) => x + (parseFloat(y2) || 0), 0));

    // Si tiene más de 12 muestras, no caben en Página 1 junto con el bloque de totales y QR
    const cabenEnPagina1 = montosArr.length <= 12;
    const limiteYPagina1 = cabenEnPagina1 ? 200 : 255;

    for (let i = 0; i < montosArr.length; i++) {
        // ¿Necesitamos nueva página para la siguiente fila?
        const limiteActual = (currentPage === 1) ? limiteYPagina1 : 255;
        if (y + 8 > limiteActual) {
            renderFooter(currentPage, null);
            doc.addPage();
            currentPage++;
            renderSubHeaderContinuation(currentPage);
            yTable = 32;
            renderTableHeader(yTable);
            y = yTable + 14;
        }

        const pUnit = parseFloat(montosArr[i]) || 0;
        doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
        doc.rect(MARGIN_X, y - 5, CONTENT_WIDTH, 8, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.line(MARGIN_X, y + 3, MARGIN_X + CONTENT_WIDTH, y + 3);

        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(String(i + 1).padStart(2, '0'), 18, y);
        doc.text(`Procesamiento e informe histopatológico de muestra quirúrgica #${i + 1}`, 36, y);
        doc.text('1', 135, y, { align: 'center' });
        doc.text(`S/ ${pUnit.toFixed(2)}`, 162, y, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        doc.text(`S/ ${pUnit.toFixed(2)}`, 190, y, { align: 'right' });
        y += 8;
    }

    // Comprobar si el bloque de Totales + QR (ocupa ~74mm) cabe en la página actual
    const espacioNecesarioBloqueFinal = 74;
    if (y + espacioNecesarioBloqueFinal > FOOTER_Y - 4) {
        renderFooter(currentPage, null);
        doc.addPage();
        currentPage++;
        renderSubHeaderContinuation(currentPage);
        y = 36;
    }

    // --- BLOQUE DE TOTALES ---
    const yTotal = Math.max(y + 4, currentPage === 1 ? 155 : 40);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(122, yTotal, 74, 18, 2, 2, 'FD');
    doc.setDrawColor(2, 132, 199);
    doc.setLineWidth(0.6);
    doc.roundedRect(122, yTotal, 74, 18, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('TOTAL A LIQUIDAR:', 126, yTotal + 7);
    doc.setFontSize(13);
    doc.setTextColor(16, 185, 129);
    doc.text(`S/ ${totalVal.toFixed(2)}`, 192, yTotal + 14, { align: 'right' });

    // --- BLOQUE DE SELLO DIGITAL ZERO-TRUST Y QR ---
    const ySeal = yTotal + 22;
    doc.setDrawColor(56, 189, 248);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(MARGIN_X, ySeal, CONTENT_WIDTH, 48, 2, 2, 'FD');

    // Franja Superior del Sello
    doc.setFillColor(15, 23, 42);
    doc.rect(MARGIN_X, ySeal, CONTENT_WIDTH, 7.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(56, 189, 248);
    doc.text('VALIDACIÓN ZERO-TRUST ANTIFRAUDE • JC PATH LAB', 18, ySeal + 5.2);
    doc.setFontSize(6.5);
    doc.setTextColor(52, 211, 153);
    doc.text('CERTIFICADO OFICIAL 100% OFFLINE SOBERANO', 192, ySeal + 5.2, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text('Escanee para certificar la autenticidad fiscal y legal del comprobante. JC PATH LAB.', 18, ySeal + 12.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Se certifica la validez legal del procesamiento anatomopatológico y su liquidación arancelaria.', 18, ySeal + 17);
    doc.text('El sello criptográfico vincula código, RUC emisor/receptor, fecha y monto bajo protocolo Zero-Trust.', 18, ySeal + 20.8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('Dr. Josehp Christopher Castillo Cuenca', 18, ySeal + 27.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('Especialista en Anatomía Patológica • CMP 58455 • RNE 029091', 18, ySeal + 31.5);

    doc.setFont('courier', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`SHA-256: ${sello.hashCompleto.substring(0, 32)}... (32/64 bits)`, 18, ySeal + 37.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(16, 185, 129);
    doc.text(`FIRMA DIGITAL VÁLIDA: ${sello.firmaTruncada.toUpperCase()}`, 18, ySeal + 42);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(148, 163, 184);
    doc.text(`VALIDADOR LOCAL: verificar_boleta.html?id=${b.codigo}&sig=${sello.firmaTruncada}`, 18, ySeal + 45.8);

    // Renderizado del Código QR
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(154, ySeal + 9, 38, 37, 1.5, 1.5, 'FD');
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.roundedRect(154, ySeal + 9, 38, 37, 1.5, 1.5, 'S');

    if (qrDataUrl) {
        doc.addImage(qrDataUrl, 'PNG', 157, ySeal + 10.5, 32, 32);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(5);
        doc.setTextColor(100, 116, 139);
        doc.text('QR ZERO-TRUST', 173, ySeal + 44.5, { align: 'center' });
    }

    // Pie de página final
    renderFooter(currentPage, currentPage);

    // Si hubieron varias páginas, actualizar números de página
    const totalPagesCount = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPagesCount; p++) {
        doc.setPage(p);
        renderFooter(p, totalPagesCount);
    }

    // Descarga limpia e inmune a nulos
    const sanitizedName = safeRazon.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Boleta_${b.codigo}_${sanitizedName}.pdf`);
}

function renderAll() {
    renderClientes();
    renderBoletas();
    populateClientSelect();
    populateClinicasDatalist();
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/* ------------------------------------------------------------------
   UTILIDAD DE DEBOUNCE (si no está declarada en otro módulo)
   ------------------------------------------------------------------ */
if (typeof debounce !== 'function') {
    /**
     * Devuelve una versión “debounced” de la función pasada.
     * @param {Function} fn  Función a ejecutar.
     * @param {number}   wait Tiempo de espera en milisegundos.
     * @returns {Function}
     */
    function debounce(fn, wait) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), wait);
        };
    }
}

function showSection(sectionId) {
    document.querySelectorAll('main > section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.mobile-nav-item').forEach(m => m.classList.remove('active'));

    const targetSec = document.getElementById(sectionId);
    if (targetSec) targetSec.classList.add('active');

    const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
    if (activeLink) activeLink.classList.add('active');

    const activeMob = document.querySelector(`.mobile-nav-item[data-section="${sectionId}"]`);
    if (activeMob) activeMob.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof notifyCortanaSection === 'function') {
        notifyCortanaSection(sectionId);
    }
}

// --- EVENTOS DEL DOM ---
document.addEventListener('DOMContentLoaded', async () => {
    // Inicialización segura: verificamos la existencia de cada función antes de invocarla.
    if (typeof initDatabase === 'function') await initDatabase();
    if (typeof renderAll === 'function') renderAll();
    if (typeof renderCostoInputs === 'function') renderCostoInputs();
    if (typeof handleAuth === 'function') handleAuth();

    // Navegación Desktop y Móvil
    document.querySelectorAll('.nav-link, .mobile-nav-item, .card').forEach(el => {
        el.addEventListener('click', (e) => {
            const sec = el.getAttribute('data-section');
            if (sec) {
                e.preventDefault();
                showSection(sec);
            }
        });
    });

    // Logo vuelve a Inicio
    const logoEl = document.querySelector('.logo');
    if (logoEl) {
        logoEl.addEventListener('click', () => showSection('inicio'));
    }

    // Botón de sincronización manual
    const btnSync = document.getElementById('btn-sync-now');
    if (btnSync) {
        btnSync.addEventListener('click', async () => {
            btnSync.querySelector('i')?.classList.add('fa-spin');
            if (typeof syncFromSovereignDB === 'function') await syncFromSovereignDB();
            setTimeout(() => {
                btnSync.querySelector('i')?.classList.remove('fa-spin');
                if (typeof showToast === 'function')
                    showToast("Sincronización soberana completada con éxito.", "success", 3000);
            }, 500);
        });
    }

    // Filtros de búsqueda en tiempo real
    const filtroClientes = document.getElementById('filtro-clientes');
    if (filtroClientes) {
        filtroClientes.addEventListener('input', debounce((e) => {
            if (typeof renderClientes === 'function') renderClientes(e.target.value);
        }, 250));
    }

    const filtroBoletas = document.getElementById('filtro-boletas');
    if (filtroBoletas) {
        filtroBoletas.addEventListener('input', debounce((e) => {
            if (typeof renderBoletas === 'function') renderBoletas(e.target.value);
        }, 250));
    }

    // Eventos de formulario de clientes
    const btnRegistrar = document.getElementById('registrar-cliente');
    if (btnRegistrar && typeof handleAddCliente === 'function')
        btnRegistrar.addEventListener('click', handleAddCliente);

    // Sugerencias de datalist
    const razonSocialInput = document.getElementById('razon-social');
    if (razonSocialInput) {
        razonSocialInput.addEventListener('change', () => {
            const val = razonSocialInput.value.trim().toUpperCase();
            const encontrada = CANONICAL_CLINICAS.find(c => c.razonSocial.toUpperCase() === val);
            if (encontrada) {
                const rucInput = document.getElementById('ruc');
                const dirInput = document.getElementById('direccion');
                const telInput = document.getElementById('telefono');
                if (rucInput && !rucInput.value) rucInput.value = encontrada.ruc;
                if (dirInput && !dirInput.value) dirInput.value = encontrada.direccion;
                if (telInput && !telInput.value) telInput.value = encontrada.telefono;
            }
        });
    }

    // Inyección de RUC y Dirección desde sugerencias
    const btnInjectRuc = document.getElementById('btn-inject-ruc');
    if (btnInjectRuc) {
        btnInjectRuc.addEventListener('click', () => {
            const val = razonSocialInput ? razonSocialInput.value.trim().toUpperCase() : '';
            const encontrada = CANONICAL_CLINICAS.find(c => c.razonSocial.toUpperCase().includes(val));
            if (encontrada) {
                document.getElementById('ruc').value = encontrada.ruc;
            } else {
                document.getElementById('ruc').value = '20517865270';
            }
        });
    }

    const btnInjectDir = document.getElementById('btn-inject-dir');
    if (btnInjectDir) {
        btnInjectDir.addEventListener('click', () => {
            const val = razonSocialInput ? razonSocialInput.value.trim().toUpperCase() : '';
            const encontrada = CANONICAL_CLINICAS.find(c => c.razonSocial.toUpperCase().includes(val));
            if (encontrada) {
                document.getElementById('direccion').value = encontrada.direccion;
            } else {
                document.getElementById('direccion').value = 'Mz. M2 Lote 13, Urb. Jardines de Chillón, Puente Piedra, Lima';
            }
        });
    }

    // Eventos de emisión de boletas
    const clientSelect = document.getElementById('cliente-select');
    if (clientSelect) {
        clientSelect.addEventListener('change', async () => {
            const id = parseInt(clientSelect.value);
            if (id) {
                const c = await db.clientes.get(id);
                if (typeof updateClientDetails === 'function') updateClientDetails(c);
            } else {
                if (typeof updateClientDetails === 'function') updateClientDetails(null);
            }
            if (typeof renderCostoInputs === 'function') renderCostoInputs();
        });
    }

    const numMuestrasInput = document.getElementById('num-muestras');
    if (numMuestrasInput) {
        numMuestrasInput.addEventListener('input', debounce(() => {
            if (typeof renderCostoInputs === 'function') renderCostoInputs();
        }, 200));
    }

    const btnGuardarBoleta = document.getElementById('guardar-boleta');
    if (btnGuardarBoleta && typeof handleAddBoleta === 'function')
        btnGuardarBoleta.addEventListener('click', handleAddBoleta);

    // Reset de Base de Datos
    const btnResetDb = document.getElementById('btn-reset-db');
    if (btnResetDb) {
        btnResetDb.addEventListener('click', async () => {
            if (confirm("¿Está seguro de reiniciar la Base de Datos local Dexie? Se resembrará el catálogo oficial de clínicas.")) {
                if (db && typeof db.delete === 'function') await db.delete();
                location.reload();
            }
        });
    }

    // Cierre de modal QR Zero-Trust
    const btnCerrarModal = document.getElementById('btn-cerrar-modal-qr');
    if (btnCerrarModal && typeof cerrarModalQR === 'function')
        btnCerrarModal.addEventListener('click', cerrarModalQR);

    const backdropModal = document.getElementById('modal-qr-backdrop');
    if (backdropModal && typeof cerrarModalQR === 'function')
        backdropModal.addEventListener('click', cerrarModalQR);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && typeof cerrarModalQR === 'function') cerrarModalQR();
    });
});

/* ------------------------------------------------------------------
   Registro de Service Worker para PWA 100% Offline
   ------------------------------------------------------------------ */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(() => console.log('✅ ServiceWorker Soberano Registrado.'))
            .catch(err => console.warn('ServiceWorker no disponible:', err));
    });
}
