## Why

Aunque las reglas del cuestionario ya contemplan que una pregunta pueda generar una o mas tareas, la administradora necesita una configuracion mas clara y confiable para esos casos reales donde una sola respuesta dispara varias actividades operativas. Este cambio busca que esa relacion multiple sea evidente, editable y verificable antes de guardar.

## What Changes

- Mejorar la configuracion de reglas para que una pregunta pueda asociarse explicitamente con varias tareas maestras en una misma regla.
- Permitir que cada tarea asociada conserve sus propios overrides de descripcion, hora, responsable, visibilidad y orden.
- Mostrar una vista previa donde se entienda que una respuesta generara varias tareas, no solo una.
- Validar que una regla tenga al menos una tarea y que no repita la misma tarea maestra dentro de la misma regla.
- Asegurar que el motor genere todas las tareas configuradas cuando la condicion de la pregunta aplique.
- Mantener compatibilidad con reglas existentes de una sola tarea.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `questionnaire-task-rules`: refuerza el comportamiento requerido para reglas que relacionan una pregunta con multiples tareas maestras, incluyendo configuracion, vista previa, validacion y generacion.

## Impact

- UI admin de reglas del cuestionario: `src/app/admin/questionnaire-rules/page.tsx`.
- APIs admin de reglas: `src/app/api/admin/questionnaire-rules/route.ts` y `src/app/api/admin/questionnaire-rules/[id]/route.ts`.
- Motor de reglas: `src/lib/rule-engine.ts`.
- Modelo existente: `questionnaire_task_rule_tasks` ya soporta multiples tareas por regla; el cambio debe revisar si requiere ajustes menores de orden o validacion.
- Documentacion y seed: actualizar ejemplos para incluir al menos una pregunta que genere mas de una tarea.
