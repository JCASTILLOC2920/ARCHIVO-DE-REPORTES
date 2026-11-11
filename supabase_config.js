// MODO SOBERANO EXPLICITO: 100% Offline, Cero Dependencia de Nube Suspendida
window.SUPABASE_SOVEREIGN_MODE = true;

// ==========================================================================
// CONFIGURACIÓN DE CONEXIÓN DE SUPABASE
// ==========================================================================

// Neutralización total de Supabase Cloud
window.supabase = null;
window.supabaseClient = null;

// ==========================================================================
// CONFIGURACIÓN DE ENDPOINTS LOCALES (DOCKER N8N)
// ==========================================================================

// Definición de endpoints locales de Docker n8n
window.N8N_LOCAL_WEBHOOK = 'http://127.0.0.1:5678/webhook';

// Endpoints específicos según arquitectura
window.N8N_ENDPOINTS = {
    guardarPaciente: 'http://127.0.0.1:5678/webhook/guardar-paciente',
    analizarOrdenImagen: 'http://127.0.0.1:5678/webhook/analizar-orden-imagen'
};

// ==========================================================================
// INICIALIZACIÓN DEL SISTEMA SOBERANO
// ==========================================================================

console.log("[Sistema Soberano] Modo Autónomo Activo: Cero dependencia de Supabase Cloud.");
console.log("[Sistema Soberano] Endpoints N8N Locales configurados en 127.0.0.1:5678");
