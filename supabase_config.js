// ==========================================================================\r
// CONFIGURACIÓN DE CONEXIÓN DE SUPABASE\r
// Complete con las credenciales de su proyecto en Supabase.\r
// Si deja los campos vacíos, la aplicación seguirá funcionando en modo local.\r
// ==========================================================================\r
\r
const SUPABASE_CONFIG = {\r
    url: "https://yyylfrnynlgwaxxocixa.supabase.co",      // Escriba su URL del proyecto de Supabase. Ej: "https://xxxx.supabase.co"\r
    anonKey: "sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK"   // Escriba su clave anónima (anon key) pública.\r
};\r
\r
window.SUPABASE_CONFIG = SUPABASE_CONFIG;\r
\r
if (typeof window.supabase !== 'undefined' && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {\r
    try {\r
        if (typeof window.supabase.createClient === 'function') {\r
            window.supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);\r
            window.supabase = window.supabaseClient;\r
            console.log("[Supabase] Cliente inicializado correctamente.");\r
        }\r
    } catch(e) {\r
        console.error("[Supabase] Error al inicializar cliente:", e);\r
    }\r
}\r























































































































































































































































































































































































                                                <input type="file" id="ordenServicio" name="ordenServicio" class="file-upload-input" multiple>\r
                                                <span id="fileUploadStatus" class="file-upload-status-text">Sin archivos seleccionados</span>\r
                                            </div>\r
                                        </div>\r
                                    </div>\r
\r
                                    <!-- Costo Muestra -->\r
                                    <div class="form-row">\r
                                        <label for="costo" class="form-label">Costo Muestra</label>\r
                                        <div class="form-control-wrapper">\r
                                            <input type="number" id="costo" name="costo" class="form-input" value="0" min="0" step="0.01" placeholder="0.00">\r
                                        </div>\r
                                    </div>\r
\r
                                    <!-- Costo Transp. -->\r
                                    <div class="form-row flex-column-layout">\r
                                        <div class="row-flex">\r
                                            <label for="costoTransp" class="form-label">Costo Transp.</label>\r
                                            <div class="form-control-wrapper">\r
                                                <input type="number" id="costoTransp" name="costoTransp" class="form-input" value="0" min="0" step="0.01">\r
                                            </div>\r
                                        </div>\r
                                        <!-- Pago Pendiente (Checkbox abajo de Costo Transp.) -->\r
                                        <div class="row-flex checkbox-row">\r
                                            <div class="form-label-placeholder"></div>\r
                                            <div class="form-control-wrapper checkbox-container">\r
                                                <label class="checkbox-label">\r
                                                    <input type="checkbox" id="pagoPendiente" name="pagoPendiente" class="form-checkbox">\r
                                                    <span class="checkbox-custom-text">Pago Pendiente</span>\r
                                                </label>\r
                                            </div>\r
                                        </div>\r
                                    </div>\r
\r
                                    <!-- Adelanto -->\r
                                    <div class="form-row">\r
                                        <label for="adelanto" class="form-label">Adelanto</label>\r
                                        <div class="form-control-wrapper">\r
                                            <input type="number" id="adelanto" name="adelanto" class="form-input" value="0" min="0" step="0.01">\r
                                        </div>\r
                                    </div>\r
\r
                                    <!-- Fec. Registro -->\r
                                    <div class="form-row">\r
                                        <label for="fecRegistro" class="form-label bold-label">Fec. Registro</label>\r
                                        <div class="form-control-wrapper">\r
                                            <input type="text" id="fecRegistro" name="fecRegistro" class="form-input readonly-input" readonly>\r
                                        </div>\r
                                    </div>\r
\r
                                    <!-- Fec. Probable-Entrega -->\r
                                    <div class="form-row">\r
                                        <label for="fecEntrega" class="form-label bold-label">Fec. Probable-Entrega</label>\r
                                        <div class="form-control-wrapper">\r
                                            <input type="text" id="fecEntrega" name="fecEntrega" class="form-input readonly-input" readonly>\r
                                        </div>\r
                                    </div>\r
                                </div>\r
                            </div>\r
\r
                            <!-- Separador de Línea -->\r
                            <hr class="form-divider">\r
\r
                            <!-- Botones de Acción Inferiores -->\r
                            <footer class="form-actions">\r
                                <button type="button" id="btnSalir" class="btn btn-muted">Salir</button>\r
                                <button type="submit" id="btnGuardar" class="btn btn-success">Guardar</button>\r
                            </footer>\r
                        </form>\r
                    </main>\r
                </div>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <!-- Mensajes Flotantes (Toasts) para feedback elegante -->\r
    <div id="toastContainer" class="toast-container"></div>\r
