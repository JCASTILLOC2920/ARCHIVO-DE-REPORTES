# MÓDULO: LISTADO DE PACIENTES (TABLAS Y FILTROS)
**Director General y Patólogo Principal:** Dr. José Castillo  
**Laboratorio:** JC PATH LAB — Anatomía Patológica  
**Módulo:** `LISTADODEPACIENTES`  
**Entorno:** `C:\Users\HP\Desktop\repositorio\ARCHIVO DE REPORTES2\LISTADODEPACIENTES\`  
**Estado:** Totalmente Autónomo e Independiente  
**Modo de Base de Datos:** 100% Offline • Conexión Exclusiva a Docker n8n Local • Datos Simulados Deterministas  
**Fecha de Creación:** 09/11/2026  

---

## 1. DESCRIPCIÓN DEL MÓDULO
Dashboard general con tablas interactivas, filtros por servicio (HE, Citología, Inmuno), paginación y ordenamiento.

---

## 2. ARCHIVOS QUE COMPONEN ESTE MÓDULO
- [`reportes.html`](./reportes.html)
- [`reportes.js`](./reportes.js)
- [`ui_tables.js`](./ui_tables.js)
- [`main.js`](./main.js)
- [`db_service.js`](./db_service.js)
- [`sovereign_integrity_guard.js`](./sovereign_integrity_guard.js)

---

## 3. INDEPENDENCIA Y CONEXIONES CON EL SISTEMA
- **Desconexión Soberana de Red:** No realiza peticiones a Docker n8n ni a Supabase en la nube.
- **Banco de Datos Local:** Funciona con almacenamiento `localStorage` y banco sintético de pacientes en memoria.
- **Rutas Relativas:** Conectado a los estilos globales y utilitarios (`../style.css`, `../reportes.css`, `../utils.js`) ubicados en la raíz.

---

## 4. BITÁCORA HISTÓRICA DE ACTUALIZACIONES
- **09/11/2026:** Creación e independización del módulo en `ARCHIVO DE REPORTES2`. Purgado de archivos residuales (.bak).
