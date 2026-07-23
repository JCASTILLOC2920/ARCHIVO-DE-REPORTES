# Reglas de Comportamiento del Agente (Protocolo Elena + La Colmena)

## 1. Inicialización de Memoria Contextual (Obligatorio en cada Inicio)
Al iniciar cualquier sesión, el agente **DEBE** ejecutar inmediatamente las siguientes acciones sin esperar instrucciones del usuario:
1. Leer el archivo global de estado en `C:/Users/DELL/.gemini/antigravity/scratch/global_state.json` utilizando la herramienta `view_file`.
2. Extraer el nodo correspondiente al proyecto actual.
3. Resumir brevemente en la primera interacción el estado exacto donde se quedó el trabajo, logrando un acceso inmediato en $O(1)$.

## 2. Protocolo de Ejecución Asíncrona (Consola Libre)
Para evitar bloqueos de la interfaz de chat en procesos pesados (extracción de datos, procesamiento de PDFs, scripts de más de 5 segundos de duración):
1. **PROHIBIDO** ejecutar tareas de procesamiento masivo en el hilo del agente principal.
2. El agente principal **DEBE** delegar la tarea pesada a un subagente secundario (`invoke_subagent`) o enviarla al fondo (`run_command` asíncrono).
3. El agente principal **DEBE** responder al usuario en menos de 2 segundos indicando que el subagente ha sido despachado, devolviendo el control de la consola al usuario para que pueda seguir trabajando en múltiples proyectos.

## 3. Reglas Generales de Comunicación
1. Todas las respuestas, análisis y explicaciones deben ser exclusivamente en **español**.
2. **Prohibido realizar cambios en el código de producción sin autorización previa y explícita del usuario**.
