// users_db.js
// -----------------------------------------------------------------------------
// Base de datos estática de usuarios del portal "ARCHIVO DE REPORTES".
// Mantiene la lista original sin alteraciones y provee utilidades O(1)
// para acceso rápido y ordenamiento conforme a la regla SLA de informes.
//
// Regla SLA:
//   🔴 casos inconclusos (campo `estado: 'inconcluso'`) aparecen primero,
//   🟢 casos firmados aparecen después.
//   Dentro de cada bloque se ordena por `id` descendente (proxy de fecha).
// -----------------------------------------------------------------------------


export const usersDatabase = [
    { id: 1,  perfil: 'Administrador', dni: '41457466', nombres: 'JOSEHP CHRISTOPHER CASTILLO CUENCA', usuario: '41457466', claveHash: 'c86399dfc4d911d4f1c2df9436e44fabe00b0f32ed6de93293bffbd89e506d0c' },
    { id: 2,  perfil: 'Usuario',       dni: '',          nombres: 'CLINICA LA MUJER',                     usuario: 'Mujersegura',          claveHash: '6621d47d045a6bb44c98c0f342606c7ee248652c38837d1b3e553222417bfe8b' },
    { id: 3,  perfil: 'Usuario',       dni: '',          nombres: 'CLÍNICA CARRIÓN',                     usuario: 'clinicacarrion',       claveHash: '6621d47d045a6bb44c98c0f342606c7ee248652c38837d1b3e553222417bfe8b' },
    { id: 4,  perfil: 'Usuario',       dni: '',          nombres: 'CLÍNICA SAN CLEMENTE',                usuario: 'sanclemente',          claveHash: 'abeb7d950dc98c7702a478fd9476563cdf5f6c5fcc99aadd7c08612448aec684' },
    { id: 5,  perfil: 'Usuario',       dni: '',          nombres: 'SR JUNCO',                            usuario: 'JUNCO2026',            claveHash: '461c2204b02ce179f9ce8198fe0201c872af08e7f9d6d41bcd7af2d4fbb98e30' },
    { id: 6,  perfil: 'Administrador',dni: '',          nombres: 'NICOLAS CASTILLO DIAZ',               usuario: 'viringo',              claveHash: 'abeb7d950dc98c7702a478fd9476563cdf5f6c5fcc99aadd7c08612448aec684' },
    { id: 7,  perfil: 'Usuario',       dni: '',          nombres: 'DR. DIEGO ALONSO CHUNGUI BRAVO',      usuario: 'drdiegochungui',       claveHash: '81a95f6a72b9d8ccad59bdd65196771b3d0183e1a135be53dbac80abba2d841a' },
    { id: 8,  perfil: 'Usuario',       dni: '',          nombres: 'CLÍNICA ALFA PREVENIR',               usuario: 'alfaprevenir',         claveHash: '5aaafb6d4e605f2a1c9e1ef65e7c09de7c523c1989a450a0e6534323eee08c6e' },
    { id: 9,  perfil: 'Usuario',       dni: '',          nombres: 'DR. BRYAN FLORES SIERRA',             usuario: 'bryanflores',          claveHash: 'abeb7d950dc98c7702a478fd9476563cdf5f6c5fcc99aadd7c08612448aec684' },
    { id: 10, perfil: 'Usuario',       dni: '',          nombres: 'CLÍNICA CARRIÓN VENTANILLA',          usuario: 'carrionventanilla',    claveHash: '6621d47d045a6bb44c98c0f342606c7ee248652c38837d1b3e553222417bfe8b',
        clinica: 'CLÍNICA CARRIÓN VENTANILLA', direccion: 'Av. Pedro Beltrán Mz. B Lte. 1, Ventanilla, Callao', telefono: '(01) 577-1000' },
    { id: 11, perfil: 'Usuario',       dni: '',          nombres: 'DR. JHON VILCA',                      usuario: 'drjhonvilca',          claveHash: '8ead98c228c5769809f13380c2306a44c9695e9f7fb9757171ebfa7c7c927c5e',
        clinica: 'CLÍNICA LA LUZ' },
    { id: 12, perfil: 'Usuario',       dni: '',          nombres: 'DR. JORGE ALBERTO MUÑANTE ARZAPALO',  usuario: 'drjorgemunante',       claveHash: '4a493b7d48de2e7cd5f1f8cc543f314eefbb929ca9d1fe2e69c08ff9bd499d2d' },
    { id: 13, perfil: 'Usuario',       dni: '',          nombres: 'DR. JAIME VICTOR BECERRA ULFE',       usuario: 'drjaimebecerra',       claveHash: '902062f35d4dab5cf81a552fc9b0645d7836c57d786a9abe30844567e5aeedb7' },
    { id: 14, perfil: 'Usuario',       dni: '',          nombres: 'DR. VICTOR CASTAÑEDA ROBLES',         usuario: 'drvictorcastaneda',    claveHash: '8b500950c56a72e336c863c6b936bbb679e50ee077b4c0efa42d41fdac35a906' },
    { id: 15, perfil: 'Usuario',       dni: '',          nombres: 'DR. MANUEL RENATO SANCHEZ ORELLANA', usuario: 'drmanuelsanchez',      claveHash: '241f0c3ea3af41b4ae6a252baed7a6e7fdb88953c20a16878cf92e71099b984d' },
    { id: 16, perfil: 'Usuario',       dni: '',          nombres: 'DR. ALEJANDRO ESCALANTE ÁLVARO',      usuario: 'dralejandroescalante', claveHash: '1911d22ac5999f82434d5d54829ce0297e66283e03e92a0d8eb916c2acfd8534' },
    { id: 17, perfil: 'Usuario',       dni: '',          nombres: 'CLÍNICA LA LUZ',                      usuario: 'clinicalaluz',         claveHash: '43377dbad5f75e215033c4f24ef30e5571694f410d487f261ed0d72ff3d85ae4',
        clinica: 'CLÍNICA LA LUZ', direccion: 'Av. Arequipa 1148, Lima', telefono: '(01) 613-9292' },
    { id: 99, perfil: 'Usuario',       dni: '',          nombres: 'UROSERV - CENTRO UROLÓGICO ESPECIALIZADO', usuario: 'uroserv',          claveHash: 'aa1afc13dc6eb8f15ffa140af5f54725d46a8da45864ab1eb07efdd711f93186',
        clinica: 'UROSERV', direccion: 'Av. Javier Prado Este 4020, Surco, Lima', telefono: '(01) 434-5000' }
];

