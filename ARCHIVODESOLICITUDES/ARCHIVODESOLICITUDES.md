### ESPECIFICACIÓN TÉCNICA: MÓDULO ARCHIVODESOLICITUDES

**1. Propósito del Módulo:**
El módulo `ARCHIVODESOLICITUDES` tiene como objetivo principal la gestión, visualización y almacenamiento optimizado de órdenes y solicitudes médicas, ya sean escaneadas o fotografiadas. Su diseño se centra en garantizar la máxima nitidez óptica para el ojo humano, minimizando simultáneamente el peso en disco de los archivos, todo ello bajo un entorno operativo soberano y offline.

**2. Optimización y Compresión de Imagen:**
*   **Tecnología Base:** Se utilizará la API `Canvas` del navegador para el procesamiento y manipulación de las imágenes cargadas.
*   **Formato de Salida:** Todas las imágenes de solicitudes serán convertidas al formato `WebP`.
*   **Factor de Compresión:** Se aplicará un factor de compresión del `85% (0.85)` para lograr un equilibrio óptimo entre la calidad visual percibida (máxima nitidez óptica) y la reducción del tamaño del archivo en disco.
*   **Proceso:**
    1.  Carga de la imagen original (JPG, PNG, etc.).
    2.  Renderizado de la imagen en un elemento `Canvas`.
    3.  Exportación del contenido del `Canvas` a un `Blob` en formato `image/webp` con una calidad de `0.85`.

**3. Estándar de Nomenclatura de Archivos:**
*   **Formato:** Cada archivo de solicitud optimizado se nombrará siguiendo el estándar unificado soberano:
    `[CODIGO] [APELLIDOS] [NOMBRES].[ext]`
*   **Ejemplo:** `26Q-373 BENITEZ MANTILLA JOSE JUSTO.webp`
*   **Extensión:** La extensión del archivo será siempre `.webp` tras el proceso de optimización.

**4. Mecanismo de Almacenamiento Persistente:**
*   **Entorno:** Docker n8n local.
*   **Endpoint de Almacenamiento:** Las solicitudes optimizadas serán enviadas mediante un despacho atómico a la siguiente URL de webhook:
    `http://127.0.0.1:5678/webhook/guardar-solicitud`
*   **Datos Enviados:** El webhook recibirá el archivo `WebP` optimizado junto con los metadatos relevantes del paciente (Código, Apellidos, Nombres) para su correcta indexación y almacenamiento en el sistema de archivos de Docker n8n.

**5. Integración y Entorno Operativo:**
*   **Soberanía Offline:** El módulo operará de manera completamente offline, sin depender de ninguna conexión a servicios en la nube pública.
*   **Prohibición de Supabase:** Se reitera la prohibición estricta de cualquier uso o conexión con Supabase Cloud.
*   **Interacción con el Núcleo Raíz:**
    *   Se integrará con `main.js` para la orquestación de eventos y la gestión del ciclo de vida.
    *   Utilizará `db_service.js` para la persistencia de metadatos asociados a las solicitudes en SQLite local, si es necesario, antes o después del envío a n8n.
    *   El visor de solicitudes se integrará con la interfaz de usuario principal (`reportes.html`).
