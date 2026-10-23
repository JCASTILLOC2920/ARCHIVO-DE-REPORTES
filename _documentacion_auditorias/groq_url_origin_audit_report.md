# Informe Tecnico Forense: Auditoria de Origen de URL y Sandbox

## 1. Analisis de Escenarios de Uso
- file:/// (Doble clic): Aislamiento local.
- localhost:8000: Servidor local.
- GitHub Pages: Servidor remoto estatico.

## 2. Same-Origin Policy
- El localStorage de file:/// esta 100% aislado de GitHub Pages.
- Hacer git push sube codigo, pero no los datos locales.

## 3. Sandbox de Seguridad del Navegador
- Los navegadores prohiben la modificacion silenciosa de archivos locales (real_supabase_backup.js).

## 4. Conclusiones y Recomendaciones
1. Usar servidor local (http://localhost:8000).
2. Exportar respaldos en JSON y actualizar real_supabase_backup.js antes de git push.
