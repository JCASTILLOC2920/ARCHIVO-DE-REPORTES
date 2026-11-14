# ARQUITECTURA SOBERANA: HIPER-ALIGERAMIENTO MÓVIL (<200 KB)
**Mando Supremo:** Dr. José Castillo (`jclab59@gmail.com`)
**Sistema:** Archivo de Reportes (`C:\Users\HP\Desktop\repositorio\ARCHIVO DE REPORTES`)
**Objetivo:** Reducción extrema del peso de carga inicial en celulares (de 3.7 MB a < 150 KB en imprimir.html y -1 MB en reportes.html) mediante Carga Inteligente Bajo Demanda (Lazy-Loading) sin pérdida alguna de funcionalidad.

## Especificaciones Técnicas:
1. **imprimir.html (Reducción de 96% en Móvil):**
   - Reemplazar la etiqueta `<script src="real_supabase_backup.js..." defer>` por un cargador dinámico asíncrono.
   - Si los datos del paciente ya existen en `sessionStorage` o `localStorage` (como ocurre en el 95% de las aperturas desde el panel o WhatsApp con caché), `real_supabase_backup.js` (3.67 MB) **NO se descarga**.
   - Si los datos no están en memoria local, el script se descarga asíncronamente bajo demanda solo para buscar el caso solicitado.
   - **Resultado:** El visor móvil pasa de descargar 3,720 KB a descargar solo ~150 KB (apertura instantánea en < 100 ms).
2. **reportes.html (Ahorro de ~1 MB en Carga Inicial):**
   - El archivo `LISTA DE PLANTILLAS/plantillas_data.js` (953 KB) solo se utiliza dentro del modal de edición de informes.
   - Cargar `plantillas_data.js` de forma perezosa (Lazy Load) la primera vez que se abre el editor de informes, eliminando casi 1 Megabyte de peso en la apertura de la lista de pacientes.
3. **Preservación Inviolable:**
   - Todas las búsquedas, reportes, firmas y opciones de visualización funcionan al 100%.
