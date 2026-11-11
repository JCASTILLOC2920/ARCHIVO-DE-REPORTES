# MÓDULO: VISOR QUIRÚRGICO DE PIEZA 3D Y MACROSCOPÍA 360
**Director General y Patólogo Principal:** Dr. José Castillo  
**Laboratorio:** JC PATH LAB — Anatomía Patológica  
**Módulo:** `PIEZA3D`  
**Entorno:** `C:\Users\HP\Desktop\repositorio\ARCHIVO DE REPORTES2\PIEZA3D\`  
**Estado:** Totalmente Autónomo e Independiente  
**Modo de Base de Datos:** 100% Offline • Desconectado de Docker n8n • Datos Simulados Deterministas  
**Fecha de Creación:** 09/11/2026  

---

## 1. DESCRIPCIÓN DEL MÓDULO
Renderizado volumétrico interactivo 3D de piezas quirúrgicas y visor rotacional 360 de especímenes en fresco.

---

## 2. ARCHIVOS QUE COMPONEN ESTE MÓDULO
- [`surgical_viewer_3d.js`](./surgical_viewer_3d.js)
- [`surgical_viewer_3d.css`](./surgical_viewer_3d.css)
- [`macro_viewer_360.js`](./macro_viewer_360.js)

---

## 3. INDEPENDENCIA Y CONEXIONES CON EL SISTEMA
- **Desconexión Soberana de Red:** No realiza peticiones a Docker n8n ni a Supabase en la nube.
- **Banco de Datos Local:** Funciona con almacenamiento `localStorage` y banco sintético de pacientes en memoria.
- **Rutas Relativas:** Conectado a los estilos globales y utilitarios (`../style.css`, `../reportes.css`, `../utils.js`) ubicados en la raíz.

---

## 4. BITÁCORA HISTÓRICA DE ACTUALIZACIONES
- **09/11/2026:** Creación e independización del módulo en `ARCHIVO DE REPORTES2`. Purgado de archivos residuales (.bak).
