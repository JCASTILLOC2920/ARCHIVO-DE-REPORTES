# MÓDULO: LISTA DE PLANTILLAS Y DICCIONARIOS
**Director General y Patólogo Principal:** Dr. José Castillo  
**Laboratorio:** JC PATH LAB — Anatomía Patológica  
**Módulo:** `LISTA DE PLANTILLAS`  
**Entorno:** `C:\Users\HP\Desktop\repositorio\ARCHIVO DE REPORTES2\LISTA DE PLANTILLAS\`  
**Estado:** Totalmente Autónomo e Independiente  
**Modo de Base de Datos:** 100% Offline • Integración Soberana Docker n8n • Bóveda Local Determinista  
**Fecha de Creación:** 09/11/2026  

---

## 1. DESCRIPCIÓN DEL MÓDULO
Biblioteca de plantillas diagnósticas preconfiguradas, autodiagnósticos frecuentes y diccionario histopatológico.

---

## 2. ARCHIVOS QUE COMPONEN ESTE MÓDULO
- [`plantillas_data.js`](./plantillas_data.js)
- [`autodiagnosticos.json`](./autodiagnosticos.json)
- [`diccionario.json`](./diccionario.json)

---

## 3. INDEPENDENCIA Y CONEXIONES CON EL SISTEMA
- **Desconexión Soberana de Red:** No realiza peticiones a Docker n8n ni a Supabase en la nube.
- **Banco de Datos Local:** Funciona con almacenamiento `localStorage` y banco sintético de pacientes en memoria.
- **Rutas Relativas:** Conectado a los estilos globales y utilitarios (`../style.css`, `../reportes.css`, `../utils.js`) ubicados en la raíz.

---

## 4. BITÁCORA HISTÓRICA DE ACTUALIZACIONES
- **09/11/2026:** Creación e independización del módulo en `ARCHIVO DE REPORTES2`. Purgado de archivos residuales (.bak).
- **10/11/2026:** Purga de Supabase, integración de conector Docker n8n y soporte universal de plantillas.
