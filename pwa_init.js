// pwa_init.js - PWA Initialization and Version Control
const CURRENT_APP_VERSION = 'v645';

window.addEventListener('load', () => {
    if (localStorage.getItem('app_db_version') !== CURRENT_APP_VERSION) {
        // PRESERVADO: NUNCA BORRAR BASE DE DATOS DE PACIENTES AL ACTUALIZAR VERSIÓN
        // localStorage.removeItem('patientDatabaseLocal');
        // localStorage.removeItem('patientDatabase');
        // localStorage.removeItem('pacientesDB');
        localStorage.setItem('app_db_version', CURRENT_APP_VERSION);
    }
    console.log('[PWA] Inicializado en versión:', CURRENT_APP_VERSION);
});
