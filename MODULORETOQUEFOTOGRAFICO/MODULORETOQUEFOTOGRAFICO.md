# MÓDULO: RETOQUE FOTOGRÁFICO Y CALIBRACIÓN MICRO/MACRO
**Director General y Patólogo Principal:** Dr. José Castillo  
**Laboratorio:** JC PATH LAB — Anatomía Patológica  
**Módulo:** `MODULORETOQUEFOTOGRAFICO`  
**Entorno:** `C:\Users\HP\Desktop\repositorio\ARCHIVO DE REPORTES2\MODULORETOQUEFOTOGRAFICO\`  
**Estado:** Totalmente Autónomo e Independiente  
**Modo de Base de Datos:** 100% Offline • Desconectado de Docker n8n • Datos Simulados Deterministas  
**Fecha de Creación:** 09/11/2026  

---

## 1. DESCRIPCIÓN DEL MÓDULO
Ajuste de contraste, balance de blancos, recorte y calibración con regla milimétrica para fotomicrografías.

---

## 2. ARCHIVOS QUE COMPONEN ESTE MÓDULO
- [`photo_editor.js`](./photo_editor.js)
- [`photo_editor.css`](./photo_editor.css)
- [`cropper.min.js`](./cropper.min.js)
- [`cropper.min.css`](./cropper.min.css)
- [`regla_artesco_oficial.png`](./regla_artesco_oficial.png)

---

## 3. INDEPENDENCIA Y CONEXIONES CON EL SISTEMA
- **Desconexión Soberana de Red:** No realiza peticiones a Docker n8n ni a Supabase en la nube.
- **Banco de Datos Local:** Funciona con almacenamiento `localStorage` y banco sintético de pacientes en memoria.
- **Rutas Relativas:** Conectado a los estilos globales y utilitarios (`../style.css`, `../reportes.css`, `../utils.js`) ubicados en la raíz.

---

## 4. BITÁCORA HISTÓRICA DE ACTUALIZACIONES
- **09/11/2026:** Creación e independización del módulo en `ARCHIVO DE REPORTES2`. Purgado de archivos residuales (.bak).
