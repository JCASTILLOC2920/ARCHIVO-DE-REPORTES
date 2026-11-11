# MÓDULO: CÁMARA CELULAR Y RECEPTOR MÓVIL PWA
**Director General y Patólogo Principal:** Dr. José Castillo  
**Laboratorio:** JC PATH LAB — Anatomía Patológica  
**Módulo:** `CAMARACELULAR`  
**Entorno:** `C:\Users\HP\Desktop\repositorio\ARCHIVO DE REPORTES2\CAMARACELULAR\`  
**Estado:** Totalmente Autónomo e Independiente  
**Modo de Base de Datos:** 100% Offline • Persistencia Local • Sincronización Localhost  
**Fecha de Creación:** 09/11/2026  

---

## 1. DESCRIPCIÓN DEL MÓDULO
Sistema de captura y recepción de imágenes móviles mediante transmisión inalámbrica local. Permite la sincronización de órdenes médicas o imágenes macroscópicas al instante utilizando `BroadcastChannel` para la comunicación en tiempo real entre pestañas y dispositivos locales, y Docker n8n para la persistencia atómica.

---

## 2. ARCHIVOS QUE COMPONEN ESTE MÓDULO
- [`mobile_camera_drop.html`](./mobile_camera_drop.html)
- [`mobile_report_reader.js`](./mobile_report_reader.js)
- [`mobile_report_reader.css`](./mobile_report_reader.css)

---

## 3. INDEPENDENCIA Y CONEXIONES CON EL SISTEMA
- **Desconexión Soberana de Red:** No realiza peticiones a servidores en la nube pública.
- **Erradicación Total de Supabase:** Prohibido el uso de SDK, webhooks o sincronización con Supabase Cloud.
- **Transmisión Local:** Uso exclusivo de `BroadcastChannel` para el paso de datos entre el dispositivo móvil (PWA) y el escritorio (Núcleo Raíz).
- **Persistencia Atómica:** Despacho de capturas al webhook local de Docker n8n: `http://127.0.0.1:5678/webhook/captura-celular`.
- **Procesamiento de Imagen:** Implementación de homografía Canvas 2D local para la rectificación y normalización de imágenes capturadas antes de su almacenamiento.
- **Rutas Relativas:** Conectado a los estilos globales y utilitarios (`../style.css`, `../reportes.css`, `../utils.js`) ubicados en la raíz.

---

## 4. BITÁCORA HISTÓRICA DE ACTUALIZACIONES
- **09/11/2026:** Creación e independización del módulo en `ARCHIVO DE REPORTES2`. Purgado de archivos residuales (.bak).
- **09/11/2026:** Actualización técnica: Integración de `BroadcastChannel` para transmisión de fotos, conexión a Docker n8n (`127.0.0.1:5678/webhook/captura-celular`), implementación de homografía Canvas 2D local y erradicación total de dependencias de Supabase.
