# MÓDULO: CORTANA (DICTÁFONO WHISPER Y ASISTENTE IA)
**Director General y Patólogo Principal:** Dr. José Castillo  
**Laboratorio:** JC PATH LAB — Anatomía Patológica  
**Módulo:** `MODULOCORTANA`  
**Entorno:** `C:\Users\HP\Desktop\repositorio\ARCHIVO DE REPORTES2\MODULOCORTANA\`  
**Estado:** Totalmente Autónomo e Independiente  
**Modo de Base de Datos:** 100% Offline • Conexión Exclusiva Docker n8n (Puerto 5678) • Sin Supabase  
**Fecha de Creación:** 09/11/2026  
**Última Actualización:** 09/11/2026  

---

## 1. DESCRIPCIÓN DEL MÓDULO
Dictado por voz ultra-rápido (<180ms) mediante Whisper Groq, asistencia patológica multimodal y consultas diagnósticas contextuales. Operación 100% soberana con persistencia local y orquestación local.

---

## 2. ARCHIVOS QUE COMPONEN ESTE MÓDULO
- [`dictaphone_core.js`](./dictaphone_core.js)
- [`cortana_chat.js`](./cortana_chat.js)
- [`cortana_chat.css`](./cortana_chat.css)
- [`groq_copilot.js`](./groq_copilot.js)
- [`groq_copilot.css`](./groq_copilot.css)
- [`chat_ia_asistente.js`](./chat_ia_asistente.js)
- [`chat_realtime_engine.js`](./chat_realtime_engine.js)
- [`floating_chat_widget.js`](./floating_chat_widget.js)

---

## 3. INDEPENDENCIA Y CONEXIONES CON EL SISTEMA
- **Desconexión Soberana de Red:** No realiza peticiones a servidores en la nube pública. **Supabase Cloud está terminantemente vetado.**
- **Conexión Exclusiva Docker n8n:** Toda persistencia y orquestación de datos se realiza exclusivamente a través de Docker n8n local en `http://127.0.0.1:5678`.
- **Comunicación Bidireccional:** Sincronización en tiempo real mediante `BroadcastChannel` con el canal `jcpathlab_clinical_chat` para interoperabilidad entre módulos.
- **Banco de Datos Local:** Almacenamiento primario en `localStorage` y banco sintético de pacientes en memoria como caché de respaldo.
- **Rutas Relativas:** Conectado a los estilos globales y utilitarios (`../style.css`, `../reportes.css`, `../utils.js`) ubicados en la raíz.

---

## 4. BITÁCORA HISTÓRICA DE ACTUALIZACIONES
- **09/11/2026:** Creación e independización del módulo en `ARCHIVO DE REPORTES2`. Purgado de archivos residuales (.bak).
- **09/11/2026:** Actualización de arquitectura: Reflejo de conexión exclusiva a Docker n8n en puerto 5678. Implementación de comunicación bidireccional mediante `BroadcastChannel jcpathlab_clinical_chat`. Optimización de dictáfono Whisper Groq (<180ms). Erradicación total de dependencias de Supabase Cloud.
