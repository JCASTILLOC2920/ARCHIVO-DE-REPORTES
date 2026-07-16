// ==========================================================================
// CONFIGURACIÓN DE CONEXIÓN DE SUPABASE
// Complete con las credenciales de su proyecto en Supabase.
// Si deja los campos vacíos, la aplicación seguirá funcionando en modo local.
// ==========================================================================

const SUPABASE_CONFIG = {
    url: "https://yyylfrnynlgwaxxocixa.supabase.co",      // Escriba su URL del proyecto de Supabase. Ej: "https://xxxx.supabase.co"
    anonKey: "sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK"   // Escriba su clave anónima (anon key) pública.
};

if (typeof window.supabase !== 'undefined' && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
    try {
        window.supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log("[Supabase] Cliente inicializado correctamente.");
    } catch(e) {
        console.error("[Supabase] Error al inicializar cliente:", e);
    }
}
