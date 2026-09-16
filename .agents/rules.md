# Reglas de Comportamiento del Agente (Protocolo Elena + La Colmena)

## 1. Inicialización de Memoria Contextual (Obligatorio en cada Inicio)
Al iniciar cualquier sesión, el agente **DEBE** ejecutar inmediatamente las siguientes acciones sin esperar instrucciones del usuario:
1. Leer el archivo único de memoria unificada en `C:/Users/DELL/.gemini/antigravity/scratch/unified_memory.json` utilizando la herramienta `view_file`.
2. Extraer el nodo correspondiente al proyecto actual (ej. `proyectos["archivo-de-reportes"]`).
3. Resumir brevemente en la primera interacción el estado exacto donde se quedó el trabajo, logrando un acceso inmediato en $O(1)$.

## 2. Índice de Enrutamiento O(1) de Skills y Scripts (Acceso Directo)
Para eliminar el cuello de botella de búsqueda de habilidades o inspección recursiva de directorios:
1. El agente **DEBE** resolver la intención o archivo objetivo en $O(1)$ consultando `.agents/routing_index.json` (o ejecutando `python .agents/router.py <target>`).
2. Mapeos prioritarios $O(1)$:
   - **Términos médicos / plantillas** (`plantillas_data.js`, Bethesda, Lester, patología) $\rightarrow$ `medical-spelling-checker` (`check_spelling.py`).
   - **Impresión / CSS / A4** (`imprimir.html`, pv-sheet, saltos de página, flex-firma) $\rightarrow$ `layout-math-validator` (`check_layout.py`).
   - **Esquemas SQL / Base de datos** (`supabase_schema.sql`, tablas, DDL) $\rightarrow$ `database-schema-validator` (`validate_schema.py`).
   - **Estado y contexto global** $\rightarrow$ `unified_memory_core` (`unified_memory.json`).

## 3. Protocolo de Ejecución Asíncrona (Consola Libre)
Para evitar bloqueos de la interfaz de chat en procesos pesados (extracción de datos, procesamiento de PDFs, scripts de más de 5 segundos de duración):
1. **PROHIBIDO** ejecutar tareas de procesamiento masivo en el hilo del agente principal.
2. El agente principal **DEBE** delegar la tarea pesada a un subagente secundario (`invoke_subagent`) o enviarla al fondo (`run_command` asíncrono).
3. El agente principal **DEBE** responder al usuario en menos de 2 segundos indicando que el subagente ha sido despachado, devolviendo el control de la consola al usuario para que pueda seguir trabajando en múltiples proyectos.

## 4. Pipeline de Consultas Médicas y Complejas (Zero-Bottleneck Pipeline)
1. **Carril Rápido (Fast Sync <2s)**: Consultas terminológicas o validaciones directas se ejecutan directamente con su script validador en menos de 500 ms.
2. **Carril Asíncrono (Batch / Long Queries)**: Consultas médicas complejas (auditorías completas de miles de líneas, ingesta masiva HPA, análisis morfológico) se delegan en el acto a subagentes secundarios especializados.
3. **Actualización Atómica de Memoria**: Cualquier nueva convención clínica, corrección tipográfica o regla de layout detectada debe consolidarse en `unified_memory.json` y `lecciones_aprendidas.md`.

## 5. Reglas Generales de Comunicación
1. Todas las respuestas, análisis y explicaciones deben ser exclusivamente en **español**.
2. **Prohibido realizar cambios en el código de producción sin autorización previa y explícita del usuario**.
