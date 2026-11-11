# MÓDULO: PROTOCOLOS SINÓPTICOS CAP / OMS
**Director General y Patólogo Principal:** Dr. José Castillo  
**Laboratorio:** JC PATH LAB — Anatomía Patológica  
**Módulo:** `PROTOCOLOSCAP`  
**Entorno:** `C:\Users\HP\Desktop\repositorio\ARCHIVO DE REPORTES2\PROTOCOLOSCAP\`  
**Estado:** Totalmente Autónomo e Independiente  
**Modo de Base de Datos:** 100% Offline • Desconectado de Docker n8n • Datos Simulados Deterministas  
**Fecha de Creación:** 09/11/2026  

---

## 1. DESCRIPCIÓN DEL MÓDULO
Formularios estructurados según los protocolos del College of American Pathologists (CAP) y clasificación WHO 5ta Edición.

---

## 2. ARCHIVOS QUE COMPONEN ESTE MÓDULO
- [`synoptic_schemas.js`](./synoptic_schemas.js)
- [`cap_schemas_digestivo.js`](./cap_schemas_digestivo.js)
- [`cap_schemas_gyn_endocrine.js`](./cap_schemas_gyn_endocrine.js)
- [`cap_schemas_liver.js`](./cap_schemas_liver.js)
- [`cap_schemas_urology.js`](./cap_schemas_urology.js)
- [`neoplasias_icdo3_who5_catalogo.json`](./neoplasias_icdo3_who5_catalogo.json)

---

## 3. INDEPENDENCIA Y CONEXIONES CON EL SISTEMA
- **Desconexión Soberana de Red:** No realiza peticiones a Docker n8n ni a Supabase en la nube.
- **Banco de Datos Local:** Funciona con almacenamiento `localStorage` y banco sintético de pacientes en memoria.
- **Rutas Relativas:** Conectado a los estilos globales y utilitarios (`../style.css`, `../reportes.css`, `../utils.js`) ubicados en la raíz.

---

## 4. BITÁCORA HISTÓRICA DE ACTUALIZACIONES
- **09/11/2026:** Creación e independización del módulo en `ARCHIVO DE REPORTES2`. Purgado de archivos residuales (.bak).
