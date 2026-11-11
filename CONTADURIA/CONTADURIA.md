# MÓDULO: CONTADURÍA, BOLETAS Y LIQUIDACIONES
**Director General y Patólogo Principal:** Dr. José Castillo  
**Laboratorio:** JC PATH LAB — Anatomía Patológica  
**Módulo:** `CONTADURIA`  
**Entorno:** `C:\Users\HP\Desktop\repositorio\ARCHIVO DE REPORTES2\CONTADURIA\`  
**Estado:** Totalmente Autónomo e Independiente  
**Modo de Base de Datos:** 100% Offline • Local-First • Sincronización Atómica a Docker n8n Local  
**Fecha de Creación:** 09/11/2026  
**Última Actualización:** 09/11/2026  

---

## 1. DESCRIPCIÓN DEL MÓDULO
Control financiero soberano del laboratorio: gestión de costos de muestra, transporte, adelantos, saldos por cobrar, registro de empresas solicitantes y generación de boletas. Opera bajo la política de **Local-First**, garantizando la disponibilidad inmediata de datos en `localStorage` y el despacho atómico de transacciones al orquestador local.

---

## 2. ARCHIVOS QUE COMPONEN ESTE MÓDULO
- [`boletas_manager.js`](./boletas_manager.js): Motor de gestión de boletas, cálculo de saldos y orquestación de persistencia.

---

## 3. INDEPENDENCIA Y CONEXIONES CON EL SISTEMA
- **Desconexión Soberana de Red:** No realiza peticiones a servidores en la nube pública. **Supabase está terminantemente vetado.**
- **Persistencia Local-First:** Los datos se almacenan primariamente en `localStorage` para garantizar cero latencia en la interfaz de usuario.
- **Despacho Atómico a Docker n8n:** Las transacciones financieras se sincronizan exclusivamente con el nodo local de n8n mediante el webhook `http://127.0.0.1:5678/webhook/guardar-boleta`.
- **Rutas Relativas:** Conectado a los estilos globales y utilitarios (`../style.css`, `../reportes.css`, `../utils.js`) ubicados en la raíz del núcleo.

---

## 4. BITÁCORA HISTÓRICA DE ACTUALIZACIONES
- **09/11/2026:** Creación e independización del módulo en `ARCHIVO DE REPORTES2`. Purgado de archivos residuales (.bak).
- **09/11/2026:** Actualización de arquitectura: Implementación de despacho exclusivo a Docker n8n local (`127.0.0.1:5678/webhook/guardar-boleta`), adopción de política Local-First y erradicación total de dependencias con Supabase.
