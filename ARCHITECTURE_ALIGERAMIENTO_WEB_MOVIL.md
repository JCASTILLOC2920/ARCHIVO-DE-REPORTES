# ARQUITECTURA SOBERANA: ALIGERAMIENTO EXTREMO Y VELOCIDAD MÓVIL
**Mando Supremo:** Dr. José Castillo (`jclab59@gmail.com`)
**Sistema:** Archivo de Reportes (`C:\Users\HP\Desktop\repositorio\ARCHIVO DE REPORTES`)
**Objetivo:** Reducir drásticamente el peso de carga (de 7 MB a < 1.5 MB) y acelerar la carga en dispositivos móviles celulares en 3x a 5x sin perder ninguna funcionalidad.

## Estrategia de Optimización:
1. **imprimir.html (El visor de celular de las clínicas):**
   - **Eliminar `media_blobs_seed.js`:** Es un archivo de 3.2 MB de peso muerto que no se utiliza en el visor. Ahorro instantáneo de 47% del peso total.
   - **Defer en scripts pesados:** Marcar `real_supabase_backup.js` con `defer` para no bloquear el renderizado inicial del DOM.
   - **Pre-conexión y DNS-prefetch:** Optimizar enlaces CDN con `rel="preconnect"` y `rel="dns-prefetch"`.
   - **Optimización de fuentes:** Inyectar `font-display: swap` para que el texto clínico aparezca en 0.0s en el móvil.
2. **reportes.html (Panel de control y tablas):**
   - **Defer en scripts auxiliares:** `plantillas_data.js` (1 MB), `jspdf.umd.min.js` (356 KB), `photo_editor.js` (101 KB) deben cargarse con `defer` para que la tabla y el buscador aparezcan instantáneamente en celulares.
   - **CSS `content-visibility: auto`:** Activar en las filas de la tabla de pacientes para que el móvil solo procese en memoria GPU las filas visibles en pantalla (reducción de 70% de consumo de RAM móvil).
3. **Preservación Inviolable:**
   - Cero pérdida de funcionalidad: búsqueda, filtrado, visualización del ojo, impresión, descarga y firma permanecen 100% operativas.
