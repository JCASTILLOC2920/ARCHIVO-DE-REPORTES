# ARQUITECTURA SOBERANA: VISUALIZACIÓN DE INFORMES PARA CLÍNICAS (BOTÓN DEL OJO)
**Mando Supremo:** Dr. José Castillo (`jclab59@gmail.com`)
**Sistema:** Archivo de Reportes (`C:\Users\HP\Desktop\repositorio\ARCHIVO DE REPORTES`)
**Objetivo:** Permitir que todas las clínicas vean el avance del informe al pulsar el botón del ojo (sin pantalla de candado ni bloqueo) y ocultar la pantalla/botón de llenado y edición para clínicas.

## Especificaciones de Implementación:
1. **imprimir.html:**
   - Desactivar completamente la pantalla de reemplazo con candado `if (isUserClinic && !isFullySigned) { container.innerHTML = ... }`.
   - Permitir que `imprimir.html` renderice siempre el contenido clínico disponible del informe (hasta donde esté redactado).
2. **pdf_engine.js:**
   - Eliminar la alerta bloqueante `if (isClinicUser && !isFullySigned) alert(...) return;` para que no impida la visualización del informe.
3. **ui_tables.js:**
   - Verificar si el usuario actual es clínica (`isClinicSession` o `currentUser.perfil === 'Usuario'`).
   - Si es clínica, **NO renderizar el botón del lápiz (`edit-btn` / Llenar / Modificar Informe)** en la tabla de pacientes, o forzar su estilo a `display: none`.
   - El botón del ojo (`preview-pdf-btn`) debe quedar activo y visible para todas las clínicas para abrir la vista del informe.
