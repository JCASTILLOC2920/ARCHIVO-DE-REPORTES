# MÓDULO: REGISTRO DE PACIENTES (ADMISIÓN SOBERANA)
**Director General y Patólogo Principal:** Dr. José Castillo  
**Laboratorio:** JC PATH LAB — Anatomía Patológica  
**Módulo:** `REGISTRODEPACIENTES`  
**Entorno:** `C:\Users\HP\Desktop\repositorio\ARCHIVO DE REPORTES2\REGISTRODEPACIENTES\`  
**Estado:** 100% Operativo y Modularizado con Arquitectura Soberana  
**Modo de Base de Datos:** Local-First Permanente • BroadcastChannel en Tiempo Real • Docker n8n (127.0.0.1:5678) • Cero Supabase Cloud  
**Fecha de Actualización:** 09/11/2026 (Fase Modular Registro)  

---

## 1. DESCRIPCIÓN DEL MÓDULO
Gestión integral de registro de pacientes, cálculo determinista de código de atención correlativo (`26Q-XXX`), validación flexible de DNI (RENIEC / Local O(1)), catálogo de médicos solicitantes y captura multimodal.

---

## 2. ARCHIVOS QUE COMPONEN ESTE MÓDULO
- [`index.html`](./index.html): Interfaz principal de registro, enlaces de navegación modularizados a la raíz (`../reportes.html`) y módulos vecinos (`../LISTADEUSUARIOS/login.html`), visor quirúrgico 3D enlazado a `../PIEZA3D/` y scripts ES6.
- [`script.js`](./script.js): Lógica de validación, auto-completado de médicos (`../LISTADEDOCTORES/doctores.json`), cálculo de correlativo secuencial y despacho de guardado.
- [`medical_order_cropper.js`](./medical_order_cropper.js): Motor de recorte y pre-procesamiento de órdenes médicas.
- [`ocr_bayesian_matcher.js`](./ocr_bayesian_matcher.js): Cotejo bayesiano de médicos y clínicas con catálogo local.
- [`cache_reniec_soberano.json`](./cache_reniec_soberano.json): Caché de identificación local ultra-rápida.
- [`REGISTRODEPACIENTES.md`](./REGISTRODEPACIENTES.md): Bitácora y especificación técnica del módulo.

---

## 3. INDEPENDENCIA Y CONEXIONES CON EL SISTEMA
- **Cero Supabase Cloud:** SDK de Supabase eliminado por completo; conexiones reorientadas a Docker n8n local (`http://127.0.0.1:5678/webhook/guardar-paciente`) y `BroadcastChannel('jcpathlab_realtime_reports')`.
- **Rutas Relativas Globales (`../`):**
  - Estilos: `../style.css`, `../reportes.css`, `../sovereign_pathology_elite.css`, `../cortana_chat.css`
  - Utilitarios y Datos: `../utils.js`, `../real_supabase_backup.js`, `../vgpu_local_engine.js`
  - Módulos Vecinos: `../LISTADEUSUARIOS/login.html`, `../LISTADEDOCTORES/doctores.json`, `../PIEZA3D/surgical_viewer_3d.js`, `../CAMARACELULAR/mobile_camera_drop.html`
- **Persistencia Local Blindada:** Guardado y sincronización reactiva en `localStorage.patientDatabaseLocal` con control de cuota.

---

## 4. BITÁCORA HISTÓRICA DE ACTUALIZACIONES
- **09/11/2026 (Fase 0):** Creación e independización inicial en `ARCHIVO DE REPORTES2`.
- **09/11/2026 (Fase Modular):**
  1. Purga total del SDK de Supabase en `index.html` y reorientación de endpoints a Docker n8n y BroadcastChannel.
  2. Corrección exhaustiva de rutas relativas globales (`../`) para hojas de estilo, favicons, logos y preloads.
  3. Reorientación de módulos adyacentes (`LISTADEUSUARIOS`, `LISTADEDOCTORES`, `CAMARACELULAR`, `PIEZA3D`).
  4. Activación de módulos ES6 (`type="module"`) para scripts de chat, eliminando errores de sintaxis en el navegador.
  5. Verificación empírica completa con Playwright: cálculo determinista de código `26Q-396` y guardado exitoso verificado en almacenamiento local.
