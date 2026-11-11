### 16. ARCHIVODEINFORMESANATOMOPATOLOGICOS/

**Propósito:**
Este módulo actúa como la bóveda soberana de respaldo persistente para todos los informes anatomopatológicos oficiales. Su función principal es garantizar la inmutabilidad y la integridad de los documentos una vez que han sido finalizados y validados.

**Regla de Respaldo Inmutable (Condición Estricta):**
El respaldo de un informe anatomopatológico en esta bóveda se activa y procede **EXCLUSIVAMENTE** bajo la condición de que el informe haya sido **FIRMADOS por el Dr. José Castillo**. Esta condición se verifica mediante el atributo `firmado === true` asociado al informe. Cualquier intento de respaldo de un informe no firmado será rechazado.

**Estándar de Nomenclatura Soberana:**
Cada informe respaldado se identificará y almacenará utilizando la nomenclatura unificada soberana:
`[CODIGO] [APELLIDOS] [NOMBRES]`
Ejemplo: `26Q-373 BENITEZ MANTILLA JOSE JUSTO`

**Empaquetamiento Criptográfico Zero-Trust:**
Para asegurar la integridad y autenticidad de los informes, se aplicará un empaquetamiento criptográfico Zero-Trust. Esto incluye la generación y adjunción de metadatos mediante un Hash-based Message Authentication Code (HMAC-SHA256) para cada informe. Este mecanismo garantiza que cualquier alteración posterior al respaldo sea detectable y que la fuente del informe sea verificable.

**Endpoint de Persistencia Soberana (Docker n8n):**
La persistencia de los informes firmados se realiza exclusivamente a través de un webhook local en el entorno Docker n8n.
- **Método:** POST
- **URL:** `http://127.0.0.1:5678/webhook/guardar-informe-firmado`
- **Payload:** Incluirá el contenido del informe (PDF o formato estructurado), el nombre de archivo estandarizado y los metadatos HMAC-SHA256.

**Flujo Operativo:**
1.  Un informe es marcado como `firmado === true` por el Dr. José Castillo.
2.  El módulo `ARCHIVODEINFORMESANATOMOPATOLOGICOS` intercepta esta acción.
3.  Se genera el nombre de archivo estandarizado `[CODIGO] [APELLIDOS] [NOMBRES]`.
4.  Se calcula el HMAC-SHA256 del contenido del informe.
5.  Se envía una solicitud POST al endpoint `/webhook/guardar-informe-firmado` con el informe y sus metadatos criptográficos.
6.  Docker n8n procesa la solicitud y almacena el informe en el almacenamiento soberano configurado.
