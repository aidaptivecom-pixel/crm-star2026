-- Agregar columnas para sistema de borradores
-- Ejecutar en Supabase Dashboard > SQL Editor

ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS draft_response TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS draft_created_at TIMESTAMPTZ DEFAULT NULL;

-- Índice para buscar conversaciones con borradores pendientes
CREATE INDEX IF NOT EXISTS idx_conversations_draft 
ON conversations (draft_response) 
WHERE draft_response IS NOT NULL;

-- Comentarios
COMMENT ON COLUMN conversations.draft_response IS 'Borrador de respuesta generado por IA pendiente de aprobación';
COMMENT ON COLUMN conversations.draft_created_at IS 'Timestamp de cuando se generó el borrador';
