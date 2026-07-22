# Memoria del Proyecto: Lecciones Aprendidas (Protocolo Elena)

Este archivo sirve como base de conocimientos y registro de errores históricos para evitar reintroducir fallos o desconfiguraciones en la aplicación del Laboratorio. Se lee al inicio de cada sesión de trabajo.

---

## 🛠️ Reglas Generales de Desarrollo

1. **Protección de la Interfaz Visual (UI)**:
   - Respetar siempre las clases CSS y el diseño responsivo al modificar los elementos.
   - Antes de alterar un estilo en `style.css` o `reportes.css`, verificar que no afecte a las otras pantallas (login, registro de pacientes, dashboard).

2. **Sincronización y Persistencia**:
   - Mantener siempre la compatibilidad entre `IndexedDB` y `Supabase`. Cualquier cambio en el esquema de base de datos local debe reflejarse en las llamadas de sincronización en `db_service.js`.

---

## 📝 Historial de Errores y Lecciones (Elena)

*Aquí se registrarán automáticamente los errores detectados y corregidos para evitar que se repitan.*

- **[2026-07-22] Inicialización del Protocolo Elena**:
  - Se crea esta libreta de memoria para registrar lecciones aprendidas y reglas de diseño.
- **[2026-07-22] Activación de La Colmena**:
  - Se definen e inicializan los subagentes independientes `colmena_programmer` (Programador) y `colmena_supervisor` (Supervisor/QA) para coordinar cambios en paralelo y evitar desconfiguraciones visuales en producción.
