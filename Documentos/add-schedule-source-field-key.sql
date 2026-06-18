-- Agrega fuente configurable de horario para tareas generadas por reglas.
-- Ejecutar antes de volver a guardar reglas que usen "Hora desde".

ALTER TABLE public.questionnaire_task_rule_tasks
  ADD COLUMN IF NOT EXISTS schedule_source_field_key TEXT;

UPDATE public.questionnaire_task_rules old_rule
SET
  field_key = 'otherActivityName',
  field_label = 'Otra actividad',
  updated_at = NOW()
WHERE old_rule.field_key = 'otherActivityTime'
  AND old_rule.section_id = 'program'
  AND NOT EXISTS (
    SELECT 1
    FROM public.questionnaire_task_rules existing_rule
    WHERE existing_rule.field_key = 'otherActivityName'
      AND existing_rule.operator = old_rule.operator
      AND COALESCE(existing_rule.expected_value::text, 'null') = COALESCE(old_rule.expected_value::text, 'null')
  );

UPDATE public.questionnaire_task_rules old_rule
SET
  is_active = FALSE,
  updated_at = NOW()
WHERE old_rule.field_key = 'otherActivityTime'
  AND old_rule.section_id = 'program';

WITH schedule_sources(rule_field_key, task_name, source_field_key) AS (
  VALUES
    ('presentation', 'Presentacion del festejado', 'presentationTime'),
    ('photoSession', 'Sesion de fotos', 'photoSessionTime'),
    ('externalDecoration', 'Recibir proveedor de decoracion', 'decoratorArrivalTime'),
    ('candyTable', 'Mesa de dulces', 'candyTableTime'),
    ('otherActivityName', 'Otra actividad programada', 'otherActivityTime')
)
UPDATE public.questionnaire_task_rule_tasks rule_task
SET schedule_source_field_key = schedule_sources.source_field_key
FROM schedule_sources
JOIN public.questionnaire_task_rules rule ON rule.field_key = schedule_sources.rule_field_key
JOIN public.master_tasks task ON task.name = schedule_sources.task_name
WHERE rule_task.rule_id = rule.id
  AND rule_task.master_task_id = task.id
  AND rule.field_key = schedule_sources.rule_field_key;
