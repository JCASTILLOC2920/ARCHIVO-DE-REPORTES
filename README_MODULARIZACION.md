# ARCHIVO DE REPORTES 2 — ARQUITECTURA MODULAR SOBERANA
**Director General y Patólogo Principal:** Dr. José Castillo  
**Diseño:** Trinidad Potenciada 5.0 (Gemini Planificador + Qwen Coder Ejecutor)  
**Total Archivos Útiles Clasificados:** 68  
**Archivos Residuales Depurados (.bak):** 100% Excluidos  
**Conexión Externa:** 100% Desconectado de Docker n8n y Supabase (Banco de Datos Local Offline)  

---

## ESTRUCTURA DE MÓDULOS

1. **[`01_REGISTRO_PACIENTES/`](./01_REGISTRO_PACIENTES/01_REGISTRO_PACIENTES.md):** Admisión, DNI, validación flexible de órdenes médicas.
2. **[`02_LISTADO_REPORTES/`](./02_LISTADO_REPORTES/02_LISTADO_REPORTES.md):** Tablas principales, filtros HE/Citología/Inmuno, paginación.
3. **[`03_EDITOR_INFORMES/`](./03_EDITOR_INFORMES/03_EDITOR_INFORMES.md):** Redacción macro/micro, plantillas CAP/WHO, visores 360/3D.
4. **[`04_IMPRESION_PDF/`](./04_IMPRESION_PDF/04_IMPRESION_PDF.md):** Motor de PDFs, QR, firmas digitales y membretes oficiales.
5. **[`05_FACTURACION_BOLETAS/`](./05_FACTURACION_BOLETAS/05_FACTURACION_BOLETAS.md):** Control de ingresos, deudas, cobros y comprobantes.
6. **[`06_INMUNOMASTER/`](./06_INMUNOMASTER/06_INMUNOMASTER.md):** Algoritmos y marcadores de Inmunohistoquímica (Dabbs/HPA).
7. **[`07_COPILOTO_DICTAFONO/`](./07_COPILOTO_DICTAFONO/07_COPILOTO_DICTAFONO.md):** Dictado Whisper (<180ms) y asistente clínico de patología.
8. **[`SHARED_ASSETS/`](./SHARED_ASSETS/SHARED_ASSETS.md):** CSS global, utilidades y branding unificado.

---
**Nota Soberana:** Esta carpeta no realiza git push a GitHub para mantener total capacidad de experimentación local.
