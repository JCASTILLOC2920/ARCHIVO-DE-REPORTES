# Memoria del Proyecto: Lecciones Aprendidas (Protocolo Elena)

Este archivo sirve como base de conocimientos y registro de errores históricos para evitar reintroducir fallos o desconfiguraciones en la aplicación del Laboratorio. Se lee al inicio de cada sesión de trabajo.

---

## 🛠️ Reglas Generales de Desarrollo

1. **Protección de la Interfaz Visual (UI)**:
   - Respetar siempre las clases CSS y el diseño responsivo al modificar los elementos.
   - Antes de alterar un estilo en `style.css` o `reportes.css`, verificar que no afecte a las otras pantallas (login, registro de pacientes, dashboard).

2. **Sincronización y Persistencia**:
   - Mantener siempre la compatibilidad entre `IndexedDB` y `Supabase`. Cualquier cambio en el esquema de base de datos local debe reflejarse en las llamadas de sincronización en `db_service.js`.

---

## 📝 Historial de Errores y Lecciones (Elena)

*Aquí se registrarán automáticamente los errores detectados y corregidos para evitar que se repitan.*

- **[2026-07-22] Inicialización del Protocolo Elena**:
  - Se crea esta libreta de memoria para registrar lecciones aprendidas y reglas de diseño.
- **[2026-07-22] Activación de La Colmena**:
  - Se definen e inicializan los subagentes independientes `colmena_programmer` (Programador) y `colmena_supervisor` (Supervisor/QA) para coordinar cambios en paralelo y evitar desconfiguraciones visuales en producción.
- **[2026-07-22] Formato de Plantillas (Justificación y Minúsculas)**:
  - Las descripciones macro y micro de `plantillas_data.js` se convirtieron a minúsculas y se corrigió su ortografía clínicamente. Los diagnósticos permanecen en mayúsculas.
  - Se aplicó `text-align: justify; text-transform: none !important;` en los textareas `#tplMacro` y `#tplMicro` de `reportes.html` para anular la directiva global de mayúsculas e igualar la alineación visual.
  - Se añadió la migración de autocuración V4 en `db_service.js` para asegurar que el `localStorage` de los navegadores también se limpie y pase a minúsculas.
- **[2026-07-22] Pre-Compresión Local en el Cliente (PC)**:
  - En `ui_report_editor.js`, se implementó la compresión local previa al `Cropper` para las imágenes `img01` e `img02`. Al seleccionar el archivo (`change`), la PC del usuario lo pre-comprime instantáneamente a un máximo de 1200px con 75% de calidad usando un Canvas antes de cargar el visor de recorte. Esto previene el consumo excesivo de memoria RAM y agiliza la subida en redes móviles lentas.
- **[2026-07-22] Diagnóstico de Conexión Móvil (Bitel)**:
  - La conexión móvil varía según la congestión de la antena (pico de tráfico a las 9 PM con ~1 Mbps; valle a las 10 PM con ~30 Mbps de subida).
  - La orientación del router hacia la calle/puerta y el posicionamiento de antenas en cruz (una vertical y una horizontal) optimiza la recepción 4G LTE y la cobertura Wi-Fi.
  - Si la velocidad cae drásticamente, un reinicio del router fuerza al módem a reconectarse a la banda 4G LTE de alto rendimiento.
  - Se dejó el script de test rápido en `scratch/local_speed_test.py` para correr diagnósticos ligeros sin webs de terceros.
- **[2026-07-23] Registro de Estado Global e Hilo Asíncrono**:
  - Se implementó `C:\Users\DELL\.gemini\antigravity\scratch\global_state.json` como RAG Index local para almacenar el contexto global y reducir el tiempo de búsqueda a O(1).
  - Se crearon reglas locales en `.agents/rules.md` para automatizar la lectura de este registro al inicio de sesión y forzar la delegación asíncrona de tareas pesadas a subagentes, evitando bloquear la consola del usuario.
- **[2026-07-23] Perfeccionamiento de Dictáfono y Priorización de Micrófonos (Elena v2)**:
  - **Whisper Anti-Alucinaciones**: Implementada compuerta física en `trabajador_whisper_streaming` para ignorar ráfagas de corta duración (<0.5s) y baja energía (RMS < 130). También se agregaron filtros estadísticos en los segmentos (no_speech_prob > 0.45, avg_logprob < -1.0, compression_ratio > 2.4) junto con una lista negra de frases de alucinación comunes en español para evitar escritura no deseada.
  - **Voice to Action**: Interceptor centralizado de comandos en `trabajador_inyeccion` que detecta "cortana", "asistente", etc., y realiza emparejamiento difuso mediante índice de Jaccard para inyectar plantillas o ejecutar macros de sistema (Motic, guardar, deshacer, apagar micrófono).
  - **Priorización de Micrófonos**: En `motor_audio`, se priorizan micrófonos externos USB (puntuación 3.5) y filtros virtuales como Nvidia Broadcast (puntuación 4.0) por sobre el micrófono integrado de la laptop (puntuación 1.5). Si un micrófono USB es detectado, se seleccionará automáticamente de forma transparente.
