# ARQUITECTURA SOBERANA: CORRECCIÓN DE INSTITUCIÓN (CLÍNICA SAN CLEMENTE)
**Mando Supremo:** Dr. José Castillo (`jclab59@gmail.com`)
**Sistema:** Archivo de Reportes (`C:\Users\HP\Desktop\repositorio\ARCHIVO DE REPORTES`)
**Objetivo:** Reemplazar 'UROSERV' por 'CLÍNICA SAN CLEMENTE' para todos los registros del Dr. Alejandro Escalante Álvaro o cualquier caso que tenga Uroserv como institución/clínica debajo del nombre.

## Especificaciones de Corrección:
1. **Base de Datos Principal (`pacientes_maestro_backup_soberano.json` y `real_supabase_backup.js`):**
   - Buscar todos los pacientes donde el médico solicitante sea 'DR. ALEJANDRO ESCALANTE ÁLVARO' (o contenga 'ESCALANTE') O donde la clínica/sede sea 'UROSERV'.
   - Actualizar los campos:
     - `clinica = "CLÍNICA SAN CLEMENTE"`
     - `sede = "CLÍNICA SAN CLEMENTE"`
   - Mantener intacto el nombre del médico y todos los demás campos diagnósticos.
2. **Visor de Impresión (`imprimir.html`):**
   - Agregar regla estricta de salvaguarda: si `medSolicitante` contiene 'escalante' o la clínica/sede contiene 'uroserv', forzar en caliente `patient.clinica = 'CLÍNICA SAN CLEMENTE'` y `patient.sede = 'CLÍNICA SAN CLEMENTE'`.
3. **Catálogo de Médicos (`catalogo_bayesiano_doctores_clinicas.json`):**
   - Asegurar que el Dr. Alejandro Escalante Álvaro esté asociado por defecto a 'CLÍNICA SAN CLEMENTE'.
