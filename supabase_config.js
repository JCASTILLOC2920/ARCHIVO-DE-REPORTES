// ==========================================================================
// CONFIGURACIÓN DE CONEXIÓN DE SUPABASE
// Complete con las credenciales de su proyecto en Supabase.
// Si deja los campos vacíos, la aplicación seguirá funcionando en modo local.
// ==========================================================================

// BASE UNICA SOBERANA JC PATH LAB - 100% LOCAL DETERMINISTA (0 CREDITO / 0 NUBE)
const SUPABASE_CONFIG = Object.freeze({
    url: "",      // Modo Soberano Local Activo (Supabase desconectado)
    anonKey: ""
});

window.SUPABASE_CONFIG = SUPABASE_CONFIG;

/**
 * Inicializa el cliente de Supabase si la librería está disponible y la
 * configuración es válida. En caso contrario, devuelve null y registra el
 * motivo en la consola.
 *
 * @returns {object|null} Instancia de supabase client o null.
 */
function initSupabase() {
    if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
        console.warn("[Supabase] Configuración incompleta – modo offline activado.");
        return null;
    }

    if (typeof window.supabase === "undefined") {
        console.warn("[Supabase] Biblioteca no cargada – intentando cargar dinámicamente.");
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
        script.async = true;
        script.onload = () => {
            const client = createClientInstance();
            if (client) {
                window.supabaseClient = client;
                console.log("[Supabase] Cliente inicializado después de carga dinámica.");
            }
        };
        script.onerror = () => console.error("[Supabase] No se pudo cargar la librería desde CDN.");
        document.head.appendChild(script);
        return null;
    }

    return createClientInstance();
}

/**
 * Crea la instancia del cliente usando la API expuesta por la librería Supabase.
 *
 * @returns {object|null} Instancia de supabase client o null si falla.
 */
function createClientInstance() {
    try {
        if (typeof window.supabase.createClient === "function") {
            const client = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            return client;
        }
        console.error("[Supabase] La función createClient no está disponible en la librería cargada.");
    } catch (e) {
        console.error("[Supabase] Error al crear el cliente:", e);
    }
    return null;
}

// Inicialización inmediata
window.supabaseClient = initSupabase();

// Exportar para entornos que utilicen módulos (Node/Electron)
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = {
        SUPABASE_CONFIG,
        supabaseClient: window.supabaseClient,
        initSupabase,
        createClientInstance
    };
}
