# ARQUITECTURA SOBERANA: AUTOCOMPLETADO Y COTEJO RENIEC EN VENTANA REGISTRO PACIENTES
**Director General:** Dr. José Castillo (`jclab59@gmail.com`)
**Ubicación:** `C:\Users\HP\Desktop\repositorio\ARCHIVO DE REPORTES\script.js` y `reportes.html`
**Servicio Backend:** Cortana Super-Cerebro Soberano en `http://127.0.0.1:8010/api/reniec/{dni}`
**Base de Datos Padrón:** `E:\COLMENA\jcpathlab_master_docker.db` (tabla `reniec_padron_cache`)

---

## 1. OBJETIVO TÉCNICO
Proporcionar acceso inmediato y transparente a RENIEC y al Padrón Soberano local en la ventana modal `Registro Paciente` (`reportes.html`):
1. **Detección Automática de 8 Dígitos:** En cuanto el usuario digite o pegue el 8vo dígito numérico en el campo `m_dni`, se dispara automáticamente la consulta a RENIEC y caché Docker n8n sin obligar a presionar "Buscar" ni "Enter".
2. **Botón Manual Activo:** Si el usuario presiona el botón `[Buscar]` o la tecla `[Enter]`, se ejecuta la misma consulta con indicador visual de carga (spinner).
3. **Poblado Atómico de Campos:**
   - `m_nombres`: Nombre(s) en mayúsculas.
   - `m_apellidos`: Apellido Paterno + Materno en mayúsculas.
   - `m_sexo`: MASCULINO / FEMENINO si el padrón lo contiene.
   - `m_edad`: Edad calculada o registrada si existe.
4. **Respuesta < 20ms:** Si el DNI ya fue consultado o está en el Padrón de Docker n8n, la respuesta es offline e instantánea (0ms - 20ms).
5. **Fallback Oficial en Vivo:** Si el DNI es nuevo, consulta a la API de RENIEC oficial, guarda el registro en la base de datos de Docker para siempre y llena el formulario.
