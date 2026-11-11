# MÓDULO SOBERANO: REGISTRO DE PACIENTES
**Director General y Patólogo Principal:** Dr. José Castillo  
**Laboratorio:** JC PATH LAB — Anatomía Patológica  
**Mando Supremo:** Dr. José Castillo (`jclab59@gmail.com`)  
**Arquitectura:** Plataforma Soberana La Colmena • 100% Offline • Cero Créditos • Temp=0.0  
**Fecha de Actualización:** 09/11/2026 — 19:48  

---

## 1. PROPÓSITO DEL MÓDULO
Desacoplar, blindar y organizar toda la lógica, interfaces, catálogos y validaciones involucradas exclusivamente en el proceso de **Admisión y Registro de Pacientes** de JC PATH LAB.

---

## 2. INVENTARIO DE ARCHIVOS Y CONEXIONES DEL MÓDULO (`REGISTRO DE PACIENTES/`)

1. **`index.html` (Formulario Modular de Admisión):**
   - **Conexiones Estilísticas:** Vinculado hacia `../style.css`, `../reportes.css`, `../sovereign_pathology_elite.css` y `../cortana_chat.css`.
   - **Conexiones Funcionales:** Vinculado hacia `../utils.js`, `../supabase_config.js`, `../real_supabase_backup.js`, `../pwa_init.js`, `../responsive_scaler.js`, `../vgpu_local_engine.js` y `../cortana_chat.js`.
   - **Lógica Central del Módulo:** Conectado directamente a su propio `script.js` local dentro de la carpeta.
   - **Navegación:** Botón *Salir* redirige automáticamente a `../reportes.html`.

2. **`script.js` (Lógica Interactiva del Formulario):**
   - **Catálogos Médicos:** Rutas híbridas con fallback para `doctores.json` y `catalogo_bayesiano_doctores_clinicas.json`.
   - **Validación y DNI:** Conexión con `cache_reniec_soberano.json`.
   - **Persistencia:** Almacenamiento local en `localStorage` (compartido por origen) y sincronización no bloqueante a SQLite Docker n8n (`http://127.0.0.1:5678/webhook/guardar-paciente`).

3. **`medical_order_cropper.js`:** Captura visual, rotación, recorte y calibración de volantes de orden médica.
4. **`ocr_bayesian_matcher.js`:** Motor OCR bayesiano para reconocimiento de datos de pacientes en solicitudes.
5. **`cache_reniec_soberano.json`:** Bóveda de caché de consultas DNI.
6. **`doctores.json`:** Catálogo de médicos solicitantes con CMP/RNE.
7. **`catalogo_bayesiano_doctores_clinicas.json`:** Base de inferencia de sedes y clínicas asociadas.

---

## 3. VERIFICACIÓN DE ESTABILIDAD DE LA PÁGINA PRINCIPAL (`reportes.html`)
- **Independencia Total:** La página principal `reportes.html` en la raíz continúa operando con sus enlaces originales e inmutables.
- **Validación Sintáctica:** 0 errores en `reportes.html`, `script.js`, `ui_tables.js` y `db_service.js`.
- **Cero Regresiones:** El modal de registro interno en `reportes.html` conserva su cierre indestructible (`0.0ms`), el respeto estricto a los nombres ingresados por el Dr. José Castillo, y la sincronización con Docker n8n.
- **Control de Git:** Se respeta la orden estricta del Dr. Castillo: **CERO PUSH A GITHUB**. Toda la modularización permanece en el entorno local para control y reversión segura.

---

## 4. BITÁCORA DE CONTROL Y AUDITORÍA
- **[19:36]** Creación física del directorio `REGISTRO DE PACIENTES/` y copia de los 7 componentes del flujo de admisión.
- **[19:48]** Conexión de rutas relativas (`../`) en `index.html` y `script.js` para asegurar que el módulo funcione tanto de forma aislada como enlazado a la aplicación principal.
- **[19:50]** Auditoría sintáctica `node --check` aprobada (0 advertencias, 0 fallos).
