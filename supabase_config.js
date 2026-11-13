// ==========================================================================
// JC PATH LAB - SISTEMA SOBERANO 100% OFFLINE (CERO SUPABASE CLOUD)
// Single Source of Truth (SSOT): Docker n8n Local (http://127.0.0.1:5678)
// SQLite WAL + IndexedDB Local-First
// ==========================================================================

window.SUPABASE_SOVEREIGN_MODE = true;
window.DATABASE_ENGINE = "DOCKER_N8N_SOBERANO";

// Mock seguro y atómico para neutralizar cualquier intento residual de llamada a Supabase
const createSovereignMock = () => {
    const chainable = {
        select: () => chainable,
        insert: () => Promise.resolve({ data: [], error: null }),
        update: () => Promise.resolve({ data: [], error: null }),
        upsert: () => Promise.resolve({ data: [], error: null }),
        delete: () => Promise.resolve({ data: [], error: null }),
        eq: () => chainable,
        neq: () => chainable,
        gt: () => chainable,
        lt: () => chainable,
        gte: () => chainable,
        lte: () => chainable,
        like: () => chainable,
        ilike: () => chainable,
        is: () => chainable,
        in: () => chainable,
        order: () => chainable,
        limit: () => chainable,
        range: () => chainable,
        single: () => Promise.resolve({ data: null, error: null }),
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
        then: (resolve) => resolve({ data: [], error: null })
    };
    return {
        from: () => chainable,
        channel: () => ({
            on: () => ({ subscribe: () => {} }),
            subscribe: () => {}
        }),
        removeChannel: () => {},
        auth: {
            getUser: () => Promise.resolve({ data: { user: null }, error: null }),
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
        }
    };
};

window.supabase = createSovereignMock();
window.supabaseClient = window.supabase;

// ==========================================================================
// CONFIGURACIÓN DE ENDPOINTS LOCALES EXCLUSIVOS (DOCKER N8N)
// ==========================================================================
window.N8N_LOCAL_WEBHOOK = 'http://127.0.0.1:5678/webhook';
window.N8N_ENDPOINTS = {
    guardarPaciente: 'http://127.0.0.1:5678/webhook/guardar-paciente',
    analizarOrdenImagen: 'http://127.0.0.1:5678/webhook/analizar-orden-imagen',
    sincronizarTodo: 'http://127.0.0.1:5678/webhook/sincronizar-pacientes'
};

console.log("[Sistema Soberano] Base de datos en Docker n8n (127.0.0.1:5678). Conexión a Supabase erradicada.");
