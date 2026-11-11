# MÓDULO: LISTA DE USUARIOS Y CONTROL DE ACCESO (RBAC)
**Director General y Patólogo Principal:** Dr. José Castillo  
**Laboratorio:** JC PATH LAB — Anatomía Patológica  
**Módulo:** `LISTADEUSUARIOS`  
**Entorno:** `C:\Users\HP\Desktop\repositorio\ARCHIVO DE REPORTES2\LISTADEUSUARIOS\`  
**Estado:** Totalmente Autónomo e Independiente  
**Modo de Base de Datos:** 100% Offline • Desconectado de Docker n8n • Datos Simulados Deterministas  
**Fecha de Creación:** 09/11/2026  

---

## 1. DESCRIPCIÓN DEL MÓDULO
Autenticación criptográfica local-first, perfiles de usuario (Patólogo Principal, Médico Urología, Clínica, Asistente) y login de laboratorio. Implementa hashing SHA-256 para la verificación de credenciales sin dependencia de servicios externos.

---

## 2. ARCHIVOS QUE COMPONEN ESTE MÓDULO
- [`users_db.js`](./users_db.js): Base de datos local de usuarios con hashes SHA-256 y roles RBAC.
- [`login.html`](./login.html): Interfaz de autenticación y redirección modularizada.

---

## 3. INDEPENDENCIA Y CONEXIONES CON EL SISTEMA
- **Desconexión Soberana de Red:** No realiza peticiones a Docker n8n ni a Supabase en la nube.
- **Banco de Datos Local:** Funciona con almacenamiento `localStorage` y banco sintético de usuarios en memoria.
- **Autenticación Criptográfica:** Verificación de contraseñas mediante algoritmo SHA-256 local-first.
- **Redirección Modularizada:** 
  - Acceso principal: `../reportes.html`
  - Módulo de registro: `../REGISTRODEPACIENTES/index.html`
- **Rutas Relativas:** Conectado a los estilos globales y utilitarios (`../style.css`, `../reportes.css`, `../utils.js`) ubicados en la raíz.

---

## 4. BITÁCORA HISTÓRICA DE ACTUALIZACIONES
- **09/11/2026:** Creación e independización del módulo en `ARCHIVO DE REPORTES2`. Purgado de archivos residuales (.bak).
- **09/11/2026:** Implementación de autenticación criptográfica SHA-256 local-first.
- **09/11/2026:** Actualización de base de datos de usuarios en `users_db.js` con hashes criptográficos.
- **09/11/2026:** Configuración de redirección modularizada hacia `../REGISTRODEPACIENTES/index.html` y `../reportes.html`.
- **09/11/2026:** Verificación de cero dependencias de Supabase.