// -----------------------------------------------------------------------------
// Índices de acceso rápido (O(1)).
// -----------------------------------------------------------------------------
// Mapas creados una sola vez al cargar el módulo.
export const usersById = new Map(usersDatabase.map(user => [user.id, user]));
export const usersByUsuario = new Map(usersDatabase.map(user => [user.usuario, user]));

// -----------------------------------------------------------------------------
// API de consulta.
// -----------------------------------------------------------------------------
// Obtiene un usuario por su `id`. Devuelve `null` si no existe.
export function getUserById(id) {
    return usersById.get(id) ?? null;
}

// Obtiene un usuario por su nombre de usuario (`usuario`). Devuelve `null` si no existe.
export function getUserByUsuario(usuario) {
    return usersByUsuario.get(usuario) ?? null;
}

// -----------------------------------------------------------------------------
// Ordenamiento conforme a la regla SLA.
// -----------------------------------------------------------------------------
// Si el registro posee la propiedad `estado` con valor `'inconcluso'` se
// considera 🔴; cualquier otro valor (incluido ausencia) se trata como 🟢.
export function getAllUsersSorted(options = {}) {
    const { statusOrder = ['inconcluso', 'firmado'] } = options;

    // Agrupamos en dos listas según el estado.
    const groups = {
        inconcluso: [],
        firmado: []
    };

    for (const user of usersDatabase) {
        const estado = (user.estado === 'inconcluso') ? 'inconcluso' : 'firmado';
        groups[estado].push(user);
    }

    // Dentro de cada grupo ordenamos por `id` descendente (más reciente primero).
    const descById = (a, b) => b.id - a.id;
    groups.inconcluso.sort(descById);
    groups.firmado.sort(descById);

    // Construimos el resultado respetando el orden solicitado.
    const sorted = [];
    for (const status of statusOrder) {
        if (Array.isArray(groups[status])) {
            sorted.push(...groups[status]);
        }
    }
    return sorted;
}

// -----------------------------------------------------------------------------
// Exportación por defecto (mantiene compatibilidad con importaciones legacy).
// -----------------------------------------------------------------------------
export default {
    usersDatabase,
    usersById,
    usersByUsuario,
    getUserById,
    getUserByUsuario,
    getAllUsersSorted
};
