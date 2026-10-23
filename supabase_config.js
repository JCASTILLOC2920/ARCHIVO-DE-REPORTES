// MODO SOBERANO EXPLICITO
window.SUPABASE_SOVEREIGN_MODE = false;

// ==========================================================================
// CONFIGURACIÓN DE CONEXIÓN DE SUPABASE
// ==========================================================================

const SUPABASE_CONFIG = {
    url: "https://yyylfrnynlgwaxxocixa.supabase.co",
    anonKey: "sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK"
};

window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.SUPABASE_URL = SUPABASE_CONFIG.url;
window.SUPABASE_ANON_KEY = SUPABASE_CONFIG.anonKey;

if (!window.SUPABASE_SOVEREIGN_MODE && typeof window.supabase !== 'undefined' && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
    try {
        if (typeof window.supabase.createClient === 'function') {
            window.supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            window.supabase = window.supabaseClient;
            console.log("[Supabase] Cliente inicializado correctamente.");
        }
    } catch(e) {
        console.error("[Supabase] Error al inicializar cliente:", e);
    }
} else {
    window.supabase = null;
    window.supabaseClient = null;
    console.log("[Sistema Soberano] Modo Autónomo Activo: Cero dependencia de Supabase Cloud.");
}
