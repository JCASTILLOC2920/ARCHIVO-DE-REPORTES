-- ==============================================================================
-- SCRIPT SQL: ACTIVACIÓN SEGURA DE SUPABASE REALTIME PARA LA TABLA PACIENTES
-- Protocolo Actor-Crítico / Colmena
-- ==============================================================================

-- 1. Habilitar la réplica completa (Replica Identity Full) para asegurar que 
-- los eventos UPDATE / DELETE contengan tanto los valores nuevos (new) como antiguos (old).
ALTER TABLE pacientes REPLICA IDENTITY FULL;

-- 2. Asegurar que la tabla 'pacientes' esté incluida en la publicación de Realtime.
-- (Si la publicación por defecto 'supabase_realtime' ya existe).
ALTER PUBLICATION supabase_realtime ADD TABLE pacientes;

-- ==============================================================================
-- Instrucciones de aplicación:
-- 1. Abra el panel de Supabase de su proyecto.
-- 2. Diríjase a la sección 'SQL Editor'.
-- 3. Pegue este script y ejecútelo ('Run').
-- ==============================================================================
