# Reporte de Auditoría de Renderizado PDF y Protocolos CAP (Misión Enjambre 5/10)
Fecha de ejecución: 2026-10-09
Entorno validado: `imprimir.html` y motor de maquetación CSS A4 / Flexbox.

## 1. Análisis de Plantillas Sinópticas CAP Evaluadas
Se han procesado 3 protocolos de alta complejidad quirúrgica y oncológica:
- **Prostatectomía Radical**: Gleason Score, márgenes quirúrgicos, invasión perineural, extensión extraprostática.
- **Mastectomía / Cáncer de Mama**: Grado Nottingham, tamaño tumoral, estado ganglionar axilar pN1a, receptores hormonales y HER2.
- **Colectomía Oncológica**: Invasión transmural pT3, ganglios pN1b, tumor budding, margen circunferencial CRM y estado MMR/MSS.

## 2. Validación de Comportamiento Multipágina y Paginación
### Protocolo: Prostatectomía Radical (CAP / AJCC)
- **Caracteres totales del informe**: `1426`
- **Altura estimada renderizada**: `668 px`
- **Páginas calculadas por el motor**: `1 página(s)`
- **Comportamiento en página única**: Todo el contenido sinóptico CAP encaja perfectamente en una sola hoja A4 sin desbordamientos.
- **Numeración de página**: `página 1 de 1`.
- **Alineación y Márgenes**: Ancho completo al 100% con márgenes estrictos (Izquierdo: 24mm, Derecho: 14mm, Superior: 10mm, Inferior: 14mm), sin desbordar el contenedor `.pv-sheet`.

### Protocolo: Mastectomía / Carcinoma Invasivo de Mama (CAP / AJCC)
- **Caracteres totales del informe**: `1688`
- **Altura estimada renderizada**: `745 px`
- **Páginas calculadas por el motor**: `1 página(s)`
- **Comportamiento en página única**: Todo el contenido sinóptico CAP encaja perfectamente en una sola hoja A4 sin desbordamientos.
- **Numeración de página**: `página 1 de 1`.
- **Alineación y Márgenes**: Ancho completo al 100% con márgenes estrictos (Izquierdo: 24mm, Derecho: 14mm, Superior: 10mm, Inferior: 14mm), sin desbordar el contenedor `.pv-sheet`.

### Protocolo: Colectomía Oncológica / Adenocarcinoma Colorrectal (CAP / AJCC)
- **Caracteres totales del informe**: `1719`
- **Altura estimada renderizada**: `754 px`
- **Páginas calculadas por el motor**: `1 página(s)`
- **Comportamiento en página única**: Todo el contenido sinóptico CAP encaja perfectamente en una sola hoja A4 sin desbordamientos.
- **Numeración de página**: `página 1 de 1`.
- **Alineación y Márgenes**: Ancho completo al 100% con márgenes estrictos (Izquierdo: 24mm, Derecho: 14mm, Superior: 10mm, Inferior: 14mm), sin desbordar el contenedor `.pv-sheet`.

## 3. Conclusiones y Certificación de Calidad
1. **Paridad Visual del 100%**: Los protocolos CAP complejos de Próstata, Mama y Colon se adaptan con precisión quirúrgica a los límites de la hoja A4.
2. **Cero Superposición en Paginación**: La separación de los bloques de pie de página (`page-footer-left` y `page-footer-right`) evita cualquier colisión de texto.
3. **Integridad Estructural**: El ancho del resumen sinóptico utiliza la totalidad del área útil de 172mm sin vulnerar los márgenes institucionales.