\r
    <!-- SDK de Supabase -->\r
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" defer></script>\r
    <!-- Módulo Centralizado de Utilidades -->\r
    <script type="module" src="utils.js?v=22.00"></script>\r
    <!-- Configuración de Supabase -->\r
    <script src="supabase_config.js?v=22.00" defer></script>\r
    <!-- Inicialización de Base de Datos y Seguridad (RBAC) -->\r
    <script type="module">\r
        import { initLocalDatabases, patientDatabase, triggerAutomaticBackup, syncPatientsFromSupabase, savePatient, deletePatient } from './db_service.js?v=22.00';\r
        \r
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));\r
        if (!currentUser) {\r
            window.location.href = 'login.html';\r
        } else if (currentUser.perfil === 'Usuario') {\r
            window.location.href = 'reportes.html';\r
        } else {\r
            initLocalDatabases();\r
            window.patientDatabase = patientDatabase;\r
            window.triggerAutomaticBackup = triggerAutomaticBackup;\r
            window.savePatient = savePatient;\r
            window.deletePatient = deletePatient;\r
            syncPatientsFromSupabase();\r
        }\r
    </script>\r
    <!-- Script Externa -->\r
    <script src="script.js?v=5.01" defer></script>\r
</body>\r
</html>\r






























































































































































































































































































































































































































































































































































































        </div>\r
    </div>\r
\r
\r
\r
    <!-- Modal para Crear Plantilla Rápida -->\r
    <div id="fastTemplateModal" class="floating-modal-overlay">\r
        <main class="modal-container" style="max-width: 400px; padding: 20px;">\r
            <header class="modal-header">\r
                <h2><i class="fa-solid fa-folder-plus"></i> Guardar como Plantilla</h2>\r
                <button type="button" class="close-btn" id="btnCloseFastTemplate">&times;</button>\r
            </header>\r
            <div class="modal-body" style="padding: 15px 0;">\r
                <p style="margin-bottom: 15px; color: #555;">Se guardará el texto actual de Descripción Macroscópica, Microscópica y Diagnóstico.</p>\r
                <div class="form-group" style="margin-bottom: 15px;">\r
                    <label for="fastTemplateTitle">Nombre de la Plantilla:</label>\r
                    <input type="text" id="fastTemplateTitle" class="form-input" placeholder="Ej: APENDICITIS AGUDA..." required style="width: 100%; padding: 8px;">\r
                </div>\r
                <div class="form-group" style="margin-bottom: 15px;">\r
                    <label for="fastTemplateCategory">Especialidad (Categoría):</label>\r
                    <select id="fastTemplateCategory" class="form-select" required style="width: 100%; padding: 8px;">\r
                        <option value="">Seleccione una especialidad</option>\r
                    </select>\r
                </div>\r
            </div>\r
            <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px;">\r
                <button type="button" class="btn btn-secondary" id="btnCancelFastTemplate">Cancelar</button>\r
                <button type="button" class="btn btn-primary" id="btnSaveFastTemplate">Guardar Plantilla</button>\r
            </div>\r
        </main>\r
    </div>\r
\r
    <!-- Base de Datos de Plantillas Estática -->\r
    <script src="plantillas_data.js" defer></script>\r
    \r
    <!-- Referencia al archivo script.js global (Diseño/Menú UI Principal) -->\r
    <script src="script.js" defer></script>\r
    <!-- SDK de Supabase -->\r
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" defer></script>\r
    <!-- Configuración de Supabase -->\r
    <script src="supabase_config.js" defer></script>\r
    <!-- Datos Antiguos -->\r
    <script src="datos_migrados.js" defer></script>\r
    <!-- Script de Lógica del Listado -->\r
    <script src="motor_groq.js" defer></script>
    <script src="reportes.js?v=5" defer></script>\r
</body>\r
</html>\r












































































































































































            <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px;">
                <button type="button" class="btn btn-secondary" id="btnCancelFastTemplate">Cancelar</button>
                <button type="button" class="btn btn-primary" id="btnSaveFastTemplate">Guardar Plantilla</button>
            </div>
        </main>
    </div>

    <!-- Base de Datos de Plantillas Estática -->
    <script src="plantillas_data.js" defer></script>
    
    <!-- Referencia al archivo script.js global (Diseño/Menú UI Principal) -->
    <script src="script.js" defer></script>
    <!-- SDK de Supabase -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" defer></script>
    <!-- Configuración de Supabase -->
    <script src="supabase_config.js?v=23.00" defer></script>
    <!-- Módulo Principal de la Aplicación -->
    <script type="module" src="main.js?v=23.00"></script>
</body>
</html>



















































































































    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\r
    <!-- Configuración de Supabase -->\r
    <script src="supabase_config.js?v=22.00"></script>\r
    <!-- Script de Lógica del Listado -->\r
    <script type="module" src="main.js?v=22.00"></script>\r
    <script src="help_guide.js?v=22.00" defer></script>\r
\r
\r
    <!-- Windows Photo Editor Modal (Clon Integrado) -->\r
    <div id="wpe-modal" class="wpe-modal-overlay" style="display: none;">\r
      <div class="wpe-container">\r