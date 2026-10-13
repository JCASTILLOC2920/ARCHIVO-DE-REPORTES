# 📋 Inventario y Auditoría de Activos Externos y Estrategia de Migración

Este documento detalla todos los archivos críticos, configuraciones, bases de datos SQLite y memorias del sistema almacenadas **fuera** de la carpeta del repositorio `ARCHIVO-DE-REPORTES`, junto con su categorización y los pasos exactos para una migración limpia a una nueva PC.

---

## 1. Inventario Categorizado

### a) Lo que SÍ se traslada automáticamente vía Git / OneDrive / Supabase Cloud
*   **Código fuente del proyecto (`ARCHIVO-DE-REPORTES`)**: Plantillas HTML, scripts de validación (`.agents/`), tests, base de datos DDL (`supabase_schema.sql`).
*   **Sincronización en la nube**: Todo lo respaldado en el repositorio remoto de GitHub y los buckets / tablas remotas de Supabase Cloud.
*   **Carpeta OneDrive local**: Los directorios de la ruta `C:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\` se sincronizan con la nube de OneDrive (incluyendo `ARCHIVO-DE-REPORTES`, `reportedeboletas`, `macrorecorder`, etc.).

### b) Lo que está FUERA de Git y se perdería si no se copia manualmente
1.  **Configuraciones y Memorias del Sistema Antigravity (`C:\Users\DELL\.gemini\antigravity`)**:
    *   `antigravity_state.pbtxt` y `user_settings.pb`: Preferencias de IDE y entorno.
    *   `mcp_config.json`: Conexiones a servidores MCP externos.
    *   `conversation_summaries.db` (y archivos `-shm`, `-wal`): Historial y resúmenes de conversaciones con el agente.
    *   `scratch/` y `brain/`: Memorias unificadas, registros de ejecución y estados previos de agentes (`unified_memory.json`).
    *   Skills personalizadas instaladas bajo `C:\Users\DELL\.gemini\antigravity\skills\` (ej. puentes de pathlab, validadores).
2.  **Otros Repositorios Locales en la misma ruta**:
    *   `macrorecorder`
    *   `reportedeboletas`
    *   `patologia especial clases practicas`
    *   `jcastilloc2920.github.io`
3.  **Entorno de Python / dependencias locales**:
    *   Paquetes instalados globalmente en el intérprete de Python (requieren `pip install -r requirements.txt` o similar en la nueva PC).

---

## 2. Pasos Exactos para una Migración Limpia y Sin Pérdida de Datos

### Paso 1: Respaldo de Activos Externos (`.gemini/antigravity`)
Comprimir o copiar la carpeta `C:\Users\DELL\.gemini\antigravity` a un disco externo o almacenamiento seguro. Los archivos más vitales a conservar son:
*   `mcp_config.json`
*   `antigravity_state.pbtxt`
*   La carpeta `scratch/` (que contiene `unified_memory.json`)

### Paso 2: Clonación y Sincronización de Repositorios
1. Asegurarse de que todos los cambios en `ARCHIVO-DE-REPORTES` y demás repositorios estén confirmados y subidos a GitHub o sincronizados vía OneDrive.
2. En la nueva PC, clonar los repositorios correspondientes en la ruta de trabajo estándar.

### Paso 3: Restauración del Entorno Antigravity en la Nueva PC
1. Instalar el entorno Antigravity / IDE correspondiente.
2. Copiar la carpeta respaldada `antigravity` en `C:\Users\DELL\.gemini\antigravity` (o el equivalente en el nuevo perfil de usuario).
3. Verificar que `mcp_config.json` y las memorias unificadas queden en su sitio exacto para mantener la continuidad contextual de los agentes.

### Paso 4: Reconfiguración del Entorno Python
1. Instalar Python (versión compatible con el entorno actual, ej. Python 3.13).
2. Reinstalar las dependencias de los proyectos ejecutando los requerimientos de cada repositorio.
