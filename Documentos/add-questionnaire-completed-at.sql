-- Agrega la marca explicita de finalizacion del cuestionario.
-- No hace backfill: los cuestionarios existentes quedan como "En progreso"
-- hasta que el cliente los envie con la nueva accion.

ALTER TABLE public.questionnaire_data
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
